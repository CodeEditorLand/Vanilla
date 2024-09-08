var M=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var T=(u,l,e,t)=>{for(var i=t>1?void 0:t?O(l,e):l,s=u.length-1,r;s>=0;s--)(r=u[s])&&(i=(t?r(l,e,i):r(i))||i);return t&&i&&M(l,e,i),i},v=(u,l)=>(e,t)=>l(e,t,u);import*as _ from"fs";import{exec as W}from"child_process";import{timeout as F}from"../../../base/common/async.js";import{Emitter as y}from"../../../base/common/event.js";import{Disposable as I,toDisposable as S}from"../../../base/common/lifecycle.js";import*as C from"../../../base/common/path.js";import{isLinux as L,isMacintosh as R,isWindows as h}from"../../../base/common/platform.js";import{URI as z}from"../../../base/common/uri.js";import{localize as g}from"../../../nls.js";import{ILogService as N,LogLevel as x}from"../../log/common/log.js";import{IProductService as H}from"../../product/common/productService.js";import{FlowControlConstants as f,ProcessPropertyType as n,PosixShellType as c,GeneralShellType as p}from"../common/terminal.js";import{ChildProcessMonitor as j}from"./childProcessMonitor.js";import{findExecutable as A,getShellIntegrationInjection as K,getWindowsBuildNumber as b}from"./terminalEnvironment.js";import{WindowsShellHelper as $}from"./windowsShellHelper.js";import{spawn as B}from"node-pty";import{chunkInput as U}from"../common/terminalProcess.js";var q=(e=>(e[e.DataFlushTimeout=250]="DataFlushTimeout",e[e.MaximumShutdownTime=5e3]="MaximumShutdownTime",e))(q||{}),J=(t=>(t[t.KillSpawnThrottleInterval=250]="KillSpawnThrottleInterval",t[t.KillSpawnSpacingDuration=50]="KillSpawnSpacingDuration",t[t.WriteInterval=5]="WriteInterval",t))(J||{});const D=new Map([["bash",c.Bash],["csh",c.Csh],["fish",c.Fish],["ksh",c.Ksh],["sh",c.Sh],["zsh",c.Zsh]]),k=new Map([["pwsh",p.PowerShell],["python",p.Python],["julia",p.Julia],["nu",p.NuShell]]);let a=class extends I{constructor(e,t,i,s,r,o,G,V,Z){super();this.shellLaunchConfig=e;this._executableEnv=o;this._options=G;this._logService=V;this._productService=Z;let w;h?w=C.basename(this.shellLaunchConfig.executable||""):w="xterm-256color",this._initialCwd=t,this._properties[n.InitialCwd]=this._initialCwd,this._properties[n.Cwd]=this._initialCwd;const P=this._options.windowsEnableConpty&&process.platform==="win32"&&b()>=18309,E=P&&this._options.windowsUseConptyDll;this._ptyOptions={name:w,cwd:t,env:r,cols:i,rows:s,useConpty:P,useConptyDll:E,conptyInheritCursor:P&&!!e.initialText},h&&(P&&i===0&&s===0&&this.shellLaunchConfig.executable?.endsWith("Git\\bin\\bash.exe")&&(this._delayedResizer=new Q,this._register(this._delayedResizer.onTrigger(d=>{this._delayedResizer?.dispose(),this._delayedResizer=void 0,d.cols&&d.rows&&this.resize(d.cols,d.rows)}))),this.onProcessReady(d=>{this._windowsShellHelper=this._register(new $(d.pid)),this._register(this._windowsShellHelper.onShellTypeChanged(m=>this._onDidChangeProperty.fire({type:n.ShellType,value:m}))),this._register(this._windowsShellHelper.onShellNameChanged(m=>this._onDidChangeProperty.fire({type:n.Title,value:m})))})),this._register(S(()=>{this._titleInterval&&(clearInterval(this._titleInterval),this._titleInterval=null)}))}id=0;shouldPersist=!1;_properties={cwd:"",initialCwd:"",fixedDimensions:{cols:void 0,rows:void 0},title:"",shellType:void 0,hasChildProcesses:!0,resolvedShellLaunchConfig:{},overrideDimensions:void 0,failedShellIntegrationActivation:!1,usedShellIntegrationInjection:void 0};static _lastKillOrStart=0;_exitCode;_exitMessage;_closeTimeout;_ptyProcess;_currentTitle="";_processStartupComplete;_windowsShellHelper;_childProcessMonitor;_titleInterval=null;_writeQueue=[];_writeTimeout;_delayedResizer;_initialCwd;_ptyOptions;_isPtyPaused=!1;_unacknowledgedCharCount=0;get exitMessage(){return this._exitMessage}get currentTitle(){return this._windowsShellHelper?.shellTitle||this._currentTitle}get shellType(){return h?this._windowsShellHelper?.shellType:D.get(this._currentTitle)||k.get(this._currentTitle)}get hasChildProcesses(){return this._childProcessMonitor?.hasChildProcesses||!1}_onProcessData=this._register(new y);onProcessData=this._onProcessData.event;_onProcessReady=this._register(new y);onProcessReady=this._onProcessReady.event;_onDidChangeProperty=this._register(new y);onDidChangeProperty=this._onDidChangeProperty.event;_onProcessExit=this._register(new y);onProcessExit=this._onProcessExit.event;async start(){const t=(await Promise.all([this._validateCwd(),this._validateExecutable()])).find(s=>s!==void 0);if(t)return t;let i;if(this._options.shellIntegration.enabled)if(i=K(this.shellLaunchConfig,this._options,this._ptyOptions.env,this._logService,this._productService),i){if(this._onDidChangeProperty.fire({type:n.UsedShellIntegrationInjection,value:!0}),i.envMixin)for(const[s,r]of Object.entries(i.envMixin))this._ptyOptions.env||={},this._ptyOptions.env[s]=r;if(i.filesToCopy)for(const s of i.filesToCopy)try{await _.promises.mkdir(C.dirname(s.dest),{recursive:!0}),await _.promises.copyFile(s.source,s.dest)}catch{}}else this._onDidChangeProperty.fire({type:n.FailedShellIntegrationActivation,value:!0});try{return await this.setupPtyProcess(this.shellLaunchConfig,this._ptyOptions,i),i?.newArgs?{injectedArgs:i.newArgs}:void 0}catch(s){return this._logService.trace("node-pty.node-pty.IPty#spawn native exception",s),{message:`A native exception occurred during launch (${s.message})`}}}async _validateCwd(){try{if(!(await _.promises.stat(this._initialCwd)).isDirectory())return{message:g("launchFail.cwdNotDirectory",'Starting directory (cwd) "{0}" is not a directory',this._initialCwd.toString())}}catch(e){if(e?.code==="ENOENT")return{message:g("launchFail.cwdDoesNotExist",'Starting directory (cwd) "{0}" does not exist',this._initialCwd.toString())}}this._onDidChangeProperty.fire({type:n.InitialCwd,value:this._initialCwd})}async _validateExecutable(){const e=this.shellLaunchConfig;if(!e.executable)throw new Error("IShellLaunchConfig.executable not set");const t=e.cwd instanceof z?e.cwd.path:e.cwd,i=e.env&&e.env.PATH?e.env.PATH.split(C.delimiter):void 0,s=await A(e.executable,t,i,this._executableEnv);if(!s)return{message:g("launchFail.executableDoesNotExist",'Path to shell executable "{0}" does not exist',e.executable)};try{const r=await _.promises.stat(s);if(!r.isFile()&&!r.isSymbolicLink())return{message:g("launchFail.executableIsNotFileOrSymlink",'Path to shell executable "{0}" is not a file or a symlink',e.executable)};e.executable=s}catch(r){if(r?.code!=="EACCES")throw r}}async setupPtyProcess(e,t,i){const s=i?.newArgs||e.args||[];await this._throttleKillSpawn(),this._logService.trace("node-pty.IPty#spawn",e.executable,s,t);const r=B(e.executable,s,t);this._ptyProcess=r,this._childProcessMonitor=this._register(new j(r.pid,this._logService)),this._childProcessMonitor.onDidChangeHasChildProcesses(o=>this._onDidChangeProperty.fire({type:n.HasChildProcesses,value:o})),this._processStartupComplete=new Promise(o=>{this.onProcessReady(()=>o())}),r.onData(o=>{this._unacknowledgedCharCount+=o.length,!this._isPtyPaused&&this._unacknowledgedCharCount>f.HighWatermarkChars&&(this._logService.trace(`Flow control: Pause (${this._unacknowledgedCharCount} > ${f.HighWatermarkChars})`),this._isPtyPaused=!0,r.pause()),this._logService.trace("node-pty.IPty#onData",o),this._onProcessData.fire(o),this._closeTimeout&&this._queueProcessExit(),this._windowsShellHelper?.checkShell(),this._childProcessMonitor?.handleOutput()}),r.onExit(o=>{this._exitCode=o.exitCode,this._queueProcessExit()}),this._sendProcessId(r.pid),this._setupTitlePolling(r)}_setupTitlePolling(e){setTimeout(()=>this._sendProcessTitle(e)),h||(this._titleInterval=setInterval(()=>{this._currentTitle!==e.process&&this._sendProcessTitle(e)},200))}_queueProcessExit(){this._logService.getLevel()===x.Trace&&this._logService.trace("TerminalProcess#_queueProcessExit",new Error().stack?.replace(/^Error/,"")),this._closeTimeout&&clearTimeout(this._closeTimeout),this._closeTimeout=setTimeout(()=>{this._closeTimeout=void 0,this._kill()},250)}async _kill(){if(await this._processStartupComplete,!this._store.isDisposed){try{this._ptyProcess&&(await this._throttleKillSpawn(),this._logService.trace("node-pty.IPty#kill"),this._ptyProcess.kill())}catch{}this._onProcessExit.fire(this._exitCode||0),this.dispose()}}async _throttleKillSpawn(){if(!(!h||!("useConpty"in this._ptyOptions)||!this._ptyOptions.useConpty)){for(;Date.now()-a._lastKillOrStart<250;)this._logService.trace("Throttling kill/spawn call"),await F(250-(Date.now()-a._lastKillOrStart)+50);a._lastKillOrStart=Date.now()}}_sendProcessId(e){this._onProcessReady.fire({pid:e,cwd:this._initialCwd,windowsPty:this.getWindowsPty()})}_sendProcessTitle(e){if(this._store.isDisposed)return;this._currentTitle=e.process??"",this._onDidChangeProperty.fire({type:n.Title,value:this._currentTitle});const t=this.currentTitle.replace(/ \(figterm\)$/g,"");if(t.toLowerCase().startsWith("python"))this._onDidChangeProperty.fire({type:n.ShellType,value:p.Python});else if(t.toLowerCase().startsWith("julia"))this._onDidChangeProperty.fire({type:n.ShellType,value:p.Julia});else{const i=D.get(t)||k.get(t);this._onDidChangeProperty.fire({type:n.ShellType,value:i})}}shutdown(e){this._logService.getLevel()===x.Trace&&this._logService.trace("TerminalProcess#shutdown",new Error().stack?.replace(/^Error/,"")),e&&!h?this._kill():!this._closeTimeout&&!this._store.isDisposed&&(this._queueProcessExit(),setTimeout(()=>{this._closeTimeout&&!this._store.isDisposed&&(this._closeTimeout=void 0,this._kill())},5e3))}input(e,t=!1){this._store.isDisposed||!this._ptyProcess||(this._writeQueue.push(...U(e).map(i=>({isBinary:t,data:i}))),this._startWrite())}async processBinary(e){this.input(e,!0)}async refreshProperty(e){switch(e){case n.Cwd:{const t=await this.getCwd();return t!==this._properties.cwd&&(this._properties.cwd=t,this._onDidChangeProperty.fire({type:n.Cwd,value:this._properties.cwd})),t}case n.InitialCwd:{const t=await this.getInitialCwd();return t!==this._properties.initialCwd&&(this._properties.initialCwd=t,this._onDidChangeProperty.fire({type:n.InitialCwd,value:this._properties.initialCwd})),t}case n.Title:return this.currentTitle;default:return this.shellType}}async updateProperty(e,t){e===n.FixedDimensions&&(this._properties.fixedDimensions=t)}_startWrite(){if(!(this._writeTimeout!==void 0||this._writeQueue.length===0)){if(this._doWrite(),this._writeQueue.length===0){this._writeTimeout=void 0;return}this._writeTimeout=setTimeout(()=>{this._writeTimeout=void 0,this._startWrite()},5)}}_doWrite(){const e=this._writeQueue.shift();this._logService.trace("node-pty.IPty#write",e.data),e.isBinary?this._ptyProcess.write(Buffer.from(e.data,"binary")):this._ptyProcess.write(e.data),this._childProcessMonitor?.handleInput()}resize(e,t){if(!this._store.isDisposed&&!(typeof e!="number"||typeof t!="number"||isNaN(e)||isNaN(t))&&this._ptyProcess){if(e=Math.max(e,1),t=Math.max(t,1),this._delayedResizer){this._delayedResizer.cols=e,this._delayedResizer.rows=t;return}this._logService.trace("node-pty.IPty#resize",e,t);try{this._ptyProcess.resize(e,t)}catch(i){if(this._logService.trace("node-pty.IPty#resize exception "+i.message),this._exitCode!==void 0&&i.message!=="ioctl(2) failed, EBADF"&&i.message!=="Cannot resize a pty that has already exited")throw i}}}clearBuffer(){this._ptyProcess?.clear()}acknowledgeDataEvent(e){this._unacknowledgedCharCount=Math.max(this._unacknowledgedCharCount-e,0),this._logService.trace(`Flow control: Ack ${e} chars (unacknowledged: ${this._unacknowledgedCharCount})`),this._isPtyPaused&&this._unacknowledgedCharCount<f.LowWatermarkChars&&(this._logService.trace(`Flow control: Resume (${this._unacknowledgedCharCount} < ${f.LowWatermarkChars})`),this._ptyProcess?.resume(),this._isPtyPaused=!1)}clearUnacknowledgedChars(){this._unacknowledgedCharCount=0,this._logService.trace("Flow control: Cleared all unacknowledged chars, forcing resume"),this._isPtyPaused&&(this._ptyProcess?.resume(),this._isPtyPaused=!1)}async setUnicodeVersion(e){}getInitialCwd(){return Promise.resolve(this._initialCwd)}async getCwd(){if(R)return new Promise(e=>{if(!this._ptyProcess){e(this._initialCwd);return}this._logService.trace("node-pty.IPty#pid"),W("lsof -OPln -p "+this._ptyProcess.pid+" | grep cwd",{env:{...process.env,LANG:"en_US.UTF-8"}},(t,i,s)=>{!t&&i!==""?e(i.substring(i.indexOf("/"),i.length-1)):(this._logService.error("lsof did not run successfully, it may not be on the $PATH?",t,i,s),e(this._initialCwd))})});if(L){if(!this._ptyProcess)return this._initialCwd;this._logService.trace("node-pty.IPty#pid");try{return await _.promises.readlink(`/proc/${this._ptyProcess.pid}/cwd`)}catch{return this._initialCwd}}return this._initialCwd}getWindowsPty(){return h?{backend:"useConpty"in this._ptyOptions&&this._ptyOptions.useConpty?"conpty":"winpty",buildNumber:b()}:void 0}};a=T([v(7,N),v(8,H)],a);class Q extends I{rows;cols;_timeout;_onTrigger=this._register(new y);get onTrigger(){return this._onTrigger.event}constructor(){super(),this._timeout=setTimeout(()=>{this._onTrigger.fire({rows:this.rows,cols:this.cols})},1e3),this._register(S(()=>clearTimeout(this._timeout)))}}export{a as TerminalProcess};
