var w=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var h=(a,i,e,t)=>{for(var n=t>1?void 0:t?S(i,e):i,s=a.length-1,o;s>=0;s--)(o=a[s])&&(n=(t?o(i,e,n):o(n))||n);return t&&n&&w(i,e,n),n},l=(a,i)=>(e,t)=>i(e,t,a);import{createCancelablePromise as D,firstParallel as A,timeout as P}from"../../../base/common/async.js";import"../../../base/common/lifecycle.js";import*as f from"../../../base/common/platform.js";import*as H from"../../../nls.js";import"../../../platform/externalTerminal/common/externalTerminal.js";import{LinuxExternalTerminalService as _,MacExternalTerminalService as C,WindowsExternalTerminalService as y}from"../../../platform/externalTerminal/node/externalTerminalService.js";import"../../../platform/sign/common/sign.js";import{SignService as R}from"../../../platform/sign/node/signService.js";import"../../contrib/debug/common/abstractDebugAdapter.js";import"../../contrib/debug/common/debug.js";import{ExecutableDebugAdapter as I,NamedPipeDebugAdapter as k,SocketDebugAdapter as U}from"../../contrib/debug/node/debugAdapter.js";import{hasChildProcesses as O,prepareCommand as L}from"../../contrib/debug/node/terminals.js";import"../../services/extensions/common/extensionDescriptionRegistry.js";import{IExtHostCommands as W}from"../common/extHostCommands.js";import{IExtHostConfiguration as B}from"../common/extHostConfiguration.js";import{ExtHostDebugServiceBase as F}from"../common/extHostDebugService.js";import{IExtHostEditorTabs as q}from"../common/extHostEditorTabs.js";import{IExtHostExtensionService as M}from"../common/extHostExtensionService.js";import{IExtHostRpcService as N}from"../common/extHostRpcService.js";import{IExtHostTerminalService as z}from"../common/extHostTerminalService.js";import{IExtHostTesting as V}from"../common/extHostTesting.js";import{DebugAdapterExecutable as $,ThemeIcon as J}from"../common/extHostTypes.js";import{IExtHostVariableResolverProvider as j}from"../common/extHostVariableResolverService.js";import{IExtHostWorkspace as G}from"../common/extHostWorkspace.js";let g=class extends F{constructor(e,t,n,s,o,c,d,r,p){super(e,t,n,s,c,d,r,p);this._terminalService=o}_serviceBrand;_integratedTerminalInstances=new x;_terminalDisposedListener;createDebugAdapter(e,t){switch(e.type){case"server":return new U(e);case"pipeServer":return new k(e);case"executable":return new I(e,t.type)}return super.createDebugAdapter(e,t)}daExecutableFromPackage(e,t){const n=I.platformAdapterExecutable(t.getAllExtensionDescriptions(),e.type);if(n)return new $(n.command,n.args,n.options)}createSignService(){return new R}async $runInTerminal(e,t){if(e.kind==="integrated"){this._terminalDisposedListener||(this._terminalDisposedListener=this._register(this._terminalService.onDidCloseTerminal(m=>{this._integratedTerminalInstances.onTerminalClosed(m)})));const n=await this._configurationService.getConfigProvider(),s=this._terminalService.getDefaultShell(!0),o=this._terminalService.getDefaultShellArgs(!0),c=e.title||H.localize("debug.terminal.title","Debug Process"),d=JSON.stringify({shell:s,shellArgs:o});let r=await this._integratedTerminalInstances.checkout(d,c),p,v=!1;if(r)p=e.cwd;else{const m={shellPath:s,shellArgs:o,cwd:e.cwd,name:c,iconPath:new J("debug")};v=!0,r=this._terminalService.createTerminalFromOptions(m,{isFeatureTerminal:!0,forceShellIntegration:!0,useShellEnvironment:!0}),this._integratedTerminalInstances.insert(r,d)}r.show(!0);const T=await r.processId;v?await new Promise(m=>setTimeout(m,1e3)):(r.state.isInteractedWith&&(r.sendText(""),await P(200)),n.getConfiguration("debug.terminal").get("clearBeforeReusing")&&(s.indexOf("powershell")>=0||s.indexOf("pwsh")>=0||s.indexOf("cmd.exe")>=0?r.sendText("cls"):s.indexOf("bash")>=0?r.sendText("clear"):f.isWindows?r.sendText("cls"):r.sendText("clear")));const b=L(s,e.args,!!e.argsCanBeInterpretedByShell,p,e.env);r.sendText(b);const E=this.onDidTerminateDebugSession(m=>{m.id===t&&(this._integratedTerminalInstances.free(r),E.dispose())});return T}else if(e.kind==="external")return K(e,await this._configurationService.getConfigProvider());return super.$runInTerminal(e,t)}};g=h([l(0,N),l(1,G),l(2,M),l(3,B),l(4,z),l(5,q),l(6,j),l(7,W),l(8,V)],g);let u;function K(a,i){if(!u)if(f.isWindows)u=new y;else if(f.isMacintosh)u=new C;else if(f.isLinux)u=new _;else throw new Error("external terminals not supported on this platform");const e=i.getConfiguration("terminal");return u.runInTerminal(a.title,a.cwd,a.args,a.env||{},e.external||{})}class x{static minUseDelay=1e3;_terminalInstances=new Map;async checkout(i,e,t=!1){const s=[...this._terminalInstances.entries()].map(([o,c])=>D(async d=>{if(o.name!==e||c.lastUsedAt!==-1&&await O(await o.processId))return null;const r=Date.now();return c.lastUsedAt+x.minUseDelay>r||d.isCancellationRequested?null:c.config!==i?(t&&o.dispose(),null):(c.lastUsedAt=r,o)}));return await A(s,o=>!!o)}insert(i,e){this._terminalInstances.set(i,{lastUsedAt:Date.now(),config:e})}free(i){const e=this._terminalInstances.get(i);e&&(e.lastUsedAt=-1)}onTerminalClosed(i){this._terminalInstances.delete(i)}}export{g as ExtHostDebugService};
