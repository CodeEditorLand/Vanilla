var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as arrays from "../../../base/common/arrays.js";
import * as objects from "../../../base/common/objects.js";
import * as platform from "../../../base/common/platform.js";
import { ScrollbarVisibility } from "../../../base/common/scrollable.js";
import { Constants } from "../../../base/common/uint.js";
import * as nls from "../../../nls.js";
import { AccessibilitySupport } from "../../../platform/accessibility/common/accessibility.js";
import { EDITOR_MODEL_DEFAULTS } from "../core/textModelDefaults.js";
import { USUAL_WORD_SEPARATORS } from "../core/wordHelper.js";
var EditorAutoIndentStrategy = /* @__PURE__ */ ((EditorAutoIndentStrategy2) => {
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["None"] = 0] = "None";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Keep"] = 1] = "Keep";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Brackets"] = 2] = "Brackets";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Advanced"] = 3] = "Advanced";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Full"] = 4] = "Full";
  return EditorAutoIndentStrategy2;
})(EditorAutoIndentStrategy || {});
const MINIMAP_GUTTER_WIDTH = 8;
class ConfigurationChangedEvent {
  static {
    __name(this, "ConfigurationChangedEvent");
  }
  _values;
  /**
   * @internal
   */
  constructor(values) {
    this._values = values;
  }
  hasChanged(id) {
    return this._values[id];
  }
}
class ComputeOptionsMemory {
  static {
    __name(this, "ComputeOptionsMemory");
  }
  stableMinimapLayoutInput;
  stableFitMaxMinimapScale;
  stableFitRemainingWidth;
  constructor() {
    this.stableMinimapLayoutInput = null;
    this.stableFitMaxMinimapScale = 0;
    this.stableFitRemainingWidth = 0;
  }
}
class BaseEditorOption {
  static {
    __name(this, "BaseEditorOption");
  }
  id;
  name;
  defaultValue;
  schema;
  constructor(id, name, defaultValue, schema) {
    this.id = id;
    this.name = name;
    this.defaultValue = defaultValue;
    this.schema = schema;
  }
  applyUpdate(value, update) {
    return applyUpdate(value, update);
  }
  compute(env, options, value) {
    return value;
  }
}
class ApplyUpdateResult {
  constructor(newValue, didChange) {
    this.newValue = newValue;
    this.didChange = didChange;
  }
  static {
    __name(this, "ApplyUpdateResult");
  }
}
function applyUpdate(value, update) {
  if (typeof value !== "object" || typeof update !== "object" || !value || !update) {
    return new ApplyUpdateResult(update, value !== update);
  }
  if (Array.isArray(value) || Array.isArray(update)) {
    const arrayEquals = Array.isArray(value) && Array.isArray(update) && arrays.equals(value, update);
    return new ApplyUpdateResult(update, !arrayEquals);
  }
  let didChange = false;
  for (const key in update) {
    if (update.hasOwnProperty(key)) {
      const result = applyUpdate(value[key], update[key]);
      if (result.didChange) {
        value[key] = result.newValue;
        didChange = true;
      }
    }
  }
  return new ApplyUpdateResult(value, didChange);
}
__name(applyUpdate, "applyUpdate");
class ComputedEditorOption {
  static {
    __name(this, "ComputedEditorOption");
  }
  id;
  name;
  defaultValue;
  schema = void 0;
  constructor(id) {
    this.id = id;
    this.name = "_never_";
    this.defaultValue = void 0;
  }
  applyUpdate(value, update) {
    return applyUpdate(value, update);
  }
  validate(input) {
    return this.defaultValue;
  }
}
class SimpleEditorOption {
  static {
    __name(this, "SimpleEditorOption");
  }
  id;
  name;
  defaultValue;
  schema;
  constructor(id, name, defaultValue, schema) {
    this.id = id;
    this.name = name;
    this.defaultValue = defaultValue;
    this.schema = schema;
  }
  applyUpdate(value, update) {
    return applyUpdate(value, update);
  }
  validate(input) {
    if (typeof input === "undefined") {
      return this.defaultValue;
    }
    return input;
  }
  compute(env, options, value) {
    return value;
  }
}
function boolean(value, defaultValue) {
  if (typeof value === "undefined") {
    return defaultValue;
  }
  if (value === "false") {
    return false;
  }
  return Boolean(value);
}
__name(boolean, "boolean");
class EditorBooleanOption extends SimpleEditorOption {
  static {
    __name(this, "EditorBooleanOption");
  }
  constructor(id, name, defaultValue, schema = void 0) {
    if (typeof schema !== "undefined") {
      schema.type = "boolean";
      schema.default = defaultValue;
    }
    super(id, name, defaultValue, schema);
  }
  validate(input) {
    return boolean(input, this.defaultValue);
  }
}
function clampedInt(value, defaultValue, minimum, maximum) {
  if (typeof value === "undefined") {
    return defaultValue;
  }
  let r = Number.parseInt(value, 10);
  if (isNaN(r)) {
    return defaultValue;
  }
  r = Math.max(minimum, r);
  r = Math.min(maximum, r);
  return r | 0;
}
__name(clampedInt, "clampedInt");
class EditorIntOption extends SimpleEditorOption {
  static {
    __name(this, "EditorIntOption");
  }
  static clampedInt(value, defaultValue, minimum, maximum) {
    return clampedInt(value, defaultValue, minimum, maximum);
  }
  minimum;
  maximum;
  constructor(id, name, defaultValue, minimum, maximum, schema = void 0) {
    if (typeof schema !== "undefined") {
      schema.type = "integer";
      schema.default = defaultValue;
      schema.minimum = minimum;
      schema.maximum = maximum;
    }
    super(id, name, defaultValue, schema);
    this.minimum = minimum;
    this.maximum = maximum;
  }
  validate(input) {
    return EditorIntOption.clampedInt(
      input,
      this.defaultValue,
      this.minimum,
      this.maximum
    );
  }
}
function clampedFloat(value, defaultValue, minimum, maximum) {
  if (typeof value === "undefined") {
    return defaultValue;
  }
  const r = EditorFloatOption.float(value, defaultValue);
  return EditorFloatOption.clamp(r, minimum, maximum);
}
__name(clampedFloat, "clampedFloat");
class EditorFloatOption extends SimpleEditorOption {
  static {
    __name(this, "EditorFloatOption");
  }
  static clamp(n, min, max) {
    if (n < min) {
      return min;
    }
    if (n > max) {
      return max;
    }
    return n;
  }
  static float(value, defaultValue) {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "undefined") {
      return defaultValue;
    }
    const r = Number.parseFloat(value);
    return isNaN(r) ? defaultValue : r;
  }
  validationFn;
  constructor(id, name, defaultValue, validationFn, schema) {
    if (typeof schema !== "undefined") {
      schema.type = "number";
      schema.default = defaultValue;
    }
    super(id, name, defaultValue, schema);
    this.validationFn = validationFn;
  }
  validate(input) {
    return this.validationFn(
      EditorFloatOption.float(input, this.defaultValue)
    );
  }
}
class EditorStringOption extends SimpleEditorOption {
  static {
    __name(this, "EditorStringOption");
  }
  static string(value, defaultValue) {
    if (typeof value !== "string") {
      return defaultValue;
    }
    return value;
  }
  constructor(id, name, defaultValue, schema = void 0) {
    if (typeof schema !== "undefined") {
      schema.type = "string";
      schema.default = defaultValue;
    }
    super(id, name, defaultValue, schema);
  }
  validate(input) {
    return EditorStringOption.string(input, this.defaultValue);
  }
}
function stringSet(value, defaultValue, allowedValues, renamedValues) {
  if (typeof value !== "string") {
    return defaultValue;
  }
  if (renamedValues && value in renamedValues) {
    return renamedValues[value];
  }
  if (allowedValues.indexOf(value) === -1) {
    return defaultValue;
  }
  return value;
}
__name(stringSet, "stringSet");
class EditorStringEnumOption extends SimpleEditorOption {
  static {
    __name(this, "EditorStringEnumOption");
  }
  _allowedValues;
  constructor(id, name, defaultValue, allowedValues, schema = void 0) {
    if (typeof schema !== "undefined") {
      schema.type = "string";
      schema.enum = allowedValues;
      schema.default = defaultValue;
    }
    super(id, name, defaultValue, schema);
    this._allowedValues = allowedValues;
  }
  validate(input) {
    return stringSet(input, this.defaultValue, this._allowedValues);
  }
}
class EditorEnumOption extends BaseEditorOption {
  static {
    __name(this, "EditorEnumOption");
  }
  _allowedValues;
  _convert;
  constructor(id, name, defaultValue, defaultStringValue, allowedValues, convert, schema = void 0) {
    if (typeof schema !== "undefined") {
      schema.type = "string";
      schema.enum = allowedValues;
      schema.default = defaultStringValue;
    }
    super(id, name, defaultValue, schema);
    this._allowedValues = allowedValues;
    this._convert = convert;
  }
  validate(input) {
    if (typeof input !== "string") {
      return this.defaultValue;
    }
    if (this._allowedValues.indexOf(input) === -1) {
      return this.defaultValue;
    }
    return this._convert(input);
  }
}
function _autoIndentFromString(autoIndent) {
  switch (autoIndent) {
    case "none":
      return 0 /* None */;
    case "keep":
      return 1 /* Keep */;
    case "brackets":
      return 2 /* Brackets */;
    case "advanced":
      return 3 /* Advanced */;
    case "full":
      return 4 /* Full */;
  }
}
__name(_autoIndentFromString, "_autoIndentFromString");
class EditorAccessibilitySupport extends BaseEditorOption {
  static {
    __name(this, "EditorAccessibilitySupport");
  }
  constructor() {
    super(
      2 /* accessibilitySupport */,
      "accessibilitySupport",
      AccessibilitySupport.Unknown,
      {
        type: "string",
        enum: ["auto", "on", "off"],
        enumDescriptions: [
          nls.localize(
            "accessibilitySupport.auto",
            "Use platform APIs to detect when a Screen Reader is attached."
          ),
          nls.localize(
            "accessibilitySupport.on",
            "Optimize for usage with a Screen Reader."
          ),
          nls.localize(
            "accessibilitySupport.off",
            "Assume a screen reader is not attached."
          )
        ],
        default: "auto",
        tags: ["accessibility"],
        description: nls.localize(
          "accessibilitySupport",
          "Controls if the UI should run in a mode where it is optimized for screen readers."
        )
      }
    );
  }
  validate(input) {
    switch (input) {
      case "auto":
        return AccessibilitySupport.Unknown;
      case "off":
        return AccessibilitySupport.Disabled;
      case "on":
        return AccessibilitySupport.Enabled;
    }
    return this.defaultValue;
  }
  compute(env, options, value) {
    if (value === AccessibilitySupport.Unknown) {
      return env.accessibilitySupport;
    }
    return value;
  }
}
class EditorComments extends BaseEditorOption {
  static {
    __name(this, "EditorComments");
  }
  constructor() {
    const defaults = {
      insertSpace: true,
      ignoreEmptyLines: true
    };
    super(23 /* comments */, "comments", defaults, {
      "editor.comments.insertSpace": {
        type: "boolean",
        default: defaults.insertSpace,
        description: nls.localize(
          "comments.insertSpace",
          "Controls whether a space character is inserted when commenting."
        )
      },
      "editor.comments.ignoreEmptyLines": {
        type: "boolean",
        default: defaults.ignoreEmptyLines,
        description: nls.localize(
          "comments.ignoreEmptyLines",
          "Controls if empty lines should be ignored with toggle, add or remove actions for line comments."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      insertSpace: boolean(
        input.insertSpace,
        this.defaultValue.insertSpace
      ),
      ignoreEmptyLines: boolean(
        input.ignoreEmptyLines,
        this.defaultValue.ignoreEmptyLines
      )
    };
  }
}
var TextEditorCursorBlinkingStyle = /* @__PURE__ */ ((TextEditorCursorBlinkingStyle2) => {
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Hidden"] = 0] = "Hidden";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Blink"] = 1] = "Blink";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Smooth"] = 2] = "Smooth";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Phase"] = 3] = "Phase";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Expand"] = 4] = "Expand";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Solid"] = 5] = "Solid";
  return TextEditorCursorBlinkingStyle2;
})(TextEditorCursorBlinkingStyle || {});
function _cursorBlinkingStyleFromString(cursorBlinkingStyle) {
  switch (cursorBlinkingStyle) {
    case "blink":
      return 1 /* Blink */;
    case "smooth":
      return 2 /* Smooth */;
    case "phase":
      return 3 /* Phase */;
    case "expand":
      return 4 /* Expand */;
    case "solid":
      return 5 /* Solid */;
  }
}
__name(_cursorBlinkingStyleFromString, "_cursorBlinkingStyleFromString");
var TextEditorCursorStyle = /* @__PURE__ */ ((TextEditorCursorStyle2) => {
  TextEditorCursorStyle2[TextEditorCursorStyle2["Line"] = 1] = "Line";
  TextEditorCursorStyle2[TextEditorCursorStyle2["Block"] = 2] = "Block";
  TextEditorCursorStyle2[TextEditorCursorStyle2["Underline"] = 3] = "Underline";
  TextEditorCursorStyle2[TextEditorCursorStyle2["LineThin"] = 4] = "LineThin";
  TextEditorCursorStyle2[TextEditorCursorStyle2["BlockOutline"] = 5] = "BlockOutline";
  TextEditorCursorStyle2[TextEditorCursorStyle2["UnderlineThin"] = 6] = "UnderlineThin";
  return TextEditorCursorStyle2;
})(TextEditorCursorStyle || {});
function cursorStyleToString(cursorStyle) {
  switch (cursorStyle) {
    case 1 /* Line */:
      return "line";
    case 2 /* Block */:
      return "block";
    case 3 /* Underline */:
      return "underline";
    case 4 /* LineThin */:
      return "line-thin";
    case 5 /* BlockOutline */:
      return "block-outline";
    case 6 /* UnderlineThin */:
      return "underline-thin";
  }
}
__name(cursorStyleToString, "cursorStyleToString");
function _cursorStyleFromString(cursorStyle) {
  switch (cursorStyle) {
    case "line":
      return 1 /* Line */;
    case "block":
      return 2 /* Block */;
    case "underline":
      return 3 /* Underline */;
    case "line-thin":
      return 4 /* LineThin */;
    case "block-outline":
      return 5 /* BlockOutline */;
    case "underline-thin":
      return 6 /* UnderlineThin */;
  }
}
__name(_cursorStyleFromString, "_cursorStyleFromString");
class EditorClassName extends ComputedEditorOption {
  static {
    __name(this, "EditorClassName");
  }
  constructor() {
    super(145 /* editorClassName */);
  }
  compute(env, options, _) {
    const classNames = ["monaco-editor"];
    if (options.get(41 /* extraEditorClassName */)) {
      classNames.push(options.get(41 /* extraEditorClassName */));
    }
    if (env.extraEditorClassName) {
      classNames.push(env.extraEditorClassName);
    }
    if (options.get(76 /* mouseStyle */) === "default") {
      classNames.push("mouse-default");
    } else if (options.get(76 /* mouseStyle */) === "copy") {
      classNames.push("mouse-copy");
    }
    if (options.get(114 /* showUnused */)) {
      classNames.push("showUnused");
    }
    if (options.get(143 /* showDeprecated */)) {
      classNames.push("showDeprecated");
    }
    return classNames.join(" ");
  }
}
class EditorEmptySelectionClipboard extends EditorBooleanOption {
  static {
    __name(this, "EditorEmptySelectionClipboard");
  }
  constructor() {
    super(
      38 /* emptySelectionClipboard */,
      "emptySelectionClipboard",
      true,
      {
        description: nls.localize(
          "emptySelectionClipboard",
          "Controls whether copying without a selection copies the current line."
        )
      }
    );
  }
  compute(env, options, value) {
    return value && env.emptySelectionClipboard;
  }
}
class EditorFind extends BaseEditorOption {
  static {
    __name(this, "EditorFind");
  }
  constructor() {
    const defaults = {
      cursorMoveOnType: true,
      seedSearchStringFromSelection: "always",
      autoFindInSelection: "never",
      globalFindClipboard: false,
      addExtraSpaceOnTop: true,
      loop: true
    };
    super(43 /* find */, "find", defaults, {
      "editor.find.cursorMoveOnType": {
        type: "boolean",
        default: defaults.cursorMoveOnType,
        description: nls.localize(
          "find.cursorMoveOnType",
          "Controls whether the cursor should jump to find matches while typing."
        )
      },
      "editor.find.seedSearchStringFromSelection": {
        type: "string",
        enum: ["never", "always", "selection"],
        default: defaults.seedSearchStringFromSelection,
        enumDescriptions: [
          nls.localize(
            "editor.find.seedSearchStringFromSelection.never",
            "Never seed search string from the editor selection."
          ),
          nls.localize(
            "editor.find.seedSearchStringFromSelection.always",
            "Always seed search string from the editor selection, including word at cursor position."
          ),
          nls.localize(
            "editor.find.seedSearchStringFromSelection.selection",
            "Only seed search string from the editor selection."
          )
        ],
        description: nls.localize(
          "find.seedSearchStringFromSelection",
          "Controls whether the search string in the Find Widget is seeded from the editor selection."
        )
      },
      "editor.find.autoFindInSelection": {
        type: "string",
        enum: ["never", "always", "multiline"],
        default: defaults.autoFindInSelection,
        enumDescriptions: [
          nls.localize(
            "editor.find.autoFindInSelection.never",
            "Never turn on Find in Selection automatically (default)."
          ),
          nls.localize(
            "editor.find.autoFindInSelection.always",
            "Always turn on Find in Selection automatically."
          ),
          nls.localize(
            "editor.find.autoFindInSelection.multiline",
            "Turn on Find in Selection automatically when multiple lines of content are selected."
          )
        ],
        description: nls.localize(
          "find.autoFindInSelection",
          "Controls the condition for turning on Find in Selection automatically."
        )
      },
      "editor.find.globalFindClipboard": {
        type: "boolean",
        default: defaults.globalFindClipboard,
        description: nls.localize(
          "find.globalFindClipboard",
          "Controls whether the Find Widget should read or modify the shared find clipboard on macOS."
        ),
        included: platform.isMacintosh
      },
      "editor.find.addExtraSpaceOnTop": {
        type: "boolean",
        default: defaults.addExtraSpaceOnTop,
        description: nls.localize(
          "find.addExtraSpaceOnTop",
          "Controls whether the Find Widget should add extra lines on top of the editor. When true, you can scroll beyond the first line when the Find Widget is visible."
        )
      },
      "editor.find.loop": {
        type: "boolean",
        default: defaults.loop,
        description: nls.localize(
          "find.loop",
          "Controls whether the search automatically restarts from the beginning (or the end) when no further matches can be found."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      cursorMoveOnType: boolean(
        input.cursorMoveOnType,
        this.defaultValue.cursorMoveOnType
      ),
      seedSearchStringFromSelection: typeof _input.seedSearchStringFromSelection === "boolean" ? _input.seedSearchStringFromSelection ? "always" : "never" : stringSet(
        input.seedSearchStringFromSelection,
        this.defaultValue.seedSearchStringFromSelection,
        ["never", "always", "selection"]
      ),
      autoFindInSelection: typeof _input.autoFindInSelection === "boolean" ? _input.autoFindInSelection ? "always" : "never" : stringSet(
        input.autoFindInSelection,
        this.defaultValue.autoFindInSelection,
        ["never", "always", "multiline"]
      ),
      globalFindClipboard: boolean(
        input.globalFindClipboard,
        this.defaultValue.globalFindClipboard
      ),
      addExtraSpaceOnTop: boolean(
        input.addExtraSpaceOnTop,
        this.defaultValue.addExtraSpaceOnTop
      ),
      loop: boolean(input.loop, this.defaultValue.loop)
    };
  }
}
class EditorFontLigatures extends BaseEditorOption {
  static {
    __name(this, "EditorFontLigatures");
  }
  static OFF = '"liga" off, "calt" off';
  static ON = '"liga" on, "calt" on';
  constructor() {
    super(
      53 /* fontLigatures */,
      "fontLigatures",
      EditorFontLigatures.OFF,
      {
        anyOf: [
          {
            type: "boolean",
            description: nls.localize(
              "fontLigatures",
              "Enables/Disables font ligatures ('calt' and 'liga' font features). Change this to a string for fine-grained control of the 'font-feature-settings' CSS property."
            )
          },
          {
            type: "string",
            description: nls.localize(
              "fontFeatureSettings",
              "Explicit 'font-feature-settings' CSS property. A boolean can be passed instead if one only needs to turn on/off ligatures."
            )
          }
        ],
        description: nls.localize(
          "fontLigaturesGeneral",
          "Configures font ligatures or font features. Can be either a boolean to enable/disable ligatures or a string for the value of the CSS 'font-feature-settings' property."
        ),
        default: false
      }
    );
  }
  validate(input) {
    if (typeof input === "undefined") {
      return this.defaultValue;
    }
    if (typeof input === "string") {
      if (input === "false" || input.length === 0) {
        return EditorFontLigatures.OFF;
      }
      if (input === "true") {
        return EditorFontLigatures.ON;
      }
      return input;
    }
    if (Boolean(input)) {
      return EditorFontLigatures.ON;
    }
    return EditorFontLigatures.OFF;
  }
}
class EditorFontVariations extends BaseEditorOption {
  static {
    __name(this, "EditorFontVariations");
  }
  // Text is laid out using default settings.
  static OFF = "normal";
  // Translate `fontWeight` config to the `font-variation-settings` CSS property.
  static TRANSLATE = "translate";
  constructor() {
    super(
      56 /* fontVariations */,
      "fontVariations",
      EditorFontVariations.OFF,
      {
        anyOf: [
          {
            type: "boolean",
            description: nls.localize(
              "fontVariations",
              "Enables/Disables the translation from font-weight to font-variation-settings. Change this to a string for fine-grained control of the 'font-variation-settings' CSS property."
            )
          },
          {
            type: "string",
            description: nls.localize(
              "fontVariationSettings",
              "Explicit 'font-variation-settings' CSS property. A boolean can be passed instead if one only needs to translate font-weight to font-variation-settings."
            )
          }
        ],
        description: nls.localize(
          "fontVariationsGeneral",
          "Configures font variations. Can be either a boolean to enable/disable the translation from font-weight to font-variation-settings or a string for the value of the CSS 'font-variation-settings' property."
        ),
        default: false
      }
    );
  }
  validate(input) {
    if (typeof input === "undefined") {
      return this.defaultValue;
    }
    if (typeof input === "string") {
      if (input === "false") {
        return EditorFontVariations.OFF;
      }
      if (input === "true") {
        return EditorFontVariations.TRANSLATE;
      }
      return input;
    }
    if (Boolean(input)) {
      return EditorFontVariations.TRANSLATE;
    }
    return EditorFontVariations.OFF;
  }
  compute(env, options, value) {
    return env.fontInfo.fontVariationSettings;
  }
}
class EditorFontInfo extends ComputedEditorOption {
  static {
    __name(this, "EditorFontInfo");
  }
  constructor() {
    super(52 /* fontInfo */);
  }
  compute(env, options, _) {
    return env.fontInfo;
  }
}
class EditorFontSize extends SimpleEditorOption {
  static {
    __name(this, "EditorFontSize");
  }
  constructor() {
    super(
      54 /* fontSize */,
      "fontSize",
      EDITOR_FONT_DEFAULTS.fontSize,
      {
        type: "number",
        minimum: 6,
        maximum: 100,
        default: EDITOR_FONT_DEFAULTS.fontSize,
        description: nls.localize(
          "fontSize",
          "Controls the font size in pixels."
        )
      }
    );
  }
  validate(input) {
    const r = EditorFloatOption.float(input, this.defaultValue);
    if (r === 0) {
      return EDITOR_FONT_DEFAULTS.fontSize;
    }
    return EditorFloatOption.clamp(r, 6, 100);
  }
  compute(env, options, value) {
    return env.fontInfo.fontSize;
  }
}
class EditorFontWeight extends BaseEditorOption {
  static {
    __name(this, "EditorFontWeight");
  }
  static SUGGESTION_VALUES = [
    "normal",
    "bold",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ];
  static MINIMUM_VALUE = 1;
  static MAXIMUM_VALUE = 1e3;
  constructor() {
    super(
      55 /* fontWeight */,
      "fontWeight",
      EDITOR_FONT_DEFAULTS.fontWeight,
      {
        anyOf: [
          {
            type: "number",
            minimum: EditorFontWeight.MINIMUM_VALUE,
            maximum: EditorFontWeight.MAXIMUM_VALUE,
            errorMessage: nls.localize(
              "fontWeightErrorMessage",
              'Only "normal" and "bold" keywords or numbers between 1 and 1000 are allowed.'
            )
          },
          {
            type: "string",
            pattern: "^(normal|bold|1000|[1-9][0-9]{0,2})$"
          },
          {
            enum: EditorFontWeight.SUGGESTION_VALUES
          }
        ],
        default: EDITOR_FONT_DEFAULTS.fontWeight,
        description: nls.localize(
          "fontWeight",
          'Controls the font weight. Accepts "normal" and "bold" keywords or numbers between 1 and 1000.'
        )
      }
    );
  }
  validate(input) {
    if (input === "normal" || input === "bold") {
      return input;
    }
    return String(
      EditorIntOption.clampedInt(
        input,
        EDITOR_FONT_DEFAULTS.fontWeight,
        EditorFontWeight.MINIMUM_VALUE,
        EditorFontWeight.MAXIMUM_VALUE
      )
    );
  }
}
class EditorGoToLocation extends BaseEditorOption {
  static {
    __name(this, "EditorGoToLocation");
  }
  constructor() {
    const defaults = {
      multiple: "peek",
      multipleDefinitions: "peek",
      multipleTypeDefinitions: "peek",
      multipleDeclarations: "peek",
      multipleImplementations: "peek",
      multipleReferences: "peek",
      multipleTests: "peek",
      alternativeDefinitionCommand: "editor.action.goToReferences",
      alternativeTypeDefinitionCommand: "editor.action.goToReferences",
      alternativeDeclarationCommand: "editor.action.goToReferences",
      alternativeImplementationCommand: "",
      alternativeReferenceCommand: "",
      alternativeTestsCommand: ""
    };
    const jsonSubset = {
      type: "string",
      enum: ["peek", "gotoAndPeek", "goto"],
      default: defaults.multiple,
      enumDescriptions: [
        nls.localize(
          "editor.gotoLocation.multiple.peek",
          "Show Peek view of the results (default)"
        ),
        nls.localize(
          "editor.gotoLocation.multiple.gotoAndPeek",
          "Go to the primary result and show a Peek view"
        ),
        nls.localize(
          "editor.gotoLocation.multiple.goto",
          "Go to the primary result and enable Peek-less navigation to others"
        )
      ]
    };
    const alternativeCommandOptions = [
      "",
      "editor.action.referenceSearch.trigger",
      "editor.action.goToReferences",
      "editor.action.peekImplementation",
      "editor.action.goToImplementation",
      "editor.action.peekTypeDefinition",
      "editor.action.goToTypeDefinition",
      "editor.action.peekDeclaration",
      "editor.action.revealDeclaration",
      "editor.action.peekDefinition",
      "editor.action.revealDefinitionAside",
      "editor.action.revealDefinition"
    ];
    super(60 /* gotoLocation */, "gotoLocation", defaults, {
      "editor.gotoLocation.multiple": {
        deprecationMessage: nls.localize(
          "editor.gotoLocation.multiple.deprecated",
          "This setting is deprecated, please use separate settings like 'editor.editor.gotoLocation.multipleDefinitions' or 'editor.editor.gotoLocation.multipleImplementations' instead."
        )
      },
      "editor.gotoLocation.multipleDefinitions": {
        description: nls.localize(
          "editor.editor.gotoLocation.multipleDefinitions",
          "Controls the behavior the 'Go to Definition'-command when multiple target locations exist."
        ),
        ...jsonSubset
      },
      "editor.gotoLocation.multipleTypeDefinitions": {
        description: nls.localize(
          "editor.editor.gotoLocation.multipleTypeDefinitions",
          "Controls the behavior the 'Go to Type Definition'-command when multiple target locations exist."
        ),
        ...jsonSubset
      },
      "editor.gotoLocation.multipleDeclarations": {
        description: nls.localize(
          "editor.editor.gotoLocation.multipleDeclarations",
          "Controls the behavior the 'Go to Declaration'-command when multiple target locations exist."
        ),
        ...jsonSubset
      },
      "editor.gotoLocation.multipleImplementations": {
        description: nls.localize(
          "editor.editor.gotoLocation.multipleImplemenattions",
          "Controls the behavior the 'Go to Implementations'-command when multiple target locations exist."
        ),
        ...jsonSubset
      },
      "editor.gotoLocation.multipleReferences": {
        description: nls.localize(
          "editor.editor.gotoLocation.multipleReferences",
          "Controls the behavior the 'Go to References'-command when multiple target locations exist."
        ),
        ...jsonSubset
      },
      "editor.gotoLocation.alternativeDefinitionCommand": {
        type: "string",
        default: defaults.alternativeDefinitionCommand,
        enum: alternativeCommandOptions,
        description: nls.localize(
          "alternativeDefinitionCommand",
          "Alternative command id that is being executed when the result of 'Go to Definition' is the current location."
        )
      },
      "editor.gotoLocation.alternativeTypeDefinitionCommand": {
        type: "string",
        default: defaults.alternativeTypeDefinitionCommand,
        enum: alternativeCommandOptions,
        description: nls.localize(
          "alternativeTypeDefinitionCommand",
          "Alternative command id that is being executed when the result of 'Go to Type Definition' is the current location."
        )
      },
      "editor.gotoLocation.alternativeDeclarationCommand": {
        type: "string",
        default: defaults.alternativeDeclarationCommand,
        enum: alternativeCommandOptions,
        description: nls.localize(
          "alternativeDeclarationCommand",
          "Alternative command id that is being executed when the result of 'Go to Declaration' is the current location."
        )
      },
      "editor.gotoLocation.alternativeImplementationCommand": {
        type: "string",
        default: defaults.alternativeImplementationCommand,
        enum: alternativeCommandOptions,
        description: nls.localize(
          "alternativeImplementationCommand",
          "Alternative command id that is being executed when the result of 'Go to Implementation' is the current location."
        )
      },
      "editor.gotoLocation.alternativeReferenceCommand": {
        type: "string",
        default: defaults.alternativeReferenceCommand,
        enum: alternativeCommandOptions,
        description: nls.localize(
          "alternativeReferenceCommand",
          "Alternative command id that is being executed when the result of 'Go to Reference' is the current location."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      multiple: stringSet(
        input.multiple,
        this.defaultValue.multiple,
        ["peek", "gotoAndPeek", "goto"]
      ),
      multipleDefinitions: input.multipleDefinitions ?? stringSet(
        input.multipleDefinitions,
        "peek",
        ["peek", "gotoAndPeek", "goto"]
      ),
      multipleTypeDefinitions: input.multipleTypeDefinitions ?? stringSet(
        input.multipleTypeDefinitions,
        "peek",
        ["peek", "gotoAndPeek", "goto"]
      ),
      multipleDeclarations: input.multipleDeclarations ?? stringSet(
        input.multipleDeclarations,
        "peek",
        ["peek", "gotoAndPeek", "goto"]
      ),
      multipleImplementations: input.multipleImplementations ?? stringSet(
        input.multipleImplementations,
        "peek",
        ["peek", "gotoAndPeek", "goto"]
      ),
      multipleReferences: input.multipleReferences ?? stringSet(
        input.multipleReferences,
        "peek",
        ["peek", "gotoAndPeek", "goto"]
      ),
      multipleTests: input.multipleTests ?? stringSet(input.multipleTests, "peek", [
        "peek",
        "gotoAndPeek",
        "goto"
      ]),
      alternativeDefinitionCommand: EditorStringOption.string(
        input.alternativeDefinitionCommand,
        this.defaultValue.alternativeDefinitionCommand
      ),
      alternativeTypeDefinitionCommand: EditorStringOption.string(
        input.alternativeTypeDefinitionCommand,
        this.defaultValue.alternativeTypeDefinitionCommand
      ),
      alternativeDeclarationCommand: EditorStringOption.string(
        input.alternativeDeclarationCommand,
        this.defaultValue.alternativeDeclarationCommand
      ),
      alternativeImplementationCommand: EditorStringOption.string(
        input.alternativeImplementationCommand,
        this.defaultValue.alternativeImplementationCommand
      ),
      alternativeReferenceCommand: EditorStringOption.string(
        input.alternativeReferenceCommand,
        this.defaultValue.alternativeReferenceCommand
      ),
      alternativeTestsCommand: EditorStringOption.string(
        input.alternativeTestsCommand,
        this.defaultValue.alternativeTestsCommand
      )
    };
  }
}
class EditorHover extends BaseEditorOption {
  static {
    __name(this, "EditorHover");
  }
  constructor() {
    const defaults = {
      enabled: true,
      delay: 300,
      hidingDelay: 300,
      sticky: true,
      above: true
    };
    super(62 /* hover */, "hover", defaults, {
      "editor.hover.enabled": {
        type: "boolean",
        default: defaults.enabled,
        description: nls.localize(
          "hover.enabled",
          "Controls whether the hover is shown."
        )
      },
      "editor.hover.delay": {
        type: "number",
        default: defaults.delay,
        minimum: 0,
        maximum: 1e4,
        description: nls.localize(
          "hover.delay",
          "Controls the delay in milliseconds after which the hover is shown."
        )
      },
      "editor.hover.sticky": {
        type: "boolean",
        default: defaults.sticky,
        description: nls.localize(
          "hover.sticky",
          "Controls whether the hover should remain visible when mouse is moved over it."
        )
      },
      "editor.hover.hidingDelay": {
        type: "integer",
        minimum: 0,
        default: defaults.hidingDelay,
        description: nls.localize(
          "hover.hidingDelay",
          "Controls the delay in milliseconds after which the hover is hidden. Requires `editor.hover.sticky` to be enabled."
        )
      },
      "editor.hover.above": {
        type: "boolean",
        default: defaults.above,
        description: nls.localize(
          "hover.above",
          "Prefer showing hovers above the line, if there's space."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      delay: EditorIntOption.clampedInt(
        input.delay,
        this.defaultValue.delay,
        0,
        1e4
      ),
      sticky: boolean(input.sticky, this.defaultValue.sticky),
      hidingDelay: EditorIntOption.clampedInt(
        input.hidingDelay,
        this.defaultValue.hidingDelay,
        0,
        6e5
      ),
      above: boolean(input.above, this.defaultValue.above)
    };
  }
}
var RenderMinimap = /* @__PURE__ */ ((RenderMinimap2) => {
  RenderMinimap2[RenderMinimap2["None"] = 0] = "None";
  RenderMinimap2[RenderMinimap2["Text"] = 1] = "Text";
  RenderMinimap2[RenderMinimap2["Blocks"] = 2] = "Blocks";
  return RenderMinimap2;
})(RenderMinimap || {});
class EditorLayoutInfoComputer extends ComputedEditorOption {
  static {
    __name(this, "EditorLayoutInfoComputer");
  }
  constructor() {
    super(148 /* layoutInfo */);
  }
  compute(env, options, _) {
    return EditorLayoutInfoComputer.computeLayout(options, {
      memory: env.memory,
      outerWidth: env.outerWidth,
      outerHeight: env.outerHeight,
      isDominatedByLongLines: env.isDominatedByLongLines,
      lineHeight: env.fontInfo.lineHeight,
      viewLineCount: env.viewLineCount,
      lineNumbersDigitCount: env.lineNumbersDigitCount,
      typicalHalfwidthCharacterWidth: env.fontInfo.typicalHalfwidthCharacterWidth,
      maxDigitWidth: env.fontInfo.maxDigitWidth,
      pixelRatio: env.pixelRatio,
      glyphMarginDecorationLaneCount: env.glyphMarginDecorationLaneCount
    });
  }
  static computeContainedMinimapLineCount(input) {
    const typicalViewportLineCount = input.height / input.lineHeight;
    const extraLinesBeforeFirstLine = Math.floor(
      input.paddingTop / input.lineHeight
    );
    let extraLinesBeyondLastLine = Math.floor(
      input.paddingBottom / input.lineHeight
    );
    if (input.scrollBeyondLastLine) {
      extraLinesBeyondLastLine = Math.max(
        extraLinesBeyondLastLine,
        typicalViewportLineCount - 1
      );
    }
    const desiredRatio = (extraLinesBeforeFirstLine + input.viewLineCount + extraLinesBeyondLastLine) / (input.pixelRatio * input.height);
    const minimapLineCount = Math.floor(input.viewLineCount / desiredRatio);
    return {
      typicalViewportLineCount,
      extraLinesBeforeFirstLine,
      extraLinesBeyondLastLine,
      desiredRatio,
      minimapLineCount
    };
  }
  static _computeMinimapLayout(input, memory) {
    const outerWidth = input.outerWidth;
    const outerHeight = input.outerHeight;
    const pixelRatio = input.pixelRatio;
    if (!input.minimap.enabled) {
      return {
        renderMinimap: 0 /* None */,
        minimapLeft: 0,
        minimapWidth: 0,
        minimapHeightIsEditorHeight: false,
        minimapIsSampling: false,
        minimapScale: 1,
        minimapLineHeight: 1,
        minimapCanvasInnerWidth: 0,
        minimapCanvasInnerHeight: Math.floor(pixelRatio * outerHeight),
        minimapCanvasOuterWidth: 0,
        minimapCanvasOuterHeight: outerHeight
      };
    }
    const stableMinimapLayoutInput = memory.stableMinimapLayoutInput;
    const couldUseMemory = stableMinimapLayoutInput && // && input.outerWidth === lastMinimapLayoutInput.outerWidth !!! INTENTIONAL OMITTED
    input.outerHeight === stableMinimapLayoutInput.outerHeight && input.lineHeight === stableMinimapLayoutInput.lineHeight && input.typicalHalfwidthCharacterWidth === stableMinimapLayoutInput.typicalHalfwidthCharacterWidth && input.pixelRatio === stableMinimapLayoutInput.pixelRatio && input.scrollBeyondLastLine === stableMinimapLayoutInput.scrollBeyondLastLine && input.paddingTop === stableMinimapLayoutInput.paddingTop && input.paddingBottom === stableMinimapLayoutInput.paddingBottom && input.minimap.enabled === stableMinimapLayoutInput.minimap.enabled && input.minimap.side === stableMinimapLayoutInput.minimap.side && input.minimap.size === stableMinimapLayoutInput.minimap.size && input.minimap.showSlider === stableMinimapLayoutInput.minimap.showSlider && input.minimap.renderCharacters === stableMinimapLayoutInput.minimap.renderCharacters && input.minimap.maxColumn === stableMinimapLayoutInput.minimap.maxColumn && input.minimap.scale === stableMinimapLayoutInput.minimap.scale && input.verticalScrollbarWidth === stableMinimapLayoutInput.verticalScrollbarWidth && // && input.viewLineCount === lastMinimapLayoutInput.viewLineCount !!! INTENTIONAL OMITTED
    // && input.remainingWidth === lastMinimapLayoutInput.remainingWidth !!! INTENTIONAL OMITTED
    input.isViewportWrapping === stableMinimapLayoutInput.isViewportWrapping;
    const lineHeight = input.lineHeight;
    const typicalHalfwidthCharacterWidth = input.typicalHalfwidthCharacterWidth;
    const scrollBeyondLastLine = input.scrollBeyondLastLine;
    const minimapRenderCharacters = input.minimap.renderCharacters;
    let minimapScale = pixelRatio >= 2 ? Math.round(input.minimap.scale * 2) : input.minimap.scale;
    const minimapMaxColumn = input.minimap.maxColumn;
    const minimapSize = input.minimap.size;
    const minimapSide = input.minimap.side;
    const verticalScrollbarWidth = input.verticalScrollbarWidth;
    const viewLineCount = input.viewLineCount;
    const remainingWidth = input.remainingWidth;
    const isViewportWrapping = input.isViewportWrapping;
    const baseCharHeight = minimapRenderCharacters ? 2 : 3;
    let minimapCanvasInnerHeight = Math.floor(pixelRatio * outerHeight);
    const minimapCanvasOuterHeight = minimapCanvasInnerHeight / pixelRatio;
    let minimapHeightIsEditorHeight = false;
    let minimapIsSampling = false;
    let minimapLineHeight = baseCharHeight * minimapScale;
    let minimapCharWidth = minimapScale / pixelRatio;
    let minimapWidthMultiplier = 1;
    if (minimapSize === "fill" || minimapSize === "fit") {
      const {
        typicalViewportLineCount,
        extraLinesBeforeFirstLine,
        extraLinesBeyondLastLine,
        desiredRatio,
        minimapLineCount
      } = EditorLayoutInfoComputer.computeContainedMinimapLineCount({
        viewLineCount,
        scrollBeyondLastLine,
        paddingTop: input.paddingTop,
        paddingBottom: input.paddingBottom,
        height: outerHeight,
        lineHeight,
        pixelRatio
      });
      const ratio = viewLineCount / minimapLineCount;
      if (ratio > 1) {
        minimapHeightIsEditorHeight = true;
        minimapIsSampling = true;
        minimapScale = 1;
        minimapLineHeight = 1;
        minimapCharWidth = minimapScale / pixelRatio;
      } else {
        let fitBecomesFill = false;
        let maxMinimapScale = minimapScale + 1;
        if (minimapSize === "fit") {
          const effectiveMinimapHeight = Math.ceil(
            (extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine) * minimapLineHeight
          );
          if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
            fitBecomesFill = true;
            maxMinimapScale = memory.stableFitMaxMinimapScale;
          } else {
            fitBecomesFill = effectiveMinimapHeight > minimapCanvasInnerHeight;
          }
        }
        if (minimapSize === "fill" || fitBecomesFill) {
          minimapHeightIsEditorHeight = true;
          const configuredMinimapScale = minimapScale;
          minimapLineHeight = Math.min(
            lineHeight * pixelRatio,
            Math.max(1, Math.floor(1 / desiredRatio))
          );
          if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
            maxMinimapScale = memory.stableFitMaxMinimapScale;
          }
          minimapScale = Math.min(
            maxMinimapScale,
            Math.max(
              1,
              Math.floor(minimapLineHeight / baseCharHeight)
            )
          );
          if (minimapScale > configuredMinimapScale) {
            minimapWidthMultiplier = Math.min(
              2,
              minimapScale / configuredMinimapScale
            );
          }
          minimapCharWidth = minimapScale / pixelRatio / minimapWidthMultiplier;
          minimapCanvasInnerHeight = Math.ceil(
            Math.max(
              typicalViewportLineCount,
              extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine
            ) * minimapLineHeight
          );
          if (isViewportWrapping) {
            memory.stableMinimapLayoutInput = input;
            memory.stableFitRemainingWidth = remainingWidth;
            memory.stableFitMaxMinimapScale = minimapScale;
          } else {
            memory.stableMinimapLayoutInput = null;
            memory.stableFitRemainingWidth = 0;
          }
        }
      }
    }
    const minimapMaxWidth = Math.floor(minimapMaxColumn * minimapCharWidth);
    const minimapWidth = Math.min(
      minimapMaxWidth,
      Math.max(
        0,
        Math.floor(
          (remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth / (typicalHalfwidthCharacterWidth + minimapCharWidth)
        )
      ) + MINIMAP_GUTTER_WIDTH
    );
    let minimapCanvasInnerWidth = Math.floor(pixelRatio * minimapWidth);
    const minimapCanvasOuterWidth = minimapCanvasInnerWidth / pixelRatio;
    minimapCanvasInnerWidth = Math.floor(
      minimapCanvasInnerWidth * minimapWidthMultiplier
    );
    const renderMinimap = minimapRenderCharacters ? 1 /* Text */ : 2 /* Blocks */;
    const minimapLeft = minimapSide === "left" ? 0 : outerWidth - minimapWidth - verticalScrollbarWidth;
    return {
      renderMinimap,
      minimapLeft,
      minimapWidth,
      minimapHeightIsEditorHeight,
      minimapIsSampling,
      minimapScale,
      minimapLineHeight,
      minimapCanvasInnerWidth,
      minimapCanvasInnerHeight,
      minimapCanvasOuterWidth,
      minimapCanvasOuterHeight
    };
  }
  static computeLayout(options, env) {
    const outerWidth = env.outerWidth | 0;
    const outerHeight = env.outerHeight | 0;
    const lineHeight = env.lineHeight | 0;
    const lineNumbersDigitCount = env.lineNumbersDigitCount | 0;
    const typicalHalfwidthCharacterWidth = env.typicalHalfwidthCharacterWidth;
    const maxDigitWidth = env.maxDigitWidth;
    const pixelRatio = env.pixelRatio;
    const viewLineCount = env.viewLineCount;
    const wordWrapOverride2 = options.get(140 /* wordWrapOverride2 */);
    const wordWrapOverride1 = wordWrapOverride2 === "inherit" ? options.get(139 /* wordWrapOverride1 */) : wordWrapOverride2;
    const wordWrap = wordWrapOverride1 === "inherit" ? options.get(135 /* wordWrap */) : wordWrapOverride1;
    const wordWrapColumn = options.get(138 /* wordWrapColumn */);
    const isDominatedByLongLines = env.isDominatedByLongLines;
    const showGlyphMargin = options.get(59 /* glyphMargin */);
    const showLineNumbers = options.get(70 /* lineNumbers */).renderType !== 0 /* Off */;
    const lineNumbersMinChars = options.get(
      71 /* lineNumbersMinChars */
    );
    const scrollBeyondLastLine = options.get(
      108 /* scrollBeyondLastLine */
    );
    const padding = options.get(86 /* padding */);
    const minimap = options.get(75 /* minimap */);
    const scrollbar = options.get(106 /* scrollbar */);
    const verticalScrollbarWidth = scrollbar.verticalScrollbarSize;
    const verticalScrollbarHasArrows = scrollbar.verticalHasArrows;
    const scrollbarArrowSize = scrollbar.arrowSize;
    const horizontalScrollbarHeight = scrollbar.horizontalScrollbarSize;
    const folding = options.get(45 /* folding */);
    const showFoldingDecoration = options.get(113 /* showFoldingControls */) !== "never";
    let lineDecorationsWidth = options.get(
      68 /* lineDecorationsWidth */
    );
    if (folding && showFoldingDecoration) {
      lineDecorationsWidth += 16;
    }
    let lineNumbersWidth = 0;
    if (showLineNumbers) {
      const digitCount = Math.max(
        lineNumbersDigitCount,
        lineNumbersMinChars
      );
      lineNumbersWidth = Math.round(digitCount * maxDigitWidth);
    }
    let glyphMarginWidth = 0;
    if (showGlyphMargin) {
      glyphMarginWidth = lineHeight * env.glyphMarginDecorationLaneCount;
    }
    let glyphMarginLeft = 0;
    let lineNumbersLeft = glyphMarginLeft + glyphMarginWidth;
    let decorationsLeft = lineNumbersLeft + lineNumbersWidth;
    let contentLeft = decorationsLeft + lineDecorationsWidth;
    const remainingWidth = outerWidth - glyphMarginWidth - lineNumbersWidth - lineDecorationsWidth;
    let isWordWrapMinified = false;
    let isViewportWrapping = false;
    let wrappingColumn = -1;
    if (wordWrapOverride1 === "inherit" && isDominatedByLongLines) {
      isWordWrapMinified = true;
      isViewportWrapping = true;
    } else if (wordWrap === "on" || wordWrap === "bounded") {
      isViewportWrapping = true;
    } else if (wordWrap === "wordWrapColumn") {
      wrappingColumn = wordWrapColumn;
    }
    const minimapLayout = EditorLayoutInfoComputer._computeMinimapLayout(
      {
        outerWidth,
        outerHeight,
        lineHeight,
        typicalHalfwidthCharacterWidth,
        pixelRatio,
        scrollBeyondLastLine,
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        minimap,
        verticalScrollbarWidth,
        viewLineCount,
        remainingWidth,
        isViewportWrapping
      },
      env.memory || new ComputeOptionsMemory()
    );
    if (minimapLayout.renderMinimap !== 0 /* None */ && minimapLayout.minimapLeft === 0) {
      glyphMarginLeft += minimapLayout.minimapWidth;
      lineNumbersLeft += minimapLayout.minimapWidth;
      decorationsLeft += minimapLayout.minimapWidth;
      contentLeft += minimapLayout.minimapWidth;
    }
    const contentWidth = remainingWidth - minimapLayout.minimapWidth;
    const viewportColumn = Math.max(
      1,
      Math.floor(
        (contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth
      )
    );
    const verticalArrowSize = verticalScrollbarHasArrows ? scrollbarArrowSize : 0;
    if (isViewportWrapping) {
      wrappingColumn = Math.max(1, viewportColumn);
      if (wordWrap === "bounded") {
        wrappingColumn = Math.min(wrappingColumn, wordWrapColumn);
      }
    }
    return {
      width: outerWidth,
      height: outerHeight,
      glyphMarginLeft,
      glyphMarginWidth,
      glyphMarginDecorationLaneCount: env.glyphMarginDecorationLaneCount,
      lineNumbersLeft,
      lineNumbersWidth,
      decorationsLeft,
      decorationsWidth: lineDecorationsWidth,
      contentLeft,
      contentWidth,
      minimap: minimapLayout,
      viewportColumn,
      isWordWrapMinified,
      isViewportWrapping,
      wrappingColumn,
      verticalScrollbarWidth,
      horizontalScrollbarHeight,
      overviewRuler: {
        top: verticalArrowSize,
        width: verticalScrollbarWidth,
        height: outerHeight - 2 * verticalArrowSize,
        right: 0
      }
    };
  }
}
class WrappingStrategy extends BaseEditorOption {
  static {
    __name(this, "WrappingStrategy");
  }
  constructor() {
    super(142 /* wrappingStrategy */, "wrappingStrategy", "simple", {
      "editor.wrappingStrategy": {
        enumDescriptions: [
          nls.localize(
            "wrappingStrategy.simple",
            "Assumes that all characters are of the same width. This is a fast algorithm that works correctly for monospace fonts and certain scripts (like Latin characters) where glyphs are of equal width."
          ),
          nls.localize(
            "wrappingStrategy.advanced",
            "Delegates wrapping points computation to the browser. This is a slow algorithm, that might cause freezes for large files, but it works correctly in all cases."
          )
        ],
        type: "string",
        enum: ["simple", "advanced"],
        default: "simple",
        description: nls.localize(
          "wrappingStrategy",
          "Controls the algorithm that computes wrapping points. Note that when in accessibility mode, advanced will be used for the best experience."
        )
      }
    });
  }
  validate(input) {
    return stringSet(input, "simple", [
      "simple",
      "advanced"
    ]);
  }
  compute(env, options, value) {
    const accessibilitySupport = options.get(
      2 /* accessibilitySupport */
    );
    if (accessibilitySupport === AccessibilitySupport.Enabled) {
      return "advanced";
    }
    return value;
  }
}
var ShowLightbulbIconMode = /* @__PURE__ */ ((ShowLightbulbIconMode2) => {
  ShowLightbulbIconMode2["Off"] = "off";
  ShowLightbulbIconMode2["OnCode"] = "onCode";
  ShowLightbulbIconMode2["On"] = "on";
  return ShowLightbulbIconMode2;
})(ShowLightbulbIconMode || {});
class EditorLightbulb extends BaseEditorOption {
  static {
    __name(this, "EditorLightbulb");
  }
  constructor() {
    const defaults = {
      enabled: "onCode" /* OnCode */
    };
    super(67 /* lightbulb */, "lightbulb", defaults, {
      "editor.lightbulb.enabled": {
        type: "string",
        tags: ["experimental"],
        enum: [
          "off" /* Off */,
          "onCode" /* OnCode */,
          "on" /* On */
        ],
        default: defaults.enabled,
        enumDescriptions: [
          nls.localize(
            "editor.lightbulb.enabled.off",
            "Disable the code action menu."
          ),
          nls.localize(
            "editor.lightbulb.enabled.onCode",
            "Show the code action menu when the cursor is on lines with code."
          ),
          nls.localize(
            "editor.lightbulb.enabled.on",
            "Show the code action menu when the cursor is on lines with code or on empty lines."
          )
        ],
        description: nls.localize(
          "enabled",
          "Enables the Code Action lightbulb in the editor."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: stringSet(input.enabled, this.defaultValue.enabled, [
        "off" /* Off */,
        "onCode" /* OnCode */,
        "on" /* On */
      ])
    };
  }
}
class EditorStickyScroll extends BaseEditorOption {
  static {
    __name(this, "EditorStickyScroll");
  }
  constructor() {
    const defaults = {
      enabled: true,
      maxLineCount: 5,
      defaultModel: "outlineModel",
      scrollWithEditor: true
    };
    super(118 /* stickyScroll */, "stickyScroll", defaults, {
      "editor.stickyScroll.enabled": {
        type: "boolean",
        default: defaults.enabled,
        description: nls.localize(
          "editor.stickyScroll.enabled",
          "Shows the nested current scopes during the scroll at the top of the editor."
        ),
        tags: ["experimental"]
      },
      "editor.stickyScroll.maxLineCount": {
        type: "number",
        default: defaults.maxLineCount,
        minimum: 1,
        maximum: 20,
        description: nls.localize(
          "editor.stickyScroll.maxLineCount",
          "Defines the maximum number of sticky lines to show."
        )
      },
      "editor.stickyScroll.defaultModel": {
        type: "string",
        enum: [
          "outlineModel",
          "foldingProviderModel",
          "indentationModel"
        ],
        default: defaults.defaultModel,
        description: nls.localize(
          "editor.stickyScroll.defaultModel",
          "Defines the model to use for determining which lines to stick. If the outline model does not exist, it will fall back on the folding provider model which falls back on the indentation model. This order is respected in all three cases."
        )
      },
      "editor.stickyScroll.scrollWithEditor": {
        type: "boolean",
        default: defaults.scrollWithEditor,
        description: nls.localize(
          "editor.stickyScroll.scrollWithEditor",
          "Enable scrolling of Sticky Scroll with the editor's horizontal scrollbar."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      maxLineCount: EditorIntOption.clampedInt(
        input.maxLineCount,
        this.defaultValue.maxLineCount,
        1,
        20
      ),
      defaultModel: stringSet(input.defaultModel, this.defaultValue.defaultModel, [
        "outlineModel",
        "foldingProviderModel",
        "indentationModel"
      ]),
      scrollWithEditor: boolean(
        input.scrollWithEditor,
        this.defaultValue.scrollWithEditor
      )
    };
  }
}
class EditorInlayHints extends BaseEditorOption {
  static {
    __name(this, "EditorInlayHints");
  }
  constructor() {
    const defaults = {
      enabled: "on",
      fontSize: 0,
      fontFamily: "",
      padding: false,
      maximumLength: 43
    };
    super(144 /* inlayHints */, "inlayHints", defaults, {
      "editor.inlayHints.enabled": {
        type: "string",
        default: defaults.enabled,
        description: nls.localize(
          "inlayHints.enable",
          "Enables the inlay hints in the editor."
        ),
        enum: ["on", "onUnlessPressed", "offUnlessPressed", "off"],
        markdownEnumDescriptions: [
          nls.localize(
            "editor.inlayHints.on",
            "Inlay hints are enabled"
          ),
          nls.localize(
            "editor.inlayHints.onUnlessPressed",
            "Inlay hints are showing by default and hide when holding {0}",
            platform.isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`
          ),
          nls.localize(
            "editor.inlayHints.offUnlessPressed",
            "Inlay hints are hidden by default and show when holding {0}",
            platform.isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`
          ),
          nls.localize(
            "editor.inlayHints.off",
            "Inlay hints are disabled"
          )
        ]
      },
      "editor.inlayHints.fontSize": {
        type: "number",
        default: defaults.fontSize,
        markdownDescription: nls.localize(
          "inlayHints.fontSize",
          "Controls font size of inlay hints in the editor. As default the {0} is used when the configured value is less than {1} or greater than the editor font size.",
          "`#editor.fontSize#`",
          "`5`"
        )
      },
      "editor.inlayHints.fontFamily": {
        type: "string",
        default: defaults.fontFamily,
        markdownDescription: nls.localize(
          "inlayHints.fontFamily",
          "Controls font family of inlay hints in the editor. When set to empty, the {0} is used.",
          "`#editor.fontFamily#`"
        )
      },
      "editor.inlayHints.padding": {
        type: "boolean",
        default: defaults.padding,
        description: nls.localize(
          "inlayHints.padding",
          "Enables the padding around the inlay hints in the editor."
        )
      },
      "editor.inlayHints.maximumLength": {
        type: "number",
        default: defaults.maximumLength,
        markdownDescription: nls.localize(
          "inlayHints.maximumLength",
          "Maximum overall length of inlay hints, for a single line, before they get truncated by the editor. Set to `0` to never truncate"
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    if (typeof input.enabled === "boolean") {
      input.enabled = input.enabled ? "on" : "off";
    }
    return {
      enabled: stringSet(input.enabled, this.defaultValue.enabled, [
        "on",
        "off",
        "offUnlessPressed",
        "onUnlessPressed"
      ]),
      fontSize: EditorIntOption.clampedInt(
        input.fontSize,
        this.defaultValue.fontSize,
        0,
        100
      ),
      fontFamily: EditorStringOption.string(
        input.fontFamily,
        this.defaultValue.fontFamily
      ),
      padding: boolean(input.padding, this.defaultValue.padding),
      maximumLength: EditorIntOption.clampedInt(
        input.maximumLength,
        this.defaultValue.maximumLength,
        0,
        Number.MAX_SAFE_INTEGER
      )
    };
  }
}
class EditorLineDecorationsWidth extends BaseEditorOption {
  static {
    __name(this, "EditorLineDecorationsWidth");
  }
  constructor() {
    super(68 /* lineDecorationsWidth */, "lineDecorationsWidth", 10);
  }
  validate(input) {
    if (typeof input === "string" && /^\d+(\.\d+)?ch$/.test(input)) {
      const multiple = Number.parseFloat(
        input.substring(0, input.length - 2)
      );
      return -multiple;
    } else {
      return EditorIntOption.clampedInt(
        input,
        this.defaultValue,
        0,
        1e3
      );
    }
  }
  compute(env, options, value) {
    if (value < 0) {
      return EditorIntOption.clampedInt(
        -value * env.fontInfo.typicalHalfwidthCharacterWidth,
        this.defaultValue,
        0,
        1e3
      );
    } else {
      return value;
    }
  }
}
class EditorLineHeight extends EditorFloatOption {
  static {
    __name(this, "EditorLineHeight");
  }
  constructor() {
    super(
      69 /* lineHeight */,
      "lineHeight",
      EDITOR_FONT_DEFAULTS.lineHeight,
      (x) => EditorFloatOption.clamp(x, 0, 150),
      {
        markdownDescription: nls.localize(
          "lineHeight",
          "Controls the line height. \n - Use 0 to automatically compute the line height from the font size.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values."
        )
      }
    );
  }
  compute(env, options, value) {
    return env.fontInfo.lineHeight;
  }
}
class EditorMinimap extends BaseEditorOption {
  static {
    __name(this, "EditorMinimap");
  }
  constructor() {
    const defaults = {
      enabled: true,
      size: "proportional",
      side: "right",
      showSlider: "mouseover",
      autohide: false,
      renderCharacters: true,
      maxColumn: 120,
      scale: 1,
      showRegionSectionHeaders: true,
      showMarkSectionHeaders: true,
      sectionHeaderFontSize: 9,
      sectionHeaderLetterSpacing: 1
    };
    super(75 /* minimap */, "minimap", defaults, {
      "editor.minimap.enabled": {
        type: "boolean",
        default: defaults.enabled,
        description: nls.localize(
          "minimap.enabled",
          "Controls whether the minimap is shown."
        )
      },
      "editor.minimap.autohide": {
        type: "boolean",
        default: defaults.autohide,
        description: nls.localize(
          "minimap.autohide",
          "Controls whether the minimap is hidden automatically."
        )
      },
      "editor.minimap.size": {
        type: "string",
        enum: ["proportional", "fill", "fit"],
        enumDescriptions: [
          nls.localize(
            "minimap.size.proportional",
            "The minimap has the same size as the editor contents (and might scroll)."
          ),
          nls.localize(
            "minimap.size.fill",
            "The minimap will stretch or shrink as necessary to fill the height of the editor (no scrolling)."
          ),
          nls.localize(
            "minimap.size.fit",
            "The minimap will shrink as necessary to never be larger than the editor (no scrolling)."
          )
        ],
        default: defaults.size,
        description: nls.localize(
          "minimap.size",
          "Controls the size of the minimap."
        )
      },
      "editor.minimap.side": {
        type: "string",
        enum: ["left", "right"],
        default: defaults.side,
        description: nls.localize(
          "minimap.side",
          "Controls the side where to render the minimap."
        )
      },
      "editor.minimap.showSlider": {
        type: "string",
        enum: ["always", "mouseover"],
        default: defaults.showSlider,
        description: nls.localize(
          "minimap.showSlider",
          "Controls when the minimap slider is shown."
        )
      },
      "editor.minimap.scale": {
        type: "number",
        default: defaults.scale,
        minimum: 1,
        maximum: 3,
        enum: [1, 2, 3],
        description: nls.localize(
          "minimap.scale",
          "Scale of content drawn in the minimap: 1, 2 or 3."
        )
      },
      "editor.minimap.renderCharacters": {
        type: "boolean",
        default: defaults.renderCharacters,
        description: nls.localize(
          "minimap.renderCharacters",
          "Render the actual characters on a line as opposed to color blocks."
        )
      },
      "editor.minimap.maxColumn": {
        type: "number",
        default: defaults.maxColumn,
        description: nls.localize(
          "minimap.maxColumn",
          "Limit the width of the minimap to render at most a certain number of columns."
        )
      },
      "editor.minimap.showRegionSectionHeaders": {
        type: "boolean",
        default: defaults.showRegionSectionHeaders,
        description: nls.localize(
          "minimap.showRegionSectionHeaders",
          "Controls whether named regions are shown as section headers in the minimap."
        )
      },
      "editor.minimap.showMarkSectionHeaders": {
        type: "boolean",
        default: defaults.showMarkSectionHeaders,
        description: nls.localize(
          "minimap.showMarkSectionHeaders",
          "Controls whether MARK: comments are shown as section headers in the minimap."
        )
      },
      "editor.minimap.sectionHeaderFontSize": {
        type: "number",
        default: defaults.sectionHeaderFontSize,
        description: nls.localize(
          "minimap.sectionHeaderFontSize",
          "Controls the font size of section headers in the minimap."
        )
      },
      "editor.minimap.sectionHeaderLetterSpacing": {
        type: "number",
        default: defaults.sectionHeaderLetterSpacing,
        description: nls.localize(
          "minimap.sectionHeaderLetterSpacing",
          "Controls the amount of space (in pixels) between characters of section header. This helps the readability of the header in small font sizes."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      autohide: boolean(input.autohide, this.defaultValue.autohide),
      size: stringSet(
        input.size,
        this.defaultValue.size,
        ["proportional", "fill", "fit"]
      ),
      side: stringSet(
        input.side,
        this.defaultValue.side,
        ["right", "left"]
      ),
      showSlider: stringSet(
        input.showSlider,
        this.defaultValue.showSlider,
        ["always", "mouseover"]
      ),
      renderCharacters: boolean(
        input.renderCharacters,
        this.defaultValue.renderCharacters
      ),
      scale: EditorIntOption.clampedInt(input.scale, 1, 1, 3),
      maxColumn: EditorIntOption.clampedInt(
        input.maxColumn,
        this.defaultValue.maxColumn,
        1,
        1e4
      ),
      showRegionSectionHeaders: boolean(
        input.showRegionSectionHeaders,
        this.defaultValue.showRegionSectionHeaders
      ),
      showMarkSectionHeaders: boolean(
        input.showMarkSectionHeaders,
        this.defaultValue.showMarkSectionHeaders
      ),
      sectionHeaderFontSize: EditorFloatOption.clamp(
        input.sectionHeaderFontSize ?? this.defaultValue.sectionHeaderFontSize,
        4,
        32
      ),
      sectionHeaderLetterSpacing: EditorFloatOption.clamp(
        input.sectionHeaderLetterSpacing ?? this.defaultValue.sectionHeaderLetterSpacing,
        0,
        5
      )
    };
  }
}
function _multiCursorModifierFromString(multiCursorModifier) {
  if (multiCursorModifier === "ctrlCmd") {
    return platform.isMacintosh ? "metaKey" : "ctrlKey";
  }
  return "altKey";
}
__name(_multiCursorModifierFromString, "_multiCursorModifierFromString");
class EditorPadding extends BaseEditorOption {
  static {
    __name(this, "EditorPadding");
  }
  constructor() {
    super(
      86 /* padding */,
      "padding",
      { top: 0, bottom: 0 },
      {
        "editor.padding.top": {
          type: "number",
          default: 0,
          minimum: 0,
          maximum: 1e3,
          description: nls.localize(
            "padding.top",
            "Controls the amount of space between the top edge of the editor and the first line."
          )
        },
        "editor.padding.bottom": {
          type: "number",
          default: 0,
          minimum: 0,
          maximum: 1e3,
          description: nls.localize(
            "padding.bottom",
            "Controls the amount of space between the bottom edge of the editor and the last line."
          )
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      top: EditorIntOption.clampedInt(input.top, 0, 0, 1e3),
      bottom: EditorIntOption.clampedInt(input.bottom, 0, 0, 1e3)
    };
  }
}
class EditorParameterHints extends BaseEditorOption {
  static {
    __name(this, "EditorParameterHints");
  }
  constructor() {
    const defaults = {
      enabled: true,
      cycle: true
    };
    super(88 /* parameterHints */, "parameterHints", defaults, {
      "editor.parameterHints.enabled": {
        type: "boolean",
        default: defaults.enabled,
        description: nls.localize(
          "parameterHints.enabled",
          "Enables a pop-up that shows parameter documentation and type information as you type."
        )
      },
      "editor.parameterHints.cycle": {
        type: "boolean",
        default: defaults.cycle,
        description: nls.localize(
          "parameterHints.cycle",
          "Controls whether the parameter hints menu cycles or closes when reaching the end of the list."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      cycle: boolean(input.cycle, this.defaultValue.cycle)
    };
  }
}
class EditorPixelRatio extends ComputedEditorOption {
  static {
    __name(this, "EditorPixelRatio");
  }
  constructor() {
    super(146 /* pixelRatio */);
  }
  compute(env, options, _) {
    return env.pixelRatio;
  }
}
class PlaceholderOption extends BaseEditorOption {
  static {
    __name(this, "PlaceholderOption");
  }
  constructor() {
    super(90 /* placeholder */, "placeholder", void 0);
  }
  validate(input) {
    if (typeof input === "undefined") {
      return this.defaultValue;
    }
    if (typeof input === "string") {
      return input;
    }
    return this.defaultValue;
  }
}
class EditorQuickSuggestions extends BaseEditorOption {
  static {
    __name(this, "EditorQuickSuggestions");
  }
  defaultValue;
  constructor() {
    const defaults = {
      other: "on",
      comments: "off",
      strings: "off"
    };
    const types = [
      { type: "boolean" },
      {
        type: "string",
        enum: ["on", "inline", "off"],
        enumDescriptions: [
          nls.localize(
            "on",
            "Quick suggestions show inside the suggest widget"
          ),
          nls.localize(
            "inline",
            "Quick suggestions show as ghost text"
          ),
          nls.localize("off", "Quick suggestions are disabled")
        ]
      }
    ];
    super(92 /* quickSuggestions */, "quickSuggestions", defaults, {
      type: "object",
      additionalProperties: false,
      properties: {
        strings: {
          anyOf: types,
          default: defaults.strings,
          description: nls.localize(
            "quickSuggestions.strings",
            "Enable quick suggestions inside strings."
          )
        },
        comments: {
          anyOf: types,
          default: defaults.comments,
          description: nls.localize(
            "quickSuggestions.comments",
            "Enable quick suggestions inside comments."
          )
        },
        other: {
          anyOf: types,
          default: defaults.other,
          description: nls.localize(
            "quickSuggestions.other",
            "Enable quick suggestions outside of strings and comments."
          )
        }
      },
      default: defaults,
      markdownDescription: nls.localize(
        "quickSuggestions",
        "Controls whether suggestions should automatically show up while typing. This can be controlled for typing in comments, strings, and other code. Quick suggestion can be configured to show as ghost text or with the suggest widget. Also be aware of the {0}-setting which controls if suggestions are triggered by special characters.",
        "`#editor.suggestOnTriggerCharacters#`"
      )
    });
    this.defaultValue = defaults;
  }
  validate(input) {
    if (typeof input === "boolean") {
      const value = input ? "on" : "off";
      return { comments: value, strings: value, other: value };
    }
    if (!input || typeof input !== "object") {
      return this.defaultValue;
    }
    const { other, comments, strings } = input;
    const allowedValues = ["on", "inline", "off"];
    let validatedOther;
    let validatedComments;
    let validatedStrings;
    if (typeof other === "boolean") {
      validatedOther = other ? "on" : "off";
    } else {
      validatedOther = stringSet(
        other,
        this.defaultValue.other,
        allowedValues
      );
    }
    if (typeof comments === "boolean") {
      validatedComments = comments ? "on" : "off";
    } else {
      validatedComments = stringSet(
        comments,
        this.defaultValue.comments,
        allowedValues
      );
    }
    if (typeof strings === "boolean") {
      validatedStrings = strings ? "on" : "off";
    } else {
      validatedStrings = stringSet(
        strings,
        this.defaultValue.strings,
        allowedValues
      );
    }
    return {
      other: validatedOther,
      comments: validatedComments,
      strings: validatedStrings
    };
  }
}
var RenderLineNumbersType = /* @__PURE__ */ ((RenderLineNumbersType2) => {
  RenderLineNumbersType2[RenderLineNumbersType2["Off"] = 0] = "Off";
  RenderLineNumbersType2[RenderLineNumbersType2["On"] = 1] = "On";
  RenderLineNumbersType2[RenderLineNumbersType2["Relative"] = 2] = "Relative";
  RenderLineNumbersType2[RenderLineNumbersType2["Interval"] = 3] = "Interval";
  RenderLineNumbersType2[RenderLineNumbersType2["Custom"] = 4] = "Custom";
  return RenderLineNumbersType2;
})(RenderLineNumbersType || {});
class EditorRenderLineNumbersOption extends BaseEditorOption {
  static {
    __name(this, "EditorRenderLineNumbersOption");
  }
  constructor() {
    super(
      70 /* lineNumbers */,
      "lineNumbers",
      { renderType: 1 /* On */, renderFn: null },
      {
        type: "string",
        enum: ["off", "on", "relative", "interval"],
        enumDescriptions: [
          nls.localize(
            "lineNumbers.off",
            "Line numbers are not rendered."
          ),
          nls.localize(
            "lineNumbers.on",
            "Line numbers are rendered as absolute number."
          ),
          nls.localize(
            "lineNumbers.relative",
            "Line numbers are rendered as distance in lines to cursor position."
          ),
          nls.localize(
            "lineNumbers.interval",
            "Line numbers are rendered every 10 lines."
          )
        ],
        default: "on",
        description: nls.localize(
          "lineNumbers",
          "Controls the display of line numbers."
        )
      }
    );
  }
  validate(lineNumbers) {
    let renderType = this.defaultValue.renderType;
    let renderFn = this.defaultValue.renderFn;
    if (typeof lineNumbers !== "undefined") {
      if (typeof lineNumbers === "function") {
        renderType = 4 /* Custom */;
        renderFn = lineNumbers;
      } else if (lineNumbers === "interval") {
        renderType = 3 /* Interval */;
      } else if (lineNumbers === "relative") {
        renderType = 2 /* Relative */;
      } else if (lineNumbers === "on") {
        renderType = 1 /* On */;
      } else {
        renderType = 0 /* Off */;
      }
    }
    return {
      renderType,
      renderFn
    };
  }
}
function filterValidationDecorations(options) {
  const renderValidationDecorations = options.get(
    101 /* renderValidationDecorations */
  );
  if (renderValidationDecorations === "editable") {
    return options.get(94 /* readOnly */);
  }
  return renderValidationDecorations === "on" ? false : true;
}
__name(filterValidationDecorations, "filterValidationDecorations");
class EditorRulers extends BaseEditorOption {
  static {
    __name(this, "EditorRulers");
  }
  constructor() {
    const defaults = [];
    const columnSchema = {
      type: "number",
      description: nls.localize(
        "rulers.size",
        "Number of monospace characters at which this editor ruler will render."
      )
    };
    super(105 /* rulers */, "rulers", defaults, {
      type: "array",
      items: {
        anyOf: [
          columnSchema,
          {
            type: ["object"],
            properties: {
              column: columnSchema,
              color: {
                type: "string",
                description: nls.localize(
                  "rulers.color",
                  "Color of this editor ruler."
                ),
                format: "color-hex"
              }
            }
          }
        ]
      },
      default: defaults,
      description: nls.localize(
        "rulers",
        "Render vertical rulers after a certain number of monospace characters. Use multiple values for multiple rulers. No rulers are drawn if array is empty."
      )
    });
  }
  validate(input) {
    if (Array.isArray(input)) {
      const rulers = [];
      for (const _element of input) {
        if (typeof _element === "number") {
          rulers.push({
            column: EditorIntOption.clampedInt(
              _element,
              0,
              0,
              1e4
            ),
            color: null
          });
        } else if (_element && typeof _element === "object") {
          const element = _element;
          rulers.push({
            column: EditorIntOption.clampedInt(
              element.column,
              0,
              0,
              1e4
            ),
            color: element.color
          });
        }
      }
      rulers.sort((a, b) => a.column - b.column);
      return rulers;
    }
    return this.defaultValue;
  }
}
class ReadonlyMessage extends BaseEditorOption {
  static {
    __name(this, "ReadonlyMessage");
  }
  constructor() {
    const defaults = void 0;
    super(95 /* readOnlyMessage */, "readOnlyMessage", defaults);
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    return _input;
  }
}
function _scrollbarVisibilityFromString(visibility, defaultValue) {
  if (typeof visibility !== "string") {
    return defaultValue;
  }
  switch (visibility) {
    case "hidden":
      return ScrollbarVisibility.Hidden;
    case "visible":
      return ScrollbarVisibility.Visible;
    default:
      return ScrollbarVisibility.Auto;
  }
}
__name(_scrollbarVisibilityFromString, "_scrollbarVisibilityFromString");
class EditorScrollbar extends BaseEditorOption {
  static {
    __name(this, "EditorScrollbar");
  }
  constructor() {
    const defaults = {
      vertical: ScrollbarVisibility.Auto,
      horizontal: ScrollbarVisibility.Auto,
      arrowSize: 11,
      useShadows: true,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      horizontalScrollbarSize: 12,
      horizontalSliderSize: 12,
      verticalScrollbarSize: 14,
      verticalSliderSize: 14,
      handleMouseWheel: true,
      alwaysConsumeMouseWheel: true,
      scrollByPage: false,
      ignoreHorizontalScrollbarInContentHeight: false
    };
    super(106 /* scrollbar */, "scrollbar", defaults, {
      "editor.scrollbar.vertical": {
        type: "string",
        enum: ["auto", "visible", "hidden"],
        enumDescriptions: [
          nls.localize(
            "scrollbar.vertical.auto",
            "The vertical scrollbar will be visible only when necessary."
          ),
          nls.localize(
            "scrollbar.vertical.visible",
            "The vertical scrollbar will always be visible."
          ),
          nls.localize(
            "scrollbar.vertical.fit",
            "The vertical scrollbar will always be hidden."
          )
        ],
        default: "auto",
        description: nls.localize(
          "scrollbar.vertical",
          "Controls the visibility of the vertical scrollbar."
        )
      },
      "editor.scrollbar.horizontal": {
        type: "string",
        enum: ["auto", "visible", "hidden"],
        enumDescriptions: [
          nls.localize(
            "scrollbar.horizontal.auto",
            "The horizontal scrollbar will be visible only when necessary."
          ),
          nls.localize(
            "scrollbar.horizontal.visible",
            "The horizontal scrollbar will always be visible."
          ),
          nls.localize(
            "scrollbar.horizontal.fit",
            "The horizontal scrollbar will always be hidden."
          )
        ],
        default: "auto",
        description: nls.localize(
          "scrollbar.horizontal",
          "Controls the visibility of the horizontal scrollbar."
        )
      },
      "editor.scrollbar.verticalScrollbarSize": {
        type: "number",
        default: defaults.verticalScrollbarSize,
        description: nls.localize(
          "scrollbar.verticalScrollbarSize",
          "The width of the vertical scrollbar."
        )
      },
      "editor.scrollbar.horizontalScrollbarSize": {
        type: "number",
        default: defaults.horizontalScrollbarSize,
        description: nls.localize(
          "scrollbar.horizontalScrollbarSize",
          "The height of the horizontal scrollbar."
        )
      },
      "editor.scrollbar.scrollByPage": {
        type: "boolean",
        default: defaults.scrollByPage,
        description: nls.localize(
          "scrollbar.scrollByPage",
          "Controls whether clicks scroll by page or jump to click position."
        )
      },
      "editor.scrollbar.ignoreHorizontalScrollbarInContentHeight": {
        type: "boolean",
        default: defaults.ignoreHorizontalScrollbarInContentHeight,
        description: nls.localize(
          "scrollbar.ignoreHorizontalScrollbarInContentHeight",
          "When set, the horizontal scrollbar will not increase the size of the editor's content."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    const horizontalScrollbarSize = EditorIntOption.clampedInt(
      input.horizontalScrollbarSize,
      this.defaultValue.horizontalScrollbarSize,
      0,
      1e3
    );
    const verticalScrollbarSize = EditorIntOption.clampedInt(
      input.verticalScrollbarSize,
      this.defaultValue.verticalScrollbarSize,
      0,
      1e3
    );
    return {
      arrowSize: EditorIntOption.clampedInt(
        input.arrowSize,
        this.defaultValue.arrowSize,
        0,
        1e3
      ),
      vertical: _scrollbarVisibilityFromString(
        input.vertical,
        this.defaultValue.vertical
      ),
      horizontal: _scrollbarVisibilityFromString(
        input.horizontal,
        this.defaultValue.horizontal
      ),
      useShadows: boolean(input.useShadows, this.defaultValue.useShadows),
      verticalHasArrows: boolean(
        input.verticalHasArrows,
        this.defaultValue.verticalHasArrows
      ),
      horizontalHasArrows: boolean(
        input.horizontalHasArrows,
        this.defaultValue.horizontalHasArrows
      ),
      handleMouseWheel: boolean(
        input.handleMouseWheel,
        this.defaultValue.handleMouseWheel
      ),
      alwaysConsumeMouseWheel: boolean(
        input.alwaysConsumeMouseWheel,
        this.defaultValue.alwaysConsumeMouseWheel
      ),
      horizontalScrollbarSize,
      horizontalSliderSize: EditorIntOption.clampedInt(
        input.horizontalSliderSize,
        horizontalScrollbarSize,
        0,
        1e3
      ),
      verticalScrollbarSize,
      verticalSliderSize: EditorIntOption.clampedInt(
        input.verticalSliderSize,
        verticalScrollbarSize,
        0,
        1e3
      ),
      scrollByPage: boolean(
        input.scrollByPage,
        this.defaultValue.scrollByPage
      ),
      ignoreHorizontalScrollbarInContentHeight: boolean(
        input.ignoreHorizontalScrollbarInContentHeight,
        this.defaultValue.ignoreHorizontalScrollbarInContentHeight
      )
    };
  }
}
const inUntrustedWorkspace = "inUntrustedWorkspace";
const unicodeHighlightConfigKeys = {
  allowedCharacters: "editor.unicodeHighlight.allowedCharacters",
  invisibleCharacters: "editor.unicodeHighlight.invisibleCharacters",
  nonBasicASCII: "editor.unicodeHighlight.nonBasicASCII",
  ambiguousCharacters: "editor.unicodeHighlight.ambiguousCharacters",
  includeComments: "editor.unicodeHighlight.includeComments",
  includeStrings: "editor.unicodeHighlight.includeStrings",
  allowedLocales: "editor.unicodeHighlight.allowedLocales"
};
class UnicodeHighlight extends BaseEditorOption {
  static {
    __name(this, "UnicodeHighlight");
  }
  constructor() {
    const defaults = {
      nonBasicASCII: inUntrustedWorkspace,
      invisibleCharacters: true,
      ambiguousCharacters: true,
      includeComments: inUntrustedWorkspace,
      includeStrings: true,
      allowedCharacters: {},
      allowedLocales: { _os: true, _vscode: true }
    };
    super(128 /* unicodeHighlighting */, "unicodeHighlight", defaults, {
      [unicodeHighlightConfigKeys.nonBasicASCII]: {
        restricted: true,
        type: ["boolean", "string"],
        enum: [true, false, inUntrustedWorkspace],
        default: defaults.nonBasicASCII,
        description: nls.localize(
          "unicodeHighlight.nonBasicASCII",
          "Controls whether all non-basic ASCII characters are highlighted. Only characters between U+0020 and U+007E, tab, line-feed and carriage-return are considered basic ASCII."
        )
      },
      [unicodeHighlightConfigKeys.invisibleCharacters]: {
        restricted: true,
        type: "boolean",
        default: defaults.invisibleCharacters,
        description: nls.localize(
          "unicodeHighlight.invisibleCharacters",
          "Controls whether characters that just reserve space or have no width at all are highlighted."
        )
      },
      [unicodeHighlightConfigKeys.ambiguousCharacters]: {
        restricted: true,
        type: "boolean",
        default: defaults.ambiguousCharacters,
        description: nls.localize(
          "unicodeHighlight.ambiguousCharacters",
          "Controls whether characters are highlighted that can be confused with basic ASCII characters, except those that are common in the current user locale."
        )
      },
      [unicodeHighlightConfigKeys.includeComments]: {
        restricted: true,
        type: ["boolean", "string"],
        enum: [true, false, inUntrustedWorkspace],
        default: defaults.includeComments,
        description: nls.localize(
          "unicodeHighlight.includeComments",
          "Controls whether characters in comments should also be subject to Unicode highlighting."
        )
      },
      [unicodeHighlightConfigKeys.includeStrings]: {
        restricted: true,
        type: ["boolean", "string"],
        enum: [true, false, inUntrustedWorkspace],
        default: defaults.includeStrings,
        description: nls.localize(
          "unicodeHighlight.includeStrings",
          "Controls whether characters in strings should also be subject to Unicode highlighting."
        )
      },
      [unicodeHighlightConfigKeys.allowedCharacters]: {
        restricted: true,
        type: "object",
        default: defaults.allowedCharacters,
        description: nls.localize(
          "unicodeHighlight.allowedCharacters",
          "Defines allowed characters that are not being highlighted."
        ),
        additionalProperties: {
          type: "boolean"
        }
      },
      [unicodeHighlightConfigKeys.allowedLocales]: {
        restricted: true,
        type: "object",
        additionalProperties: {
          type: "boolean"
        },
        default: defaults.allowedLocales,
        description: nls.localize(
          "unicodeHighlight.allowedLocales",
          "Unicode characters that are common in allowed locales are not being highlighted."
        )
      }
    });
  }
  applyUpdate(value, update) {
    let didChange = false;
    if (update.allowedCharacters && value) {
      if (!objects.equals(
        value.allowedCharacters,
        update.allowedCharacters
      )) {
        value = {
          ...value,
          allowedCharacters: update.allowedCharacters
        };
        didChange = true;
      }
    }
    if (update.allowedLocales && value) {
      if (!objects.equals(value.allowedLocales, update.allowedLocales)) {
        value = { ...value, allowedLocales: update.allowedLocales };
        didChange = true;
      }
    }
    const result = super.applyUpdate(value, update);
    if (didChange) {
      return new ApplyUpdateResult(result.newValue, true);
    }
    return result;
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      nonBasicASCII: primitiveSet(
        input.nonBasicASCII,
        inUntrustedWorkspace,
        [true, false, inUntrustedWorkspace]
      ),
      invisibleCharacters: boolean(
        input.invisibleCharacters,
        this.defaultValue.invisibleCharacters
      ),
      ambiguousCharacters: boolean(
        input.ambiguousCharacters,
        this.defaultValue.ambiguousCharacters
      ),
      includeComments: primitiveSet(
        input.includeComments,
        inUntrustedWorkspace,
        [true, false, inUntrustedWorkspace]
      ),
      includeStrings: primitiveSet(
        input.includeStrings,
        inUntrustedWorkspace,
        [true, false, inUntrustedWorkspace]
      ),
      allowedCharacters: this.validateBooleanMap(
        _input.allowedCharacters,
        this.defaultValue.allowedCharacters
      ),
      allowedLocales: this.validateBooleanMap(
        _input.allowedLocales,
        this.defaultValue.allowedLocales
      )
    };
  }
  validateBooleanMap(map, defaultValue) {
    if (typeof map !== "object" || !map) {
      return defaultValue;
    }
    const result = {};
    for (const [key, value] of Object.entries(map)) {
      if (value === true) {
        result[key] = true;
      }
    }
    return result;
  }
}
class InlineEditorSuggest extends BaseEditorOption {
  static {
    __name(this, "InlineEditorSuggest");
  }
  constructor() {
    const defaults = {
      enabled: true,
      mode: "subwordSmart",
      showToolbar: "onHover",
      suppressSuggestions: false,
      keepOnBlur: false,
      fontFamily: "default",
      syntaxHighlightingEnabled: false
    };
    super(64 /* inlineSuggest */, "inlineSuggest", defaults, {
      "editor.inlineSuggest.enabled": {
        type: "boolean",
        default: defaults.enabled,
        description: nls.localize(
          "inlineSuggest.enabled",
          "Controls whether to automatically show inline suggestions in the editor."
        )
      },
      "editor.inlineSuggest.showToolbar": {
        type: "string",
        default: defaults.showToolbar,
        enum: ["always", "onHover", "never"],
        enumDescriptions: [
          nls.localize(
            "inlineSuggest.showToolbar.always",
            "Show the inline suggestion toolbar whenever an inline suggestion is shown."
          ),
          nls.localize(
            "inlineSuggest.showToolbar.onHover",
            "Show the inline suggestion toolbar when hovering over an inline suggestion."
          ),
          nls.localize(
            "inlineSuggest.showToolbar.never",
            "Never show the inline suggestion toolbar."
          )
        ],
        description: nls.localize(
          "inlineSuggest.showToolbar",
          "Controls when to show the inline suggestion toolbar."
        )
      },
      "editor.inlineSuggest.syntaxHighlightingEnabled": {
        type: "boolean",
        default: defaults.syntaxHighlightingEnabled,
        description: nls.localize(
          "inlineSuggest.syntaxHighlightingEnabled",
          "Controls whether to show syntax highlighting for inline suggestions in the editor."
        )
      },
      "editor.inlineSuggest.suppressSuggestions": {
        type: "boolean",
        default: defaults.suppressSuggestions,
        description: nls.localize(
          "inlineSuggest.suppressSuggestions",
          "Controls how inline suggestions interact with the suggest widget. If enabled, the suggest widget is not shown automatically when inline suggestions are available."
        )
      },
      "editor.inlineSuggest.fontFamily": {
        type: "string",
        default: defaults.fontFamily,
        description: nls.localize(
          "inlineSuggest.fontFamily",
          "Controls the font family of the inline suggestions."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      mode: stringSet(input.mode, this.defaultValue.mode, [
        "prefix",
        "subword",
        "subwordSmart"
      ]),
      showToolbar: stringSet(
        input.showToolbar,
        this.defaultValue.showToolbar,
        ["always", "onHover", "never"]
      ),
      suppressSuggestions: boolean(
        input.suppressSuggestions,
        this.defaultValue.suppressSuggestions
      ),
      keepOnBlur: boolean(input.keepOnBlur, this.defaultValue.keepOnBlur),
      fontFamily: EditorStringOption.string(
        input.fontFamily,
        this.defaultValue.fontFamily
      ),
      syntaxHighlightingEnabled: boolean(
        input.syntaxHighlightingEnabled,
        this.defaultValue.syntaxHighlightingEnabled
      )
    };
  }
}
class InlineEditorEdit extends BaseEditorOption {
  static {
    __name(this, "InlineEditorEdit");
  }
  constructor() {
    const defaults = {
      enabled: false,
      showToolbar: "onHover",
      fontFamily: "default",
      keepOnBlur: false
    };
    super(65 /* inlineEdit */, "experimentalInlineEdit", defaults, {
      "editor.experimentalInlineEdit.enabled": {
        type: "boolean",
        default: defaults.enabled,
        description: nls.localize(
          "inlineEdit.enabled",
          "Controls whether to show inline edits in the editor."
        )
      },
      "editor.experimentalInlineEdit.showToolbar": {
        type: "string",
        default: defaults.showToolbar,
        enum: ["always", "onHover", "never"],
        enumDescriptions: [
          nls.localize(
            "inlineEdit.showToolbar.always",
            "Show the inline edit toolbar whenever an inline suggestion is shown."
          ),
          nls.localize(
            "inlineEdit.showToolbar.onHover",
            "Show the inline edit toolbar when hovering over an inline suggestion."
          ),
          nls.localize(
            "inlineEdit.showToolbar.never",
            "Never show the inline edit toolbar."
          )
        ],
        description: nls.localize(
          "inlineEdit.showToolbar",
          "Controls when to show the inline edit toolbar."
        )
      },
      "editor.experimentalInlineEdit.fontFamily": {
        type: "string",
        default: defaults.fontFamily,
        description: nls.localize(
          "inlineEdit.fontFamily",
          "Controls the font family of the inline edit."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      showToolbar: stringSet(
        input.showToolbar,
        this.defaultValue.showToolbar,
        ["always", "onHover", "never"]
      ),
      fontFamily: EditorStringOption.string(
        input.fontFamily,
        this.defaultValue.fontFamily
      ),
      keepOnBlur: boolean(input.keepOnBlur, this.defaultValue.keepOnBlur)
    };
  }
}
class BracketPairColorization extends BaseEditorOption {
  static {
    __name(this, "BracketPairColorization");
  }
  constructor() {
    const defaults = {
      enabled: EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.enabled,
      independentColorPoolPerBracketType: EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.independentColorPoolPerBracketType
    };
    super(
      15 /* bracketPairColorization */,
      "bracketPairColorization",
      defaults,
      {
        "editor.bracketPairColorization.enabled": {
          type: "boolean",
          default: defaults.enabled,
          markdownDescription: nls.localize(
            "bracketPairColorization.enabled",
            "Controls whether bracket pair colorization is enabled or not. Use {0} to override the bracket highlight colors.",
            "`#workbench.colorCustomizations#`"
          )
        },
        "editor.bracketPairColorization.independentColorPoolPerBracketType": {
          type: "boolean",
          default: defaults.independentColorPoolPerBracketType,
          description: nls.localize(
            "bracketPairColorization.independentColorPoolPerBracketType",
            "Controls whether each bracket type has its own independent color pool."
          )
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      independentColorPoolPerBracketType: boolean(
        input.independentColorPoolPerBracketType,
        this.defaultValue.independentColorPoolPerBracketType
      )
    };
  }
}
class GuideOptions extends BaseEditorOption {
  static {
    __name(this, "GuideOptions");
  }
  constructor() {
    const defaults = {
      bracketPairs: false,
      bracketPairsHorizontal: "active",
      highlightActiveBracketPair: true,
      indentation: true,
      highlightActiveIndentation: true
    };
    super(16 /* guides */, "guides", defaults, {
      "editor.guides.bracketPairs": {
        type: ["boolean", "string"],
        enum: [true, "active", false],
        enumDescriptions: [
          nls.localize(
            "editor.guides.bracketPairs.true",
            "Enables bracket pair guides."
          ),
          nls.localize(
            "editor.guides.bracketPairs.active",
            "Enables bracket pair guides only for the active bracket pair."
          ),
          nls.localize(
            "editor.guides.bracketPairs.false",
            "Disables bracket pair guides."
          )
        ],
        default: defaults.bracketPairs,
        description: nls.localize(
          "editor.guides.bracketPairs",
          "Controls whether bracket pair guides are enabled or not."
        )
      },
      "editor.guides.bracketPairsHorizontal": {
        type: ["boolean", "string"],
        enum: [true, "active", false],
        enumDescriptions: [
          nls.localize(
            "editor.guides.bracketPairsHorizontal.true",
            "Enables horizontal guides as addition to vertical bracket pair guides."
          ),
          nls.localize(
            "editor.guides.bracketPairsHorizontal.active",
            "Enables horizontal guides only for the active bracket pair."
          ),
          nls.localize(
            "editor.guides.bracketPairsHorizontal.false",
            "Disables horizontal bracket pair guides."
          )
        ],
        default: defaults.bracketPairsHorizontal,
        description: nls.localize(
          "editor.guides.bracketPairsHorizontal",
          "Controls whether horizontal bracket pair guides are enabled or not."
        )
      },
      "editor.guides.highlightActiveBracketPair": {
        type: "boolean",
        default: defaults.highlightActiveBracketPair,
        description: nls.localize(
          "editor.guides.highlightActiveBracketPair",
          "Controls whether the editor should highlight the active bracket pair."
        )
      },
      "editor.guides.indentation": {
        type: "boolean",
        default: defaults.indentation,
        description: nls.localize(
          "editor.guides.indentation",
          "Controls whether the editor should render indent guides."
        )
      },
      "editor.guides.highlightActiveIndentation": {
        type: ["boolean", "string"],
        enum: [true, "always", false],
        enumDescriptions: [
          nls.localize(
            "editor.guides.highlightActiveIndentation.true",
            "Highlights the active indent guide."
          ),
          nls.localize(
            "editor.guides.highlightActiveIndentation.always",
            "Highlights the active indent guide even if bracket guides are highlighted."
          ),
          nls.localize(
            "editor.guides.highlightActiveIndentation.false",
            "Do not highlight the active indent guide."
          )
        ],
        default: defaults.highlightActiveIndentation,
        description: nls.localize(
          "editor.guides.highlightActiveIndentation",
          "Controls whether the editor should highlight the active indent guide."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      bracketPairs: primitiveSet(
        input.bracketPairs,
        this.defaultValue.bracketPairs,
        [true, false, "active"]
      ),
      bracketPairsHorizontal: primitiveSet(
        input.bracketPairsHorizontal,
        this.defaultValue.bracketPairsHorizontal,
        [true, false, "active"]
      ),
      highlightActiveBracketPair: boolean(
        input.highlightActiveBracketPair,
        this.defaultValue.highlightActiveBracketPair
      ),
      indentation: boolean(
        input.indentation,
        this.defaultValue.indentation
      ),
      highlightActiveIndentation: primitiveSet(
        input.highlightActiveIndentation,
        this.defaultValue.highlightActiveIndentation,
        [true, false, "always"]
      )
    };
  }
}
function primitiveSet(value, defaultValue, allowedValues) {
  const idx = allowedValues.indexOf(value);
  if (idx === -1) {
    return defaultValue;
  }
  return allowedValues[idx];
}
__name(primitiveSet, "primitiveSet");
class EditorSuggest extends BaseEditorOption {
  static {
    __name(this, "EditorSuggest");
  }
  constructor() {
    const defaults = {
      insertMode: "insert",
      filterGraceful: true,
      snippetsPreventQuickSuggestions: false,
      localityBonus: false,
      shareSuggestSelections: false,
      selectionMode: "always",
      showIcons: true,
      showStatusBar: false,
      preview: false,
      previewMode: "subwordSmart",
      showInlineDetails: true,
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showDeprecated: true,
      matchOnWordStartOnly: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
      showUsers: true,
      showIssues: true
    };
    super(121 /* suggest */, "suggest", defaults, {
      "editor.suggest.insertMode": {
        type: "string",
        enum: ["insert", "replace"],
        enumDescriptions: [
          nls.localize(
            "suggest.insertMode.insert",
            "Insert suggestion without overwriting text right of the cursor."
          ),
          nls.localize(
            "suggest.insertMode.replace",
            "Insert suggestion and overwrite text right of the cursor."
          )
        ],
        default: defaults.insertMode,
        description: nls.localize(
          "suggest.insertMode",
          "Controls whether words are overwritten when accepting completions. Note that this depends on extensions opting into this feature."
        )
      },
      "editor.suggest.filterGraceful": {
        type: "boolean",
        default: defaults.filterGraceful,
        description: nls.localize(
          "suggest.filterGraceful",
          "Controls whether filtering and sorting suggestions accounts for small typos."
        )
      },
      "editor.suggest.localityBonus": {
        type: "boolean",
        default: defaults.localityBonus,
        description: nls.localize(
          "suggest.localityBonus",
          "Controls whether sorting favors words that appear close to the cursor."
        )
      },
      "editor.suggest.shareSuggestSelections": {
        type: "boolean",
        default: defaults.shareSuggestSelections,
        markdownDescription: nls.localize(
          "suggest.shareSuggestSelections",
          "Controls whether remembered suggestion selections are shared between multiple workspaces and windows (needs `#editor.suggestSelection#`)."
        )
      },
      "editor.suggest.selectionMode": {
        type: "string",
        enum: [
          "always",
          "never",
          "whenTriggerCharacter",
          "whenQuickSuggestion"
        ],
        enumDescriptions: [
          nls.localize(
            "suggest.insertMode.always",
            "Always select a suggestion when automatically triggering IntelliSense."
          ),
          nls.localize(
            "suggest.insertMode.never",
            "Never select a suggestion when automatically triggering IntelliSense."
          ),
          nls.localize(
            "suggest.insertMode.whenTriggerCharacter",
            "Select a suggestion only when triggering IntelliSense from a trigger character."
          ),
          nls.localize(
            "suggest.insertMode.whenQuickSuggestion",
            "Select a suggestion only when triggering IntelliSense as you type."
          )
        ],
        default: defaults.selectionMode,
        markdownDescription: nls.localize(
          "suggest.selectionMode",
          "Controls whether a suggestion is selected when the widget shows. Note that this only applies to automatically triggered suggestions ({0} and {1}) and that a suggestion is always selected when explicitly invoked, e.g via `Ctrl+Space`.",
          "`#editor.quickSuggestions#`",
          "`#editor.suggestOnTriggerCharacters#`"
        )
      },
      "editor.suggest.snippetsPreventQuickSuggestions": {
        type: "boolean",
        default: defaults.snippetsPreventQuickSuggestions,
        description: nls.localize(
          "suggest.snippetsPreventQuickSuggestions",
          "Controls whether an active snippet prevents quick suggestions."
        )
      },
      "editor.suggest.showIcons": {
        type: "boolean",
        default: defaults.showIcons,
        description: nls.localize(
          "suggest.showIcons",
          "Controls whether to show or hide icons in suggestions."
        )
      },
      "editor.suggest.showStatusBar": {
        type: "boolean",
        default: defaults.showStatusBar,
        description: nls.localize(
          "suggest.showStatusBar",
          "Controls the visibility of the status bar at the bottom of the suggest widget."
        )
      },
      "editor.suggest.preview": {
        type: "boolean",
        default: defaults.preview,
        description: nls.localize(
          "suggest.preview",
          "Controls whether to preview the suggestion outcome in the editor."
        )
      },
      "editor.suggest.showInlineDetails": {
        type: "boolean",
        default: defaults.showInlineDetails,
        description: nls.localize(
          "suggest.showInlineDetails",
          "Controls whether suggest details show inline with the label or only in the details widget."
        )
      },
      "editor.suggest.maxVisibleSuggestions": {
        type: "number",
        deprecationMessage: nls.localize(
          "suggest.maxVisibleSuggestions.dep",
          "This setting is deprecated. The suggest widget can now be resized."
        )
      },
      "editor.suggest.filteredTypes": {
        type: "object",
        deprecationMessage: nls.localize(
          "deprecated",
          "This setting is deprecated, please use separate settings like 'editor.suggest.showKeywords' or 'editor.suggest.showSnippets' instead."
        )
      },
      "editor.suggest.showMethods": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showMethods",
          "When enabled IntelliSense shows `method`-suggestions."
        )
      },
      "editor.suggest.showFunctions": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showFunctions",
          "When enabled IntelliSense shows `function`-suggestions."
        )
      },
      "editor.suggest.showConstructors": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showConstructors",
          "When enabled IntelliSense shows `constructor`-suggestions."
        )
      },
      "editor.suggest.showDeprecated": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showDeprecated",
          "When enabled IntelliSense shows `deprecated`-suggestions."
        )
      },
      "editor.suggest.matchOnWordStartOnly": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.matchOnWordStartOnly",
          "When enabled IntelliSense filtering requires that the first character matches on a word start. For example, `c` on `Console` or `WebContext` but _not_ on `description`. When disabled IntelliSense will show more results but still sorts them by match quality."
        )
      },
      "editor.suggest.showFields": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showFields",
          "When enabled IntelliSense shows `field`-suggestions."
        )
      },
      "editor.suggest.showVariables": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showVariables",
          "When enabled IntelliSense shows `variable`-suggestions."
        )
      },
      "editor.suggest.showClasses": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showClasss",
          "When enabled IntelliSense shows `class`-suggestions."
        )
      },
      "editor.suggest.showStructs": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showStructs",
          "When enabled IntelliSense shows `struct`-suggestions."
        )
      },
      "editor.suggest.showInterfaces": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showInterfaces",
          "When enabled IntelliSense shows `interface`-suggestions."
        )
      },
      "editor.suggest.showModules": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showModules",
          "When enabled IntelliSense shows `module`-suggestions."
        )
      },
      "editor.suggest.showProperties": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showPropertys",
          "When enabled IntelliSense shows `property`-suggestions."
        )
      },
      "editor.suggest.showEvents": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showEvents",
          "When enabled IntelliSense shows `event`-suggestions."
        )
      },
      "editor.suggest.showOperators": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showOperators",
          "When enabled IntelliSense shows `operator`-suggestions."
        )
      },
      "editor.suggest.showUnits": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showUnits",
          "When enabled IntelliSense shows `unit`-suggestions."
        )
      },
      "editor.suggest.showValues": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showValues",
          "When enabled IntelliSense shows `value`-suggestions."
        )
      },
      "editor.suggest.showConstants": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showConstants",
          "When enabled IntelliSense shows `constant`-suggestions."
        )
      },
      "editor.suggest.showEnums": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showEnums",
          "When enabled IntelliSense shows `enum`-suggestions."
        )
      },
      "editor.suggest.showEnumMembers": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showEnumMembers",
          "When enabled IntelliSense shows `enumMember`-suggestions."
        )
      },
      "editor.suggest.showKeywords": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showKeywords",
          "When enabled IntelliSense shows `keyword`-suggestions."
        )
      },
      "editor.suggest.showWords": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showTexts",
          "When enabled IntelliSense shows `text`-suggestions."
        )
      },
      "editor.suggest.showColors": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showColors",
          "When enabled IntelliSense shows `color`-suggestions."
        )
      },
      "editor.suggest.showFiles": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showFiles",
          "When enabled IntelliSense shows `file`-suggestions."
        )
      },
      "editor.suggest.showReferences": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showReferences",
          "When enabled IntelliSense shows `reference`-suggestions."
        )
      },
      "editor.suggest.showCustomcolors": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showCustomcolors",
          "When enabled IntelliSense shows `customcolor`-suggestions."
        )
      },
      "editor.suggest.showFolders": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showFolders",
          "When enabled IntelliSense shows `folder`-suggestions."
        )
      },
      "editor.suggest.showTypeParameters": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showTypeParameters",
          "When enabled IntelliSense shows `typeParameter`-suggestions."
        )
      },
      "editor.suggest.showSnippets": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showSnippets",
          "When enabled IntelliSense shows `snippet`-suggestions."
        )
      },
      "editor.suggest.showUsers": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showUsers",
          "When enabled IntelliSense shows `user`-suggestions."
        )
      },
      "editor.suggest.showIssues": {
        type: "boolean",
        default: true,
        markdownDescription: nls.localize(
          "editor.suggest.showIssues",
          "When enabled IntelliSense shows `issues`-suggestions."
        )
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      insertMode: stringSet(
        input.insertMode,
        this.defaultValue.insertMode,
        ["insert", "replace"]
      ),
      filterGraceful: boolean(
        input.filterGraceful,
        this.defaultValue.filterGraceful
      ),
      snippetsPreventQuickSuggestions: boolean(
        input.snippetsPreventQuickSuggestions,
        this.defaultValue.filterGraceful
      ),
      localityBonus: boolean(
        input.localityBonus,
        this.defaultValue.localityBonus
      ),
      shareSuggestSelections: boolean(
        input.shareSuggestSelections,
        this.defaultValue.shareSuggestSelections
      ),
      selectionMode: stringSet(
        input.selectionMode,
        this.defaultValue.selectionMode,
        [
          "always",
          "never",
          "whenQuickSuggestion",
          "whenTriggerCharacter"
        ]
      ),
      showIcons: boolean(input.showIcons, this.defaultValue.showIcons),
      showStatusBar: boolean(
        input.showStatusBar,
        this.defaultValue.showStatusBar
      ),
      preview: boolean(input.preview, this.defaultValue.preview),
      previewMode: stringSet(
        input.previewMode,
        this.defaultValue.previewMode,
        ["prefix", "subword", "subwordSmart"]
      ),
      showInlineDetails: boolean(
        input.showInlineDetails,
        this.defaultValue.showInlineDetails
      ),
      showMethods: boolean(
        input.showMethods,
        this.defaultValue.showMethods
      ),
      showFunctions: boolean(
        input.showFunctions,
        this.defaultValue.showFunctions
      ),
      showConstructors: boolean(
        input.showConstructors,
        this.defaultValue.showConstructors
      ),
      showDeprecated: boolean(
        input.showDeprecated,
        this.defaultValue.showDeprecated
      ),
      matchOnWordStartOnly: boolean(
        input.matchOnWordStartOnly,
        this.defaultValue.matchOnWordStartOnly
      ),
      showFields: boolean(input.showFields, this.defaultValue.showFields),
      showVariables: boolean(
        input.showVariables,
        this.defaultValue.showVariables
      ),
      showClasses: boolean(
        input.showClasses,
        this.defaultValue.showClasses
      ),
      showStructs: boolean(
        input.showStructs,
        this.defaultValue.showStructs
      ),
      showInterfaces: boolean(
        input.showInterfaces,
        this.defaultValue.showInterfaces
      ),
      showModules: boolean(
        input.showModules,
        this.defaultValue.showModules
      ),
      showProperties: boolean(
        input.showProperties,
        this.defaultValue.showProperties
      ),
      showEvents: boolean(input.showEvents, this.defaultValue.showEvents),
      showOperators: boolean(
        input.showOperators,
        this.defaultValue.showOperators
      ),
      showUnits: boolean(input.showUnits, this.defaultValue.showUnits),
      showValues: boolean(input.showValues, this.defaultValue.showValues),
      showConstants: boolean(
        input.showConstants,
        this.defaultValue.showConstants
      ),
      showEnums: boolean(input.showEnums, this.defaultValue.showEnums),
      showEnumMembers: boolean(
        input.showEnumMembers,
        this.defaultValue.showEnumMembers
      ),
      showKeywords: boolean(
        input.showKeywords,
        this.defaultValue.showKeywords
      ),
      showWords: boolean(input.showWords, this.defaultValue.showWords),
      showColors: boolean(input.showColors, this.defaultValue.showColors),
      showFiles: boolean(input.showFiles, this.defaultValue.showFiles),
      showReferences: boolean(
        input.showReferences,
        this.defaultValue.showReferences
      ),
      showFolders: boolean(
        input.showFolders,
        this.defaultValue.showFolders
      ),
      showTypeParameters: boolean(
        input.showTypeParameters,
        this.defaultValue.showTypeParameters
      ),
      showSnippets: boolean(
        input.showSnippets,
        this.defaultValue.showSnippets
      ),
      showUsers: boolean(input.showUsers, this.defaultValue.showUsers),
      showIssues: boolean(input.showIssues, this.defaultValue.showIssues)
    };
  }
}
class SmartSelect extends BaseEditorOption {
  static {
    __name(this, "SmartSelect");
  }
  constructor() {
    super(
      116 /* smartSelect */,
      "smartSelect",
      {
        selectLeadingAndTrailingWhitespace: true,
        selectSubwords: true
      },
      {
        "editor.smartSelect.selectLeadingAndTrailingWhitespace": {
          description: nls.localize(
            "selectLeadingAndTrailingWhitespace",
            "Whether leading and trailing whitespace should always be selected."
          ),
          default: true,
          type: "boolean"
        },
        "editor.smartSelect.selectSubwords": {
          description: nls.localize(
            "selectSubwords",
            "Whether subwords (like 'foo' in 'fooBar' or 'foo_bar') should be selected."
          ),
          default: true,
          type: "boolean"
        }
      }
    );
  }
  validate(input) {
    if (!input || typeof input !== "object") {
      return this.defaultValue;
    }
    return {
      selectLeadingAndTrailingWhitespace: boolean(
        input.selectLeadingAndTrailingWhitespace,
        this.defaultValue.selectLeadingAndTrailingWhitespace
      ),
      selectSubwords: boolean(
        input.selectSubwords,
        this.defaultValue.selectSubwords
      )
    };
  }
}
class WordSegmenterLocales extends BaseEditorOption {
  static {
    __name(this, "WordSegmenterLocales");
  }
  constructor() {
    const defaults = [];
    super(
      133 /* wordSegmenterLocales */,
      "wordSegmenterLocales",
      defaults,
      {
        anyOf: [
          {
            description: nls.localize(
              "wordSegmenterLocales",
              "Locales to be used for word segmentation when doing word related navigations or operations. Specify the BCP 47 language tag of the word you wish to recognize (e.g., ja, zh-CN, zh-Hant-TW, etc.)."
            ),
            type: "string"
          },
          {
            description: nls.localize(
              "wordSegmenterLocales",
              "Locales to be used for word segmentation when doing word related navigations or operations. Specify the BCP 47 language tag of the word you wish to recognize (e.g., ja, zh-CN, zh-Hant-TW, etc.)."
            ),
            type: "array",
            items: {
              type: "string"
            }
          }
        ]
      }
    );
  }
  validate(input) {
    if (typeof input === "string") {
      input = [input];
    }
    if (Array.isArray(input)) {
      const validLocales = [];
      for (const locale of input) {
        if (typeof locale === "string") {
          try {
            if (Intl.Segmenter.supportedLocalesOf(locale).length > 0) {
              validLocales.push(locale);
            }
          } catch {
          }
        }
      }
      return validLocales;
    }
    return this.defaultValue;
  }
}
var WrappingIndent = /* @__PURE__ */ ((WrappingIndent2) => {
  WrappingIndent2[WrappingIndent2["None"] = 0] = "None";
  WrappingIndent2[WrappingIndent2["Same"] = 1] = "Same";
  WrappingIndent2[WrappingIndent2["Indent"] = 2] = "Indent";
  WrappingIndent2[WrappingIndent2["DeepIndent"] = 3] = "DeepIndent";
  return WrappingIndent2;
})(WrappingIndent || {});
class WrappingIndentOption extends BaseEditorOption {
  static {
    __name(this, "WrappingIndentOption");
  }
  constructor() {
    super(
      141 /* wrappingIndent */,
      "wrappingIndent",
      1 /* Same */,
      {
        "editor.wrappingIndent": {
          type: "string",
          enum: ["none", "same", "indent", "deepIndent"],
          enumDescriptions: [
            nls.localize(
              "wrappingIndent.none",
              "No indentation. Wrapped lines begin at column 1."
            ),
            nls.localize(
              "wrappingIndent.same",
              "Wrapped lines get the same indentation as the parent."
            ),
            nls.localize(
              "wrappingIndent.indent",
              "Wrapped lines get +1 indentation toward the parent."
            ),
            nls.localize(
              "wrappingIndent.deepIndent",
              "Wrapped lines get +2 indentation toward the parent."
            )
          ],
          description: nls.localize(
            "wrappingIndent",
            "Controls the indentation of wrapped lines."
          ),
          default: "same"
        }
      }
    );
  }
  validate(input) {
    switch (input) {
      case "none":
        return 0 /* None */;
      case "same":
        return 1 /* Same */;
      case "indent":
        return 2 /* Indent */;
      case "deepIndent":
        return 3 /* DeepIndent */;
    }
    return 1 /* Same */;
  }
  compute(env, options, value) {
    const accessibilitySupport = options.get(
      2 /* accessibilitySupport */
    );
    if (accessibilitySupport === AccessibilitySupport.Enabled) {
      return 0 /* None */;
    }
    return value;
  }
}
class EditorWrappingInfoComputer extends ComputedEditorOption {
  static {
    __name(this, "EditorWrappingInfoComputer");
  }
  constructor() {
    super(149 /* wrappingInfo */);
  }
  compute(env, options, _) {
    const layoutInfo = options.get(148 /* layoutInfo */);
    return {
      isDominatedByLongLines: env.isDominatedByLongLines,
      isWordWrapMinified: layoutInfo.isWordWrapMinified,
      isViewportWrapping: layoutInfo.isViewportWrapping,
      wrappingColumn: layoutInfo.wrappingColumn
    };
  }
}
class EditorDropIntoEditor extends BaseEditorOption {
  static {
    __name(this, "EditorDropIntoEditor");
  }
  constructor() {
    const defaults = {
      enabled: true,
      showDropSelector: "afterDrop"
    };
    super(36 /* dropIntoEditor */, "dropIntoEditor", defaults, {
      "editor.dropIntoEditor.enabled": {
        type: "boolean",
        default: defaults.enabled,
        markdownDescription: nls.localize(
          "dropIntoEditor.enabled",
          "Controls whether you can drag and drop a file into a text editor by holding down the `Shift` key (instead of opening the file in an editor)."
        )
      },
      "editor.dropIntoEditor.showDropSelector": {
        type: "string",
        markdownDescription: nls.localize(
          "dropIntoEditor.showDropSelector",
          "Controls if a widget is shown when dropping files into the editor. This widget lets you control how the file is dropped."
        ),
        enum: ["afterDrop", "never"],
        enumDescriptions: [
          nls.localize(
            "dropIntoEditor.showDropSelector.afterDrop",
            "Show the drop selector widget after a file is dropped into the editor."
          ),
          nls.localize(
            "dropIntoEditor.showDropSelector.never",
            "Never show the drop selector widget. Instead the default drop provider is always used."
          )
        ],
        default: "afterDrop"
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      showDropSelector: stringSet(
        input.showDropSelector,
        this.defaultValue.showDropSelector,
        ["afterDrop", "never"]
      )
    };
  }
}
class EditorPasteAs extends BaseEditorOption {
  static {
    __name(this, "EditorPasteAs");
  }
  constructor() {
    const defaults = {
      enabled: true,
      showPasteSelector: "afterPaste"
    };
    super(87 /* pasteAs */, "pasteAs", defaults, {
      "editor.pasteAs.enabled": {
        type: "boolean",
        default: defaults.enabled,
        markdownDescription: nls.localize(
          "pasteAs.enabled",
          "Controls whether you can paste content in different ways."
        )
      },
      "editor.pasteAs.showPasteSelector": {
        type: "string",
        markdownDescription: nls.localize(
          "pasteAs.showPasteSelector",
          "Controls if a widget is shown when pasting content in to the editor. This widget lets you control how the file is pasted."
        ),
        enum: ["afterPaste", "never"],
        enumDescriptions: [
          nls.localize(
            "pasteAs.showPasteSelector.afterPaste",
            "Show the paste selector widget after content is pasted into the editor."
          ),
          nls.localize(
            "pasteAs.showPasteSelector.never",
            "Never show the paste selector widget. Instead the default pasting behavior is always used."
          )
        ],
        default: "afterPaste"
      }
    });
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      showPasteSelector: stringSet(
        input.showPasteSelector,
        this.defaultValue.showPasteSelector,
        ["afterPaste", "never"]
      )
    };
  }
}
const DEFAULT_WINDOWS_FONT_FAMILY = "Consolas, 'Courier New', monospace";
const DEFAULT_MAC_FONT_FAMILY = "Menlo, Monaco, 'Courier New', monospace";
const DEFAULT_LINUX_FONT_FAMILY = "'Droid Sans Mono', 'monospace', monospace";
const EDITOR_FONT_DEFAULTS = {
  fontFamily: platform.isMacintosh ? DEFAULT_MAC_FONT_FAMILY : platform.isLinux ? DEFAULT_LINUX_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY,
  fontWeight: "normal",
  fontSize: platform.isMacintosh ? 12 : 14,
  lineHeight: 0,
  letterSpacing: 0
};
const editorOptionsRegistry = [];
function register(option) {
  editorOptionsRegistry[option.id] = option;
  return option;
}
__name(register, "register");
var EditorOption = /* @__PURE__ */ ((EditorOption2) => {
  EditorOption2[EditorOption2["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
  EditorOption2[EditorOption2["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
  EditorOption2[EditorOption2["accessibilitySupport"] = 2] = "accessibilitySupport";
  EditorOption2[EditorOption2["accessibilityPageSize"] = 3] = "accessibilityPageSize";
  EditorOption2[EditorOption2["ariaLabel"] = 4] = "ariaLabel";
  EditorOption2[EditorOption2["ariaRequired"] = 5] = "ariaRequired";
  EditorOption2[EditorOption2["autoClosingBrackets"] = 6] = "autoClosingBrackets";
  EditorOption2[EditorOption2["autoClosingComments"] = 7] = "autoClosingComments";
  EditorOption2[EditorOption2["screenReaderAnnounceInlineSuggestion"] = 8] = "screenReaderAnnounceInlineSuggestion";
  EditorOption2[EditorOption2["autoClosingDelete"] = 9] = "autoClosingDelete";
  EditorOption2[EditorOption2["autoClosingOvertype"] = 10] = "autoClosingOvertype";
  EditorOption2[EditorOption2["autoClosingQuotes"] = 11] = "autoClosingQuotes";
  EditorOption2[EditorOption2["autoIndent"] = 12] = "autoIndent";
  EditorOption2[EditorOption2["automaticLayout"] = 13] = "automaticLayout";
  EditorOption2[EditorOption2["autoSurround"] = 14] = "autoSurround";
  EditorOption2[EditorOption2["bracketPairColorization"] = 15] = "bracketPairColorization";
  EditorOption2[EditorOption2["guides"] = 16] = "guides";
  EditorOption2[EditorOption2["codeLens"] = 17] = "codeLens";
  EditorOption2[EditorOption2["codeLensFontFamily"] = 18] = "codeLensFontFamily";
  EditorOption2[EditorOption2["codeLensFontSize"] = 19] = "codeLensFontSize";
  EditorOption2[EditorOption2["colorDecorators"] = 20] = "colorDecorators";
  EditorOption2[EditorOption2["colorDecoratorsLimit"] = 21] = "colorDecoratorsLimit";
  EditorOption2[EditorOption2["columnSelection"] = 22] = "columnSelection";
  EditorOption2[EditorOption2["comments"] = 23] = "comments";
  EditorOption2[EditorOption2["contextmenu"] = 24] = "contextmenu";
  EditorOption2[EditorOption2["copyWithSyntaxHighlighting"] = 25] = "copyWithSyntaxHighlighting";
  EditorOption2[EditorOption2["cursorBlinking"] = 26] = "cursorBlinking";
  EditorOption2[EditorOption2["cursorSmoothCaretAnimation"] = 27] = "cursorSmoothCaretAnimation";
  EditorOption2[EditorOption2["cursorStyle"] = 28] = "cursorStyle";
  EditorOption2[EditorOption2["cursorSurroundingLines"] = 29] = "cursorSurroundingLines";
  EditorOption2[EditorOption2["cursorSurroundingLinesStyle"] = 30] = "cursorSurroundingLinesStyle";
  EditorOption2[EditorOption2["cursorWidth"] = 31] = "cursorWidth";
  EditorOption2[EditorOption2["disableLayerHinting"] = 32] = "disableLayerHinting";
  EditorOption2[EditorOption2["disableMonospaceOptimizations"] = 33] = "disableMonospaceOptimizations";
  EditorOption2[EditorOption2["domReadOnly"] = 34] = "domReadOnly";
  EditorOption2[EditorOption2["dragAndDrop"] = 35] = "dragAndDrop";
  EditorOption2[EditorOption2["dropIntoEditor"] = 36] = "dropIntoEditor";
  EditorOption2[EditorOption2["experimentalEditContextEnabled"] = 37] = "experimentalEditContextEnabled";
  EditorOption2[EditorOption2["emptySelectionClipboard"] = 38] = "emptySelectionClipboard";
  EditorOption2[EditorOption2["experimentalGpuAcceleration"] = 39] = "experimentalGpuAcceleration";
  EditorOption2[EditorOption2["experimentalWhitespaceRendering"] = 40] = "experimentalWhitespaceRendering";
  EditorOption2[EditorOption2["extraEditorClassName"] = 41] = "extraEditorClassName";
  EditorOption2[EditorOption2["fastScrollSensitivity"] = 42] = "fastScrollSensitivity";
  EditorOption2[EditorOption2["find"] = 43] = "find";
  EditorOption2[EditorOption2["fixedOverflowWidgets"] = 44] = "fixedOverflowWidgets";
  EditorOption2[EditorOption2["folding"] = 45] = "folding";
  EditorOption2[EditorOption2["foldingStrategy"] = 46] = "foldingStrategy";
  EditorOption2[EditorOption2["foldingHighlight"] = 47] = "foldingHighlight";
  EditorOption2[EditorOption2["foldingImportsByDefault"] = 48] = "foldingImportsByDefault";
  EditorOption2[EditorOption2["foldingMaximumRegions"] = 49] = "foldingMaximumRegions";
  EditorOption2[EditorOption2["unfoldOnClickAfterEndOfLine"] = 50] = "unfoldOnClickAfterEndOfLine";
  EditorOption2[EditorOption2["fontFamily"] = 51] = "fontFamily";
  EditorOption2[EditorOption2["fontInfo"] = 52] = "fontInfo";
  EditorOption2[EditorOption2["fontLigatures"] = 53] = "fontLigatures";
  EditorOption2[EditorOption2["fontSize"] = 54] = "fontSize";
  EditorOption2[EditorOption2["fontWeight"] = 55] = "fontWeight";
  EditorOption2[EditorOption2["fontVariations"] = 56] = "fontVariations";
  EditorOption2[EditorOption2["formatOnPaste"] = 57] = "formatOnPaste";
  EditorOption2[EditorOption2["formatOnType"] = 58] = "formatOnType";
  EditorOption2[EditorOption2["glyphMargin"] = 59] = "glyphMargin";
  EditorOption2[EditorOption2["gotoLocation"] = 60] = "gotoLocation";
  EditorOption2[EditorOption2["hideCursorInOverviewRuler"] = 61] = "hideCursorInOverviewRuler";
  EditorOption2[EditorOption2["hover"] = 62] = "hover";
  EditorOption2[EditorOption2["inDiffEditor"] = 63] = "inDiffEditor";
  EditorOption2[EditorOption2["inlineSuggest"] = 64] = "inlineSuggest";
  EditorOption2[EditorOption2["inlineEdit"] = 65] = "inlineEdit";
  EditorOption2[EditorOption2["letterSpacing"] = 66] = "letterSpacing";
  EditorOption2[EditorOption2["lightbulb"] = 67] = "lightbulb";
  EditorOption2[EditorOption2["lineDecorationsWidth"] = 68] = "lineDecorationsWidth";
  EditorOption2[EditorOption2["lineHeight"] = 69] = "lineHeight";
  EditorOption2[EditorOption2["lineNumbers"] = 70] = "lineNumbers";
  EditorOption2[EditorOption2["lineNumbersMinChars"] = 71] = "lineNumbersMinChars";
  EditorOption2[EditorOption2["linkedEditing"] = 72] = "linkedEditing";
  EditorOption2[EditorOption2["links"] = 73] = "links";
  EditorOption2[EditorOption2["matchBrackets"] = 74] = "matchBrackets";
  EditorOption2[EditorOption2["minimap"] = 75] = "minimap";
  EditorOption2[EditorOption2["mouseStyle"] = 76] = "mouseStyle";
  EditorOption2[EditorOption2["mouseWheelScrollSensitivity"] = 77] = "mouseWheelScrollSensitivity";
  EditorOption2[EditorOption2["mouseWheelZoom"] = 78] = "mouseWheelZoom";
  EditorOption2[EditorOption2["multiCursorMergeOverlapping"] = 79] = "multiCursorMergeOverlapping";
  EditorOption2[EditorOption2["multiCursorModifier"] = 80] = "multiCursorModifier";
  EditorOption2[EditorOption2["multiCursorPaste"] = 81] = "multiCursorPaste";
  EditorOption2[EditorOption2["multiCursorLimit"] = 82] = "multiCursorLimit";
  EditorOption2[EditorOption2["occurrencesHighlight"] = 83] = "occurrencesHighlight";
  EditorOption2[EditorOption2["overviewRulerBorder"] = 84] = "overviewRulerBorder";
  EditorOption2[EditorOption2["overviewRulerLanes"] = 85] = "overviewRulerLanes";
  EditorOption2[EditorOption2["padding"] = 86] = "padding";
  EditorOption2[EditorOption2["pasteAs"] = 87] = "pasteAs";
  EditorOption2[EditorOption2["parameterHints"] = 88] = "parameterHints";
  EditorOption2[EditorOption2["peekWidgetDefaultFocus"] = 89] = "peekWidgetDefaultFocus";
  EditorOption2[EditorOption2["placeholder"] = 90] = "placeholder";
  EditorOption2[EditorOption2["definitionLinkOpensInPeek"] = 91] = "definitionLinkOpensInPeek";
  EditorOption2[EditorOption2["quickSuggestions"] = 92] = "quickSuggestions";
  EditorOption2[EditorOption2["quickSuggestionsDelay"] = 93] = "quickSuggestionsDelay";
  EditorOption2[EditorOption2["readOnly"] = 94] = "readOnly";
  EditorOption2[EditorOption2["readOnlyMessage"] = 95] = "readOnlyMessage";
  EditorOption2[EditorOption2["renameOnType"] = 96] = "renameOnType";
  EditorOption2[EditorOption2["renderControlCharacters"] = 97] = "renderControlCharacters";
  EditorOption2[EditorOption2["renderFinalNewline"] = 98] = "renderFinalNewline";
  EditorOption2[EditorOption2["renderLineHighlight"] = 99] = "renderLineHighlight";
  EditorOption2[EditorOption2["renderLineHighlightOnlyWhenFocus"] = 100] = "renderLineHighlightOnlyWhenFocus";
  EditorOption2[EditorOption2["renderValidationDecorations"] = 101] = "renderValidationDecorations";
  EditorOption2[EditorOption2["renderWhitespace"] = 102] = "renderWhitespace";
  EditorOption2[EditorOption2["revealHorizontalRightPadding"] = 103] = "revealHorizontalRightPadding";
  EditorOption2[EditorOption2["roundedSelection"] = 104] = "roundedSelection";
  EditorOption2[EditorOption2["rulers"] = 105] = "rulers";
  EditorOption2[EditorOption2["scrollbar"] = 106] = "scrollbar";
  EditorOption2[EditorOption2["scrollBeyondLastColumn"] = 107] = "scrollBeyondLastColumn";
  EditorOption2[EditorOption2["scrollBeyondLastLine"] = 108] = "scrollBeyondLastLine";
  EditorOption2[EditorOption2["scrollPredominantAxis"] = 109] = "scrollPredominantAxis";
  EditorOption2[EditorOption2["selectionClipboard"] = 110] = "selectionClipboard";
  EditorOption2[EditorOption2["selectionHighlight"] = 111] = "selectionHighlight";
  EditorOption2[EditorOption2["selectOnLineNumbers"] = 112] = "selectOnLineNumbers";
  EditorOption2[EditorOption2["showFoldingControls"] = 113] = "showFoldingControls";
  EditorOption2[EditorOption2["showUnused"] = 114] = "showUnused";
  EditorOption2[EditorOption2["snippetSuggestions"] = 115] = "snippetSuggestions";
  EditorOption2[EditorOption2["smartSelect"] = 116] = "smartSelect";
  EditorOption2[EditorOption2["smoothScrolling"] = 117] = "smoothScrolling";
  EditorOption2[EditorOption2["stickyScroll"] = 118] = "stickyScroll";
  EditorOption2[EditorOption2["stickyTabStops"] = 119] = "stickyTabStops";
  EditorOption2[EditorOption2["stopRenderingLineAfter"] = 120] = "stopRenderingLineAfter";
  EditorOption2[EditorOption2["suggest"] = 121] = "suggest";
  EditorOption2[EditorOption2["suggestFontSize"] = 122] = "suggestFontSize";
  EditorOption2[EditorOption2["suggestLineHeight"] = 123] = "suggestLineHeight";
  EditorOption2[EditorOption2["suggestOnTriggerCharacters"] = 124] = "suggestOnTriggerCharacters";
  EditorOption2[EditorOption2["suggestSelection"] = 125] = "suggestSelection";
  EditorOption2[EditorOption2["tabCompletion"] = 126] = "tabCompletion";
  EditorOption2[EditorOption2["tabIndex"] = 127] = "tabIndex";
  EditorOption2[EditorOption2["unicodeHighlighting"] = 128] = "unicodeHighlighting";
  EditorOption2[EditorOption2["unusualLineTerminators"] = 129] = "unusualLineTerminators";
  EditorOption2[EditorOption2["useShadowDOM"] = 130] = "useShadowDOM";
  EditorOption2[EditorOption2["useTabStops"] = 131] = "useTabStops";
  EditorOption2[EditorOption2["wordBreak"] = 132] = "wordBreak";
  EditorOption2[EditorOption2["wordSegmenterLocales"] = 133] = "wordSegmenterLocales";
  EditorOption2[EditorOption2["wordSeparators"] = 134] = "wordSeparators";
  EditorOption2[EditorOption2["wordWrap"] = 135] = "wordWrap";
  EditorOption2[EditorOption2["wordWrapBreakAfterCharacters"] = 136] = "wordWrapBreakAfterCharacters";
  EditorOption2[EditorOption2["wordWrapBreakBeforeCharacters"] = 137] = "wordWrapBreakBeforeCharacters";
  EditorOption2[EditorOption2["wordWrapColumn"] = 138] = "wordWrapColumn";
  EditorOption2[EditorOption2["wordWrapOverride1"] = 139] = "wordWrapOverride1";
  EditorOption2[EditorOption2["wordWrapOverride2"] = 140] = "wordWrapOverride2";
  EditorOption2[EditorOption2["wrappingIndent"] = 141] = "wrappingIndent";
  EditorOption2[EditorOption2["wrappingStrategy"] = 142] = "wrappingStrategy";
  EditorOption2[EditorOption2["showDeprecated"] = 143] = "showDeprecated";
  EditorOption2[EditorOption2["inlayHints"] = 144] = "inlayHints";
  EditorOption2[EditorOption2["editorClassName"] = 145] = "editorClassName";
  EditorOption2[EditorOption2["pixelRatio"] = 146] = "pixelRatio";
  EditorOption2[EditorOption2["tabFocusMode"] = 147] = "tabFocusMode";
  EditorOption2[EditorOption2["layoutInfo"] = 148] = "layoutInfo";
  EditorOption2[EditorOption2["wrappingInfo"] = 149] = "wrappingInfo";
  EditorOption2[EditorOption2["defaultColorDecorators"] = 150] = "defaultColorDecorators";
  EditorOption2[EditorOption2["colorDecoratorsActivatedOn"] = 151] = "colorDecoratorsActivatedOn";
  EditorOption2[EditorOption2["inlineCompletionsAccessibilityVerbose"] = 152] = "inlineCompletionsAccessibilityVerbose";
  return EditorOption2;
})(EditorOption || {});
const EditorOptions = {
  acceptSuggestionOnCommitCharacter: register(
    new EditorBooleanOption(
      0 /* acceptSuggestionOnCommitCharacter */,
      "acceptSuggestionOnCommitCharacter",
      true,
      {
        markdownDescription: nls.localize(
          "acceptSuggestionOnCommitCharacter",
          "Controls whether suggestions should be accepted on commit characters. For example, in JavaScript, the semi-colon (`;`) can be a commit character that accepts a suggestion and types that character."
        )
      }
    )
  ),
  acceptSuggestionOnEnter: register(
    new EditorStringEnumOption(
      1 /* acceptSuggestionOnEnter */,
      "acceptSuggestionOnEnter",
      "on",
      ["on", "smart", "off"],
      {
        markdownEnumDescriptions: [
          "",
          nls.localize(
            "acceptSuggestionOnEnterSmart",
            "Only accept a suggestion with `Enter` when it makes a textual change."
          ),
          ""
        ],
        markdownDescription: nls.localize(
          "acceptSuggestionOnEnter",
          "Controls whether suggestions should be accepted on `Enter`, in addition to `Tab`. Helps to avoid ambiguity between inserting new lines or accepting suggestions."
        )
      }
    )
  ),
  accessibilitySupport: register(new EditorAccessibilitySupport()),
  accessibilityPageSize: register(
    new EditorIntOption(
      3 /* accessibilityPageSize */,
      "accessibilityPageSize",
      10,
      1,
      Constants.MAX_SAFE_SMALL_INTEGER,
      {
        description: nls.localize(
          "accessibilityPageSize",
          "Controls the number of lines in the editor that can be read out by a screen reader at once. When we detect a screen reader we automatically set the default to be 500. Warning: this has a performance implication for numbers larger than the default."
        ),
        tags: ["accessibility"]
      }
    )
  ),
  ariaLabel: register(
    new EditorStringOption(
      4 /* ariaLabel */,
      "ariaLabel",
      nls.localize("editorViewAccessibleLabel", "Editor content")
    )
  ),
  ariaRequired: register(
    new EditorBooleanOption(
      5 /* ariaRequired */,
      "ariaRequired",
      false,
      void 0
    )
  ),
  screenReaderAnnounceInlineSuggestion: register(
    new EditorBooleanOption(
      8 /* screenReaderAnnounceInlineSuggestion */,
      "screenReaderAnnounceInlineSuggestion",
      true,
      {
        description: nls.localize(
          "screenReaderAnnounceInlineSuggestion",
          "Control whether inline suggestions are announced by a screen reader."
        ),
        tags: ["accessibility"]
      }
    )
  ),
  autoClosingBrackets: register(
    new EditorStringEnumOption(
      6 /* autoClosingBrackets */,
      "autoClosingBrackets",
      "languageDefined",
      ["always", "languageDefined", "beforeWhitespace", "never"],
      {
        enumDescriptions: [
          "",
          nls.localize(
            "editor.autoClosingBrackets.languageDefined",
            "Use language configurations to determine when to autoclose brackets."
          ),
          nls.localize(
            "editor.autoClosingBrackets.beforeWhitespace",
            "Autoclose brackets only when the cursor is to the left of whitespace."
          ),
          ""
        ],
        description: nls.localize(
          "autoClosingBrackets",
          "Controls whether the editor should automatically close brackets after the user adds an opening bracket."
        )
      }
    )
  ),
  autoClosingComments: register(
    new EditorStringEnumOption(
      7 /* autoClosingComments */,
      "autoClosingComments",
      "languageDefined",
      ["always", "languageDefined", "beforeWhitespace", "never"],
      {
        enumDescriptions: [
          "",
          nls.localize(
            "editor.autoClosingComments.languageDefined",
            "Use language configurations to determine when to autoclose comments."
          ),
          nls.localize(
            "editor.autoClosingComments.beforeWhitespace",
            "Autoclose comments only when the cursor is to the left of whitespace."
          ),
          ""
        ],
        description: nls.localize(
          "autoClosingComments",
          "Controls whether the editor should automatically close comments after the user adds an opening comment."
        )
      }
    )
  ),
  autoClosingDelete: register(
    new EditorStringEnumOption(
      9 /* autoClosingDelete */,
      "autoClosingDelete",
      "auto",
      ["always", "auto", "never"],
      {
        enumDescriptions: [
          "",
          nls.localize(
            "editor.autoClosingDelete.auto",
            "Remove adjacent closing quotes or brackets only if they were automatically inserted."
          ),
          ""
        ],
        description: nls.localize(
          "autoClosingDelete",
          "Controls whether the editor should remove adjacent closing quotes or brackets when deleting."
        )
      }
    )
  ),
  autoClosingOvertype: register(
    new EditorStringEnumOption(
      10 /* autoClosingOvertype */,
      "autoClosingOvertype",
      "auto",
      ["always", "auto", "never"],
      {
        enumDescriptions: [
          "",
          nls.localize(
            "editor.autoClosingOvertype.auto",
            "Type over closing quotes or brackets only if they were automatically inserted."
          ),
          ""
        ],
        description: nls.localize(
          "autoClosingOvertype",
          "Controls whether the editor should type over closing quotes or brackets."
        )
      }
    )
  ),
  autoClosingQuotes: register(
    new EditorStringEnumOption(
      11 /* autoClosingQuotes */,
      "autoClosingQuotes",
      "languageDefined",
      ["always", "languageDefined", "beforeWhitespace", "never"],
      {
        enumDescriptions: [
          "",
          nls.localize(
            "editor.autoClosingQuotes.languageDefined",
            "Use language configurations to determine when to autoclose quotes."
          ),
          nls.localize(
            "editor.autoClosingQuotes.beforeWhitespace",
            "Autoclose quotes only when the cursor is to the left of whitespace."
          ),
          ""
        ],
        description: nls.localize(
          "autoClosingQuotes",
          "Controls whether the editor should automatically close quotes after the user adds an opening quote."
        )
      }
    )
  ),
  autoIndent: register(
    new EditorEnumOption(
      12 /* autoIndent */,
      "autoIndent",
      4 /* Full */,
      "full",
      ["none", "keep", "brackets", "advanced", "full"],
      _autoIndentFromString,
      {
        enumDescriptions: [
          nls.localize(
            "editor.autoIndent.none",
            "The editor will not insert indentation automatically."
          ),
          nls.localize(
            "editor.autoIndent.keep",
            "The editor will keep the current line's indentation."
          ),
          nls.localize(
            "editor.autoIndent.brackets",
            "The editor will keep the current line's indentation and honor language defined brackets."
          ),
          nls.localize(
            "editor.autoIndent.advanced",
            "The editor will keep the current line's indentation, honor language defined brackets and invoke special onEnterRules defined by languages."
          ),
          nls.localize(
            "editor.autoIndent.full",
            "The editor will keep the current line's indentation, honor language defined brackets, invoke special onEnterRules defined by languages, and honor indentationRules defined by languages."
          )
        ],
        description: nls.localize(
          "autoIndent",
          "Controls whether the editor should automatically adjust the indentation when users type, paste, move or indent lines."
        )
      }
    )
  ),
  automaticLayout: register(
    new EditorBooleanOption(
      13 /* automaticLayout */,
      "automaticLayout",
      false
    )
  ),
  autoSurround: register(
    new EditorStringEnumOption(
      14 /* autoSurround */,
      "autoSurround",
      "languageDefined",
      ["languageDefined", "quotes", "brackets", "never"],
      {
        enumDescriptions: [
          nls.localize(
            "editor.autoSurround.languageDefined",
            "Use language configurations to determine when to automatically surround selections."
          ),
          nls.localize(
            "editor.autoSurround.quotes",
            "Surround with quotes but not brackets."
          ),
          nls.localize(
            "editor.autoSurround.brackets",
            "Surround with brackets but not quotes."
          ),
          ""
        ],
        description: nls.localize(
          "autoSurround",
          "Controls whether the editor should automatically surround selections when typing quotes or brackets."
        )
      }
    )
  ),
  bracketPairColorization: register(new BracketPairColorization()),
  bracketPairGuides: register(new GuideOptions()),
  stickyTabStops: register(
    new EditorBooleanOption(
      119 /* stickyTabStops */,
      "stickyTabStops",
      false,
      {
        description: nls.localize(
          "stickyTabStops",
          "Emulate selection behavior of tab characters when using spaces for indentation. Selection will stick to tab stops."
        )
      }
    )
  ),
  codeLens: register(
    new EditorBooleanOption(17 /* codeLens */, "codeLens", true, {
      description: nls.localize(
        "codeLens",
        "Controls whether the editor shows CodeLens."
      )
    })
  ),
  codeLensFontFamily: register(
    new EditorStringOption(
      18 /* codeLensFontFamily */,
      "codeLensFontFamily",
      "",
      {
        description: nls.localize(
          "codeLensFontFamily",
          "Controls the font family for CodeLens."
        )
      }
    )
  ),
  codeLensFontSize: register(
    new EditorIntOption(
      19 /* codeLensFontSize */,
      "codeLensFontSize",
      0,
      0,
      100,
      {
        type: "number",
        default: 0,
        minimum: 0,
        maximum: 100,
        markdownDescription: nls.localize(
          "codeLensFontSize",
          "Controls the font size in pixels for CodeLens. When set to 0, 90% of `#editor.fontSize#` is used."
        )
      }
    )
  ),
  colorDecorators: register(
    new EditorBooleanOption(
      20 /* colorDecorators */,
      "colorDecorators",
      true,
      {
        description: nls.localize(
          "colorDecorators",
          "Controls whether the editor should render the inline color decorators and color picker."
        )
      }
    )
  ),
  colorDecoratorActivatedOn: register(
    new EditorStringEnumOption(
      151 /* colorDecoratorsActivatedOn */,
      "colorDecoratorsActivatedOn",
      "clickAndHover",
      ["clickAndHover", "hover", "click"],
      {
        enumDescriptions: [
          nls.localize(
            "editor.colorDecoratorActivatedOn.clickAndHover",
            "Make the color picker appear both on click and hover of the color decorator"
          ),
          nls.localize(
            "editor.colorDecoratorActivatedOn.hover",
            "Make the color picker appear on hover of the color decorator"
          ),
          nls.localize(
            "editor.colorDecoratorActivatedOn.click",
            "Make the color picker appear on click of the color decorator"
          )
        ],
        description: nls.localize(
          "colorDecoratorActivatedOn",
          "Controls the condition to make a color picker appear from a color decorator"
        )
      }
    )
  ),
  colorDecoratorsLimit: register(
    new EditorIntOption(
      21 /* colorDecoratorsLimit */,
      "colorDecoratorsLimit",
      500,
      1,
      1e6,
      {
        markdownDescription: nls.localize(
          "colorDecoratorsLimit",
          "Controls the max number of color decorators that can be rendered in an editor at once."
        )
      }
    )
  ),
  columnSelection: register(
    new EditorBooleanOption(
      22 /* columnSelection */,
      "columnSelection",
      false,
      {
        description: nls.localize(
          "columnSelection",
          "Enable that the selection with the mouse and keys is doing column selection."
        )
      }
    )
  ),
  comments: register(new EditorComments()),
  contextmenu: register(
    new EditorBooleanOption(24 /* contextmenu */, "contextmenu", true)
  ),
  copyWithSyntaxHighlighting: register(
    new EditorBooleanOption(
      25 /* copyWithSyntaxHighlighting */,
      "copyWithSyntaxHighlighting",
      true,
      {
        description: nls.localize(
          "copyWithSyntaxHighlighting",
          "Controls whether syntax highlighting should be copied into the clipboard."
        )
      }
    )
  ),
  cursorBlinking: register(
    new EditorEnumOption(
      26 /* cursorBlinking */,
      "cursorBlinking",
      1 /* Blink */,
      "blink",
      ["blink", "smooth", "phase", "expand", "solid"],
      _cursorBlinkingStyleFromString,
      {
        description: nls.localize(
          "cursorBlinking",
          "Control the cursor animation style."
        )
      }
    )
  ),
  cursorSmoothCaretAnimation: register(
    new EditorStringEnumOption(
      27 /* cursorSmoothCaretAnimation */,
      "cursorSmoothCaretAnimation",
      "off",
      ["off", "explicit", "on"],
      {
        enumDescriptions: [
          nls.localize(
            "cursorSmoothCaretAnimation.off",
            "Smooth caret animation is disabled."
          ),
          nls.localize(
            "cursorSmoothCaretAnimation.explicit",
            "Smooth caret animation is enabled only when the user moves the cursor with an explicit gesture."
          ),
          nls.localize(
            "cursorSmoothCaretAnimation.on",
            "Smooth caret animation is always enabled."
          )
        ],
        description: nls.localize(
          "cursorSmoothCaretAnimation",
          "Controls whether the smooth caret animation should be enabled."
        )
      }
    )
  ),
  cursorStyle: register(
    new EditorEnumOption(
      28 /* cursorStyle */,
      "cursorStyle",
      1 /* Line */,
      "line",
      [
        "line",
        "block",
        "underline",
        "line-thin",
        "block-outline",
        "underline-thin"
      ],
      _cursorStyleFromString,
      {
        description: nls.localize(
          "cursorStyle",
          "Controls the cursor style."
        )
      }
    )
  ),
  cursorSurroundingLines: register(
    new EditorIntOption(
      29 /* cursorSurroundingLines */,
      "cursorSurroundingLines",
      0,
      0,
      Constants.MAX_SAFE_SMALL_INTEGER,
      {
        description: nls.localize(
          "cursorSurroundingLines",
          "Controls the minimal number of visible leading lines (minimum 0) and trailing lines (minimum 1) surrounding the cursor. Known as 'scrollOff' or 'scrollOffset' in some other editors."
        )
      }
    )
  ),
  cursorSurroundingLinesStyle: register(
    new EditorStringEnumOption(
      30 /* cursorSurroundingLinesStyle */,
      "cursorSurroundingLinesStyle",
      "default",
      ["default", "all"],
      {
        enumDescriptions: [
          nls.localize(
            "cursorSurroundingLinesStyle.default",
            "`cursorSurroundingLines` is enforced only when triggered via the keyboard or API."
          ),
          nls.localize(
            "cursorSurroundingLinesStyle.all",
            "`cursorSurroundingLines` is enforced always."
          )
        ],
        markdownDescription: nls.localize(
          "cursorSurroundingLinesStyle",
          "Controls when `#editor.cursorSurroundingLines#` should be enforced."
        )
      }
    )
  ),
  cursorWidth: register(
    new EditorIntOption(
      31 /* cursorWidth */,
      "cursorWidth",
      0,
      0,
      Constants.MAX_SAFE_SMALL_INTEGER,
      {
        markdownDescription: nls.localize(
          "cursorWidth",
          "Controls the width of the cursor when `#editor.cursorStyle#` is set to `line`."
        )
      }
    )
  ),
  disableLayerHinting: register(
    new EditorBooleanOption(
      32 /* disableLayerHinting */,
      "disableLayerHinting",
      false
    )
  ),
  disableMonospaceOptimizations: register(
    new EditorBooleanOption(
      33 /* disableMonospaceOptimizations */,
      "disableMonospaceOptimizations",
      false
    )
  ),
  domReadOnly: register(
    new EditorBooleanOption(34 /* domReadOnly */, "domReadOnly", false)
  ),
  dragAndDrop: register(
    new EditorBooleanOption(35 /* dragAndDrop */, "dragAndDrop", true, {
      description: nls.localize(
        "dragAndDrop",
        "Controls whether the editor should allow moving selections via drag and drop."
      )
    })
  ),
  emptySelectionClipboard: register(new EditorEmptySelectionClipboard()),
  dropIntoEditor: register(new EditorDropIntoEditor()),
  experimentalEditContextEnabled: register(
    new EditorBooleanOption(
      37 /* experimentalEditContextEnabled */,
      "experimentalEditContextEnabled",
      false,
      {
        description: nls.localize(
          "experimentalEditContextEnabled",
          "Sets whether the new experimental edit context should be used instead of the text area."
        )
      }
    )
  ),
  stickyScroll: register(new EditorStickyScroll()),
  experimentalGpuAcceleration: register(
    new EditorStringEnumOption(
      39 /* experimentalGpuAcceleration */,
      "experimentalGpuAcceleration",
      "off",
      ["off", "on"],
      void 0
      // TODO: Uncomment when we want to expose the setting to VS Code users
      // {
      // 	enumDescriptions: [
      // 		nls.localize('experimentalGpuAcceleration.off', "Use regular DOM-based rendering."),
      // 		nls.localize('experimentalGpuAcceleration.on', "Use GPU acceleration."),
      // 	],
      // 	description: nls.localize('experimentalGpuAcceleration', "Controls whether to use the (very) experimental GPU acceleration to render the editor.")
      // }
    )
  ),
  experimentalWhitespaceRendering: register(
    new EditorStringEnumOption(
      40 /* experimentalWhitespaceRendering */,
      "experimentalWhitespaceRendering",
      "svg",
      ["svg", "font", "off"],
      {
        enumDescriptions: [
          nls.localize(
            "experimentalWhitespaceRendering.svg",
            "Use a new rendering method with svgs."
          ),
          nls.localize(
            "experimentalWhitespaceRendering.font",
            "Use a new rendering method with font characters."
          ),
          nls.localize(
            "experimentalWhitespaceRendering.off",
            "Use the stable rendering method."
          )
        ],
        description: nls.localize(
          "experimentalWhitespaceRendering",
          "Controls whether whitespace is rendered with a new, experimental method."
        )
      }
    )
  ),
  extraEditorClassName: register(
    new EditorStringOption(
      41 /* extraEditorClassName */,
      "extraEditorClassName",
      ""
    )
  ),
  fastScrollSensitivity: register(
    new EditorFloatOption(
      42 /* fastScrollSensitivity */,
      "fastScrollSensitivity",
      5,
      (x) => x <= 0 ? 5 : x,
      {
        markdownDescription: nls.localize(
          "fastScrollSensitivity",
          "Scrolling speed multiplier when pressing `Alt`."
        )
      }
    )
  ),
  find: register(new EditorFind()),
  fixedOverflowWidgets: register(
    new EditorBooleanOption(
      44 /* fixedOverflowWidgets */,
      "fixedOverflowWidgets",
      false
    )
  ),
  folding: register(
    new EditorBooleanOption(45 /* folding */, "folding", true, {
      description: nls.localize(
        "folding",
        "Controls whether the editor has code folding enabled."
      )
    })
  ),
  foldingStrategy: register(
    new EditorStringEnumOption(
      46 /* foldingStrategy */,
      "foldingStrategy",
      "auto",
      ["auto", "indentation"],
      {
        enumDescriptions: [
          nls.localize(
            "foldingStrategy.auto",
            "Use a language-specific folding strategy if available, else the indentation-based one."
          ),
          nls.localize(
            "foldingStrategy.indentation",
            "Use the indentation-based folding strategy."
          )
        ],
        description: nls.localize(
          "foldingStrategy",
          "Controls the strategy for computing folding ranges."
        )
      }
    )
  ),
  foldingHighlight: register(
    new EditorBooleanOption(
      47 /* foldingHighlight */,
      "foldingHighlight",
      true,
      {
        description: nls.localize(
          "foldingHighlight",
          "Controls whether the editor should highlight folded ranges."
        )
      }
    )
  ),
  foldingImportsByDefault: register(
    new EditorBooleanOption(
      48 /* foldingImportsByDefault */,
      "foldingImportsByDefault",
      false,
      {
        description: nls.localize(
          "foldingImportsByDefault",
          "Controls whether the editor automatically collapses import ranges."
        )
      }
    )
  ),
  foldingMaximumRegions: register(
    new EditorIntOption(
      49 /* foldingMaximumRegions */,
      "foldingMaximumRegions",
      5e3,
      10,
      65e3,
      // limit must be less than foldingRanges MAX_FOLDING_REGIONS
      {
        description: nls.localize(
          "foldingMaximumRegions",
          "The maximum number of foldable regions. Increasing this value may result in the editor becoming less responsive when the current source has a large number of foldable regions."
        )
      }
    )
  ),
  unfoldOnClickAfterEndOfLine: register(
    new EditorBooleanOption(
      50 /* unfoldOnClickAfterEndOfLine */,
      "unfoldOnClickAfterEndOfLine",
      false,
      {
        description: nls.localize(
          "unfoldOnClickAfterEndOfLine",
          "Controls whether clicking on the empty content after a folded line will unfold the line."
        )
      }
    )
  ),
  fontFamily: register(
    new EditorStringOption(
      51 /* fontFamily */,
      "fontFamily",
      EDITOR_FONT_DEFAULTS.fontFamily,
      {
        description: nls.localize(
          "fontFamily",
          "Controls the font family."
        )
      }
    )
  ),
  fontInfo: register(new EditorFontInfo()),
  fontLigatures2: register(new EditorFontLigatures()),
  fontSize: register(new EditorFontSize()),
  fontWeight: register(new EditorFontWeight()),
  fontVariations: register(new EditorFontVariations()),
  formatOnPaste: register(
    new EditorBooleanOption(
      57 /* formatOnPaste */,
      "formatOnPaste",
      false,
      {
        description: nls.localize(
          "formatOnPaste",
          "Controls whether the editor should automatically format the pasted content. A formatter must be available and the formatter should be able to format a range in a document."
        )
      }
    )
  ),
  formatOnType: register(
    new EditorBooleanOption(
      58 /* formatOnType */,
      "formatOnType",
      false,
      {
        description: nls.localize(
          "formatOnType",
          "Controls whether the editor should automatically format the line after typing."
        )
      }
    )
  ),
  glyphMargin: register(
    new EditorBooleanOption(59 /* glyphMargin */, "glyphMargin", true, {
      description: nls.localize(
        "glyphMargin",
        "Controls whether the editor should render the vertical glyph margin. Glyph margin is mostly used for debugging."
      )
    })
  ),
  gotoLocation: register(new EditorGoToLocation()),
  hideCursorInOverviewRuler: register(
    new EditorBooleanOption(
      61 /* hideCursorInOverviewRuler */,
      "hideCursorInOverviewRuler",
      false,
      {
        description: nls.localize(
          "hideCursorInOverviewRuler",
          "Controls whether the cursor should be hidden in the overview ruler."
        )
      }
    )
  ),
  hover: register(new EditorHover()),
  inDiffEditor: register(
    new EditorBooleanOption(
      63 /* inDiffEditor */,
      "inDiffEditor",
      false
    )
  ),
  letterSpacing: register(
    new EditorFloatOption(
      66 /* letterSpacing */,
      "letterSpacing",
      EDITOR_FONT_DEFAULTS.letterSpacing,
      (x) => EditorFloatOption.clamp(x, -5, 20),
      {
        description: nls.localize(
          "letterSpacing",
          "Controls the letter spacing in pixels."
        )
      }
    )
  ),
  lightbulb: register(new EditorLightbulb()),
  lineDecorationsWidth: register(new EditorLineDecorationsWidth()),
  lineHeight: register(new EditorLineHeight()),
  lineNumbers: register(new EditorRenderLineNumbersOption()),
  lineNumbersMinChars: register(
    new EditorIntOption(
      71 /* lineNumbersMinChars */,
      "lineNumbersMinChars",
      5,
      1,
      300
    )
  ),
  linkedEditing: register(
    new EditorBooleanOption(
      72 /* linkedEditing */,
      "linkedEditing",
      false,
      {
        description: nls.localize(
          "linkedEditing",
          "Controls whether the editor has linked editing enabled. Depending on the language, related symbols such as HTML tags, are updated while editing."
        )
      }
    )
  ),
  links: register(
    new EditorBooleanOption(73 /* links */, "links", true, {
      description: nls.localize(
        "links",
        "Controls whether the editor should detect links and make them clickable."
      )
    })
  ),
  matchBrackets: register(
    new EditorStringEnumOption(
      74 /* matchBrackets */,
      "matchBrackets",
      "always",
      ["always", "near", "never"],
      {
        description: nls.localize(
          "matchBrackets",
          "Highlight matching brackets."
        )
      }
    )
  ),
  minimap: register(new EditorMinimap()),
  mouseStyle: register(
    new EditorStringEnumOption(
      76 /* mouseStyle */,
      "mouseStyle",
      "text",
      ["text", "default", "copy"]
    )
  ),
  mouseWheelScrollSensitivity: register(
    new EditorFloatOption(
      77 /* mouseWheelScrollSensitivity */,
      "mouseWheelScrollSensitivity",
      1,
      (x) => x === 0 ? 1 : x,
      {
        markdownDescription: nls.localize(
          "mouseWheelScrollSensitivity",
          "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events."
        )
      }
    )
  ),
  mouseWheelZoom: register(
    new EditorBooleanOption(
      78 /* mouseWheelZoom */,
      "mouseWheelZoom",
      false,
      {
        markdownDescription: platform.isMacintosh ? nls.localize(
          "mouseWheelZoom.mac",
          "Zoom the font of the editor when using mouse wheel and holding `Cmd`."
        ) : nls.localize(
          "mouseWheelZoom",
          "Zoom the font of the editor when using mouse wheel and holding `Ctrl`."
        )
      }
    )
  ),
  multiCursorMergeOverlapping: register(
    new EditorBooleanOption(
      79 /* multiCursorMergeOverlapping */,
      "multiCursorMergeOverlapping",
      true,
      {
        description: nls.localize(
          "multiCursorMergeOverlapping",
          "Merge multiple cursors when they are overlapping."
        )
      }
    )
  ),
  multiCursorModifier: register(
    new EditorEnumOption(
      80 /* multiCursorModifier */,
      "multiCursorModifier",
      "altKey",
      "alt",
      ["ctrlCmd", "alt"],
      _multiCursorModifierFromString,
      {
        markdownEnumDescriptions: [
          nls.localize(
            "multiCursorModifier.ctrlCmd",
            "Maps to `Control` on Windows and Linux and to `Command` on macOS."
          ),
          nls.localize(
            "multiCursorModifier.alt",
            "Maps to `Alt` on Windows and Linux and to `Option` on macOS."
          )
        ],
        markdownDescription: nls.localize(
          {
            key: "multiCursorModifier",
            comment: [
              "- `ctrlCmd` refers to a value the setting can take and should not be localized.",
              "- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized."
            ]
          },
          "The modifier to be used to add multiple cursors with the mouse. The Go to Definition and Open Link mouse gestures will adapt such that they do not conflict with the [multicursor modifier](https://code.visualstudio.com/docs/editor/codebasics#_multicursor-modifier)."
        )
      }
    )
  ),
  multiCursorPaste: register(
    new EditorStringEnumOption(
      81 /* multiCursorPaste */,
      "multiCursorPaste",
      "spread",
      ["spread", "full"],
      {
        markdownEnumDescriptions: [
          nls.localize(
            "multiCursorPaste.spread",
            "Each cursor pastes a single line of the text."
          ),
          nls.localize(
            "multiCursorPaste.full",
            "Each cursor pastes the full text."
          )
        ],
        markdownDescription: nls.localize(
          "multiCursorPaste",
          "Controls pasting when the line count of the pasted text matches the cursor count."
        )
      }
    )
  ),
  multiCursorLimit: register(
    new EditorIntOption(
      82 /* multiCursorLimit */,
      "multiCursorLimit",
      1e4,
      1,
      1e5,
      {
        markdownDescription: nls.localize(
          "multiCursorLimit",
          "Controls the max number of cursors that can be in an active editor at once."
        )
      }
    )
  ),
  occurrencesHighlight: register(
    new EditorStringEnumOption(
      83 /* occurrencesHighlight */,
      "occurrencesHighlight",
      "singleFile",
      ["off", "singleFile", "multiFile"],
      {
        markdownEnumDescriptions: [
          nls.localize(
            "occurrencesHighlight.off",
            "Does not highlight occurrences."
          ),
          nls.localize(
            "occurrencesHighlight.singleFile",
            "Highlights occurrences only in the current file."
          ),
          nls.localize(
            "occurrencesHighlight.multiFile",
            "Experimental: Highlights occurrences across all valid open files."
          )
        ],
        markdownDescription: nls.localize(
          "occurrencesHighlight",
          "Controls whether occurrences should be highlighted across open files."
        )
      }
    )
  ),
  overviewRulerBorder: register(
    new EditorBooleanOption(
      84 /* overviewRulerBorder */,
      "overviewRulerBorder",
      true,
      {
        description: nls.localize(
          "overviewRulerBorder",
          "Controls whether a border should be drawn around the overview ruler."
        )
      }
    )
  ),
  overviewRulerLanes: register(
    new EditorIntOption(
      85 /* overviewRulerLanes */,
      "overviewRulerLanes",
      3,
      0,
      3
    )
  ),
  padding: register(new EditorPadding()),
  pasteAs: register(new EditorPasteAs()),
  parameterHints: register(new EditorParameterHints()),
  peekWidgetDefaultFocus: register(
    new EditorStringEnumOption(
      89 /* peekWidgetDefaultFocus */,
      "peekWidgetDefaultFocus",
      "tree",
      ["tree", "editor"],
      {
        enumDescriptions: [
          nls.localize(
            "peekWidgetDefaultFocus.tree",
            "Focus the tree when opening peek"
          ),
          nls.localize(
            "peekWidgetDefaultFocus.editor",
            "Focus the editor when opening peek"
          )
        ],
        description: nls.localize(
          "peekWidgetDefaultFocus",
          "Controls whether to focus the inline editor or the tree in the peek widget."
        )
      }
    )
  ),
  placeholder: register(new PlaceholderOption()),
  definitionLinkOpensInPeek: register(
    new EditorBooleanOption(
      91 /* definitionLinkOpensInPeek */,
      "definitionLinkOpensInPeek",
      false,
      {
        description: nls.localize(
          "definitionLinkOpensInPeek",
          "Controls whether the Go to Definition mouse gesture always opens the peek widget."
        )
      }
    )
  ),
  quickSuggestions: register(new EditorQuickSuggestions()),
  quickSuggestionsDelay: register(
    new EditorIntOption(
      93 /* quickSuggestionsDelay */,
      "quickSuggestionsDelay",
      10,
      0,
      Constants.MAX_SAFE_SMALL_INTEGER,
      {
        description: nls.localize(
          "quickSuggestionsDelay",
          "Controls the delay in milliseconds after which quick suggestions will show up."
        )
      }
    )
  ),
  readOnly: register(
    new EditorBooleanOption(94 /* readOnly */, "readOnly", false)
  ),
  readOnlyMessage: register(new ReadonlyMessage()),
  renameOnType: register(
    new EditorBooleanOption(
      96 /* renameOnType */,
      "renameOnType",
      false,
      {
        description: nls.localize(
          "renameOnType",
          "Controls whether the editor auto renames on type."
        ),
        markdownDeprecationMessage: nls.localize(
          "renameOnTypeDeprecate",
          "Deprecated, use `editor.linkedEditing` instead."
        )
      }
    )
  ),
  renderControlCharacters: register(
    new EditorBooleanOption(
      97 /* renderControlCharacters */,
      "renderControlCharacters",
      true,
      {
        description: nls.localize(
          "renderControlCharacters",
          "Controls whether the editor should render control characters."
        ),
        restricted: true
      }
    )
  ),
  renderFinalNewline: register(
    new EditorStringEnumOption(
      98 /* renderFinalNewline */,
      "renderFinalNewline",
      platform.isLinux ? "dimmed" : "on",
      ["off", "on", "dimmed"],
      {
        description: nls.localize(
          "renderFinalNewline",
          "Render last line number when the file ends with a newline."
        )
      }
    )
  ),
  renderLineHighlight: register(
    new EditorStringEnumOption(
      99 /* renderLineHighlight */,
      "renderLineHighlight",
      "line",
      ["none", "gutter", "line", "all"],
      {
        enumDescriptions: [
          "",
          "",
          "",
          nls.localize(
            "renderLineHighlight.all",
            "Highlights both the gutter and the current line."
          )
        ],
        description: nls.localize(
          "renderLineHighlight",
          "Controls how the editor should render the current line highlight."
        )
      }
    )
  ),
  renderLineHighlightOnlyWhenFocus: register(
    new EditorBooleanOption(
      100 /* renderLineHighlightOnlyWhenFocus */,
      "renderLineHighlightOnlyWhenFocus",
      false,
      {
        description: nls.localize(
          "renderLineHighlightOnlyWhenFocus",
          "Controls if the editor should render the current line highlight only when the editor is focused."
        )
      }
    )
  ),
  renderValidationDecorations: register(
    new EditorStringEnumOption(
      101 /* renderValidationDecorations */,
      "renderValidationDecorations",
      "editable",
      ["editable", "on", "off"]
    )
  ),
  renderWhitespace: register(
    new EditorStringEnumOption(
      102 /* renderWhitespace */,
      "renderWhitespace",
      "selection",
      ["none", "boundary", "selection", "trailing", "all"],
      {
        enumDescriptions: [
          "",
          nls.localize(
            "renderWhitespace.boundary",
            "Render whitespace characters except for single spaces between words."
          ),
          nls.localize(
            "renderWhitespace.selection",
            "Render whitespace characters only on selected text."
          ),
          nls.localize(
            "renderWhitespace.trailing",
            "Render only trailing whitespace characters."
          ),
          ""
        ],
        description: nls.localize(
          "renderWhitespace",
          "Controls how the editor should render whitespace characters."
        )
      }
    )
  ),
  revealHorizontalRightPadding: register(
    new EditorIntOption(
      103 /* revealHorizontalRightPadding */,
      "revealHorizontalRightPadding",
      15,
      0,
      1e3
    )
  ),
  roundedSelection: register(
    new EditorBooleanOption(
      104 /* roundedSelection */,
      "roundedSelection",
      true,
      {
        description: nls.localize(
          "roundedSelection",
          "Controls whether selections should have rounded corners."
        )
      }
    )
  ),
  rulers: register(new EditorRulers()),
  scrollbar: register(new EditorScrollbar()),
  scrollBeyondLastColumn: register(
    new EditorIntOption(
      107 /* scrollBeyondLastColumn */,
      "scrollBeyondLastColumn",
      4,
      0,
      Constants.MAX_SAFE_SMALL_INTEGER,
      {
        description: nls.localize(
          "scrollBeyondLastColumn",
          "Controls the number of extra characters beyond which the editor will scroll horizontally."
        )
      }
    )
  ),
  scrollBeyondLastLine: register(
    new EditorBooleanOption(
      108 /* scrollBeyondLastLine */,
      "scrollBeyondLastLine",
      true,
      {
        description: nls.localize(
          "scrollBeyondLastLine",
          "Controls whether the editor will scroll beyond the last line."
        )
      }
    )
  ),
  scrollPredominantAxis: register(
    new EditorBooleanOption(
      109 /* scrollPredominantAxis */,
      "scrollPredominantAxis",
      true,
      {
        description: nls.localize(
          "scrollPredominantAxis",
          "Scroll only along the predominant axis when scrolling both vertically and horizontally at the same time. Prevents horizontal drift when scrolling vertically on a trackpad."
        )
      }
    )
  ),
  selectionClipboard: register(
    new EditorBooleanOption(
      110 /* selectionClipboard */,
      "selectionClipboard",
      true,
      {
        description: nls.localize(
          "selectionClipboard",
          "Controls whether the Linux primary clipboard should be supported."
        ),
        included: platform.isLinux
      }
    )
  ),
  selectionHighlight: register(
    new EditorBooleanOption(
      111 /* selectionHighlight */,
      "selectionHighlight",
      true,
      {
        description: nls.localize(
          "selectionHighlight",
          "Controls whether the editor should highlight matches similar to the selection."
        )
      }
    )
  ),
  selectOnLineNumbers: register(
    new EditorBooleanOption(
      112 /* selectOnLineNumbers */,
      "selectOnLineNumbers",
      true
    )
  ),
  showFoldingControls: register(
    new EditorStringEnumOption(
      113 /* showFoldingControls */,
      "showFoldingControls",
      "mouseover",
      ["always", "never", "mouseover"],
      {
        enumDescriptions: [
          nls.localize(
            "showFoldingControls.always",
            "Always show the folding controls."
          ),
          nls.localize(
            "showFoldingControls.never",
            "Never show the folding controls and reduce the gutter size."
          ),
          nls.localize(
            "showFoldingControls.mouseover",
            "Only show the folding controls when the mouse is over the gutter."
          )
        ],
        description: nls.localize(
          "showFoldingControls",
          "Controls when the folding controls on the gutter are shown."
        )
      }
    )
  ),
  showUnused: register(
    new EditorBooleanOption(114 /* showUnused */, "showUnused", true, {
      description: nls.localize(
        "showUnused",
        "Controls fading out of unused code."
      )
    })
  ),
  showDeprecated: register(
    new EditorBooleanOption(
      143 /* showDeprecated */,
      "showDeprecated",
      true,
      {
        description: nls.localize(
          "showDeprecated",
          "Controls strikethrough deprecated variables."
        )
      }
    )
  ),
  inlayHints: register(new EditorInlayHints()),
  snippetSuggestions: register(
    new EditorStringEnumOption(
      115 /* snippetSuggestions */,
      "snippetSuggestions",
      "inline",
      ["top", "bottom", "inline", "none"],
      {
        enumDescriptions: [
          nls.localize(
            "snippetSuggestions.top",
            "Show snippet suggestions on top of other suggestions."
          ),
          nls.localize(
            "snippetSuggestions.bottom",
            "Show snippet suggestions below other suggestions."
          ),
          nls.localize(
            "snippetSuggestions.inline",
            "Show snippets suggestions with other suggestions."
          ),
          nls.localize(
            "snippetSuggestions.none",
            "Do not show snippet suggestions."
          )
        ],
        description: nls.localize(
          "snippetSuggestions",
          "Controls whether snippets are shown with other suggestions and how they are sorted."
        )
      }
    )
  ),
  smartSelect: register(new SmartSelect()),
  smoothScrolling: register(
    new EditorBooleanOption(
      117 /* smoothScrolling */,
      "smoothScrolling",
      false,
      {
        description: nls.localize(
          "smoothScrolling",
          "Controls whether the editor will scroll using an animation."
        )
      }
    )
  ),
  stopRenderingLineAfter: register(
    new EditorIntOption(
      120 /* stopRenderingLineAfter */,
      "stopRenderingLineAfter",
      1e4,
      -1,
      Constants.MAX_SAFE_SMALL_INTEGER
    )
  ),
  suggest: register(new EditorSuggest()),
  inlineSuggest: register(new InlineEditorSuggest()),
  inlineEdit: register(new InlineEditorEdit()),
  inlineCompletionsAccessibilityVerbose: register(
    new EditorBooleanOption(
      152 /* inlineCompletionsAccessibilityVerbose */,
      "inlineCompletionsAccessibilityVerbose",
      false,
      {
        description: nls.localize(
          "inlineCompletionsAccessibilityVerbose",
          "Controls whether the accessibility hint should be provided to screen reader users when an inline completion is shown."
        )
      }
    )
  ),
  suggestFontSize: register(
    new EditorIntOption(
      122 /* suggestFontSize */,
      "suggestFontSize",
      0,
      0,
      1e3,
      {
        markdownDescription: nls.localize(
          "suggestFontSize",
          "Font size for the suggest widget. When set to {0}, the value of {1} is used.",
          "`0`",
          "`#editor.fontSize#`"
        )
      }
    )
  ),
  suggestLineHeight: register(
    new EditorIntOption(
      123 /* suggestLineHeight */,
      "suggestLineHeight",
      0,
      0,
      1e3,
      {
        markdownDescription: nls.localize(
          "suggestLineHeight",
          "Line height for the suggest widget. When set to {0}, the value of {1} is used. The minimum value is 8.",
          "`0`",
          "`#editor.lineHeight#`"
        )
      }
    )
  ),
  suggestOnTriggerCharacters: register(
    new EditorBooleanOption(
      124 /* suggestOnTriggerCharacters */,
      "suggestOnTriggerCharacters",
      true,
      {
        description: nls.localize(
          "suggestOnTriggerCharacters",
          "Controls whether suggestions should automatically show up when typing trigger characters."
        )
      }
    )
  ),
  suggestSelection: register(
    new EditorStringEnumOption(
      125 /* suggestSelection */,
      "suggestSelection",
      "first",
      ["first", "recentlyUsed", "recentlyUsedByPrefix"],
      {
        markdownEnumDescriptions: [
          nls.localize(
            "suggestSelection.first",
            "Always select the first suggestion."
          ),
          nls.localize(
            "suggestSelection.recentlyUsed",
            "Select recent suggestions unless further typing selects one, e.g. `console.| -> console.log` because `log` has been completed recently."
          ),
          nls.localize(
            "suggestSelection.recentlyUsedByPrefix",
            "Select suggestions based on previous prefixes that have completed those suggestions, e.g. `co -> console` and `con -> const`."
          )
        ],
        description: nls.localize(
          "suggestSelection",
          "Controls how suggestions are pre-selected when showing the suggest list."
        )
      }
    )
  ),
  tabCompletion: register(
    new EditorStringEnumOption(
      126 /* tabCompletion */,
      "tabCompletion",
      "off",
      ["on", "off", "onlySnippets"],
      {
        enumDescriptions: [
          nls.localize(
            "tabCompletion.on",
            "Tab complete will insert the best matching suggestion when pressing tab."
          ),
          nls.localize(
            "tabCompletion.off",
            "Disable tab completions."
          ),
          nls.localize(
            "tabCompletion.onlySnippets",
            "Tab complete snippets when their prefix match. Works best when 'quickSuggestions' aren't enabled."
          )
        ],
        description: nls.localize(
          "tabCompletion",
          "Enables tab completions."
        )
      }
    )
  ),
  tabIndex: register(
    new EditorIntOption(
      127 /* tabIndex */,
      "tabIndex",
      0,
      -1,
      Constants.MAX_SAFE_SMALL_INTEGER
    )
  ),
  unicodeHighlight: register(new UnicodeHighlight()),
  unusualLineTerminators: register(
    new EditorStringEnumOption(
      129 /* unusualLineTerminators */,
      "unusualLineTerminators",
      "prompt",
      ["auto", "off", "prompt"],
      {
        enumDescriptions: [
          nls.localize(
            "unusualLineTerminators.auto",
            "Unusual line terminators are automatically removed."
          ),
          nls.localize(
            "unusualLineTerminators.off",
            "Unusual line terminators are ignored."
          ),
          nls.localize(
            "unusualLineTerminators.prompt",
            "Unusual line terminators prompt to be removed."
          )
        ],
        description: nls.localize(
          "unusualLineTerminators",
          "Remove unusual line terminators that might cause problems."
        )
      }
    )
  ),
  useShadowDOM: register(
    new EditorBooleanOption(
      130 /* useShadowDOM */,
      "useShadowDOM",
      true
    )
  ),
  useTabStops: register(
    new EditorBooleanOption(131 /* useTabStops */, "useTabStops", true, {
      description: nls.localize(
        "useTabStops",
        "Spaces and tabs are inserted and deleted in alignment with tab stops."
      )
    })
  ),
  wordBreak: register(
    new EditorStringEnumOption(
      132 /* wordBreak */,
      "wordBreak",
      "normal",
      ["normal", "keepAll"],
      {
        markdownEnumDescriptions: [
          nls.localize(
            "wordBreak.normal",
            "Use the default line break rule."
          ),
          nls.localize(
            "wordBreak.keepAll",
            "Word breaks should not be used for Chinese/Japanese/Korean (CJK) text. Non-CJK text behavior is the same as for normal."
          )
        ],
        description: nls.localize(
          "wordBreak",
          "Controls the word break rules used for Chinese/Japanese/Korean (CJK) text."
        )
      }
    )
  ),
  wordSegmenterLocales: register(new WordSegmenterLocales()),
  wordSeparators: register(
    new EditorStringOption(
      134 /* wordSeparators */,
      "wordSeparators",
      USUAL_WORD_SEPARATORS,
      {
        description: nls.localize(
          "wordSeparators",
          "Characters that will be used as word separators when doing word related navigations or operations."
        )
      }
    )
  ),
  wordWrap: register(
    new EditorStringEnumOption(
      135 /* wordWrap */,
      "wordWrap",
      "off",
      ["off", "on", "wordWrapColumn", "bounded"],
      {
        markdownEnumDescriptions: [
          nls.localize("wordWrap.off", "Lines will never wrap."),
          nls.localize(
            "wordWrap.on",
            "Lines will wrap at the viewport width."
          ),
          nls.localize(
            {
              key: "wordWrap.wordWrapColumn",
              comment: [
                "- `editor.wordWrapColumn` refers to a different setting and should not be localized."
              ]
            },
            "Lines will wrap at `#editor.wordWrapColumn#`."
          ),
          nls.localize(
            {
              key: "wordWrap.bounded",
              comment: [
                "- viewport means the edge of the visible window size.",
                "- `editor.wordWrapColumn` refers to a different setting and should not be localized."
              ]
            },
            "Lines will wrap at the minimum of viewport and `#editor.wordWrapColumn#`."
          )
        ],
        description: nls.localize(
          {
            key: "wordWrap",
            comment: [
              "- 'off', 'on', 'wordWrapColumn' and 'bounded' refer to values the setting can take and should not be localized.",
              "- `editor.wordWrapColumn` refers to a different setting and should not be localized."
            ]
          },
          "Controls how lines should wrap."
        )
      }
    )
  ),
  wordWrapBreakAfterCharacters: register(
    new EditorStringOption(
      136 /* wordWrapBreakAfterCharacters */,
      "wordWrapBreakAfterCharacters",
      // allow-any-unicode-next-line
      " 	})]?|/&.,;\xA2\xB0\u2032\u2033\u2030\u2103\u3001\u3002\uFF61\uFF64\uFFE0\uFF0C\uFF0E\uFF1A\uFF1B\uFF1F\uFF01\uFF05\u30FB\uFF65\u309D\u309E\u30FD\u30FE\u30FC\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u31F0\u31F1\u31F2\u31F3\u31F4\u31F5\u31F6\u31F7\u31F8\u31F9\u31FA\u31FB\u31FC\u31FD\u31FE\u31FF\u3005\u303B\uFF67\uFF68\uFF69\uFF6A\uFF6B\uFF6C\uFF6D\uFF6E\uFF6F\uFF70\u201D\u3009\u300B\u300D\u300F\u3011\u3015\uFF09\uFF3D\uFF5D\uFF63"
    )
  ),
  wordWrapBreakBeforeCharacters: register(
    new EditorStringOption(
      137 /* wordWrapBreakBeforeCharacters */,
      "wordWrapBreakBeforeCharacters",
      // allow-any-unicode-next-line
      "([{\u2018\u201C\u3008\u300A\u300C\u300E\u3010\u3014\uFF08\uFF3B\uFF5B\uFF62\xA3\xA5\uFF04\uFFE1\uFFE5+\uFF0B"
    )
  ),
  wordWrapColumn: register(
    new EditorIntOption(
      138 /* wordWrapColumn */,
      "wordWrapColumn",
      80,
      1,
      Constants.MAX_SAFE_SMALL_INTEGER,
      {
        markdownDescription: nls.localize(
          {
            key: "wordWrapColumn",
            comment: [
              "- `editor.wordWrap` refers to a different setting and should not be localized.",
              "- 'wordWrapColumn' and 'bounded' refer to values the different setting can take and should not be localized."
            ]
          },
          "Controls the wrapping column of the editor when `#editor.wordWrap#` is `wordWrapColumn` or `bounded`."
        )
      }
    )
  ),
  wordWrapOverride1: register(
    new EditorStringEnumOption(
      139 /* wordWrapOverride1 */,
      "wordWrapOverride1",
      "inherit",
      ["off", "on", "inherit"]
    )
  ),
  wordWrapOverride2: register(
    new EditorStringEnumOption(
      140 /* wordWrapOverride2 */,
      "wordWrapOverride2",
      "inherit",
      ["off", "on", "inherit"]
    )
  ),
  // Leave these at the end (because they have dependencies!)
  editorClassName: register(new EditorClassName()),
  defaultColorDecorators: register(
    new EditorBooleanOption(
      150 /* defaultColorDecorators */,
      "defaultColorDecorators",
      false,
      {
        markdownDescription: nls.localize(
          "defaultColorDecorators",
          "Controls whether inline color decorations should be shown using the default document color provider"
        )
      }
    )
  ),
  pixelRatio: register(new EditorPixelRatio()),
  tabFocusMode: register(
    new EditorBooleanOption(
      147 /* tabFocusMode */,
      "tabFocusMode",
      false,
      {
        markdownDescription: nls.localize(
          "tabFocusMode",
          "Controls whether the editor receives tabs or defers them to the workbench for navigation."
        )
      }
    )
  ),
  layoutInfo: register(new EditorLayoutInfoComputer()),
  wrappingInfo: register(new EditorWrappingInfoComputer()),
  wrappingIndent: register(new WrappingIndentOption()),
  wrappingStrategy: register(new WrappingStrategy())
};
export {
  ApplyUpdateResult,
  ComputeOptionsMemory,
  ConfigurationChangedEvent,
  EDITOR_FONT_DEFAULTS,
  EditorAutoIndentStrategy,
  EditorFontLigatures,
  EditorFontVariations,
  EditorLayoutInfoComputer,
  EditorOption,
  EditorOptions,
  MINIMAP_GUTTER_WIDTH,
  RenderLineNumbersType,
  RenderMinimap,
  ShowLightbulbIconMode,
  TextEditorCursorBlinkingStyle,
  TextEditorCursorStyle,
  WrappingIndent,
  boolean,
  clampedFloat,
  clampedInt,
  cursorStyleToString,
  editorOptionsRegistry,
  filterValidationDecorations,
  inUntrustedWorkspace,
  stringSet,
  unicodeHighlightConfigKeys
};
//# sourceMappingURL=editorOptions.js.map
