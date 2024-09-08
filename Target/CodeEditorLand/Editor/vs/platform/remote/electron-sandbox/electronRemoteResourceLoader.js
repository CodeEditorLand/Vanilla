var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { VSBuffer, encodeBase64 } from "../../../base/common/buffer.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { getMediaOrTextMime } from "../../../base/common/mime.js";
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import {
  FileOperationError,
  FileOperationResult,
  IFileService
} from "../../files/common/files.js";
import { IMainProcessService } from "../../ipc/common/mainProcessService.js";
import {
  NODE_REMOTE_RESOURCE_CHANNEL_NAME,
  NODE_REMOTE_RESOURCE_IPC_METHOD_NAME
} from "../common/electronRemoteResources.js";
let ElectronRemoteResourceLoader = class extends Disposable {
  constructor(windowId, mainProcessService, fileService) {
    super();
    this.windowId = windowId;
    this.fileService = fileService;
    const channel = {
      listen(_, event) {
        throw new Error(`Event not found: ${event}`);
      },
      call: (_, command, arg) => {
        switch (command) {
          case NODE_REMOTE_RESOURCE_IPC_METHOD_NAME:
            return this.doRequest(URI.revive(arg[0]));
        }
        throw new Error(`Call not found: ${command}`);
      }
    };
    mainProcessService.registerChannel(NODE_REMOTE_RESOURCE_CHANNEL_NAME, channel);
  }
  async doRequest(uri) {
    let content;
    try {
      const params = new URLSearchParams(uri.query);
      const actual = uri.with({
        scheme: params.get("scheme"),
        authority: params.get("authority"),
        query: ""
      });
      content = await this.fileService.readFile(actual);
    } catch (e) {
      const str = encodeBase64(VSBuffer.fromString(e.message));
      if (e instanceof FileOperationError && e.fileOperationResult === FileOperationResult.FILE_NOT_FOUND) {
        return { statusCode: 404, body: str };
      } else {
        return { statusCode: 500, body: str };
      }
    }
    const mimeType = uri.path && getMediaOrTextMime(uri.path);
    return { statusCode: 200, body: encodeBase64(content.value), mimeType };
  }
  getResourceUriProvider() {
    return (uri) => uri.with({
      scheme: Schemas.vscodeManagedRemoteResource,
      authority: `window:${this.windowId}`,
      query: new URLSearchParams({
        authority: uri.authority,
        scheme: uri.scheme
      }).toString()
    });
  }
};
ElectronRemoteResourceLoader = __decorateClass([
  __decorateParam(1, IMainProcessService),
  __decorateParam(2, IFileService)
], ElectronRemoteResourceLoader);
export {
  ElectronRemoteResourceLoader
};
