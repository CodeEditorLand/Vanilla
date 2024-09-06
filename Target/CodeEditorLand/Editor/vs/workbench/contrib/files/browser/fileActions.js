var Oe=Object.defineProperty;var Te=Object.getOwnPropertyDescriptor;var W=(e,t,r,i)=>{for(var n=i>1?void 0:i?Te(t,r):t,d=e.length-1,a;d>=0;d--)(a=e[d])&&(n=(i?a(t,r,n):a(n))||n);return i&&n&&Oe(t,r,n),n},F=(e,t)=>(r,i)=>t(r,i,e);import{triggerUpload as Ue}from"../../../../base/browser/dom.js";import{Action as me}from"../../../../base/common/actions.js";import{coalesce as X}from"../../../../base/common/arrays.js";import{timeout as We}from"../../../../base/common/async.js";import{VSBuffer as _e}from"../../../../base/common/buffer.js";import{Codicon as ge}from"../../../../base/common/codicons.js";import{toErrorMessage as Q}from"../../../../base/common/errorMessage.js";import{getErrorMessage as $e}from"../../../../base/common/errors.js";import{KeyChord as Ve,KeyCode as ye,KeyMod as He}from"../../../../base/common/keyCodes.js";import{dispose as he}from"../../../../base/common/lifecycle.js";import{Schemas as Ye}from"../../../../base/common/network.js";import{basename as Z,extname as Ge,isAbsolute as Ke}from"../../../../base/common/path.js";import{isWindows as J,OS as ve}from"../../../../base/common/platform.js";import*as b from"../../../../base/common/resources.js";import{rtrim as we,trim as je}from"../../../../base/common/strings.js";import{ThemeIcon as Se}from"../../../../base/common/themables.js";import{Constants as Ie}from"../../../../base/common/uint.js";import{URI as ee}from"../../../../base/common/uri.js";import{ResourceFileEdit as B}from"../../../../editor/browser/services/bulkEditService.js";import{ILanguageService as qe}from"../../../../editor/common/languages/language.js";import"../../../../editor/common/model.js";import{IModelService as Xe}from"../../../../editor/common/services/model.js";import{ITextModelService as xe}from"../../../../editor/common/services/resolverService.js";import*as o from"../../../../nls.js";import"../../../../platform/action/common/action.js";import{Categories as L}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as C}from"../../../../platform/actions/common/actions.js";import{IClipboardService as Ee}from"../../../../platform/clipboard/common/clipboardService.js";import{CommandsRegistry as _,ICommandService as $}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as N}from"../../../../platform/configuration/common/configuration.js";import{RawContextKey as Qe}from"../../../../platform/contextkey/common/contextkey.js";import{getFileNamesMessage as z,IDialogService as V}from"../../../../platform/dialogs/common/dialogs.js";import{IFileService as H}from"../../../../platform/files/common/files.js";import{IInstantiationService as te}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as Ze}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{INotificationService as P,Severity as k}from"../../../../platform/notification/common/notification.js";import{IQuickInputService as Je,ItemActivation as et}from"../../../../platform/quickinput/common/quickInput.js";import{IUriIdentityService as tt}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{CLOSE_EDITORS_AND_GROUP_COMMAND_ID as rt}from"../../../browser/parts/editor/editorCommands.js";import{ActiveEditorCanToggleReadonlyContext as ot,ActiveEditorContext as it,EmptyWorkspaceSupportContext as nt}from"../../../common/contextkeys.js";import{EditorResourceAccessor as O,SideBySideEditor as Y}from"../../../common/editor.js";import{ViewContainerLocation as at}from"../../../common/views.js";import{IEditorService as A}from"../../../services/editor/common/editorService.js";import{IFilesConfigurationService as re}from"../../../services/filesConfiguration/common/filesConfigurationService.js";import{IHostService as be}from"../../../services/host/browser/host.js";import{IPaneCompositePartService as st}from"../../../services/panecomposite/browser/panecomposite.js";import{IPathService as De}from"../../../services/path/common/pathService.js";import{IRemoteAgentService as Ae}from"../../../services/remote/common/remoteAgentService.js";import{IViewsService as lt}from"../../../services/views/common/viewsService.js";import"../../../services/workingCopy/common/workingCopy.js";import{IWorkingCopyFileService as Fe}from"../../../services/workingCopy/common/workingCopyFileService.js";import{IWorkingCopyService as ct}from"../../../services/workingCopy/common/workingCopyService.js";import{NewExplorerItem as dt}from"../common/explorerModel.js";import{UndoConfirmLevel as G,VIEW_ID as Le,VIEWLET_ID as pt}from"../common/files.js";import{NEW_UNTITLED_FILE_COMMAND_ID as ut,REVEAL_IN_EXPLORER_COMMAND_ID as ft,SAVE_ALL_IN_GROUP_COMMAND_ID as mt}from"./fileConstants.js";import{BrowserFileUpload as gt,FileDownload as yt}from"./fileImportExport.js";import{IExplorerService as D}from"./files.js";const ht="explorer.newFile",Hr=o.localize2("newFile","New File..."),vt="explorer.newFolder",Yr=o.localize2("newFolder","New Folder..."),Gr=o.localize("rename","Rename..."),Kr=o.localize("delete","Delete"),jr=o.localize("copyFile","Copy"),qr=o.localize("pasteFile","Paste"),Xr=new Qe("fileCopied",!1),wt="explorer.download",Qr=o.localize("download","Download..."),St="explorer.upload",Zr=o.localize("upload","Upload..."),Ce="explorer.confirmDelete",It=5e6;function ze(e,t){t.message==="string"&&(t=t.message),e.error(Q(t,!1))}async function ke(e,t){e&&(e.indexOf("/")>=0||e.indexOf("\\")>=0)&&await t.refresh()}async function oe(e,t,r,i,n,d,a=!1,p=!1){let h;d?h=J?o.localize("deleteButtonLabelRecycleBin","&&Move to Recycle Bin"):o.localize({key:"deleteButtonLabelTrash",comment:["&& denotes a mnemonic"]},"&&Move to Trash"):h=o.localize({key:"deleteButtonLabel",comment:["&& denotes a mnemonic"]},"&&Delete");const f=b.distinctParents(n,s=>s.resource),I=new Set;for(const s of f)for(const c of t.getDirty(s.resource))I.add(c);let v=!0;if(I.size){let s;f.length>1?s=o.localize("dirtyMessageFilesDelete","You are deleting files with unsaved changes. Do you want to continue?"):f[0].isDirectory?I.size===1?s=o.localize("dirtyMessageFolderOneDelete","You are deleting a folder {0} with unsaved changes in 1 file. Do you want to continue?",f[0].name):s=o.localize("dirtyMessageFolderDelete","You are deleting a folder {0} with unsaved changes in {1} files. Do you want to continue?",f[0].name,I.size):s=o.localize("dirtyMessageFileDelete","You are deleting {0} with unsaved changes. Do you want to continue?",f[0].name),(await r.confirm({type:"warning",message:s,detail:o.localize("dirtyWarning","Your changes will be lost if you don't save them."),primaryButton:h})).confirmed?a=!0:v=!1}if(!v)return;let l;const m=f.some(s=>s.isDirectory)?o.localize("irreversible","This action is irreversible!"):f.length>1?o.localize("restorePlural","You can restore these files using the Undo command."):o.localize("restore","You can restore this file using the Undo command.");if(a||d&&i.getValue(Ce)===!1)l={confirmed:!0};else if(d){let{message:s,detail:c}=xt(f);c+=c?`
`:"",J?c+=f.length>1?o.localize("undoBinFiles","You can restore these files from the Recycle Bin."):o.localize("undoBin","You can restore this file from the Recycle Bin."):c+=f.length>1?o.localize("undoTrashFiles","You can restore these files from the Trash."):o.localize("undoTrash","You can restore this file from the Trash."),l=await r.confirm({message:s,detail:c,primaryButton:h,checkbox:{label:o.localize("doNotAskAgain","Do not ask me again")}})}else{let{message:s,detail:c}=Et(f);c+=c?`
`:"",c+=m,l=await r.confirm({type:"warning",message:s,detail:c,primaryButton:h})}if(l.confirmed&&l.checkboxChecked===!0&&await i.updateValue(Ce,!1),!!l.confirmed)try{const s=f.map(y=>new B(y.resource,void 0,{recursive:!0,folder:y.isDirectory,ignoreIfNotExists:p,skipTrashBin:!d,maxSize:It})),c={undoLabel:f.length>1?o.localize({key:"deleteBulkEdit",comment:["Placeholder will be replaced by the number of files deleted"]},"Delete {0} files",f.length):o.localize({key:"deleteFileBulkEdit",comment:["Placeholder will be replaced by the name of the file deleted"]},"Delete {0}",f[0].name),progressLabel:f.length>1?o.localize({key:"deletingBulkEdit",comment:["Placeholder will be replaced by the number of files deleted"]},"Deleting {0} files",f.length):o.localize({key:"deletingFileBulkEdit",comment:["Placeholder will be replaced by the name of the file deleted"]},"Deleting {0}",f[0].name)};await e.applyBulkEdit(s,c)}catch(s){let c,y,x;if(d?(c=J?o.localize("binFailed","Failed to delete using the Recycle Bin. Do you want to permanently delete instead?"):o.localize("trashFailed","Failed to delete using the Trash. Do you want to permanently delete instead?"),y=m,x=o.localize({key:"deletePermanentlyButtonLabel",comment:["&& denotes a mnemonic"]},"&&Delete Permanently")):(c=Q(s,!1),x=o.localize({key:"retryButtonLabel",comment:["&& denotes a mnemonic"]},"&&Retry")),(await r.confirm({type:"warning",message:c,detail:y,primaryButton:x})).confirmed)return d&&(d=!1),a=!0,p=!0,oe(e,t,r,i,n,d,a,p)}}function xt(e){return Me(e)?{message:o.localize("confirmMoveTrashMessageFilesAndDirectories","Are you sure you want to delete the following {0} files/directories and their contents?",e.length),detail:z(e.map(t=>t.resource))}:e.length>1?e[0].isDirectory?{message:o.localize("confirmMoveTrashMessageMultipleDirectories","Are you sure you want to delete the following {0} directories and their contents?",e.length),detail:z(e.map(t=>t.resource))}:{message:o.localize("confirmMoveTrashMessageMultiple","Are you sure you want to delete the following {0} files?",e.length),detail:z(e.map(t=>t.resource))}:e[0].isDirectory&&!e[0].isSymbolicLink?{message:o.localize("confirmMoveTrashMessageFolder","Are you sure you want to delete '{0}' and its contents?",e[0].name),detail:""}:{message:o.localize("confirmMoveTrashMessageFile","Are you sure you want to delete '{0}'?",e[0].name),detail:""}}function Et(e){return Me(e)?{message:o.localize("confirmDeleteMessageFilesAndDirectories","Are you sure you want to permanently delete the following {0} files/directories and their contents?",e.length),detail:z(e.map(t=>t.resource))}:e.length>1?e[0].isDirectory?{message:o.localize("confirmDeleteMessageMultipleDirectories","Are you sure you want to permanently delete the following {0} directories and their contents?",e.length),detail:z(e.map(t=>t.resource))}:{message:o.localize("confirmDeleteMessageMultiple","Are you sure you want to permanently delete the following {0} files?",e.length),detail:z(e.map(t=>t.resource))}:e[0].isDirectory?{message:o.localize("confirmDeleteMessageFolder","Are you sure you want to permanently delete '{0}' and its contents?",e[0].name),detail:""}:{message:o.localize("confirmDeleteMessageFile","Are you sure you want to permanently delete '{0}'?",e[0].name),detail:""}}function Me(e){const t=e.find(i=>i.isDirectory),r=e.find(i=>!i.isDirectory);return!!t&&!!r}async function Re(e,t,r,i,n,d){let a=typeof n.resource=="string"?n.resource:b.basenameOrAuthority(n.resource),p=b.joinPath(i.resource,a);if(!(d==="disabled"&&!await Dt(t,r,p))){for(;!n.allowOverwrite&&e.findClosest(p);)d!=="disabled"&&(a=bt(a,!!n.isDirectory,d)),p=b.joinPath(i.resource,a);return p}}function bt(e,t,r){if(r==="simple"){let v=e,l="";t||(l=Ge(e),v=Z(e,l));const m=/^(.+ copy)( \d+)?$/;return m.test(v)?v.replace(m,(s,c,y)=>{const x=y?parseInt(y):1;return x===0?`${c}`:x<Ie.MAX_SAFE_SMALL_INTEGER?`${c} ${x+1}`:`${c}${y} copy`})+l:`${v} copy${l}`}const i="[\\.\\-_]",n=Ie.MAX_SAFE_SMALL_INTEGER,d=RegExp("(.*"+i+")(\\d+)(\\..*)$");if(!t&&e.match(d))return e.replace(d,(v,l,m,s)=>{const c=parseInt(m);return c<n?l+String(c+1).padStart(m.length,"0")+s:`${l}${m}.1${s}`});const a=RegExp("(\\d+)("+i+".*)(\\..*)$");if(!t&&e.match(a))return e.replace(a,(v,l,m,s)=>{const c=parseInt(l);return c<n?String(c+1).padStart(l.length,"0")+m+s:`${l}${m}.1${s}`});const p=RegExp("(\\d+)(\\..*)$");if(!t&&e.match(p))return e.replace(p,(v,l,m)=>{const s=parseInt(l);return s<n?String(s+1).padStart(l.length,"0")+m:`${l}.1${m}`});const h=e.lastIndexOf(".");if(!t&&h>=0)return`${e.substr(0,h)}.1${e.substr(h)}`;const f=RegExp("(\\d+)$");if(!t&&h===-1&&e.match(f))return e.replace(f,(v,l)=>{const m=parseInt(l);return m<n?String(m+1).padStart(l.length,"0"):`${l}.1`});const I=RegExp("(.*)(\\d*)$");return!t&&h===-1&&e.match(I)?e.replace(I,(v,l,m)=>{let s=parseInt(m);return isNaN(s)&&(s=0),s<n?l+String(s+1).padStart(m.length,"0"):`${l}${m}.1`}):t&&e.match(/(\d+)$/)?e.replace(/(\d+)$/,(v,...l)=>{const m=parseInt(l[0]);return m<n?String(m+1).padStart(l[0].length,"0"):`${l[0]}.1`}):t&&e.match(/^(\d+)/)?e.replace(/^(\d+)(.*)$/,(v,...l)=>{const m=parseInt(l[0]);return m<n?String(m+1).padStart(l[0].length,"0")+l[1]:`${l[0]}${l[1]}.1`}):`${e}.1`}async function Dt(e,t,r){if(!await e.exists(r))return!0;const{confirmed:n}=await t.confirm({type:k.Warning,message:o.localize("confirmOverwrite","A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?",Z(r.path)),primaryButton:o.localize("replaceButtonLabel","&&Replace")});return n}class ie extends C{static ID="workbench.files.action.compareFileWith";static LABEL=o.localize2("globalCompareFile","Compare Active File With...");constructor(){super({id:ie.ID,title:ie.LABEL,f1:!0,category:L.File,precondition:it,metadata:{description:o.localize2("compareFileWithMeta","Opens a picker to select a file to diff with the active editor.")}})}async run(t){const r=t.get(A),i=t.get(xe),n=t.get(Je),d=r.activeEditor,a=O.getOriginalUri(d);if(a&&i.canHandleResource(a)){const p=await n.quickAccess.pick("",{itemActivation:et.SECOND});if(p?.length===1){const h=p[0].resource;ee.isUri(h)&&i.canHandleResource(h)&&r.openEditor({original:{resource:a},modified:{resource:h},options:{pinned:!0}})}}}}class Ne extends C{static ID="workbench.action.toggleAutoSave";constructor(){super({id:Ne.ID,title:o.localize2("toggleAutoSave","Toggle Auto Save"),f1:!0,category:L.File,metadata:{description:o.localize2("toggleAutoSaveDescription","Toggle the ability to save files automatically after typing")}})}run(t){return t.get(re).toggleAutoSave()}}let T=class extends me{constructor(r,i,n,d,a){super(r,i);this.commandService=n;this.notificationService=d;this.workingCopyService=a;this.lastDirtyState=this.workingCopyService.hasDirty,this.enabled=this.lastDirtyState,this.registerListeners()}lastDirtyState;registerListeners(){this._register(this.workingCopyService.onDidChangeDirty(r=>this.updateEnablement(r)))}updateEnablement(r){const i=r.isDirty()||this.workingCopyService.hasDirty;this.lastDirtyState!==i&&(this.enabled=i,this.lastDirtyState=this.enabled)}async run(r){try{await this.doRun(r)}catch(i){ze(this.notificationService,i)}}};T=W([F(2,$),F(3,P),F(4,ct)],T);class Jr extends T{static ID="workbench.files.action.saveAllInGroup";static LABEL=o.localize("saveAllInGroup","Save All in Group");get class(){return"explorer-action "+Se.asClassName(ge.saveAll)}doRun(t){return this.commandService.executeCommand(mt,{},t)}}let K=class extends me{constructor(r,i,n){super(r,i,Se.asClassName(ge.closeAll));this.commandService=n}static ID="workbench.files.action.closeGroup";static LABEL=o.localize("closeGroup","Close Group");run(r){return this.commandService.executeCommand(rt,{},r)}};K=W([F(2,$)],K);class ne extends C{static ID="workbench.files.action.focusFilesExplorer";static LABEL=o.localize2("focusFilesExplorer","Focus on Files Explorer");constructor(){super({id:ne.ID,title:ne.LABEL,f1:!0,category:L.File,metadata:{description:o.localize2("focusFilesExplorerMetadata","Moves focus to the file explorer view container.")}})}async run(t){await t.get(st).openPaneComposite(pt,at.Sidebar,!0)}}class ae extends C{static ID="workbench.files.action.showActiveFileInExplorer";static LABEL=o.localize2("showInExplorer","Reveal Active File in Explorer View");constructor(){super({id:ae.ID,title:ae.LABEL,f1:!0,category:L.File,metadata:{description:o.localize2("showInExplorerMetadata","Reveals and selects the active file within the explorer view.")}})}async run(t){const r=t.get($),i=t.get(A),n=O.getOriginalUri(i.activeEditor,{supportSideBySide:Y.PRIMARY});n&&r.executeCommand(ft,n)}}class se extends C{static ID="workbench.action.files.showOpenedFileInNewWindow";static LABEL=o.localize2("openFileInEmptyWorkspace","Open Active File in New Empty Workspace");constructor(){super({id:se.ID,title:se.LABEL,f1:!0,category:L.File,precondition:nt,metadata:{description:o.localize2("openFileInEmptyWorkspaceMetadata","Opens the active file in a new window with no folders open.")}})}async run(t){const r=t.get(A),i=t.get(be),n=t.get(V),d=t.get(H),a=O.getOriginalUri(r.activeEditor,{supportSideBySide:Y.PRIMARY});a&&(d.hasProvider(a)?i.openWindow([{fileUri:a}],{forceNewWindow:!0}):n.error(o.localize("openFileToShowInNewWindow.unsupportedschema","The active editor must contain an openable resource.")))}}function Be(e,t,r,i){if(r=Ft(r),!r||r.length===0||/^\s+$/.test(r))return{content:o.localize("emptyFileNameError","A file or folder name must be provided."),severity:k.Error};if(r[0]==="/"||r[0]==="\\")return{content:o.localize("fileNameStartsWithSlashError","A file or folder name cannot start with a slash."),severity:k.Error};const n=X(r.split(/[\\/]/)),d=t.parent;if(r!==t.name){const a=d?.getChild(r);if(a&&a!==t)return{content:o.localize("fileNameExistsError","A file or folder **{0}** already exists at this location. Please choose a different name.",r),severity:k.Error}}if(n.some(a=>!e.hasValidBasename(t.resource,i,a))){const a=r.replace(/\*/g,"\\*");return{content:o.localize("invalidFileNameError","The name **{0}** is not valid as a file or folder name. Please choose a different name.",At(a)),severity:k.Error}}return n.some(a=>/^\s|\s$/.test(a))?{content:o.localize("fileNameWhitespaceWarning","Leading or trailing whitespace detected in file or folder name."),severity:k.Warning}:null}function At(e){return e?.length>255?`${e.substr(0,255)}...`:e}function Ft(e){return e&&(e=je(e,"	"),e=we(e,"/"),e=we(e,"\\"),e)}class le extends C{static ID="workbench.files.action.compareNewUntitledTextFiles";static LABEL=o.localize2("compareNewUntitledTextFiles","Compare New Untitled Text Files");constructor(){super({id:le.ID,title:le.LABEL,f1:!0,category:L.File,metadata:{description:o.localize2("compareNewUntitledTextFilesMeta","Opens a new diff editor with two untitled files.")}})}async run(t){await t.get(A).openEditor({original:{resource:void 0},modified:{resource:void 0},options:{pinned:!0}})}}class q extends C{static ID="workbench.files.action.compareWithClipboard";static LABEL=o.localize2("compareWithClipboard","Compare Active File with Clipboard");registrationDisposal;static SCHEME_COUNTER=0;constructor(){super({id:q.ID,title:q.LABEL,f1:!0,category:L.File,keybinding:{primary:Ve(He.CtrlCmd|ye.KeyK,ye.KeyC),weight:Ze.WorkbenchContrib},metadata:{description:o.localize2("compareWithClipboardMeta","Opens a new diff editor to compare the active file with the contents of the clipboard.")}})}async run(t){const r=t.get(A),i=t.get(te),n=t.get(xe),d=t.get(H),a=O.getOriginalUri(r.activeEditor,{supportSideBySide:Y.PRIMARY}),p=`clipboardCompare${q.SCHEME_COUNTER++}`;if(a&&(d.hasProvider(a)||a.scheme===Ye.untitled)){if(!this.registrationDisposal){const I=i.createInstance(U);this.registrationDisposal=n.registerTextModelContentProvider(p,I)}const h=b.basename(a),f=o.localize("clipboardComparisonLabel","Clipboard \u2194 {0}",h);await r.openEditor({original:{resource:a.with({scheme:p})},modified:{resource:a},label:f,options:{pinned:!0}}).finally(()=>{he(this.registrationDisposal),this.registrationDisposal=void 0})}}dispose(){he(this.registrationDisposal),this.registrationDisposal=void 0}}let U=class{constructor(t,r,i){this.clipboardService=t;this.languageService=r;this.modelService=i}async provideTextContent(t){const r=await this.clipboardService.readText();return this.modelService.createModel(r,this.languageService.createByFilepathOrFirstLine(t),t)}};U=W([F(0,Ee),F(1,qe),F(2,Xe)],U);function Lt(e,t,r){e.prompt(k.Error,Q(t,!1),[{label:o.localize("retry","Retry"),run:()=>r()}])}async function Pe(e,t){const r=e.get(D),i=e.get(H),n=e.get(N),d=e.get(re),a=e.get(A),p=e.get(lt),h=e.get(P),f=e.get(Ae),I=e.get($),v=e.get(De),l=!p.isViewVisible(Le),m=await p.openView(Le,!0);if(l&&await We(500),!m){if(t)throw new Error("Open a folder or workspace first.");return I.executeCommand(ut)}const s=r.getContext(!1),c=s.length>0?s[0]:void 0;let y;if(c?y=c.isDirectory?c:c.parent||r.roots[0]:y=r.roots[0],y.isReadonly)throw new Error("Parent folder is readonly.");const x=new dt(i,n,d,y,t);y.addChild(x);const R=async g=>{try{const u=b.joinPath(y.resource,g);g.endsWith("/")&&(t=!0),await r.applyBulkEdit([new B(void 0,u,{folder:t})],{undoLabel:o.localize("createBulkEdit","Create {0}",g),progressLabel:o.localize("creatingBulkEdit","Creating {0}",g),confirmBeforeUndo:!0}),await ke(g,r),t?await r.select(u,!0):await a.openEditor({resource:u,options:{pinned:!0}})}catch(u){Lt(h,u,()=>R(g))}},w=(await f.getEnvironment())?.os??ve;await r.setEditable(x,{validationMessage:g=>Be(v,x,g,w),onFinish:async(g,u)=>{y.removeChild(x),await r.setEditable(x,null),u&&R(g)}})}_.registerCommand({id:ht,handler:async e=>{await Pe(e,!1)}}),_.registerCommand({id:vt,handler:async e=>{await Pe(e,!0)}});const eo=async e=>{const t=e.get(D),r=e.get(P),i=e.get(Ae),n=e.get(De),d=e.get(N),a=t.getContext(!1),p=a.length>0?a[0]:void 0;if(!p)return;const h=(await i.getEnvironment())?.os??ve;await t.setEditable(p,{validationMessage:f=>Be(n,p,f,h),onFinish:async(f,I)=>{if(I){const v=p.parent.resource,l=b.joinPath(v,f);if(p.resource.toString()!==l.toString())try{await t.applyBulkEdit([new B(p.resource,l)],{confirmBeforeUndo:d.getValue().explorer.confirmUndo===G.Verbose,undoLabel:o.localize("renameBulkEdit","Rename {0} to {1}",p.name,f),progressLabel:o.localize("renamingBulkEdit","Renaming {0} to {1}",p.name,f)}),await ke(f,t)}catch(m){r.error(m)}}await t.setEditable(p,null)}})},to=async e=>{const r=e.get(D).getContext(!0).filter(i=>!i.isRoot);r.length&&await oe(e.get(D),e.get(Fe),e.get(V),e.get(N),r,!0)},ro=async e=>{const r=e.get(D).getContext(!0).filter(i=>!i.isRoot);r.length&&await oe(e.get(D),e.get(Fe),e.get(V),e.get(N),r,!1)};let M=!1;const oo=async e=>{const t=e.get(D),r=t.getContext(!0);r.length>0&&(await t.setToCopy(r,!1),M=!1)},io=async e=>{const t=e.get(D),r=t.getContext(!0);r.length>0&&(await t.setToCopy(r,!0),M=!0)},Ct=async e=>{const t=e.get(D),r=e.get(P),i=e.get(te),n=t.getContext(!0),d=n.length?n:t.roots,a=i.createInstance(yt);try{await a.download(d)}catch(p){throw r.error(p),p}};_.registerCommand({id:wt,handler:Ct});const zt=async e=>{const t=e.get(D),r=e.get(P),i=e.get(te),n=t.getContext(!1),d=n.length?n[0]:t.roots[0];try{const a=await Ue();a&&await i.createInstance(gt).upload(d,a)}catch(a){throw r.error(a),a}};_.registerCommand({id:St,handler:zt});const no=async(e,t)=>{const r=e.get(Ee),i=e.get(D),n=e.get(H),d=e.get(P),a=e.get(A),p=e.get(N),h=e.get(tt),f=e.get(V),I=e.get(be),v=i.getContext(!1),m=t&&t.length>0&&p.getValue("explorer.confirmPasteNative"),s=await kt(t,r,I);if(m&&s.files.length>=1){const w=s.files.length>1?o.localize("confirmMultiPasteNative","Are you sure you want to paste the following {0} items?",s.files.length):o.localize("confirmPasteNative","Are you sure you want to paste '{0}'?",Z(s.type==="paths"?s.files[0].fsPath:s.files[0].name)),g=s.files.length>1?z(s.files.map(S=>{if(ee.isUri(S))return S.fsPath;if(s.type==="paths"){const E=I.getPathForFile(S);if(E)return E}return S.name})):void 0,u=await f.confirm({message:w,detail:g,checkbox:{label:o.localize("doNotAskAgain","Do not ask me again")},primaryButton:o.localize({key:"pasteButtonLabel",comment:["&& denotes a mnemonic"]},"&&Paste")});if(!u.confirmed)return;u.checkboxChecked===!0&&await p.updateValue("explorer.confirmPasteNative",!1)}const c=v.length?v[0]:i.roots[0],y=p.getValue().explorer.incrementalNaming;if(i.getEditable())return;try{let w=[];if(s.type==="paths"){const g=X(await Promise.all(s.files.map(async u=>{if(c.resource.toString()!==u.toString()&&b.isEqualOrParent(c.resource,u))throw new Error(o.localize("fileIsAncestor","File to paste is an ancestor of the destination folder"));const S=await n.stat(u);let E;h.extUri.isEqual(c.resource,u)?E=c.parent:E=c.isDirectory?c:c.parent;const fe=await Re(i,n,f,E,{resource:u,isDirectory:S.isDirectory,allowOverwrite:M||y==="disabled"},y);if(fe)return{source:u,target:fe}})));if(g.length>=1)if(M){const u=g.map(E=>new B(E.source,E.target,{overwrite:y==="disabled"})),S={confirmBeforeUndo:p.getValue().explorer.confirmUndo===G.Verbose,progressLabel:g.length>1?o.localize({key:"movingBulkEdit",comment:["Placeholder will be replaced by the number of files being moved"]},"Moving {0} files",g.length):o.localize({key:"movingFileBulkEdit",comment:["Placeholder will be replaced by the name of the file moved."]},"Moving {0}",b.basenameOrAuthority(g[0].target)),undoLabel:g.length>1?o.localize({key:"moveBulkEdit",comment:["Placeholder will be replaced by the number of files being moved"]},"Move {0} files",g.length):o.localize({key:"moveFileBulkEdit",comment:["Placeholder will be replaced by the name of the file moved."]},"Move {0}",b.basenameOrAuthority(g[0].target))};await i.applyBulkEdit(u,S)}else{const u=g.map(S=>new B(S.source,S.target,{copy:!0,overwrite:y==="disabled"}));await R(g.map(S=>S.target),u)}w=g.map(u=>u.target)}else{const g=X(await Promise.all(s.files.map(async u=>{const S=c.isDirectory?c:c.parent,E=await Re(i,n,f,S,{resource:u.name,isDirectory:!1,allowOverwrite:M||y==="disabled"},y);if(E)return{target:E,edit:new B(void 0,E,{overwrite:y==="disabled",contents:(async()=>_e.wrap(new Uint8Array(await u.arrayBuffer())))()})}})));await R(g.map(u=>u.target),g.map(u=>u.edit)),w=g.map(u=>u.target)}if(w.length){const g=w[0];if(await i.select(g),w.length===1){const u=i.findClosest(g);u&&!u.isDirectory&&await a.openEditor({resource:u.resource,options:{pinned:!0,preserveFocus:!0}})}}}catch(w){ze(d,new Error(o.localize("fileDeleted","The file(s) to paste have been deleted or moved since you copied them. {0}",$e(w))))}finally{M&&(await i.setToCopy([],!1),M=!1)}async function R(w,g){const u=p.getValue().explorer.confirmUndo,S={confirmBeforeUndo:u===G.Default||u===G.Verbose,progressLabel:w.length>1?o.localize({key:"copyingBulkEdit",comment:["Placeholder will be replaced by the number of files being copied"]},"Copying {0} files",w.length):o.localize({key:"copyingFileBulkEdit",comment:["Placeholder will be replaced by the name of the file copied."]},"Copying {0}",b.basenameOrAuthority(w[0])),undoLabel:w.length>1?o.localize({key:"copyBulkEdit",comment:["Placeholder will be replaced by the number of files being copied"]},"Paste {0} files",w.length):o.localize({key:"copyFileBulkEdit",comment:["Placeholder will be replaced by the name of the file copied."]},"Paste {0}",b.basenameOrAuthority(w[0]))};await i.applyBulkEdit(g,S)}};async function kt(e,t,r){if(e&&e.length>0){const i=[...e].map(n=>r.getPathForFile(n)).filter(n=>!!n&&Ke(n)).map(n=>ee.file(n));return i.length?{type:"paths",files:i}:{type:"data",files:[...e].filter(n=>!r.getPathForFile(n))}}else return{type:"paths",files:b.distinctParents(await t.readResources(),i=>i)}}const ao=async e=>{const t=e.get(A),i=e.get(D).getContext(!0);await t.openEditors(i.filter(n=>!n.isDirectory).map(n=>({resource:n.resource,options:{preserveFocus:!0}})))};class j extends C{constructor(r,i,n){super({id:r,title:i,f1:!0,category:L.File,precondition:ot});this.newReadonlyState=n}async run(r){const i=r.get(A),n=r.get(re),d=O.getOriginalUri(i.activeEditor,{supportSideBySide:Y.PRIMARY});d&&await n.updateReadonly(d,this.newReadonlyState)}}class ce extends j{static ID="workbench.action.files.setActiveEditorReadonlyInSession";static LABEL=o.localize2("setActiveEditorReadonlyInSession","Set Active Editor Read-only in Session");constructor(){super(ce.ID,ce.LABEL,!0)}}class de extends j{static ID="workbench.action.files.setActiveEditorWriteableInSession";static LABEL=o.localize2("setActiveEditorWriteableInSession","Set Active Editor Writeable in Session");constructor(){super(de.ID,de.LABEL,!1)}}class pe extends j{static ID="workbench.action.files.toggleActiveEditorReadonlyInSession";static LABEL=o.localize2("toggleActiveEditorReadonlyInSession","Toggle Active Editor Read-only in Session");constructor(){super(pe.ID,pe.LABEL,"toggle")}}class ue extends j{static ID="workbench.action.files.resetActiveEditorReadonlyInSession";static LABEL=o.localize2("resetActiveEditorReadonlyInSession","Reset Active Editor Read-only in Session");constructor(){super(ue.ID,ue.LABEL,"reset")}}export{jr as COPY_FILE_LABEL,K as CloseGroupAction,le as CompareNewUntitledTextFilesAction,q as CompareWithClipboardAction,wt as DOWNLOAD_COMMAND_ID,Qr as DOWNLOAD_LABEL,Xr as FileCopiedContext,ne as FocusFilesExplorer,ie as GlobalCompareResourcesAction,Kr as MOVE_FILE_TO_TRASH_LABEL,ht as NEW_FILE_COMMAND_ID,Hr as NEW_FILE_LABEL,vt as NEW_FOLDER_COMMAND_ID,Yr as NEW_FOLDER_LABEL,se as OpenActiveFileInEmptyWorkspace,qr as PASTE_FILE_LABEL,ue as ResetActiveEditorReadonlyInSession,Jr as SaveAllInGroupAction,ce as SetActiveEditorReadonlyInSession,de as SetActiveEditorWriteableInSession,ae as ShowActiveFileInExplorer,Gr as TRIGGER_RENAME_LABEL,pe as ToggleActiveEditorReadonlyInSession,Ne as ToggleAutoSaveAction,St as UPLOAD_COMMAND_ID,Zr as UPLOAD_LABEL,oo as copyFileHandler,io as cutFileHandler,ro as deleteFileHandler,Re as findValidPasteFileTarget,bt as incrementFileName,to as moveFileToTrashHandler,ao as openFilePreserveFocusHandler,no as pasteFileHandler,eo as renameHandler,Be as validateFileName};
