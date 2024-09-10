var u=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var m=(l,e,t,n)=>{for(var i=n>1?void 0:n?v(e,t):e,r=l.length-1,o;r>=0;r--)(o=l[r])&&(i=(n?o(e,t,i):o(i))||i);return n&&i&&u(e,t,i),i},s=(l,e)=>(t,n)=>e(t,n,l);import*as h from"../../../base/common/performance.js";import{URI as x}from"../../../base/common/uri.js";import{MainContext as f}from"./extHost.protocol.js";import{IExtHostConfiguration as _}from"./extHostConfiguration.js";import{nullExtensionDescription as y}from"../../services/extensions/common/extensions.js";import"vscode";import{ExtensionIdentifierMap as I}from"../../../platform/extensions/common/extensions.js";import"./extHost.api.impl.js";import{IExtHostRpcService as S}from"./extHostRpcService.js";import{IExtHostInitDataService as g}from"./extHostInitDataService.js";import{IInstantiationService as w}from"../../../platform/instantiation/common/instantiation.js";import{IExtHostExtensionService as E}from"./extHostExtensionService.js";import{ILogService as P}from"../../../platform/log/common/log.js";import{escapeRegExpCharacters as T}from"../../../base/common/strings.js";let c=class{constructor(e,t,n,i,r,o,d){this._apiFactory=e;this._extensionRegistry=t;this._instaService=n;this._extHostConfiguration=i;this._extHostExtensionService=r;this._initData=o;this._logService=d;this._factories=new Map,this._alternatives=[]}_factories;_alternatives;async install(){this._installInterceptor(),h.mark("code/extHost/willWaitForConfig");const e=await this._extHostConfiguration.getConfigProvider();h.mark("code/extHost/didWaitForConfig");const t=await this._extHostExtensionService.getExtensionPathIndex();this.register(new M(this._apiFactory,t,this._extensionRegistry,e,this._logService)),this.register(this._instaService.createInstance(a)),this._initData.remote.isRemote&&this.register(this._instaService.createInstance(p,t,this._initData.environment.appUriScheme))}register(e){if("nodeModuleName"in e)if(Array.isArray(e.nodeModuleName))for(const t of e.nodeModuleName)this._factories.set(t,e);else this._factories.set(e.nodeModuleName,e);typeof e.alternativeModuleName=="function"&&this._alternatives.push(t=>e.alternativeModuleName(t))}};c=m([s(2,w),s(3,_),s(4,E),s(5,g),s(6,P)],c);let a=class{static aliased=new Map([["vscode-ripgrep","@vscode/ripgrep"],["vscode-windows-registry","@vscode/windows-registry"]]);re;constructor(e){if(e.environment.appRoot&&a.aliased.size){const t=T(this.forceForwardSlashes(e.environment.appRoot.fsPath)),n="[a-z0-9_.-]",i=`@${n}+\\/${n}+|${n}+`,r="node_modules|node_modules\\.asar(?:\\.unpacked)?";this.re=new RegExp(`^(${t}/${r}\\/)(${i})(.*)$`,"i")}}alternativeModuleName(e){if(!this.re)return;const t=this.re.exec(this.forceForwardSlashes(e));if(!t)return;const[,n,i,r]=t,o=a.aliased.get(i);if(o!==void 0)return console.warn(`${i} as been renamed to ${o}, please update your imports`),n+o+r}forceForwardSlashes(e){return e.replace(/\\/g,"/")}};a=m([s(0,g)],a);class M{constructor(e,t,n,i,r){this._apiFactory=e;this._extensionPaths=t;this._extensionRegistry=n;this._configProvider=i;this._logService=r}nodeModuleName="vscode";_extApiImpl=new I;_defaultApiImpl;load(e,t){const n=this._extensionPaths.findSubstr(t);if(n){let i=this._extApiImpl.get(n.identifier);return i||(i=this._apiFactory(n,this._extensionRegistry,this._configProvider),this._extApiImpl.set(n.identifier,i)),i}if(!this._defaultApiImpl){let i="";this._extensionPaths.forEach((r,o)=>i+=`	${o} -> ${r.identifier.value}
`),this._logService.warn(`Could not identify extension for 'vscode' require call from ${t}. These are the extension path mappings: 
${i}`),this._defaultApiImpl=this._apiFactory(y,this._extensionRegistry,this._configProvider)}return this._defaultApiImpl}}let p=class{constructor(e,t,n){this._extensionPaths=e;this._appUriScheme=t;this._mainThreadTelemetry=n.getProxy(f.MainThreadTelemetry);const i=n.getProxy(f.MainThreadWindow);this._impl=(r,o)=>{const d=x.parse(r);return o?this.callOriginal(r,o):d.scheme==="http"||d.scheme==="https"?i.$openUri(d,r,{allowTunneling:!0}):d.scheme==="mailto"||d.scheme===this._appUriScheme?i.$openUri(d,r,{}):this.callOriginal(r,o)}}nodeModuleName=["open","opn"];_extensionId;_original;_impl;_mainThreadTelemetry;load(e,t,n){const i=this._extensionPaths.findSubstr(t);return i&&(this._extensionId=i.identifier.value,this.sendShimmingTelemetry()),this._original=n(e),this._impl}callOriginal(e,t){return this.sendNoForwardTelemetry(),this._original(e,t)}sendShimmingTelemetry(){this._extensionId&&this._mainThreadTelemetry.$publicLog2("shimming.open",{extension:this._extensionId})}sendNoForwardTelemetry(){this._extensionId&&this._mainThreadTelemetry.$publicLog2("shimming.open.call.noForward",{extension:this._extensionId})}};p=m([s(2,S)],p);export{c as RequireInterceptor};
