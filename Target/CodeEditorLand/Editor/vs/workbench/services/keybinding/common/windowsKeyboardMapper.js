var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../../../../base/common/charCode.js";
import { KeyCode, KeyCodeUtils, IMMUTABLE_CODE_TO_KEY_CODE, ScanCode, ScanCodeUtils, NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE } from "../../../../base/common/keyCodes.js";
import { ResolvedKeybinding, KeyCodeChord, SingleModifierChord, ScanCodeChord, Keybinding, Chord } from "../../../../base/common/keybindings.js";
import { UILabelProvider } from "../../../../base/common/keybindingLabels.js";
import { OperatingSystem } from "../../../../base/common/platform.js";
import { IKeyboardEvent } from "../../../../platform/keybinding/common/keybinding.js";
import { IKeyboardMapper } from "../../../../platform/keyboardLayout/common/keyboardMapper.js";
import { BaseResolvedKeybinding } from "../../../../platform/keybinding/common/baseResolvedKeybinding.js";
import { toEmptyArrayIfContainsNull } from "../../../../platform/keybinding/common/resolvedKeybindingItem.js";
import { IWindowsKeyboardMapping } from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
const LOG = false;
function log(str) {
  if (LOG) {
    console.info(str);
  }
}
__name(log, "log");
class WindowsNativeResolvedKeybinding extends BaseResolvedKeybinding {
  static {
    __name(this, "WindowsNativeResolvedKeybinding");
  }
  _mapper;
  constructor(mapper, chords) {
    super(OperatingSystem.Windows, chords);
    this._mapper = mapper;
  }
  _getLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return this._mapper.getUILabelForKeyCode(chord.keyCode);
  }
  _getUSLabelForKeybinding(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return KeyCodeUtils.toString(chord.keyCode);
  }
  getUSLabel() {
    return UILabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getUSLabelForKeybinding(keybinding));
  }
  _getAriaLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return this._mapper.getAriaLabelForKeyCode(chord.keyCode);
  }
  _getElectronAccelerator(chord) {
    return this._mapper.getElectronAcceleratorForKeyBinding(chord);
  }
  _getUserSettingsLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    const result = this._mapper.getUserSettingsLabelForKeyCode(chord.keyCode);
    return result ? result.toLowerCase() : result;
  }
  _isWYSIWYG(chord) {
    return this.__isWYSIWYG(chord.keyCode);
  }
  __isWYSIWYG(keyCode) {
    if (keyCode === KeyCode.LeftArrow || keyCode === KeyCode.UpArrow || keyCode === KeyCode.RightArrow || keyCode === KeyCode.DownArrow) {
      return true;
    }
    const ariaLabel = this._mapper.getAriaLabelForKeyCode(keyCode);
    const userSettingsLabel = this._mapper.getUserSettingsLabelForKeyCode(keyCode);
    return ariaLabel === userSettingsLabel;
  }
  _getChordDispatch(chord) {
    if (chord.isModifierKey()) {
      return null;
    }
    let result = "";
    if (chord.ctrlKey) {
      result += "ctrl+";
    }
    if (chord.shiftKey) {
      result += "shift+";
    }
    if (chord.altKey) {
      result += "alt+";
    }
    if (chord.metaKey) {
      result += "meta+";
    }
    result += KeyCodeUtils.toString(chord.keyCode);
    return result;
  }
  _getSingleModifierChordDispatch(chord) {
    if (chord.keyCode === KeyCode.Ctrl && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
      return "ctrl";
    }
    if (chord.keyCode === KeyCode.Shift && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
      return "shift";
    }
    if (chord.keyCode === KeyCode.Alt && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
      return "alt";
    }
    if (chord.keyCode === KeyCode.Meta && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
      return "meta";
    }
    return null;
  }
  static getProducedCharCode(chord, mapping) {
    if (!mapping) {
      return null;
    }
    if (chord.ctrlKey && chord.shiftKey && chord.altKey) {
      return mapping.withShiftAltGr;
    }
    if (chord.ctrlKey && chord.altKey) {
      return mapping.withAltGr;
    }
    if (chord.shiftKey) {
      return mapping.withShift;
    }
    return mapping.value;
  }
  static getProducedChar(chord, mapping) {
    const char = this.getProducedCharCode(chord, mapping);
    if (char === null || char.length === 0) {
      return " --- ";
    }
    return "  " + char + "  ";
  }
}
class WindowsKeyboardMapper {
  constructor(_isUSStandard, rawMappings, _mapAltGrToCtrlAlt) {
    this._isUSStandard = _isUSStandard;
    this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
    this._scanCodeToKeyCode = [];
    this._keyCodeToLabel = [];
    this._keyCodeExists = [];
    this._keyCodeToLabel[KeyCode.Unknown] = KeyCodeUtils.toString(KeyCode.Unknown);
    for (let scanCode = ScanCode.None; scanCode < ScanCode.MAX_VALUE; scanCode++) {
      const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
      if (immutableKeyCode !== KeyCode.DependsOnKbLayout) {
        this._scanCodeToKeyCode[scanCode] = immutableKeyCode;
        this._keyCodeToLabel[immutableKeyCode] = KeyCodeUtils.toString(immutableKeyCode);
        this._keyCodeExists[immutableKeyCode] = true;
      }
    }
    const producesLetter = [];
    let producesLetters = false;
    this._codeInfo = [];
    for (const strCode in rawMappings) {
      if (rawMappings.hasOwnProperty(strCode)) {
        const scanCode = ScanCodeUtils.toEnum(strCode);
        if (scanCode === ScanCode.None) {
          log(`Unknown scanCode ${strCode} in mapping.`);
          continue;
        }
        const rawMapping = rawMappings[strCode];
        const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
        if (immutableKeyCode !== KeyCode.DependsOnKbLayout) {
          const keyCode2 = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || KeyCode.Unknown;
          if (keyCode2 === KeyCode.Unknown || immutableKeyCode === keyCode2) {
            continue;
          }
          if (scanCode !== ScanCode.NumpadComma) {
            continue;
          }
        }
        const value = rawMapping.value;
        const withShift = rawMapping.withShift;
        const withAltGr = rawMapping.withAltGr;
        const withShiftAltGr = rawMapping.withShiftAltGr;
        const keyCode = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || KeyCode.Unknown;
        const mapping = {
          scanCode,
          keyCode,
          value,
          withShift,
          withAltGr,
          withShiftAltGr
        };
        this._codeInfo[scanCode] = mapping;
        this._scanCodeToKeyCode[scanCode] = keyCode;
        if (keyCode === KeyCode.Unknown) {
          continue;
        }
        this._keyCodeExists[keyCode] = true;
        if (value.length === 0) {
          this._keyCodeToLabel[keyCode] = null;
        } else if (value.length > 1) {
          this._keyCodeToLabel[keyCode] = value;
        } else {
          const charCode = value.charCodeAt(0);
          if (charCode >= CharCode.a && charCode <= CharCode.z) {
            const upperCaseValue = CharCode.A + (charCode - CharCode.a);
            producesLetter[upperCaseValue] = true;
            producesLetters = true;
            this._keyCodeToLabel[keyCode] = String.fromCharCode(CharCode.A + (charCode - CharCode.a));
          } else if (charCode >= CharCode.A && charCode <= CharCode.Z) {
            producesLetter[charCode] = true;
            producesLetters = true;
            this._keyCodeToLabel[keyCode] = value;
          } else {
            this._keyCodeToLabel[keyCode] = value;
          }
        }
      }
    }
    const _registerLetterIfMissing = /* @__PURE__ */ __name((charCode, keyCode) => {
      if (!producesLetter[charCode]) {
        this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
      }
    }, "_registerLetterIfMissing");
    _registerLetterIfMissing(CharCode.A, KeyCode.KeyA);
    _registerLetterIfMissing(CharCode.B, KeyCode.KeyB);
    _registerLetterIfMissing(CharCode.C, KeyCode.KeyC);
    _registerLetterIfMissing(CharCode.D, KeyCode.KeyD);
    _registerLetterIfMissing(CharCode.E, KeyCode.KeyE);
    _registerLetterIfMissing(CharCode.F, KeyCode.KeyF);
    _registerLetterIfMissing(CharCode.G, KeyCode.KeyG);
    _registerLetterIfMissing(CharCode.H, KeyCode.KeyH);
    _registerLetterIfMissing(CharCode.I, KeyCode.KeyI);
    _registerLetterIfMissing(CharCode.J, KeyCode.KeyJ);
    _registerLetterIfMissing(CharCode.K, KeyCode.KeyK);
    _registerLetterIfMissing(CharCode.L, KeyCode.KeyL);
    _registerLetterIfMissing(CharCode.M, KeyCode.KeyM);
    _registerLetterIfMissing(CharCode.N, KeyCode.KeyN);
    _registerLetterIfMissing(CharCode.O, KeyCode.KeyO);
    _registerLetterIfMissing(CharCode.P, KeyCode.KeyP);
    _registerLetterIfMissing(CharCode.Q, KeyCode.KeyQ);
    _registerLetterIfMissing(CharCode.R, KeyCode.KeyR);
    _registerLetterIfMissing(CharCode.S, KeyCode.KeyS);
    _registerLetterIfMissing(CharCode.T, KeyCode.KeyT);
    _registerLetterIfMissing(CharCode.U, KeyCode.KeyU);
    _registerLetterIfMissing(CharCode.V, KeyCode.KeyV);
    _registerLetterIfMissing(CharCode.W, KeyCode.KeyW);
    _registerLetterIfMissing(CharCode.X, KeyCode.KeyX);
    _registerLetterIfMissing(CharCode.Y, KeyCode.KeyY);
    _registerLetterIfMissing(CharCode.Z, KeyCode.KeyZ);
    if (!producesLetters) {
      const _registerLabel = /* @__PURE__ */ __name((keyCode, charCode) => {
        this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
      }, "_registerLabel");
      _registerLabel(KeyCode.Semicolon, CharCode.Semicolon);
      _registerLabel(KeyCode.Equal, CharCode.Equals);
      _registerLabel(KeyCode.Comma, CharCode.Comma);
      _registerLabel(KeyCode.Minus, CharCode.Dash);
      _registerLabel(KeyCode.Period, CharCode.Period);
      _registerLabel(KeyCode.Slash, CharCode.Slash);
      _registerLabel(KeyCode.Backquote, CharCode.BackTick);
      _registerLabel(KeyCode.BracketLeft, CharCode.OpenSquareBracket);
      _registerLabel(KeyCode.Backslash, CharCode.Backslash);
      _registerLabel(KeyCode.BracketRight, CharCode.CloseSquareBracket);
      _registerLabel(KeyCode.Quote, CharCode.SingleQuote);
    }
  }
  static {
    __name(this, "WindowsKeyboardMapper");
  }
  _codeInfo;
  _scanCodeToKeyCode;
  _keyCodeToLabel = [];
  _keyCodeExists;
  dumpDebugInfo() {
    const result = [];
    const immutableSamples = [
      ScanCode.ArrowUp,
      ScanCode.Numpad0
    ];
    let cnt = 0;
    result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
    for (let scanCode = ScanCode.None; scanCode < ScanCode.MAX_VALUE; scanCode++) {
      if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== KeyCode.DependsOnKbLayout) {
        if (immutableSamples.indexOf(scanCode) === -1) {
          continue;
        }
      }
      if (cnt % 6 === 0) {
        result.push(`|       HW Code combination      |  Key  |    KeyCode combination    |          UI label         |        User settings       | WYSIWYG |`);
        result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
      }
      cnt++;
      const mapping = this._codeInfo[scanCode];
      const strCode = ScanCodeUtils.toString(scanCode);
      const mods = [0, 2, 5, 7];
      for (const mod of mods) {
        const ctrlKey = mod & 1 ? true : false;
        const shiftKey = mod & 2 ? true : false;
        const altKey = mod & 4 ? true : false;
        const scanCodeChord = new ScanCodeChord(ctrlKey, shiftKey, altKey, false, scanCode);
        const keyCodeChord = this._resolveChord(scanCodeChord);
        const strKeyCode = keyCodeChord ? KeyCodeUtils.toString(keyCodeChord.keyCode) : null;
        const resolvedKb = keyCodeChord ? new WindowsNativeResolvedKeybinding(this, [keyCodeChord]) : null;
        const outScanCode = `${ctrlKey ? "Ctrl+" : ""}${shiftKey ? "Shift+" : ""}${altKey ? "Alt+" : ""}${strCode}`;
        const ariaLabel = resolvedKb ? resolvedKb.getAriaLabel() : null;
        const outUILabel = ariaLabel ? ariaLabel.replace(/Control\+/, "Ctrl+") : null;
        const outUserSettings = resolvedKb ? resolvedKb.getUserSettingsLabel() : null;
        const outKey = WindowsNativeResolvedKeybinding.getProducedChar(scanCodeChord, mapping);
        const outKb = strKeyCode ? `${ctrlKey ? "Ctrl+" : ""}${shiftKey ? "Shift+" : ""}${altKey ? "Alt+" : ""}${strKeyCode}` : null;
        const isWYSIWYG = resolvedKb ? resolvedKb.isWYSIWYG() : false;
        const outWYSIWYG = isWYSIWYG ? "       " : "   NO  ";
        result.push(`| ${this._leftPad(outScanCode, 30)} | ${outKey} | ${this._leftPad(outKb, 25)} | ${this._leftPad(outUILabel, 25)} |  ${this._leftPad(outUserSettings, 25)} | ${outWYSIWYG} |`);
      }
      result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
    }
    return result.join("\n");
  }
  _leftPad(str, cnt) {
    if (str === null) {
      str = "null";
    }
    while (str.length < cnt) {
      str = " " + str;
    }
    return str;
  }
  getUILabelForKeyCode(keyCode) {
    return this._getLabelForKeyCode(keyCode);
  }
  getAriaLabelForKeyCode(keyCode) {
    return this._getLabelForKeyCode(keyCode);
  }
  getUserSettingsLabelForKeyCode(keyCode) {
    if (this._isUSStandard) {
      return KeyCodeUtils.toUserSettingsUS(keyCode);
    }
    return KeyCodeUtils.toUserSettingsGeneral(keyCode);
  }
  getElectronAcceleratorForKeyBinding(chord) {
    return KeyCodeUtils.toElectronAccelerator(chord.keyCode);
  }
  _getLabelForKeyCode(keyCode) {
    return this._keyCodeToLabel[keyCode] || KeyCodeUtils.toString(KeyCode.Unknown);
  }
  resolveKeyboardEvent(keyboardEvent) {
    const ctrlKey = keyboardEvent.ctrlKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const altKey = keyboardEvent.altKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const chord = new KeyCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
    return new WindowsNativeResolvedKeybinding(this, [chord]);
  }
  _resolveChord(chord) {
    if (!chord) {
      return null;
    }
    if (chord instanceof KeyCodeChord) {
      if (!this._keyCodeExists[chord.keyCode]) {
        return null;
      }
      return chord;
    }
    const keyCode = this._scanCodeToKeyCode[chord.scanCode] || KeyCode.Unknown;
    if (keyCode === KeyCode.Unknown || !this._keyCodeExists[keyCode]) {
      return null;
    }
    return new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
  }
  resolveKeybinding(keybinding) {
    const chords = toEmptyArrayIfContainsNull(keybinding.chords.map((chord) => this._resolveChord(chord)));
    if (chords.length > 0) {
      return [new WindowsNativeResolvedKeybinding(this, chords)];
    }
    return [];
  }
}
export {
  WindowsKeyboardMapper,
  WindowsNativeResolvedKeybinding
};
//# sourceMappingURL=windowsKeyboardMapper.js.map
