var v=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var T=(l,e,o,t)=>{for(var i=t>1?void 0:t?_(e,o):e,a=l.length-1,n;a>=0;a--)(n=l[a])&&(i=(t?n(e,o,i):n(i))||i);return t&&i&&v(e,o,i),i},c=(l,e)=>(o,t)=>e(o,t,l);import{createWebWorker as f}from"../../../../../base/browser/defaultWorkerFactory.js";import{canASAR as g}from"../../../../../base/common/amd.js";import{DisposableStore as h,toDisposable as y}from"../../../../../base/common/lifecycle.js";import{FileAccess as w,nodeModulesAsarPath as x,nodeModulesPath as I}from"../../../../../base/common/network.js";import{isWeb as S}from"../../../../../base/common/platform.js";import{URI as b}from"../../../../../base/common/uri.js";import{ILanguageService as M}from"../../../../../editor/common/languages/language.js";import{IConfigurationService as P}from"../../../../../platform/configuration/common/configuration.js";import{IEnvironmentService as W}from"../../../../../platform/environment/common/environment.js";import{IExtensionResourceLoaderService as z}from"../../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js";import{INotificationService as C}from"../../../../../platform/notification/common/notification.js";import{ITelemetryService as A}from"../../../../../platform/telemetry/common/telemetry.js";import{TextMateWorkerTokenizerController as D}from"./textMateWorkerTokenizerController.js";import{TextMateWorkerHost as R}from"./worker/textMateWorkerHost.js";let m=class{constructor(e,o,t,i,a,n,s,r){this._reportTokenizationTime=e;this._shouldTokenizeAsync=o;this._extensionResourceLoaderService=t;this._configurationService=i;this._languageService=a;this._environmentService=n;this._notificationService=s;this._telemetryService=r}static _reportedMismatchingTokens=!1;_workerProxyPromise=null;_worker=null;_workerProxy=null;_workerTokenizerControllers=new Map;_currentTheme=null;_currentTokenColorMap=null;_grammarDefinitions=[];dispose(){this._disposeWorker()}createBackgroundTokenizer(e,o,t){if(!this._shouldTokenizeAsync()||e.isTooLargeForSyncing())return;const i=new h,a=this._getWorkerProxy().then(n=>{if(i.isDisposed||!n)return;const s={controller:void 0,worker:this._worker};return i.add(L(e,()=>{const r=new D(e,n,this._languageService.languageIdCodec,o,this._configurationService,t);return s.controller=r,this._workerTokenizerControllers.set(r.controllerId,r),y(()=>{s.controller=void 0,this._workerTokenizerControllers.delete(r.controllerId),r.dispose()})})),s});return{dispose(){i.dispose()},requestTokens:async(n,s)=>{const r=await a;r?.controller&&r.worker===this._worker&&r.controller.requestTokens(n,s)},reportMismatchingTokens:n=>{m._reportedMismatchingTokens||(m._reportedMismatchingTokens=!0,this._notificationService.error({message:"Async Tokenization Token Mismatch in line "+n,name:"Async Tokenization Token Mismatch"}),this._telemetryService.publicLog2("asyncTokenizationMismatchingTokens",{}))}}}setGrammarDefinitions(e){this._grammarDefinitions=e,this._disposeWorker()}acceptTheme(e,o){this._currentTheme=e,this._currentTokenColorMap=o,this._currentTheme&&this._currentTokenColorMap&&this._workerProxy&&this._workerProxy.$acceptTheme(this._currentTheme,this._currentTokenColorMap)}_getWorkerProxy(){return this._workerProxyPromise||(this._workerProxyPromise=this._createWorkerProxy()),this._workerProxyPromise}async _createWorkerProxy(){const e=`${I}/vscode-oniguruma`,o=`${x}/vscode-oniguruma`,a=`${g&&this._environmentService.isBuilt&&!S?o:e}/release/onig.wasm`,n={grammarDefinitions:this._grammarDefinitions,onigurumaWASMUri:w.asBrowserUri(a).toString(!0)},s=this._worker=f("vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker","TextMateWorker");return R.setChannel(s,{$readFile:async r=>{const u=b.revive(r);return this._extensionResourceLoaderService.readExtensionResource(u)},$setTokensAndStates:async(r,u,k,d)=>{const p=this._workerTokenizerControllers.get(r);p&&p.setTokensAndStates(r,u,k,d)},$reportTokenizationTime:(r,u,k,d,p)=>{this._reportTokenizationTime(r,u,k,d,p)}}),await s.proxy.$init(n),this._worker!==s?null:(this._workerProxy=s.proxy,this._currentTheme&&this._currentTokenColorMap&&this._workerProxy.$acceptTheme(this._currentTheme,this._currentTokenColorMap),s.proxy)}_disposeWorker(){for(const e of this._workerTokenizerControllers.values())e.dispose();this._workerTokenizerControllers.clear(),this._worker&&(this._worker.dispose(),this._worker=null),this._workerProxy=null,this._workerProxyPromise=null}};m=T([c(2,z),c(3,P),c(4,M),c(5,W),c(6,C),c(7,A)],m);function L(l,e){const o=new h,t=o.add(new h);function i(){l.isAttachedToEditor()?t.add(e()):t.clear()}return i(),o.add(l.onDidChangeAttached(()=>{i()})),o}export{m as ThreadedBackgroundTokenizerFactory};
