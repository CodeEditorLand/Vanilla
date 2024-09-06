var p=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var g=(r,i,e,t)=>{for(var o=t>1?void 0:t?y(i,e):i,a=r.length-1,d;a>=0;a--)(d=r[a])&&(o=(t?d(i,e,o):d(o))||o);return t&&o&&p(i,e,o),o},s=(r,i)=>(e,t)=>i(e,t,r);import"../../../../vs/base/common/event.js";import{KeyCode as f,KeyMod as b}from"../../../../vs/base/common/keyCodes.js";import{combinedDisposable as c,Disposable as I,toDisposable as N}from"../../../../vs/base/common/lifecycle.js";import{IConfigurationService as h}from"../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as l,IContextKeyService as S,RawContextKey as D}from"../../../../vs/platform/contextkey/common/contextkey.js";import{KeybindingsRegistry as C,KeybindingWeight as v}from"../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{WorkbenchListFocusContextKey as m,WorkbenchListScrollAtBottomContextKey as K,WorkbenchListScrollAtTopContextKey as w}from"../../../../vs/platform/list/browser/listService.js";import{ILogService as A}from"../../../../vs/platform/log/common/log.js";import{registerWorkbenchContribution2 as x,WorkbenchPhase as E}from"../../../../vs/workbench/common/contributions.js";function W(r,i,e){const t=new Set;return c(...r.map((o,a)=>c(o.onDidFocus(()=>{e?.(a,"focus"),t.size||i(!0),t.add(a)}),o.onDidBlur(()=>{e?.(a,"blur"),t.delete(a),t.size||i(!1)}))))}const u=new D("navigableContainerFocused",!1);let n=class{constructor(i,e,t){this.logService=e;this.configurationService=t;this.focused=u.bindTo(i),n.INSTANCE=this}static ID="workbench.contrib.navigableContainerManager";static INSTANCE;containers=new Set;lastContainer;focused;dispose(){this.containers.clear(),this.focused.reset(),n.INSTANCE=void 0}get debugEnabled(){return this.configurationService.getValue("workbench.navigibleContainer.enableDebug")}log(i,...e){this.debugEnabled&&this.logService.debug(i,...e)}static register(i){const e=this.INSTANCE;return e?(e.containers.add(i),e.log("NavigableContainerManager.register",i.name),c(W(i.focusNotifiers,t=>{t?(e.log("NavigableContainerManager.focus",i.name),e.focused.set(!0),e.lastContainer=i):(e.log("NavigableContainerManager.blur",i.name,e.lastContainer?.name),e.lastContainer===i&&(e.focused.set(!1),e.lastContainer=void 0))},(t,o)=>{e.log("NavigableContainerManager.partFocusChange",i.name,t,o)}),N(()=>{e.containers.delete(i),e.log("NavigableContainerManager.unregister",i.name,e.lastContainer?.name),e.lastContainer===i&&(e.focused.set(!1),e.lastContainer=void 0)}))):I.None}static getActive(){return this.INSTANCE?.lastContainer}};n=g([s(0,S),s(1,A),s(2,h)],n);function q(r){return n.register(r)}x(n.ID,n,E.BlockStartup),C.registerCommandAndKeybindingRule({id:"widgetNavigation.focusPrevious",weight:v.WorkbenchContrib,when:l.and(u,l.or(m?.negate(),w)),primary:b.CtrlCmd|f.UpArrow,handler:()=>{n.getActive()?.focusPreviousWidget()}}),C.registerCommandAndKeybindingRule({id:"widgetNavigation.focusNext",weight:v.WorkbenchContrib,when:l.and(u,l.or(m?.negate(),K)),primary:b.CtrlCmd|f.DownArrow,handler:()=>{n.getActive()?.focusNextWidget()}});export{q as registerNavigableContainer};
