var M=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var R=(g,t,i,e)=>{for(var r=e>1?void 0:e?F(t,i):t,o=g.length-1,s;o>=0;o--)(s=g[o])&&(r=(e?s(t,i,r):s(r))||r);return e&&r&&M(t,i,r),r},u=(g,t)=>(i,e)=>t(i,e,g);import{getActiveWindow as x}from"../../../../base/browser/dom.js";import*as T from"../../../../base/browser/ui/aria/aria.js";import{mainWindow as O}from"../../../../base/browser/window.js";import{distinct as V}from"../../../../base/common/arrays.js";import{Queue as U,RunOnceScheduler as B,raceTimeout as W}from"../../../../base/common/async.js";import{CancellationTokenSource as C}from"../../../../base/common/cancellation.js";import{canceled as q}from"../../../../base/common/errors.js";import{Emitter as l}from"../../../../base/common/event.js";import{normalizeDriveLetter as z}from"../../../../base/common/labels.js";import{Disposable as G,DisposableMap as j,DisposableStore as A,MutableDisposable as Q,dispose as H}from"../../../../base/common/lifecycle.js";import{mixin as $}from"../../../../base/common/objects.js";import*as K from"../../../../base/common/platform.js";import*as X from"../../../../base/common/resources.js";import S from"../../../../base/common/severity.js";import{isDefined as Y}from"../../../../base/common/types.js";import{URI as J}from"../../../../base/common/uri.js";import{generateUuid as Z}from"../../../../base/common/uuid.js";import{localize as n}from"../../../../nls.js";import{IAccessibilityService as ee}from"../../../../platform/accessibility/common/accessibility.js";import{IConfigurationService as te}from"../../../../platform/configuration/common/configuration.js";import{IInstantiationService as ie}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as re}from"../../../../platform/log/common/log.js";import{INotificationService as oe}from"../../../../platform/notification/common/notification.js";import{IProductService as se}from"../../../../platform/product/common/productService.js";import{ICustomEndpointTelemetryService as ne,ITelemetryService as ae,TelemetryLevel as de}from"../../../../platform/telemetry/common/telemetry.js";import{IUriIdentityService as ue}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as ce}from"../../../../platform/workspace/common/workspace.js";import{ViewContainerLocation as pe}from"../../../common/views.js";import{IWorkbenchEnvironmentService as le}from"../../../services/environment/common/environmentService.js";import{IHostService as he}from"../../../services/host/browser/host.js";import{ILifecycleService as ge}from"../../../services/lifecycle/common/lifecycle.js";import{IPaneCompositePartService as be}from"../../../services/panecomposite/browser/panecomposite.js";import{ITestResultService as fe}from"../../testing/common/testResultService.js";import{ITestService as me}from"../../testing/common/testService.js";import{IDebugService as we,State as h,VIEWLET_ID as ye,isFrameDeemphasized as Se}from"../common/debug.js";import{ExpressionContainer as _,MemoryRegion as De,Thread as ve}from"../common/debugModel.js";import{Source as D}from"../common/debugSource.js";import{filterExceptionsFromTelemetry as Ie}from"../common/debugUtils.js";import{ReplModel as ke}from"../common/replModel.js";import{RawDebugSession as Ee}from"./rawDebugSession.js";const Pe=1500;let w=class{constructor(t,i,e,r,o,s,a,p,d,b,m,y,Te,v,Be,Ce,Ae,_e,Ne,Le,N,Me){this.id=t;this._configuration=i;this.root=e;this.model=r;this.debugService=s;this.telemetryService=a;this.hostService=p;this.configurationService=d;this.paneCompositeService=b;this.workspaceContextService=m;this.productService=y;this.notificationService=Te;this.uriIdentityService=Be;this.instantiationService=Ce;this.customEndpointTelemetryService=Ae;this.workbenchEnvironmentService=_e;this.logService=Ne;this.testService=Le;this.accessibilityService=Me;this._options=o||{},this.parentSession=this._options.parentSession,this.hasSeparateRepl()?this.repl=new ke(this.configurationService):this.repl=this.parentSession.repl;const f=this.globalDisposables,I=f.add(new Q);I.value=this.repl.onDidChangeElements(c=>this._onDidChangeREPLElements.fire(c)),v&&f.add(v.onWillShutdown(()=>{this.shutdown(),H(f)})),this.correlatedTestRun=o?.testRun?N.getResult(o.testRun.runId):this.parentSession?.correlatedTestRun,this.correlatedTestRun&&f.add(this.correlatedTestRun.onComplete(()=>this.terminate()));const k=this._options.compoundRoot;k&&f.add(k.onDidSessionStop(()=>this.terminate())),this.passFocusScheduler=new B(()=>{if(this.debugService.getModel().getSessions().some(c=>c.state===h.Stopped)||this.getAllThreads().some(c=>c.stopped))if(typeof this.lastContinuedThreadId=="number"){const c=this.debugService.getViewModel().focusedThread;if(c&&c.threadId===this.lastContinuedThreadId&&!c.stopped){const P=this.getStoppedDetails()?.threadId,L=typeof P=="number"?this.getThread(P):void 0;this.debugService.focusStackFrame(void 0,L)}}else{const c=this.debugService.getViewModel().focusedSession;c&&c.getId()===this.getId()&&c.state!==h.Stopped&&this.debugService.focusStackFrame(void 0)}},800);const E=this._options.parentSession;E&&f.add(E.onDidEndAdapter(()=>{!this.hasSeparateRepl()&&this.raw?.isInShutdown===!1&&(this.repl=this.repl.clone(),I.value=this.repl.onDidChangeElements(c=>this._onDidChangeREPLElements.fire(c)),this.parentSession=void 0)}))}parentSession;_subId;raw;initialized=!1;_options;sources=new Map;threads=new Map;threadIds=[];cancellationMap=new Map;rawListeners=new A;globalDisposables=new A;fetchThreadsScheduler;passFocusScheduler;lastContinuedThreadId;repl;stoppedDetails=[];statusQueue=this.rawListeners.add(new Re);correlatedTestRun;didTerminateTestRun;_onDidChangeState=new l;_onDidEndAdapter=new l;_onDidLoadedSource=new l;_onDidCustomEvent=new l;_onDidProgressStart=new l;_onDidProgressUpdate=new l;_onDidProgressEnd=new l;_onDidInvalidMemory=new l;_onDidChangeREPLElements=new l;_name;_onDidChangeName=new l;_waitToResume;getId(){return this.id}setSubId(t){this._subId=t}getMemory(t){return new De(t,this)}get subId(){return this._subId}get configuration(){return this._configuration.resolved}get unresolvedConfiguration(){return this._configuration.unresolved}get lifecycleManagedByParent(){return!!this._options.lifecycleManagedByParent}get compact(){return!!this._options.compact}get saveBeforeRestart(){return this._options.saveBeforeRestart??!this._options?.parentSession}get compoundRoot(){return this._options.compoundRoot}get suppressDebugStatusbar(){return this._options.suppressDebugStatusbar??!1}get suppressDebugToolbar(){return this._options.suppressDebugToolbar??!1}get suppressDebugView(){return this._options.suppressDebugView??!1}get autoExpandLazyVariables(){const t=this.accessibilityService.isScreenReaderOptimized(),i=this.configurationService.getValue("debug").autoExpandLazyVariables;return i==="auto"&&t||i==="on"}setConfiguration(t){this._configuration=t}getLabel(){return this.workspaceContextService.getWorkspace().folders.length>1&&this.root?`${this.name} (${X.basenameOrAuthority(this.root.uri)})`:this.name}setName(t){this._name=t,this._onDidChangeName.fire(t)}get name(){return this._name||this.configuration.name}get state(){if(!this.initialized)return h.Initializing;if(!this.raw)return h.Inactive;const t=this.debugService.getViewModel().focusedThread;return t&&t.session===this?t.stopped?h.Stopped:h.Running:this.getAllThreads().some(i=>i.stopped)?h.Stopped:h.Running}get capabilities(){return this.raw?this.raw.capabilities:Object.create(null)}get onDidChangeState(){return this._onDidChangeState.event}get onDidEndAdapter(){return this._onDidEndAdapter.event}get onDidChangeReplElements(){return this._onDidChangeREPLElements.event}get onDidChangeName(){return this._onDidChangeName.event}get onDidCustomEvent(){return this._onDidCustomEvent.event}get onDidLoadedSource(){return this._onDidLoadedSource.event}get onDidProgressStart(){return this._onDidProgressStart.event}get onDidProgressUpdate(){return this._onDidProgressUpdate.event}get onDidProgressEnd(){return this._onDidProgressEnd.event}get onDidInvalidateMemory(){return this._onDidInvalidMemory.event}async initialize(t){this.raw&&await this.shutdown();try{const i=await t.createDebugAdapter(this);this.raw=this.instantiationService.createInstance(Ee,i,t,this.id,this.configuration.name),await this.raw.start(),this.registerListeners(),await this.raw.initialize({clientID:"vscode",clientName:this.productService.nameLong,adapterID:this.configuration.type,pathFormat:"path",linesStartAt1:!0,columnsStartAt1:!0,supportsVariableType:!0,supportsVariablePaging:!0,supportsRunInTerminalRequest:!0,locale:K.language,supportsProgressReporting:!0,supportsInvalidatedEvent:!0,supportsMemoryReferences:!0,supportsArgsCanBeInterpretedByShell:!0,supportsMemoryEvent:!0,supportsStartDebuggingRequest:!0,supportsANSIStyling:!0}),this.initialized=!0,this._onDidChangeState.fire(),this.debugService.setExceptionBreakpointsForSession(this,this.raw&&this.raw.capabilities.exceptionBreakpointFilters||[]),this.debugService.getModel().registerBreakpointModes(this.configuration.type,this.raw.capabilities.breakpointModes||[])}catch(i){throw this.initialized=!0,this._onDidChangeState.fire(),await this.shutdown(),i}}async launchOrAttach(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","launch or attach"));if(this.parentSession&&this.parentSession.state===h.Inactive)throw q();t.__sessionId=this.getId();try{await this.raw.launchOrAttach(t)}catch(i){throw this.shutdown(),i}}async terminate(t=!1){this.raw||this.onDidExitAdapter(),this.cancelAllRequests(),this._options.lifecycleManagedByParent&&this.parentSession?await this.parentSession.terminate(t):this.correlatedTestRun&&!this.correlatedTestRun.completedAt&&!this.didTerminateTestRun?(this.didTerminateTestRun=!0,this.testService.cancelTestRun(this.correlatedTestRun.id)):this.raw&&(this.raw.capabilities.supportsTerminateRequest&&this._configuration.resolved.request==="launch"?await this.raw.terminate(t):await this.raw.disconnect({restart:t,terminateDebuggee:!0})),t||this._options.compoundRoot?.sessionStopped()}async disconnect(t=!1,i=!1){this.raw||this.onDidExitAdapter(),this.cancelAllRequests(),this._options.lifecycleManagedByParent&&this.parentSession?await this.parentSession.disconnect(t,i):this.raw&&await this.raw.disconnect({restart:t,terminateDebuggee:!1,suspendDebuggee:i}),t||this._options.compoundRoot?.sessionStopped()}async restart(){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","restart"));this.cancelAllRequests(),this._options.lifecycleManagedByParent&&this.parentSession?await this.parentSession.restart():await this.raw.restart({arguments:this.configuration})}async sendBreakpoints(t,i,e){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","breakpoints"));if(!this.raw.readyForBreakpoints)return Promise.resolve(void 0);const r=this.getRawSource(t);i.length&&!r.adapterData&&(r.adapterData=i[0].adapterData),r.path&&(r.path=z(r.path));const o=await this.raw.setBreakpoints({source:r,lines:i.map(s=>s.sessionAgnosticData.lineNumber),breakpoints:i.map(s=>s.toDAP()),sourceModified:e});if(o?.body){const s=new Map;for(let a=0;a<i.length;a++)s.set(i[a].getId(),o.body.breakpoints[a]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,s)}}async sendFunctionBreakpoints(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","function breakpoints"));if(this.raw.readyForBreakpoints){const i=await this.raw.setFunctionBreakpoints({breakpoints:t.map(e=>e.toDAP())});if(i?.body){const e=new Map;for(let r=0;r<t.length;r++)e.set(t[r].getId(),i.body.breakpoints[r]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,e)}}}async sendExceptionBreakpoints(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","exception breakpoints"));if(this.raw.readyForBreakpoints){const i=this.capabilities.supportsExceptionFilterOptions?{filters:[],filterOptions:t.map(r=>r.condition?{filterId:r.filter,condition:r.condition}:{filterId:r.filter})}:{filters:t.map(r=>r.filter)},e=await this.raw.setExceptionBreakpoints(i);if(e?.body&&e.body.breakpoints){const r=new Map;for(let o=0;o<t.length;o++)r.set(t[o].getId(),e.body.breakpoints[o]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,r)}}}dataBytesBreakpointInfo(t,i){if(this.raw?.capabilities.supportsDataBreakpointBytes===!1)throw new Error(n("sessionDoesNotSupporBytesBreakpoints","Session does not support breakpoints with bytes"));return this._dataBreakpointInfo({name:t,bytes:i,asAddress:!0})}dataBreakpointInfo(t,i){return this._dataBreakpointInfo({name:t,variablesReference:i})}async _dataBreakpointInfo(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","data breakpoints info"));if(!this.raw.readyForBreakpoints)throw new Error(n("sessionNotReadyForBreakpoints","Session is not ready for breakpoints"));return(await this.raw.dataBreakpointInfo(t))?.body}async sendDataBreakpoints(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","data breakpoints"));if(this.raw.readyForBreakpoints){const i=await Promise.all(t.map(async r=>{try{return{dap:await r.toDAP(this),bp:r}}catch(o){return{bp:r,message:o.message}}})),e=await this.raw.setDataBreakpoints({breakpoints:i.map(r=>r.dap).filter(Y)});if(e?.body){const r=new Map;let o=0;for(const s of i)s.dap?o<e.body.breakpoints.length&&r.set(s.bp.getId(),e.body.breakpoints[o++]):r.set(s.bp.getId(),s.message);this.model.setBreakpointSessionData(this.getId(),this.capabilities,r)}}}async sendInstructionBreakpoints(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","instruction breakpoints"));if(this.raw.readyForBreakpoints){const i=await this.raw.setInstructionBreakpoints({breakpoints:t.map(e=>e.toDAP())});if(i?.body){const e=new Map;for(let r=0;r<t.length;r++)e.set(t[r].getId(),i.body.breakpoints[r]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,e)}}}async breakpointsLocations(t,i){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","breakpoints locations"));const e=this.getRawSource(t),r=await this.raw.breakpointLocations({source:e,line:i});if(!r||!r.body||!r.body.breakpoints)return[];const o=r.body.breakpoints.map(s=>({lineNumber:s.line,column:s.column||1}));return V(o,s=>`${s.lineNumber}:${s.column}`)}getDebugProtocolBreakpoint(t){return this.model.getDebugProtocolBreakpoint(t,this.getId())}customRequest(t,i){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'",t));return this.raw.custom(t,i)}stackTrace(t,i,e,r){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","stackTrace"));const o=this.getNewCancellationToken(t,r);return this.raw.stackTrace({threadId:t,startFrame:i,levels:e},o)}async exceptionInfo(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","exceptionInfo"));const i=await this.raw.exceptionInfo({threadId:t});if(i)return{id:i.body.exceptionId,description:i.body.description,breakMode:i.body.breakMode,details:i.body.details}}scopes(t,i){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","scopes"));const e=this.getNewCancellationToken(i);return this.raw.scopes({frameId:t},e)}variables(t,i,e,r,o){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","variables"));const s=i?this.getNewCancellationToken(i):void 0;return this.raw.variables({variablesReference:t,filter:e,start:r,count:o},s)}evaluate(t,i,e,r){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","evaluate"));return this.raw.evaluate({expression:t,frameId:i,context:e,line:r?.line,column:r?.column,source:r?.source})}async restartFrame(t,i){if(await this.waitForTriggeredBreakpoints(),!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","restartFrame"));await this.raw.restartFrame({frameId:t},i)}setLastSteppingGranularity(t,i){const e=this.getThread(t);e&&(e.lastSteppingGranularity=i)}async next(t,i){if(await this.waitForTriggeredBreakpoints(),!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","next"));this.setLastSteppingGranularity(t,i),await this.raw.next({threadId:t,granularity:i})}async stepIn(t,i,e){if(await this.waitForTriggeredBreakpoints(),!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","stepIn"));this.setLastSteppingGranularity(t,e),await this.raw.stepIn({threadId:t,targetId:i,granularity:e})}async stepOut(t,i){if(await this.waitForTriggeredBreakpoints(),!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","stepOut"));this.setLastSteppingGranularity(t,i),await this.raw.stepOut({threadId:t,granularity:i})}async stepBack(t,i){if(await this.waitForTriggeredBreakpoints(),!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","stepBack"));this.setLastSteppingGranularity(t,i),await this.raw.stepBack({threadId:t,granularity:i})}async continue(t){if(await this.waitForTriggeredBreakpoints(),!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","continue"));await this.raw.continue({threadId:t})}async reverseContinue(t){if(await this.waitForTriggeredBreakpoints(),!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","reverse continue"));await this.raw.reverseContinue({threadId:t})}async pause(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","pause"));await this.raw.pause({threadId:t})}async terminateThreads(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","terminateThreads"));await this.raw.terminateThreads({threadIds:t})}setVariable(t,i,e){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","setVariable"));return this.raw.setVariable({variablesReference:t,name:i,value:e})}setExpression(t,i,e){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","setExpression"));return this.raw.setExpression({expression:i,value:e,frameId:t})}gotoTargets(t,i,e){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","gotoTargets"));return this.raw.gotoTargets({source:t,line:i,column:e})}goto(t,i){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","goto"));return this.raw.goto({threadId:t,targetId:i})}loadSource(t){if(!this.raw)return Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","loadSource")));const i=this.getSourceForUri(t);let e;if(i)e=i.raw;else{const r=D.getEncodedDebugData(t);e={path:r.path,sourceReference:r.sourceReference}}return this.raw.source({sourceReference:e.sourceReference||0,source:e})}async getLoadedSources(){if(!this.raw)return Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","getLoadedSources")));const t=await this.raw.loadedSources({});return t?.body&&t.body.sources?t.body.sources.map(i=>this.getSource(i)):[]}async completions(t,i,e,r,o,s){if(!this.raw)return Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","completions")));const a=this.getNewCancellationToken(i,s);return this.raw.completions({frameId:t,text:e,column:r.column,line:r.lineNumber},a)}async stepInTargets(t){return this.raw?(await this.raw.stepInTargets({frameId:t}))?.body.targets:Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","stepInTargets")))}async cancel(t){return this.raw?this.raw.cancel({progressId:t}):Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","cancel")))}async disassemble(t,i,e,r){return this.raw?(await this.raw.disassemble({memoryReference:t,offset:i,instructionOffset:e,instructionCount:r,resolveSymbols:!0}))?.body?.instructions:Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","disassemble")))}readMemory(t,i,e){return this.raw?this.raw.readMemory({count:e,memoryReference:t,offset:i}):Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","readMemory")))}writeMemory(t,i,e,r){return this.raw?this.raw.writeMemory({memoryReference:t,offset:i,allowPartial:r,data:e}):Promise.reject(new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","disassemble")))}async resolveLocationReference(t){if(!this.raw)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","locations"));const i=await this.raw.locations({locationReference:t});if(!i?.body)throw new Error(n("noDebugAdapter","No debugger available, can not send '{0}'","locations"));const e=this.getSource(i.body.source);return{column:1,...i.body,source:e}}getThread(t){return this.threads.get(t)}getAllThreads(){const t=[];return this.threadIds.forEach(i=>{const e=this.threads.get(i);e&&t.push(e)}),t}clearThreads(t,i=void 0){if(i!=null){const e=this.threads.get(i);e&&(e.clearCallStack(),e.stoppedDetails=void 0,e.stopped=!1,t&&this.threads.delete(i))}else this.threads.forEach(e=>{e.clearCallStack(),e.stoppedDetails=void 0,e.stopped=!1}),t&&(this.threads.clear(),this.threadIds=[],_.allValues.clear())}getStoppedDetails(){return this.stoppedDetails.length>=1?this.stoppedDetails[0]:void 0}rawUpdate(t){this.threadIds=[],t.threads.forEach(e=>{if(this.threadIds.push(e.id),!this.threads.has(e.id))this.threads.set(e.id,new ve(this,e.name,e.id));else if(e.name){const r=this.threads.get(e.id);r&&(r.name=e.name)}}),this.threads.forEach(e=>{this.threadIds.indexOf(e.threadId)===-1&&this.threads.delete(e.threadId)});const i=t.stoppedDetails;if(i)if(i.allThreadsStopped)this.threads.forEach(e=>{e.stoppedDetails=e.threadId===i.threadId?i:{reason:e.stoppedDetails?.reason},e.stopped=!0,e.clearCallStack()});else{const e=typeof i.threadId=="number"?this.threads.get(i.threadId):void 0;e&&(e.stoppedDetails=i,e.clearCallStack(),e.stopped=!0)}}waitForTriggeredBreakpoints(){if(this._waitToResume)return W(this._waitToResume,Pe)}async fetchThreads(t){if(this.raw){const i=await this.raw.threads();i?.body&&i.body.threads&&this.model.rawUpdate({sessionId:this.getId(),threads:i.body.threads,stoppedDetails:t})}}initializeForTest(t){this.raw=t,this.registerListeners()}registerListeners(){if(!this.raw)return;this.rawListeners.add(this.raw.onDidInitialize(async()=>{T.status(this.configuration.noDebug?n("debuggingStartedNoDebug","Started running without debugging."):n("debuggingStarted","Debugging started."));const e=async()=>{if(this.raw&&this.raw.capabilities.supportsConfigurationDoneRequest)try{await this.raw.configurationDone()}catch(r){this.notificationService.error(r),this.raw?.disconnect({})}};try{await this.debugService.sendAllBreakpoints(this)}finally{await e(),await this.fetchThreads()}}));const t=this.statusQueue;this.rawListeners.add(this.raw.onDidStop(e=>this.handleStop(e.body))),this.rawListeners.add(this.raw.onDidThread(e=>{if(t.cancel([e.body.threadId]),e.body.reason==="started")this.fetchThreadsScheduler||(this.fetchThreadsScheduler=new B(()=>{this.fetchThreads()},100),this.rawListeners.add(this.fetchThreadsScheduler)),this.fetchThreadsScheduler.isScheduled()||this.fetchThreadsScheduler.schedule();else if(e.body.reason==="exited"){this.model.clearThreads(this.getId(),!0,e.body.threadId);const r=this.debugService.getViewModel(),o=r.focusedThread;this.passFocusScheduler.cancel(),o&&e.body.threadId===o.threadId&&this.debugService.focusStackFrame(void 0,void 0,r.focusedSession,{explicit:!1})}})),this.rawListeners.add(this.raw.onDidTerminateDebugee(async e=>{T.status(n("debuggingStopped","Debugging stopped.")),e.body&&e.body.restart?await this.debugService.restartSession(this,e.body.restart):this.raw&&await this.raw.disconnect({terminateDebuggee:!1})})),this.rawListeners.add(this.raw.onDidContinued(e=>{const r=e.body.allThreadsContinued!==!1;t.cancel(r?void 0:[e.body.threadId]);const o=r?void 0:e.body.threadId;if(typeof o=="number"){this.stoppedDetails=this.stoppedDetails.filter(a=>a.threadId!==o);const s=this.cancellationMap.get(o);this.cancellationMap.delete(o),s?.forEach(a=>a.dispose(!0))}else this.stoppedDetails=[],this.cancelAllRequests();this.lastContinuedThreadId=o,this.passFocusScheduler.schedule(),this.model.clearThreads(this.getId(),!1,o),this._onDidChangeState.fire()}));const i=new U;this.rawListeners.add(this.raw.onDidOutput(async e=>{const r=e.body.category==="stderr"?S.Error:e.body.category==="console"?S.Warning:S.Info;if(e.body.variablesReference){const o=e.body.source&&e.body.line?{lineNumber:e.body.line,column:e.body.column?e.body.column:1,source:this.getSource(e.body.source)}:void 0,a=new _(this,void 0,e.body.variablesReference,Z()).getChildren();i.queue(async()=>{const p=await a;if(p.length===1){this.appendToRepl({output:e.body.output,expression:p[0],sev:r,source:o},e.body.category==="important");return}p.forEach(d=>{d.name=null,this.appendToRepl({output:"",expression:d,sev:r,source:o},e.body.category==="important")})});return}i.queue(async()=>{if(!e.body||!this.raw)return;if(e.body.category==="telemetry"){const s=this.raw.dbgr.getCustomTelemetryEndpoint();if(s&&this.telemetryService.telemetryLevel!==de.NONE){let a=e.body.data;!s.sendErrorTelemetry&&e.body.data&&(a=Ie(e.body.data)),this.customEndpointTelemetryService.publicLog(s,e.body.output,a)}return}const o=e.body.source&&e.body.line?{lineNumber:e.body.line,column:e.body.column?e.body.column:1,source:this.getSource(e.body.source)}:void 0;if(e.body.group==="start"||e.body.group==="startCollapsed"){const s=e.body.group==="start";this.repl.startGroup(this,e.body.output||"",s,o);return}e.body.group==="end"&&(this.repl.endGroup(),!e.body.output)||typeof e.body.output=="string"&&this.appendToRepl({output:e.body.output,sev:r,source:o},e.body.category==="important")})})),this.rawListeners.add(this.raw.onDidBreakpoint(e=>{const r=e.body&&e.body.breakpoint?e.body.breakpoint.id:void 0,o=this.model.getBreakpoints().find(d=>d.getIdFromAdapter(this.getId())===r),s=this.model.getFunctionBreakpoints().find(d=>d.getIdFromAdapter(this.getId())===r),a=this.model.getDataBreakpoints().find(d=>d.getIdFromAdapter(this.getId())===r),p=this.model.getExceptionBreakpoints().find(d=>d.getIdFromAdapter(this.getId())===r);if(e.body.reason==="new"&&e.body.breakpoint.source&&e.body.breakpoint.line){const d=this.getSource(e.body.breakpoint.source),b=this.model.addBreakpoints(d.uri,[{column:e.body.breakpoint.column,enabled:!0,lineNumber:e.body.breakpoint.line}],!1);if(b.length===1){const m=new Map([[b[0].getId(),e.body.breakpoint]]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,m)}}if(e.body.reason==="removed"&&(o&&this.model.removeBreakpoints([o]),s&&this.model.removeFunctionBreakpoints(s.getId()),a&&this.model.removeDataBreakpoints(a.getId())),e.body.reason==="changed"){if(o){o.column||(e.body.breakpoint.column=void 0);const d=new Map([[o.getId(),e.body.breakpoint]]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,d)}if(s){const d=new Map([[s.getId(),e.body.breakpoint]]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,d)}if(a){const d=new Map([[a.getId(),e.body.breakpoint]]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,d)}if(p){const d=new Map([[p.getId(),e.body.breakpoint]]);this.model.setBreakpointSessionData(this.getId(),this.capabilities,d)}}})),this.rawListeners.add(this.raw.onDidLoadedSource(e=>{this._onDidLoadedSource.fire({reason:e.body.reason,source:this.getSource(e.body.source)})})),this.rawListeners.add(this.raw.onDidCustomEvent(e=>{this._onDidCustomEvent.fire(e)})),this.rawListeners.add(this.raw.onDidProgressStart(e=>{this._onDidProgressStart.fire(e)})),this.rawListeners.add(this.raw.onDidProgressUpdate(e=>{this._onDidProgressUpdate.fire(e)})),this.rawListeners.add(this.raw.onDidProgressEnd(e=>{this._onDidProgressEnd.fire(e)})),this.rawListeners.add(this.raw.onDidInvalidateMemory(e=>{this._onDidInvalidMemory.fire(e)})),this.rawListeners.add(this.raw.onDidInvalidated(async e=>{const r=e.body.areas||["all"];if(r.includes("threads")||r.includes("stacks")||r.includes("all")){this.cancelAllRequests(),this.model.clearThreads(this.getId(),!0);const s=this.stoppedDetails;this.stoppedDetails.length=1,await Promise.all(s.map(a=>this.handleStop(a)))}const o=this.debugService.getViewModel();o.focusedSession===this&&o.updateViews()})),this.rawListeners.add(this.raw.onDidExitAdapter(e=>this.onDidExitAdapter(e)))}async handleStop(t){this.passFocusScheduler.cancel(),this.stoppedDetails.push(t),t.hitBreakpointIds&&(this._waitToResume=this.enableDependentBreakpoints(t.hitBreakpointIds)),this.statusQueue.run(this.fetchThreads(t).then(()=>t.threadId===void 0?this.threadIds:[t.threadId]),async(i,e)=>{const r=t.threadId===void 0&&this.threadIds.length>10,o=this.debugService.getViewModel().focusedThread,s=o!==void 0&&o.session===this&&!this.threads.has(o.threadId);s&&this.debugService.focusStackFrame(void 0,void 0);const a=typeof i=="number"?this.getThread(i):void 0;if(a){const p=this.model.refreshTopOfCallstack(a,!r),d=async()=>{if(s||!t.preserveFocusHint&&a.getCallStack().length){const m=this.debugService.getViewModel().focusedStackFrame;if(!m||m.thread.session===this){const y=!this.configurationService.getValue("debug").focusEditorOnBreak;await this.debugService.focusStackFrame(void 0,a,void 0,{preserveFocus:y})}a.stoppedDetails&&!e.isCancellationRequested&&(a.stoppedDetails.reason==="breakpoint"&&this.configurationService.getValue("debug").openDebug==="openOnDebugBreak"&&!this.suppressDebugView&&await this.paneCompositeService.openPaneComposite(ye,pe.Sidebar),this.configurationService.getValue("debug").focusWindowOnBreak&&!this.workbenchEnvironmentService.extensionTestsLocationURI&&(x().document.hasFocus()||await this.hostService.focus(O,{force:!0})))}};if(await p.topCallStack,t.hitBreakpointIds||(this._waitToResume=this.enableDependentBreakpoints(a)),e.isCancellationRequested||(d(),await p.wholeCallStack,e.isCancellationRequested))return;const b=this.debugService.getViewModel().focusedStackFrame;(!b||Se(b))&&d()}this._onDidChangeState.fire()})}async enableDependentBreakpoints(t){let i;if(Array.isArray(t))i=this.model.getBreakpoints().filter(o=>t.includes(o.getIdFromAdapter(this.id)));else{const o=t.getTopStackFrame();if(o===void 0||t.stoppedDetails&&t.stoppedDetails.reason!=="breakpoint")return;i=this.getBreakpointsAtPosition(o.source.uri,o.range.startLineNumber,o.range.endLineNumber,o.range.startColumn,o.range.endColumn)}const e=new Set;this.model.getBreakpoints({triggeredOnly:!0,enabledOnly:!0}).forEach(o=>{i.forEach(s=>{o.enabled&&o.triggeredBy===s.getId()&&(o.setSessionDidTrigger(this.getId()),e.add(o.uri.toString()))})});const r=[];return e.forEach(o=>r.push(this.debugService.sendBreakpoints(J.parse(o),void 0,this))),Promise.all(r)}getBreakpointsAtPosition(t,i,e,r,o){return this.model.getBreakpoints({uri:t}).filter(s=>!(s.lineNumber<i||s.lineNumber>e||s.column&&(s.column<r||s.column>o)))}onDidExitAdapter(t){this.initialized=!0,this.model.setBreakpointSessionData(this.getId(),this.capabilities,void 0),this.shutdown(),this._onDidEndAdapter.fire(t)}shutdown(){this.rawListeners.clear(),this.raw&&(this.raw.disconnect({}),this.raw.dispose(),this.raw=void 0),this.fetchThreadsScheduler?.dispose(),this.fetchThreadsScheduler=void 0,this.passFocusScheduler.cancel(),this.passFocusScheduler.dispose(),this.model.clearThreads(this.getId(),!0),this._onDidChangeState.fire()}dispose(){this.cancelAllRequests(),this.rawListeners.dispose(),this.globalDisposables.dispose()}getSourceForUri(t){return this.sources.get(this.uriIdentityService.asCanonicalUri(t).toString())}getSource(t){let i=new D(t,this.getId(),this.uriIdentityService,this.logService);const e=i.uri.toString(),r=this.sources.get(e);return r?(i=r,i.raw=$(i.raw,t),i.raw&&t&&(i.raw.presentationHint=t.presentationHint)):this.sources.set(e,i),i}getRawSource(t){const i=this.getSourceForUri(t);if(i)return i.raw;{const e=D.getEncodedDebugData(t);return{name:e.name,path:e.path,sourceReference:e.sourceReference}}}getNewCancellationToken(t,i){const e=new C(i),r=this.cancellationMap.get(t)||[];return r.push(e),this.cancellationMap.set(t,r),e.token}cancelAllRequests(){this.cancellationMap.forEach(t=>t.forEach(i=>i.dispose(!0))),this.cancellationMap.clear()}getReplElements(){return this.repl.getReplElements()}hasSeparateRepl(){return!this.parentSession||this._options.repl!=="mergeWithParent"}removeReplExpressions(){this.repl.removeReplExpressions()}async addReplExpression(t,i){await this.repl.addReplExpression(this,t,i),this.debugService.getViewModel().updateViews()}appendToRepl(t,i){this.repl.appendToRepl(this,t),i&&this.notificationService.notify({message:t.output.toString(),severity:t.sev,source:this.name})}};w=R([u(5,we),u(6,ae),u(7,he),u(8,te),u(9,be),u(10,ce),u(11,se),u(12,oe),u(13,ge),u(14,ue),u(15,ie),u(16,ne),u(17,le),u(18,re),u(19,me),u(20,fe),u(21,ee)],w);class Re extends G{pendingCancellations=[];threadOps=this._register(new j);async run(t,i){const e=new Set;this.pendingCancellations.push(e);const r=await t;for(let o=0;o<this.pendingCancellations.length;o++){const s=this.pendingCancellations[o];if(s===e){this.pendingCancellations.splice(o,1);break}else for(const a of r)s.add(a)}e.has(void 0)||await Promise.all(r.map(o=>{if(e.has(o))return;this.threadOps.get(o)?.cancel();const s=new C;return this.threadOps.set(o,s),i(o,s.token)}))}cancel(t){if(t)for(const i of t){this.threadOps.get(i)?.cancel(),this.threadOps.deleteAndDispose(i);for(const e of this.pendingCancellations)e.add(i)}else{for(const[i,e]of this.threadOps)e.cancel();this.threadOps.clearAndDisposeAll();for(const i of this.pendingCancellations)i.add(void 0)}}}export{w as DebugSession,Re as ThreadStatusScheduler};
