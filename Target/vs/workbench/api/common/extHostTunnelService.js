var y=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var f=(s,i,e,t)=>{for(var r=t>1?void 0:t?A(i,e):i,o=s.length-1,n;o>=0;o--)(n=s[o])&&(r=(t?n(i,e,r):n(r))||r);return t&&r&&y(i,e,r),r},a=(s,i)=>(e,t)=>i(e,t,s);import{CancellationToken as g}from"../../../base/common/cancellation.js";import{Emitter as x}from"../../../base/common/event.js";import{Disposable as w,toDisposable as h}from"../../../base/common/lifecycle.js";import*as T from"../../../nls.js";import"../../../platform/extensions/common/extensions.js";import{createDecorator as _}from"../../../platform/instantiation/common/instantiation.js";import{ILogService as S}from"../../../platform/log/common/log.js";import{DisposableTunnel as D,TunnelPrivacyId as u}from"../../../platform/tunnel/common/tunnel.js";import{MainContext as F}from"./extHost.protocol.js";import{IExtHostInitDataService as C}from"./extHostInitDataService.js";import{IExtHostRpcService as I}from"./extHostRpcService.js";import*as E from"./extHostTypes.js";import"../../services/remote/common/tunnelModel.js";import"vscode";class H extends D{}var b;(e=>{function s(t){return{remoteAddress:t.remoteAddress,localAddress:t.localAddress,public:!!t.public,privacy:t.privacy??(t.public?u.Public:u.Private),protocol:t.protocol}}e.fromApiTunnel=s;function i(t){return{remoteAddress:{host:t.tunnelRemoteHost,port:t.tunnelRemotePort},localAddress:t.localAddress,public:t.privacy!==u.ConstantPrivate&&t.privacy!==u.ConstantPrivate,privacy:t.privacy,protocol:t.protocol}}e.fromServiceTunnel=i})(b||={});const ie=_("IExtHostTunnelService");let l=class extends w{constructor(e,t,r){super();this.logService=r;this._proxy=e.getProxy(F.MainThreadTunnelService)}_serviceBrand;_proxy;_forwardPortProvider;_showCandidatePort=()=>Promise.resolve(!0);_extensionTunnels=new Map;_onDidChangeTunnels=new x;onDidChangeTunnels=this._onDidChangeTunnels.event;_providerHandleCounter=0;_portAttributesProviders=new Map;async openTunnel(e,t){this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) ${e.identifier.value} called openTunnel API for ${t.remoteAddress.host}:${t.remoteAddress.port}.`);const r=await this._proxy.$openTunnel(t,e.displayName);if(r){const o=new H(r.remoteAddress,r.localAddress,()=>this._proxy.$closeTunnel(r.remoteAddress));return this._register(o),o}}async getTunnels(){return this._proxy.$getTunnels()}nextPortAttributesProviderHandle(){return this._providerHandleCounter++}registerPortsAttributesProvider(e,t){e.portRange===void 0&&e.commandPattern===void 0&&this.logService.error("PortAttributesProvider must specify either a portRange or a commandPattern");const r=this.nextPortAttributesProviderHandle();return this._portAttributesProviders.set(r,{selector:e,provider:t}),this._proxy.$registerPortsAttributesProvider(e,r),new E.Disposable(()=>{this._portAttributesProviders.delete(r),this._proxy.$unregisterPortsAttributesProvider(r)})}async $providePortAttributes(e,t,r,o,n){const c=[];for(const d of e){const p=this._portAttributesProviders.get(d);if(!p)return[];c.push(...await Promise.all(t.map(async v=>{let P;try{P=await p.provider.providePortAttributes({port:v,pid:r,commandLine:o},n)}catch{P=await p.provider.providePortAttributes(v,r,o,n)}return{providedAttributes:P,port:v}})))}const m=c.filter(d=>!!d.providedAttributes);return m.length>0?m.map(d=>({autoForwardAction:d.providedAttributes.autoForwardAction,port:d.port})):[]}async $registerCandidateFinder(e){}registerTunnelProvider(e,t){if(this._forwardPortProvider)throw new Error("A tunnel provider has already been registered. Only the first tunnel provider to be registered will be used.");this._forwardPortProvider=async(o,n)=>await e.provideTunnel(o,n,g.None)??void 0;const r=t.tunnelFeatures?{elevation:!!t.tunnelFeatures?.elevation,privacyOptions:t.tunnelFeatures?.privacyOptions,protocol:t.tunnelFeatures.protocol===void 0?!0:t.tunnelFeatures.protocol}:void 0;return this._proxy.$setTunnelProvider(r,!0),Promise.resolve(h(()=>{this._forwardPortProvider=void 0,this._proxy.$setTunnelProvider(void 0,!1)}))}async setTunnelFactory(e,t){if(e){e.candidatePortSource!==void 0&&this._proxy.$setCandidatePortSource(e.candidatePortSource),e.showCandidatePort&&(this._showCandidatePort=e.showCandidatePort,this._proxy.$setCandidateFilter());const r=e.tunnelFactory??(t?this.makeManagedTunnelFactory(t):void 0);if(r){this._forwardPortProvider=r;let o=e.tunnelFeatures?.privacyOptions??[];e.tunnelFeatures?.public&&o.length===0&&(o=[{id:"private",label:T.localize("tunnelPrivacy.private","Private"),themeIcon:"lock"},{id:"public",label:T.localize("tunnelPrivacy.public","Public"),themeIcon:"eye"}]);const n=e.tunnelFeatures?{elevation:!!e.tunnelFeatures?.elevation,public:!!e.tunnelFeatures?.public,privacyOptions:o,protocol:!0}:void 0;this._proxy.$setTunnelProvider(n,!!e.tunnelFactory)}}else this._forwardPortProvider=void 0;return h(()=>{this._forwardPortProvider=void 0})}makeManagedTunnelFactory(e){}async $closeTunnel(e,t){if(this._extensionTunnels.has(e.host)){const r=this._extensionTunnels.get(e.host);r.has(e.port)&&(t&&r.get(e.port).disposeListener.dispose(),await r.get(e.port).tunnel.dispose(),r.delete(e.port))}}async $onDidTunnelsChange(){this._onDidChangeTunnels.fire()}async $forwardPort(e,t){if(this._forwardPortProvider)try{this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Getting tunnel from provider.");const r=this._forwardPortProvider(e,t);if(this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Got tunnel promise from provider."),r!==void 0){const o=await r;if(this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Successfully awaited tunnel from provider."),o===void 0){this.logService.error("ForwardedPorts: (ExtHostTunnelService) Resolved tunnel is undefined");return}this._extensionTunnels.has(e.remoteAddress.host)||this._extensionTunnels.set(e.remoteAddress.host,new Map);const n=this._register(o.onDidDispose(()=>(this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Extension fired tunnel's onDidDispose."),this._proxy.$closeTunnel(o.remoteAddress))));return this._extensionTunnels.get(e.remoteAddress.host).set(e.remoteAddress.port,{tunnel:o,disposeListener:n}),b.fromApiTunnel(o)}else this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Tunnel is undefined")}catch(r){if(this.logService.trace("ForwardedPorts: (ExtHostTunnelService) tunnel provider error"),r instanceof Error)return r.message}}async $applyCandidateFilter(e){const t=await Promise.all(e.map(o=>this._showCandidatePort(o.host,o.port,o.detail??""))),r=e.filter((o,n)=>t[n]);return this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) filtered from ${e.map(o=>o.port).join(", ")} to ${r.map(o=>o.port).join(", ")}`),r}};l=f([a(0,I),a(1,C),a(2,S)],l);export{l as ExtHostTunnelService,ie as IExtHostTunnelService,b as TunnelDtoConverter};
