import{getActiveElement as ae,getActiveWindow as le,isHTMLElement as de}from"../../../base/browser/dom.js";import{Codicon as q}from"../../../base/common/codicons.js";import{KeyChord as pe,KeyCode as n,KeyMod as r}from"../../../base/common/keyCodes.js";import{splitRecentLabel as me}from"../../../base/common/labels.js";import{ResourceMap as S}from"../../../base/common/map.js";import{isMacintosh as ue,isWeb as H,isWindows as ke}from"../../../base/common/platform.js";import{ThemeIcon as _}from"../../../base/common/themables.js";import"../../../base/common/uri.js";import{ILanguageService as fe}from"../../../editor/common/languages/language.js";import{getIconClasses as M}from"../../../editor/common/services/getIconClasses.js";import{IModelService as ye}from"../../../editor/common/services/model.js";import{localize as t,localize2 as u}from"../../../nls.js";import{Categories as C}from"../../../platform/action/common/actionCommonCategories.js";import{Action2 as w,MenuId as k,MenuRegistry as V,registerAction2 as f}from"../../../platform/actions/common/actions.js";import{isFolderBackupInfo as z,isWorkspaceBackupInfo as ge}from"../../../platform/backup/common/backup.js";import{CommandsRegistry as we}from"../../../platform/commands/common/commands.js";import{IConfigurationService as he}from"../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as K}from"../../../platform/contextkey/common/contextkey.js";import{IsDevelopmentContext as ve,IsIOSContext as be,IsMacNativeContext as Ie,IsWebContext as Ce}from"../../../platform/contextkey/common/contextkeys.js";import{IDialogService as G}from"../../../platform/dialogs/common/dialogs.js";import{FileKind as N}from"../../../platform/files/common/files.js";import"../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as Re}from"../../../platform/keybinding/common/keybinding.js";import{KeybindingsRegistry as j,KeybindingWeight as h}from"../../../platform/keybinding/common/keybindingsRegistry.js";import{ILabelService as We,Verbosity as J}from"../../../platform/label/common/label.js";import{IQuickInputService as Se}from"../../../platform/quickinput/common/quickInput.js";import"../../../platform/window/common/window.js";import{IWorkspaceContextService as Fe}from"../../../platform/workspace/common/workspace.js";import{isRecentFolder as Q,isRecentWorkspace as X,IWorkspacesService as Oe}from"../../../platform/workspaces/common/workspaces.js";import{IsMainWindowFullscreenContext as Pe}from"../../common/contextkeys.js";import{IHostService as F}from"../../services/host/browser/host.js";import{getQuickNavigateHandler as Y,inQuickPickContext as Ae}from"../quickaccess.js";const Z="inRecentFilesPicker";class $ extends w{removeFromRecentlyOpened={iconClass:_.asClassName(q.removeClose),tooltip:t("remove","Remove from Recently Opened")};dirtyRecentlyOpenedFolder={iconClass:"dirty-workspace "+_.asClassName(q.closeDirty),tooltip:t("dirtyRecentlyOpenedFolder","Folder With Unsaved Files"),alwaysVisible:!0};dirtyRecentlyOpenedWorkspace={...this.dirtyRecentlyOpenedFolder,tooltip:t("dirtyRecentlyOpenedWorkspace","Workspace With Unsaved Files")};constructor(o){super(o)}async run(o){const c=o.get(Oe),y=o.get(Se),s=o.get(Fe),m=o.get(We),g=o.get(Re),a=o.get(ye),l=o.get(fe),i=o.get(F),v=o.get(G),d=await c.getRecentlyOpened(),R=await c.getDirtyWorkspaces();let O=!1;const L=new S,U=new S;for(const e of R)z(e)?L.set(e.folderUri,!0):(U.set(e.workspace.configPath,e.workspace),O=!0);const B=new S,T=new S;for(const e of d.workspaces)Q(e)?B.set(e.folderUri,!0):(T.set(e.workspace.configPath,e.workspace),O=!0);const b=[];for(const e of d.workspaces){const I=Q(e)?L.has(e.folderUri):U.has(e.workspace.configPath);b.push(this.toQuickPick(a,l,m,e,I))}for(const e of R)z(e)&&!B.has(e.folderUri)?b.push(this.toQuickPick(a,l,m,e,!0)):ge(e)&&!T.has(e.workspace.configPath)&&b.push(this.toQuickPick(a,l,m,e,!0));const E=d.files.map(e=>this.toQuickPick(a,l,m,e,!1)),W=d.workspaces[0],re=W&&s.isCurrentWorkspace(X(W)?W.workspace:W.folderUri);let P;const ie={type:"separator",label:O?t("workspacesAndFolders","folders & workspaces"):t("folders","folders")},ne={type:"separator",label:t("files","files")},ce=[ie,...b,ne,...E],A=await y.pick(ce,{contextKey:Z,activeItem:[...b,...E][re?1:0],placeHolder:ue?t("openRecentPlaceholderMac","Select to open (hold Cmd-key to force new window or Option-key for same window)"):t("openRecentPlaceholder","Select to open (hold Ctrl-key to force new window or Alt-key for same window)"),matchOnDescription:!0,onKeyMods:e=>P=e,quickNavigate:this.isQuickNavigate()?{keybindings:g.lookupKeybindings(this.desc.id)}:void 0,hideInput:this.isQuickNavigate(),onDidTriggerItemButton:async e=>{if(e.button===this.removeFromRecentlyOpened)await c.removeRecentlyOpened([e.item.resource]),e.removeItem();else if(e.button===this.dirtyRecentlyOpenedFolder||e.button===this.dirtyRecentlyOpenedWorkspace){const I=e.button===this.dirtyRecentlyOpenedWorkspace,{confirmed:se}=await v.confirm({title:I?t("dirtyWorkspace","Workspace with Unsaved Files"):t("dirtyFolder","Folder with Unsaved Files"),message:I?t("dirtyWorkspaceConfirm","Do you want to open the workspace to review the unsaved files?"):t("dirtyFolderConfirm","Do you want to open the folder to review the unsaved files?"),detail:I?t("dirtyWorkspaceConfirmDetail","Workspaces with unsaved files cannot be removed until all unsaved files have been saved or reverted."):t("dirtyFolderConfirmDetail","Folders with unsaved files cannot be removed until all unsaved files have been saved or reverted.")});se&&(i.openWindow([e.item.openable],{remoteAuthority:e.item.remoteAuthority||null}),y.cancel())}}});if(A)return i.openWindow([A.openable],{forceNewWindow:P?.ctrlCmd,forceReuseWindow:P?.alt,remoteAuthority:A.remoteAuthority||null})}toQuickPick(o,c,y,s,m){let g,a,l,i,v=!1;Q(s)?(i=s.folderUri,a=M(o,c,i,N.FOLDER),g={folderUri:i},l=s.label||y.getWorkspaceLabel(i,{verbose:J.LONG})):X(s)?(i=s.workspace.configPath,a=M(o,c,i,N.ROOT_FOLDER),g={workspaceUri:i},l=s.label||y.getWorkspaceLabel(s.workspace,{verbose:J.LONG}),v=!0):(i=s.fileUri,a=M(o,c,i,N.FILE),g={fileUri:i},l=s.label||y.getUriLabel(i));const{name:d,parentPath:R}=me(l);return{iconClasses:a,label:d,ariaLabel:m?v?t("recentDirtyWorkspaceAriaLabel","{0}, workspace with unsaved changes",d):t("recentDirtyFolderAriaLabel","{0}, folder with unsaved changes",d):d,description:R,buttons:m?[v?this.dirtyRecentlyOpenedWorkspace:this.dirtyRecentlyOpenedFolder]:[this.removeFromRecentlyOpened],openable:g,resource:i,remoteAuthority:s.remoteAuthority}}}class D extends ${static ID="workbench.action.openRecent";constructor(){super({id:D.ID,title:{...u("openRecent","Open Recent..."),mnemonicTitle:t({key:"miMore",comment:["&& denotes a mnemonic"]},"&&More...")},category:C.File,f1:!0,keybinding:{weight:h.WorkbenchContrib,primary:r.CtrlCmd|n.KeyR,mac:{primary:r.WinCtrl|n.KeyR}},menu:{id:k.MenubarRecentMenu,group:"y_more",order:1}})}isQuickNavigate(){return!1}}class Me extends ${constructor(){super({id:"workbench.action.quickOpenRecent",title:u("quickOpenRecent","Quick Open Recent..."),category:C.File,f1:!1})}isQuickNavigate(){return!0}}class Ke extends w{constructor(){super({id:"workbench.action.toggleFullScreen",title:{...u("toggleFullScreen","Toggle Full Screen"),mnemonicTitle:t({key:"miToggleFullScreen",comment:["&& denotes a mnemonic"]},"&&Full Screen")},category:C.View,f1:!0,keybinding:{weight:h.WorkbenchContrib,primary:n.F11,mac:{primary:r.CtrlCmd|r.WinCtrl|n.KeyF}},precondition:be.toNegated(),toggled:Pe,menu:[{id:k.MenubarAppearanceMenu,group:"1_toggle_view",order:1}]})}run(o){return o.get(F).toggleFullScreen(le())}}class x extends w{static ID="workbench.action.reloadWindow";constructor(){super({id:x.ID,title:u("reloadWindow","Reload Window"),category:C.Developer,f1:!0,keybinding:{weight:h.WorkbenchContrib+50,when:ve,primary:r.CtrlCmd|n.KeyR}})}async run(o){return o.get(F).reload()}}class Ne extends w{constructor(){super({id:"workbench.action.showAboutDialog",title:{...u("about","About"),mnemonicTitle:t({key:"miAbout",comment:["&& denotes a mnemonic"]},"&&About")},category:C.Help,f1:!0,menu:{id:k.MenubarHelpMenu,group:"z_about",order:1,when:Ie.toNegated()}})}run(o){return o.get(G).about()}}class Qe extends w{constructor(){super({id:"workbench.action.newWindow",title:{...u("newWindow","New Window"),mnemonicTitle:t({key:"miNewWindow",comment:["&& denotes a mnemonic"]},"New &&Window")},f1:!0,keybinding:{weight:h.WorkbenchContrib,primary:H?ke?pe(r.CtrlCmd|n.KeyK,r.Shift|n.KeyN):r.CtrlCmd|r.Alt|r.Shift|n.KeyN:r.CtrlCmd|r.Shift|n.KeyN,secondary:H?[r.CtrlCmd|r.Shift|n.KeyN]:void 0},menu:{id:k.MenubarFileMenu,group:"1_new",order:3}})}run(o){return o.get(F).openWindow({remoteAuthority:null})}}class De extends w{constructor(){super({id:"workbench.action.blur",title:u("blur","Remove keyboard focus from focused element")})}run(){const o=ae();de(o)&&o.blur()}}f(Qe),f(Ke),f(Me),f(D),f(x),f(Ne),f(De);const ee=K.and(Ae,K.has(Z)),oe="workbench.action.quickOpenNavigateNextInRecentFilesPicker";j.registerCommandAndKeybindingRule({id:oe,weight:h.WorkbenchContrib+50,handler:Y(oe,!0),when:ee,primary:r.CtrlCmd|n.KeyR,mac:{primary:r.WinCtrl|n.KeyR}});const te="workbench.action.quickOpenNavigatePreviousInRecentFilesPicker";j.registerCommandAndKeybindingRule({id:te,weight:h.WorkbenchContrib+50,handler:Y(te,!1),when:ee,primary:r.CtrlCmd|r.Shift|n.KeyR,mac:{primary:r.WinCtrl|r.Shift|n.KeyR}}),we.registerCommand("workbench.action.toggleConfirmBeforeClose",p=>{const o=p.get(he),c=o.inspect("window.confirmBeforeClose").userValue;return o.updateValue("window.confirmBeforeClose",c==="never"?"keyboardOnly":"never")}),V.appendMenuItem(k.MenubarFileMenu,{group:"z_ConfirmClose",command:{id:"workbench.action.toggleConfirmBeforeClose",title:t("miConfirmClose","Confirm Before Close"),toggled:K.notEquals("config.window.confirmBeforeClose","never")},order:1,when:Ce}),V.appendMenuItem(k.MenubarFileMenu,{title:t({key:"miOpenRecent",comment:["&& denotes a mnemonic"]},"Open &&Recent"),submenu:k.MenubarRecentMenu,group:"2_open",order:4});export{D as OpenRecentAction,x as ReloadWindowAction,Z as inRecentFilesPickerContextKey};
