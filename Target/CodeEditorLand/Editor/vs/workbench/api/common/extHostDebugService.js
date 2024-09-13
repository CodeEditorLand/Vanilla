var H=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var _=(g,n,e,i)=>{for(var t=i>1?void 0:i?U(n,e):n,o=g.length-1,r;o>=0;o--)(r=g[o])&&(t=(i?r(n,e,t):r(t))||t);return i&&t&&H(n,e,t),t},d=(g,n)=>(e,i)=>n(e,i,g);import{coalesce as W}from"../../../base/common/arrays.js";import{asPromise as f}from"../../../base/common/async.js";import{Emitter as v}from"../../../base/common/event.js";import{Disposable as N,toDisposable as I}from"../../../base/common/lifecycle.js";import{ThemeIcon as j}from"../../../base/common/themables.js";import{URI as b}from"../../../base/common/uri.js";import{ExtensionIdentifier as C}from"../../../platform/extensions/common/extensions.js";import{createDecorator as q}from"../../../platform/instantiation/common/instantiation.js";import{AbstractDebugAdapter as O}from"../../contrib/debug/common/abstractDebugAdapter.js";import{DebugVisualizationType as k}from"../../contrib/debug/common/debug.js";import{convertToDAPaths as K,convertToVSCPaths as L,isDebuggerMainContribution as G}from"../../contrib/debug/common/debugUtils.js";import{MainContext as J}from"./extHost.protocol.js";import{IExtHostCommands as E}from"./extHostCommands.js";import{IExtHostConfiguration as P}from"./extHostConfiguration.js";import{IExtHostEditorTabs as T}from"./extHostEditorTabs.js";import{IExtHostExtensionService as x}from"./extHostExtensionService.js";import{IExtHostRpcService as w}from"./extHostRpcService.js";import{IExtHostTesting as z}from"./extHostTesting.js";import*as Q from"./extHostTypeConverters.js";import{DataBreakpoint as A,DebugAdapterExecutable as X,DebugAdapterInlineImplementation as V,DebugAdapterNamedPipeServer as Y,DebugAdapterServer as F,DebugConsoleMode as Z,DebugStackFrame as ee,DebugThread as ie,Disposable as D,FunctionBreakpoint as m,Location as M,Position as B,SourceBreakpoint as S,ThemeIcon as te,setBreakpointId as re}from"./extHostTypes.js";import{IExtHostVariableResolverProvider as $}from"./extHostVariableResolverService.js";import{IExtHostWorkspace as R}from"./extHostWorkspace.js";const we=q("IExtHostDebugService");let h=class extends N{constructor(e,i,t,o,r,s,a,u){super();this._workspaceService=i;this._extensionService=t;this._configurationService=o;this._editorTabs=r;this._variableResolver=s;this._commands=a;this._testing=u;this._configProviderHandleCounter=0,this._configProviders=[],this._adapterFactoryHandleCounter=0,this._adapterFactories=[],this._trackerFactoryHandleCounter=0,this._trackerFactories=[],this._debugAdapters=new Map,this._debugAdaptersTrackers=new Map,this._onDidStartDebugSession=this._register(new v),this._onDidTerminateDebugSession=this._register(new v),this._onDidChangeActiveDebugSession=this._register(new v),this._onDidReceiveDebugSessionCustomEvent=this._register(new v),this._debugServiceProxy=e.getProxy(J.MainThreadDebugService),this._onDidChangeBreakpoints=this._register(new v),this._onDidChangeActiveStackItem=this._register(new v),this._activeDebugConsole=new se(this._debugServiceProxy),this._breakpoints=new Map,this._extensionService.getExtensionRegistry().then(c=>{this._register(c.onDidChange(p=>{this.registerAllDebugTypes(c)})),this.registerAllDebugTypes(c)})}_serviceBrand;_configProviderHandleCounter;_configProviders;_adapterFactoryHandleCounter;_adapterFactories;_trackerFactoryHandleCounter;_trackerFactories;_debugServiceProxy;_debugSessions=new Map;_onDidStartDebugSession;get onDidStartDebugSession(){return this._onDidStartDebugSession.event}_onDidTerminateDebugSession;get onDidTerminateDebugSession(){return this._onDidTerminateDebugSession.event}_onDidChangeActiveDebugSession;get onDidChangeActiveDebugSession(){return this._onDidChangeActiveDebugSession.event}_activeDebugSession;get activeDebugSession(){return this._activeDebugSession?.api}_onDidReceiveDebugSessionCustomEvent;get onDidReceiveDebugSessionCustomEvent(){return this._onDidReceiveDebugSessionCustomEvent.event}_activeDebugConsole;get activeDebugConsole(){return this._activeDebugConsole.value}_breakpoints;_onDidChangeBreakpoints;_activeStackItem;_onDidChangeActiveStackItem;_debugAdapters;_debugAdaptersTrackers;_debugVisualizationTreeItemIdsCounter=0;_debugVisualizationProviders=new Map;_debugVisualizationTrees=new Map;_debugVisualizationTreeItemIds=new WeakMap;_debugVisualizationElements=new Map;_signService;_visualizers=new Map;_visualizerIdCounter=0;async $getVisualizerTreeItem(e,i){const t=this.hydrateVisualizationContext(i);if(!t)return;const o=await this._debugVisualizationTrees.get(e)?.getTreeItem?.(t);return o?this.convertVisualizerTreeItem(e,o):void 0}registerDebugVisualizationTree(e,i,t){const o=C.toKey(e.identifier),r=this.extensionVisKey(o,i);if(this._debugVisualizationProviders.has(r))throw new Error(`A debug visualization provider with id '${i}' is already registered`);return this._debugVisualizationTrees.set(r,t),this._debugServiceProxy.$registerDebugVisualizerTree(r,!!t.editItem),I(()=>{this._debugServiceProxy.$unregisterDebugVisualizerTree(r),this._debugVisualizationTrees.delete(i)})}async $getVisualizerTreeItemChildren(e,i){const t=this._debugVisualizationElements.get(i)?.item;return t?(await this._debugVisualizationTrees.get(e)?.getChildren?.(t))?.map(r=>this.convertVisualizerTreeItem(e,r))||[]:[]}async $editVisualizerTreeItem(e,i){const t=this._debugVisualizationElements.get(e);if(!t)return;const o=await this._debugVisualizationTrees.get(t.provider)?.editItem?.(t.item,i);return this.convertVisualizerTreeItem(t.provider,o||t.item)}$disposeVisualizedTree(e){const i=this._debugVisualizationElements.get(e);if(!i)return;const t=[i.children];for(const o of t)if(o)for(const r of o)t.push(this._debugVisualizationElements.get(r)?.children),this._debugVisualizationElements.delete(r)}convertVisualizerTreeItem(e,i){let t=this._debugVisualizationTreeItemIds.get(i);return t||(t=this._debugVisualizationTreeItemIdsCounter++,this._debugVisualizationTreeItemIds.set(i,t),this._debugVisualizationElements.set(t,{provider:e,item:i})),Q.DebugTreeItem.from(i,t)}asDebugSourceUri(e,i){const t=e;if(typeof t.sourceReference=="number"&&t.sourceReference>0){let o=`debug:${encodeURIComponent(t.path||"")}`,r="?";return i&&(o+=`${r}session=${encodeURIComponent(i.id)}`,r="&"),o+=`${r}ref=${t.sourceReference}`,b.parse(o)}else{if(t.path)return b.file(t.path);throw new Error("cannot create uri from DAP 'source' object; properties 'path' and 'sourceReference' are both missing.")}}registerAllDebugTypes(e){const i=[];for(const t of e.getAllExtensionDescriptions())if(t.contributes){const o=t.contributes.debuggers;if(o&&o.length>0)for(const r of o)G(r)&&i.push(r.type)}this._debugServiceProxy.$registerDebugTypes(i)}get activeStackItem(){return this._activeStackItem}get onDidChangeActiveStackItem(){return this._onDidChangeActiveStackItem.event}get onDidChangeBreakpoints(){return this._onDidChangeBreakpoints.event}get breakpoints(){const e=[];return this._breakpoints.forEach(i=>e.push(i)),e}async $resolveDebugVisualizer(e,i){const t=this._visualizers.get(e);if(!t)throw new Error(`No debug visualizer found with id '${e}'`);let{v:o,provider:r,extensionId:s}=t;if(o.visualization||(o=await r.resolveDebugVisualization?.(o,i)||o,t.v=o),!o.visualization)throw new Error(`No visualization returned from resolveDebugVisualization in '${r}'`);return this.serializeVisualization(s,o.visualization)}async $executeDebugVisualizerCommand(e){const i=this._visualizers.get(e);if(!i)throw new Error(`No debug visualizer found with id '${e}'`);const t=i.v.visualization;t&&"command"in t&&this._commands.executeCommand(t.command,...t.arguments||[])}hydrateVisualizationContext(e){const i=this._debugSessions.get(e.sessionId);return i&&{session:i.api,variable:e.variable,containerId:e.containerId,frameId:e.frameId,threadId:e.threadId}}async $provideDebugVisualizers(e,i,t,o){const r=this.hydrateVisualizationContext(t),s=this.extensionVisKey(e,i),a=this._debugVisualizationProviders.get(s);if(!r||!a)return[];const u=await a.provideDebugVisualization(r,o);return u?u.map(c=>{const p=++this._visualizerIdCounter;this._visualizers.set(p,{v:c,provider:a,extensionId:e});const l=c.iconPath?this.getIconPathOrClass(c.iconPath):void 0;return{id:p,name:c.name,iconClass:l?.iconClass,iconPath:l?.iconPath,visualization:this.serializeVisualization(e,c.visualization)}}):[]}$disposeDebugVisualizers(e){for(const i of e)this._visualizers.delete(i)}registerDebugVisualizationProvider(e,i,t){if(!e.contributes?.debugVisualizers?.some(s=>s.id===i))throw new Error(`Extensions may only call registerDebugVisualizationProvider() for renderers they contribute (got ${i})`);const o=C.toKey(e.identifier),r=this.extensionVisKey(o,i);if(this._debugVisualizationProviders.has(r))throw new Error(`A debug visualization provider with id '${i}' is already registered`);return this._debugVisualizationProviders.set(r,t),this._debugServiceProxy.$registerDebugVisualizer(o,i),I(()=>{this._debugServiceProxy.$unregisterDebugVisualizer(o,i),this._debugVisualizationProviders.delete(i)})}addBreakpoints(e){const i=e.filter(r=>{const s=r.id;return this._breakpoints.has(s)?!1:(this._breakpoints.set(s,r),!0)});this.fireBreakpointChanges(i,[],[]);const t=[],o=new Map;for(const r of i)if(r instanceof S){let s=o.get(r.location.uri.toString());s||(s={type:"sourceMulti",uri:r.location.uri,lines:[]},o.set(r.location.uri.toString(),s),t.push(s)),s.lines.push({id:r.id,enabled:r.enabled,condition:r.condition,hitCondition:r.hitCondition,logMessage:r.logMessage,line:r.location.range.start.line,character:r.location.range.start.character,mode:r.mode})}else r instanceof m&&t.push({type:"function",id:r.id,enabled:r.enabled,hitCondition:r.hitCondition,logMessage:r.logMessage,condition:r.condition,functionName:r.functionName,mode:r.mode});return this._debugServiceProxy.$registerBreakpoints(t)}removeBreakpoints(e){const i=e.filter(s=>this._breakpoints.delete(s.id));this.fireBreakpointChanges([],i,[]);const t=i.filter(s=>s instanceof S).map(s=>s.id),o=i.filter(s=>s instanceof m).map(s=>s.id),r=i.filter(s=>s instanceof A).map(s=>s.id);return this._debugServiceProxy.$unregisterBreakpoints(t,o,r)}startDebugging(e,i,t){const o=t.testRun&&this._testing.getMetadataForRun(t.testRun);return this._debugServiceProxy.$startDebugging(e?e.uri:void 0,i,{parentSessionID:t.parentSession?t.parentSession.id:void 0,lifecycleManagedByParent:t.lifecycleManagedByParent,repl:t.consoleMode===Z.MergeWithParent?"mergeWithParent":"separate",noDebug:t.noDebug,compact:t.compact,suppressSaveBeforeStart:t.suppressSaveBeforeStart,testRun:o&&{runId:o.runId,taskId:o.taskId},suppressDebugStatusbar:t.suppressDebugStatusbar??t.debugUI?.simple,suppressDebugToolbar:t.suppressDebugToolbar??t.debugUI?.simple,suppressDebugView:t.suppressDebugView??t.debugUI?.simple})}stopDebugging(e){return this._debugServiceProxy.$stopDebugging(e?e.id:void 0)}registerDebugConfigurationProvider(e,i,t){if(!i)return new D(()=>{});const o=this._configProviderHandleCounter++;return this._configProviders.push({type:e,handle:o,provider:i}),this._debugServiceProxy.$registerDebugConfigurationProvider(e,t,!!i.provideDebugConfigurations,!!i.resolveDebugConfiguration,!!i.resolveDebugConfigurationWithSubstitutedVariables,o),new D(()=>{this._configProviders=this._configProviders.filter(r=>r.provider!==i),this._debugServiceProxy.$unregisterDebugConfigurationProvider(o)})}registerDebugAdapterDescriptorFactory(e,i,t){if(!t)return new D(()=>{});if(!this.definesDebugType(e,i))throw new Error(`a DebugAdapterDescriptorFactory can only be registered from the extension that defines the '${i}' debugger.`);if(this.getAdapterDescriptorFactoryByType(i))throw new Error("a DebugAdapterDescriptorFactory can only be registered once per a type.");const o=this._adapterFactoryHandleCounter++;return this._adapterFactories.push({type:i,handle:o,factory:t}),this._debugServiceProxy.$registerDebugAdapterDescriptorFactory(i,o),new D(()=>{this._adapterFactories=this._adapterFactories.filter(r=>r.factory!==t),this._debugServiceProxy.$unregisterDebugAdapterDescriptorFactory(o)})}registerDebugAdapterTrackerFactory(e,i){if(!i)return new D(()=>{});const t=this._trackerFactoryHandleCounter++;return this._trackerFactories.push({type:e,handle:t,factory:i}),new D(()=>{this._trackerFactories=this._trackerFactories.filter(o=>o.factory!==i)})}async $runInTerminal(e,i){return Promise.resolve(void 0)}async $substituteVariables(e,i){let t;const o=await this.getFolder(e);return o&&(t={uri:o.uri,name:o.name,index:o.index,toResource:()=>{throw new Error("Not implemented")}}),(await this._variableResolver.getResolver()).resolveAnyAsync(t,i)}createDebugAdapter(e,i){if(e instanceof V)return new ae(e.implementation)}createSignService(){}async $startDASession(e,i){const t=await this.getSession(i);return this.getAdapterDescriptor(this.getAdapterDescriptorFactoryByType(t.type),t).then(o=>{if(!o)throw new Error(`Couldn't find a debug adapter descriptor for debug type '${t.type}' (extension might have failed to activate)`);const r=this.createDebugAdapter(o,t);if(!r)throw new Error(`Couldn't create a debug adapter for type '${t.type}'.`);const s=r;return this._debugAdapters.set(e,s),this.getDebugAdapterTrackers(t).then(a=>(a&&this._debugAdaptersTrackers.set(e,a),s.onMessage(async u=>{if(u.type==="request"&&u.command==="handshake"){const c=u,p={type:"response",seq:0,command:c.command,request_seq:c.seq,success:!0};this._signService||(this._signService=this.createSignService());try{if(this._signService){const l=await this._signService.sign(c.arguments.value);p.body={signature:l},s.sendResponse(p)}else throw new Error("no signer")}catch(l){p.success=!1,p.message=l.message,s.sendResponse(p)}}else a&&a.onDidSendMessage&&a.onDidSendMessage(u),u=L(u,!0),this._debugServiceProxy.$acceptDAMessage(e,u)}),s.onError(u=>{a&&a.onError&&a.onError(u),this._debugServiceProxy.$acceptDAError(e,u.name,u.message,u.stack)}),s.onExit(u=>{a&&a.onExit&&a.onExit(u??void 0,void 0),this._debugServiceProxy.$acceptDAExit(e,u??void 0,void 0)}),a&&a.onWillStartSession&&a.onWillStartSession(),s.startSession()))})}$sendDAMessage(e,i){i=K(i,!1);const t=this._debugAdaptersTrackers.get(e);t&&t.onWillReceiveMessage&&t.onWillReceiveMessage(i),this._debugAdapters.get(e)?.sendMessage(i)}$stopDASession(e){const i=this._debugAdaptersTrackers.get(e);this._debugAdaptersTrackers.delete(e),i&&i.onWillStopSession&&i.onWillStopSession();const t=this._debugAdapters.get(e);return this._debugAdapters.delete(e),t?t.stopSession():Promise.resolve(void 0)}$acceptBreakpointsDelta(e){const i=[],t=[],o=[];if(e.added)for(const r of e.added){const s=r.id;if(s&&!this._breakpoints.has(s)){let a;if(r.type==="function")a=new m(r.functionName,r.enabled,r.condition,r.hitCondition,r.logMessage,r.mode);else if(r.type==="data")a=new A(r.label,r.dataId,r.canPersist,r.enabled,r.hitCondition,r.condition,r.logMessage,r.mode);else{const u=b.revive(r.uri);a=new S(new M(u,new B(r.line,r.character)),r.enabled,r.condition,r.hitCondition,r.logMessage,r.mode)}re(a,s),this._breakpoints.set(s,a),i.push(a)}}if(e.removed)for(const r of e.removed){const s=this._breakpoints.get(r);s&&(this._breakpoints.delete(r),t.push(s))}if(e.changed){for(const r of e.changed)if(r.id){const s=this._breakpoints.get(r.id);if(s){if(s instanceof m&&r.type==="function"){const a=s;a.enabled=r.enabled,a.condition=r.condition,a.hitCondition=r.hitCondition,a.logMessage=r.logMessage,a.functionName=r.functionName}else if(s instanceof S&&r.type==="source"){const a=s;a.enabled=r.enabled,a.condition=r.condition,a.hitCondition=r.hitCondition,a.logMessage=r.logMessage,a.location=new M(b.revive(r.uri),new B(r.line,r.character))}o.push(s)}}}this.fireBreakpointChanges(i,t,o)}async $acceptStackFrameFocus(e){let i;if(e){const t=await this.getSession(e.sessionId);e.kind==="thread"?i=new ie(t.api,e.threadId):i=new ee(t.api,e.threadId,e.frameId)}this._activeStackItem=i,this._onDidChangeActiveStackItem.fire(this._activeStackItem)}$provideDebugConfigurations(e,i,t){return f(async()=>{const o=this.getConfigProviderByHandle(e);if(!o)throw new Error("no DebugConfigurationProvider found");if(!o.provideDebugConfigurations)throw new Error("DebugConfigurationProvider has no method provideDebugConfigurations");const r=await this.getFolder(i);return o.provideDebugConfigurations(r,t)}).then(o=>{if(!o)throw new Error("nothing returned from DebugConfigurationProvider.provideDebugConfigurations");return o})}$resolveDebugConfiguration(e,i,t,o){return f(async()=>{const r=this.getConfigProviderByHandle(e);if(!r)throw new Error("no DebugConfigurationProvider found");if(!r.resolveDebugConfiguration)throw new Error("DebugConfigurationProvider has no method resolveDebugConfiguration");const s=await this.getFolder(i);return r.resolveDebugConfiguration(s,t,o)})}$resolveDebugConfigurationWithSubstitutedVariables(e,i,t,o){return f(async()=>{const r=this.getConfigProviderByHandle(e);if(!r)throw new Error("no DebugConfigurationProvider found");if(!r.resolveDebugConfigurationWithSubstitutedVariables)throw new Error("DebugConfigurationProvider has no method resolveDebugConfigurationWithSubstitutedVariables");const s=await this.getFolder(i);return r.resolveDebugConfigurationWithSubstitutedVariables(s,t,o)})}async $provideDebugAdapter(e,i){const t=this.getAdapterDescriptorFactoryByHandle(e);if(!t)return Promise.reject(new Error("no adapter descriptor factory found for handle"));const o=await this.getSession(i);return this.getAdapterDescriptor(t,o).then(r=>{if(!r)throw new Error(`Couldn't find a debug adapter descriptor for debug type '${o.type}'`);return this.convertToDto(r)})}async $acceptDebugSessionStarted(e){const i=await this.getSession(e);this._onDidStartDebugSession.fire(i.api)}async $acceptDebugSessionTerminated(e){const i=await this.getSession(e);i&&(this._onDidTerminateDebugSession.fire(i.api),this._debugSessions.delete(i.id))}async $acceptDebugSessionActiveChanged(e){this._activeDebugSession=e?await this.getSession(e):void 0,this._onDidChangeActiveDebugSession.fire(this._activeDebugSession?.api)}async $acceptDebugSessionNameChanged(e,i){(await this.getSession(e))?._acceptNameChanged(i)}async $acceptDebugSessionCustomEvent(e,i){const o={session:(await this.getSession(e)).api,event:i.event,body:i.body};this._onDidReceiveDebugSessionCustomEvent.fire(o)}convertToDto(e){if(e instanceof X)return this.convertExecutableToDto(e);if(e instanceof F)return this.convertServerToDto(e);if(e instanceof Y)return this.convertPipeServerToDto(e);if(e instanceof V)return this.convertImplementationToDto(e);throw new Error("convertToDto unexpected type")}convertExecutableToDto(e){return{type:"executable",command:e.command,args:e.args,options:e.options}}convertServerToDto(e){return{type:"server",port:e.port,host:e.host}}convertPipeServerToDto(e){return{type:"pipeServer",path:e.path}}convertImplementationToDto(e){return{type:"implementation"}}getAdapterDescriptorFactoryByType(e){const i=this._adapterFactories.filter(t=>t.type===e);if(i.length>0)return i[0].factory}getAdapterDescriptorFactoryByHandle(e){const i=this._adapterFactories.filter(t=>t.handle===e);if(i.length>0)return i[0].factory}getConfigProviderByHandle(e){const i=this._configProviders.filter(t=>t.handle===e);if(i.length>0)return i[0].provider}definesDebugType(e,i){if(e.contributes){const t=e.contributes.debuggers;if(t&&t.length>0){for(const o of t)if(o.label&&o.type&&o.type===i)return!0}}return!1}getDebugAdapterTrackers(e){const t=e.configuration.type,o=this._trackerFactories.filter(r=>r.type===t||r.type==="*").map(r=>f(()=>r.factory.createDebugAdapterTracker(e.api)).then(s=>s,s=>null));return Promise.race([Promise.all(o).then(r=>{const s=W(r);if(s.length>0)return new ne(s)}),new Promise(r=>setTimeout(()=>r(void 0),1e3))]).catch(r=>{})}async getAdapterDescriptor(e,i){const t=i.configuration.debugServer;if(typeof t=="number")return Promise.resolve(new F(t));if(e){const r=await this._extensionService.getExtensionRegistry();return f(()=>e.createDebugAdapterDescriptor(i.api,this.daExecutableFromPackage(i,r))).then(s=>{if(s)return s})}const o=await this._extensionService.getExtensionRegistry();return Promise.resolve(this.daExecutableFromPackage(i,o))}daExecutableFromPackage(e,i){}fireBreakpointChanges(e,i,t){(e.length>0||i.length>0||t.length>0)&&this._onDidChangeBreakpoints.fire(Object.freeze({added:e,removed:i,changed:t}))}async getSession(e){if(e)if(typeof e=="string"){const i=this._debugSessions.get(e);if(i)return i}else{let i=this._debugSessions.get(e.id);if(!i){const t=await this.getFolder(e.folderUri),o=e.parent?this._debugSessions.get(e.parent):void 0;i=new oe(this._debugServiceProxy,e.id,e.type,e.name,t,e.configuration,o?.api),this._debugSessions.set(i.id,i),this._debugServiceProxy.$sessionCached(i.id)}return i}throw new Error("cannot find session")}getFolder(e){if(e){const i=b.revive(e);return this._workspaceService.resolveWorkspaceFolder(i)}return Promise.resolve(void 0)}extensionVisKey(e,i){return`${e}\0${i}`}serializeVisualization(e,i){if(i){if("title"in i&&"command"in i)return{type:k.Command};if("treeId"in i)return{type:k.Tree,id:`${e}\0${i.treeId}`};throw new Error("Unsupported debug visualization type")}}getIconPathOrClass(e){const i=this.getIconUris(e);let t,o;return"id"in i?o=j.asClassName(i):t=i,{iconPath:t,iconClass:o}}getIconUris(e){if(e instanceof te)return{id:e.id};const i=typeof e=="object"&&"dark"in e?e.dark:e,t=typeof e=="object"&&"light"in e?e.light:e;return{dark:typeof i=="string"?b.file(i):i,light:typeof t=="string"?b.file(t):t}}};h=_([d(0,w),d(1,R),d(2,x),d(3,P),d(4,T),d(5,$),d(6,E),d(7,z)],h);class oe{constructor(n,e,i,t,o,r,s){this._debugServiceProxy=n;this._id=e;this._type=i;this._name=t;this._workspaceFolder=o;this._configuration=r;this._parentSession=s}apiSession;get api(){const n=this;return this.apiSession??=Object.freeze({id:n._id,type:n._type,get name(){return n._name},set name(e){n._name=e,n._debugServiceProxy.$setDebugSessionName(n._id,e)},parentSession:n._parentSession,workspaceFolder:n._workspaceFolder,configuration:n._configuration,customRequest(e,i){return n._debugServiceProxy.$customDebugAdapterRequest(n._id,e,i)},getDebugProtocolBreakpoint(e){return n._debugServiceProxy.$getDebugProtocolBreakpoint(n._id,e.id)}})}get id(){return this._id}get type(){return this._type}_acceptNameChanged(n){this._name=n}get configuration(){return this._configuration}}class se{value;constructor(n){this.value=Object.freeze({append(e){n.$appendDebugConsole(e)},appendLine(e){this.append(e+`
`)}})}}class ne{constructor(n){this.trackers=n}onWillStartSession(){this.trackers.forEach(n=>n.onWillStartSession?n.onWillStartSession():void 0)}onWillReceiveMessage(n){this.trackers.forEach(e=>e.onWillReceiveMessage?e.onWillReceiveMessage(n):void 0)}onDidSendMessage(n){this.trackers.forEach(e=>e.onDidSendMessage?e.onDidSendMessage(n):void 0)}onWillStopSession(){this.trackers.forEach(n=>n.onWillStopSession?n.onWillStopSession():void 0)}onError(n){this.trackers.forEach(e=>e.onError?e.onError(n):void 0)}onExit(n,e){this.trackers.forEach(i=>i.onExit?i.onExit(n,e):void 0)}}class ae extends O{constructor(e){super();this.implementation=e;e.onDidSendMessage(i=>{this.acceptMessage(i)})}startSession(){return Promise.resolve(void 0)}sendMessage(e){this.implementation.handleMessage(e)}stopSession(){return this.implementation.dispose(),Promise.resolve(void 0)}}let y=class extends h{constructor(n,e,i,t,o,r,s,a){super(n,e,i,t,o,r,s,a)}};y=_([d(0,w),d(1,R),d(2,x),d(3,P),d(4,T),d(5,$),d(6,E),d(7,z)],y);export{se as ExtHostDebugConsole,h as ExtHostDebugServiceBase,oe as ExtHostDebugSession,we as IExtHostDebugService,y as WorkerExtHostDebugService};
