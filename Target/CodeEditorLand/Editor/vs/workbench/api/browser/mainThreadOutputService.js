var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Event } from "../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { isNumber } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import {
  Extensions,
  IOutputService,
  OUTPUT_VIEW_ID,
  OutputChannelUpdateMode
} from "../../services/output/common/output.js";
import { IViewsService } from "../../services/views/common/viewsService.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
let MainThreadOutputService = class extends Disposable {
  _proxy;
  _outputService;
  _viewsService;
  constructor(extHostContext, outputService, viewsService) {
    super();
    this._outputService = outputService;
    this._viewsService = viewsService;
    this._proxy = extHostContext.getProxy(
      ExtHostContext.ExtHostOutputService
    );
    const setVisibleChannel = /* @__PURE__ */ __name(() => {
      const visibleChannel = this._viewsService.isViewVisible(
        OUTPUT_VIEW_ID
      ) ? this._outputService.getActiveChannel() : void 0;
      this._proxy.$setVisibleChannel(
        visibleChannel ? visibleChannel.id : null
      );
    }, "setVisibleChannel");
    this._register(
      Event.any(
        this._outputService.onActiveOutputChannel,
        Event.filter(
          this._viewsService.onDidChangeViewVisibility,
          ({ id }) => id === OUTPUT_VIEW_ID
        )
      )(() => setVisibleChannel())
    );
    setVisibleChannel();
  }
  async $register(label, file, languageId, extensionId) {
    const idCounter = (MainThreadOutputService._extensionIdPool.get(extensionId) || 0) + 1;
    MainThreadOutputService._extensionIdPool.set(extensionId, idCounter);
    const id = `extension-output-${extensionId}-#${idCounter}-${label}`;
    const resource = URI.revive(file);
    Registry.as(
      Extensions.OutputChannels
    ).registerChannel({
      id,
      label,
      file: resource,
      log: false,
      languageId,
      extensionId
    });
    this._register(toDisposable(() => this.$dispose(id)));
    return id;
  }
  async $update(channelId, mode, till) {
    const channel = this._getChannel(channelId);
    if (channel) {
      if (mode === OutputChannelUpdateMode.Append) {
        channel.update(mode);
      } else if (isNumber(till)) {
        channel.update(mode, till);
      }
    }
  }
  async $reveal(channelId, preserveFocus) {
    const channel = this._getChannel(channelId);
    if (channel) {
      this._outputService.showChannel(channel.id, preserveFocus);
    }
  }
  async $close(channelId) {
    if (this._viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
      const activeChannel = this._outputService.getActiveChannel();
      if (activeChannel && channelId === activeChannel.id) {
        this._viewsService.closeView(OUTPUT_VIEW_ID);
      }
    }
  }
  async $dispose(channelId) {
    const channel = this._getChannel(channelId);
    channel?.dispose();
  }
  _getChannel(channelId) {
    return this._outputService.getChannel(channelId);
  }
};
__name(MainThreadOutputService, "MainThreadOutputService");
__publicField(MainThreadOutputService, "_extensionIdPool", /* @__PURE__ */ new Map());
MainThreadOutputService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadOutputService),
  __decorateParam(1, IOutputService),
  __decorateParam(2, IViewsService)
], MainThreadOutputService);
export {
  MainThreadOutputService
};
//# sourceMappingURL=mainThreadOutputService.js.map
