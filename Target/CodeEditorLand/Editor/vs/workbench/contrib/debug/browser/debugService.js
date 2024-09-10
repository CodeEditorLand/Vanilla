var H=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var R=(I,e,t,i)=>{for(var n=i>1?void 0:i?X(e,t):e,s=I.length-1,u;s>=0;s--)(u=I[s])&&(n=(i?u(e,t,n):u(n))||n);return i&&n&&H(e,t,n),n},f=(I,e)=>(t,i)=>e(t,i,I);import*as T from"../../../../base/browser/ui/aria/aria.js";import{Action as F}from"../../../../base/common/actions.js";import{distinct as K}from"../../../../base/common/arrays.js";import{RunOnceScheduler as j,raceTimeout as Y}from"../../../../base/common/async.js";import{CancellationTokenSource as P}from"../../../../base/common/cancellation.js";import{isErrorWithActions as Q}from"../../../../base/common/errorMessage.js";import*as J from"../../../../base/common/errors.js";import{Emitter as B,Event as A}from"../../../../base/common/event.js";import{DisposableStore as V}from"../../../../base/common/lifecycle.js";import{deepClone as _,equals as $}from"../../../../base/common/objects.js";import Z from"../../../../base/common/severity.js";import{URI as ee}from"../../../../base/common/uri.js";import{generateUuid as te}from"../../../../base/common/uuid.js";import{isCodeEditor as ie}from"../../../../editor/browser/editorBrowser.js";import"../../../../editor/common/model.js";import*as m from"../../../../nls.js";import{ICommandService as se}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as ne}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as oe}from"../../../../platform/contextkey/common/contextkey.js";import{IExtensionHostDebugService as re}from"../../../../platform/debug/common/extensionHostDebug.js";import{IDialogService as ae}from"../../../../platform/dialogs/common/dialogs.js";import{FileChangeType as O,IFileService as de}from"../../../../platform/files/common/files.js";import{IInstantiationService as ue}from"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as ce}from"../../../../platform/notification/common/notification.js";import{IQuickInputService as le}from"../../../../platform/quickinput/common/quickInput.js";import{IUriIdentityService as ge}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as pe,WorkbenchState as he}from"../../../../platform/workspace/common/workspace.js";import{IWorkspaceTrustRequestService as fe}from"../../../../platform/workspace/common/workspaceTrust.js";import{EditorsOrder as me}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{IViewDescriptorService as Se,ViewContainerLocation as W}from"../../../common/views.js";import{AdapterManager as ve}from"./debugAdapterManager.js";import{DEBUG_CONFIGURE_COMMAND_ID as z,DEBUG_CONFIGURE_LABEL as be}from"./debugCommands.js";import{ConfigurationManager as ke}from"./debugConfigurationManager.js";import{DebugMemoryFileSystemProvider as Ie}from"./debugMemory.js";import{DebugSession as we}from"./debugSession.js";import{DebugTaskRunner as De,TaskRunResult as w}from"./debugTaskRunner.js";import{CALLSTACK_VIEW_ID as ye,CONTEXT_BREAKPOINTS_EXIST as Be,CONTEXT_DEBUG_STATE as Ce,CONTEXT_DEBUG_TYPE as Ee,CONTEXT_DEBUG_UX as Te,CONTEXT_DISASSEMBLY_VIEW_FOCUS as Me,CONTEXT_HAS_DEBUGGED as xe,CONTEXT_IN_DEBUG_MODE as Re,DEBUG_MEMORY_SCHEME as U,DEBUG_SCHEME as Fe,REPL_VIEW_ID as M,State as b,VIEWLET_ID as Pe,debuggerDisabledMessage as Ae,getStateLabel as Ve}from"../common/debug.js";import{DebugCompoundRoot as _e}from"../common/debugCompoundRoot.js";import{Breakpoint as Oe,DataBreakpoint as We,DebugModel as ze,FunctionBreakpoint as Ue,InstructionBreakpoint as Le}from"../common/debugModel.js";import{Source as Ne}from"../common/debugSource.js";import{DebugStorage as qe}from"../common/debugStorage.js";import{DebugTelemetry as Ge}from"../common/debugTelemetry.js";import{getExtensionHostDebugSession as L,saveAllBeforeDebugStart as N}from"../common/debugUtils.js";import{ViewModel as He}from"../common/debugViewModel.js";import"../common/debugger.js";import{DisassemblyViewInput as q}from"../common/disassemblyViewInput.js";import{VIEWLET_ID as Xe}from"../../files/common/files.js";import{ITestService as Ke}from"../../testing/common/testService.js";import{IActivityService as je,NumberBadge as Ye}from"../../../services/activity/common/activity.js";import{IEditorService as Qe}from"../../../services/editor/common/editorService.js";import{IExtensionService as Je}from"../../../services/extensions/common/extensions.js";import{IWorkbenchLayoutService as $e,Parts as Ze}from"../../../services/layout/browser/layoutService.js";import{ILifecycleService as et}from"../../../services/lifecycle/common/lifecycle.js";import{IPaneCompositePartService as tt}from"../../../services/panecomposite/browser/panecomposite.js";import{IViewsService as it}from"../../../services/views/common/viewsService.js";let C=class{constructor(e,t,i,n,s,u,o,r,d,l,c,a,g,S,p,k,y,E,st,nt,ot){this.editorService=e;this.paneCompositeService=t;this.viewsService=i;this.viewDescriptorService=n;this.notificationService=s;this.dialogService=u;this.layoutService=o;this.contextService=r;this.contextKeyService=d;this.lifecycleService=l;this.instantiationService=c;this.extensionService=a;this.fileService=g;this.configurationService=S;this.extensionHostDebugService=p;this.activityService=k;this.commandService=y;this.quickInputService=E;this.workspaceTrustRequestService=st;this.uriIdentityService=nt;this.testService=ot;this.breakpointsToSendOnResourceSaved=new Set,this._onDidChangeState=new B,this._onDidNewSession=new B,this._onWillNewSession=new B,this._onDidEndSession=new B,this.adapterManager=this.instantiationService.createInstance(ve,{onDidNewSession:this.onDidNewSession}),this.disposables.add(this.adapterManager),this.configurationManager=this.instantiationService.createInstance(ke,this.adapterManager),this.disposables.add(this.configurationManager),this.debugStorage=this.disposables.add(this.instantiationService.createInstance(qe)),this.chosenEnvironments=this.debugStorage.loadChosenEnvironments(),this.model=this.instantiationService.createInstance(ze,this.debugStorage),this.telemetry=this.instantiationService.createInstance(Ge,this.model),this.viewModel=new He(d),this.taskRunner=this.instantiationService.createInstance(De),this.disposables.add(this.fileService.onDidFilesChange(h=>this.onFileChanges(h))),this.disposables.add(this.lifecycleService.onWillShutdown(this.dispose,this)),this.disposables.add(this.extensionHostDebugService.onAttachSession(h=>{const v=this.model.getSession(h.sessionId,!0);v&&(v.configuration.request="attach",v.configuration.port=h.port,v.setSubId(h.subId),this.launchOrAttachToSession(v))})),this.disposables.add(this.extensionHostDebugService.onTerminateSession(h=>{const v=this.model.getSession(h.sessionId);v&&v.subId===h.subId&&v.disconnect()})),this.disposables.add(this.viewModel.onDidFocusStackFrame(()=>{this.onStateChange()})),this.disposables.add(this.viewModel.onDidFocusSession(h=>{this.onStateChange(),h&&this.setExceptionBreakpointFallbackSession(h.getId())})),this.disposables.add(A.any(this.adapterManager.onDidRegisterDebugger,this.configurationManager.onDidSelectConfiguration)(()=>{const h=this.state!==b.Inactive||this.configurationManager.getAllConfigurations().length>0&&this.adapterManager.hasEnabledDebuggers()?"default":"simple";this.debugUx.set(h),this.debugStorage.storeDebugUxState(h)})),this.disposables.add(this.model.onDidChangeCallStack(()=>{const h=this.model.getSessions().filter(v=>!v.parentSession).length;if(this.activity?.dispose(),h>0){const v=this.viewDescriptorService.getViewContainerByViewId(ye);v&&(this.activity=this.activityService.showViewContainerActivity(v.id,{badge:new Ye(h,x=>x===1?m.localize("1activeSession","1 active session"):m.localize("nActiveSessions","{0} active sessions",x))}))}})),this.disposables.add(e.onDidActiveEditorChange(()=>{this.contextKeyService.bufferChangeEvents(()=>{e.activeEditor===q.instance?this.disassemblyViewFocus.set(!0):this.disassemblyViewFocus?.reset()})})),this.disposables.add(this.lifecycleService.onBeforeShutdown(()=>{for(const h of e.editors)h.resource?.scheme===U&&h.dispose()})),this.disposables.add(a.onWillStop(h=>{h.veto(this.model.getSessions().length>0,m.localize("active debug session","A debug session is still running."))})),this.initContextKeys(d)}_onDidChangeState;_onDidNewSession;_onWillNewSession;_onDidEndSession;restartingSessions=new Set;debugStorage;model;viewModel;telemetry;taskRunner;configurationManager;adapterManager;disposables=new V;debugType;debugState;inDebugMode;debugUx;hasDebugged;breakpointsExist;disassemblyViewFocus;breakpointsToSendOnResourceSaved;initializing=!1;_initializingOptions;previousState;sessionCancellationTokens=new Map;activity;chosenEnvironments;haveDoneLazySetup=!1;initContextKeys(e){queueMicrotask(()=>{e.bufferChangeEvents(()=>{this.debugType=Ee.bindTo(e),this.debugState=Ce.bindTo(e),this.hasDebugged=xe.bindTo(e),this.inDebugMode=Re.bindTo(e),this.debugUx=Te.bindTo(e),this.debugUx.set(this.debugStorage.loadDebugUxState()),this.breakpointsExist=Be.bindTo(e),this.disassemblyViewFocus=Me.bindTo(e)});const t=()=>this.breakpointsExist.set(!!(this.model.getBreakpoints().length||this.model.getDataBreakpoints().length||this.model.getFunctionBreakpoints().length));t(),this.disposables.add(this.model.onDidChangeBreakpoints(()=>t()))})}getModel(){return this.model}getViewModel(){return this.viewModel}getConfigurationManager(){return this.configurationManager}getAdapterManager(){return this.adapterManager}sourceIsNotAvailable(e){this.model.sourceIsNotAvailable(e)}dispose(){this.disposables.dispose()}get state(){const e=this.viewModel.focusedSession;return e?e.state:this.initializing?b.Initializing:b.Inactive}get initializingOptions(){return this._initializingOptions}startInitializingState(e){this.initializing||(this.initializing=!0,this._initializingOptions=e,this.onStateChange())}endInitializingState(){this.initializing&&(this.initializing=!1,this._initializingOptions=void 0,this.onStateChange())}cancelTokens(e){if(e){const t=this.sessionCancellationTokens.get(e);t&&(t.cancel(),this.sessionCancellationTokens.delete(e))}else this.sessionCancellationTokens.forEach(t=>t.cancel()),this.sessionCancellationTokens.clear()}onStateChange(){const e=this.state;this.previousState!==e&&(this.contextKeyService.bufferChangeEvents(()=>{this.debugState.set(Ve(e)),this.inDebugMode.set(e!==b.Inactive);const t=e!==b.Inactive&&e!==b.Initializing||this.adapterManager.hasEnabledDebuggers()&&this.configurationManager.selectedConfiguration.name?"default":"simple";this.debugUx.set(t),this.debugStorage.storeDebugUxState(t)}),this.previousState=e,this._onDidChangeState.fire(e))}get onDidChangeState(){return this._onDidChangeState.event}get onDidNewSession(){return this._onDidNewSession.event}get onWillNewSession(){return this._onWillNewSession.event}get onDidEndSession(){return this._onDidEndSession.event}lazySetup(){this.haveDoneLazySetup||(this.disposables.add(this.fileService.registerProvider(U,new Ie(this))),this.haveDoneLazySetup=!0)}async startDebugging(e,t,i,n=!i?.parentSession){const s=i&&i.noDebug?m.localize("runTrust","Running executes build tasks and program code from your workspace."):m.localize("debugTrust","Debugging executes build tasks and program code from your workspace.");if(!await this.workspaceTrustRequestService.requestWorkspaceTrust({message:s}))return!1;this.lazySetup(),this.startInitializingState(i),this.hasDebugged.set(!0);try{await this.extensionService.activateByEvent("onDebug"),n&&await N(this.configurationService,this.editorService),await this.extensionService.whenInstalledExtensionsRegistered();let o,r;if(t||(t=this.configurationManager.selectedConfiguration.name),typeof t=="string"&&e?(o=e.getConfiguration(t),r=e.getCompound(t)):typeof t!="string"&&(o=t),r){if(!r.configurations)throw new Error(m.localize({key:"compoundMustHaveConfigurations",comment:['compound indicates a "compounds" configuration item','"configurations" is an attribute and should not be localized']},'Compound must have "configurations" attribute set in order to start multiple configurations.'));if(r.preLaunchTask&&await this.taskRunner.runTaskAndCheckErrors(e?.workspace||this.contextService.getWorkspace(),r.preLaunchTask)===w.Failure)return this.endInitializingState(),!1;r.stopAll&&(i={...i,compoundRoot:new _e});const c=(await Promise.all(r.configurations.map(a=>{const g=typeof a=="string"?a:a.name;if(g===r.name)return Promise.resolve(!1);let S;if(typeof a=="string"){const p=this.configurationManager.getLaunches().filter(k=>!!k.getConfiguration(g));if(p.length===1)S=p[0];else if(e&&p.length>1&&p.indexOf(e)>=0)S=e;else throw new Error(p.length===0?m.localize("noConfigurationNameInWorkspace","Could not find launch configuration '{0}' in the workspace.",g):m.localize("multipleConfigurationNamesInWorkspace","There are multiple launch configurations '{0}' in the workspace. Use folder name to qualify the configuration.",g))}else if(a.folder){const p=this.configurationManager.getLaunches().filter(k=>k.workspace&&k.workspace.name===a.folder&&!!k.getConfiguration(a.name));if(p.length===1)S=p[0];else throw new Error(m.localize("noFolderWithName","Can not find folder with name '{0}' for configuration '{1}' in compound '{2}'.",a.folder,a.name,r.name))}return this.createSession(S,S.getConfiguration(g),i)}))).every(a=>!!a);return this.endInitializingState(),c}if(t&&!o){const l=e?m.localize("configMissing","Configuration '{0}' is missing in 'launch.json'.",typeof t=="string"?t:t.name):m.localize("launchJsonDoesNotExist","'launch.json' does not exist for passed workspace folder.");throw new Error(l)}const d=await this.createSession(e,o,i);return this.endInitializingState(),d}catch(o){return this.notificationService.error(o),this.endInitializingState(),Promise.reject(o)}}async createSession(e,t,i){let n;t?n=t.type:t=Object.create(null),(i&&i.noDebug||i&&typeof i.noDebug>"u"&&i.parentSession&&i.parentSession.configuration.noDebug)&&(t.noDebug=!0);const s=_(t);let u,o;n||(o=this.editorService.activeEditor,o&&o.resource&&(n=this.chosenEnvironments[o.resource.toString()]),n||(u=await this.adapterManager.guessDebugger(!1),u&&(n=u.type)));const r=new P,d=te();this.sessionCancellationTokens.set(d,r);const l=await this.configurationManager.resolveConfigurationByProviders(e&&e.workspace?e.workspace.uri:void 0,n,t,r.token);if(l&&l.type)try{let c=await this.substituteVariables(e,l);if(!c||r.token.isCancellationRequested)return!1;const a=e?.workspace||this.contextService.getWorkspace();if(await this.taskRunner.runTaskAndCheckErrors(a,c.preLaunchTask)===w.Failure)return!1;const S=await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(e&&e.workspace?e.workspace.uri:void 0,c.type,c,r.token);if(!S)return e&&n&&S===null&&!r.token.isCancellationRequested&&await e.openConfigFile({preserveFocus:!0,type:n},r.token),!1;c=S;const p=this.adapterManager.getDebugger(c.type);if(!p||l.request!=="attach"&&l.request!=="launch"){let y;l.request!=="attach"&&l.request!=="launch"?y=l.request?m.localize("debugRequestNotSupported","Attribute '{0}' has an unsupported value '{1}' in the chosen debug configuration.","request",l.request):m.localize("debugRequesMissing","Attribute '{0}' is missing from the chosen debug configuration.","request"):y=c.type?m.localize("debugTypeNotSupported","Configured debug type '{0}' is not supported.",c.type):m.localize("debugTypeMissing","Missing property 'type' for the chosen launch configuration.");const E=[];return E.push(new F("installAdditionalDebuggers",m.localize({key:"installAdditionalDebuggers",comment:['Placeholder is the debug type, so for example "node", "python"']},"Install {0} Extension",c.type),void 0,!0,async()=>this.commandService.executeCommand("debug.installAdditionalDebuggers",c?.type))),await this.showError(y,E),!1}if(!p.enabled)return await this.showError(Ae(p.type),[]),!1;const k=await this.doCreateSession(d,e?.workspace,{resolved:c,unresolved:s},i);return k&&u&&o&&o.resource&&(this.chosenEnvironments[o.resource.toString()]=u.type,this.debugStorage.storeChosenEnvironments(this.chosenEnvironments)),k}catch(c){return c&&c.message?await this.showError(c.message):this.contextService.getWorkbenchState()===he.EMPTY&&await this.showError(m.localize("noFolderWorkspaceDebugError","The active file can not be debugged. Make sure it is saved and that you have a debug extension installed for that file type.")),e&&!r.token.isCancellationRequested&&await e.openConfigFile({preserveFocus:!0},r.token),!1}return e&&n&&l===null&&!r.token.isCancellationRequested&&await e.openConfigFile({preserveFocus:!0,type:n},r.token),!1}async doCreateSession(e,t,i,n){const s=this.instantiationService.createInstance(we,e,i,t,this.model,n);if(n?.startedByUser&&this.model.getSessions().some(o=>o.getLabel()===s.getLabel())&&i.resolved.suppressMultipleSessionWarning!==!0&&!(await this.dialogService.confirm({message:m.localize("multipleSession","'{0}' is already running. Do you want to start another instance?",s.getLabel())})).confirmed)return!1;this.model.addSession(s),this._onWillNewSession.fire(s);const u=this.configurationService.getValue("debug").openDebug;!i.resolved.noDebug&&(u==="openOnSessionStart"||u!=="neverOpen"&&this.viewModel.firstSessionStart)&&!s.suppressDebugView&&await this.paneCompositeService.openPaneComposite(Pe,W.Sidebar);try{await this.launchOrAttachToSession(s);const o=s.configuration.internalConsoleOptions||this.configurationService.getValue("debug").internalConsoleOptions;(o==="openOnSessionStart"||this.viewModel.firstSessionStart&&o==="openOnFirstSessionStart")&&this.viewsService.openView(M,!1),this.viewModel.firstSessionStart=!1;const r=this.configurationService.getValue("debug").showSubSessionsInToolBar,d=this.model.getSessions();return(r?d:d.filter(c=>!c.parentSession)).length>1&&this.viewModel.setMultiSessionView(!0),this._onDidNewSession.fire(s),!0}catch(o){if(J.isCancellationError(o)||(s&&s.getReplElements().length>0&&this.viewsService.openView(M,!1),s.configuration&&s.configuration.request==="attach"&&s.configuration.__autoAttach))return!1;const r=o instanceof Error?o.message:o;return o.showUser!==!1&&await this.showError(r,Q(o)?o.actions:[]),!1}}async launchOrAttachToSession(e,t=!1){this.registerSessionListeners(e);const i=this.adapterManager.getDebugger(e.configuration.type);try{await e.initialize(i),await e.launchOrAttach(e.configuration);const n=!!e.root&&!!this.configurationService.getValue("launch",{resource:e.root.uri});await this.telemetry.logDebugSessionStart(i,n),(t||!this.viewModel.focusedSession||e.parentSession===this.viewModel.focusedSession&&e.compact)&&await this.focusStackFrame(void 0,void 0,e)}catch(n){return this.viewModel.focusedSession===e&&await this.focusStackFrame(void 0),Promise.reject(n)}}registerSessionListeners(e){const t=new V;this.disposables.add(t);const i=t.add(new j(()=>{e.state===b.Running&&this.viewModel.focusedSession===e&&this.viewModel.setFocus(void 0,this.viewModel.focusedThread,e,!1)},200));t.add(e.onDidChangeState(()=>{e.state===b.Running&&this.viewModel.focusedSession===e&&i.schedule(),e===this.viewModel.focusedSession&&this.onStateChange()})),t.add(this.onDidEndSession(n=>{n.session===e&&this.disposables.delete(t)})),t.add(e.onDidEndAdapter(async n=>{n&&(n.error&&this.notificationService.error(m.localize("debugAdapterCrash","Debug adapter process has terminated unexpectedly ({0})",n.error.message||n.error.toString())),this.telemetry.logDebugSessionStop(e,n));const s=L(e);if(s&&s.state===b.Running&&s.configuration.noDebug&&this.extensionHostDebugService.close(s.getId()),e.configuration.postDebugTask){const o=e.root??this.contextService.getWorkspace();try{await this.taskRunner.runTask(o,e.configuration.postDebugTask)}catch(r){this.notificationService.error(r)}}if(this.endInitializingState(),this.cancelTokens(e.getId()),this.configurationService.getValue("debug").closeReadonlyTabsOnEnd){const o=this.editorService.getEditors(me.SEQUENTIAL).filter(({editor:r})=>r.resource?.scheme===Fe&&e.getId()===Ne.getEncodedDebugData(r.resource).sessionId);this.editorService.closeEditors(o)}this._onDidEndSession.fire({session:e,restart:this.restartingSessions.has(e)});const u=this.viewModel.focusedSession;if(u&&u.getId()===e.getId()){const{session:o,thread:r,stackFrame:d}=G(this.model,void 0,void 0,void 0,u);this.viewModel.setFocus(d,r,o,!1)}if(this.model.getSessions().length===0&&(this.viewModel.setMultiSessionView(!1),this.layoutService.isVisible(Ze.SIDEBAR_PART)&&this.configurationService.getValue("debug").openExplorerOnEnd&&this.paneCompositeService.openPaneComposite(Xe,W.Sidebar),this.model.getDataBreakpoints().filter(r=>!r.canPersist).forEach(r=>this.model.removeDataBreakpoints(r.getId())),this.configurationService.getValue("debug").console.closeOnEnd)){const r=this.viewDescriptorService.getViewContainerByViewId(M);r&&this.viewsService.isViewContainerVisible(r.id)&&this.viewsService.closeViewContainer(r.id)}this.model.removeExceptionBreakpointsForSession(e.getId())}))}async restartSession(e,t){e.saveBeforeRestart&&await N(this.configurationService,this.editorService);const i=!!t,n=async()=>{if(i)return Promise.resolve(w.Success);const a=e.root||this.contextService.getWorkspace();await this.taskRunner.runTask(a,e.configuration.preRestartTask),await this.taskRunner.runTask(a,e.configuration.postDebugTask);const g=await this.taskRunner.runTaskAndCheckErrors(a,e.configuration.preLaunchTask);return g!==w.Success?g:this.taskRunner.runTaskAndCheckErrors(a,e.configuration.postRestartTask)},s=L(e);if(s){await n()===w.Success&&this.extensionHostDebugService.reload(s.getId());return}let u=!1,o;const r=e.root?this.configurationManager.getLaunch(e.root.uri):void 0;r&&(o=r.getConfiguration(e.configuration.name),o&&!$(o,e.unresolvedConfiguration)&&(o.noDebug=e.configuration.noDebug,u=!0));let d=e.configuration;if(r&&u&&o){const a=new P;this.sessionCancellationTokens.set(e.getId(),a);const g=await this.configurationManager.resolveConfigurationByProviders(r.workspace?r.workspace.uri:void 0,o.type,o,a.token);g?(d=await this.substituteVariables(r,g),d&&!a.token.isCancellationRequested&&(d=await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(r&&r.workspace?r.workspace.uri:void 0,d.type,d,a.token))):d=g}d&&e.setConfiguration({resolved:d,unresolved:o}),e.configuration.__restart=t;const l=async a=>{this.restartingSessions.add(e);let g=!1;try{g=await a()!==!1}catch(S){throw g=!1,S}finally{this.restartingSessions.delete(e),g||this._onDidEndSession.fire({session:e,restart:!1})}};if(e.correlatedTestRun){e.correlatedTestRun.completedAt||(this.testService.cancelTestRun(e.correlatedTestRun.id),await A.toPromise(e.correlatedTestRun.onComplete)),this.testService.runResolvedTests(e.correlatedTestRun.request);return}if(e.capabilities.supportsRestartRequest){await n()===w.Success&&await l(async()=>(await e.restart(),!0));return}const c=!!this.viewModel.focusedSession&&e.getId()===this.viewModel.focusedSession.getId();return l(async()=>(i?await e.disconnect(!0):await e.terminate(!0),new Promise((a,g)=>{setTimeout(async()=>{if(await n()!==w.Success||!d)return a(!1);try{await this.launchOrAttachToSession(e,c),this._onDidNewSession.fire(e),a(!0)}catch(p){g(p)}},300)})))}async stopSession(e,t=!1,i=!1){if(e)return t?e.disconnect(void 0,i):e.terminate();const n=this.model.getSessions();return n.length===0&&(this.taskRunner.cancel(),await this.quickInputService.cancel(),this.endInitializingState(),this.cancelTokens(void 0)),Promise.all(n.map(s=>t?s.disconnect(void 0,i):s.terminate()))}async substituteVariables(e,t){const i=this.adapterManager.getDebugger(t.type);if(i){let n;if(e&&e.workspace)n=e.workspace;else{const s=this.contextService.getWorkspace().folders;s.length===1&&(n=s[0])}try{return await i.substituteVariables(n,t)}catch(s){this.showError(s.message,void 0,!!e?.getConfiguration(t.name));return}}return Promise.resolve(t)}async showError(e,t=[],i=!0){const n=new F(z,be,void 0,!0,()=>this.commandService.executeCommand(z)),s=t.filter(u=>u.id.endsWith(".command")).length>0?t:[...t,...i?[n]:[]];await this.dialogService.prompt({type:Z.Error,message:e,buttons:s.map(u=>({label:u.label,run:()=>u.run()})),cancelButton:!0})}async focusStackFrame(e,t,i,n){const{stackFrame:s,thread:u,session:o}=G(this.model,e,t,i);if(s){const r=await s.openInEditor(this.editorService,n?.preserveFocus??!0,n?.sideBySide,n?.pinned);if(r&&r.input!==q.instance){const d=r.getControl();if(s&&ie(d)&&d.hasModel()){const l=d.getModel(),c=s.range.startLineNumber;if(c>=1&&c<=l.getLineCount()){const a=d.getModel().getLineContent(c);T.alert(m.localize({key:"debuggingPaused",comment:['First placeholder is the file line content, second placeholder is the reason why debugging is stopped, for example "breakpoint", third is the stack frame name, and last is the line number.']},"{0}, debugging paused {1}, {2}:{3}",a,u&&u.stoppedDetails?`, reason ${u.stoppedDetails.reason}`:"",s.source?s.source.name:"",s.range.startLineNumber))}}}}o?this.debugType.set(o.configuration.type):this.debugType.reset(),this.viewModel.setFocus(s,u,o,!!n?.explicit)}addWatchExpression(e){const t=this.model.addWatchExpression(e);e||this.viewModel.setSelectedExpression(t,!1),this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions())}renameWatchExpression(e,t){this.model.renameWatchExpression(e,t),this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions())}moveWatchExpression(e,t){this.model.moveWatchExpression(e,t),this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions())}removeWatchExpressions(e){this.model.removeWatchExpressions(e),this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions())}canSetBreakpointsIn(e){return this.adapterManager.canSetBreakpointsIn(e)}async enableOrDisableBreakpoints(e,t){t?(this.model.setEnablement(t,e),this.debugStorage.storeBreakpoints(this.model),t instanceof Oe?(await this.makeTriggeredBreakpointsMatchEnablement(e,t),await this.sendBreakpoints(t.originalUri)):t instanceof Ue?await this.sendFunctionBreakpoints():t instanceof We?await this.sendDataBreakpoints():t instanceof Le?await this.sendInstructionBreakpoints():await this.sendExceptionBreakpoints()):(this.model.enableOrDisableAllBreakpoints(e),this.debugStorage.storeBreakpoints(this.model),await this.sendAllBreakpoints()),this.debugStorage.storeBreakpoints(this.model)}async addBreakpoints(e,t,i=!0){const n=this.model.addBreakpoints(e,t);return i&&n.forEach(s=>T.status(m.localize("breakpointAdded","Added breakpoint, line {0}, file {1}",s.lineNumber,e.fsPath))),this.debugStorage.storeBreakpoints(this.model),await this.sendBreakpoints(e),this.debugStorage.storeBreakpoints(this.model),n}async updateBreakpoints(e,t,i){this.model.updateBreakpoints(t),this.debugStorage.storeBreakpoints(this.model),i?this.breakpointsToSendOnResourceSaved.add(e):(await this.sendBreakpoints(e),this.debugStorage.storeBreakpoints(this.model))}async removeBreakpoints(e){const t=this.model.getBreakpoints(),i=t.filter(s=>!e||s.getId()===e);i.forEach(s=>T.status(m.localize("breakpointRemoved","Removed breakpoint, line {0}, file {1}",s.lineNumber,s.uri.fsPath)));const n=new Set(i.map(s=>s.originalUri.toString()));this.model.removeBreakpoints(i),this.unlinkTriggeredBreakpoints(t,i).forEach(s=>n.add(s.toString())),this.debugStorage.storeBreakpoints(this.model),await Promise.all([...n].map(s=>this.sendBreakpoints(ee.parse(s))))}setBreakpointsActivated(e){return this.model.setBreakpointsActivated(e),this.sendAllBreakpoints()}async addFunctionBreakpoint(e,t){this.model.addFunctionBreakpoint(e??{name:""},t),e&&(this.debugStorage.storeBreakpoints(this.model),await this.sendFunctionBreakpoints(),this.debugStorage.storeBreakpoints(this.model))}async updateFunctionBreakpoint(e,t){this.model.updateFunctionBreakpoint(e,t),this.debugStorage.storeBreakpoints(this.model),await this.sendFunctionBreakpoints()}async removeFunctionBreakpoints(e){this.model.removeFunctionBreakpoints(e),this.debugStorage.storeBreakpoints(this.model),await this.sendFunctionBreakpoints()}async addDataBreakpoint(e){this.model.addDataBreakpoint(e),this.debugStorage.storeBreakpoints(this.model),await this.sendDataBreakpoints(),this.debugStorage.storeBreakpoints(this.model)}async updateDataBreakpoint(e,t){this.model.updateDataBreakpoint(e,t),this.debugStorage.storeBreakpoints(this.model),await this.sendDataBreakpoints()}async removeDataBreakpoints(e){this.model.removeDataBreakpoints(e),this.debugStorage.storeBreakpoints(this.model),await this.sendDataBreakpoints()}async addInstructionBreakpoint(e){this.model.addInstructionBreakpoint(e),this.debugStorage.storeBreakpoints(this.model),await this.sendInstructionBreakpoints(),this.debugStorage.storeBreakpoints(this.model)}async removeInstructionBreakpoints(e,t){this.model.removeInstructionBreakpoints(e,t),this.debugStorage.storeBreakpoints(this.model),await this.sendInstructionBreakpoints()}setExceptionBreakpointFallbackSession(e){this.model.setExceptionBreakpointFallbackSession(e),this.debugStorage.storeBreakpoints(this.model)}setExceptionBreakpointsForSession(e,t){this.model.setExceptionBreakpointsForSession(e.getId(),t),this.debugStorage.storeBreakpoints(this.model)}async setExceptionBreakpointCondition(e,t){this.model.setExceptionBreakpointCondition(e,t),this.debugStorage.storeBreakpoints(this.model),await this.sendExceptionBreakpoints()}async sendAllBreakpoints(e){const t=K(this.model.getBreakpoints(),i=>i.originalUri.toString()).map(i=>this.sendBreakpoints(i.originalUri,!1,e));e?.capabilities.supportsConfigurationDoneRequest?await Promise.all([...t,this.sendFunctionBreakpoints(e),this.sendDataBreakpoints(e),this.sendInstructionBreakpoints(e),this.sendExceptionBreakpoints(e)]):(await Promise.all(t),await this.sendFunctionBreakpoints(e),await this.sendDataBreakpoints(e),await this.sendInstructionBreakpoints(e),await this.sendExceptionBreakpoints(e))}unlinkTriggeredBreakpoints(e,t){const i=[];for(const n of t)for(const s of e)!t.includes(s)&&s.triggeredBy===n.getId()&&(this.model.updateBreakpoints(new Map([[s.getId(),{triggeredBy:void 0}]])),i.push(s.originalUri));return i}async makeTriggeredBreakpointsMatchEnablement(e,t){if(e&&t.triggeredBy){const i=this.model.getBreakpoints().find(n=>t.triggeredBy===n.getId());i&&!i.enabled&&await this.enableOrDisableBreakpoints(e,i)}await Promise.all(this.model.getBreakpoints().filter(i=>i.triggeredBy===t.getId()&&i.enabled!==e).map(i=>this.enableOrDisableBreakpoints(e,i)))}async sendBreakpoints(e,t=!1,i){const n=this.model.getBreakpoints({originalUri:e,enabledOnly:!0});await D(this.model,i,async s=>{if(!s.configuration.noDebug){const u=n.filter(o=>!o.triggeredBy||o.getSessionDidTrigger(s.getId()));await s.sendBreakpoints(e,u,t)}})}async sendFunctionBreakpoints(e){const t=this.model.getFunctionBreakpoints().filter(i=>i.enabled&&this.model.areBreakpointsActivated());await D(this.model,e,async i=>{i.capabilities.supportsFunctionBreakpoints&&!i.configuration.noDebug&&await i.sendFunctionBreakpoints(t)})}async sendDataBreakpoints(e){const t=this.model.getDataBreakpoints().filter(i=>i.enabled&&this.model.areBreakpointsActivated());await D(this.model,e,async i=>{i.capabilities.supportsDataBreakpoints&&!i.configuration.noDebug&&await i.sendDataBreakpoints(t)})}async sendInstructionBreakpoints(e){const t=this.model.getInstructionBreakpoints().filter(i=>i.enabled&&this.model.areBreakpointsActivated());await D(this.model,e,async i=>{i.capabilities.supportsInstructionBreakpoints&&!i.configuration.noDebug&&await i.sendInstructionBreakpoints(t)})}sendExceptionBreakpoints(e){return D(this.model,e,async t=>{const i=this.model.getExceptionBreakpointsForSession(t.getId()).filter(n=>n.enabled);t.capabilities.supportsConfigurationDoneRequest&&(!t.capabilities.exceptionBreakpointFilters||t.capabilities.exceptionBreakpointFilters.length===0)||t.configuration.noDebug||await t.sendExceptionBreakpoints(i)})}onFileChanges(e){const t=this.model.getBreakpoints().filter(n=>e.contains(n.originalUri,O.DELETED));t.length&&this.model.removeBreakpoints(t);const i=[];for(const n of this.breakpointsToSendOnResourceSaved)e.contains(n,O.UPDATED)&&i.push(n);for(const n of i)this.breakpointsToSendOnResourceSaved.delete(n),this.sendBreakpoints(n,!0)}async runTo(e,t,i){let n,s=this.getViewModel().focusedThread;const u=async()=>{if(!!!this.getModel().getBreakpoints({column:i,lineNumber:t,uri:e}).length){const d=await this.addAndValidateBreakpoints(e,t,i);d.thread&&(s=d.thread),d.breakpoint&&(n=d.breakpoint)}return{threadToContinue:s,breakpointToRemove:n}},o=r=>r===b.Stopped||r===b.Inactive?(n&&this.removeBreakpoints(n.getId()),!0):!1;if(await u(),this.state===b.Inactive){const{launch:r,name:d,getConfig:l}=this.getConfigurationManager().selectedConfiguration,c=await l(),a=c?Object.assign(_(c),{}):d,g=this.onDidChangeState(S=>{o(S)&&g.dispose()});await this.startDebugging(r,a,void 0,!0)}if(this.state===b.Stopped){const r=this.getViewModel().focusedSession;if(!r||!s)return;const d=s.session.onDidChangeState(()=>{o(r.state)&&d.dispose()});await s.continue()}}async addAndValidateBreakpoints(e,t,i){const n=this.getModel(),s=this.getViewModel(),o=(await this.addBreakpoints(e,[{lineNumber:t,column:i}],!1))?.[0];if(!o)return{breakpoint:void 0,thread:s.focusedThread};if(!o.verified){let c;await Y(new Promise(a=>{c=n.onDidChangeBreakpoints(()=>{o.verified&&a()})}),2e3),c.dispose()}let r;(p=>(p[p.Focused=0]="Focused",p[p.Verified=1]="Verified",p[p.VerifiedAndPausedInFile=2]="VerifiedAndPausedInFile",p[p.VerifiedAndFocused=3]="VerifiedAndFocused"))(r||={});let d=s.focusedThread,l=0;for(const c of o.sessionsThatVerified){const a=n.getSession(c);if(!a)continue;const g=a.getAllThreads().filter(S=>S.stopped);if(l<3&&s.focusedThread&&g.includes(s.focusedThread)&&(d=s.focusedThread,l=3),l<2){const S=g.find(p=>{const k=p.getTopStackFrame();return k&&this.uriIdentityService.extUri.isEqual(k.source.uri,e)});S&&(d=S,l=2)}l<1&&(d=g[0],l=2)}return{thread:d,breakpoint:o}}};C=R([f(0,Qe),f(1,tt),f(2,it),f(3,Se),f(4,ce),f(5,ae),f(6,$e),f(7,pe),f(8,oe),f(9,et),f(10,ue),f(11,Je),f(12,de),f(13,ne),f(14,re),f(15,je),f(16,se),f(17,le),f(18,fe),f(19,ge),f(20,Ke)],C);function G(I,e,t,i,n){if(!i)if(e||t)i=e?e.thread.session:t.session;else{const s=I.getSessions();i=s.find(o=>o.state===b.Stopped)||s.find(o=>o!==n&&o!==n?.parentSession)||(s.length?s[0]:void 0)}if(!t)if(e)t=e.thread;else{const s=i?i.getAllThreads():void 0;t=s&&s.find(o=>o.stopped)||(s&&s.length?s[0]:void 0)}return!e&&t&&(e=t.getTopStackFrame()),{session:i,thread:t,stackFrame:e}}async function D(I,e,t){e?await t(e):await Promise.all(I.getSessions().map(i=>t(i)))}export{C as DebugService,G as getStackFrameThreadAndSessionToFocus};
