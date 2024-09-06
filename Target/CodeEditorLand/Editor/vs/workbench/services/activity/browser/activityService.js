var w=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var h=(o,n,i,s)=>{for(var t=s>1?void 0:s?I(n,i):n,e=o.length-1,r;e>=0;e--)(r=o[e])&&(t=(s?r(n,i,t):r(t))||t);return s&&t&&w(n,i,t),t},c=(o,n)=>(i,s)=>n(i,s,o);import{Emitter as D,Event as y}from"../../../../base/common/event.js";import{Disposable as p,toDisposable as l}from"../../../../base/common/lifecycle.js";import{isUndefined as d}from"../../../../base/common/types.js";import{InstantiationType as f,registerSingleton as u}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as m}from"../../../../platform/instantiation/common/instantiation.js";import{ACCOUNTS_ACTIVITY_ID as b,GLOBAL_ACTIVITY_ID as C}from"../../../common/activity.js";import{IViewDescriptorService as A}from"../../../common/views.js";import{IActivityService as g}from"../common/activity.js";let v=class extends p{constructor(i,s,t){super();this.viewId=i;this.viewDescriptorService=s;this.activityService=t;this._register(y.filter(this.viewDescriptorService.onDidChangeContainer,e=>e.views.some(r=>r.id===i))(()=>this.update())),this._register(y.filter(this.viewDescriptorService.onDidChangeLocation,e=>e.views.some(r=>r.id===i))(()=>this.update()))}activity=void 0;activityDisposable=p.None;setActivity(i){this.activity=i,this.update()}clearActivity(){this.activity=void 0,this.update()}update(){this.activityDisposable.dispose();const i=this.viewDescriptorService.getViewContainerByViewId(this.viewId);i&&this.activity&&(this.activityDisposable=this.activityService.showViewContainerActivity(i.id,this.activity))}dispose(){this.activityDisposable.dispose(),super.dispose()}};v=h([c(1,A),c(2,g)],v);let a=class extends p{constructor(i,s){super();this.viewDescriptorService=i;this.instantiationService=s}_serviceBrand;viewActivities=new Map;_onDidChangeActivity=this._register(new D);onDidChangeActivity=this._onDidChangeActivity.event;viewContainerActivities=new Map;globalActivities=new Map;showViewContainerActivity(i,s){const t=this.viewDescriptorService.getViewContainerById(i);if(t){let e=this.viewContainerActivities.get(i);e||(e=[],this.viewContainerActivities.set(i,e));for(let r=0;r<=e.length;r++)if(r===e.length||d(s.priority)){e.push(s);break}else if(d(e[r].priority)||e[r].priority<=s.priority){e.splice(r,0,s);break}return this._onDidChangeActivity.fire(t),l(()=>{e.splice(e.indexOf(s),1),e.length===0&&this.viewContainerActivities.delete(i),this._onDidChangeActivity.fire(t)})}return p.None}getViewContainerActivities(i){return this.viewDescriptorService.getViewContainerById(i)?this.viewContainerActivities.get(i)??[]:[]}showViewActivity(i,s){let t=this.viewActivities.get(i);t?t.id++:(t={id:1,activity:this.instantiationService.createInstance(v,i)},this.viewActivities.set(i,t));const e=t.id;t.activity.setActivity(s);const r=t;return l(()=>{r.id===e&&(r.activity.dispose(),this.viewActivities.delete(i))})}showAccountsActivity(i){return this.showActivity(b,i)}showGlobalActivity(i){return this.showActivity(C,i)}getActivity(i){return this.globalActivities.get(i)??[]}showActivity(i,s){let t=this.globalActivities.get(i);return t||(t=[],this.globalActivities.set(i,t)),t.push(s),this._onDidChangeActivity.fire(i),l(()=>{t.splice(t.indexOf(s),1),t.length===0&&this.globalActivities.delete(i),this._onDidChangeActivity.fire(i)})}};a=h([c(0,A),c(1,m)],a),u(g,a,f.Delayed);export{a as ActivityService};
