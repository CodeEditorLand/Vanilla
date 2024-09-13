var y=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var h=(s,e,n,o)=>{for(var t=o>1?void 0:o?g(e,n):e,a=s.length-1,m;a>=0;a--)(m=s[a])&&(t=(o?m(e,n,t):m(t))||t);return o&&t&&y(e,n,t),t},i=(s,e)=>(n,o)=>e(n,o,s);import{Codicon as b}from"../../../../base/common/codicons.js";import{isWeb as p}from"../../../../base/common/platform.js";import C from"../../../../base/common/severity.js";import{localize as c}from"../../../../nls.js";import{IDialogService as w}from"../../../../platform/dialogs/common/dialogs.js";import{IOpenerService as I}from"../../../../platform/opener/common/opener.js";import{IProductService as M}from"../../../../platform/product/common/productService.js";import{getRemoteName as v}from"../../../../platform/remote/common/remoteHosts.js";import{IStorageService as A,StorageScope as l,StorageTarget as S}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as _}from"../../../../platform/telemetry/common/telemetry.js";import{IBannerService as E}from"../../../services/banner/browser/bannerService.js";import{IWorkbenchEnvironmentService as L}from"../../../services/environment/common/environmentService.js";import{IHostService as R}from"../../../services/host/browser/host.js";import{IRemoteAgentService as T,remoteConnectionLatencyMeasurer as N}from"../../../services/remote/common/remoteAgentService.js";const d="remote.unsupportedConnectionChoice",f="workbench.banner.remote.unsupportedConnection.dismissed";let u=class{constructor(e,n,o,t,a,m,P,r,D){this._remoteAgentService=e;this._environmentService=n;this._telemetryService=o;this.bannerService=t;this.dialogService=a;this.openerService=m;this.hostService=P;this.storageService=r;this.productService=D;this._environmentService.remoteAuthority&&this._checkInitialRemoteConnectionHealth()}async _confirmConnection(){let e;(r=>(r[r.Allow=1]="Allow",r[r.LearnMore=2]="LearnMore",r[r.Cancel=0]="Cancel"))(e||={});const{result:n,checkboxChecked:o}=await this.dialogService.prompt({type:C.Warning,message:c("unsupportedGlibcWarning","You are about to connect to an OS version that is unsupported by {0}.",this.productService.nameLong),buttons:[{label:c({key:"allow",comment:["&& denotes a mnemonic"]},"&&Allow"),run:()=>1},{label:c({key:"learnMore",comment:["&& denotes a mnemonic"]},"&&Learn More"),run:async()=>(await this.openerService.open("https://aka.ms/vscode-remote/faq/old-linux"),2)}],cancelButton:{run:()=>0},checkbox:{label:c("remember","Do not show again")}});if(n===2)return await this._confirmConnection();const t=n===1;return t&&o&&this.storageService.store(`${d}.${this._environmentService.remoteAuthority}`,t,l.PROFILE,S.MACHINE),t}async _checkInitialRemoteConnectionHealth(){try{const e=await this._remoteAgentService.getRawEnvironment();if(e&&e.isUnsupportedGlibc){let n=this.storageService.getBoolean(`${d}.${this._environmentService.remoteAuthority}`,l.PROFILE);if(n===void 0&&(n=await this._confirmConnection()),n){const o=this.storageService.get(`${f}`,l.PROFILE)??"";if(o.slice(0,o.lastIndexOf("."))!==this.productService.version.slice(0,this.productService.version.lastIndexOf("."))){const a=[{label:c("unsupportedGlibcBannerLearnMore","Learn More"),href:"https://aka.ms/vscode-remote/faq/old-linux"}];this.bannerService.show({id:"unsupportedGlibcWarning.banner",message:c("unsupportedGlibcWarning.banner","You are connected to an OS version that is unsupported by {0}.",this.productService.nameLong),actions:a,icon:b.warning,closeLabel:`Do not show again in v${this.productService.version}`,onClose:()=>{this.storageService.store(`${f}`,this.productService.version,l.PROFILE,S.MACHINE)}})}}else{this.hostService.openWindow({forceReuseWindow:!0,remoteAuthority:null});return}}this._telemetryService.publicLog2("remoteConnectionSuccess",{web:p,connectionTimeMs:await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),remoteName:v(this._environmentService.remoteAuthority)}),await this._measureExtHostLatency()}catch(e){this._telemetryService.publicLog2("remoteConnectionFailure",{web:p,connectionTimeMs:await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),remoteName:v(this._environmentService.remoteAuthority),message:e?e.message:""})}}async _measureExtHostLatency(){const e=await N.measure(this._remoteAgentService);e!==void 0&&this._telemetryService.publicLog2("remoteConnectionLatency",{web:p,remoteName:v(this._environmentService.remoteAuthority),latencyMs:e.current})}};u=h([i(0,T),i(1,L),i(2,_),i(3,E),i(4,w),i(5,I),i(6,R),i(7,A),i(8,M)],u);export{u as InitialRemoteConnectionHealthContribution};
