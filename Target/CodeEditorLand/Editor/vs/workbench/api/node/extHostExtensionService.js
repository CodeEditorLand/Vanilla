import{createRequire as h}from"node:module";import{Schemas as v}from"../../../base/common/network.js";import*as l from"../../../base/common/performance.js";import{URI as _}from"../../../base/common/uri.js";import{realpathSync as u}from"../../../base/node/extpath.js";import{createApiFactoryAndRegisterActors as x}from"../common/extHost.api.impl.js";import{AbstractExtHostExtensionService as g}from"../common/extHostExtensionService.js";import{RequireInterceptor as y}from"../common/extHostRequireInterceptor.js";import{ExtensionRuntime as S}from"../common/extHostTypes.js";import{CLIServer as E}from"./extHostCLIServer.js";import{ExtHostConsoleForwarder as I}from"./extHostConsoleForwarder.js";import{ExtHostDiskFileSystemProvider as R}from"./extHostDiskFileSystemProvider.js";import{ExtHostDownloadService as P}from"./extHostDownloadService.js";import{connectProxyResolver as k}from"./proxyResolver.js";const d=h(import.meta.url);class H extends y{_installInterceptor(){const t=this,e=d("module"),i=e._load;e._load=function(o,n,m){return o=p(o),t._factories.has(o)?t._factories.get(o).load(o,_.file(u(n.filename)),c=>i.apply(this,[c,n,m])):i.apply(this,arguments)};const s=e._resolveLookupPaths;e._resolveLookupPaths=(r,o)=>s.call(this,p(r),o);const a=e._resolveFilename;e._resolveFilename=function(o,n,m,c){return o==="vsda"&&Array.isArray(c?.paths)&&c.paths.length===0&&(c.paths=e._nodeModulePaths(import.meta.dirname)),a.call(this,o,n,m,c)};const p=r=>{for(const o of t._alternatives){const n=o(r);if(n){r=n;break}}return r}}}class U extends g{extensionRuntime=S.Node;async _beforeAlmostReadyToRunExtensions(){this._instaService.createInstance(I);const t=this._instaService.invokeFunction(x);if(this._instaService.createInstance(P),this._initData.remote.isRemote&&this._initData.remote.authority){const s=this._instaService.createInstance(E);process.env.VSCODE_IPC_HOOK_CLI=s.ipcHandlePath}this._instaService.createInstance(R),await this._instaService.createInstance(H,t,{mine:this._myRegistry,all:this._globalRegistry}).install(),l.mark("code/extHost/didInitAPI");const i=await this._extHostConfiguration.getConfigProvider();await k(this._extHostWorkspace,i,this,this._logService,this._mainThreadTelemetryProxy,this._initData),l.mark("code/extHost/didInitProxyResolver")}_getEntryPoint(t){return t.main}async _loadCommonJSModule(t,e,i){if(e.scheme!==v.file)throw new Error(`Cannot load URI: '${e}', must be of file-scheme`);let s=null;i.codeLoadingStart(),this._logService.trace(`ExtensionService#loadCommonJSModule ${e.toString(!0)}`),this._logService.flush();const a=t?.identifier.value;t&&await this._extHostLocalizationService.initializeLocalizedMessages(t);try{a&&l.mark(`code/extHost/willLoadExtensionCode/${a}`),s=(d.__$__nodeRequire??d)(e.fsPath)}finally{a&&l.mark(`code/extHost/didLoadExtensionCode/${a}`),i.codeLoadingStop()}return s}async $setRemoteEnvironment(t){if(this._initData.remote.isRemote)for(const e in t){const i=t[e];i===null?delete process.env[e]:process.env[e]=i}}}export{U as ExtHostExtensionService};
