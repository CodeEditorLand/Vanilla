var L=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var g=(w,s,i,r)=>{for(var t=r>1?void 0:r?K(s,i):s,c=w.length-1,n;c>=0;c--)(n=w[c])&&(t=(r?n(s,i,t):n(t))||t);return r&&t&&L(s,i,t),t},m=(w,s)=>(i,r)=>s(i,r,w);import{matchesFuzzy as Q}from"../../../../../vs/base/common/filters.js";import{KeyCode as y,KeyMod as b}from"../../../../../vs/base/common/keyCodes.js";import{fuzzyContains as A}from"../../../../../vs/base/common/strings.js";import{localize as u,localize2 as V}from"../../../../../vs/nls.js";import{Categories as k}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as P}from"../../../../../vs/platform/actions/common/actions.js";import{IContextKeyService as R}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as B}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{KeybindingWeight as G}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{PickerQuickAccessProvider as O}from"../../../../../vs/platform/quickinput/browser/pickerQuickAccess.js";import{IQuickInputService as D,ItemActivation as F}from"../../../../../vs/platform/quickinput/common/quickInput.js";import"../../../../../vs/workbench/browser/panecomposite.js";import{IViewDescriptorService as M,ViewContainerLocation as d}from"../../../../../vs/workbench/common/views.js";import{IDebugService as T,REPL_VIEW_ID as x}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{ITerminalGroupService as q,ITerminalService as z}from"../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{IOutputService as N}from"../../../../../vs/workbench/services/output/common/output.js";import{IPaneCompositePartService as W}from"../../../../../vs/workbench/services/panecomposite/browser/panecomposite.js";import{IViewsService as X}from"../../../../../vs/workbench/services/views/common/viewsService.js";let v=class extends O{constructor(i,r,t,c,n,e,a,o){super(v.PREFIX,{noResultsPick:{label:u("noViewResults","No matching views"),containerLabel:""}});this.viewDescriptorService=i;this.viewsService=r;this.outputService=t;this.terminalService=c;this.terminalGroupService=n;this.debugService=e;this.paneCompositeService=a;this.contextKeyService=o}static PREFIX="view ";_getPicks(i){const r=this.doGetViewPickItems().filter(e=>i?(e.highlights={label:Q(i,e.label,!0)??void 0},e.highlights.label||A(e.containerLabel,i)):!0),t=new Map;for(const e of r)t.has(e.label)||t.set(e.label,e.containerLabel);const c=[];let n;for(const e of r){if(n!==e.containerLabel){n=e.containerLabel;let a;t.has(n)?a=`${t.get(n)} / ${n}`:a=n,c.push({type:"separator",label:a})}c.push(e)}return c}doGetViewPickItems(){const i=[],r=(e,a)=>{const o=this.viewDescriptorService.getViewContainerModel(a),p=[];for(const l of o.allViewDescriptors)this.contextKeyService.contextMatchesRules(l.when)&&p.push({label:l.name.value,containerLabel:o.title,accept:()=>this.viewsService.openView(l.id,!0)});return p},t=(e,a)=>{const o=this.paneCompositeService.getPaneComposites(e),p=this.paneCompositeService.getVisiblePaneCompositeIds(e);o.sort((l,I)=>{let f=p.findIndex(C=>l.id===C),S=p.findIndex(C=>I.id===C);return f<0&&(f=o.indexOf(l)+p.length),S<0&&(S=o.indexOf(I)+p.length),f-S});for(const l of o)if(this.includeViewContainer(l)){const I=this.viewDescriptorService.getViewContainerById(l.id);I&&i.push({label:this.viewDescriptorService.getViewContainerModel(I).title,containerLabel:a,accept:()=>this.paneCompositeService.openPaneComposite(l.id,e,!0)})}};t(d.Sidebar,u("views","Side Bar")),t(d.Panel,u("panels","Panel")),t(d.AuxiliaryBar,u("secondary side bar","Secondary Side Bar"));const c=e=>{const a=this.paneCompositeService.getPaneComposites(e);for(const o of a){const p=this.viewDescriptorService.getViewContainerById(o.id);p&&i.push(...r(o,p))}};c(d.Sidebar),c(d.Panel),c(d.AuxiliaryBar),this.terminalGroupService.groups.forEach((e,a)=>{e.terminalInstances.forEach((o,p)=>{const l=u("terminalTitle","{0}: {1}",`${a+1}.${p+1}`,o.title);i.push({label:l,containerLabel:u("terminals","Terminal"),accept:async()=>{await this.terminalGroupService.showPanel(!0),this.terminalService.setActiveInstance(o)}})})}),this.debugService.getModel().getSessions(!0).filter(e=>e.hasSeparateRepl()).forEach((e,a)=>{const o=e.name;i.push({label:o,containerLabel:u("debugConsoles","Debug Console"),accept:async()=>{await this.debugService.focusStackFrame(void 0,void 0,e,{explicit:!0}),this.viewsService.isViewVisible(x)||await this.viewsService.openView(x,!0)}})});const n=this.outputService.getChannelDescriptors();for(const e of n)i.push({label:e.label,containerLabel:u("channels","Output"),accept:()=>this.outputService.showChannel(e.id)});return i}includeViewContainer(i){const r=this.viewDescriptorService.getViewContainerById(i.id);return r?.hideIfEmpty?this.viewDescriptorService.getViewContainerModel(r).activeViewDescriptors.length>0:!0}};v=g([m(0,M),m(1,X),m(2,N),m(3,z),m(4,q),m(5,T),m(6,W),m(7,R)],v);class E extends P{static ID="workbench.action.openView";constructor(){super({id:E.ID,title:V("openView","Open View"),category:k.View,f1:!0})}async run(s){s.get(D).quickAccess.show(v.PREFIX)}}class h extends P{static ID="workbench.action.quickOpenView";static KEYBINDING={primary:b.CtrlCmd|y.KeyQ,mac:{primary:b.WinCtrl|y.KeyQ},linux:{primary:0}};constructor(){super({id:h.ID,title:V("quickOpenView","Quick Open View"),category:k.View,f1:!1,keybinding:{weight:G.WorkbenchContrib,when:void 0,...h.KEYBINDING}})}async run(s){const i=s.get(B),r=s.get(D),t=i.lookupKeybindings(h.ID);r.quickAccess.show(v.PREFIX,{quickNavigateConfiguration:{keybindings:t},itemActivation:F.FIRST})}}export{E as OpenViewPickerAction,h as QuickAccessViewPickerAction,v as ViewQuickAccessProvider};
