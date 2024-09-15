var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isWindows, isLinux } from "../../../../base/common/platform.js";
import { getKeyboardLayoutId, IKeyboardLayoutInfo } from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
function deserializeMapping(serializedMapping) {
  const mapping = serializedMapping;
  const ret = {};
  for (const key in mapping) {
    const result = mapping[key];
    if (result.length) {
      const value = result[0];
      const withShift = result[1];
      const withAltGr = result[2];
      const withShiftAltGr = result[3];
      const mask = Number(result[4]);
      const vkey = result.length === 6 ? result[5] : void 0;
      ret[key] = {
        "value": value,
        "vkey": vkey,
        "withShift": withShift,
        "withAltGr": withAltGr,
        "withShiftAltGr": withShiftAltGr,
        "valueIsDeadKey": (mask & 1) > 0,
        "withShiftIsDeadKey": (mask & 2) > 0,
        "withAltGrIsDeadKey": (mask & 4) > 0,
        "withShiftAltGrIsDeadKey": (mask & 8) > 0
      };
    } else {
      ret[key] = {
        "value": "",
        "valueIsDeadKey": false,
        "withShift": "",
        "withShiftIsDeadKey": false,
        "withAltGr": "",
        "withAltGrIsDeadKey": false,
        "withShiftAltGr": "",
        "withShiftAltGrIsDeadKey": false
      };
    }
  }
  return ret;
}
__name(deserializeMapping, "deserializeMapping");
class KeymapInfo {
  constructor(layout, secondaryLayouts, keyboardMapping, isUserKeyboardLayout) {
    this.layout = layout;
    this.secondaryLayouts = secondaryLayouts;
    this.mapping = deserializeMapping(keyboardMapping);
    this.isUserKeyboardLayout = !!isUserKeyboardLayout;
    this.layout.isUserKeyboardLayout = !!isUserKeyboardLayout;
  }
  static {
    __name(this, "KeymapInfo");
  }
  mapping;
  isUserKeyboardLayout;
  static createKeyboardLayoutFromDebugInfo(layout, value, isUserKeyboardLayout) {
    const keyboardLayoutInfo = new KeymapInfo(layout, [], {}, true);
    keyboardLayoutInfo.mapping = value;
    return keyboardLayoutInfo;
  }
  update(other) {
    this.layout = other.layout;
    this.secondaryLayouts = other.secondaryLayouts;
    this.mapping = other.mapping;
    this.isUserKeyboardLayout = other.isUserKeyboardLayout;
    this.layout.isUserKeyboardLayout = other.isUserKeyboardLayout;
  }
  getScore(other) {
    let score = 0;
    for (const key in other) {
      if (isWindows && (key === "Backslash" || key === "KeyQ")) {
        continue;
      }
      if (isLinux && (key === "Backspace" || key === "Escape")) {
        continue;
      }
      const currentMapping = this.mapping[key];
      if (currentMapping === void 0) {
        score -= 1;
      }
      const otherMapping = other[key];
      if (currentMapping && otherMapping && currentMapping.value !== otherMapping.value) {
        score -= 1;
      }
    }
    return score;
  }
  equal(other) {
    if (this.isUserKeyboardLayout !== other.isUserKeyboardLayout) {
      return false;
    }
    if (getKeyboardLayoutId(this.layout) !== getKeyboardLayoutId(other.layout)) {
      return false;
    }
    return this.fuzzyEqual(other.mapping);
  }
  fuzzyEqual(other) {
    for (const key in other) {
      if (isWindows && (key === "Backslash" || key === "KeyQ")) {
        continue;
      }
      if (this.mapping[key] === void 0) {
        return false;
      }
      const currentMapping = this.mapping[key];
      const otherMapping = other[key];
      if (currentMapping.value !== otherMapping.value) {
        return false;
      }
    }
    return true;
  }
}
export {
  KeymapInfo
};
//# sourceMappingURL=keymapInfo.js.map
