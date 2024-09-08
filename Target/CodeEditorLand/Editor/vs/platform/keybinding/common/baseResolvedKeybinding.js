import { illegalArgument } from "../../../base/common/errors.js";
import {
  AriaLabelProvider,
  ElectronAcceleratorLabelProvider,
  UILabelProvider,
  UserSettingsLabelProvider
} from "../../../base/common/keybindingLabels.js";
import {
  ResolvedChord,
  ResolvedKeybinding
} from "../../../base/common/keybindings.js";
class BaseResolvedKeybinding extends ResolvedKeybinding {
  _os;
  _chords;
  constructor(os, chords) {
    super();
    if (chords.length === 0) {
      throw illegalArgument(`chords`);
    }
    this._os = os;
    this._chords = chords;
  }
  getLabel() {
    return UILabelProvider.toLabel(
      this._os,
      this._chords,
      (keybinding) => this._getLabel(keybinding)
    );
  }
  getAriaLabel() {
    return AriaLabelProvider.toLabel(
      this._os,
      this._chords,
      (keybinding) => this._getAriaLabel(keybinding)
    );
  }
  getElectronAccelerator() {
    if (this._chords.length > 1) {
      return null;
    }
    if (this._chords[0].isDuplicateModifierCase()) {
      return null;
    }
    return ElectronAcceleratorLabelProvider.toLabel(
      this._os,
      this._chords,
      (keybinding) => this._getElectronAccelerator(keybinding)
    );
  }
  getUserSettingsLabel() {
    return UserSettingsLabelProvider.toLabel(
      this._os,
      this._chords,
      (keybinding) => this._getUserSettingsLabel(keybinding)
    );
  }
  isWYSIWYG() {
    return this._chords.every((keybinding) => this._isWYSIWYG(keybinding));
  }
  hasMultipleChords() {
    return this._chords.length > 1;
  }
  getChords() {
    return this._chords.map((keybinding) => this._getChord(keybinding));
  }
  _getChord(keybinding) {
    return new ResolvedChord(
      keybinding.ctrlKey,
      keybinding.shiftKey,
      keybinding.altKey,
      keybinding.metaKey,
      this._getLabel(keybinding),
      this._getAriaLabel(keybinding)
    );
  }
  getDispatchChords() {
    return this._chords.map(
      (keybinding) => this._getChordDispatch(keybinding)
    );
  }
  getSingleModifierDispatchChords() {
    return this._chords.map(
      (keybinding) => this._getSingleModifierChordDispatch(keybinding)
    );
  }
}
export {
  BaseResolvedKeybinding
};
