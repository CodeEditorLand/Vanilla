var S=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var d=(l,s,e,t)=>{for(var n=t>1?void 0:t?T(s,e):s,r=l.length-1,C;r>=0;r--)(C=l[r])&&(n=(t?C(s,e,n):C(n))||n);return t&&n&&S(s,e,n),n},i=(l,s)=>(e,t)=>s(e,t,l);import{Emitter as y,Event as O}from"../../../../base/common/event.js";import{Disposable as L}from"../../../../base/common/lifecycle.js";import{Schemas as m}from"../../../../base/common/network.js";import{URI as _}from"../../../../base/common/uri.js";import{ILanguageService as x}from"../../../../editor/common/languages/language.js";import"../../../../editor/common/model.js";import{ITextModelService as E}from"../../../../editor/common/services/resolverService.js";import{IContextKeyService as w}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as D}from"../../../../platform/instantiation/common/instantiation.js";import{ILoggerService as A,ILogService as V,LogLevelToString as M}from"../../../../platform/log/common/log.js";import{Registry as h}from"../../../../platform/registry/common/platform.js";import{IStorageService as P,StorageScope as g,StorageTarget as b}from"../../../../platform/storage/common/storage.js";import{ILifecycleService as U}from"../../../services/lifecycle/common/lifecycle.js";import{ACTIVE_OUTPUT_CHANNEL_CONTEXT as R,CONTEXT_ACTIVE_FILE_OUTPUT as N,CONTEXT_ACTIVE_OUTPUT_LEVEL as K,CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT as W,CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE as X,Extensions as u,LOG_MIME as B,OUTPUT_MIME as F,OUTPUT_VIEW_ID as v}from"../../../services/output/common/output.js";import{IViewsService as H}from"../../../services/views/common/viewsService.js";import{IDefaultLogLevelsService as k}from"../../logs/common/defaultLogLevels.js";import{SetLogLevelAction as $}from"../../logs/common/logsActions.js";import"../common/outputChannelModel.js";import{IOutputChannelModelService as G}from"../common/outputChannelModelService.js";import{OutputLinkProvider as Y}from"./outputLinkProvider.js";import"./outputView.js";const I="output.activechannel";let c=class extends L{constructor(e,t,n){super();this.outputChannelDescriptor=e;this.id=e.id,this.label=e.label,this.uri=_.from({scheme:m.outputChannel,path:this.id}),this.model=this._register(t.createOutputChannelModel(this.id,this.uri,e.languageId?n.createById(e.languageId):n.createByMimeType(e.log?B:F),e.file))}scrollLock=!1;model;id;label;uri;append(e){this.model.append(e)}update(e,t){this.model.update(e,t,!0)}clear(){this.model.clear()}replace(e){this.model.replace(e)}};c=d([i(1,G),i(2,x)],c);let p=class extends L{constructor(e,t,n,r,C,j,q,o,z){super();this.storageService=e;this.instantiationService=t;this.logService=r;this.loggerService=C;this.lifecycleService=j;this.viewsService=q;this.defaultLogLevelsService=z;this.activeChannelIdInStorage=this.storageService.get(I,g.WORKSPACE,""),this.activeOutputChannelContext=R.bindTo(o),this.activeOutputChannelContext.set(this.activeChannelIdInStorage),this._register(this.onActiveOutputChannel(a=>this.activeOutputChannelContext.set(a))),this.activeFileOutputChannelContext=N.bindTo(o),this.activeOutputChannelLevelSettableContext=X.bindTo(o),this.activeOutputChannelLevelContext=K.bindTo(o),this.activeOutputChannelLevelIsDefaultContext=W.bindTo(o),this._register(n.registerTextModelContentProvider(m.outputChannel,this)),this._register(t.createInstance(Y));const f=h.as(u.OutputChannels);for(const a of f.getChannels())this.onDidRegisterChannel(a.id);if(this._register(f.onDidRegisterChannel(this.onDidRegisterChannel,this)),!this.activeChannel){const a=this.getChannelDescriptors();this.setActiveChannel(a&&a.length>0?this.getChannel(a[0].id):void 0)}this._register(O.filter(this.viewsService.onDidChangeViewVisibility,a=>a.id===v&&a.visible)(()=>{this.activeChannel&&this.viewsService.getActiveViewWithId(v)?.showChannel(this.activeChannel,!0)})),this._register(this.loggerService.onDidChangeLogLevel(a=>{this.setLevelContext(),this.setLevelIsDefaultContext()})),this._register(this.defaultLogLevelsService.onDidChangeDefaultLogLevels(()=>{this.setLevelIsDefaultContext()})),this._register(this.lifecycleService.onDidShutdown(()=>this.dispose()))}channels=new Map;activeChannelIdInStorage;activeChannel;_onActiveOutputChannel=this._register(new y);onActiveOutputChannel=this._onActiveOutputChannel.event;activeOutputChannelContext;activeFileOutputChannelContext;activeOutputChannelLevelSettableContext;activeOutputChannelLevelContext;activeOutputChannelLevelIsDefaultContext;provideTextContent(e){const t=this.getChannel(e.path);return t?t.model.loadModel():null}async showChannel(e,t){const n=this.getChannel(e);this.activeChannel?.id!==n?.id&&(this.setActiveChannel(n),this._onActiveOutputChannel.fire(e));const r=await this.viewsService.openView(v,!t);r&&n&&r.showChannel(n,!!t)}getChannel(e){return this.channels.get(e)}getChannelDescriptor(e){return h.as(u.OutputChannels).getChannel(e)}getChannelDescriptors(){return h.as(u.OutputChannels).getChannels()}getActiveChannel(){return this.activeChannel}async onDidRegisterChannel(e){const t=this.createChannel(e);this.channels.set(e,t),(!this.activeChannel||this.activeChannelIdInStorage===e)&&(this.setActiveChannel(t),this._onActiveOutputChannel.fire(e),this.viewsService.getActiveViewWithId(v)?.showChannel(t,!0))}createChannel(e){const t=this.instantiateChannel(e);return this._register(O.once(t.model.onDispose)(()=>{if(this.activeChannel===t){const n=this.getChannelDescriptors(),r=n.length?this.getChannel(n[0].id):void 0;r&&this.viewsService.isViewVisible(v)?this.showChannel(r.id):this.setActiveChannel(void 0)}h.as(u.OutputChannels).removeChannel(e)})),t}instantiateChannel(e){const t=h.as(u.OutputChannels).getChannel(e);if(!t)throw this.logService.error(`Channel '${e}' is not registered yet`),new Error(`Channel '${e}' is not registered yet`);return this.instantiationService.createInstance(c,t)}setLevelContext(){const e=this.activeChannel?.outputChannelDescriptor,t=e?.log?this.loggerService.getLogLevel(e.file):void 0;this.activeOutputChannelLevelContext.set(t!==void 0?M(t):"")}async setLevelIsDefaultContext(){const e=this.activeChannel?.outputChannelDescriptor;if(e?.log){const t=this.loggerService.getLogLevel(e.file),n=await this.defaultLogLevelsService.getDefaultLogLevel(e.extensionId);this.activeOutputChannelLevelIsDefaultContext.set(n===t)}else this.activeOutputChannelLevelIsDefaultContext.set(!1)}setActiveChannel(e){this.activeChannel=e;const t=e?.outputChannelDescriptor;this.activeFileOutputChannelContext.set(!!t?.file),this.activeOutputChannelLevelSettableContext.set(t!==void 0&&$.isLevelSettable(t)),this.setLevelIsDefaultContext(),this.setLevelContext(),this.activeChannel?this.storageService.store(I,this.activeChannel.id,g.WORKSPACE,b.MACHINE):this.storageService.remove(I,g.WORKSPACE)}};p=d([i(0,P),i(1,D),i(2,E),i(3,V),i(4,A),i(5,U),i(6,H),i(7,w),i(8,k)],p);export{p as OutputService};
