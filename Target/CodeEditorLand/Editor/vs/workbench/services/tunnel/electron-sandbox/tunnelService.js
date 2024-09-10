var _=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var m=(c,a,e,n)=>{for(var r=n>1?void 0:n?y(a,e):a,o=c.length-1,i;o>=0;o--)(i=c[o])&&(r=(n?i(a,e,r):i(r))||r);return n&&r&&_(a,e,r),r},t=(c,a)=>(e,n)=>a(e,n,c);import{ILogService as T}from"../../../../platform/log/common/log.js";import{IWorkbenchEnvironmentService as f}from"../../environment/common/environmentService.js";import{InstantiationType as I,registerSingleton as g}from"../../../../platform/instantiation/common/extensions.js";import{ITunnelService as b,AbstractTunnelService as P,TunnelPrivacyId as A,isPortPrivileged as R,isTunnelProvider as w}from"../../../../platform/tunnel/common/tunnel.js";import{Disposable as D}from"../../../../base/common/lifecycle.js";import{ISharedProcessTunnelService as S}from"../../../../platform/remote/common/sharedProcessTunnelService.js";import{ILifecycleService as E}from"../../lifecycle/common/lifecycle.js";import{IRemoteAuthorityResolverService as W}from"../../../../platform/remote/common/remoteAuthorityResolver.js";import{IInstantiationService as k}from"../../../../platform/instantiation/common/instantiation.js";import{INativeWorkbenchEnvironmentService as C}from"../../environment/electron-sandbox/environmentService.js";import{OS as L}from"../../../../base/common/platform.js";import{IConfigurationService as x}from"../../../../platform/configuration/common/configuration.js";let v=class extends D{constructor(e,n,r,o,i,l,s,u,d){super();this._id=e;this._addressProvider=n;this.tunnelRemoteHost=r;this.tunnelRemotePort=o;this.tunnelLocalPort=i;this.localAddress=l;this._onBeforeDispose=s;this._sharedProcessTunnelService=u;this._remoteAuthorityResolverService=d;this._updateAddress(),this._register(this._remoteAuthorityResolverService.onDidChangeConnectionData(()=>this._updateAddress()))}privacy=A.Private;protocol=void 0;_updateAddress(){this._addressProvider.getAddress().then(e=>{this._sharedProcessTunnelService.setAddress(this._id,e)})}async dispose(){this._onBeforeDispose(),super.dispose(),await this._sharedProcessTunnelService.destroyTunnel(this._id)}};v=m([t(7,S),t(8,W)],v);let h=class extends P{constructor(e,n,r,o,i,l,s){super(e,s);this._environmentService=n;this._sharedProcessTunnelService=r;this._instantiationService=o;this._nativeWorkbenchEnvironmentService=l;this._register(i.onDidShutdown(()=>{this._activeSharedProcessTunnels.forEach(u=>{this._sharedProcessTunnelService.destroyTunnel(u)})}))}_activeSharedProcessTunnels=new Set;isPortPrivileged(e){return R(e,this.defaultTunnelHost,L,this._nativeWorkbenchEnvironmentService.os.release)}retainOrCreateTunnel(e,n,r,o,i,l,s,u){const d=this.getTunnelFromMap(n,r);if(d)return++d.refcount,d.value;if(w(e))return this.createWithProvider(e,n,r,i,l,s,u);{this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel without provider ${n}:${r} on local port ${i}.`);const p=this._createSharedProcessTunnel(e,n,r,o,i,l);return this.logService.trace("ForwardedPorts: (TunnelService) Tunnel created without provider."),this.addTunnelToMap(n,r,p),p}}async _createSharedProcessTunnel(e,n,r,o,i,l){const{id:s}=await this._sharedProcessTunnelService.createTunnel();this._activeSharedProcessTunnels.add(s);const u=this._environmentService.remoteAuthority,d=await this._sharedProcessTunnelService.startTunnel(u,s,n,r,o,i,l);return this._instantiationService.createInstance(v,s,e,n,r,d.tunnelLocalPort,d.localAddress,()=>{this._activeSharedProcessTunnels.delete(s)})}canTunnel(e){return super.canTunnel(e)&&!!this._environmentService.remoteAuthority}};h=m([t(0,T),t(1,f),t(2,S),t(3,k),t(4,E),t(5,C),t(6,x)],h),g(b,h,I.Delayed);export{h as TunnelService};
