import{timeout as g}from"../../../../vs/base/common/async.js";import{URI as h}from"../../../../vs/base/common/uri.js";import"../../../../vs/platform/extensions/common/extensions.js";import{createApiFactoryAndRegisterActors as w}from"../../../../vs/workbench/api/common/extHost.api.impl.js";import"../../../../vs/workbench/api/common/extHostExtensionActivator.js";import{AbstractExtHostExtensionService as _}from"../../../../vs/workbench/api/common/extHostExtensionService.js";import{RequireInterceptor as E}from"../../../../vs/workbench/api/common/extHostRequireInterceptor.js";import{ExtensionRuntime as v}from"../../../../vs/workbench/api/common/extHostTypes.js";import{ExtHostConsoleForwarder as y}from"../../../../vs/workbench/api/worker/extHostConsoleForwarder.js";class $ extends E{_installInterceptor(){}getModule(e,o){for(const i of this._alternatives){const t=i(e);if(t){e=t;break}}if(this._factories.has(e))return this._factories.get(e).load(e,o,()=>{throw new Error("CANNOT LOAD MODULE from here.")})}}class C extends _{extensionRuntime=v.Webworker;_fakeModules;async _beforeAlmostReadyToRunExtensions(){this._instaService.createInstance(y);const e=this._instaService.invokeFunction(w);this._fakeModules=this._instaService.createInstance($,e,{mine:this._myRegistry,all:this._globalRegistry}),await this._fakeModules.install(),performance.mark("code/extHost/didInitAPI"),await this._waitForDebuggerAttachment()}_getEntryPoint(e){return e.browser}async _loadCommonJSModule(e,o,i){o=o.with({path:R(o.path,".js")});const t=e?.identifier.value;t&&performance.mark(`code/extHost/willFetchExtensionCode/${t}`);const m=h.revive(await this._mainThreadExtensionsProxy.$asBrowserUri(o)),a=await fetch(m.toString(!0));if(t&&performance.mark(`code/extHost/didFetchExtensionCode/${t}`),a.status!==200)throw new Error(a.statusText);const u=await a.text(),f=`${o.toString(!0)}#vscode-extension`,p=`${u}
//# sourceURL=${f}`;let d;try{d=new Function("module","exports","require",p)}catch(r){throw console.error(t?`Loading code for extension ${t} failed: ${r.message}`:`Loading code failed: ${r.message}`),console.error(`${o.toString(!0)}${typeof r.line=="number"?` line ${r.line}`:""}${typeof r.column=="number"?` column ${r.column}`:""}`),console.error(r),r}e&&await this._extHostLocalizationService.initializeLocalizedMessages(e);const s={},c={exports:s},x=r=>{const l=this._fakeModules.getModule(r,o);if(l===void 0)throw new Error(`Cannot load module '${r}'`);return l};try{return i.codeLoadingStart(),t&&performance.mark(`code/extHost/willLoadExtensionCode/${t}`),d(c,s,x),c.exports!==s?c.exports:s}finally{t&&performance.mark(`code/extHost/didLoadExtensionCode/${t}`),i.codeLoadingStop()}}async $setRemoteEnvironment(e){}async _waitForDebuggerAttachment(e=5e3){if(!this._initData.environment.isExtensionDevelopmentDebug)return;const o=Date.now()+e;for(;Date.now()<o&&!("__jsDebugIsReady"in globalThis);)await g(10)}}function R(n,e){return n.endsWith(e)?n:n+e}export{C as ExtHostExtensionService};
