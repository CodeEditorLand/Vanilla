var m=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var c=(t,r,e,s)=>{for(var o=s>1?void 0:s?v(r,e):r,i=t.length-1,a;i>=0;i--)(a=t[i])&&(o=(s?a(r,e,o):a(o))||o);return s&&o&&m(r,e,o),o},p=(t,r)=>(e,s)=>r(e,s,t);import{Action as P}from"../../../../vs/base/common/actions.js";import{localize as d}from"../../../../vs/nls.js";import{ICommandService as x}from"../../../../vs/platform/commands/common/commands.js";import{IProgressService as S,ProgressLocation as g}from"../../../../vs/platform/progress/common/progress.js";import{extHostNamedCustomer as _}from"../../../../vs/workbench/services/extensions/common/extHostCustomers.js";import{ExtHostContext as I,MainContext as f}from"../common/extHost.protocol.js";class h extends P{constructor(r,e,s){super(r,e,void 0,!0,()=>s.executeCommand("_extensions.manage",r))}}let n=class{constructor(r,e,s){this._commandService=s;this._proxy=r.getProxy(I.ExtHostProgress),this._progressService=e}_progressService;_progress=new Map;_proxy;dispose(){this._progress.forEach(r=>r.resolve()),this._progress.clear()}async $startProgress(r,e,s){const o=this._createTask(r);e.location===g.Notification&&s&&(e={...e,location:g.Notification,secondaryActions:[new h(s,d("manageExtension","Manage Extension"),this._commandService)]}),this._progressService.withProgress(e,o,()=>this._proxy.$acceptProgressCanceled(r))}$progressReport(r,e){this._progress.get(r)?.progress.report(e)}$progressEnd(r){const e=this._progress.get(r);e&&(e.resolve(),this._progress.delete(r))}_createTask(r){return e=>new Promise(s=>{this._progress.set(r,{resolve:s,progress:e})})}};n=c([_(f.MainThreadProgress),p(1,S),p(2,x)],n);export{n as MainThreadProgress};