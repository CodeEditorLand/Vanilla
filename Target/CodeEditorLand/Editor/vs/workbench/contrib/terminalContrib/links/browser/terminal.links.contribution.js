var u=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var L=(t,a,n,e)=>{for(var i=e>1?void 0:e?_(a,n):a,o=t.length-1,s;o>=0;o--)(s=t[o])&&(i=(e?s(a,n,i):s(i))||i);return e&&i&&u(a,n,i),i},d=(t,a)=>(n,e)=>a(n,e,t);import{Event as T}from"../../../../../base/common/event.js";import{KeyCode as v,KeyMod as c}from"../../../../../base/common/keyCodes.js";import{DisposableStore as w}from"../../../../../base/common/lifecycle.js";import{localize2 as l}from"../../../../../nls.js";import{ContextKeyExpr as g}from"../../../../../platform/contextkey/common/contextkey.js";import{InstantiationType as y,registerSingleton as P}from"../../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as b}from"../../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as I}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{accessibleViewCurrentProviderId as M,accessibleViewIsShown as C}from"../../../accessibility/browser/accessibilityConfiguration.js";import{isDetachedTerminalInstance as S}from"../../../terminal/browser/terminal.js";import{registerActiveInstanceAction as k}from"../../../terminal/browser/terminalActions.js";import{registerTerminalContribution as R}from"../../../terminal/browser/terminalExtensions.js";import{isTerminalProcessManager as D}from"../../../terminal/common/terminal.js";import{TerminalContextKeys as m}from"../../../terminal/common/terminalContextKey.js";import{terminalStrings as x}from"../../../terminal/common/terminalStrings.js";import{ITerminalLinkProviderService as f}from"./links.js";import{TerminalLinkManager as Q}from"./terminalLinkManager.js";import{TerminalLinkProviderService as O}from"./terminalLinkProviderService.js";import{TerminalLinkQuickpick as W}from"./terminalLinkQuickpick.js";import{TerminalLinkResolver as K}from"./terminalLinkResolver.js";import{TerminalLinksCommandId as p}from"../common/terminal.links.js";import{AccessibleViewProviderId as F}from"../../../../../platform/accessibility/browser/accessibleView.js";P(f,O,y.Delayed);let r=class extends w{constructor(n,e,i,o,s){super();this._instance=n;this._processManager=e;this._widgetManager=i;this._instantiationService=o;this._terminalLinkProviderService=s;this._linkResolver=this._instantiationService.createInstance(K)}static ID="terminal.link";static get(n){return n.getContribution(r.ID)}_linkManager;_terminalLinkQuickpick;_linkResolver;xtermReady(n){const e=this._linkManager=this.add(this._instantiationService.createInstance(Q,n.raw,this._processManager,this._instance.capabilities,this._linkResolver));if(D(this._processManager)){const i=e.add(T.once(this._processManager.onProcessReady)(()=>{e.setWidgetManager(this._widgetManager),this.delete(i)}))}else e.setWidgetManager(this._widgetManager);if(!S(this._instance)){for(const i of this._terminalLinkProviderService.linkProviders)e.externalProvideLinksCb=i.provideLinks.bind(i,this._instance);e.add(this._terminalLinkProviderService.onDidAddLinkProvider(i=>{e.externalProvideLinksCb=i.provideLinks.bind(i,this._instance)}))}e.add(this._terminalLinkProviderService.onDidRemoveLinkProvider(()=>e.externalProvideLinksCb=void 0))}async showLinkQuickpick(n){this._terminalLinkQuickpick||(this._terminalLinkQuickpick=this.add(this._instantiationService.createInstance(W)),this._terminalLinkQuickpick.onDidRequestMoreLinks(()=>{this.showLinkQuickpick(!0)}));const e=await this._getLinks();return await this._terminalLinkQuickpick.show(this._instance,e)}async _getLinks(){if(!this._linkManager)throw new Error("terminal links are not ready, cannot generate link quick pick");return this._linkManager.getLinks()}async openRecentLink(n){if(!this._linkManager)throw new Error("terminal links are not ready, cannot open a link");this._linkManager.openRecentLink(n)}};r=L([d(3,b),d(4,f)],r),R(r.ID,r,!0);const h=x.actionCategory;k({id:p.OpenDetectedLink,title:l("workbench.action.terminal.openDetectedLink","Open Detected Link..."),f1:!0,category:h,precondition:m.terminalHasBeenCreated,keybinding:[{primary:c.CtrlCmd|c.Shift|v.KeyO,weight:I.WorkbenchContrib+1,when:m.focus},{primary:c.CtrlCmd|c.Shift|v.KeyG,weight:I.WorkbenchContrib+1,when:g.and(C,g.equals(M.key,F.Terminal))}],run:t=>r.get(t)?.showLinkQuickpick()}),k({id:p.OpenWebLink,title:l("workbench.action.terminal.openLastUrlLink","Open Last URL Link"),metadata:{description:l("workbench.action.terminal.openLastUrlLink.description","Opens the last detected URL/URI link in the terminal")},f1:!0,category:h,precondition:m.terminalHasBeenCreated,run:t=>r.get(t)?.openRecentLink("url")}),k({id:p.OpenFileLink,title:l("workbench.action.terminal.openLastLocalFileLink","Open Last Local File Link"),f1:!0,category:h,precondition:m.terminalHasBeenCreated,run:t=>r.get(t)?.openRecentLink("localFile")});
