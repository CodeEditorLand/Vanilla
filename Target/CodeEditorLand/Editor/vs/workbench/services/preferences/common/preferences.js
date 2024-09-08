import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import {
  DEFAULT_EDITOR_ASSOCIATION
} from "../../../common/editor.js";
var SettingValueType = /* @__PURE__ */ ((SettingValueType2) => {
  SettingValueType2["Null"] = "null";
  SettingValueType2["Enum"] = "enum";
  SettingValueType2["String"] = "string";
  SettingValueType2["MultilineString"] = "multiline-string";
  SettingValueType2["Integer"] = "integer";
  SettingValueType2["Number"] = "number";
  SettingValueType2["Boolean"] = "boolean";
  SettingValueType2["Array"] = "array";
  SettingValueType2["Exclude"] = "exclude";
  SettingValueType2["Include"] = "include";
  SettingValueType2["Complex"] = "complex";
  SettingValueType2["NullableInteger"] = "nullable-integer";
  SettingValueType2["NullableNumber"] = "nullable-number";
  SettingValueType2["Object"] = "object";
  SettingValueType2["BooleanObject"] = "boolean-object";
  SettingValueType2["LanguageTag"] = "language-tag";
  SettingValueType2["ExtensionToggle"] = "extension-toggle";
  return SettingValueType2;
})(SettingValueType || {});
var SettingMatchType = /* @__PURE__ */ ((SettingMatchType2) => {
  SettingMatchType2[SettingMatchType2["None"] = 0] = "None";
  SettingMatchType2[SettingMatchType2["LanguageTagSettingMatch"] = 1] = "LanguageTagSettingMatch";
  SettingMatchType2[SettingMatchType2["RemoteMatch"] = 2] = "RemoteMatch";
  SettingMatchType2[SettingMatchType2["DescriptionOrValueMatch"] = 4] = "DescriptionOrValueMatch";
  SettingMatchType2[SettingMatchType2["KeyMatch"] = 8] = "KeyMatch";
  return SettingMatchType2;
})(SettingMatchType || {});
function validateSettingsEditorOptions(options) {
  return {
    // Inherit provided options
    ...options,
    // Enforce some options for settings specifically
    override: DEFAULT_EDITOR_ASSOCIATION.id,
    pinned: true
  };
}
const IPreferencesService = createDecorator("preferencesService");
const DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = "editor.contrib.defineKeybinding";
const FOLDER_SETTINGS_PATH = ".vscode/settings.json";
const DEFAULT_SETTINGS_EDITOR_SETTING = "workbench.settings.openDefaultSettings";
const USE_SPLIT_JSON_SETTING = "workbench.settings.useSplitJSON";
const SETTINGS_AUTHORITY = "settings";
export {
  DEFAULT_SETTINGS_EDITOR_SETTING,
  DEFINE_KEYBINDING_EDITOR_CONTRIB_ID,
  FOLDER_SETTINGS_PATH,
  IPreferencesService,
  SETTINGS_AUTHORITY,
  SettingMatchType,
  SettingValueType,
  USE_SPLIT_JSON_SETTING,
  validateSettingsEditorOptions
};
