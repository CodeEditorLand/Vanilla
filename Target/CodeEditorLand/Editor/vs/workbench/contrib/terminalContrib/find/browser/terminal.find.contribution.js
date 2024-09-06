var w=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var W=(d,s,i,a)=>{for(var n=a>1?void 0:a?F(s,i):s,p=d.length-1,f;p>=0;p--)(f=d[p])&&(n=(a?f(s,i,n):f(n))||n);return a&&n&&w(s,i,n),n},y=(d,s)=>(i,a)=>s(i,a,d);import"../../../../../../vs/base/browser/dom.js";import{KeyCode as o,KeyMod as r}from"../../../../../../vs/base/common/keyCodes.js";import{Lazy as I}from"../../../../../../vs/base/common/lazy.js";import{Disposable as b}from"../../../../../../vs/base/common/lifecycle.js";import{localize2 as l}from"../../../../../../vs/nls.js";import{ContextKeyExpr as c}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as C}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as m}from"../../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{findInFilesCommand as v}from"../../../../../../vs/workbench/contrib/search/browser/searchActionsFind.js";import{isDetachedTerminalInstance as T,ITerminalService as k}from"../../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{registerActiveInstanceAction as _,registerActiveXtermAction as h}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalActions.js";import{registerTerminalContribution as S}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalExtensions.js";import"../../../../../../vs/workbench/contrib/terminal/browser/widgets/widgetManager.js";import"../../../../../../vs/workbench/contrib/terminal/common/terminal.js";import{TerminalContextKeys as e}from"../../../../../../vs/workbench/contrib/terminal/common/terminalContextKey.js";import{TerminalFindWidget as x}from"../../../../../../vs/workbench/contrib/terminalContrib/find/browser/terminalFindWidget.js";import{TerminalFindCommandId as g}from"../../../../../../vs/workbench/contrib/terminalContrib/find/common/terminal.find.js";import"vs/css!./media/terminalFind";let t=class extends b{constructor(i,a,n,p,f){super();this._instance=i;this._findWidget=new I(()=>{const u=p.createInstance(x,this._instance);if(u.focusTracker.onDidFocus(()=>{t.activeFindWidget=this,this._instance.forceScrollbarVisibility(),T(this._instance)||f.setActiveInstance(this._instance)}),u.focusTracker.onDidBlur(()=>{t.activeFindWidget=void 0,this._instance.resetScrollbarVisibility()}),!this._instance.domElement)throw new Error("FindWidget expected terminal DOM to be initialized");return this._instance.domElement?.appendChild(u.getDomNode()),this._lastLayoutDimensions&&u.layout(this._lastLayoutDimensions.width),u})}static ID="terminal.find";static activeFindWidget;static get(i){return i.getContribution(t.ID)}_findWidget;_lastLayoutDimensions;get findWidget(){return this._findWidget.value}layout(i,a){this._lastLayoutDimensions=a,this._findWidget.rawValue?.layout(a.width)}xtermReady(i){this._register(i.onDidChangeFindResults(()=>this._findWidget.rawValue?.updateResultCount()))}dispose(){t.activeFindWidget===this&&(t.activeFindWidget=void 0),super.dispose(),this._findWidget.rawValue?.dispose()}};t=W([y(3,C),y(4,k)],t),S(t.ID,t,!0),h({id:g.FindFocus,title:l("workbench.action.terminal.focusFind","Focus Find"),keybinding:{primary:r.CtrlCmd|o.KeyF,when:c.or(e.findFocus,e.focusInAny),weight:m.WorkbenchContrib},precondition:c.or(e.processSupported,e.terminalHasBeenCreated),run:(d,s,i)=>{(t.activeFindWidget||t.get(i))?.findWidget.reveal()}}),h({id:g.FindHide,title:l("workbench.action.terminal.hideFind","Hide Find"),keybinding:{primary:o.Escape,secondary:[r.Shift|o.Escape],when:c.and(e.focusInAny,e.findVisible),weight:m.WorkbenchContrib},precondition:c.or(e.processSupported,e.terminalHasBeenCreated),run:(d,s,i)=>{(t.activeFindWidget||t.get(i))?.findWidget.hide()}}),h({id:g.ToggleFindRegex,title:l("workbench.action.terminal.toggleFindRegex","Toggle Find Using Regex"),keybinding:{primary:r.Alt|o.KeyR,mac:{primary:r.CtrlCmd|r.Alt|o.KeyR},when:e.findVisible,weight:m.WorkbenchContrib},precondition:c.or(e.processSupported,e.terminalHasBeenCreated),run:(d,s,i)=>{const n=(t.activeFindWidget||t.get(i))?.findWidget.state;n?.change({isRegex:!n.isRegex},!1)}}),h({id:g.ToggleFindWholeWord,title:l("workbench.action.terminal.toggleFindWholeWord","Toggle Find Using Whole Word"),keybinding:{primary:r.Alt|o.KeyW,mac:{primary:r.CtrlCmd|r.Alt|o.KeyW},when:e.findVisible,weight:m.WorkbenchContrib},precondition:c.or(e.processSupported,e.terminalHasBeenCreated),run:(d,s,i)=>{const n=(t.activeFindWidget||t.get(i))?.findWidget.state;n?.change({wholeWord:!n.wholeWord},!1)}}),h({id:g.ToggleFindCaseSensitive,title:l("workbench.action.terminal.toggleFindCaseSensitive","Toggle Find Using Case Sensitive"),keybinding:{primary:r.Alt|o.KeyC,mac:{primary:r.CtrlCmd|r.Alt|o.KeyC},when:e.findVisible,weight:m.WorkbenchContrib},precondition:c.or(e.processSupported,e.terminalHasBeenCreated),run:(d,s,i)=>{const n=(t.activeFindWidget||t.get(i))?.findWidget.state;n?.change({matchCase:!n.matchCase},!1)}}),h({id:g.FindNext,title:l("workbench.action.terminal.findNext","Find Next"),keybinding:[{primary:o.F3,mac:{primary:r.CtrlCmd|o.KeyG,secondary:[o.F3]},when:c.or(e.focusInAny,e.findFocus),weight:m.WorkbenchContrib},{primary:r.Shift|o.Enter,when:e.findInputFocus,weight:m.WorkbenchContrib}],precondition:c.or(e.processSupported,e.terminalHasBeenCreated),run:(d,s,i)=>{const n=(t.activeFindWidget||t.get(i))?.findWidget;n&&(n.show(),n.find(!1))}}),h({id:g.FindPrevious,title:l("workbench.action.terminal.findPrevious","Find Previous"),keybinding:[{primary:r.Shift|o.F3,mac:{primary:r.CtrlCmd|r.Shift|o.KeyG,secondary:[r.Shift|o.F3]},when:c.or(e.focusInAny,e.findFocus),weight:m.WorkbenchContrib},{primary:o.Enter,when:e.findInputFocus,weight:m.WorkbenchContrib}],precondition:c.or(e.processSupported,e.terminalHasBeenCreated),run:(d,s,i)=>{const n=(t.activeFindWidget||t.get(i))?.findWidget;n&&(n.show(),n.find(!0))}}),_({id:g.SearchWorkspace,title:l("workbench.action.terminal.searchWorkspace","Search Workspace"),keybinding:[{primary:r.CtrlCmd|r.Shift|o.KeyF,when:c.and(e.processSupported,e.focus,e.textSelected),weight:m.WorkbenchContrib+50}],run:(d,s,i)=>v(i,{query:d.selection})});
