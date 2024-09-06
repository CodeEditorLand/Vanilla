var p=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var m=(c,n,e,o)=>{for(var t=o>1?void 0:o?v(n,e):n,i=c.length-1,s;i>=0;i--)(s=c[i])&&(t=(o?s(n,e,t):s(t))||t);return o&&t&&p(n,e,t),t},h=(c,n)=>(e,o)=>n(e,o,c);import{mainWindow as f}from"../../../base/browser/window.js";import{DeferredPromise as g}from"../../../base/common/async.js";import*as _ from"../../../base/common/errors.js";import{Emitter as k}from"../../../base/common/event.js";import{Disposable as T}from"../../../base/common/lifecycle.js";import{RemoteAuthorities as r}from"../../../base/common/network.js";import*as d from"../../../base/common/performance.js";import{StopWatch as C}from"../../../base/common/stopwatch.js";import"../../../base/common/uri.js";import{ILogService as y}from"../../log/common/log.js";import{IProductService as D}from"../../product/common/productService.js";import{getRemoteAuthorityPrefix as I,RemoteConnectionType as P,WebSocketRemoteConnection as q}from"../common/remoteAuthorityResolver.js";import{parseAuthorityWithOptionalPort as A}from"../common/remoteHosts.js";let a=class extends T{constructor(e,o,t,i,s,l){super();this._logService=l;this._connectionToken=o,this._connectionTokens=new Map,this._isWorkbenchOptionsBasedResolution=e,t&&r.setDelegate(t),r.setServerRootPath(s,i)}_onDidChangeConnectionData=this._register(new k);onDidChangeConnectionData=this._onDidChangeConnectionData.event;_resolveAuthorityRequests=new Map;_cache=new Map;_connectionToken;_connectionTokens;_isWorkbenchOptionsBasedResolution;async resolveAuthority(e){let o=this._resolveAuthorityRequests.get(e);return o||(o=new g,this._resolveAuthorityRequests.set(e,o),this._isWorkbenchOptionsBasedResolution&&this._doResolveAuthority(e).then(t=>o.complete(t),t=>o.error(t))),o.p}async getCanonicalURI(e){return e}getConnectionData(e){if(!this._cache.has(e))return null;const o=this._cache.get(e),t=this._connectionTokens.get(e)||o.authority.connectionToken;return{connectTo:o.authority.connectTo,connectionToken:t}}async _doResolveAuthority(e){const o=I(e),t=C.create(!1);this._logService.info(`Resolving connection token (${o})...`),d.mark(`code/willResolveConnectionToken/${o}`);const i=await Promise.resolve(this._connectionTokens.get(e)||this._connectionToken);d.mark(`code/didResolveConnectionToken/${o}`),this._logService.info(`Resolved connection token (${o}) after ${t.elapsed()} ms`);const s=/^https:/.test(f.location.href)?443:80,{host:l,port:R}=A(e,s),u={authority:{authority:e,connectTo:new q(l,R),connectionToken:i}};return r.set(e,l,R),this._cache.set(e,u),this._onDidChangeConnectionData.fire(),u}_clearResolvedAuthority(e){this._resolveAuthorityRequests.has(e)&&(this._resolveAuthorityRequests.get(e).cancel(),this._resolveAuthorityRequests.delete(e))}_setResolvedAuthority(e,o){if(this._resolveAuthorityRequests.has(e.authority)){const t=this._resolveAuthorityRequests.get(e.authority);e.connectTo.type===P.WebSocket&&r.set(e.authority,e.connectTo.host,e.connectTo.port),e.connectionToken&&r.setConnectionToken(e.authority,e.connectionToken),t.complete({authority:e,options:o}),this._onDidChangeConnectionData.fire()}}_setResolvedAuthorityError(e,o){this._resolveAuthorityRequests.has(e)&&this._resolveAuthorityRequests.get(e).error(_.ErrorNoTelemetry.fromError(o))}_setAuthorityConnectionToken(e,o){this._connectionTokens.set(e,o),r.setConnectionToken(e,o),this._onDidChangeConnectionData.fire()}_setCanonicalURIProvider(e){}};a=m([h(4,D),h(5,y)],a);export{a as RemoteAuthorityResolverService};
