var I=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var m=(o,r,e,i)=>{for(var t=i>1?void 0:i?v(r,e):r,c=o.length-1,a;c>=0;c--)(a=o[c])&&(t=(i?a(r,e,t):a(t))||t);return i&&t&&I(r,e,t),t},p=(o,r)=>(e,i)=>r(e,i,o);import{Disposable as f}from"../../../../base/common/lifecycle.js";import{Categories as g}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as u,registerAction2 as y}from"../../../../platform/actions/common/actions.js";import{IInstantiationService as b}from"../../../../platform/instantiation/common/instantiation.js";import{Registry as d}from"../../../../platform/registry/common/platform.js";import{Extensions as h}from"../../../common/contributions.js";import{LifecyclePhase as l}from"../../../services/lifecycle/common/lifecycle.js";import{OpenWindowSessionLogFileAction as n}from"../common/logsActions.js";import{LogsDataCleaner as k}from"../common/logsDataCleaner.js";let s=class extends f{constructor(e){super();this.instantiationService=e;this.registerWebContributions()}registerWebContributions(){this.instantiationService.createInstance(k),this._register(y(class extends u{constructor(){super({id:n.ID,title:n.TITLE,category:g.Developer,f1:!0})}run(e){return e.get(b).createInstance(n,n.ID,n.TITLE.value).run()}}))}};s=m([p(0,b)],s),d.as(h.Workbench).registerWorkbenchContribution(s,l.Restored);
