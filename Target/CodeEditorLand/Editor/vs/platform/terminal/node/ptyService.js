var M=Object.defineProperty;var Q=Object.getOwnPropertyDescriptor;var n=(p,l,e,t)=>{for(var r=t>1?void 0:t?Q(l,e):l,s=p.length-1,i;s>=0;s--)(i=p[s])&&(r=(t?i(l,e,r):i(r))||r);return t&&r&&M(l,e,r),r};import{execFile as C,exec as U}from"child_process";import{AutoOpenBarrier as V,ProcessTimeRunOnceScheduler as z,Promises as q,Queue as F,timeout as H}from"../../../base/common/async.js";import{Emitter as h}from"../../../base/common/event.js";import{Disposable as $,toDisposable as B}from"../../../base/common/lifecycle.js";import{isWindows as b,OS as W}from"../../../base/common/platform.js";import{getSystemShell as G}from"../../../base/node/shell.js";import{LogLevel as S}from"../../log/common/log.js";import{RequestStore as X}from"../common/requestStore.js";import{TitleEventSource as I,ProcessPropertyType as D}from"../common/terminal.js";import{TerminalDataBufferer as j}from"../common/terminalDataBuffering.js";import{escapeNonWindowsPath as J}from"../common/terminalEnvironment.js";import{getWindowsBuildNumber as x}from"./terminalEnvironment.js";import{TerminalProcess as K}from"./terminalProcess.js";import{localize as Y}from"../../../nls.js";import{ignoreProcessNames as O}from"./childProcessMonitor.js";import{TerminalAutoResponder as Z}from"../common/terminalAutoResponder.js";import{ErrorNoTelemetry as ee}from"../../../base/common/errors.js";import{ShellIntegrationAddon as te}from"../common/xterm/shellIntegrationAddon.js";import{formatMessageForTerminal as re}from"../common/terminalStrings.js";import{join as se}from"path";import{memoize as ie}from"../../../base/common/decorators.js";import*as P from"../../../base/common/performance.js";import ne from"@xterm/headless";const{Terminal:oe}=ne;function a(p,l,e){if(typeof e.value!="function")throw new Error("not supported");const t="value",r=e.value;e[t]=async function(...s){this.traceRpcArgs.logService.getLevel()===S.Trace&&this.traceRpcArgs.logService.trace(`[RPC Request] PtyService#${r.name}(${s.map(c=>JSON.stringify(c)).join(", ")})`),this.traceRpcArgs.simulatedLatency&&await H(this.traceRpcArgs.simulatedLatency);let i;try{i=await r.apply(this,s)}catch(c){throw this.traceRpcArgs.logService.error(`[RPC Response] PtyService#${r.name}`,c),c}return this.traceRpcArgs.logService.getLevel()===S.Trace&&this.traceRpcArgs.logService.trace(`[RPC Response] PtyService#${r.name}`,i),i}}let E,L;class o extends ${constructor(e,t,r,s){super();this._logService=e;this._productService=t;this._reconnectConstants=r;this._simulatedLatency=s;this._register(B(()=>{for(const i of this._ptys.values())i.shutdown(!0);this._ptys.clear()})),this._detachInstanceRequestStore=this._register(new X(void 0,this._logService)),this._detachInstanceRequestStore.onCreateRequest(this._onDidRequestDetach.fire,this._onDidRequestDetach)}_ptys=new Map;_workspaceLayoutInfos=new Map;_detachInstanceRequestStore;_revivedPtyIdMap=new Map;_autoReplies=new Map;_lastPtyId=0;_onHeartbeat=this._register(new h);onHeartbeat=this._traceEvent("_onHeartbeat",this._onHeartbeat.event);_onProcessData=this._register(new h);onProcessData=this._traceEvent("_onProcessData",this._onProcessData.event);_onProcessReplay=this._register(new h);onProcessReplay=this._traceEvent("_onProcessReplay",this._onProcessReplay.event);_onProcessReady=this._register(new h);onProcessReady=this._traceEvent("_onProcessReady",this._onProcessReady.event);_onProcessExit=this._register(new h);onProcessExit=this._traceEvent("_onProcessExit",this._onProcessExit.event);_onProcessOrphanQuestion=this._register(new h);onProcessOrphanQuestion=this._traceEvent("_onProcessOrphanQuestion",this._onProcessOrphanQuestion.event);_onDidRequestDetach=this._register(new h);onDidRequestDetach=this._traceEvent("_onDidRequestDetach",this._onDidRequestDetach.event);_onDidChangeProperty=this._register(new h);onDidChangeProperty=this._traceEvent("_onDidChangeProperty",this._onDidChangeProperty.event);_traceEvent(e,t){return t(r=>{this._logService.getLevel()===S.Trace&&this._logService.trace(`[RPC Event] PtyService#${e}.fire(${JSON.stringify(r)})`)}),t}get traceRpcArgs(){return{logService:this._logService,simulatedLatency:this._simulatedLatency}}async refreshIgnoreProcessNames(e){O.length=0,O.push(...e)}async requestDetachInstance(e,t){return this._detachInstanceRequestStore.createRequest({workspaceId:e,instanceId:t})}async acceptDetachInstanceReply(e,t){let r;const s=this._ptys.get(t);s&&(r=await this._buildProcessDetails(t,s)),this._detachInstanceRequestStore.acceptReply(e,r)}async freePortKillProcess(e){const r=(await new Promise((s,i)=>{U(b?`netstat -ano | findstr "${e}"`:`lsof -nP -iTCP -sTCP:LISTEN | grep ${e}`,{},(c,u)=>{if(c)return i("Problem occurred when listing active processes");s(u)})})).split(/\r?\n/).filter(s=>!!s.trim());if(r.length>=1){const s=/\s+(\d+)(?:\s+|$)/,i=r[0].match(s)?.[1];if(i)try{process.kill(Number.parseInt(i))}catch{}else throw new Error(`Processes for port ${e} were not found`);return{port:e,processId:i}}throw new Error(`Could not kill process with port ${e}`)}async serializeTerminalState(e){const t=[];for(const[s,i]of this._ptys.entries())i.hasWrittenData&&e.indexOf(s)!==-1&&t.push(q.withAsyncBody(async c=>{c({id:s,shellLaunchConfig:i.shellLaunchConfig,processDetails:await this._buildProcessDetails(s,i),processLaunchConfig:i.processLaunchOptions,unicodeVersion:i.unicodeVersion,replayEvent:await i.serializeNormalBuffer(),timestamp:Date.now()})}));const r={version:1,state:await Promise.all(t)};return JSON.stringify(r)}async reviveTerminalProcesses(e,t,r){const s=[];for(const i of t)s.push(this._reviveTerminalProcess(e,i));await Promise.all(s)}async _reviveTerminalProcess(e,t){const r=Y("terminal-history-restored","History restored"),s=await this.createProcess({...t.shellLaunchConfig,cwd:t.processDetails.cwd,color:t.processDetails.color,icon:t.processDetails.icon,name:t.processDetails.titleSource===I.Api?t.processDetails.title:void 0,initialText:t.replayEvent.events[0].data+re(r,{loudFormatting:!0})},t.processDetails.cwd,t.replayEvent.events[0].cols,t.replayEvent.events[0].rows,t.unicodeVersion,t.processLaunchConfig.env,t.processLaunchConfig.executableEnv,t.processLaunchConfig.options,!0,t.processDetails.workspaceId,t.processDetails.workspaceName,!0,t.replayEvent.events[0].data),i=this._getRevivingProcessId(e,t.id);this._revivedPtyIdMap.set(i,{newId:s,state:t}),this._logService.info(`Revived process, old id ${i} -> new id ${s}`)}async shutdownAll(){this.dispose()}async createProcess(e,t,r,s,i,c,u,y,w,f,A,g,R){if(e.attachPersistentProcess)throw new Error("Attempt to create a process when attach object was provided");const m=++this._lastPtyId,T=new K(e,t,r,s,c,u,y,this._logService,this._productService),v={env:c,executableEnv:u,options:y},_=new ce(m,T,f,A,w,r,s,v,i,this._reconnectConstants,this._logService,g&&typeof e.initialText=="string"?e.initialText:void 0,R,e.icon,e.color,e.name,e.fixedDimensions);return T.onProcessExit(d=>{_.dispose(),this._ptys.delete(m),this._onProcessExit.fire({id:m,event:d})}),_.onProcessData(d=>this._onProcessData.fire({id:m,event:d})),_.onProcessReplay(d=>this._onProcessReplay.fire({id:m,event:d})),_.onProcessReady(d=>this._onProcessReady.fire({id:m,event:d})),_.onProcessOrphanQuestion(()=>this._onProcessOrphanQuestion.fire({id:m})),_.onDidChangeProperty(d=>this._onDidChangeProperty.fire({id:m,property:d})),_.onPersistentProcessReady(()=>{for(const d of this._autoReplies.entries())_.installAutoReply(d[0],d[1])}),this._ptys.set(m,_),m}async attachToProcess(e){try{await this._throwIfNoPty(e).attach(),this._logService.info(`Persistent process reconnection "${e}"`)}catch(t){throw this._logService.warn(`Persistent process reconnection "${e}" failed`,t.message),t}}async updateTitle(e,t,r){this._throwIfNoPty(e).setTitle(t,r)}async updateIcon(e,t,r,s){this._throwIfNoPty(e).setIcon(t,r,s)}async clearBuffer(e){this._throwIfNoPty(e).clearBuffer()}async refreshProperty(e,t){return this._throwIfNoPty(e).refreshProperty(t)}async updateProperty(e,t,r){return this._throwIfNoPty(e).updateProperty(t,r)}async detachFromProcess(e,t){return this._throwIfNoPty(e).detach(t)}async reduceConnectionGraceTime(){for(const e of this._ptys.values())e.reduceGraceTime()}async listProcesses(){const e=Array.from(this._ptys.entries()).filter(([s,i])=>i.shouldPersistTerminal);this._logService.info(`Listing ${e.length} persistent terminals, ${this._ptys.size} total terminals`);const t=e.map(async([s,i])=>this._buildProcessDetails(s,i));return(await Promise.all(t)).filter(s=>s.isOrphan)}async getPerformanceMarks(){return P.getMarks()}async start(e){const t=this._ptys.get(e);return t?t.start():{message:`Could not find pty with id "${e}"`}}async shutdown(e,t){return this._ptys.get(e)?.shutdown(t)}async input(e,t){return this._throwIfNoPty(e).input(t)}async processBinary(e,t){return this._throwIfNoPty(e).writeBinary(t)}async resize(e,t,r){return this._throwIfNoPty(e).resize(t,r)}async getInitialCwd(e){return this._throwIfNoPty(e).getInitialCwd()}async getCwd(e){return this._throwIfNoPty(e).getCwd()}async acknowledgeDataEvent(e,t){return this._throwIfNoPty(e).acknowledgeDataEvent(t)}async setUnicodeVersion(e,t){return this._throwIfNoPty(e).setUnicodeVersion(t)}async getLatency(){return[]}async orphanQuestionReply(e){return this._throwIfNoPty(e).orphanQuestionReply()}async installAutoReply(e,t){this._autoReplies.set(e,t);for(const r of this._ptys.values())r.installAutoReply(e,t)}async uninstallAllAutoReplies(){for(const e of this._autoReplies.keys())for(const t of this._ptys.values())t.uninstallAutoReply(e)}async uninstallAutoReply(e){for(const t of this._ptys.values())t.uninstallAutoReply(e)}async getDefaultSystemShell(e=W){return G(e,process.env)}async getEnvironment(){return{...process.env}}async getWslPath(e,t){if(t==="win-to-unix"){if(!b)return e;if(x()<17063)return e.replace(/\\/g,"/");const r=this._getWSLExecutablePath();return r?new Promise(s=>{C(r,["-e","wslpath",e],{},(c,u,y)=>{s(c?e:J(u.trim()))}).stdin.end()}):e}if(t==="unix-to-win"&&b){if(x()<17063)return e;const r=this._getWSLExecutablePath();return r?new Promise(s=>{C(r,["-e","wslpath","-w",e],{},(c,u,y)=>{s(c?e:u.trim())}).stdin.end()}):e}return e}_getWSLExecutablePath(){const e=x()>=16299,t=process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432"),r=process.env.SystemRoot;if(r)return se(r,t?"Sysnative":"System32",e?"wsl.exe":"bash.exe")}async getRevivedPtyNewId(e,t){try{return this._revivedPtyIdMap.get(this._getRevivingProcessId(e,t))?.newId}catch(r){this._logService.warn(`Couldn't find terminal ID ${e}-${t}`,r.message)}}async setTerminalLayoutInfo(e){this._workspaceLayoutInfos.set(e.workspaceId,e)}async getTerminalLayoutInfo(e){P.mark("code/willGetTerminalLayoutInfo");const t=this._workspaceLayoutInfos.get(e.workspaceId);if(t){const r=new Set,i=(await Promise.all(t.tabs.map(async c=>this._expandTerminalTab(e.workspaceId,c,r)))).filter(c=>c.terminals.length>0);return P.mark("code/didGetTerminalLayoutInfo"),{tabs:i}}P.mark("code/didGetTerminalLayoutInfo")}async _expandTerminalTab(e,t,r){const i=(await Promise.all(t.terminals.map(c=>this._expandTerminalInstance(e,c,r)))).filter(c=>c.terminal!==null);return{isActive:t.isActive,activePersistentProcessId:t.activePersistentProcessId,terminals:i}}async _expandTerminalInstance(e,t,r){try{const s=this._getRevivingProcessId(e,t.terminal),i=this._revivedPtyIdMap.get(s)?.newId;this._logService.info(`Expanding terminal instance, old id ${s} -> new id ${i}`),this._revivedPtyIdMap.delete(s);const c=i??t.terminal;if(r.has(c))throw new Error(`Terminal ${c} has already been expanded`);r.add(c);const u=this._throwIfNoPty(c);return{terminal:{...u&&await this._buildProcessDetails(t.terminal,u,i!==void 0),id:c},relativeSize:t.relativeSize}}catch(s){return this._logService.warn("Couldn't get layout info, a terminal was probably disconnected",s.message),this._logService.debug("Reattach to wrong terminal debug info - layout info by id",t),this._logService.debug("Reattach to wrong terminal debug info - _revivePtyIdMap",Array.from(this._revivedPtyIdMap.values())),this._logService.debug("Reattach to wrong terminal debug info - _ptys ids",Array.from(this._ptys.keys())),{terminal:null,relativeSize:t.relativeSize}}}_getRevivingProcessId(e,t){return`${e}-${t}`}async _buildProcessDetails(e,t,r=!1){P.mark(`code/willBuildProcessDetails/${e}`);const[s,i]=await Promise.all([t.getCwd(),r?!0:t.isOrphaned()]),c={id:e,title:t.title,titleSource:t.titleSource,pid:t.pid,workspaceId:t.workspaceId,workspaceName:t.workspaceName,cwd:s,isOrphan:i,icon:t.icon,color:t.color,fixedDimensions:t.fixedDimensions,environmentVariableCollections:t.processLaunchOptions.options.environmentVariableCollections,reconnectionProperties:t.shellLaunchConfig.reconnectionProperties,waitOnExit:t.shellLaunchConfig.waitOnExit,hideFromUser:t.shellLaunchConfig.hideFromUser,isFeatureTerminal:t.shellLaunchConfig.isFeatureTerminal,type:t.shellLaunchConfig.type,hasChildProcesses:t.hasChildProcesses,shellIntegrationNonce:t.processLaunchOptions.options.shellIntegration.nonce};return P.mark(`code/didBuildProcessDetails/${e}`),c}_throwIfNoPty(e){const t=this._ptys.get(e);if(!t)throw new ee(`Could not find pty ${e} on pty host`);return t}}n([ie],o.prototype,"traceRpcArgs",1),n([a],o.prototype,"refreshIgnoreProcessNames",1),n([a],o.prototype,"requestDetachInstance",1),n([a],o.prototype,"acceptDetachInstanceReply",1),n([a],o.prototype,"freePortKillProcess",1),n([a],o.prototype,"serializeTerminalState",1),n([a],o.prototype,"reviveTerminalProcesses",1),n([a],o.prototype,"shutdownAll",1),n([a],o.prototype,"createProcess",1),n([a],o.prototype,"attachToProcess",1),n([a],o.prototype,"updateTitle",1),n([a],o.prototype,"updateIcon",1),n([a],o.prototype,"clearBuffer",1),n([a],o.prototype,"refreshProperty",1),n([a],o.prototype,"updateProperty",1),n([a],o.prototype,"detachFromProcess",1),n([a],o.prototype,"reduceConnectionGraceTime",1),n([a],o.prototype,"listProcesses",1),n([a],o.prototype,"getPerformanceMarks",1),n([a],o.prototype,"start",1),n([a],o.prototype,"shutdown",1),n([a],o.prototype,"input",1),n([a],o.prototype,"processBinary",1),n([a],o.prototype,"resize",1),n([a],o.prototype,"getInitialCwd",1),n([a],o.prototype,"getCwd",1),n([a],o.prototype,"acknowledgeDataEvent",1),n([a],o.prototype,"setUnicodeVersion",1),n([a],o.prototype,"getLatency",1),n([a],o.prototype,"orphanQuestionReply",1),n([a],o.prototype,"installAutoReply",1),n([a],o.prototype,"uninstallAllAutoReplies",1),n([a],o.prototype,"uninstallAutoReply",1),n([a],o.prototype,"getDefaultSystemShell",1),n([a],o.prototype,"getEnvironment",1),n([a],o.prototype,"getWslPath",1),n([a],o.prototype,"getRevivedPtyNewId",1),n([a],o.prototype,"setTerminalLayoutInfo",1),n([a],o.prototype,"getTerminalLayoutInfo",1);var ae=(t=>(t.None="None",t.ReplayOnly="ReplayOnly",t.Session="Session",t))(ae||{});class ce extends ${constructor(e,t,r,s,i,c,u,y,w,f,A,g,R,m,T,v,_){super();this._persistentProcessId=e;this._terminalProcess=t;this.workspaceId=r;this.workspaceName=s;this.shouldPersistTerminal=i;this.processLaunchOptions=y;this.unicodeVersion=w;this._logService=A;this._icon=m;this._color=T;this._interactionState=new le(`Persistent process "${this._persistentProcessId}" interaction state`,"None",this._logService),this._wasRevived=g!==void 0,this._serializer=new de(c,u,f.scrollback,w,g,y.options.shellIntegration.nonce,i?R:void 0,this._logService),v&&this.setTitle(v,I.Api),this._fixedDimensions=_,this._orphanQuestionBarrier=null,this._orphanQuestionReplyTime=0,this._disconnectRunner1=this._register(new z(()=>{this._logService.info(`Persistent process "${this._persistentProcessId}": The reconnection grace time of ${k(f.graceTime)} has expired, shutting down pid "${this._pid}"`),this.shutdown(!0)},f.graceTime)),this._disconnectRunner2=this._register(new z(()=>{this._logService.info(`Persistent process "${this._persistentProcessId}": The short reconnection grace time of ${k(f.shortGraceTime)} has expired, shutting down pid ${this._pid}`),this.shutdown(!0)},f.shortGraceTime)),this._register(this._terminalProcess.onProcessExit(()=>this._bufferer.stopBuffering(this._persistentProcessId))),this._register(this._terminalProcess.onProcessReady(d=>{this._pid=d.pid,this._cwd=d.cwd,this._onProcessReady.fire(d)})),this._register(this._terminalProcess.onDidChangeProperty(d=>{this._onDidChangeProperty.fire(d)})),this._bufferer=new j((d,N)=>this._onProcessData.fire(N)),this._register(this._bufferer.startBuffering(this._persistentProcessId,this._terminalProcess.onProcessData)),this._register(this.onProcessData(d=>this._serializer.handleData(d))),this._register(B(()=>{for(const d of this._autoReplies.values())d.dispose();this._autoReplies.clear()}))}_bufferer;_autoReplies=new Map;_pendingCommands=new Map;_isStarted=!1;_interactionState;_orphanQuestionBarrier;_orphanQuestionReplyTime;_orphanRequestQueue=new F;_disconnectRunner1;_disconnectRunner2;_onProcessReplay=this._register(new h);onProcessReplay=this._onProcessReplay.event;_onProcessReady=this._register(new h);onProcessReady=this._onProcessReady.event;_onPersistentProcessReady=this._register(new h);onPersistentProcessReady=this._onPersistentProcessReady.event;_onProcessData=this._register(new h);onProcessData=this._onProcessData.event;_onProcessOrphanQuestion=this._register(new h);onProcessOrphanQuestion=this._onProcessOrphanQuestion.event;_onDidChangeProperty=this._register(new h);onDidChangeProperty=this._onDidChangeProperty.event;_inReplay=!1;_pid=-1;_cwd="";_title;_titleSource=I.Process;_serializer;_wasRevived;_fixedDimensions;get pid(){return this._pid}get shellLaunchConfig(){return this._terminalProcess.shellLaunchConfig}get hasWrittenData(){return this._interactionState.value!=="None"}get title(){return this._title||this._terminalProcess.currentTitle}get titleSource(){return this._titleSource}get icon(){return this._icon}get color(){return this._color}get fixedDimensions(){return this._fixedDimensions}get hasChildProcesses(){return this._terminalProcess.hasChildProcesses}setTitle(e,t){t===I.Api&&(this._interactionState.setValue("Session","setTitle"),this._serializer.freeRawReviveBuffer()),this._title=e,this._titleSource=t}setIcon(e,t,r){(!this._icon||"id"in t&&"id"in this._icon&&t.id!==this._icon.id||!this.color||r!==this._color)&&(this._serializer.freeRawReviveBuffer(),e&&this._interactionState.setValue("Session","setIcon")),this._icon=t,this._color=r}_setFixedDimensions(e){this._fixedDimensions=e}async attach(){!this._disconnectRunner1.isScheduled()&&!this._disconnectRunner2.isScheduled()&&this._logService.warn(`Persistent process "${this._persistentProcessId}": Process had no disconnect runners but was an orphan`),this._disconnectRunner1.cancel(),this._disconnectRunner2.cancel()}async detach(e){this.shouldPersistTerminal&&(this._interactionState.value!=="None"||e)?this._disconnectRunner1.schedule():this.shutdown(!0)}serializeNormalBuffer(){return this._serializer.generateReplayEvent(!0,this._interactionState.value!=="Session")}async refreshProperty(e){return this._terminalProcess.refreshProperty(e)}async updateProperty(e,t){if(e===D.FixedDimensions)return this._setFixedDimensions(t)}async start(){if(!this._isStarted){const e=await this._terminalProcess.start();return e&&"message"in e||(this._isStarted=!0,this._wasRevived?this.triggerReplay():this._onPersistentProcessReady.fire()),e}this._onProcessReady.fire({pid:this._pid,cwd:this._cwd,windowsPty:this._terminalProcess.getWindowsPty()}),this._onDidChangeProperty.fire({type:D.Title,value:this._terminalProcess.currentTitle}),this._onDidChangeProperty.fire({type:D.ShellType,value:this._terminalProcess.shellType}),this.triggerReplay()}shutdown(e){return this._terminalProcess.shutdown(e)}input(e){if(this._interactionState.setValue("Session","input"),this._serializer.freeRawReviveBuffer(),!this._inReplay){for(const t of this._autoReplies.values())t.handleInput();return this._terminalProcess.input(e)}}writeBinary(e){return this._terminalProcess.processBinary(e)}resize(e,t){if(!this._inReplay){this._serializer.handleResize(e,t),this._bufferer.flushBuffer(this._persistentProcessId);for(const r of this._autoReplies.values())r.handleResize();return this._terminalProcess.resize(e,t)}}async clearBuffer(){this._serializer.clearBuffer(),this._terminalProcess.clearBuffer()}setUnicodeVersion(e){this.unicodeVersion=e,this._serializer.setUnicodeVersion?.(e)}acknowledgeDataEvent(e){if(!this._inReplay)return this._terminalProcess.acknowledgeDataEvent(e)}getInitialCwd(){return this._terminalProcess.getInitialCwd()}getCwd(){return this._terminalProcess.getCwd()}async triggerReplay(){this._interactionState.value==="None"&&this._interactionState.setValue("ReplayOnly","triggerReplay");const e=await this._serializer.generateReplayEvent();let t=0;for(const r of e.events)t+=r.data.length;this._logService.info(`Persistent process "${this._persistentProcessId}": Replaying ${t} chars and ${e.events.length} size events`),this._onProcessReplay.fire(e),this._terminalProcess.clearUnacknowledgedChars(),this._onPersistentProcessReady.fire()}installAutoReply(e,t){this._autoReplies.get(e)?.dispose(),this._autoReplies.set(e,new Z(this._terminalProcess,e,t,this._logService))}uninstallAutoReply(e){this._autoReplies.get(e)?.dispose(),this._autoReplies.delete(e)}sendCommandResult(e,t,r){this._pendingCommands.get(e)&&this._pendingCommands.delete(e)}orphanQuestionReply(){if(this._orphanQuestionReplyTime=Date.now(),this._orphanQuestionBarrier){const e=this._orphanQuestionBarrier;this._orphanQuestionBarrier=null,e.open()}}reduceGraceTime(){this._disconnectRunner2.isScheduled()||this._disconnectRunner1.isScheduled()&&this._disconnectRunner2.schedule()}async isOrphaned(){return await this._orphanRequestQueue.queue(async()=>this._isOrphaned())}async _isOrphaned(){return this._disconnectRunner1.isScheduled()||this._disconnectRunner2.isScheduled()?!0:(this._orphanQuestionBarrier||(this._orphanQuestionBarrier=new V(4e3),this._orphanQuestionReplyTime=0,this._onProcessOrphanQuestion.fire()),await this._orphanQuestionBarrier.wait(),Date.now()-this._orphanQuestionReplyTime>500)}}class le{constructor(l,e,t){this._name=l;this._value=e;this._logService=t;this._log("initialized")}get value(){return this._value}setValue(l,e){this._value!==l&&(this._value=l,this._log(e))}_log(l){this._logService.debug(`MutationLogger "${this._name}" set to "${this._value}", reason: ${l}`)}}class de{constructor(l,e,t,r,s,i,c,u){this._rawReviveBuffer=c;this._xterm=new oe({cols:l,rows:e,scrollback:t,allowProposedApi:!0}),s&&this._xterm.writeln(s),this.setUnicodeVersion(r),this._shellIntegrationAddon=new te(i,!0,void 0,u),this._xterm.loadAddon(this._shellIntegrationAddon)}_xterm;_shellIntegrationAddon;_unicodeAddon;freeRawReviveBuffer(){this._rawReviveBuffer=void 0}handleData(l){this._xterm.write(l)}handleResize(l,e){this._xterm.resize(l,e)}clearBuffer(){this._xterm.clear()}async generateReplayEvent(l,e){const t=new(await this._getSerializeConstructor());this._xterm.loadAddon(t);const r={scrollback:this._xterm.options.scrollback};l&&(r.excludeAltBuffer=!0,r.excludeModes=!0);let s;return e&&this._rawReviveBuffer?s=this._rawReviveBuffer:s=t.serialize(r),{events:[{cols:this._xterm.cols,rows:this._xterm.rows,data:s}],commands:this._shellIntegrationAddon.serialize()}}async setUnicodeVersion(l){this._xterm.unicode.activeVersion!==l&&(l==="11"?(this._unicodeAddon=new(await this._getUnicode11Constructor()),this._xterm.loadAddon(this._unicodeAddon)):(this._unicodeAddon?.dispose(),this._unicodeAddon=void 0),this._xterm.unicode.activeVersion=l)}async _getUnicode11Constructor(){return L||(L=(await import("@xterm/addon-unicode11")).Unicode11Addon),L}async _getSerializeConstructor(){return E||(E=(await import("@xterm/addon-serialize")).SerializeAddon),E}}function k(p){let l=0,e=0,t=0;p>=1e3&&(t=Math.floor(p/1e3),p-=t*1e3),t>=60&&(e=Math.floor(t/60),t-=e*60),e>=60&&(l=Math.floor(e/60),e-=l*60);const r=l?`${l}h`:"",s=e?`${e}m`:"",i=t?`${t}s`:"",c=p?`${p}ms`:"";return`${r}${s}${i}${c}`}export{o as PtyService,a as traceRpc};
