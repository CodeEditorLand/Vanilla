import"../../../../browser/editorBrowser.js";import{EditorAction as n,EditorAction2 as d}from"../../../../browser/editorExtensions.js";import{KeyCode as s}from"../../../../../base/common/keyCodes.js";import{localize as r,localize2 as e}from"../../../../../nls.js";import{KeybindingWeight as l}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{EditorContextKeys as a}from"../../../../common/editorContextKeys.js";import{MenuId as C}from"../../../../../platform/actions/common/actions.js";import{StandaloneColorPickerController as i}from"./standaloneColorPickerController.js";class f extends d{constructor(){super({id:"editor.action.showOrFocusStandaloneColorPicker",title:{...e("showOrFocusStandaloneColorPicker","Show or Focus Standalone Color Picker"),mnemonicTitle:r({key:"mishowOrFocusStandaloneColorPicker",comment:["&& denotes a mnemonic"]},"&&Show or Focus Standalone Color Picker")},precondition:void 0,menu:[{id:C.CommandPalette}],metadata:{description:e("showOrFocusStandaloneColorPickerDescription","Show or focus a standalone color picker which uses the default color provider. It displays hex/rgb/hsl colors.")}})}runEditorCommand(c,o){i.get(o)?.showOrFocus()}}class I extends n{constructor(){super({id:"editor.action.hideColorPicker",label:r({key:"hideColorPicker",comment:["Action that hides the color picker"]},"Hide the Color Picker"),alias:"Hide the Color Picker",precondition:a.standaloneColorPickerVisible.isEqualTo(!0),kbOpts:{primary:s.Escape,weight:l.EditorContrib},metadata:{description:e("hideColorPickerDescription","Hide the standalone color picker.")}})}run(c,o){i.get(o)?.hide()}}class g extends n{constructor(){super({id:"editor.action.insertColorWithStandaloneColorPicker",label:r({key:"insertColorWithStandaloneColorPicker",comment:["Action that inserts color with standalone color picker"]},"Insert Color with Standalone Color Picker"),alias:"Insert Color with Standalone Color Picker",precondition:a.standaloneColorPickerFocused.isEqualTo(!0),kbOpts:{primary:s.Enter,weight:l.EditorContrib},metadata:{description:e("insertColorWithStandaloneColorPickerDescription","Insert hex/rgb/hsl colors with the focused standalone color picker.")}})}run(c,o){i.get(o)?.insertColor()}}export{I as HideStandaloneColorPicker,g as InsertColorWithStandaloneColorPicker,f as ShowOrFocusStandaloneColorPicker};
