import"../../../../base/common/collections.js";import"../../../../base/common/event.js";import"../../../../base/common/filters.js";import"../../../../base/common/jsonSchema.js";import"../../../../base/common/keybindings.js";import"../../../../base/common/uri.js";import"../../../../editor/common/core/range.js";import"../../../../editor/common/editorCommon.js";import"../../../../platform/configuration/common/configuration.js";import"../../../../platform/configuration/common/configurationRegistry.js";import"../../../../platform/editor/common/editor.js";import"../../../../platform/extensions/common/extensions.js";import{createDecorator as i}from"../../../../platform/instantiation/common/instantiation.js";import"../../../../platform/keybinding/common/resolvedKeybindingItem.js";import{DEFAULT_EDITOR_ASSOCIATION as r}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import"./preferencesModels.js";var o=(e=>(e.Null="null",e.Enum="enum",e.String="string",e.MultilineString="multiline-string",e.Integer="integer",e.Number="number",e.Boolean="boolean",e.Array="array",e.Exclude="exclude",e.Include="include",e.Complex="complex",e.NullableInteger="nullable-integer",e.NullableNumber="nullable-number",e.Object="object",e.BooleanObject="boolean-object",e.LanguageTag="language-tag",e.ExtensionToggle="extension-toggle",e))(o||{}),s=(n=>(n[n.None=0]="None",n[n.LanguageTagSettingMatch=1]="LanguageTagSettingMatch",n[n.RemoteMatch=2]="RemoteMatch",n[n.DescriptionOrValueMatch=4]="DescriptionOrValueMatch",n[n.KeyMatch=8]="KeyMatch",n))(s||{});function q(t){return{...t,override:r.id,pinned:!0}}const W=i("preferencesService"),H="editor.contrib.defineKeybinding",Y=".vscode/settings.json",z="workbench.settings.openDefaultSettings",Q="workbench.settings.useSplitJSON",X="settings";export{z as DEFAULT_SETTINGS_EDITOR_SETTING,H as DEFINE_KEYBINDING_EDITOR_CONTRIB_ID,Y as FOLDER_SETTINGS_PATH,W as IPreferencesService,X as SETTINGS_AUTHORITY,s as SettingMatchType,o as SettingValueType,Q as USE_SPLIT_JSON_SETTING,q as validateSettingsEditorOptions};
