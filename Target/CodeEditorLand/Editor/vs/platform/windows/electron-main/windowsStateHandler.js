var P=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var y=(n,s,e,t)=>{for(var i=t>1?void 0:t?A(s,e):s,r=n.length-1,o;r>=0;r--)(o=n[r])&&(i=(t?o(s,e,i):o(i))||i);return t&&i&&P(s,e,i),i},p=(n,s)=>(e,t)=>s(e,t,n);import f from"electron";import{Disposable as x}from"../../../base/common/lifecycle.js";import{isMacintosh as S}from"../../../base/common/platform.js";import{extUriBiasedIgnorePathCase as D}from"../../../base/common/resources.js";import{URI as k}from"../../../base/common/uri.js";import{IConfigurationService as C}from"../../configuration/common/configuration.js";import{ILifecycleMainService as M}from"../../lifecycle/electron-main/lifecycleMainService.js";import{ILogService as b}from"../../log/common/log.js";import{IStateService as H}from"../../state/node/state.js";import{WindowMode as l,defaultWindowState as U}from"../../window/electron-main/window.js";import{isSingleFolderWorkspaceIdentifier as h,isWorkspaceIdentifier as v}from"../../workspace/common/workspace.js";import{IWindowsMainService as F}from"./windows.js";let u=class extends x{constructor(e,t,i,r,o){super();this.windowsMainService=e;this.stateService=t;this.lifecycleMainService=i;this.logService=r;this.configurationService=o;this.registerListeners()}static windowsStateStorageKey="windowsState";get state(){return this._state}_state=N(this.stateService.getItem(u.windowsStateStorageKey));lastClosedState=void 0;shuttingDown=!1;registerListeners(){f.app.on("browser-window-blur",()=>{this.shuttingDown||this.saveWindowsState()}),this._register(this.lifecycleMainService.onBeforeCloseWindow(e=>this.onBeforeCloseWindow(e))),this._register(this.lifecycleMainService.onBeforeShutdown(()=>this.onBeforeShutdown())),this._register(this.windowsMainService.onDidChangeWindowsCount(e=>{e.newCount-e.oldCount>0&&(this.lastClosedState=void 0)})),this._register(this.windowsMainService.onDidDestroyWindow(e=>this.onBeforeCloseWindow(e)))}onBeforeShutdown(){this.shuttingDown=!0,this.saveWindowsState()}saveWindowsState(){const e=new Set,t={openedWindows:[],lastPluginDevelopmentHostWindow:this._state.lastPluginDevelopmentHostWindow,lastActiveWindow:this.lastClosedState};if(!t.lastActiveWindow){let o=this.windowsMainService.getLastActiveWindow();(!o||o.isExtensionDevelopmentHost)&&(o=this.windowsMainService.getWindows().find(a=>!a.isExtensionDevelopmentHost)),o&&(t.lastActiveWindow=this.toWindowState(o),t.lastActiveWindow.uiState.mode===l.Fullscreen&&e.add(t.lastActiveWindow.uiState.display))}const i=this.windowsMainService.getWindows().find(o=>o.isExtensionDevelopmentHost&&!o.isExtensionTestHost);i&&(t.lastPluginDevelopmentHostWindow=this.toWindowState(i),t.lastPluginDevelopmentHostWindow.uiState.mode===l.Fullscreen&&(e.has(t.lastPluginDevelopmentHostWindow.uiState.display)?S&&!i.win?.isSimpleFullScreen()&&(t.lastPluginDevelopmentHostWindow.uiState.mode=l.Normal):e.add(t.lastPluginDevelopmentHostWindow.uiState.display))),this.windowsMainService.getWindowCount()>1&&(t.openedWindows=this.windowsMainService.getWindows().filter(o=>!o.isExtensionDevelopmentHost).map(o=>{const a=this.toWindowState(o);return a.uiState.mode===l.Fullscreen&&(e.has(a.uiState.display)?S&&a.windowId!==t.lastActiveWindow?.windowId&&!o.win?.isSimpleFullScreen()&&(a.uiState.mode=l.Normal):e.add(a.uiState.display)),a}));const r=z(t);this.stateService.setItem(u.windowsStateStorageKey,r),this.shuttingDown&&this.logService.trace("[WindowsStateHandler] onBeforeShutdown",r)}onBeforeCloseWindow(e){if(this.lifecycleMainService.quitRequested)return;const t=this.toWindowState(e);e.isExtensionDevelopmentHost&&!e.isExtensionTestHost?this._state.lastPluginDevelopmentHostWindow=t:!e.isExtensionDevelopmentHost&&e.openedWorkspace&&this._state.openedWindows.forEach(i=>{const r=v(e.openedWorkspace)&&i.workspace?.id===e.openedWorkspace.id,o=h(e.openedWorkspace)&&i.folderUri&&D.isEqual(i.folderUri,e.openedWorkspace.uri);(r||o)&&(i.uiState=t.uiState)}),this.windowsMainService.getWindowCount()===1&&(this.lastClosedState=t)}toWindowState(e){return{windowId:e.id,workspace:v(e.openedWorkspace)?e.openedWorkspace:void 0,folderUri:h(e.openedWorkspace)?e.openedWorkspace.uri:void 0,backupPath:e.backupPath,remoteAuthority:e.remoteAuthority,uiState:e.serializeWindowState()}}getNewWindowState(e){const t=this.doGetNewWindowState(e),i=this.configurationService.getValue("window");if(t.mode===l.Fullscreen){let r;t.hasDefaultState?r=!!(i?.newWindowDimensions&&["fullscreen","inherit","offset"].indexOf(i.newWindowDimensions)>=0):r=!!(this.lifecycleMainService.wasRestarted||i?.restoreFullscreen),r||(t.mode=l.Normal)}return t}doGetNewWindowState(e){const t=this.windowsMainService.getLastActiveWindow();if(!e.extensionTestsPath){if(e.extensionDevelopmentPath&&this.state.lastPluginDevelopmentHostWindow)return this.state.lastPluginDevelopmentHostWindow.uiState;const c=e.workspace;if(v(c)){const w=this.state.openedWindows.filter(d=>d.workspace&&d.workspace.id===c.id).map(d=>d.uiState);if(w.length)return w[0]}if(h(c)){const w=this.state.openedWindows.filter(d=>d.folderUri&&D.isEqual(d.folderUri,c.uri)).map(d=>d.uiState);if(w.length)return w[0]}else if(e.backupPath){const w=this.state.openedWindows.filter(d=>d.backupPath===e.backupPath).map(d=>d.uiState);if(w.length)return w[0]}const I=this.lastClosedState||this.state.lastActiveWindow;if(!t&&I)return I.uiState}let i;const r=f.screen.getAllDisplays();if(r.length===1)i=r[0];else{if(S){const c=f.screen.getCursorScreenPoint();i=f.screen.getDisplayNearestPoint(c)}!i&&t&&(i=f.screen.getDisplayMatching(t.getBounds())),i||(i=f.screen.getPrimaryDisplay()||r[0])}let o=U();o.x=Math.round(i.bounds.x+i.bounds.width/2-o.width/2),o.y=Math.round(i.bounds.y+i.bounds.height/2-o.height/2);const a=this.configurationService.getValue("window");let W=!0;if(a?.newWindowDimensions){if(a.newWindowDimensions==="maximized")o.mode=l.Maximized,W=!1;else if(a.newWindowDimensions==="fullscreen")o.mode=l.Fullscreen,W=!1;else if((a.newWindowDimensions==="inherit"||a.newWindowDimensions==="offset")&&t){const c=t.serializeWindowState();c.mode===l.Fullscreen?o.mode=l.Fullscreen:o={...c,zoomLevel:void 0},W=o.mode!==l.Fullscreen&&a.newWindowDimensions==="offset"}}return W&&(o=this.ensureNoOverlap(o)),o.hasDefaultState=!0,o}ensureNoOverlap(e){if(this.windowsMainService.getWindows().length===0)return e;e.x=typeof e.x=="number"?e.x:0,e.y=typeof e.y=="number"?e.y:0;const t=this.windowsMainService.getWindows().map(i=>i.getBounds());for(;t.some(i=>i.x===e.x||i.y===e.y);)e.x+=30,e.y+=30;return e}};u=y([p(0,F),p(1,H),p(2,M),p(3,b),p(4,C)],u);function N(n){const s={openedWindows:[]},e=n||{openedWindows:[]};return e.lastActiveWindow&&(s.lastActiveWindow=m(e.lastActiveWindow)),e.lastPluginDevelopmentHostWindow&&(s.lastPluginDevelopmentHostWindow=m(e.lastPluginDevelopmentHostWindow)),Array.isArray(e.openedWindows)&&(s.openedWindows=e.openedWindows.map(t=>m(t))),s}function m(n){const s={uiState:n.uiState};return n.backupPath&&(s.backupPath=n.backupPath),n.remoteAuthority&&(s.remoteAuthority=n.remoteAuthority),n.folder&&(s.folderUri=k.parse(n.folder)),n.workspaceIdentifier&&(s.workspace={id:n.workspaceIdentifier.id,configPath:k.parse(n.workspaceIdentifier.configURIPath)}),s}function z(n){return{lastActiveWindow:n.lastActiveWindow&&g(n.lastActiveWindow),lastPluginDevelopmentHostWindow:n.lastPluginDevelopmentHostWindow&&g(n.lastPluginDevelopmentHostWindow),openedWindows:n.openedWindows.map(s=>g(s))}}function g(n){return{workspaceIdentifier:n.workspace&&{id:n.workspace.id,configURIPath:n.workspace.configPath.toString()},folder:n.folderUri&&n.folderUri.toString(),backupPath:n.backupPath,remoteAuthority:n.remoteAuthority,uiState:n.uiState}}export{u as WindowsStateHandler,z as getWindowsStateStoreData,N as restoreWindowsState};
