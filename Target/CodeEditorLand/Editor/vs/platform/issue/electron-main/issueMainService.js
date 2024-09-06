var g=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var u=(p,e,t,r)=>{for(var o=r>1?void 0:r?f(e,t):e,n=p.length-1,i;n>=0;n--)(i=p[n])&&(o=(r?i(e,t,o):i(o))||o);return r&&o&&g(e,t,o),o},a=(p,e)=>(t,r)=>e(t,r,p);import{arch as W,release as y,type as R}from"os";import{BrowserWindow as h,screen as c}from"electron";import{isESM as S}from"../../../../vs/base/common/amd.js";import{raceTimeout as b}from"../../../../vs/base/common/async.js";import{CancellationTokenSource as I}from"../../../../vs/base/common/cancellation.js";import{DisposableStore as C}from"../../../../vs/base/common/lifecycle.js";import{FileAccess as m}from"../../../../vs/base/common/network.js";import{isMacintosh as M}from"../../../../vs/base/common/platform.js";import{validatedIpcMain as P}from"../../../../vs/base/parts/ipc/electron-main/ipcMain.js";import{getNLSLanguage as D,getNLSMessages as O,localize as d}from"../../../../vs/nls.js";import{ICSSDevelopmentService as x}from"../../../../vs/platform/cssDev/node/cssDevService.js";import{IDialogMainService as B}from"../../../../vs/platform/dialogs/electron-main/dialogMainService.js";import{IEnvironmentMainService as E}from"../../../../vs/platform/environment/electron-main/environmentMainService.js";import"../../../../vs/platform/issue/common/issue.js";import{ILogService as k}from"../../../../vs/platform/log/common/log.js";import{INativeHostMainService as L}from"../../../../vs/platform/native/electron-main/nativeHostMainService.js";import T from"../../../../vs/platform/product/common/product.js";import{IProtocolMainService as U}from"../../../../vs/platform/protocol/electron-main/protocol.js";import{zoomLevelToZoomFactor as $}from"../../../../vs/platform/window/common/window.js";import"../../../../vs/platform/window/electron-main/window.js";import{IWindowsMainService as z}from"../../../../vs/platform/windows/electron-main/windows.js";let l=class{constructor(e,t,r,o,n,i,s,w){this.userEnv=e;this.environmentMainService=t;this.logService=r;this.dialogMainService=o;this.nativeHostMainService=n;this.protocolMainService=i;this.windowsMainService=s;this.cssDevelopmentService=w}static DEFAULT_BACKGROUND_COLOR="#1E1E1E";issueReporterWindow=null;issueReporterParentWindow=null;async openReporter(e){if(this.issueReporterWindow)this.issueReporterWindow&&this.focusWindow(this.issueReporterWindow);else if(this.issueReporterParentWindow=h.getFocusedWindow(),this.issueReporterParentWindow){const t=new C,r=t.add(this.protocolMainService.createIPCObjectUrl()),o=this.getWindowPosition(this.issueReporterParentWindow,700,800);this.issueReporterWindow=this.createBrowserWindow(o,r,{backgroundColor:e.styles.backgroundColor,title:d("issueReporter","Issue Reporter"),zoomLevel:e.zoomLevel,alwaysOnTop:!1},"issue-reporter"),r.update({appRoot:this.environmentMainService.appRoot,windowId:this.issueReporterWindow.id,userEnv:this.userEnv,data:e,disableExtensions:!!this.environmentMainService.disableExtensions,os:{type:R(),arch:W(),release:y()},product:T,nls:{messages:O(),language:D()},cssModules:this.cssDevelopmentService.isEnabled?await this.cssDevelopmentService.getCssModules():void 0}),this.issueReporterWindow.loadURL(m.asBrowserUri(`vs/workbench/contrib/issue/electron-sandbox/issueReporter${this.environmentMainService.isBuilt?"":"-dev"}.${S?"esm.":""}html`).toString(!0)),this.issueReporterWindow.on("close",()=>{this.issueReporterWindow=null,t.dispose()}),this.issueReporterParentWindow.on("closed",()=>{this.issueReporterWindow&&(this.issueReporterWindow.close(),this.issueReporterWindow=null,t.dispose())})}}async $reloadWithExtensionsDisabled(){if(this.issueReporterParentWindow)try{await this.nativeHostMainService.reload(this.issueReporterParentWindow.id,{disableExtensions:!0})}catch(e){this.logService.error(e)}}async $showConfirmCloseDialog(){if(this.issueReporterWindow){const{response:e}=await this.dialogMainService.showMessageBox({type:"warning",message:d("confirmCloseIssueReporter","Your input will not be saved. Are you sure you want to close this window?"),buttons:[d({key:"yes",comment:["&& denotes a mnemonic"]},"&&Yes"),d("cancel","Cancel")]},this.issueReporterWindow);e===0&&this.issueReporterWindow&&(this.issueReporterWindow.destroy(),this.issueReporterWindow=null)}}async $showClipboardDialog(){if(this.issueReporterWindow){const{response:e}=await this.dialogMainService.showMessageBox({type:"warning",message:d("issueReporterWriteToClipboard","There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."),buttons:[d({key:"ok",comment:["&& denotes a mnemonic"]},"&&OK"),d("cancel","Cancel")]},this.issueReporterWindow);return e===0}return!1}issueReporterWindowCheck(){if(!this.issueReporterParentWindow)throw new Error("Issue reporter window not available");const e=this.windowsMainService.getWindowById(this.issueReporterParentWindow.id);if(!e)throw new Error("Window not found");return e}async $sendReporterMenu(e,t){const r=this.issueReporterWindowCheck(),o="vscode:triggerReporterMenu",n=new I;return r.sendWhenReady(o,n.token,{replyChannel:o,extensionId:e,extensionName:t}),await b(new Promise(s=>P.once(`vscode:triggerReporterMenuResponse:${e}`,(w,v)=>s(v))),5e3,()=>{this.logService.error(`Error: Extension ${e} timed out waiting for menu response`),n.cancel()})}async $closeReporter(){this.issueReporterWindow?.close()}focusWindow(e){e.isMinimized()&&e.restore(),e.focus()}createBrowserWindow(e,t,r,o){const n=new h({fullscreen:!1,skipTaskbar:!1,resizable:!0,width:e.width,height:e.height,minWidth:300,minHeight:200,x:e.x,y:e.y,title:r.title,backgroundColor:r.backgroundColor||l.DEFAULT_BACKGROUND_COLOR,webPreferences:{preload:m.asFileUri("vs/base/parts/sandbox/electron-sandbox/preload.js").fsPath,additionalArguments:[`--vscode-window-config=${t.resource.toString()}`],v8CacheOptions:this.environmentMainService.useCodeCache?"bypassHeatCheck":"none",enableWebSQL:!1,spellcheck:!1,zoomFactor:$(r.zoomLevel),sandbox:!0},alwaysOnTop:r.alwaysOnTop,experimentalDarkMode:!0});return n.setMenuBarVisibility(!1),n}getWindowPosition(e,t,r){let o;const n=c.getAllDisplays();if(n.length===1)o=n[0];else{if(M){const w=c.getCursorScreenPoint();o=c.getDisplayNearestPoint(w)}!o&&e&&(o=c.getDisplayMatching(e.getBounds())),o||(o=c.getPrimaryDisplay()||n[0])}const i=o.bounds,s={width:t,height:r,x:i.x+i.width/2-t/2,y:i.y+i.height/2-r/2};return i.width>0&&i.height>0&&(s.x<i.x&&(s.x=i.x),s.y<i.y&&(s.y=i.y),s.x>i.x+i.width&&(s.x=i.x),s.y>i.y+i.height&&(s.y=i.y),s.width>i.width&&(s.width=i.width),s.height>i.height&&(s.height=i.height)),s}};l=u([a(1,E),a(2,k),a(3,B),a(4,L),a(5,U),a(6,z),a(7,x)],l);export{l as IssueMainService};
