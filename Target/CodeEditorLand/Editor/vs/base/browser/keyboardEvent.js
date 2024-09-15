var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  EVENT_KEY_CODE_MAP,
  KeyCode,
  KeyCodeUtils,
  KeyMod
} from "../common/keyCodes.js";
import { KeyCodeChord } from "../common/keybindings.js";
import * as platform from "../common/platform.js";
import * as browser from "./browser.js";
function extractKeyCode(e) {
  if (e.charCode) {
    const char = String.fromCharCode(e.charCode).toUpperCase();
    return KeyCodeUtils.fromString(char);
  }
  const keyCode = e.keyCode;
  if (keyCode === 3) {
    return KeyCode.PauseBreak;
  } else if (browser.isFirefox) {
    switch (keyCode) {
      case 59:
        return KeyCode.Semicolon;
      case 60:
        if (platform.isLinux) {
          return KeyCode.IntlBackslash;
        }
        break;
      case 61:
        return KeyCode.Equal;
      // based on: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#numpad_keys
      case 107:
        return KeyCode.NumpadAdd;
      case 109:
        return KeyCode.NumpadSubtract;
      case 173:
        return KeyCode.Minus;
      case 224:
        if (platform.isMacintosh) {
          return KeyCode.Meta;
        }
        break;
    }
  } else if (browser.isWebKit) {
    if (platform.isMacintosh && keyCode === 93) {
      return KeyCode.Meta;
    } else if (!platform.isMacintosh && keyCode === 92) {
      return KeyCode.Meta;
    }
  }
  return EVENT_KEY_CODE_MAP[keyCode] || KeyCode.Unknown;
}
__name(extractKeyCode, "extractKeyCode");
const ctrlKeyMod = platform.isMacintosh ? KeyMod.WinCtrl : KeyMod.CtrlCmd;
const altKeyMod = KeyMod.Alt;
const shiftKeyMod = KeyMod.Shift;
const metaKeyMod = platform.isMacintosh ? KeyMod.CtrlCmd : KeyMod.WinCtrl;
function printKeyboardEvent(e) {
  const modifiers = [];
  if (e.ctrlKey) {
    modifiers.push(`ctrl`);
  }
  if (e.shiftKey) {
    modifiers.push(`shift`);
  }
  if (e.altKey) {
    modifiers.push(`alt`);
  }
  if (e.metaKey) {
    modifiers.push(`meta`);
  }
  return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
}
__name(printKeyboardEvent, "printKeyboardEvent");
function printStandardKeyboardEvent(e) {
  const modifiers = [];
  if (e.ctrlKey) {
    modifiers.push(`ctrl`);
  }
  if (e.shiftKey) {
    modifiers.push(`shift`);
  }
  if (e.altKey) {
    modifiers.push(`alt`);
  }
  if (e.metaKey) {
    modifiers.push(`meta`);
  }
  return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode} ('${KeyCodeUtils.toString(e.keyCode)}')`;
}
__name(printStandardKeyboardEvent, "printStandardKeyboardEvent");
class StandardKeyboardEvent {
  static {
    __name(this, "StandardKeyboardEvent");
  }
  _standardKeyboardEventBrand = true;
  browserEvent;
  target;
  ctrlKey;
  shiftKey;
  altKey;
  metaKey;
  altGraphKey;
  keyCode;
  code;
  _asKeybinding;
  _asKeyCodeChord;
  constructor(source) {
    const e = source;
    this.browserEvent = e;
    this.target = e.target;
    this.ctrlKey = e.ctrlKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.metaKey = e.metaKey;
    this.altGraphKey = e.getModifierState?.("AltGraph");
    this.keyCode = extractKeyCode(e);
    this.code = e.code;
    this.ctrlKey = this.ctrlKey || this.keyCode === KeyCode.Ctrl;
    this.altKey = this.altKey || this.keyCode === KeyCode.Alt;
    this.shiftKey = this.shiftKey || this.keyCode === KeyCode.Shift;
    this.metaKey = this.metaKey || this.keyCode === KeyCode.Meta;
    this._asKeybinding = this._computeKeybinding();
    this._asKeyCodeChord = this._computeKeyCodeChord();
  }
  preventDefault() {
    if (this.browserEvent && this.browserEvent.preventDefault) {
      this.browserEvent.preventDefault();
    }
  }
  stopPropagation() {
    if (this.browserEvent && this.browserEvent.stopPropagation) {
      this.browserEvent.stopPropagation();
    }
  }
  toKeyCodeChord() {
    return this._asKeyCodeChord;
  }
  equals(other) {
    return this._asKeybinding === other;
  }
  _computeKeybinding() {
    let key = KeyCode.Unknown;
    if (this.keyCode !== KeyCode.Ctrl && this.keyCode !== KeyCode.Shift && this.keyCode !== KeyCode.Alt && this.keyCode !== KeyCode.Meta) {
      key = this.keyCode;
    }
    let result = 0;
    if (this.ctrlKey) {
      result |= ctrlKeyMod;
    }
    if (this.altKey) {
      result |= altKeyMod;
    }
    if (this.shiftKey) {
      result |= shiftKeyMod;
    }
    if (this.metaKey) {
      result |= metaKeyMod;
    }
    result |= key;
    return result;
  }
  _computeKeyCodeChord() {
    let key = KeyCode.Unknown;
    if (this.keyCode !== KeyCode.Ctrl && this.keyCode !== KeyCode.Shift && this.keyCode !== KeyCode.Alt && this.keyCode !== KeyCode.Meta) {
      key = this.keyCode;
    }
    return new KeyCodeChord(
      this.ctrlKey,
      this.shiftKey,
      this.altKey,
      this.metaKey,
      key
    );
  }
}
export {
  StandardKeyboardEvent,
  printKeyboardEvent,
  printStandardKeyboardEvent
};
//# sourceMappingURL=keyboardEvent.js.map
