import * as nls from "../../nls.js";
import { OperatingSystem } from "./platform.js";
class ModifierLabelProvider {
  modifierLabels;
  constructor(mac, windows, linux = windows) {
    this.modifierLabels = [null];
    this.modifierLabels[OperatingSystem.Macintosh] = mac;
    this.modifierLabels[OperatingSystem.Windows] = windows;
    this.modifierLabels[OperatingSystem.Linux] = linux;
  }
  toLabel(OS, chords, keyLabelProvider) {
    if (chords.length === 0) {
      return null;
    }
    const result = [];
    for (let i = 0, len = chords.length; i < len; i++) {
      const chord = chords[i];
      const keyLabel = keyLabelProvider(chord);
      if (keyLabel === null) {
        return null;
      }
      result[i] = _simpleAsString(
        chord,
        keyLabel,
        this.modifierLabels[OS]
      );
    }
    return result.join(" ");
  }
}
const UILabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "\u2303",
    shiftKey: "\u21E7",
    altKey: "\u2325",
    metaKey: "\u2318",
    separator: ""
  },
  {
    ctrlKey: nls.localize(
      {
        key: "ctrlKey",
        comment: [
          "This is the short form for the Control key on the keyboard"
        ]
      },
      "Ctrl"
    ),
    shiftKey: nls.localize(
      {
        key: "shiftKey",
        comment: [
          "This is the short form for the Shift key on the keyboard"
        ]
      },
      "Shift"
    ),
    altKey: nls.localize(
      {
        key: "altKey",
        comment: [
          "This is the short form for the Alt key on the keyboard"
        ]
      },
      "Alt"
    ),
    metaKey: nls.localize(
      {
        key: "windowsKey",
        comment: [
          "This is the short form for the Windows key on the keyboard"
        ]
      },
      "Windows"
    ),
    separator: "+"
  },
  {
    ctrlKey: nls.localize(
      {
        key: "ctrlKey",
        comment: [
          "This is the short form for the Control key on the keyboard"
        ]
      },
      "Ctrl"
    ),
    shiftKey: nls.localize(
      {
        key: "shiftKey",
        comment: [
          "This is the short form for the Shift key on the keyboard"
        ]
      },
      "Shift"
    ),
    altKey: nls.localize(
      {
        key: "altKey",
        comment: [
          "This is the short form for the Alt key on the keyboard"
        ]
      },
      "Alt"
    ),
    metaKey: nls.localize(
      {
        key: "superKey",
        comment: [
          "This is the short form for the Super key on the keyboard"
        ]
      },
      "Super"
    ),
    separator: "+"
  }
);
const AriaLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: nls.localize(
      {
        key: "ctrlKey.long",
        comment: [
          "This is the long form for the Control key on the keyboard"
        ]
      },
      "Control"
    ),
    shiftKey: nls.localize(
      {
        key: "shiftKey.long",
        comment: [
          "This is the long form for the Shift key on the keyboard"
        ]
      },
      "Shift"
    ),
    altKey: nls.localize(
      {
        key: "optKey.long",
        comment: [
          "This is the long form for the Alt/Option key on the keyboard"
        ]
      },
      "Option"
    ),
    metaKey: nls.localize(
      {
        key: "cmdKey.long",
        comment: [
          "This is the long form for the Command key on the keyboard"
        ]
      },
      "Command"
    ),
    separator: "+"
  },
  {
    ctrlKey: nls.localize(
      {
        key: "ctrlKey.long",
        comment: [
          "This is the long form for the Control key on the keyboard"
        ]
      },
      "Control"
    ),
    shiftKey: nls.localize(
      {
        key: "shiftKey.long",
        comment: [
          "This is the long form for the Shift key on the keyboard"
        ]
      },
      "Shift"
    ),
    altKey: nls.localize(
      {
        key: "altKey.long",
        comment: [
          "This is the long form for the Alt key on the keyboard"
        ]
      },
      "Alt"
    ),
    metaKey: nls.localize(
      {
        key: "windowsKey.long",
        comment: [
          "This is the long form for the Windows key on the keyboard"
        ]
      },
      "Windows"
    ),
    separator: "+"
  },
  {
    ctrlKey: nls.localize(
      {
        key: "ctrlKey.long",
        comment: [
          "This is the long form for the Control key on the keyboard"
        ]
      },
      "Control"
    ),
    shiftKey: nls.localize(
      {
        key: "shiftKey.long",
        comment: [
          "This is the long form for the Shift key on the keyboard"
        ]
      },
      "Shift"
    ),
    altKey: nls.localize(
      {
        key: "altKey.long",
        comment: [
          "This is the long form for the Alt key on the keyboard"
        ]
      },
      "Alt"
    ),
    metaKey: nls.localize(
      {
        key: "superKey.long",
        comment: [
          "This is the long form for the Super key on the keyboard"
        ]
      },
      "Super"
    ),
    separator: "+"
  }
);
const ElectronAcceleratorLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Cmd",
    separator: "+"
  },
  {
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Super",
    separator: "+"
  }
);
const UserSettingsLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "cmd",
    separator: "+"
  },
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "win",
    separator: "+"
  },
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "meta",
    separator: "+"
  }
);
function _simpleAsString(modifiers, key, labels) {
  if (key === null) {
    return "";
  }
  const result = [];
  if (modifiers.ctrlKey) {
    result.push(labels.ctrlKey);
  }
  if (modifiers.shiftKey) {
    result.push(labels.shiftKey);
  }
  if (modifiers.altKey) {
    result.push(labels.altKey);
  }
  if (modifiers.metaKey) {
    result.push(labels.metaKey);
  }
  if (key !== "") {
    result.push(key);
  }
  return result.join(labels.separator);
}
export {
  AriaLabelProvider,
  ElectronAcceleratorLabelProvider,
  ModifierLabelProvider,
  UILabelProvider,
  UserSettingsLabelProvider
};
