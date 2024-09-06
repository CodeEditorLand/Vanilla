var p=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var a=(s,n,o,t)=>{for(var e=t>1?void 0:t?C(n,o):n,r=s.length-1,c;r>=0;r--)(c=s[r])&&(e=(t?c(n,o,e):c(e))||e);return t&&e&&p(n,o,e),e},m=(s,n)=>(o,t)=>n(o,t,s);import{Disposable as E,DisposableStore as _}from"../../../../vs/base/common/lifecycle.js";import{FileAccess as v,Schemas as l}from"../../../../vs/base/common/network.js";import{Client as I}from"../../../../vs/base/parts/ipc/node/ipc.cp.js";import{IEnvironmentService as O}from"../../../../vs/platform/environment/common/environment.js";import{parsePtyHostDebugPort as S}from"../../../../vs/platform/environment/node/environmentService.js";import"../../../../vs/platform/terminal/common/terminal.js";import"../../../../vs/platform/terminal/node/ptyHost.js";let i=class extends E{constructor(o,t){super();this._reconnectConstants=o;this._environmentService=t}start(){const o={serverName:"Pty Host",args:["--type=ptyHost","--logsPath",this._environmentService.logsHome.with({scheme:l.file}).fsPath],env:{VSCODE_AMD_ENTRYPOINT:"vs/platform/terminal/node/ptyHostMain",VSCODE_PIPE_LOGGING:"true",VSCODE_VERBOSE_LOGGING:"true",VSCODE_RECONNECT_GRACE_TIME:this._reconnectConstants.graceTime,VSCODE_RECONNECT_SHORT_GRACE_TIME:this._reconnectConstants.shortGraceTime,VSCODE_RECONNECT_SCROLLBACK:this._reconnectConstants.scrollback}},t=S(this._environmentService.args,this._environmentService.isBuilt);t&&(t.break&&t.port?o.debugBrk=t.port:!t.break&&t.port&&(o.debug=t.port));const e=new I(v.asFileUri("bootstrap-fork").fsPath,o),r=new _;return r.add(e),{client:e,store:r,onDidProcessExit:e.onDidProcessExit}}};i=a([m(1,O)],i);export{i as NodePtyHostStarter};
