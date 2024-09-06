var w=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var f=(s,n,r,e)=>{for(var o=e>1?void 0:e?x(n,r):n,a=s.length-1,l;a>=0;a--)(l=s[a])&&(o=(e?l(n,r,o):l(o))||o);return e&&o&&w(n,r,o),o},i=(s,n)=>(r,e)=>n(r,e,s);import{Disposable as E}from"../../../../base/common/lifecycle.js";import{URI as g}from"../../../../base/common/uri.js";import*as v from"../../../../nls.js";import{IContextKeyService as O}from"../../../../platform/contextkey/common/contextkey.js";import{ILogService as R}from"../../../../platform/log/common/log.js";import{IOpenerService as k}from"../../../../platform/opener/common/opener.js";import{ITunnelService as A,TunnelPrivacyId as I,TunnelProtocol as S}from"../../../../platform/tunnel/common/tunnel.js";import"../../../common/contributions.js";import{IBrowserWorkbenchEnvironmentService as W}from"../../../services/environment/browser/environmentService.js";import{IRemoteExplorerService as U}from"../../../services/remote/common/remoteExplorerService.js";import{forwardedPortsViewEnabled as C}from"../../../services/remote/common/tunnelModel.js";let u=class extends E{constructor(r,e,o,a,l,P){super();this.openerService=o;const m=e.options?.tunnelProvider?.tunnelFactory;if(m){P.createKey(C.key,!0);let c=e.options?.tunnelProvider?.features?.privacyOptions??[];e.options?.tunnelProvider?.features?.public&&c.length===0&&(c=[{id:"private",label:v.localize("tunnelPrivacy.private","Private"),themeIcon:"lock"},{id:"public",label:v.localize("tunnelPrivacy.public","Public"),themeIcon:"eye"}]),this._register(r.setTunnelProvider({forwardPort:async(h,b)=>{let p;try{p=m(h,b)}catch{l.trace("tunnelFactory: tunnel provider error")}if(!p)return;let t;try{t=await p}catch(d){return l.trace("tunnelFactory: tunnel provider promise error"),d instanceof Error?d.message:void 0}const T=t.localAddress.startsWith("http")?t.localAddress:`http://${t.localAddress}`;return{tunnelRemotePort:t.remoteAddress.port,tunnelRemoteHost:t.remoteAddress.host,localAddress:await this.resolveExternalUri(T),privacy:t.privacy??(t.public?I.Public:I.Private),protocol:t.protocol??S.Http,dispose:async()=>{await t.dispose()}}}}));const y=e.options?.tunnelProvider?.features?{features:{elevation:!!e.options?.tunnelProvider?.features?.elevation,public:!!e.options?.tunnelProvider?.features?.public,privacyOptions:c,protocol:e.options?.tunnelProvider?.features?.protocol===void 0?!0:!!e.options?.tunnelProvider?.features?.protocol}}:void 0;a.setTunnelInformation(y)}}static ID="workbench.contrib.tunnelFactory";async resolveExternalUri(r){try{return(await this.openerService.resolveExternalUri(g.parse(r))).resolved.toString()}catch{return r}}};u=f([i(0,A),i(1,W),i(2,k),i(3,U),i(4,R),i(5,O)],u);export{u as TunnelFactoryContribution};
