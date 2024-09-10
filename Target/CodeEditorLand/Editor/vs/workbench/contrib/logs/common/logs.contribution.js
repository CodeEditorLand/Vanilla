var W=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var v=(n,r,e,t)=>{for(var i=t>1?void 0:t?k(r,e):r,s=n.length-1,g;s>=0;s--)(g=n[s])&&(i=(t?g(r,e,i):g(i))||i);return t&&i&&W(r,e,i),i},a=(n,r)=>(e,t)=>r(e,t,n);import*as f from"../../../../nls.js";import{Registry as p}from"../../../../platform/registry/common/platform.js";import{Categories as L}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as C,registerAction2 as y}from"../../../../platform/actions/common/actions.js";import{SetLogLevelAction as d}from"./logsActions.js";import{Extensions as w}from"../../../common/contributions.js";import{IFileService as A,whenProviderRegistered as T}from"../../../../platform/files/common/files.js";import{IOutputService as K,Extensions as _}from"../../../services/output/common/output.js";import{Disposable as P,DisposableMap as z,DisposableStore as F,toDisposable as S}from"../../../../base/common/lifecycle.js";import{CONTEXT_LOG_LEVEL as U,ILogService as O,ILoggerService as q,LogLevelToString as b,isLogLevel as V}from"../../../../platform/log/common/log.js";import{LifecyclePhase as x}from"../../../services/lifecycle/common/lifecycle.js";import{IInstantiationService as G}from"../../../../platform/instantiation/common/instantiation.js";import{Event as M}from"../../../../base/common/event.js";import{windowLogId as N,showWindowLogActionId as X}from"../../../services/log/common/logConstants.js";import{createCancelablePromise as $,timeout as j}from"../../../../base/common/async.js";import{CancellationError as B,getErrorMessage as H,isCancellationError as J}from"../../../../base/common/errors.js";import{IDefaultLogLevelsService as R}from"./defaultLogLevels.js";import{ContextKeyExpr as I,IContextKeyService as Q}from"../../../../platform/contextkey/common/contextkey.js";import{CounterSet as Y}from"../../../../base/common/map.js";import{IUriIdentityService as Z}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{Schemas as D}from"../../../../base/common/network.js";y(class extends C{constructor(){super({id:d.ID,title:d.TITLE,category:L.Developer,f1:!0})}run(n){return n.get(G).createInstance(d,d.ID,d.TITLE.value).run()}}),y(class extends C{constructor(){super({id:"workbench.action.setDefaultLogLevel",title:f.localize2("setDefaultLogLevel","Set Default Log Level"),category:L.Developer})}run(n,r,e){return n.get(R).setDefaultLogLevel(r,e)}});let u=class extends P{constructor(e,t,i,s,g){super();this.logService=e;this.loggerService=t;this.contextKeyService=i;this.fileService=s;this.uriIdentityService=g;const c=U.bindTo(i);c.set(b(t.getLogLevel())),this._register(t.onDidChangeLogLevel(o=>{V(o)&&c.set(b(t.getLogLevel()))})),this.onDidAddLoggers(t.getRegisteredLoggers()),this._register(t.onDidChangeLoggers(({added:o,removed:l})=>{this.onDidAddLoggers(o),this.onDidRemoveLoggers(l)})),this._register(t.onDidChangeVisibility(([o,l])=>{const h=t.getRegisteredLogger(o);h&&(l?this.registerLogChannel(h):this.deregisterLogChannel(h))})),this.registerShowWindowLogAction(),this._register(M.filter(i.onDidChangeContext,o=>o.affectsSome(this.contextKeys))(()=>this.onDidChangeContext()))}contextKeys=new Y;outputChannelRegistry=p.as(_.OutputChannels);loggerDisposables=this._register(new z);onDidAddLoggers(e){for(const t of e){if(t.when){const i=I.deserialize(t.when);if(i){for(const s of i.keys())this.contextKeys.add(s);if(!this.contextKeyService.contextMatchesRules(i))continue}}t.hidden||this.registerLogChannel(t)}}onDidChangeContext(){for(const e of this.loggerService.getRegisteredLoggers())e.when&&(this.contextKeyService.contextMatchesRules(I.deserialize(e.when))?this.registerLogChannel(e):this.deregisterLogChannel(e))}onDidRemoveLoggers(e){for(const t of e){if(t.when){const i=I.deserialize(t.when);if(i)for(const s of i.keys())this.contextKeys.delete(s)}this.deregisterLogChannel(t)}}registerLogChannel(e){const t=this.outputChannelRegistry.getChannel(e.id);if(t&&this.uriIdentityService.extUri.isEqual(t.file,e.resource))return;const i=new F,s=$(async g=>{await T(e.resource,this.fileService);try{await this.whenFileExists(e.resource,1,g);const c=this.outputChannelRegistry.getChannel(e.id),o=c?.file?.scheme===D.vscodeRemote?this.loggerService.getRegisteredLogger(c.file):void 0;o&&this.deregisterLogChannel(o);const l=c&&e.resource.scheme===D.vscodeRemote,h=l?`${e.id}.remote`:e.id,E=l?f.localize("remote name","{0} (Remote)",e.name??e.id):e.name??e.id;this.outputChannelRegistry.registerChannel({id:h,label:E,file:e.resource,log:!0,extensionId:e.extensionId}),i.add(S(()=>this.outputChannelRegistry.removeChannel(h))),o&&this.registerLogChannel(o)}catch(c){J(c)||this.logService.error("Error while registering log channel",e.resource.toString(),H(c))}});i.add(S(()=>s.cancel())),this.loggerDisposables.set(e.resource.toString(),i)}deregisterLogChannel(e){this.loggerDisposables.deleteAndDispose(e.resource.toString())}async whenFileExists(e,t,i){if(!await this.fileService.exists(e)){if(i.isCancellationRequested)throw new B;if(t>10)throw new Error("Timed out while waiting for file to be created");this.logService.debug("[Registering Log Channel] File does not exist. Waiting for 1s to retry.",e.toString()),await j(1e3,i),await this.whenFileExists(e,t+1,i)}}registerShowWindowLogAction(){this._register(y(class extends C{constructor(){super({id:X,title:f.localize2("show window log","Show Window Log"),category:L.Developer,f1:!0})}async run(t){t.get(K).showChannel(N)}}))}};u=v([a(0,O),a(1,q),a(2,Q),a(3,A),a(4,Z)],u);let m=class{constructor(r){r.migrateLogLevels()}};m=v([a(0,R)],m),p.as(w.Workbench).registerWorkbenchContribution(u,x.Restored),p.as(w.Workbench).registerWorkbenchContribution(m,x.Eventually);
