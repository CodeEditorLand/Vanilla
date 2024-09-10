var x=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var h=(u,d,e,o)=>{for(var r=o>1?void 0:o?R(d,e):d,n=u.length-1,s;n>=0;n--)(s=u[n])&&(r=(o?s(d,e,r):s(r))||r);return o&&r&&x(d,e,r),r},a=(u,d)=>(e,o)=>d(e,o,u);import*as P from"../../../nls.js";import{MainContext as E,ExtHostContext as _,CandidatePortSource as p}from"../common/extHost.protocol.js";import{TunnelDtoConverter as I}from"../common/extHostTunnelService.js";import{extHostNamedCustomer as F}from"../../services/extensions/common/extHostCustomers.js";import{IRemoteExplorerService as w,PORT_AUTO_FORWARD_SETTING as g,PORT_AUTO_SOURCE_SETTING as S,PORT_AUTO_SOURCE_SETTING_HYBRID as $,PORT_AUTO_SOURCE_SETTING_OUTPUT as y}from"../../services/remote/common/remoteExplorerService.js";import{ITunnelService as H,TunnelProtocol as D}from"../../../platform/tunnel/common/tunnel.js";import{Disposable as N}from"../../../base/common/lifecycle.js";import{INotificationService as O,Severity as U}from"../../../platform/notification/common/notification.js";import{IConfigurationService as k}from"../../../platform/configuration/common/configuration.js";import{ILogService as M}from"../../../platform/log/common/log.js";import{IRemoteAgentService as K}from"../../services/remote/common/remoteAgentService.js";import{Registry as m}from"../../../platform/registry/common/platform.js";import{Extensions as v}from"../../../platform/configuration/common/configurationRegistry.js";import{IContextKeyService as G}from"../../../platform/contextkey/common/contextkey.js";import{TunnelCloseReason as T,TunnelSource as A,forwardedPortsViewEnabled as V,makeAddress as z}from"../../services/remote/common/tunnelModel.js";let c=class extends N{constructor(e,o,r,n,s,i,t,l){super();this.remoteExplorerService=o;this.tunnelService=r;this.notificationService=n;this.configurationService=s;this.logService=i;this.remoteAgentService=t;this.contextKeyService=l;this._proxy=e.getProxy(_.ExtHostTunnelService),this._register(r.onTunnelOpened(()=>this._proxy.$onDidTunnelsChange())),this._register(r.onTunnelClosed(()=>this._proxy.$onDidTunnelsChange()))}_proxy;elevateionRetry=!1;portsAttributesProviders=new Map;processFindingEnabled(){return(!!this.configurationService.getValue(g)||this.tunnelService.hasTunnelProvider)&&this.configurationService.getValue(S)!==y}async $setRemoteTunnelService(e){this.remoteExplorerService.namedProcesses.set(e,"Code Extension Host"),this.remoteExplorerService.portsFeaturesEnabled?this._proxy.$registerCandidateFinder(this.processFindingEnabled()):this._register(this.remoteExplorerService.onEnabledPortsFeatures(()=>this._proxy.$registerCandidateFinder(this.processFindingEnabled()))),this._register(this.configurationService.onDidChangeConfiguration(async o=>{if(this.remoteExplorerService.portsFeaturesEnabled&&(o.affectsConfiguration(g)||o.affectsConfiguration(S)))return this._proxy.$registerCandidateFinder(this.processFindingEnabled())})),this._register(this.tunnelService.onAddedTunnelProvider(async()=>{if(this.remoteExplorerService.portsFeaturesEnabled)return this._proxy.$registerCandidateFinder(this.processFindingEnabled())}))}_alreadyRegistered=!1;async $registerPortsAttributesProvider(e,o){this.portsAttributesProviders.set(o,e),this._alreadyRegistered||(this.remoteExplorerService.tunnelModel.addAttributesProvider(this),this._alreadyRegistered=!0)}async $unregisterPortsAttributesProvider(e){this.portsAttributesProviders.delete(e)}async providePortAttributes(e,o,r,n){if(this.portsAttributesProviders.size===0)return[];const s=Array.from(this.portsAttributesProviders.entries()).filter(i=>{const t=i[1],l=typeof t.portRange=="number"?[t.portRange,t.portRange+1]:t.portRange,C=l?e.some(f=>l[0]<=f&&f<l[1]):!0,b=!t.commandPattern||r&&r.match(t.commandPattern);return C&&b}).map(i=>i[0]);return s.length===0?[]:this._proxy.$providePortAttributes(s,e,o,r,n)}async $openTunnel(e,o){const r=await this.remoteExplorerService.forward({remote:e.remoteAddress,local:e.localAddressPort,name:e.label,source:{source:A.Extension,description:o},elevateIfNeeded:!1});if(!(!r||typeof r=="string"))return!this.elevateionRetry&&e.localAddressPort!==void 0&&r.tunnelLocalPort!==void 0&&this.tunnelService.isPortPrivileged(e.localAddressPort)&&r.tunnelLocalPort!==e.localAddressPort&&this.tunnelService.canElevate&&this.elevationPrompt(e,r,o),I.fromServiceTunnel(r)}async elevationPrompt(e,o,r){return this.notificationService.prompt(U.Info,P.localize("remote.tunnel.openTunnel","The extension {0} has forwarded port {1}. You'll need to run as superuser to use port {2} locally.",r,e.remoteAddress.port,e.localAddressPort),[{label:P.localize("remote.tunnelsView.elevationButton","Use Port {0} as Sudo...",o.tunnelRemotePort),run:async()=>{this.elevateionRetry=!0,await this.remoteExplorerService.close({host:o.tunnelRemoteHost,port:o.tunnelRemotePort},T.Other),await this.remoteExplorerService.forward({remote:e.remoteAddress,local:e.localAddressPort,name:e.label,source:{source:A.Extension,description:r},elevateIfNeeded:!0}),this.elevateionRetry=!1}}])}async $closeTunnel(e){return this.remoteExplorerService.close(e,T.Other)}async $getTunnels(){return(await this.tunnelService.tunnels).map(e=>({remoteAddress:{port:e.tunnelRemotePort,host:e.tunnelRemoteHost},localAddress:e.localAddress,privacy:e.privacy,protocol:e.protocol}))}async $onFoundNewCandidates(e){this.remoteExplorerService.onFoundNewCandidates(e)}async $setTunnelProvider(e){const o={forwardPort:(r,n)=>this._proxy.$forwardPort(r,n).then(i=>{if(i){if(typeof i=="string")return i}else return;const t=i;return this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) New tunnel established by tunnel provider: ${t?.remoteAddress.host}:${t?.remoteAddress.port}`),{tunnelRemotePort:t.remoteAddress.port,tunnelRemoteHost:t.remoteAddress.host,localAddress:typeof t.localAddress=="string"?t.localAddress:z(t.localAddress.host,t.localAddress.port),tunnelLocalPort:typeof t.localAddress!="string"?t.localAddress.port:void 0,public:t.public,privacy:t.privacy,protocol:t.protocol??D.Http,dispose:async l=>(this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) Closing tunnel from tunnel provider: ${t?.remoteAddress.host}:${t?.remoteAddress.port}`),this._proxy.$closeTunnel({host:t.remoteAddress.host,port:t.remoteAddress.port},l))}})};e&&this.tunnelService.setTunnelFeatures(e),this.tunnelService.setTunnelProvider(o),this.contextKeyService.createKey(V.key,!0)}async $setCandidateFilter(){this.remoteExplorerService.setCandidateFilter(e=>this._proxy.$applyCandidateFilter(e))}async $setCandidatePortSource(e){this.remoteAgentService.getEnvironment().then(()=>{switch(e){case p.None:{m.as(v.Configuration).registerDefaultConfigurations([{overrides:{"remote.autoForwardPorts":!1}}]);break}case p.Output:{m.as(v.Configuration).registerDefaultConfigurations([{overrides:{"remote.autoForwardPortsSource":y}}]);break}case p.Hybrid:{m.as(v.Configuration).registerDefaultConfigurations([{overrides:{"remote.autoForwardPortsSource":$}}]);break}default:}}).catch(()=>{})}};c=h([F(E.MainThreadTunnelService),a(1,w),a(2,H),a(3,O),a(4,k),a(5,M),a(6,K),a(7,G)],c);export{c as MainThreadTunnelService};
