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
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import * as platform from "../../../base/common/platform.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import {
  ILifecycleMainService,
  LifecycleMainPhase
} from "../../lifecycle/electron-main/lifecycleMainService.js";
const IKeyboardLayoutMainService = createDecorator("keyboardLayoutMainService");
let KeyboardLayoutMainService = class extends Disposable {
  static {
    __name(this, "KeyboardLayoutMainService");
  }
  _onDidChangeKeyboardLayout = this._register(
    new Emitter()
  );
  onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
  _initPromise;
  _keyboardLayoutData;
  constructor(lifecycleMainService) {
    super();
    this._initPromise = null;
    this._keyboardLayoutData = null;
    lifecycleMainService.when(LifecycleMainPhase.AfterWindowOpen).then(() => this._initialize());
  }
  _initialize() {
    if (!this._initPromise) {
      this._initPromise = this._doInitialize();
    }
    return this._initPromise;
  }
  async _doInitialize() {
    const nativeKeymapMod = await import("native-keymap");
    this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
    if (!platform.isCI) {
      nativeKeymapMod.onDidChangeKeyboardLayout(() => {
        this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
        this._onDidChangeKeyboardLayout.fire(this._keyboardLayoutData);
      });
    }
  }
  async getKeyboardLayoutData() {
    await this._initialize();
    return this._keyboardLayoutData;
  }
};
KeyboardLayoutMainService = __decorateClass([
  __decorateParam(0, ILifecycleMainService)
], KeyboardLayoutMainService);
function readKeyboardLayoutData(nativeKeymapMod) {
  const keyboardMapping = nativeKeymapMod.getKeyMap();
  const keyboardLayoutInfo = nativeKeymapMod.getCurrentKeyboardLayout();
  return { keyboardMapping, keyboardLayoutInfo };
}
__name(readKeyboardLayoutData, "readKeyboardLayoutData");
export {
  IKeyboardLayoutMainService,
  KeyboardLayoutMainService
};
//# sourceMappingURL=keyboardLayoutMainService.js.map
