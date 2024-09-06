import"vs/css!./media/actions";import{getZoomLevel as M}from"../../../../vs/base/browser/browser.js";import{getActiveWindow as S}from"../../../../vs/base/browser/dom.js";import{Codicon as N}from"../../../../vs/base/common/codicons.js";import{KeyCode as t,KeyMod as n}from"../../../../vs/base/common/keyCodes.js";import{isMacintosh as q}from"../../../../vs/base/common/platform.js";import{ThemeIcon as E}from"../../../../vs/base/common/themables.js";import{URI as P}from"../../../../vs/base/common/uri.js";import{ILanguageService as G}from"../../../../vs/editor/common/languages/language.js";import{getIconClasses as _}from"../../../../vs/editor/common/services/getIconClasses.js";import{IModelService as B}from"../../../../vs/editor/common/services/model.js";import{localize as d,localize2 as p}from"../../../../vs/nls.js";import{Categories as O}from"../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as T,MenuId as C}from"../../../../vs/platform/actions/common/actions.js";import"../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as Z}from"../../../../vs/platform/configuration/common/configuration.js";import{FileKind as v}from"../../../../vs/platform/files/common/files.js";import"../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as Y}from"../../../../vs/platform/keybinding/common/keybinding.js";import{KeybindingWeight as y}from"../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{INativeHostService as u}from"../../../../vs/platform/native/common/native.js";import{IQuickInputService as U}from"../../../../vs/platform/quickinput/common/quickInput.js";import{isOpenedAuxiliaryWindow as X}from"../../../../vs/platform/window/common/window.js";import{applyZoom as j,ApplyZoomTarget as h,MAX_ZOOM_LEVEL as J,MIN_ZOOM_LEVEL as $}from"../../../../vs/platform/window/electron-sandbox/window.js";import{isSingleFolderWorkspaceIdentifier as H,isWorkspaceIdentifier as K}from"../../../../vs/platform/workspace/common/workspace.js";class Q extends T{static ID="workbench.action.closeWindow";constructor(){super({id:Q.ID,title:{...p("closeWindow","Close Window"),mnemonicTitle:d({key:"miCloseWindow",comment:["&& denotes a mnemonic"]},"Clos&&e Window")},f1:!0,keybinding:{weight:y.WorkbenchContrib,mac:{primary:n.CtrlCmd|n.Shift|t.KeyW},linux:{primary:n.Alt|t.F4,secondary:[n.CtrlCmd|n.Shift|t.KeyW]},win:{primary:n.Alt|t.F4,secondary:[n.CtrlCmd|n.Shift|t.KeyW]}},menu:{id:C.MenubarFileMenu,group:"6_close",order:4}})}async run(o){return o.get(u).closeWindow({targetWindowId:S().vscodeWindowId})}}class l extends T{static ZOOM_LEVEL_SETTING_KEY="window.zoomLevel";static ZOOM_PER_WINDOW_SETTING_KEY="window.zoomPerWindow";constructor(o){super(o)}async setZoomLevel(o,I){const W=o.get(Z);let s;W.getValue(l.ZOOM_PER_WINDOW_SETTING_KEY)!==!1?s=h.ACTIVE_WINDOW:s=h.ALL_WINDOWS;let c;if(typeof I=="number")c=Math.round(I);else if(s===h.ALL_WINDOWS)c=0;else{const w=W.getValue(l.ZOOM_LEVEL_SETTING_KEY);typeof w=="number"?c=w:c=0}c>J||c<$||(s===h.ALL_WINDOWS&&await W.updateValue(l.ZOOM_LEVEL_SETTING_KEY,c),j(c,s))}}class Ee extends l{constructor(){super({id:"workbench.action.zoomIn",title:{...p("zoomIn","Zoom In"),mnemonicTitle:d({key:"miZoomIn",comment:["&& denotes a mnemonic"]},"&&Zoom In")},category:O.View,f1:!0,keybinding:{weight:y.WorkbenchContrib,primary:n.CtrlCmd|t.Equal,secondary:[n.CtrlCmd|n.Shift|t.Equal,n.CtrlCmd|t.NumpadAdd]},menu:{id:C.MenubarAppearanceMenu,group:"5_zoom",order:1}})}run(o){return super.setZoomLevel(o,M(S())+1)}}class Pe extends l{constructor(){super({id:"workbench.action.zoomOut",title:{...p("zoomOut","Zoom Out"),mnemonicTitle:d({key:"miZoomOut",comment:["&& denotes a mnemonic"]},"&&Zoom Out")},category:O.View,f1:!0,keybinding:{weight:y.WorkbenchContrib,primary:n.CtrlCmd|t.Minus,secondary:[n.CtrlCmd|n.Shift|t.Minus,n.CtrlCmd|t.NumpadSubtract],linux:{primary:n.CtrlCmd|t.Minus,secondary:[n.CtrlCmd|t.NumpadSubtract]}},menu:{id:C.MenubarAppearanceMenu,group:"5_zoom",order:2}})}run(o){return super.setZoomLevel(o,M(S())-1)}}class _e extends l{constructor(){super({id:"workbench.action.zoomReset",title:{...p("zoomReset","Reset Zoom"),mnemonicTitle:d({key:"miZoomReset",comment:["&& denotes a mnemonic"]},"&&Reset Zoom")},category:O.View,f1:!0,keybinding:{weight:y.WorkbenchContrib,primary:n.CtrlCmd|t.Numpad0},menu:{id:C.MenubarAppearanceMenu,group:"5_zoom",order:3}})}run(o){return super.setZoomLevel(o,!0)}}class D extends T{closeWindowAction={iconClass:E.asClassName(N.removeClose),tooltip:d("close","Close Window")};closeDirtyWindowAction={iconClass:"dirty-window "+E.asClassName(N.closeDirty),tooltip:d("close","Close Window"),alwaysVisible:!0};constructor(o){super(o)}async run(o){const I=o.get(U),W=o.get(Y),s=o.get(B),c=o.get(G),w=o.get(u),k=S().vscodeWindowId,z=await w.getWindows({includeAuxiliaryWindows:!0}),x=new Set,b=new Map;for(const e of z)if(X(e)){let r=b.get(e.parentId);r||(r=new Set,b.set(e.parentId,r)),r.add(e)}else x.add(e);function A(e){return typeof e?.windowId=="number"}const a=[];for(const e of x){const r=b.get(e.id);b.size>0&&a.push({type:"separator",label:r?d("windowGroup","window group"):void 0});const m=e.filename?P.file(e.filename):H(e.workspace)?e.workspace.uri:K(e.workspace)?e.workspace.configPath:void 0,R=e.filename?v.FILE:H(e.workspace)?v.FOLDER:K(e.workspace)?v.ROOT_FOLDER:v.FILE,V={windowId:e.id,label:e.title,ariaLabel:e.dirty?d("windowDirtyAriaLabel","{0}, window with unsaved changes",e.title):e.title,iconClasses:_(s,c,m,R),description:k===e.id?d("current","Current Window"):void 0,buttons:k!==e.id?e.dirty?[this.closeDirtyWindowAction]:[this.closeWindowAction]:void 0};if(a.push(V),r)for(const g of r){const F={windowId:g.id,label:g.title,iconClasses:_(s,c,g.filename?P.file(g.filename):void 0,v.FILE),description:k===g.id?d("current","Current Window"):void 0,buttons:[this.closeWindowAction]};a.push(F)}}const L=await I.pick(a,{contextKey:"inWindowsPicker",activeItem:(()=>{for(let e=0;e<a.length;e++){const r=a[e];if(A(r)&&r.windowId===k){let m=a[e+1];if(A(m)||(m=a[e+2],A(m)))return m}}})(),placeHolder:d("switchWindowPlaceHolder","Select a window to switch to"),quickNavigate:this.isQuickNavigate()?{keybindings:W.lookupKeybindings(this.desc.id)}:void 0,hideInput:this.isQuickNavigate(),onDidTriggerItemButton:async e=>{await w.closeWindow({targetWindowId:e.item.windowId}),e.removeItem()}});L&&w.focusWindow({targetWindowId:L.windowId})}}class Ze extends D{constructor(){super({id:"workbench.action.switchWindow",title:p("switchWindow","Switch Window..."),f1:!0,keybinding:{weight:y.WorkbenchContrib,primary:0,mac:{primary:n.WinCtrl|t.KeyW}}})}isQuickNavigate(){return!1}}class He extends D{constructor(){super({id:"workbench.action.quickSwitchWindow",title:p("quickSwitchWindow","Quick Switch Window..."),f1:!1})}isQuickNavigate(){return!0}}function f(i){return q?i.get(Z).getValue("window.nativeTabs")===!0:!1}const Ke=function(i){if(f(i))return i.get(u).newWindowTab()},De=function(i){if(f(i))return i.get(u).showPreviousWindowTab()},Qe=function(i){if(f(i))return i.get(u).showNextWindowTab()},ze=function(i){if(f(i))return i.get(u).moveWindowTabToNewWindow()},Re=function(i){if(f(i))return i.get(u).mergeAllWindowTabs()},Ve=function(i){if(f(i))return i.get(u).toggleWindowTabsBar()};export{Q as CloseWindowAction,Re as MergeWindowTabsHandlerHandler,ze as MoveWindowTabToNewWindowHandler,Ke as NewWindowTabHandler,He as QuickSwitchWindowAction,Qe as ShowNextWindowTabHandler,De as ShowPreviousWindowTabHandler,Ze as SwitchWindowAction,Ve as ToggleWindowTabsBarHandler,Ee as ZoomInAction,Pe as ZoomOutAction,_e as ZoomResetAction};
