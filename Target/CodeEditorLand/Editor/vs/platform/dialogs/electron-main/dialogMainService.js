var w=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var d=(a,e,i,r)=>{for(var o=r>1?void 0:r?D(e,i):e,t=a.length-1,c;t>=0;t--)(c=a[t])&&(o=(r?c(e,i,o):c(o))||o);return r&&o&&w(e,i,o),o},u=(a,e)=>(i,r)=>e(i,r,a);import n from"electron";import{Queue as p}from"../../../base/common/async.js";import{hash as h}from"../../../base/common/hash.js";import{mnemonicButtonLabel as m}from"../../../base/common/labels.js";import{Disposable as v,dispose as g,toDisposable as O}from"../../../base/common/lifecycle.js";import{normalizeNFC as k}from"../../../base/common/normalization.js";import{isMacintosh as f}from"../../../base/common/platform.js";import{Promises as P}from"../../../base/node/pfs.js";import{localize as l}from"../../../nls.js";import{massageMessageBoxOptions as F}from"../common/dialogs.js";import{createDecorator as S}from"../../instantiation/common/instantiation.js";import{ILogService as B}from"../../log/common/log.js";import{IProductService as y}from"../../product/common/productService.js";import{WORKSPACE_FILTER as W}from"../../workspace/common/workspace.js";const K=S("dialogMainService");let s=class{constructor(e,i){this.logService=e;this.productService=i}windowFileDialogLocks=new Map;windowDialogQueues=new Map;noWindowDialogueQueue=new p;pickFileFolder(e,i){return this.doPick({...e,pickFolders:!0,pickFiles:!0,title:l("open","Open")},i)}pickFolder(e,i){return this.doPick({...e,pickFolders:!0,title:l("openFolder","Open Folder")},i)}pickFile(e,i){return this.doPick({...e,pickFiles:!0,title:l("openFile","Open File")},i)}pickWorkspace(e,i){const r=l("openWorkspaceTitle","Open Workspace from File"),o=m(l({key:"openWorkspace",comment:["&& denotes a mnemonic"]},"&&Open")),t=W;return this.doPick({...e,pickFiles:!0,title:r,filters:t,buttonLabel:o},i)}async doPick(e,i){const r={title:e.title,buttonLabel:e.buttonLabel,filters:e.filters,defaultPath:e.defaultPath};(typeof e.pickFiles=="boolean"||typeof e.pickFolders=="boolean")&&(r.properties=void 0,e.pickFiles&&e.pickFolders&&(r.properties=["multiSelections","openDirectory","openFile","createDirectory"])),r.properties||(r.properties=["multiSelections",e.pickFolders?"openDirectory":"openFile","createDirectory"]),f&&r.properties.push("treatPackageAsDirectory");const o=await this.showOpenDialog(r,(i||n.BrowserWindow.getFocusedWindow())??void 0);if(o&&o.filePaths&&o.filePaths.length>0)return o.filePaths}getWindowDialogQueue(e){if(e){let i=this.windowDialogQueues.get(e.id);return i||(i=new p,this.windowDialogQueues.set(e.id,i)),i}else return this.noWindowDialogueQueue}showMessageBox(e,i){return this.getWindowDialogQueue(i).queue(async()=>{const{options:r,buttonIndeces:o}=F(e,this.productService);let t;return i?t=await n.dialog.showMessageBox(i,r):t=await n.dialog.showMessageBox(r),{response:o[t.response],checkboxChecked:t.checkboxChecked}})}async showSaveDialog(e,i){const r=this.acquireFileDialogLock(e,i);if(!r)return this.logService.error("[DialogMainService]: file save dialog is already or will be showing for the window with the same configuration"),{canceled:!0,filePath:""};try{return await this.getWindowDialogQueue(i).queue(async()=>{let o;return i?o=await n.dialog.showSaveDialog(i,e):o=await n.dialog.showSaveDialog(e),o.filePath=this.normalizePath(o.filePath),o})}finally{g(r)}}normalizePath(e){return e&&f&&(e=k(e)),e}normalizePaths(e){return e.map(i=>this.normalizePath(i))}async showOpenDialog(e,i){e.defaultPath&&(await P.exists(e.defaultPath)||(e.defaultPath=void 0));const r=this.acquireFileDialogLock(e,i);if(!r)return this.logService.error("[DialogMainService]: file open dialog is already or will be showing for the window with the same configuration"),{canceled:!0,filePaths:[]};try{return await this.getWindowDialogQueue(i).queue(async()=>{let o;return i?o=await n.dialog.showOpenDialog(i,e):o=await n.dialog.showOpenDialog(e),o.filePaths=this.normalizePaths(o.filePaths),o})}finally{g(r)}}acquireFileDialogLock(e,i){if(!i)return v.None;this.logService.trace("[DialogMainService]: request to acquire file dialog lock",e);let r=this.windowFileDialogLocks.get(i.id);r||(r=new Set,this.windowFileDialogLocks.set(i.id,r));const o=h(e);if(!r.has(o))return this.logService.trace("[DialogMainService]: new file dialog lock created",e),r.add(o),O(()=>{this.logService.trace("[DialogMainService]: file dialog lock disposed",e),r?.delete(o),r?.size===0&&this.windowFileDialogLocks.delete(i.id)})}};s=d([u(0,B),u(1,y)],s);export{s as DialogMainService,K as IDialogMainService};
