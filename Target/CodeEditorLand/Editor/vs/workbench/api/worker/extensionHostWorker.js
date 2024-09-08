import { VSBuffer } from "../../../base/common/buffer.js";
import { Emitter } from "../../../base/common/event.js";
import * as path from "../../../base/common/path.js";
import * as performance from "../../../base/common/performance.js";
import {
  createMessageOfType,
  isMessageOfType,
  MessageType
} from "../../services/extensions/common/extensionHostProtocol.js";
import { NestedWorker } from "../../services/extensions/worker/polyfillNestedWorker.js";
import { ExtensionHostMain } from "../common/extensionHostMain.js";
import "../common/extHost.common.services.js";
import "./extHost.worker.services.js";
import { FileAccess } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
const nativeClose = self.close.bind(self);
self.close = () => console.trace(`'close' has been blocked`);
const nativePostMessage = postMessage.bind(self);
self.postMessage = () => console.trace(`'postMessage' has been blocked`);
function shouldTransformUri(uri) {
  return /^(file|vscode-remote):/i.test(uri);
}
const nativeFetch = fetch.bind(self);
function patchFetching(asBrowserUri) {
  self.fetch = async (input, init) => {
    if (input instanceof Request) {
      return nativeFetch(input, init);
    }
    if (shouldTransformUri(String(input))) {
      input = (await asBrowserUri(URI.parse(String(input)))).toString(
        true
      );
    }
    return nativeFetch(input, init);
  };
  self.XMLHttpRequest = class extends XMLHttpRequest {
    open(method, url, async, username, password) {
      (async () => {
        if (shouldTransformUri(url.toString())) {
          url = (await asBrowserUri(URI.parse(url.toString()))).toString(true);
        }
        super.open(method, url, async ?? true, username, password);
      })();
    }
  };
}
self.importScripts = () => {
  throw new Error(`'importScripts' has been blocked`);
};
self.addEventListener = () => console.trace(`'addEventListener' has been blocked`);
self["AMDLoader"] = void 0;
self["NLSLoaderPlugin"] = void 0;
self["define"] = void 0;
self["require"] = void 0;
self["webkitRequestFileSystem"] = void 0;
self["webkitRequestFileSystemSync"] = void 0;
self["webkitResolveLocalFileSystemSyncURL"] = void 0;
self["webkitResolveLocalFileSystemURL"] = void 0;
if (self.Worker) {
  const _Worker = self.Worker;
  Worker = (stringUrl, options) => {
    if (/^file:/i.test(stringUrl.toString())) {
      stringUrl = FileAccess.uriToBrowserUri(
        URI.parse(stringUrl.toString())
      ).toString(true);
    } else if (/^vscode-remote:/i.test(stringUrl.toString())) {
      throw new Error(
        `Creating workers from remote extensions is currently not supported.`
      );
    }
    const bootstrapFnSource = function bootstrapFn(workerUrl) {
      function asWorkerBrowserUrl(url) {
        if (typeof url === "string" || url instanceof URL) {
          return String(url).replace(
            /^file:\/\//i,
            "vscode-file://vscode-app"
          );
        }
        return url;
      }
      const nativeFetch2 = fetch.bind(self);
      self.fetch = (input, init) => {
        if (input instanceof Request) {
          return nativeFetch2(input, init);
        }
        return nativeFetch2(asWorkerBrowserUrl(input), init);
      };
      self.XMLHttpRequest = class extends XMLHttpRequest {
        open(method, url, async, username, password) {
          return super.open(
            method,
            asWorkerBrowserUrl(url),
            async ?? true,
            username,
            password
          );
        }
      };
      const nativeImportScripts = importScripts.bind(self);
      self.importScripts = (...urls) => {
        nativeImportScripts(...urls.map(asWorkerBrowserUrl));
      };
      nativeImportScripts(workerUrl);
    }.toString();
    const js = `(${bootstrapFnSource}('${stringUrl}'))`;
    options = options || {};
    options.name = `${name} -> ${options.name || path.basename(stringUrl.toString())}`;
    const blob = new Blob([js], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    return new _Worker(blobUrl, options);
  };
} else {
  self.Worker = class extends NestedWorker {
    constructor(stringOrUrl, options) {
      super(nativePostMessage, stringOrUrl, {
        name: path.basename(stringOrUrl.toString()),
        ...options
      });
    }
  };
}
const hostUtil = new class {
  pid = void 0;
  exit(_code) {
    nativeClose();
  }
}();
class ExtensionWorker {
  // protocol
  protocol;
  constructor() {
    const channel = new MessageChannel();
    const emitter = new Emitter();
    let terminating = false;
    nativePostMessage(channel.port2, [channel.port2]);
    channel.port1.onmessage = (event) => {
      const { data } = event;
      if (!(data instanceof ArrayBuffer)) {
        console.warn("UNKNOWN data received", data);
        return;
      }
      const msg = VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength));
      if (isMessageOfType(msg, MessageType.Terminate)) {
        terminating = true;
        onTerminate("received terminate message from renderer");
        return;
      }
      emitter.fire(msg);
    };
    this.protocol = {
      onMessage: emitter.event,
      send: (vsbuf) => {
        if (!terminating) {
          const data = vsbuf.buffer.buffer.slice(
            vsbuf.buffer.byteOffset,
            vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength
          );
          channel.port1.postMessage(data, [data]);
        }
      }
    };
  }
}
function connectToRenderer(protocol) {
  return new Promise((resolve) => {
    const once = protocol.onMessage((raw) => {
      once.dispose();
      const initData = JSON.parse(raw.toString());
      protocol.send(createMessageOfType(MessageType.Initialized));
      resolve({ protocol, initData });
    });
    protocol.send(createMessageOfType(MessageType.Ready));
  });
}
let onTerminate = (reason) => nativeClose();
function isInitMessage(a) {
  return !!a && typeof a === "object" && a.type === "vscode.init" && a.data instanceof Map;
}
function create() {
  performance.mark(`code/extHost/willConnectToRenderer`);
  const res = new ExtensionWorker();
  return {
    onmessage(message) {
      if (!isInitMessage(message)) {
        return;
      }
      connectToRenderer(res.protocol).then((data) => {
        performance.mark(`code/extHost/didWaitForInitData`);
        const extHostMain = new ExtensionHostMain(
          data.protocol,
          data.initData,
          hostUtil,
          null,
          message.data
        );
        patchFetching((uri) => extHostMain.asBrowserUri(uri));
        onTerminate = (reason) => extHostMain.terminate(reason);
      });
    }
  };
}
export {
  create
};
