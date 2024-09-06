import{alert as r}from"../../../../../vs/base/browser/ui/aria/aria.js";import{KeyCode as a,KeyMod as o}from"../../../../../vs/base/common/keyCodes.js";import{TabFocus as s}from"../../../../../vs/editor/browser/config/tabFocus.js";import*as e from"../../../../../vs/nls.js";import{Action2 as n,registerAction2 as c}from"../../../../../vs/platform/actions/common/actions.js";import{KeybindingWeight as l}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";class t extends n{static ID="editor.action.toggleTabFocusMode";constructor(){super({id:t.ID,title:e.localize2({key:"toggle.tabMovesFocus",comment:["Turn on/off use of tab key for moving focus around VS Code"]},"Toggle Tab Key Moves Focus"),precondition:void 0,keybinding:{primary:o.CtrlCmd|a.KeyM,mac:{primary:o.WinCtrl|o.Shift|a.KeyM},weight:l.EditorContrib},metadata:{description:e.localize2("tabMovesFocusDescriptions","Determines whether the tab key moves focus around the workbench or inserts the tab character in the current editor. This is also called tab trapping, tab navigation, or tab focus mode.")},f1:!0})}run(){const i=!s.getTabFocusMode();s.setTabFocusMode(i),i?r(e.localize("toggle.tabMovesFocus.on","Pressing Tab will now move focus to the next focusable element")):r(e.localize("toggle.tabMovesFocus.off","Pressing Tab will now insert the tab character"))}}c(t);export{t as ToggleTabFocusModeAction};
