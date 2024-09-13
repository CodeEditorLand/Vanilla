var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCodeUtils, ScanCodeUtils } from "./keyCodes.js";
import {
  KeyCodeChord,
  Keybinding,
  ScanCodeChord
} from "./keybindings.js";
class KeybindingParser {
  static {
    __name(this, "KeybindingParser");
  }
  static _readModifiers(input) {
    input = input.toLowerCase().trim();
    let ctrl = false;
    let shift = false;
    let alt = false;
    let meta = false;
    let matchedModifier;
    do {
      matchedModifier = false;
      if (/^ctrl(\+|-)/.test(input)) {
        ctrl = true;
        input = input.substr("ctrl-".length);
        matchedModifier = true;
      }
      if (/^shift(\+|-)/.test(input)) {
        shift = true;
        input = input.substr("shift-".length);
        matchedModifier = true;
      }
      if (/^alt(\+|-)/.test(input)) {
        alt = true;
        input = input.substr("alt-".length);
        matchedModifier = true;
      }
      if (/^meta(\+|-)/.test(input)) {
        meta = true;
        input = input.substr("meta-".length);
        matchedModifier = true;
      }
      if (/^win(\+|-)/.test(input)) {
        meta = true;
        input = input.substr("win-".length);
        matchedModifier = true;
      }
      if (/^cmd(\+|-)/.test(input)) {
        meta = true;
        input = input.substr("cmd-".length);
        matchedModifier = true;
      }
    } while (matchedModifier);
    let key;
    const firstSpaceIdx = input.indexOf(" ");
    if (firstSpaceIdx > 0) {
      key = input.substring(0, firstSpaceIdx);
      input = input.substring(firstSpaceIdx);
    } else {
      key = input;
      input = "";
    }
    return {
      remains: input,
      ctrl,
      shift,
      alt,
      meta,
      key
    };
  }
  static parseChord(input) {
    const mods = this._readModifiers(input);
    const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
    if (scanCodeMatch) {
      const strScanCode = scanCodeMatch[1];
      const scanCode = ScanCodeUtils.lowerCaseToEnum(strScanCode);
      return [
        new ScanCodeChord(
          mods.ctrl,
          mods.shift,
          mods.alt,
          mods.meta,
          scanCode
        ),
        mods.remains
      ];
    }
    const keyCode = KeyCodeUtils.fromUserSettings(mods.key);
    return [
      new KeyCodeChord(
        mods.ctrl,
        mods.shift,
        mods.alt,
        mods.meta,
        keyCode
      ),
      mods.remains
    ];
  }
  static parseKeybinding(input) {
    if (!input) {
      return null;
    }
    const chords = [];
    let chord;
    while (input.length > 0) {
      [chord, input] = this.parseChord(input);
      chords.push(chord);
    }
    return chords.length > 0 ? new Keybinding(chords) : null;
  }
}
export {
  KeybindingParser
};
//# sourceMappingURL=keybindingParser.js.map
