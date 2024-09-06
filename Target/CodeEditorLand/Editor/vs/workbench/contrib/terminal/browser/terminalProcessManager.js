var U=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var S=(v,l,e,t)=>{for(var i=t>1?void 0:t?M(l,e):l,n=v.length-1,s;n>=0;n--)(s=v[n])&&(i=(t?s(l,e,i):s(i))||i);return t&&i&&U(l,e,i),i},o=(v,l)=>(e,t)=>l(e,t,v);import{getActiveWindow as z,runWhenWindowIdle as N}from"../../../../base/browser/dom.js";import{mainWindow as T}from"../../../../base/browser/window.js";import{Emitter as c,Event as $}from"../../../../base/common/event.js";import{Disposable as V,dispose as O,toDisposable as K}from"../../../../base/common/lifecycle.js";import{Schemas as j}from"../../../../base/common/network.js";import{isMacintosh as Q,isWindows as q,OperatingSystem as k,OS as C}from"../../../../base/common/platform.js";import G from"../../../../base/common/severity.js";import"../../../../base/common/uri.js";import{generateUuid as J}from"../../../../base/common/uuid.js";import{localize as x}from"../../../../nls.js";import{IConfigurationService as X}from"../../../../platform/configuration/common/configuration.js";import{IInstantiationService as Y}from"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as Z}from"../../../../platform/notification/common/notification.js";import{IProductService as ee}from"../../../../platform/product/common/productService.js";import{getRemoteAuthority as te}from"../../../../platform/remote/common/remoteHosts.js";import{ITelemetryService as ie}from"../../../../platform/telemetry/common/telemetry.js";import{TerminalCapability as re}from"../../../../platform/terminal/common/capabilities/capabilities.js";import{NaiveCwdDetectionCapability as se}from"../../../../platform/terminal/common/capabilities/naiveCwdDetectionCapability.js";import{TerminalCapabilityStore as ne}from"../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";import"../../../../platform/terminal/common/environmentVariable.js";import{MergedEnvironmentVariableCollection as oe}from"../../../../platform/terminal/common/environmentVariableCollection.js";import{serializeEnvironmentVariableCollections as A}from"../../../../platform/terminal/common/environmentVariableShared.js";import{FlowControlConstants as w,ITerminalLogService as L,ProcessPropertyType as E,TerminalSettingId as F}from"../../../../platform/terminal/common/terminal.js";import{shouldUseEnvironmentVariableCollection as ae}from"../../../../platform/terminal/common/terminalEnvironment.js";import{TerminalRecorder as ce}from"../../../../platform/terminal/common/terminalRecorder.js";import{formatMessageForTerminal as le}from"../../../../platform/terminal/common/terminalStrings.js";import{IWorkspaceContextService as he}from"../../../../platform/workspace/common/workspace.js";import{IConfigurationResolverService as de}from"../../../services/configurationResolver/common/configurationResolver.js";import{IWorkbenchEnvironmentService as me}from"../../../services/environment/common/environmentService.js";import{IHistoryService as pe}from"../../../services/history/common/history.js";import{IPathService as ve}from"../../../services/path/common/pathService.js";import{IRemoteAgentService as _e}from"../../../services/remote/common/remoteAgentService.js";import{TaskSettingId as W}from"../../tasks/common/tasks.js";import{TerminalSuggestSettingId as B}from"../../terminalContrib/suggest/common/terminalSuggestConfiguration.js";import{IEnvironmentVariableService as fe}from"../common/environmentVariable.js";import{ITerminalProfileResolverService as ue,ProcessState as m}from"../common/terminal.js";import*as P from"../common/terminalEnvironment.js";import{EnvironmentVariableInfoChangesActive as D,EnvironmentVariableInfoStale as H}from"./environmentVariableInfo.js";import{ITerminalConfigurationService as Pe,ITerminalInstanceService as ye}from"./terminal.js";var ge=(e=>(e[e.ErrorLaunchThresholdDuration=500]="ErrorLaunchThresholdDuration",e[e.LatencyMeasuringInterval=1e3]="LatencyMeasuringInterval",e))(ge||{}),Ie=(e=>(e[e.Process=0]="Process",e[e.PsuedoTerminal=1]="PsuedoTerminal",e))(Ie||{});let I=class extends V{constructor(e,t,i,n,s,p,r,a,d,_,g,R,f,b,Ce,we,Ee,De,Re,Te){super();this._instanceId=e;this._historyService=s;this._instantiationService=p;this._logService=r;this._workspaceContextService=a;this._configurationResolverService=d;this._workbenchEnvironmentService=_;this._productService=g;this._remoteAgentService=R;this._pathService=f;this._environmentVariableService=b;this._terminalConfigurationService=Ce;this._terminalProfileResolverService=we;this._configurationService=Ee;this._terminalInstanceService=De;this._telemetryService=Re;this._notificationService=Te;this._cwdWorkspaceFolder=P.getWorkspaceForTerminal(t,this._workspaceContextService,this._historyService),this.ptyProcessReady=this._createPtyProcessReadyPromise(),this._ackDataBufferer=new be(h=>this._process?.acknowledgeDataEvent(h)),this._dataFilter=this._register(this._instantiationService.createInstance(y)),this._register(this._dataFilter.onProcessData(h=>{const u={data:typeof h=="string"?h:h.data};this._onBeforeProcessData.fire(u),u.data&&u.data.length>0&&(typeof h!="string"&&(h.data=u.data),this._onProcessData.fire(typeof h!="string"?h:{data:u.data,trackCommit:!1}))})),t&&typeof t=="object"?this.remoteAuthority=te(t):this.remoteAuthority=this._workbenchEnvironmentService.remoteAuthority,i&&(this._extEnvironmentVariableCollection=new oe(i),this._register(this._environmentVariableService.onDidChangeCollections(h=>this._onEnvironmentVariableCollectionChange(h))),this.environmentVariableInfo=this._instantiationService.createInstance(D,this._extEnvironmentVariableCollection),this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo)),this.shellIntegrationNonce=n??J()}processState=m.Uninitialized;ptyProcessReady;shellProcessId;remoteAuthority;os;userHome;environmentVariableInfo;backend;capabilities=this._register(new ne);shellIntegrationNonce;_isDisposed=!1;_process=null;_processType=0;_preLaunchInputQueue=[];_initialCwd;_extEnvironmentVariableCollection;_ackDataBufferer;_hasWrittenData=!1;_hasChildProcesses=!1;_ptyResponsiveListener;_ptyListenersAttached=!1;_dataFilter;_processListeners;_isDisconnected=!1;_shellLaunchConfig;_dimensions={cols:0,rows:0};_onPtyDisconnect=this._register(new c);onPtyDisconnect=this._onPtyDisconnect.event;_onPtyReconnect=this._register(new c);onPtyReconnect=this._onPtyReconnect.event;_onProcessReady=this._register(new c);onProcessReady=this._onProcessReady.event;_onProcessStateChange=this._register(new c);onProcessStateChange=this._onProcessStateChange.event;_onBeforeProcessData=this._register(new c);onBeforeProcessData=this._onBeforeProcessData.event;_onProcessData=this._register(new c);onProcessData=this._onProcessData.event;_onProcessReplayComplete=this._register(new c);onProcessReplayComplete=this._onProcessReplayComplete.event;_onDidChangeProperty=this._register(new c);onDidChangeProperty=this._onDidChangeProperty.event;_onEnvironmentVariableInfoChange=this._register(new c);onEnvironmentVariableInfoChanged=this._onEnvironmentVariableInfoChange.event;_onProcessExit=this._register(new c);onProcessExit=this._onProcessExit.event;_onRestoreCommands=this._register(new c);onRestoreCommands=this._onRestoreCommands.event;_cwdWorkspaceFolder;get persistentProcessId(){return this._process?.id}get shouldPersist(){return!!this.reconnectionProperties||(this._process?this._process.shouldPersist:!1)}get hasWrittenData(){return this._hasWrittenData}get hasChildProcesses(){return this._hasChildProcesses}get reconnectionProperties(){return this._shellLaunchConfig?.attachPersistentProcess?.reconnectionProperties||this._shellLaunchConfig?.reconnectionProperties||void 0}get extEnvironmentVariableCollection(){return this._extEnvironmentVariableCollection}async freePortKillProcess(e){try{this._process?.freePortKillProcess&&await this._process?.freePortKillProcess(e)}catch(t){this._notificationService.notify({message:x("killportfailure","Could not kill process listening on port {0}, command exited with error {1}",e,t),severity:G.Warning})}}dispose(e=!1){this._isDisposed=!0,this._process&&(this._setProcessState(m.KilledByUser),this._process.shutdown(e),this._process=null),super.dispose()}_createPtyProcessReadyPromise(){return new Promise(e=>{const t=$.once(this.onProcessReady)(()=>{this._logService.debug(`Terminal process ready (shellProcessId: ${this.shellProcessId})`),this._store.delete(t),e(void 0)});this._store.add(t)})}async detachFromProcess(e){await this._process?.detach?.(e),this._process=null}async createProcess(e,t,i,n=!0){this._shellLaunchConfig=e,this._dimensions.cols=t,this._dimensions.rows=i;let s;if(e.customPtyImplementation)this._processType=1,s=e.customPtyImplementation(this._instanceId,t,i);else{const r=await this._terminalInstanceService.getBackend(this.remoteAuthority);if(!r)throw new Error(`No terminal backend registered for remote authority '${this.remoteAuthority}'`);this.backend=r;const a=P.createVariableResolver(this._cwdWorkspaceFolder,await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority),this._configurationResolverService);if(this.userHome=this._pathService.resolvedUserHome?.fsPath,this.os=C,this.remoteAuthority){const d=await this._pathService.userHome();this.userHome=d.path;const _=await this._remoteAgentService.getEnvironment();if(!_)throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);this.userHome=_.userHome.path,this.os=_.os;const g=await this._resolveEnvironment(r,a,e),R=(this._configurationService.getValue(W.Reconnection)&&e.reconnectionProperties||!e.isFeatureTerminal)&&this._terminalConfigurationService.config.enablePersistentSessions&&!e.isTransient;if(e.attachPersistentProcess){const f=await r.attachToProcess(e.attachPersistentProcess.id);f?s=f:(this._logService.warn("Attach to process failed for terminal",e.attachPersistentProcess),e.attachPersistentProcess=void 0)}if(!s){await this._terminalProfileResolverService.resolveShellLaunchConfig(e,{remoteAuthority:this.remoteAuthority,os:this.os});const f={shellIntegration:{enabled:this._configurationService.getValue(F.ShellIntegrationEnabled),suggestEnabled:this._configurationService.getValue(B.Enabled),nonce:this.shellIntegrationNonce},windowsEnableConpty:this._terminalConfigurationService.config.windowsEnableConpty,windowsUseConptyDll:this._terminalConfigurationService.config.experimental?.windowsUseConptyDll??!1,environmentVariableCollections:this._extEnvironmentVariableCollection?.collections?A(this._extEnvironmentVariableCollection.collections):void 0,workspaceFolder:this._cwdWorkspaceFolder};try{s=await r.createProcess(e,"",t,i,this._terminalConfigurationService.config.unicodeVersion,g,f,R)}catch(b){if(b?.message==="Could not fetch remote environment"){this._logService.trace("Could not fetch remote environment, silently failing");return}throw b}}this._isDisposed||this._setupPtyHostListeners(r)}else{if(e.attachPersistentProcess){const d=e.attachPersistentProcess.findRevivedId?await r.attachToRevivedProcess(e.attachPersistentProcess.id):await r.attachToProcess(e.attachPersistentProcess.id);d?s=d:(this._logService.warn("Attach to process failed for terminal",e.attachPersistentProcess),e.attachPersistentProcess=void 0)}s||(s=await this._launchLocalProcess(r,e,t,i,this.userHome,a)),this._isDisposed||this._setupPtyHostListeners(r)}}if(this._isDisposed){s.shutdown(!1);return}this._process=s,this._setProcessState(m.Launching),(this.os===k.Linux||this.os===k.Macintosh)&&this.capabilities.add(re.NaiveCwdDetection,new se(this._process)),this._dataFilter.newProcess(this._process,n),this._processListeners&&O(this._processListeners),this._processListeners=[s.onProcessReady(r=>{this.shellProcessId=r.pid,this._initialCwd=r.cwd,this._onDidChangeProperty.fire({type:E.InitialCwd,value:this._initialCwd}),this._onProcessReady.fire(r),this._preLaunchInputQueue.length>0&&this._process&&(s.input(this._preLaunchInputQueue.join("")),this._preLaunchInputQueue.length=0)}),s.onProcessExit(r=>this._onExit(r)),s.onDidChangeProperty(({type:r,value:a})=>{switch(r){case E.HasChildProcesses:this._hasChildProcesses=a;break;case E.FailedShellIntegrationActivation:this._telemetryService?.publicLog2("terminal/shellIntegrationActivationFailureCustomArgs");break}this._onDidChangeProperty.fire({type:r,value:a})})],s.onProcessReplayComplete&&this._processListeners.push(s.onProcessReplayComplete(()=>this._onProcessReplayComplete.fire())),s.onRestoreCommands&&this._processListeners.push(s.onRestoreCommands(r=>this._onRestoreCommands.fire(r))),setTimeout(()=>{this.processState===m.Launching&&this._setProcessState(m.Running)},500);const p=await s.start();if(p)return p;N(z(),()=>{this.backend?.getLatency().then(r=>{this._logService.info(`Latency measurements for ${this.remoteAuthority??"local"} backend
${r.map(a=>`${a.label}: ${a.latency.toFixed(2)}ms`).join(`
`)}`)})})}async relaunch(e,t,i,n){return this.ptyProcessReady=this._createPtyProcessReadyPromise(),this._logService.trace(`Relaunching terminal instance ${this._instanceId}`),this._isDisconnected&&(this._isDisconnected=!1,this._onPtyReconnect.fire()),this._hasWrittenData=!1,this.createProcess(e,t,i,n)}async _resolveEnvironment(e,t,i){const n=P.getWorkspaceForTerminal(i.cwd,this._workspaceContextService,this._historyService),s=q?"windows":Q?"osx":"linux",p=this._configurationService.getValue(`terminal.integrated.env.${s}`);let r;i.useShellEnvironment?r=await e.getShellEnvironment():r=await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority);const a=await P.createTerminalEnvironment(i,p,t,this._productService.version,this._terminalConfigurationService.config.detectLocale,r);return!this._isDisposed&&ae(i)&&(this._extEnvironmentVariableCollection=this._environmentVariableService.mergedCollection,this._register(this._environmentVariableService.onDidChangeCollections(d=>this._onEnvironmentVariableCollectionChange(d))),await this._extEnvironmentVariableCollection.applyToProcessEnvironment(a,{workspaceFolder:n},t),this._extEnvironmentVariableCollection.getVariableMap({workspaceFolder:n}).size&&(this.environmentVariableInfo=this._instantiationService.createInstance(D,this._extEnvironmentVariableCollection),this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo))),a}async _launchLocalProcess(e,t,i,n,s,p){await this._terminalProfileResolverService.resolveShellLaunchConfig(t,{remoteAuthority:void 0,os:C});const r=this._historyService.getLastActiveWorkspaceRoot(j.file),a=await P.getCwd(t,s,p,r,this._terminalConfigurationService.config.cwd,this._logService),d=await this._resolveEnvironment(e,p,t),_={shellIntegration:{enabled:this._configurationService.getValue(F.ShellIntegrationEnabled),suggestEnabled:this._configurationService.getValue(B.Enabled),nonce:this.shellIntegrationNonce},windowsEnableConpty:this._terminalConfigurationService.config.windowsEnableConpty,windowsUseConptyDll:this._terminalConfigurationService.config.experimental?.windowsUseConptyDll??!1,environmentVariableCollections:this._extEnvironmentVariableCollection?A(this._extEnvironmentVariableCollection.collections):void 0,workspaceFolder:this._cwdWorkspaceFolder},g=(this._configurationService.getValue(W.Reconnection)&&t.reconnectionProperties||!t.isFeatureTerminal)&&this._terminalConfigurationService.config.enablePersistentSessions&&!t.isTransient;return await e.createProcess(t,a,i,n,this._terminalConfigurationService.config.unicodeVersion,d,_,g)}_setupPtyHostListeners(e){this._ptyListenersAttached||(this._ptyListenersAttached=!0,this._register(e.onPtyHostUnresponsive(()=>{this._isDisconnected=!0,this._onPtyDisconnect.fire()})),this._ptyResponsiveListener=e.onPtyHostResponsive(()=>{this._isDisconnected=!1,this._onPtyReconnect.fire()}),this._register(K(()=>this._ptyResponsiveListener?.dispose())),this._register(e.onPtyHostRestart(async()=>{if(this._isDisconnected||(this._isDisconnected=!0,this._onPtyDisconnect.fire()),this._ptyResponsiveListener?.dispose(),this._ptyResponsiveListener=void 0,this._shellLaunchConfig)if(this._shellLaunchConfig.isFeatureTerminal&&!this.reconnectionProperties)this._onExit(-1);else{const t=x("ptyHostRelaunch","Restarting the terminal because the connection to the shell process was lost...");this._onProcessData.fire({data:le(t,{loudFormatting:!0}),trackCommit:!1}),await this.relaunch(this._shellLaunchConfig,this._dimensions.cols,this._dimensions.rows,!1)}})))}async getBackendOS(){let e=C;if(this.remoteAuthority){const t=await this._remoteAgentService.getEnvironment();if(!t)throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);e=t.os}return e}setDimensions(e,t,i){if(i){this._resize(e,t);return}return this.ptyProcessReady.then(()=>this._resize(e,t))}async setUnicodeVersion(e){return this._process?.setUnicodeVersion(e)}_resize(e,t){if(this._process){try{this._process.resize(e,t)}catch(i){if(i.code!=="EPIPE"&&i.code!=="ERR_IPC_CHANNEL_CLOSED")throw i}this._dimensions.cols=e,this._dimensions.rows=t}}async write(e){await this.ptyProcessReady,this._dataFilter.disableSeamlessRelaunch(),this._hasWrittenData=!0,this.shellProcessId||this._processType===1?this._process&&this._process.input(e):this._preLaunchInputQueue.push(e)}async processBinary(e){await this.ptyProcessReady,this._dataFilter.disableSeamlessRelaunch(),this._hasWrittenData=!0,this._process?.processBinary(e)}get initialCwd(){return this._initialCwd??""}async refreshProperty(e){if(!this._process)throw new Error("Cannot refresh property when process is not set");return this._process.refreshProperty(e)}async updateProperty(e,t){return this._process?.updateProperty(e,t)}acknowledgeDataEvent(e){this._ackDataBufferer.ack(e)}_onExit(e){this._process=null,this.processState===m.Launching&&this._setProcessState(m.KilledDuringLaunch),this.processState===m.Running&&this._setProcessState(m.KilledByProcess),this._onProcessExit.fire(e)}_setProcessState(e){this.processState=e,this._onProcessStateChange.fire()}_onEnvironmentVariableCollectionChange(e){const t=this._extEnvironmentVariableCollection.diff(e,{workspaceFolder:this._cwdWorkspaceFolder});if(t===void 0){this.environmentVariableInfo instanceof H&&(this.environmentVariableInfo=this._instantiationService.createInstance(D,this._extEnvironmentVariableCollection),this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo));return}this.environmentVariableInfo=this._instantiationService.createInstance(H,t,this._instanceId,e),this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo)}async clearBuffer(){this._process?.clearBuffer?.()}};I=S([o(4,pe),o(5,Y),o(6,L),o(7,he),o(8,de),o(9,me),o(10,ee),o(11,_e),o(12,ve),o(13,fe),o(14,Pe),o(15,ue),o(16,X),o(17,ye),o(18,ie),o(19,Z)],I);class be{constructor(l){this._callback=l}_unsentCharCount=0;ack(l){for(this._unsentCharCount+=l;this._unsentCharCount>w.CharCountAckSize;)this._unsentCharCount-=w.CharCountAckSize,this._callback(w.CharCountAckSize)}}var Se=(e=>(e[e.RecordTerminalDuration=1e4]="RecordTerminalDuration",e[e.SwapWaitMaximumDuration=3e3]="SwapWaitMaximumDuration",e))(Se||{});let y=class extends V{constructor(e){super();this._logService=e}_firstRecorder;_secondRecorder;_firstDisposable;_secondDisposable;_dataListener;_activeProcess;_disableSeamlessRelaunch=!1;_swapTimeout;_onProcessData=this._register(new c);get onProcessData(){return this._onProcessData.event}newProcess(e,t){if(this._dataListener?.dispose(),this._activeProcess?.shutdown(!1),this._activeProcess=e,!this._firstRecorder||!t||this._disableSeamlessRelaunch){this._firstDisposable?.dispose(),[this._firstRecorder,this._firstDisposable]=this._createRecorder(e),this._disableSeamlessRelaunch&&t&&this._onProcessData.fire("\x1Bc"),this._dataListener=e.onProcessData(n=>this._onProcessData.fire(n)),this._disableSeamlessRelaunch=!1;return}this._secondRecorder&&this.triggerSwap(),this._swapTimeout=T.setTimeout(()=>this.triggerSwap(),3e3),this._dataListener?.dispose(),this._firstDisposable?.dispose();const i=this._createRecorder(e);[this._secondRecorder,this._secondDisposable]=i}disableSeamlessRelaunch(){this._disableSeamlessRelaunch=!0,this._stopRecording(),this.triggerSwap()}triggerSwap(){if(this._swapTimeout&&(T.clearTimeout(this._swapTimeout),this._swapTimeout=void 0),!this._firstRecorder)return;if(!this._secondRecorder){this._firstRecorder=void 0,this._firstDisposable?.dispose();return}const e=this._getDataFromRecorder(this._firstRecorder),t=this._getDataFromRecorder(this._secondRecorder);e===t?this._logService.trace("Seamless terminal relaunch - identical content"):(this._logService.trace("Seamless terminal relaunch - resetting content"),this._onProcessData.fire({data:`\x1Bc${t}`,trackCommit:!1})),this._dataListener?.dispose(),this._dataListener=this._activeProcess.onProcessData(i=>this._onProcessData.fire(i)),this._firstRecorder=this._secondRecorder,this._firstDisposable?.dispose(),this._firstDisposable=this._secondDisposable,this._secondRecorder=void 0}_stopRecording(){this._swapTimeout||(this._firstRecorder=void 0,this._firstDisposable?.dispose(),this._secondRecorder=void 0,this._secondDisposable?.dispose())}_createRecorder(e){const t=new ce(0,0),i=e.onProcessData(n=>t.handleData(typeof n=="string"?n:n.data));return[t,i]}_getDataFromRecorder(e){return e.generateReplayEventSync().events.filter(t=>!!t.data).map(t=>t.data).join("")}};y=S([o(0,L)],y);export{I as TerminalProcessManager};
