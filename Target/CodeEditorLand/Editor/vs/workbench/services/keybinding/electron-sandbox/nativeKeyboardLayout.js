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
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { OS, OperatingSystem } from "../../../../base/common/platform.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  DispatchConfig,
  readKeyboardConfig
} from "../../../../platform/keyboardLayout/common/keyboardConfig.js";
import {
  IKeyboardLayoutService
} from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
import {
  CachedKeyboardMapper
} from "../../../../platform/keyboardLayout/common/keyboardMapper.js";
import { FallbackKeyboardMapper } from "../common/fallbackKeyboardMapper.js";
import { MacLinuxKeyboardMapper } from "../common/macLinuxKeyboardMapper.js";
import { WindowsKeyboardMapper } from "../common/windowsKeyboardMapper.js";
import { INativeKeyboardLayoutService } from "./nativeKeyboardLayoutService.js";
let KeyboardLayoutService = class extends Disposable {
  constructor(_nativeKeyboardLayoutService, _configurationService) {
    super();
    this._nativeKeyboardLayoutService = _nativeKeyboardLayoutService;
    this._configurationService = _configurationService;
    this._keyboardMapper = null;
    this._register(this._nativeKeyboardLayoutService.onDidChangeKeyboardLayout(async () => {
      this._keyboardMapper = null;
      this._onDidChangeKeyboardLayout.fire();
    }));
    this._register(_configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("keyboard")) {
        this._keyboardMapper = null;
        this._onDidChangeKeyboardLayout.fire();
      }
    }));
  }
  static {
    __name(this, "KeyboardLayoutService");
  }
  _onDidChangeKeyboardLayout = this._register(
    new Emitter()
  );
  onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
  _keyboardMapper;
  getRawKeyboardMapping() {
    return this._nativeKeyboardLayoutService.getRawKeyboardMapping();
  }
  getCurrentKeyboardLayout() {
    return this._nativeKeyboardLayoutService.getCurrentKeyboardLayout();
  }
  getAllKeyboardLayouts() {
    return [];
  }
  getKeyboardMapper() {
    const config = readKeyboardConfig(this._configurationService);
    if (config.dispatch === DispatchConfig.KeyCode) {
      return new FallbackKeyboardMapper(config.mapAltGrToCtrlAlt, OS);
    }
    if (!this._keyboardMapper) {
      this._keyboardMapper = new CachedKeyboardMapper(
        createKeyboardMapper(
          this.getCurrentKeyboardLayout(),
          this.getRawKeyboardMapping(),
          config.mapAltGrToCtrlAlt
        )
      );
    }
    return this._keyboardMapper;
  }
  validateCurrentKeyboardMapping(keyboardEvent) {
    return;
  }
};
KeyboardLayoutService = __decorateClass([
  __decorateParam(0, INativeKeyboardLayoutService),
  __decorateParam(1, IConfigurationService)
], KeyboardLayoutService);
function createKeyboardMapper(layoutInfo, rawMapping, mapAltGrToCtrlAlt) {
  const _isUSStandard = isUSStandard(layoutInfo);
  if (OS === OperatingSystem.Windows) {
    return new WindowsKeyboardMapper(
      _isUSStandard,
      rawMapping,
      mapAltGrToCtrlAlt
    );
  }
  if (!rawMapping || Object.keys(rawMapping).length === 0) {
    return new FallbackKeyboardMapper(mapAltGrToCtrlAlt, OS);
  }
  if (OS === OperatingSystem.Macintosh) {
    const kbInfo = layoutInfo;
    if (kbInfo.id === "com.apple.keylayout.DVORAK-QWERTYCMD") {
      return new FallbackKeyboardMapper(mapAltGrToCtrlAlt, OS);
    }
  }
  return new MacLinuxKeyboardMapper(
    _isUSStandard,
    rawMapping,
    mapAltGrToCtrlAlt,
    OS
  );
}
__name(createKeyboardMapper, "createKeyboardMapper");
function isUSStandard(_kbInfo) {
  if (!_kbInfo) {
    return false;
  }
  if (OS === OperatingSystem.Linux) {
    const kbInfo = _kbInfo;
    const layouts = kbInfo.layout.split(/,/g);
    return layouts[kbInfo.group] === "us";
  }
  if (OS === OperatingSystem.Macintosh) {
    const kbInfo = _kbInfo;
    return kbInfo.id === "com.apple.keylayout.US";
  }
  if (OS === OperatingSystem.Windows) {
    const kbInfo = _kbInfo;
    return kbInfo.name === "00000409";
  }
  return false;
}
__name(isUSStandard, "isUSStandard");
registerSingleton(
  IKeyboardLayoutService,
  KeyboardLayoutService,
  InstantiationType.Delayed
);
export {
  KeyboardLayoutService
};
//# sourceMappingURL=nativeKeyboardLayout.js.map
