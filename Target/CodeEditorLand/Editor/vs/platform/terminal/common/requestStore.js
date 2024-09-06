var m=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var p=(r,n,e,s)=>{for(var t=s>1?void 0:s?c(n,e):n,i=r.length-1,o;i>=0;i--)(o=r[i])&&(t=(s?o(n,e,t):o(t))||t);return s&&t&&m(n,e,t),t},u=(r,n)=>(e,s)=>n(e,s,r);import{timeout as g}from"../../../../vs/base/common/async.js";import{CancellationTokenSource as _}from"../../../../vs/base/common/cancellation.js";import{Emitter as R}from"../../../../vs/base/common/event.js";import{Disposable as h,dispose as l,toDisposable as d}from"../../../../vs/base/common/lifecycle.js";import{ILogService as q}from"../../../../vs/platform/log/common/log.js";let a=class extends h{constructor(e,s){super();this._logService=s;this._timeout=e===void 0?15e3:e,this._register(d(()=>{for(const t of this._pendingRequestDisposables.values())l(t)}))}_lastRequestId=0;_timeout;_pendingRequests=new Map;_pendingRequestDisposables=new Map;_onCreateRequest=this._register(new R);onCreateRequest=this._onCreateRequest.event;createRequest(e){return new Promise((s,t)=>{const i=++this._lastRequestId;this._pendingRequests.set(i,s),this._onCreateRequest.fire({requestId:i,...e});const o=new _;g(this._timeout,o.token).then(()=>t(`Request ${i} timed out (${this._timeout}ms)`)),this._pendingRequestDisposables.set(i,[d(()=>o.cancel())])})}acceptReply(e,s){const t=this._pendingRequests.get(e);t?(this._pendingRequests.delete(e),l(this._pendingRequestDisposables.get(e)||[]),this._pendingRequestDisposables.delete(e),t(s)):this._logService.warn(`RequestStore#acceptReply was called without receiving a matching request ${e}`)}};a=p([u(1,q)],a);export{a as RequestStore};