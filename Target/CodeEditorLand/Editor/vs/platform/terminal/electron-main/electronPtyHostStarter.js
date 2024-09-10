var u=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var l=(s,o,e,i)=>{for(var t=i>1?void 0:i?_(o,e):o,r=s.length-1,n;r>=0;r--)(n=s[r])&&(t=(i?n(o,e,t):n(t))||t);return i&&t&&u(o,e,t),t},a=(s,o)=>(e,i)=>o(e,i,s);import{IEnvironmentMainService as f}from"../../environment/electron-main/environmentMainService.js";import{parsePtyHostDebugPort as h}from"../../environment/node/environmentService.js";import{ILifecycleMainService as C}from"../../lifecycle/electron-main/lifecycleMainService.js";import{ILogService as g}from"../../log/common/log.js";import{NullTelemetryService as P}from"../../telemetry/common/telemetryUtils.js";import{TerminalSettingId as p}from"../common/terminal.js";import{UtilityProcess as E}from"../../utilityProcess/electron-main/utilityProcess.js";import{Client as M}from"../../../base/parts/ipc/electron-main/ipc.mp.js";import{validatedIpcMain as m}from"../../../base/parts/ipc/electron-main/ipcMain.js";import{Disposable as I,DisposableStore as D,toDisposable as v}from"../../../base/common/lifecycle.js";import{Emitter as y}from"../../../base/common/event.js";import{deepClone as O}from"../../../base/common/objects.js";import{IConfigurationService as R}from"../../configuration/common/configuration.js";import{Schemas as H}from"../../../base/common/network.js";let c=class extends I{constructor(e,i,t,r,n){super();this._reconnectConstants=e;this._configurationService=i;this._environmentMainService=t;this._lifecycleMainService=r;this._logService=n;this._register(this._lifecycleMainService.onWillShutdown(()=>this._onWillShutdown.fire())),m.on("vscode:createPtyHostMessageChannel",(S,d)=>this._onWindowConnection(S,d)),this._register(v(()=>{m.removeHandler("vscode:createPtyHostMessageChannel")}))}utilityProcess=void 0;_onRequestConnection=new y;onRequestConnection=this._onRequestConnection.event;_onWillShutdown=new y;onWillShutdown=this._onWillShutdown.event;start(){this.utilityProcess=new E(this._logService,P,this._lifecycleMainService);const e=h(this._environmentMainService.args,this._environmentMainService.isBuilt),i=e.port?["--nolazy",`--inspect${e.break?"-brk":""}=${e.port}`]:void 0;this.utilityProcess.start({type:"ptyHost",entryPoint:"vs/platform/terminal/node/ptyHostMain",execArgv:i,args:["--logsPath",this._environmentMainService.logsHome.with({scheme:H.file}).fsPath],env:this._createPtyHostConfiguration()});const t=this.utilityProcess.connect(),r=new M(t,"ptyHost"),n=new D;return n.add(r),n.add(v(()=>{this.utilityProcess?.kill(),this.utilityProcess?.dispose(),this.utilityProcess=void 0})),{client:r,store:n,onDidProcessExit:this.utilityProcess.onExit}}_createPtyHostConfiguration(){this._environmentMainService.unsetSnapExportedVariables();const e={...O(process.env),VSCODE_AMD_ENTRYPOINT:"vs/platform/terminal/node/ptyHostMain",VSCODE_PIPE_LOGGING:"true",VSCODE_VERBOSE_LOGGING:"true",VSCODE_RECONNECT_GRACE_TIME:String(this._reconnectConstants.graceTime),VSCODE_RECONNECT_SHORT_GRACE_TIME:String(this._reconnectConstants.shortGraceTime),VSCODE_RECONNECT_SCROLLBACK:String(this._reconnectConstants.scrollback)},i=this._configurationService.getValue(p.DeveloperPtyHostLatency);i&&typeof i=="number"&&(e.VSCODE_LATENCY=String(i));const t=this._configurationService.getValue(p.DeveloperPtyHostStartupDelay);return t&&typeof t=="number"&&(e.VSCODE_STARTUP_DELAY=String(t)),this._environmentMainService.restoreSnapExportedVariables(),e}_onWindowConnection(e,i){this._onRequestConnection.fire();const t=this.utilityProcess.connect();if(e.sender.isDestroyed()){t.close();return}e.sender.postMessage("vscode:createPtyHostMessageChannelResult",i,[t])}};c=l([a(1,R),a(2,f),a(3,C),a(4,g)],c);export{c as ElectronPtyHostStarter};
