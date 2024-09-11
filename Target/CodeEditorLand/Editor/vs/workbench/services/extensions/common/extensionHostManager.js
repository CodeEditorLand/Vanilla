var A=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var E=(s,r,t,n)=>{for(var e=n>1?void 0:n?D(r,t):r,i=s.length-1,a;i>=0;i--)(a=s[i])&&(e=(n?a(r,t,e):a(e))||e);return n&&e&&A(r,t,e),e},h=(s,r)=>(t,n)=>r(t,n,s);import{IntervalTimer as T}from"../../../../base/common/async.js";import{VSBuffer as L}from"../../../../base/common/buffer.js";import*as _ from"../../../../base/common/errors.js";import{Emitter as k}from"../../../../base/common/event.js";import{Disposable as $}from"../../../../base/common/lifecycle.js";import{StopWatch as g}from"../../../../base/common/stopwatch.js";import"../../../../base/common/uri.js";import"../../../../base/parts/ipc/common/ipc.js";import*as M from"../../../../nls.js";import{Categories as U}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as O,registerAction2 as N}from"../../../../platform/actions/common/actions.js";import"../../../../platform/extensions/common/extensions.js";import{IInstantiationService as B}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as q}from"../../../../platform/log/common/log.js";import{RemoteAuthorityResolverErrorCode as I,getRemoteAuthorityPrefix as K}from"../../../../platform/remote/common/remoteAuthorityResolver.js";import{ITelemetryService as b}from"../../../../platform/telemetry/common/telemetry.js";import{IEditorService as W}from"../../editor/common/editorService.js";import{IWorkbenchEnvironmentService as F}from"../../environment/common/environmentService.js";import{ExtHostCustomersRegistry as H}from"./extHostCustomers.js";import{extensionHostKindToString as m}from"./extensionHostKind.js";import"./extensionHostManagers.js";import"./extensionHostProtocol.js";import"./extensionHostProxy.js";import"./extensionRunningLocation.js";import{ActivationKind as R}from"./extensions.js";import"./proxyIdentifier.js";import{RPCProtocol as Z,RequestInitiator as S}from"./rpcProtocol.js";const j=!1,z=!0;let d=class extends ${constructor(t,n,e,i,a,l,u){super();this._internalExtensionService=e;this._instantiationService=i;this._environmentService=a;this._telemetryService=l;this._logService=u;this._cachedActivationEvents=new Map,this._resolvedActivationEvents=new Set,this._rpcProtocol=null,this._customers=[],this._extensionHost=t,this.onDidExit=this._extensionHost.onExit;const p={time:Date.now(),action:"starting",kind:m(this.kind)};this._telemetryService.publicLog2("extensionHostStartup",p),this._proxy=this._extensionHost.start().then(o=>{this._hasStarted=!0;const c={time:Date.now(),action:"success",kind:m(this.kind)};return this._telemetryService.publicLog2("extensionHostStartup",c),this._createExtensionHostCustomers(this.kind,o)},o=>{this._logService.error(`Error received from starting extension host (kind: ${m(this.kind)})`),this._logService.error(o);const c={time:Date.now(),action:"error",kind:m(this.kind)};return o&&o.name&&(c.errorName=o.name),o&&o.message&&(c.errorMessage=o.message),o&&o.stack&&(c.errorStack=o.stack),this._telemetryService.publicLog2("extensionHostStartup",c),null}),this._proxy.then(()=>{n.forEach(o=>this.activateByEvent(o,R.Normal)),this._register(Q({measure:()=>this.measure()}))})}onDidExit;_onDidChangeResponsiveState=this._register(new k);onDidChangeResponsiveState=this._onDidChangeResponsiveState.event;_cachedActivationEvents;_resolvedActivationEvents;_rpcProtocol;_customers;_extensionHost;_proxy;_hasStarted=!1;get pid(){return this._extensionHost.pid}get kind(){return this._extensionHost.runningLocation.kind}get startup(){return this._extensionHost.startup}get friendyName(){return G(this.kind,this.pid)}async disconnect(){await this._extensionHost?.disconnect?.()}dispose(){this._extensionHost?.dispose(),this._rpcProtocol?.dispose();for(let t=0,n=this._customers.length;t<n;t++){const e=this._customers[t];try{e.dispose()}catch(i){_.onUnexpectedError(i)}}this._proxy=null,super.dispose()}async measure(){const t=await this._proxy;if(!t)return null;const n=await this._measureLatency(t),e=await this._measureDown(t),i=await this._measureUp(t);return{remoteAuthority:this._extensionHost.remoteAuthority,latency:n,down:e,up:i}}async ready(){await this._proxy}async _measureLatency(t){let e=0;for(let i=0;i<10;i++){const a=g.create();await t.test_latency(i),a.stop(),e+=a.elapsed()}return e/10}static _convert(t,n){return t*1e3*8/n}async _measureUp(t){const e=L.alloc(10485760),i=Math.ceil(Math.random()*256);for(let l=0;l<e.byteLength;l++)e.writeUInt8(l,i);const a=g.create();return await t.test_up(e),a.stop(),d._convert(10485760,a.elapsed())}async _measureDown(t){const e=g.create();return await t.test_down(10485760),e.stop(),d._convert(10485760,e.elapsed())}_createExtensionHostCustomers(t,n){let e=null;j||this._environmentService.logExtensionHostCommunication?e=new J(t):y.isEnabled()&&(e=new y(this._telemetryService)),this._rpcProtocol=new Z(n,e),this._register(this._rpcProtocol.onDidChangeResponsiveState(o=>this._onDidChangeResponsiveState.fire(o)));let i=null,a=[];const l={remoteAuthority:this._extensionHost.remoteAuthority,extensionHostKind:this.kind,getProxy:o=>this._rpcProtocol.getProxy(o),set:(o,c)=>this._rpcProtocol.set(o,c),dispose:()=>this._rpcProtocol.dispose(),assertRegistered:o=>this._rpcProtocol.assertRegistered(o),drain:()=>this._rpcProtocol.drain(),internalExtensionService:this._internalExtensionService,_setExtensionHostProxy:o=>{i=o},_setAllMainProxyIdentifiers:o=>{a=o}},u=H.getNamedCustomers();for(let o=0,c=u.length;o<c;o++){const[P,C]=u[o];try{const x=this._instantiationService.createInstance(C,l);this._customers.push(x),this._rpcProtocol.set(P,x)}catch(x){this._logService.error(`Cannot instantiate named customer: '${P.sid}'`),this._logService.error(x),_.onUnexpectedError(x)}}const p=H.getCustomers();for(const o of p)try{const c=this._instantiationService.createInstance(o,l);this._customers.push(c)}catch(c){this._logService.error(c),_.onUnexpectedError(c)}if(!i)throw new Error("Missing IExtensionHostProxy!");return this._rpcProtocol.assertRegistered(a),i}async activate(t,n){const e=await this._proxy;return e?e.activate(t,n):!1}activateByEvent(t,n){return n===R.Immediate&&!this._hasStarted?Promise.resolve():(this._cachedActivationEvents.has(t)||this._cachedActivationEvents.set(t,this._activateByEvent(t,n)),this._cachedActivationEvents.get(t))}activationEventIsDone(t){return this._resolvedActivationEvents.has(t)}async _activateByEvent(t,n){if(!this._proxy)return;const e=await this._proxy;if(e){if(!this._extensionHost.extensions.containsActivationEvent(t)){this._resolvedActivationEvents.add(t);return}await e.activateByEvent(t,n),this._resolvedActivationEvents.add(t)}}async getInspectPort(t){if(this._extensionHost){t&&await this._extensionHost.enableInspectPort();const n=this._extensionHost.getInspectPort();if(n)return n}}async resolveAuthority(t,n){const e=g.create(!1),i=()=>`[${m(this._extensionHost.runningLocation.kind)}${this._extensionHost.runningLocation.affinity}][resolveAuthority(${K(t)},${n})][${e.elapsed()}ms] `,a=o=>this._logService.info(`${i()}${o}`),l=(o,c=void 0)=>this._logService.error(`${i()}${o}`,c);a("obtaining proxy...");const u=await this._proxy;if(!u)return l("no proxy"),{type:"error",error:{message:"Cannot resolve authority",code:I.Unknown,detail:void 0}};a("invoking...");const p=new T;try{p.cancelAndSet(()=>a("waiting..."),1e3);const o=await u.resolveAuthority(t,n);return p.dispose(),o.type==="ok"?a(`returned ${o.value.authority.connectTo}`):l("returned an error",o.error),o}catch(o){return p.dispose(),l("returned an error",o),{type:"error",error:{message:o.message,code:I.Unknown,detail:o}}}}async getCanonicalURI(t,n){const e=await this._proxy;if(!e)throw new Error("Cannot resolve canonical URI");return e.getCanonicalURI(t,n)}async start(t,n,e){const i=await this._proxy;if(!i)return;const a=this._extensionHost.extensions.set(t,n,e);return i.startExtensionHost(a)}async extensionTestsExecute(){const t=await this._proxy;if(!t)throw new Error("Could not obtain Extension Host Proxy");return t.extensionTestsExecute()}representsRunningLocation(t){return this._extensionHost.runningLocation.equals(t)}async deltaExtensions(t){const n=await this._proxy;if(!n)return;const e=this._extensionHost.extensions.delta(t);if(e)return n.deltaExtensions(e)}containsExtension(t){return this._extensionHost.extensions?.containsExtension(t)??!1}async setRemoteEnvironment(t){const n=await this._proxy;if(n)return n.setRemoteEnvironment(t)}};d=E([h(3,B),h(4,F),h(5,b),h(6,q)],d);function G(s,r){return r?`${m(s)} pid: ${r}`:`${m(s)}`}const V=[["#2977B1","#FC802D","#34A13A","#D3282F","#9366BA"],["#8B564C","#E177C0","#7F7F7F","#BBBE3D","#2EBECD"]];function w(s){if(Array.isArray(s))return s;if(s&&typeof s=="object"&&typeof s.toString=="function"){const r=s.toString();if(r!=="[object Object]")return r}return s}function X(s){return Array.isArray(s)?s.map(w):w(s)}class J{constructor(r){this._kind=r}_totalIncoming=0;_totalOutgoing=0;_log(r,t,n,e,i,a,l){l=X(l);const u=V[i],p=z?u[e%u.length]:"#000000";let o=[`%c[${m(this._kind)}][${r}]%c[${String(t).padStart(7)}]%c[len: ${String(n).padStart(5)}]%c${String(e).padStart(5)} - ${a}`,"color: darkgreen","color: grey","color: grey",`color: ${p}`];/\($/.test(a)?(o=o.concat(l),o.push(")")):o.push(l)}logIncoming(r,t,n,e,i){this._totalIncoming+=r,this._log("Ext \u2192 Win",this._totalIncoming,r,t,n,e,i)}logOutgoing(r,t,n,e,i){this._totalOutgoing+=r,this._log("Win \u2192 Ext",this._totalOutgoing,r,t,n,e,i)}}let y=class{constructor(r){this._telemetryService=r}static isEnabled(){return Math.trunc(Math.random()*1e3)<.5}_pendingRequests=new Map;logIncoming(r,t,n,e){if(n===S.LocalSide&&/^receiveReply(Err)?:/.test(e)){const i=this._pendingRequests.get(t)??"unknown_reply";this._pendingRequests.delete(t),this._telemetryService.publicLog2("extensionhost.incoming",{type:`${e} ${i}`,length:r})}n===S.OtherSide&&/^receiveRequest /.test(e)&&this._telemetryService.publicLog2("extensionhost.incoming",{type:`${e}`,length:r})}logOutgoing(r,t,n,e){n===S.LocalSide&&e.startsWith("request: ")&&(this._pendingRequests.set(t,e),this._telemetryService.publicLog2("extensionhost.outgoing",{type:e,length:r}))}};y=E([h(0,b)],y);const v=[];function Q(s){return v.push(s),{dispose:()=>{for(let r=0;r<v.length;r++)if(v[r]===s){v.splice(r,1);return}}}}function Y(){return v.slice(0)}N(class f extends O{constructor(){super({id:"editor.action.measureExtHostLatency",title:M.localize2("measureExtHostLatency","Measure Extension Host Latency"),category:U.Developer,f1:!0})}async run(r){const t=r.get(W),n=await Promise.all(Y().map(e=>e.measure()));t.openEditor({resource:void 0,contents:n.map(f._print).join(`

`),options:{pinned:!0}})}static _print(r){return r?`${r.remoteAuthority?`Authority: ${r.remoteAuthority}
`:""}Roundtrip latency: ${r.latency.toFixed(3)}ms
Up: ${f._printSpeed(r.up)}
Down: ${f._printSpeed(r.down)}
`:""}static _printSpeed(r){return r<=1024?`${r} bps`:r<1024*1024?`${(r/1024).toFixed(1)} kbps`:`${(r/1024/1024).toFixed(1)} Mbps`}});export{d as ExtensionHostManager,G as friendlyExtHostName};
