var z=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var B=(v,p,e,t)=>{for(var i=t>1?void 0:t?j(p,e):p,n=v.length-1,r;n>=0;n--)(r=v[n])&&(i=(t?r(p,e,i):r(i))||i);return t&&i&&z(p,e,i),i},u=(v,p)=>(e,t)=>p(e,t,v);import"./media/menubarControl.css";import{isFullscreen as X,onDidChangeFullscreen as q}from"../../../../base/browser/browser.js";import{BrowserFeatures as Y}from"../../../../base/browser/canIUse.js";import{Dimension as L,EventType as C,addDisposableListener as U}from"../../../../base/browser/dom.js";import{HorizontalDirection as _,VerticalDirection as N}from"../../../../base/browser/ui/menu/menu.js";import{MenuBar as Z}from"../../../../base/browser/ui/menu/menubar.js";import{mainWindow as k}from"../../../../base/browser/window.js";import{Action as d,ActionRunner as J,Separator as M,SubmenuAction as Q,toAction as $}from"../../../../base/common/actions.js";import{RunOnceScheduler as ee}from"../../../../base/common/async.js";import{Emitter as D}from"../../../../base/common/event.js";import{KeyCode as ie,KeyMod as te}from"../../../../base/common/keyCodes.js";import{mnemonicMenuLabel as m,unmnemonicLabel as ne}from"../../../../base/common/labels.js";import{Disposable as oe,DisposableStore as W}from"../../../../base/common/lifecycle.js";import{isIOS as re,isMacintosh as f,isNative as se,isWeb as g}from"../../../../base/common/platform.js";import{localize as a,localize2 as ae}from"../../../../nls.js";import{IAccessibilityService as ce}from"../../../../platform/accessibility/common/accessibility.js";import{isICommandActionToggleInfo as ue}from"../../../../platform/action/common/action.js";import{createAndFillInContextMenuActions as le}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as de,IMenuService as pe,MenuId as s,MenuItemAction as V,MenuRegistry as h,SubmenuItemAction as O,registerAction2 as me}from"../../../../platform/actions/common/actions.js";import{ICommandService as he}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as be}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as fe}from"../../../../platform/contextkey/common/contextkey.js";import{IsMacNativeContext as ge,IsWebContext as ve}from"../../../../platform/contextkey/common/contextkeys.js";import{IKeybindingService as Me}from"../../../../platform/keybinding/common/keybinding.js";import{KeybindingWeight as ye}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{ILabelService as Se,Verbosity as x}from"../../../../platform/label/common/label.js";import{INotificationService as Ie,Severity as Ae}from"../../../../platform/notification/common/notification.js";import{IStorageService as we,StorageScope as K,StorageTarget as Ce}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as Ue}from"../../../../platform/telemetry/common/telemetry.js";import{defaultMenuStyles as ke}from"../../../../platform/theme/browser/defaultStyles.js";import{IUpdateService as De,StateType as b}from"../../../../platform/update/common/update.js";import{TitleBarSetting as Oe,getMenuBarVisibility as H,hasNativeTitlebar as Re}from"../../../../platform/window/common/window.js";import{IWorkspacesService as Te,isRecentFolder as Ee,isRecentWorkspace as Fe}from"../../../../platform/workspaces/common/workspaces.js";import{IWorkbenchEnvironmentService as Be}from"../../../services/environment/common/environmentService.js";import{IHostService as Le}from"../../../services/host/browser/host.js";import{ActivityBarPosition as _e}from"../../../services/layout/browser/layoutService.js";import{IPreferencesService as Ne}from"../../../services/preferences/common/preferences.js";import{OpenRecentAction as We}from"../../actions/windowActions.js";h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarFileMenu,title:{value:"File",original:"File",mnemonicTitle:a({key:"mFile",comment:["&& denotes a mnemonic"]},"&&File")},order:1}),h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarEditMenu,title:{value:"Edit",original:"Edit",mnemonicTitle:a({key:"mEdit",comment:["&& denotes a mnemonic"]},"&&Edit")},order:2}),h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarSelectionMenu,title:{value:"Selection",original:"Selection",mnemonicTitle:a({key:"mSelection",comment:["&& denotes a mnemonic"]},"&&Selection")},order:3}),h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarViewMenu,title:{value:"View",original:"View",mnemonicTitle:a({key:"mView",comment:["&& denotes a mnemonic"]},"&&View")},order:4}),h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarGoMenu,title:{value:"Go",original:"Go",mnemonicTitle:a({key:"mGoto",comment:["&& denotes a mnemonic"]},"&&Go")},order:5}),h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarTerminalMenu,title:{value:"Terminal",original:"Terminal",mnemonicTitle:a({key:"mTerminal",comment:["&& denotes a mnemonic"]},"&&Terminal")},order:7}),h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarHelpMenu,title:{value:"Help",original:"Help",mnemonicTitle:a({key:"mHelp",comment:["&& denotes a mnemonic"]},"&&Help")},order:8}),h.appendMenuItem(s.MenubarMainMenu,{submenu:s.MenubarPreferencesMenu,title:{value:"Preferences",original:"Preferences",mnemonicTitle:a({key:"mPreferences",comment:["&& denotes a mnemonic"]},"Preferences")},when:ge,order:9});class A extends oe{constructor(e,t,i,n,r,o,l,c,y,R,T,E,P,F){super();this.menuService=e;this.workspacesService=t;this.contextKeyService=i;this.keybindingService=n;this.configurationService=r;this.labelService=o;this.updateService=l;this.storageService=c;this.notificationService=y;this.preferencesService=R;this.environmentService=T;this.accessibilityService=E;this.hostService=P;this.commandService=F;this.mainMenu=this._register(this.menuService.createMenu(s.MenubarMainMenu,this.contextKeyService)),this.mainMenuDisposables=this._register(new W),this.setupMainMenu(),this.menuUpdater=this._register(new ee(()=>this.doUpdateMenubar(!1),200)),this.notifyUserOfCustomMenubarAccessibility()}keys=["window.menuBarVisibility","window.enableMenuBarMnemonics","window.customMenuBarAltFocus","workbench.sideBar.location","window.nativeTabs"];mainMenu;menus={};topLevelTitles={};mainMenuDisposables;recentlyOpened={files:[],workspaces:[]};menuUpdater;static MAX_MENU_RECENT_ENTRIES=10;registerListeners(){this._register(this.hostService.onDidChangeFocus(e=>this.onDidChangeWindowFocus(e))),this._register(this.configurationService.onDidChangeConfiguration(e=>this.onConfigurationUpdated(e))),this._register(this.updateService.onStateChange(()=>this.onUpdateStateChange())),this._register(this.workspacesService.onDidChangeRecentlyOpened(()=>{this.onDidChangeRecentlyOpened()})),this._register(this.keybindingService.onDidUpdateKeybindings(()=>this.updateMenubar())),this._register(this.labelService.onDidChangeFormatters(()=>{this.onDidChangeRecentlyOpened()})),this._register(this.mainMenu.onDidChange(()=>{this.setupMainMenu(),this.doUpdateMenubar(!0)}))}setupMainMenu(){this.mainMenuDisposables.clear(),this.menus={},this.topLevelTitles={};const[,e]=this.mainMenu.getActions()[0];for(const t of e)t instanceof O&&typeof t.item.title!="string"&&(this.menus[t.item.title.original]=this.mainMenuDisposables.add(this.menuService.createMenu(t.item.submenu,this.contextKeyService,{emitEventsForSubmenuChanges:!0})),this.topLevelTitles[t.item.title.original]=t.item.title.mnemonicTitle??t.item.title.value)}updateMenubar(){this.menuUpdater.schedule()}calculateActionLabel(e){const t=e.label;switch(e.id){default:break}return t}onUpdateStateChange(){this.updateMenubar()}onUpdateKeybindings(){this.updateMenubar()}getOpenRecentActions(){if(!this.recentlyOpened)return[];const{workspaces:e,files:t}=this.recentlyOpened,i=[];if(e.length>0){for(let n=0;n<A.MAX_MENU_RECENT_ENTRIES&&n<e.length;n++)i.push(this.createOpenRecentMenuAction(e[n]));i.push(new M)}if(t.length>0){for(let n=0;n<A.MAX_MENU_RECENT_ENTRIES&&n<t.length;n++)i.push(this.createOpenRecentMenuAction(t[n]));i.push(new M)}return i}onDidChangeWindowFocus(e){e&&this.onDidChangeRecentlyOpened()}onConfigurationUpdated(e){this.keys.some(t=>e.affectsConfiguration(t))&&this.updateMenubar(),e.affectsConfiguration("editor.accessibilitySupport")&&this.notifyUserOfCustomMenubarAccessibility(),e.affectsConfiguration("window.menuBarVisibility")&&this.onDidChangeRecentlyOpened()}get menubarHidden(){return f&&se?!1:H(this.configurationService)==="hidden"}onDidChangeRecentlyOpened(){this.menubarHidden||this.workspacesService.getRecentlyOpened().then(e=>{this.recentlyOpened=e,this.updateMenubar()})}createOpenRecentMenuAction(e){let t,i,n,r;const o=e.remoteAuthority;Ee(e)?(i=e.folderUri,t=e.label||this.labelService.getWorkspaceLabel(i,{verbose:x.LONG}),n="openRecentFolder",r={folderUri:i}):Fe(e)?(i=e.workspace.configPath,t=e.label||this.labelService.getWorkspaceLabel(e.workspace,{verbose:x.LONG}),n="openRecentWorkspace",r={workspaceUri:i}):(i=e.fileUri,t=e.label||this.labelService.getUriLabel(i),n="openRecentFile",r={fileUri:i});const l=$({id:n,label:ne(t),run:c=>{const y=c&&(!f&&(c.ctrlKey||c.shiftKey)||f&&(c.metaKey||c.altKey));return this.hostService.openWindow([r],{forceNewWindow:!!y,remoteAuthority:o||null})}});return Object.assign(l,{uri:i,remoteAuthority:o})}notifyUserOfCustomMenubarAccessibility(){if(g||f)return;const e=this.storageService.getBoolean("menubar/accessibleMenubarNotified",K.APPLICATION,!1),t=!Re(this.configurationService);if(e||t||!this.accessibilityService.isScreenReaderOptimized())return;const i=a("menubar.customTitlebarAccessibilityNotification","Accessibility support is enabled for you. For the most accessible experience, we recommend the custom title bar style.");this.notificationService.prompt(Ae.Info,i,[{label:a("goToSetting","Open Settings"),run:()=>this.preferencesService.openUserSettings({query:Oe.TITLE_BAR_STYLE})}]),this.storageService.store("menubar/accessibleMenubarNotified",!0,K.APPLICATION,Ce.USER)}}let S;function Ve(){return S||(S=new D,me(class extends de{constructor(){super({id:"workbench.actions.menubar.focus",title:ae("focusMenu","Focus Application Menu"),keybinding:{primary:te.Alt|ie.F10,weight:ye.WorkbenchContrib,when:ve},f1:!0})}async run(){S?.fire()}})),S}let I=class extends A{constructor(e,t,i,n,r,o,l,c,y,R,T,E,P,F,G){super(e,t,i,n,r,o,l,c,y,R,T,E,F,G);this.telemetryService=P;this._onVisibilityChange=this._register(new D),this._onFocusStateChange=this._register(new D),this.actionRunner=this._register(new J),this.actionRunner.onDidRun(w=>{this.telemetryService.publicLog2("workbenchActionExecuted",{id:w.action.id,from:"menu"})}),this.workspacesService.getRecentlyOpened().then(w=>{this.recentlyOpened=w}),this.registerListeners()}menubar;container;alwaysOnMnemonics=!1;focusInsideMenubar=!1;pendingFirstTimeUpdate=!1;visible=!0;actionRunner;webNavigationMenu=this._register(this.menuService.createMenu(s.MenubarHomeMenu,this.contextKeyService));_onVisibilityChange;_onFocusStateChange;doUpdateMenubar(e){this.focusInsideMenubar||this.setupCustomMenubar(e),e&&(this.pendingFirstTimeUpdate=!0)}getUpdateAction(){switch(this.updateService.state.type){case b.Idle:return new d("update.check",a({key:"checkForUpdates",comment:["&& denotes a mnemonic"]},"Check for &&Updates..."),void 0,!0,()=>this.updateService.checkForUpdates(!0));case b.CheckingForUpdates:return new d("update.checking",a("checkingForUpdates","Checking for Updates..."),void 0,!1);case b.AvailableForDownload:return new d("update.downloadNow",a({key:"download now",comment:["&& denotes a mnemonic"]},"D&&ownload Update"),void 0,!0,()=>this.updateService.downloadUpdate());case b.Downloading:return new d("update.downloading",a("DownloadingUpdate","Downloading Update..."),void 0,!1);case b.Downloaded:return f?null:new d("update.install",a({key:"installUpdate...",comment:["&& denotes a mnemonic"]},"Install &&Update..."),void 0,!0,()=>this.updateService.applyUpdate());case b.Updating:return new d("update.updating",a("installingUpdate","Installing Update..."),void 0,!1);case b.Ready:return new d("update.restart",a({key:"restartToUpdate",comment:["&& denotes a mnemonic"]},"Restart to &&Update"),void 0,!0,()=>this.updateService.quitAndInstall());default:return null}}get currentMenubarVisibility(){return H(this.configurationService)}get currentDisableMenuBarAltFocus(){const e=this.configurationService.getValue("window.customMenuBarAltFocus");let t=!1;return typeof e=="boolean"&&(t=!e),t}insertActionsBefore(e,t){switch(e.id){case We.ID:t.push(...this.getOpenRecentActions());break;case"workbench.action.showAboutDialog":if(!f&&!g){const i=this.getUpdateAction();i&&(i.label=m(i.label),t.push(i),t.push(new M))}break;default:break}}get currentEnableMenuBarMnemonics(){let e=this.configurationService.getValue("window.enableMenuBarMnemonics");return typeof e!="boolean"&&(e=!0),e&&(!g||X(k))}get currentCompactMenuMode(){if(this.currentMenubarVisibility!=="compact")return;const t=this.configurationService.getValue("workbench.sideBar.location")==="right"?_.Left:_.Right,n=this.configurationService.getValue("workbench.activityBar.location")===_e.BOTTOM?N.Above:N.Below;return{horizontal:t,vertical:n}}onDidVisibilityChange(e){this.visible=e,this.onDidChangeRecentlyOpened(),this._onVisibilityChange.fire(e)}toActionsArray(e){const t=[];return le(e,{shouldForwardArgs:!0},t),t}reinstallDisposables=this._register(new W);setupCustomMenubar(e){if(!this.container)return;e?(this.menubar&&this.reinstallDisposables.clear(),this.menubar=this.reinstallDisposables.add(new Z(this.container,this.getMenuBarOptions(),ke)),this.accessibilityService.alwaysUnderlineAccessKeys().then(i=>{this.alwaysOnMnemonics=i,this.menubar?.update(this.getMenuBarOptions())}),this.reinstallDisposables.add(this.menubar.onFocusStateChange(i=>{this._onFocusStateChange.fire(i),i||(this.pendingFirstTimeUpdate?(this.setupCustomMenubar(!0),this.pendingFirstTimeUpdate=!1):this.updateMenubar(),this.focusInsideMenubar=!1)})),this.reinstallDisposables.add(this.menubar.onVisibilityChange(i=>this.onDidVisibilityChange(i))),this.reinstallDisposables.add(U(this.container,C.FOCUS_IN,()=>{this.focusInsideMenubar=!0})),this.reinstallDisposables.add(U(this.container,C.FOCUS_OUT,()=>{this.focusInsideMenubar=!1})),this.menubar.isVisible&&this.onDidVisibilityChange(!0)):this.menubar?.update(this.getMenuBarOptions());const t=(i,n,r)=>{n.splice(0);for(const o of i)if(this.insertActionsBefore(o,n),o instanceof M)n.push(o);else if(o instanceof O||o instanceof V){let l=typeof o.item.title=="string"?o.item.title:o.item.title.mnemonicTitle??o.item.title.value;if(o instanceof O){const c=[];t(o.actions,c,r),c.length>0&&n.push(new Q(o.id,m(l),c))}else{ue(o.item.toggled)&&(l=o.item.toggled.mnemonicTitle??o.item.toggled.title??l);const c=new d(o.id,m(l),o.class,o.enabled,()=>this.commandService.executeCommand(o.id));c.tooltip=o.tooltip,c.checked=o.checked,n.push(c)}}if(r==="File"&&this.currentCompactMenuMode===void 0){const o=this.getWebNavigationActions();o.length&&n.push(...o)}};for(const i of Object.keys(this.topLevelTitles)){const n=this.menus[i];e&&n&&(this.reinstallDisposables.add(n.onDidChange(()=>{if(!this.focusInsideMenubar){const o=[];t(this.toActionsArray(n),o,i),this.menubar?.updateMenu({actions:o,label:m(this.topLevelTitles[i])})}})),n===this.menus.File&&this.reinstallDisposables.add(this.webNavigationMenu.onDidChange(()=>{if(!this.focusInsideMenubar){const o=[];t(this.toActionsArray(n),o,i),this.menubar?.updateMenu({actions:o,label:m(this.topLevelTitles[i])})}})));const r=[];n&&t(this.toActionsArray(n),r,i),this.menubar&&(e?this.menubar.push({actions:r,label:m(this.topLevelTitles[i])}):this.menubar.updateMenu({actions:r,label:m(this.topLevelTitles[i])}))}}getWebNavigationActions(){if(!g)return[];const e=[];for(const t of this.webNavigationMenu.getActions()){const[,i]=t;for(const n of i)if(n instanceof V){const r=typeof n.item.title=="string"?n.item.title:n.item.title.mnemonicTitle??n.item.title.value;e.push(new d(n.id,m(r),n.class,n.enabled,async o=>{this.commandService.executeCommand(n.id,o)}))}e.push(new M)}return e.length&&e.pop(),e}getMenuBarOptions(){return{enableMnemonics:this.currentEnableMenuBarMnemonics,disableAltFocus:this.currentDisableMenuBarAltFocus,visibility:this.currentMenubarVisibility,actionRunner:this.actionRunner,getKeybinding:e=>this.keybindingService.lookupKeybinding(e.id),alwaysOnMnemonics:this.alwaysOnMnemonics,compactMode:this.currentCompactMenuMode,getCompactMenuActions:()=>g?this.getWebNavigationActions():[]}}onDidChangeWindowFocus(e){this.visible&&(super.onDidChangeWindowFocus(e),this.container&&(e?this.container.classList.remove("inactive"):(this.container.classList.add("inactive"),this.menubar?.blur())))}onUpdateStateChange(){this.visible&&super.onUpdateStateChange()}onDidChangeRecentlyOpened(){this.visible&&super.onDidChangeRecentlyOpened()}onUpdateKeybindings(){this.visible&&super.onUpdateKeybindings()}registerListeners(){super.registerListeners(),this._register(U(k,C.RESIZE,()=>{this.menubar&&!(re&&Y.pointerEvents)&&this.menubar.blur()})),g&&(this._register(q(e=>{e===k.vscodeWindowId&&this.updateMenubar()})),this._register(this.webNavigationMenu.onDidChange(()=>this.updateMenubar())),this._register(Ve().event(()=>this.menubar?.toggleFocus())))}get onVisibilityChange(){return this._onVisibilityChange.event}get onFocusStateChange(){return this._onFocusStateChange.event}getMenubarItemsDimensions(){return this.menubar?new L(this.menubar.getWidth(),this.menubar.getHeight()):new L(0,0)}create(e){return this.container=e,this.container&&this.doUpdateMenubar(!0),this.container}layout(e){this.menubar?.update(this.getMenuBarOptions())}toggleFocus(){this.menubar?.toggleFocus()}};I=B([u(0,pe),u(1,Te),u(2,fe),u(3,Me),u(4,be),u(5,Se),u(6,De),u(7,we),u(8,Ie),u(9,Ne),u(10,Be),u(11,ce),u(12,Ue),u(13,Le),u(14,he)],I);export{I as CustomMenubarControl,A as MenubarControl};
