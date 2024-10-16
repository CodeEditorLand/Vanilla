var c=Object.defineProperty;var l=Object.getOwnPropertyDescriptor;var s=(o,n,e,i)=>{for(var r=i>1?void 0:i?l(n,e):n,a=o.length-1,m;a>=0;a--)(m=o[a])&&(r=(i?m(n,e,r):m(r))||r);return i&&r&&c(n,e,r),r},d=(o,n)=>(e,i)=>n(e,i,o);import"./media/terminalQuickFix.css";import{KeyCode as p,KeyMod as u}from"../../../../../base/common/keyCodes.js";import{DisposableStore as g}from"../../../../../base/common/lifecycle.js";import{localize2 as h}from"../../../../../nls.js";import{InstantiationType as f,registerSingleton as I}from"../../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as T}from"../../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as w}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import"../../../terminal/browser/terminal.js";import{registerActiveInstanceAction as x}from"../../../terminal/browser/terminalActions.js";import{registerTerminalContribution as k}from"../../../terminal/browser/terminalExtensions.js";import"../../../terminal/browser/widgets/widgetManager.js";import"../../../terminal/common/terminal.js";import{TerminalContextKeys as y}from"../../../terminal/common/terminalContextKey.js";import{ITerminalQuickFixService as F}from"./quickFix.js";import{TerminalQuickFixAddon as S}from"./quickFixAddon.js";import{freePort as C,gitCreatePr as v,gitFastForwardPull as _,gitPushSetUpstream as b,gitSimilar as P,gitTwoDashes as M,pwshGeneralError as Q,pwshUnixCommandNotFoundError as D}from"./terminalQuickFixBuiltinActions.js";import{TerminalQuickFixService as A}from"./terminalQuickFixService.js";I(F,A,f.Delayed);let t=class extends g{constructor(e,i,r,a){super();this._instance=e;this._instantiationService=a}static ID="quickFix";static get(e){return e.getContribution(t.ID)}_addon;get addon(){return this._addon}xtermReady(e){this._addon=this._instantiationService.createInstance(S,void 0,this._instance.capabilities),e.raw.loadAddon(this._addon),this.add(this._addon.onDidRequestRerunCommand(i=>this._instance.runCommand(i.command,i.shouldExecute||!1)));for(const i of[M(),_(),C((r,a)=>this._instance.freePortKillProcess(r,a)),P(),b(),v(),D(),Q()])this._addon.registerCommandFinishedListener(i)}};t=s([d(3,T)],t),k(t.ID,t);var K=(n=>(n.ShowQuickFixes="workbench.action.terminal.showQuickFixes",n))(K||{});x({id:"workbench.action.terminal.showQuickFixes",title:h("workbench.action.terminal.showQuickFixes","Show Terminal Quick Fixes"),precondition:y.focus,keybinding:{primary:u.CtrlCmd|p.Period,weight:w.WorkbenchContrib},run:o=>t.get(o)?.addon?.showMenu()});
