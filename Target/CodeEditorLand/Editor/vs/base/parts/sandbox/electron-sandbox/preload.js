(()=>{const{ipcRenderer:o,webFrame:s,contextBridge:u,webUtils:v}=require("electron");function t(e){if(!e||!e.startsWith("vscode:"))throw new Error(`Unsupported event IPC channel '${e}'`);return!0}function d(e){for(const r of process.argv)if(r.indexOf(`--${e}=`)===0)return r.split("=")[1]}let n;const i=(async()=>{const e=d("vscode-window-config");if(!e)throw new Error("Preload: did not find expected vscode-window-config in renderer process arguments list.");try{t(e);const r=n=await o.invoke(e);return Object.assign(process.env,r.userEnv),s.setZoomLevel(r.zoomLevel??0),r}catch(r){throw new Error(`Preload: unable to fetch vscode-window-config: ${r}`)}})(),f=(async()=>{const[e,r]=await Promise.all([(async()=>(await i).userEnv)(),o.invoke("vscode:fetchShellEnv")]);return{...process.env,...r,...e}})(),c={ipcRenderer:{send(e,...r){t(e)&&o.send(e,...r)},invoke(e,...r){return t(e),o.invoke(e,...r)},on(e,r){return t(e),o.on(e,r),this},once(e,r){return t(e),o.once(e,r),this},removeListener(e,r){return t(e),o.removeListener(e,r),this}},ipcMessagePort:{acquire(e,r){if(t(e)){const a=(p,l)=>{r===l&&(o.off(e,a),window.postMessage(r,"*",p.ports))};o.on(e,a)}}},webFrame:{setZoomLevel(e){typeof e=="number"&&s.setZoomLevel(e)}},webUtils:{getPathForFile(e){return v.getPathForFile(e)}},process:{get platform(){return process.platform},get arch(){return process.arch},get env(){return{...process.env}},get versions(){return process.versions},get type(){return"renderer"},get execPath(){return process.execPath},cwd(){return process.env.VSCODE_CWD||process.execPath.substr(0,process.execPath.lastIndexOf(process.platform==="win32"?"\\":"/"))},shellEnv(){return f},getProcessMemoryInfo(){return process.getProcessMemoryInfo()},on(e,r){process.on(e,r)}},context:{configuration(){return n},async resolveConfiguration(){return i}}};if(process.contextIsolated)try{u.exposeInMainWorld("vscode",c)}catch{}else window.vscode=c})();
