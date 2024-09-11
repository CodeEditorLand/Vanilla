var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
import { Dimension } from "../../../../base/browser/dom.js";
import { IMouseWheelEvent } from "../../../../base/browser/mouseEvent.js";
import { CodeWindow } from "../../../../base/browser/window.js";
import { equals } from "../../../../base/common/arrays.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IWebviewPortMapping } from "../../../../platform/webview/common/webviewPortMapping.js";
import { Memento, MementoObject } from "../../../common/memento.js";
const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = new RawContextKey("webviewFindWidgetVisible", false);
const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED = new RawContextKey("webviewFindWidgetFocused", false);
const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED = new RawContextKey("webviewFindWidgetEnabled", false);
const IWebviewService = createDecorator("webviewService");
var WebviewContentPurpose = /* @__PURE__ */ ((WebviewContentPurpose2) => {
  WebviewContentPurpose2["NotebookRenderer"] = "notebookRenderer";
  WebviewContentPurpose2["CustomEditor"] = "customEditor";
  WebviewContentPurpose2["WebviewView"] = "webviewView";
  return WebviewContentPurpose2;
})(WebviewContentPurpose || {});
function areWebviewContentOptionsEqual(a, b) {
  return a.allowMultipleAPIAcquire === b.allowMultipleAPIAcquire && a.allowScripts === b.allowScripts && a.allowForms === b.allowForms && equals(a.localResourceRoots, b.localResourceRoots, isEqual) && equals(a.portMapping, b.portMapping, (a2, b2) => a2.extensionHostPort === b2.extensionHostPort && a2.webviewPort === b2.webviewPort) && areEnableCommandUrisEqual(a, b);
}
__name(areWebviewContentOptionsEqual, "areWebviewContentOptionsEqual");
function areEnableCommandUrisEqual(a, b) {
  if (a.enableCommandUris === b.enableCommandUris) {
    return true;
  }
  if (Array.isArray(a.enableCommandUris) && Array.isArray(b.enableCommandUris)) {
    return equals(a.enableCommandUris, b.enableCommandUris);
  }
  return false;
}
__name(areEnableCommandUrisEqual, "areEnableCommandUrisEqual");
let WebviewOriginStore = class {
  static {
    __name(this, "WebviewOriginStore");
  }
  _memento;
  _state;
  constructor(rootStorageKey, storageService) {
    this._memento = new Memento(rootStorageKey, storageService);
    this._state = this._memento.getMemento(StorageScope.APPLICATION, StorageTarget.MACHINE);
  }
  getOrigin(viewType, additionalKey) {
    const key = this._getKey(viewType, additionalKey);
    const existing = this._state[key];
    if (existing && typeof existing === "string") {
      return existing;
    }
    const newOrigin = generateUuid();
    this._state[key] = newOrigin;
    this._memento.saveMemento();
    return newOrigin;
  }
  _getKey(viewType, additionalKey) {
    return JSON.stringify({ viewType, key: additionalKey });
  }
};
WebviewOriginStore = __decorateClass([
  __decorateParam(1, IStorageService)
], WebviewOriginStore);
let ExtensionKeyedWebviewOriginStore = class {
  static {
    __name(this, "ExtensionKeyedWebviewOriginStore");
  }
  _store;
  constructor(rootStorageKey, storageService) {
    this._store = new WebviewOriginStore(rootStorageKey, storageService);
  }
  getOrigin(viewType, extId) {
    return this._store.getOrigin(viewType, extId.value);
  }
};
ExtensionKeyedWebviewOriginStore = __decorateClass([
  __decorateParam(1, IStorageService)
], ExtensionKeyedWebviewOriginStore);
export {
  ExtensionKeyedWebviewOriginStore,
  IWebviewService,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE,
  WebviewContentPurpose,
  WebviewOriginStore,
  areWebviewContentOptionsEqual
};
//# sourceMappingURL=webview.js.map
