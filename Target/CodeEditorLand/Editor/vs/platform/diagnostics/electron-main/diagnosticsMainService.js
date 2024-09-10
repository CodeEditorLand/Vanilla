var f=Object.defineProperty;var l=Object.getOwnPropertyDescriptor;var g=(r,e,s,o)=>{for(var i=o>1?void 0:o?l(e,s):e,n=r.length-1,t;n>=0;n--)(t=r[n])&&(i=(o?t(e,s,i):t(i))||i);return o&&i&&f(e,s,i),i},a=(r,e)=>(s,o)=>e(s,o,r);import{app as m,BrowserWindow as D}from"electron";import{validatedIpcMain as u}from"../../../base/parts/ipc/electron-main/ipcMain.js";import{CancellationToken as w}from"../../../base/common/cancellation.js";import{createDecorator as v}from"../../instantiation/common/instantiation.js";import{IWindowsMainService as W}from"../../windows/electron-main/windows.js";import{isSingleFolderWorkspaceIdentifier as R,isWorkspaceIdentifier as h}from"../../workspace/common/workspace.js";import{IWorkspacesManagementMainService as M}from"../../workspaces/electron-main/workspacesManagementMainService.js";import{assertIsDefined as P}from"../../../base/common/types.js";import{ILogService as S}from"../../log/common/log.js";import{UtilityProcess as y}from"../../utilityProcess/electron-main/utilityProcess.js";const k="diagnosticsMainService",Z=v(k);let c=class{constructor(e,s,o){this.windowsMainService=e;this.workspacesManagementMainService=s;this.logService=o}async getRemoteDiagnostics(e){const s=this.windowsMainService.getWindows();return(await Promise.all(s.map(async i=>{const n=i.remoteAuthority;if(!n)return;const t=`vscode:getDiagnosticInfoResponse${i.id}`,p={includeProcesses:e.includeProcesses,folders:e.includeWorkspaceMetadata?await this.getFolderURIs(i):void 0};return new Promise(d=>{i.sendWhenReady("vscode:getDiagnosticInfo",w.None,{replyChannel:t,args:p}),u.once(t,(U,I)=>{I||d({hostName:n,errorMessage:`Unable to resolve connection to '${n}'.`}),d(I)}),setTimeout(()=>{d({hostName:n,errorMessage:`Connection to '${n}' could not be established`})},5e3)})}))).filter(i=>!!i)}async getMainDiagnostics(){this.logService.trace("Received request for main process info from other instance.");const e=[];for(const o of D.getAllWindows()){const i=this.windowsMainService.getWindowById(o.id);i?e.push(await this.codeWindowToInfo(i)):e.push(this.browserWindowToInfo(o))}const s=[];for(const{pid:o,name:i}of y.getAll())s.push({pid:o,name:i});return{mainPID:process.pid,mainArguments:process.argv.slice(1),windows:e,pidToNames:s,screenReader:!!m.accessibilitySupportEnabled,gpuFeatureStatus:m.getGPUFeatureStatus()}}async codeWindowToInfo(e){const s=await this.getFolderURIs(e),o=P(e.win);return this.browserWindowToInfo(o,s,e.remoteAuthority)}browserWindowToInfo(e,s=[],o){return{id:e.id,pid:e.webContents.getOSProcessId(),title:e.getTitle(),folderURIs:s,remoteAuthority:o}}async getFolderURIs(e){const s=[],o=e.openedWorkspace;if(R(o))s.push(o.uri);else if(h(o)){const i=await this.workspacesManagementMainService.resolveLocalWorkspace(o.configPath);i&&i.folders.forEach(t=>{s.push(t.uri)})}return s}};c=g([a(0,W),a(1,M),a(2,S)],c);export{c as DiagnosticsMainService,k as ID,Z as IDiagnosticsMainService};
