var I=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var c=(o,e,i,t)=>{for(var r=t>1?void 0:t?v(e,i):e,n=o.length-1,s;n>=0;n--)(s=o[n])&&(r=(t?s(e,i,r):s(r))||r);return t&&r&&I(e,i,r),r},d=(o,e)=>(i,t)=>e(i,t,o);import{insert as l}from"../../../../base/common/arrays.js";import{toDisposable as p}from"../../../../base/common/lifecycle.js";import{InstantiationType as S,registerSingleton as m}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as h}from"../../../../platform/log/common/log.js";import{IEditSessionIdentityService as f}from"../../../../platform/workspace/common/editSessions.js";import{IExtensionService as y}from"../../extensions/common/extensions.js";let a=class{constructor(e,i){this._extensionService=e;this._logService=i}_serviceBrand;_editSessionIdentifierProviders=new Map;registerEditSessionIdentityProvider(e){if(this._editSessionIdentifierProviders.get(e.scheme))throw new Error(`A provider has already been registered for scheme ${e.scheme}`);return this._editSessionIdentifierProviders.set(e.scheme,e),p(()=>{this._editSessionIdentifierProviders.delete(e.scheme)})}async getEditSessionIdentifier(e,i){const{scheme:t}=e.uri,r=await this.activateProvider(t);return this._logService.trace(`EditSessionIdentityProvider for scheme ${t} available: ${!!r}`),r?.getEditSessionIdentifier(e,i)}async provideEditSessionIdentityMatch(e,i,t,r){const{scheme:n}=e.uri,s=await this.activateProvider(n);return this._logService.trace(`EditSessionIdentityProvider for scheme ${n} available: ${!!s}`),s?.provideEditSessionIdentityMatch?.(e,i,t,r)}async onWillCreateEditSessionIdentity(e,i){this._logService.debug("Running onWillCreateEditSessionIdentity participants...");for(const t of this._participants)await t.participate(e,i);this._logService.debug(`Done running ${this._participants.length} onWillCreateEditSessionIdentity participants.`)}_participants=[];addEditSessionIdentityCreateParticipant(e){const i=l(this._participants,e);return p(()=>i())}async activateProvider(e){const i=e==="vscode-remote"?"file":e,t=this._editSessionIdentifierProviders.get(e);return t||(await this._extensionService.activateByEvent(`onEditSession:${i}`),this._editSessionIdentifierProviders.get(e))}};a=c([d(0,y),d(1,h)],a),m(f,a,S.Delayed);export{a as EditSessionIdentityService};
