var W=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var p=(n,r,e,t)=>{for(var i=t>1?void 0:t?k(r,e):r,s=n.length-1,g;s>=0;s--)(g=n[s])&&(i=(t?g(r,e,i):g(i))||i);return t&&i&&W(r,e,i),i},a=(n,r)=>(e,t)=>r(e,t,n);import{createCancelablePromise as A,timeout as T}from"../../../../base/common/async.js";import{CancellationError as K,getErrorMessage as _,isCancellationError as P}from"../../../../base/common/errors.js";import{Event as z}from"../../../../base/common/event.js";import{Disposable as F,DisposableMap as U,DisposableStore as O,toDisposable as w}from"../../../../base/common/lifecycle.js";import{CounterSet as j}from"../../../../base/common/map.js";import{Schemas as S}from"../../../../base/common/network.js";import*as v from"../../../../nls.js";import{Categories as f}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as L,registerAction2 as y}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as C,IContextKeyService as q}from"../../../../platform/contextkey/common/contextkey.js";import{IFileService as V,whenProviderRegistered as G}from"../../../../platform/files/common/files.js";import{IInstantiationService as M}from"../../../../platform/instantiation/common/instantiation.js";import{CONTEXT_LOG_LEVEL as N,ILogService as X,ILoggerService as $,LogLevelToString as b,isLogLevel as B}from"../../../../platform/log/common/log.js";import{Registry as I}from"../../../../platform/registry/common/platform.js";import{IUriIdentityService as H}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{Extensions as x}from"../../../common/contributions.js";import{LifecyclePhase as R}from"../../../services/lifecycle/common/lifecycle.js";import{showWindowLogActionId as J,windowLogId as Q}from"../../../services/log/common/logConstants.js";import{Extensions as Y,IOutputService as Z}from"../../../services/output/common/output.js";import{IDefaultLogLevelsService as D}from"./defaultLogLevels.js";import{SetLogLevelAction as d}from"./logsActions.js";y(class extends L{constructor(){super({id:d.ID,title:d.TITLE,category:f.Developer,f1:!0})}run(n){return n.get(M).createInstance(d,d.ID,d.TITLE.value).run()}}),y(class extends L{constructor(){super({id:"workbench.action.setDefaultLogLevel",title:v.localize2("setDefaultLogLevel","Set Default Log Level"),category:f.Developer})}run(n,r,e){return n.get(D).setDefaultLogLevel(r,e)}});let m=class extends F{constructor(e,t,i,s,g){super();this.logService=e;this.loggerService=t;this.contextKeyService=i;this.fileService=s;this.uriIdentityService=g;const c=N.bindTo(i);c.set(b(t.getLogLevel())),this._register(t.onDidChangeLogLevel(o=>{B(o)&&c.set(b(t.getLogLevel()))})),this.onDidAddLoggers(t.getRegisteredLoggers()),this._register(t.onDidChangeLoggers(({added:o,removed:l})=>{this.onDidAddLoggers(o),this.onDidRemoveLoggers(l)})),this._register(t.onDidChangeVisibility(([o,l])=>{const h=t.getRegisteredLogger(o);h&&(l?this.registerLogChannel(h):this.deregisterLogChannel(h))})),this.registerShowWindowLogAction(),this._register(z.filter(i.onDidChangeContext,o=>o.affectsSome(this.contextKeys))(()=>this.onDidChangeContext()))}contextKeys=new j;outputChannelRegistry=I.as(Y.OutputChannels);loggerDisposables=this._register(new U);onDidAddLoggers(e){for(const t of e){if(t.when){const i=C.deserialize(t.when);if(i){for(const s of i.keys())this.contextKeys.add(s);if(!this.contextKeyService.contextMatchesRules(i))continue}}t.hidden||this.registerLogChannel(t)}}onDidChangeContext(){for(const e of this.loggerService.getRegisteredLoggers())e.when&&(this.contextKeyService.contextMatchesRules(C.deserialize(e.when))?this.registerLogChannel(e):this.deregisterLogChannel(e))}onDidRemoveLoggers(e){for(const t of e){if(t.when){const i=C.deserialize(t.when);if(i)for(const s of i.keys())this.contextKeys.delete(s)}this.deregisterLogChannel(t)}}registerLogChannel(e){const t=this.outputChannelRegistry.getChannel(e.id);if(t&&this.uriIdentityService.extUri.isEqual(t.file,e.resource))return;const i=new O,s=A(async g=>{await G(e.resource,this.fileService);try{await this.whenFileExists(e.resource,1,g);const c=this.outputChannelRegistry.getChannel(e.id),o=c?.file?.scheme===S.vscodeRemote?this.loggerService.getRegisteredLogger(c.file):void 0;o&&this.deregisterLogChannel(o);const l=c&&e.resource.scheme===S.vscodeRemote,h=l?`${e.id}.remote`:e.id,E=l?v.localize("remote name","{0} (Remote)",e.name??e.id):e.name??e.id;this.outputChannelRegistry.registerChannel({id:h,label:E,file:e.resource,log:!0,extensionId:e.extensionId}),i.add(w(()=>this.outputChannelRegistry.removeChannel(h))),o&&this.registerLogChannel(o)}catch(c){P(c)||this.logService.error("Error while registering log channel",e.resource.toString(),_(c))}});i.add(w(()=>s.cancel())),this.loggerDisposables.set(e.resource.toString(),i)}deregisterLogChannel(e){this.loggerDisposables.deleteAndDispose(e.resource.toString())}async whenFileExists(e,t,i){if(!await this.fileService.exists(e)){if(i.isCancellationRequested)throw new K;if(t>10)throw new Error("Timed out while waiting for file to be created");this.logService.debug("[Registering Log Channel] File does not exist. Waiting for 1s to retry.",e.toString()),await T(1e3,i),await this.whenFileExists(e,t+1,i)}}registerShowWindowLogAction(){this._register(y(class extends L{constructor(){super({id:J,title:v.localize2("show window log","Show Window Log"),category:f.Developer,f1:!0})}async run(t){t.get(Z).showChannel(Q)}}))}};m=p([a(0,X),a(1,$),a(2,q),a(3,V),a(4,H)],m);let u=class{constructor(r){r.migrateLogLevels()}};u=p([a(0,D)],u),I.as(x.Workbench).registerWorkbenchContribution(m,R.Restored),I.as(x.Workbench).registerWorkbenchContribution(u,R.Eventually);
