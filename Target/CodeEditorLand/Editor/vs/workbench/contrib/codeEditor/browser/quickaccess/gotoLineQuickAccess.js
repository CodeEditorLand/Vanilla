var v=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var m=(n,i,o,e)=>{for(var r=e>1?void 0:e?f(i,o):i,d=n.length-1,a;d>=0;d--)(a=n[d])&&(r=(e?a(i,o,r):a(r))||r);return e&&r&&v(i,o,r),r},c=(n,i)=>(o,e)=>i(o,e,n);import{KeyCode as p,KeyMod as u}from"../../../../../../vs/base/common/keyCodes.js";import"../../../../../../vs/editor/common/core/range.js";import"../../../../../../vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js";import{AbstractGotoLineQuickAccessProvider as l}from"../../../../../../vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess.js";import{localize as g,localize2 as y}from"../../../../../../vs/nls.js";import{Action2 as I,registerAction2 as E}from"../../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as h}from"../../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../../vs/platform/editor/common/editor.js";import"../../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as S}from"../../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{Extensions as C}from"../../../../../../vs/platform/quickinput/common/quickAccess.js";import{IQuickInputService as k}from"../../../../../../vs/platform/quickinput/common/quickInput.js";import{Registry as b}from"../../../../../../vs/platform/registry/common/platform.js";import"../../../../../../vs/workbench/common/editor.js";import{IEditorGroupsService as x}from"../../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as A}from"../../../../../../vs/workbench/services/editor/common/editorService.js";let t=class extends l{constructor(o,e,r){super();this.editorService=o;this.editorGroupService=e;this.configurationService=r}onDidActiveTextEditorControlChange=this.editorService.onDidActiveEditorChange;get configuration(){const o=this.configurationService.getValue().workbench?.editor;return{openEditorPinned:!o?.enablePreviewFromQuickOpen||!o?.enablePreview}}get activeTextEditorControl(){return this.editorService.activeTextEditorControl}gotoLocation(o,e){if((e.keyMods.alt||this.configuration.openEditorPinned&&e.keyMods.ctrlCmd||e.forceSideBySide)&&this.editorService.activeEditor){o.restoreViewState?.();const r={selection:e.range,pinned:e.keyMods.ctrlCmd||this.configuration.openEditorPinned,preserveFocus:e.preserveFocus};this.editorGroupService.sideGroup.openEditor(this.editorService.activeEditor,r)}else super.gotoLocation(o,e)}};t=m([c(0,A),c(1,x),c(2,h)],t);class s extends I{static ID="workbench.action.gotoLine";constructor(){super({id:s.ID,title:y("gotoLine","Go to Line/Column..."),f1:!0,keybinding:{weight:S.WorkbenchContrib,when:null,primary:u.CtrlCmd|p.KeyG,mac:{primary:u.WinCtrl|p.KeyG}}})}async run(i){i.get(k).quickAccess.show(t.PREFIX)}}E(s),b.as(C.Quickaccess).registerQuickAccessProvider({ctor:t,prefix:l.PREFIX,placeholder:g("gotoLineQuickAccessPlaceholder","Type the line number and optional column to go to (e.g. 42:5 for line 42 and column 5)."),helpEntries:[{description:g("gotoLineQuickAccess","Go to Line/Column"),commandId:s.ID}]});export{t as GotoLineQuickAccessProvider};