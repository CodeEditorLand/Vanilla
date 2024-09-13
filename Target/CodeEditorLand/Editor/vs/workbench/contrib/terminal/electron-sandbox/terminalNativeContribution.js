var v=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var a=(s,n,e,t)=>{for(var i=t>1?void 0:t?p(n,e):n,o=s.length-1,r;o>=0;o--)(r=s[o])&&(i=(t?r(n,e,i):r(i))||i);return t&&i&&v(n,e,i),i},m=(s,n)=>(e,t)=>n(e,t,s);import{disposableWindowInterval as d,getActiveWindow as f}from"../../../../base/browser/dom.js";import{Disposable as u}from"../../../../base/common/lifecycle.js";import{URI as w}from"../../../../base/common/uri.js";import{ipcRenderer as I}from"../../../../base/parts/sandbox/electron-sandbox/globals.js";import{IFileService as R}from"../../../../platform/files/common/files.js";import{INativeHostService as _}from"../../../../platform/native/common/native.js";import{IRemoteAgentService as S}from"../../../services/remote/common/remoteAgentService.js";import{ITerminalService as h}from"../browser/terminal.js";import{registerRemoteContributions as F}from"./terminalRemote.js";let c=class extends u{constructor(e,t,i,o){super();this._fileService=e;this._terminalService=t;I.on("vscode:openFiles",(g,l)=>{this._onOpenFileRequest(l)}),this._register(o.onDidResumeOS(()=>this._onOsResume())),this._terminalService.setNativeDelegate({getWindowCount:()=>o.getWindowCount()});const r=i.getConnection();r&&r.remoteAuthority&&F()}_onOsResume(){for(const e of this._terminalService.instances)e.xterm?.forceRedraw()}async _onOpenFileRequest(e){if(e.termProgram==="vscode"&&e.filesToWait){const t=w.revive(e.filesToWait.waitMarkerFileUri);await this._whenFileDeleted(t),this._terminalService.activeInstance?.focus()}}_whenFileDeleted(e){return new Promise(t=>{let i=!1;const o=d(f(),async()=>{if(!i){i=!0;const r=await this._fileService.exists(e);i=!1,r||(o.dispose(),t(void 0))}},1e3)})}};c=a([m(0,R),m(1,h),m(2,S),m(3,_)],c);export{c as TerminalNativeContribution};
