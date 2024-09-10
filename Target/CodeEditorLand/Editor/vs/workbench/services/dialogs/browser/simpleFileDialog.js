var C=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var x=(v,p,e,t)=>{for(var i=t>1?void 0:t?E(p,e):p,s=v.length-1,a;s>=0;s--)(a=v[s])&&(i=(t?a(p,e,i):a(i))||i);return t&&i&&C(p,e,i),i},d=(v,p)=>(e,t)=>p(e,t,v);import*as c from"../../../../nls.js";import*as r from"../../../../base/common/resources.js";import*as T from"../../../../base/common/objects.js";import{IFileService as A,FileKind as W}from"../../../../platform/files/common/files.js";import{IQuickInputService as O,ItemActivation as L}from"../../../../platform/quickinput/common/quickInput.js";import{URI as b}from"../../../../base/common/uri.js";import{isWindows as H,OperatingSystem as z}from"../../../../base/common/platform.js";import{IFileDialogService as S}from"../../../../platform/dialogs/common/dialogs.js";import{ILabelService as M}from"../../../../platform/label/common/label.js";import{IWorkspaceContextService as N}from"../../../../platform/workspace/common/workspace.js";import{INotificationService as Q}from"../../../../platform/notification/common/notification.js";import{IModelService as q}from"../../../../editor/common/services/model.js";import{ILanguageService as K}from"../../../../editor/common/languages/language.js";import{getIconClasses as k}from"../../../../editor/common/services/getIconClasses.js";import{Schemas as m}from"../../../../base/common/network.js";import{IWorkbenchEnvironmentService as V}from"../../environment/common/environmentService.js";import{IRemoteAgentService as j}from"../../remote/common/remoteAgentService.js";import{IContextKeyService as _,RawContextKey as Y}from"../../../../platform/contextkey/common/contextkey.js";import{equalsIgnoreCase as u,format as $,startsWithIgnoreCase as F}from"../../../../base/common/strings.js";import{IKeybindingService as X}from"../../../../platform/keybinding/common/keybinding.js";import{isValidBasename as Z}from"../../../../base/common/extpath.js";import{Emitter as G}from"../../../../base/common/event.js";import{Disposable as J,DisposableStore as ee}from"../../../../base/common/lifecycle.js";import{createCancelablePromise as te}from"../../../../base/common/async.js";import{IEditorService as ie}from"../../editor/common/editorService.js";import{normalizeDriveLetter as se}from"../../../../base/common/labels.js";import{SaveReason as re}from"../../../common/editor.js";import{IPathService as ae}from"../../path/common/pathService.js";import{IAccessibilityService as oe}from"../../../../platform/accessibility/common/accessibility.js";import{getActiveDocument as y}from"../../../../base/browser/dom.js";var B;(t=>{t.ID="workbench.action.files.openLocalFile",t.LABEL=c.localize("openLocalFile","Open Local File...");function e(){return i=>i.get(S).pickFileAndOpen({forceNewWindow:!1,availableFileSystems:[m.file]})}t.handler=e})(B||={});var U;(t=>{t.ID="workbench.action.files.saveLocalFile",t.LABEL=c.localize("saveLocalFile","Save Local File...");function e(){return i=>{const s=i.get(ie),a=s.activeEditorPane;return a?s.save({groupId:a.group.id,editor:a.input},{saveAs:!0,availableFileSystems:[m.file],reason:re.EXPLICIT}):Promise.resolve(void 0)}}t.handler=e})(U||={});var D;(t=>{t.ID="workbench.action.files.openLocalFolder",t.LABEL=c.localize("openLocalFolder","Open Local Folder...");function e(){return i=>i.get(S).pickFolderAndOpen({forceNewWindow:!1,availableFileSystems:[m.file]})}t.handler=e})(D||={});var w;(t=>{t.ID="workbench.action.files.openLocalFileFolder",t.LABEL=c.localize("openLocalFileFolder","Open Local...");function e(){return i=>i.get(S).pickFileFolderAndOpen({forceNewWindow:!1,availableFileSystems:[m.file]})}t.handler=e})(w||={});var ne=(s=>(s[s.Updated=0]="Updated",s[s.UpdatedWithTrailing=1]="UpdatedWithTrailing",s[s.Updating=2]="Updating",s[s.NotUpdated=3]="NotUpdated",s[s.InvalidPath=4]="InvalidPath",s))(ne||{});const le=new Y("remoteFileDialogVisible",!1);let I=class extends J{constructor(e,t,i,s,a,h,o,l,g,n,f,P,R,he){super();this.fileService=e;this.quickInputService=t;this.labelService=i;this.workspaceContextService=s;this.notificationService=a;this.fileDialogService=h;this.modelService=o;this.languageService=l;this.environmentService=g;this.remoteAgentService=n;this.pathService=f;this.keybindingService=P;this.accessibilityService=he;this.remoteAuthority=this.environmentService.remoteAuthority,this.contextKey=le.bindTo(R),this.scheme=this.pathService.defaultUriScheme}options;currentFolder;filePickBox;hidden=!1;allowFileSelection=!0;allowFolderSelection=!1;remoteAuthority;requiresTrailing=!1;trailing;scheme;contextKey;userEnteredPathSegment="";autoCompletePathSegment="";activeItem;userHome;trueHome;isWindows=!1;badPath;remoteAgentEnvironment;separator="/";onBusyChangeEmitter=this._register(new G);updatingPromise;set busy(e){this.filePickBox.busy!==e&&(this.filePickBox.busy=e,this.onBusyChangeEmitter.fire(e))}get busy(){return this.filePickBox.busy}async showOpenDialog(e={}){this.scheme=this.getScheme(e.availableFileSystems,e.defaultUri),this.userHome=await this.getUserHome(),this.trueHome=await this.getUserHome(!0);const t=this.getOptions(e);return t?(this.options=t,this.pickResource()):Promise.resolve(void 0)}async showSaveDialog(e){this.scheme=this.getScheme(e.availableFileSystems,e.defaultUri),this.userHome=await this.getUserHome(),this.trueHome=await this.getUserHome(!0),this.requiresTrailing=!0;const t=this.getOptions(e,!0);return t?(this.options=t,this.options.canSelectFolders=!0,this.options.canSelectFiles=!0,new Promise(i=>{this.pickResource(!0).then(s=>{i(s)})})):Promise.resolve(void 0)}getOptions(e,t=!1){let i,s;if(e.defaultUri&&(i=this.scheme===e.defaultUri.scheme?e.defaultUri:void 0,s=t?r.basename(e.defaultUri):void 0),i||(i=this.userHome,s&&(i=r.joinPath(i,s))),this.scheme!==m.file&&!this.fileService.hasProvider(i)){this.notificationService.info(c.localize("remoteFileDialog.notConnectedToRemote","File system provider for {0} is not available.",i.toString()));return}const a=T.deepClone(e);return a.defaultUri=i,a}remoteUriFrom(e,t){e.startsWith("\\\\")||(e=e.replace(/\\/g,"/"));const i=this.scheme===m.file?b.file(e):b.from({scheme:this.scheme,path:e,query:t?.query,fragment:t?.fragment}),s=i.scheme===m.file?void 0:this.remoteAuthority??t?.authority;return r.toLocalResource(i,s,s?this.pathService.defaultUriScheme:i.scheme)}getScheme(e,t){return e&&e.length>0?t&&e.indexOf(t.scheme)>=0?t.scheme:e[0]:t?t.scheme:m.file}async getRemoteAgentEnvironment(){return this.remoteAgentEnvironment===void 0&&(this.remoteAgentEnvironment=await this.remoteAgentService.getEnvironment()),this.remoteAgentEnvironment}getUserHome(e=!1){return e?this.pathService.userHome({preferLocal:this.scheme===m.file}):this.fileDialogService.preferredHome(this.scheme)}async pickResource(e=!1){this.allowFolderSelection=!!this.options.canSelectFolders,this.allowFileSelection=!!this.options.canSelectFiles,this.separator=this.labelService.getSeparator(this.scheme,this.remoteAuthority),this.hidden=!1,this.isWindows=await this.checkIsWindowsOS();let t=this.options.defaultUri?this.options.defaultUri:this.workspaceContextService.getWorkspace().folders[0].uri,i;const s=r.extname(t);if(this.options.defaultUri){try{i=await this.fileService.stat(this.options.defaultUri)}catch{}(!i||!i.isDirectory)&&(t=r.dirname(this.options.defaultUri),this.trailing=r.basename(this.options.defaultUri))}return new Promise(a=>{if(this.filePickBox=this._register(this.quickInputService.createQuickPick()),this.busy=!0,this.filePickBox.matchOnLabel=!1,this.filePickBox.sortByLabel=!1,this.filePickBox.ignoreFocusOut=!0,this.filePickBox.ok=!0,this.scheme!==m.file&&this.options&&this.options.availableFileSystems&&this.options.availableFileSystems.length>1&&this.options.availableFileSystems.indexOf(m.file)>-1){this.filePickBox.customButton=!0,this.filePickBox.customLabel=c.localize("remoteFileDialog.local","Show Local");let n;e?n=U:n=this.allowFileSelection?this.allowFolderSelection?w:B:D;const f=this.keybindingService.lookupKeybinding(n.ID);if(f){const P=f.getLabel();P&&(this.filePickBox.customHover=$("{0} ({1})",n.LABEL,P))}}let h=0,o=!1;this.currentFolder=r.dirname(t),this.userEnteredPathSegment="",this.autoCompletePathSegment="",this.filePickBox.title=this.options.title,this.filePickBox.value=this.pathFromUri(this.currentFolder,!0),this.filePickBox.valueSelection=[this.filePickBox.value.length,this.filePickBox.value.length];const l=n=>{n&&(n=r.addTrailingPathSeparator(n,this.separator),n=r.removeTrailingPathSeparator(n)),a(n),this.contextKey.set(!1),this.dispose()};this._register(this.filePickBox.onDidCustom(()=>{if(!(o||this.busy))return o=!0,h++,this.options.availableFileSystems&&this.options.availableFileSystems.length>1&&(this.options.availableFileSystems=this.options.availableFileSystems.slice(1)),this.filePickBox.hide(),e?this.fileDialogService.showSaveDialog(this.options).then(n=>{l(n)}):this.fileDialogService.showOpenDialog(this.options).then(n=>{l(n?n[0]:void 0)})}));const g=()=>{if(this.busy){this.onBusyChangeEmitter.event(n=>{n||g()});return}else if(o)return;o=!0,h++,this.onDidAccept().then(n=>{n?(this.filePickBox.hide(),l(n)):this.hidden?l(void 0):(h--,o=!1)})};this._register(this.filePickBox.onDidAccept(n=>{g()})),this._register(this.filePickBox.onDidChangeActive(n=>{if(o=!1,n.length===1&&this.isSelectionChangeFromUser()){this.filePickBox.validationMessage=void 0;const f=this.constructFullUserPath();u(this.filePickBox.value.substring(0,f.length),f)||(this.filePickBox.valueSelection=[0,this.filePickBox.value.length],this.insertText(f,f)),this.setAutoComplete(f,this.userEnteredPathSegment,n[0],!0)}})),this._register(this.filePickBox.onDidChangeValue(async n=>this.handleValueChange(n))),this._register(this.filePickBox.onDidHide(()=>{this.hidden=!0,h===0&&l(void 0)})),this.filePickBox.show(),this.contextKey.set(!0),this.updateItems(t,!0,this.trailing).then(()=>{this.trailing?this.filePickBox.valueSelection=[this.filePickBox.value.length-this.trailing.length,this.filePickBox.value.length-s.length]:this.filePickBox.valueSelection=[this.filePickBox.value.length,this.filePickBox.value.length],this.busy=!1})})}dispose(){super.dispose()}async handleValueChange(e){try{if(this.isValueChangeFromUser())if(!u(e,this.constructFullUserPath())&&!this.isBadSubpath(e)){this.filePickBox.validationMessage=void 0;const t=this.filePickBoxValue();let i=3;r.extUriIgnorePathCase.isEqual(this.currentFolder,t)||(i=await this.tryUpdateItems(e,t)),(i===3||i===1)&&this.setActiveItems(e)}else this.filePickBox.activeItems=[],this.userEnteredPathSegment=""}catch{}}isBadSubpath(e){return this.badPath&&e.length>this.badPath.length&&u(e.substring(0,this.badPath.length),this.badPath)}isValueChangeFromUser(){return!u(this.filePickBox.value,this.pathAppend(this.currentFolder,this.userEnteredPathSegment+this.autoCompletePathSegment))}isSelectionChangeFromUser(){return this.activeItem!==(this.filePickBox.activeItems?this.filePickBox.activeItems[0]:void 0)}constructFullUserPath(){const e=this.pathFromUri(this.currentFolder);return u(this.filePickBox.value.substr(0,this.userEnteredPathSegment.length),this.userEnteredPathSegment)?u(this.filePickBox.value.substr(0,e.length),e)?e:this.userEnteredPathSegment:this.pathAppend(this.currentFolder,this.userEnteredPathSegment)}filePickBoxValue(){const e=this.remoteUriFrom(this.filePickBox.value.trimRight(),this.currentFolder),t=this.pathFromUri(this.currentFolder);if(u(this.filePickBox.value,t))return this.currentFolder;const i=this.remoteUriFrom(t,this.currentFolder),s=r.relativePath(i,e),a=this.filePickBox.value.length>1&&t.length>1?u(this.filePickBox.value.substr(0,2),t.substr(0,2)):!1;if(s&&a){let h=r.joinPath(this.currentFolder,s);const o=r.basename(e);return(o==="."||o==="..")&&(h=this.remoteUriFrom(this.pathAppend(h,o),this.currentFolder)),r.hasTrailingPathSeparator(e)?r.addTrailingPathSeparator(h):h}else return e}async onDidAccept(){if(this.busy=!0,this.filePickBox.activeItems.length===1){const t=this.filePickBox.selectedItems[0];if(t.isFolder){if(this.trailing)await this.updateItems(t.uri,!0,this.trailing);else{const i=this.pathFromUri(t.uri);F(i,this.filePickBox.value)&&u(t.label,r.basename(t.uri))?(this.filePickBox.valueSelection=[this.pathFromUri(this.currentFolder).length,this.filePickBox.value.length],this.insertText(i,this.basenameWithTrailingSlash(t.uri))):t.label===".."&&F(this.filePickBox.value,i)?(this.filePickBox.valueSelection=[i.length,this.filePickBox.value.length],this.insertText(i,"")):await this.updateItems(t.uri,!0)}this.filePickBox.busy=!1;return}}else if(await this.tryUpdateItems(this.filePickBox.value,this.filePickBoxValue())!==3){this.filePickBox.busy=!1;return}let e;if(this.filePickBox.activeItems.length===0?e=this.filePickBoxValue():this.filePickBox.activeItems.length===1&&(e=this.filePickBox.selectedItems[0].uri),e&&(e=this.addPostfix(e)),await this.validate(e))return this.busy=!1,e;this.busy=!1}root(e){let t=e,i=r.dirname(e);for(;!r.isEqual(t,i);)t=i,i=r.dirname(i);return i}tildaReplace(e){const t=this.trueHome;return e.length>0&&e[0]==="~"?r.joinPath(t,e.substring(1)):this.remoteUriFrom(e)}tryAddTrailingSeparatorToDirectory(e,t){return t.isDirectory&&!this.endsWithSlash(e.path)?r.addTrailingPathSeparator(e):e}async tryUpdateItems(e,t){if(e.length>0&&e[0]==="~"){const i=this.tildaReplace(e);return await this.updateItems(i,!0)?1:0}else{if(e==="\\")return t=this.root(this.currentFolder),e=this.pathFromUri(t),await this.updateItems(t,!0)?1:0;{const i=r.extUriIgnorePathCase.isEqual(this.currentFolder,t),s=r.extUriIgnorePathCase.isEqual(this.currentFolder,r.dirname(t)),a=r.extUriIgnorePathCase.isEqualOrParent(this.currentFolder,r.dirname(t)),h=!a&&!s;if(!i&&(this.endsWithSlash(e)||a||h)){let o;try{o=await this.fileService.stat(t)}catch{}if(o&&o.isDirectory&&r.basename(t)!=="."&&this.endsWithSlash(e))return t=this.tryAddTrailingSeparatorToDirectory(t,o),await this.updateItems(t)?1:0;if(this.endsWithSlash(e))return this.filePickBox.validationMessage=c.localize("remoteFileDialog.badPath","The path does not exist."),this.badPath=e,4;{let l=r.dirname(t);const g=r.removeTrailingPathSeparator(r.addTrailingPathSeparator(this.currentFolder)),n=r.removeTrailingPathSeparator(r.addTrailingPathSeparator(l));if(!r.extUriIgnorePathCase.isEqual(g,n)&&(!/^[a-zA-Z]:$/.test(this.filePickBox.value)||!u(this.pathFromUri(this.currentFolder).substring(0,this.filePickBox.value.length),this.filePickBox.value))){let f;try{f=await this.fileService.stat(l)}catch{}if(f&&f.isDirectory)return this.badPath=void 0,l=this.tryAddTrailingSeparatorToDirectory(l,f),await this.updateItems(l,!1,r.basename(t))?1:0}}}}}return this.badPath=void 0,3}tryUpdateTrailing(e){const t=r.extname(e);this.trailing&&t&&(this.trailing=r.basename(e))}setActiveItems(e){e=this.pathFromUri(this.tildaReplace(e));const t=this.remoteUriFrom(e),i=r.basename(t),s=this.constructFullUserPath();if(u(s,e.substring(0,s.length))||u(e,s.substring(0,e.length))){let h=!1;for(let o=0;o<this.filePickBox.items.length;o++){const l=this.filePickBox.items[o];if(this.setAutoComplete(e,i,l)){h=!0;break}}if(!h){const o=i.length>=2?s.substring(s.length-i.length+2):"";this.userEnteredPathSegment=o===i?i:"",this.autoCompletePathSegment="",this.filePickBox.activeItems=[],this.tryUpdateTrailing(t)}}else this.userEnteredPathSegment=i,this.autoCompletePathSegment="",this.filePickBox.activeItems=[],this.tryUpdateTrailing(t)}setAutoComplete(e,t,i,s=!1){if(this.busy)return this.userEnteredPathSegment=t,this.autoCompletePathSegment="",!1;const a=i.label;return a===".."?(this.userEnteredPathSegment="",this.autoCompletePathSegment="",this.activeItem=i,s&&y().execCommand("insertText",!1,""),!1):!s&&a.length>=t.length&&u(a.substr(0,t.length),t)?(this.userEnteredPathSegment=t,this.activeItem=i,this.autoCompletePathSegment="",i.isFolder||!this.trailing?this.filePickBox.activeItems=[i]:this.filePickBox.activeItems=[],!0):s&&!u(this.basenameWithTrailingSlash(i.uri),this.userEnteredPathSegment+this.autoCompletePathSegment)?(this.userEnteredPathSegment="",this.accessibilityService.isScreenReaderOptimized()||(this.autoCompletePathSegment=this.trimTrailingSlash(a)),this.activeItem=i,this.accessibilityService.isScreenReaderOptimized()||(this.filePickBox.valueSelection=[this.pathFromUri(this.currentFolder,!0).length,this.filePickBox.value.length],this.insertText(this.pathAppend(this.currentFolder,this.autoCompletePathSegment),this.autoCompletePathSegment),this.filePickBox.valueSelection=[this.filePickBox.value.length-this.autoCompletePathSegment.length,this.filePickBox.value.length]),!0):(this.userEnteredPathSegment=t,this.autoCompletePathSegment="",!1)}insertText(e,t){this.filePickBox.inputHasFocus()?(y().execCommand("insertText",!1,t),this.filePickBox.value!==e&&(this.filePickBox.value=e,this.handleValueChange(e))):(this.filePickBox.value=e,this.handleValueChange(e))}addPostfix(e){let t=e;if(this.requiresTrailing&&this.options.filters&&this.options.filters.length>0&&!r.hasTrailingPathSeparator(e)){let i=!1;const s=r.extname(e).substr(1);for(let a=0;a<this.options.filters.length;a++){for(let h=0;h<this.options.filters[a].extensions.length;h++)if(this.options.filters[a].extensions[h]==="*"||this.options.filters[a].extensions[h]===s){i=!0;break}if(i)break}i||(t=r.joinPath(r.dirname(e),r.basename(e)+"."+this.options.filters[0].extensions[0]))}return t}trimTrailingSlash(e){return e.length>1&&this.endsWithSlash(e)?e.substr(0,e.length-1):e}yesNoPrompt(e,t){const i=new ee,s=i.add(this.quickInputService.createQuickPick());s.title=t,s.ignoreFocusOut=!0,s.ok=!0,s.customButton=!0,s.customLabel=c.localize("remoteFileDialog.cancel","Cancel"),s.value=this.pathFromUri(e);let a=!1;return new Promise(h=>{i.add(s.onDidAccept(()=>{a=!0,s.hide(),h(!0)})),i.add(s.onDidHide(()=>{a||h(!1),this.filePickBox.show(),this.hidden=!1,i.dispose()})),i.add(s.onDidChangeValue(()=>{s.hide()})),i.add(s.onDidCustom(()=>{s.hide()})),s.show()})}async validate(e){if(e===void 0)return this.filePickBox.validationMessage=c.localize("remoteFileDialog.invalidPath","Please enter a valid path."),Promise.resolve(!1);let t,i;try{i=await this.fileService.stat(r.dirname(e)),t=await this.fileService.stat(e)}catch{}if(this.requiresTrailing){if(t&&t.isDirectory)return this.filePickBox.validationMessage=c.localize("remoteFileDialog.validateFolder","The folder already exists. Please use a new file name."),Promise.resolve(!1);if(t){const s=c.localize("remoteFileDialog.validateExisting","{0} already exists. Are you sure you want to overwrite it?",r.basename(e));return this.yesNoPrompt(e,s)}else if(Z(r.basename(e),this.isWindows))if(i)if(i.isDirectory){if(i.readonly)return this.filePickBox.validationMessage=c.localize("remoteFileDialog.validateReadonlyFolder","This folder cannot be used as a save destination. Please choose another folder"),Promise.resolve(!1)}else return this.filePickBox.validationMessage=c.localize("remoteFileDialog.validateNonexistentDir","Please enter a path that exists."),Promise.resolve(!1);else{const s=c.localize("remoteFileDialog.validateCreateDirectory","The folder {0} does not exist. Would you like to create it?",r.basename(r.dirname(e)));return this.yesNoPrompt(e,s)}else return this.filePickBox.validationMessage=c.localize("remoteFileDialog.validateBadFilename","Please enter a valid file name."),Promise.resolve(!1)}else if(t){if(e.path==="/"&&this.isWindows)return this.filePickBox.validationMessage=c.localize("remoteFileDialog.windowsDriveLetter","Please start the path with a drive letter."),Promise.resolve(!1);if(t.isDirectory&&!this.allowFolderSelection)return this.filePickBox.validationMessage=c.localize("remoteFileDialog.validateFileOnly","Please select a file."),Promise.resolve(!1);if(!t.isDirectory&&!this.allowFileSelection)return this.filePickBox.validationMessage=c.localize("remoteFileDialog.validateFolderOnly","Please select a folder."),Promise.resolve(!1)}else return this.filePickBox.validationMessage=c.localize("remoteFileDialog.validateNonexistentDir","Please enter a path that exists."),Promise.resolve(!1);return Promise.resolve(!0)}async updateItems(e,t=!1,i){this.busy=!0,this.autoCompletePathSegment="";const s=!!i;let a=!1;const h=te(async o=>{let l;try{l=await this.fileService.resolve(e),l.isDirectory||(i=r.basename(e),e=r.dirname(e),l=void 0,a=!0)}catch{}const g=i?this.pathAppend(e,i):this.pathFromUri(e,!0);return this.currentFolder=this.endsWithSlash(e.path)?e:r.addTrailingPathSeparator(e,this.separator),this.userEnteredPathSegment=i||"",this.createItems(l,this.currentFolder,o).then(n=>o.isCancellationRequested?(this.busy=!1,!1):(this.filePickBox.itemActivation=L.NONE,this.filePickBox.items=n,!u(this.filePickBox.value,g)&&t&&(this.filePickBox.valueSelection=[0,this.filePickBox.value.length],this.insertText(g,g)),t&&i&&s?this.filePickBox.valueSelection=[this.filePickBox.value.length-i.length,this.filePickBox.value.length-i.length]:i||(this.filePickBox.valueSelection=[this.filePickBox.value.length,this.filePickBox.value.length]),this.busy=!1,this.updatingPromise=void 0,a))});return this.updatingPromise!==void 0&&this.updatingPromise.cancel(),this.updatingPromise=h,h}pathFromUri(e,t=!1){let i=se(e.fsPath,this.isWindows).replace(/\n/g,"");return this.separator==="/"?i=i.replace(/\\/g,this.separator):i=i.replace(/\//g,this.separator),t&&!this.endsWithSlash(i)&&(i=i+this.separator),i}pathAppend(e,t){return t===".."||t==="."?this.pathFromUri(e,!0)+t:this.pathFromUri(r.joinPath(e,t))}async checkIsWindowsOS(){let e=H;const t=await this.getRemoteAgentEnvironment();return t&&(e=t.os===z.Windows),e}endsWithSlash(e){return/[\/\\]$/.test(e)}basenameWithTrailingSlash(e){const t=this.pathFromUri(e,!0),i=this.pathFromUri(r.dirname(e),!0);return t.substring(i.length)}async createBackItem(e){const t=this.currentFolder.with({scheme:m.file,authority:""}),i=r.dirname(t);if(!r.isEqual(t,i)){const s=r.dirname(e);if(await this.fileService.exists(s))return{label:"..",uri:r.addTrailingPathSeparator(s,this.separator),isFolder:!0}}}async createItems(e,t,i){const s=[],a=await this.createBackItem(t);try{e||(e=await this.fileService.resolve(t));const o=e.children?await Promise.all(e.children.map(l=>this.createItem(l,t,i))):[];for(const l of o)l&&s.push(l)}catch(o){console.log(o)}if(i.isCancellationRequested)return[];const h=s.sort((o,l)=>{if(o.isFolder!==l.isFolder)return o.isFolder?-1:1;const g=this.endsWithSlash(o.label)?o.label.substr(0,o.label.length-1):o.label,n=this.endsWithSlash(l.label)?l.label.substr(0,l.label.length-1):l.label;return g.localeCompare(n)});return a&&h.unshift(a),h}filterFile(e){if(this.options.filters){for(let t=0;t<this.options.filters.length;t++)for(let i=0;i<this.options.filters[t].extensions.length;i++){const s=this.options.filters[t].extensions[i];if(s==="*"||e.path.endsWith("."+s))return!0}return!1}return!0}async createItem(e,t,i){if(i.isCancellationRequested)return;let s=r.joinPath(t,e.name);if(e.isDirectory){const a=r.basename(s);return s=r.addTrailingPathSeparator(s,this.separator),{label:a,uri:s,isFolder:!0,iconClasses:k(this.modelService,this.languageService,s||void 0,W.FOLDER)}}else if(!e.isDirectory&&this.allowFileSelection&&this.filterFile(s))return{label:e.name,uri:s,isFolder:!1,iconClasses:k(this.modelService,this.languageService,s||void 0)}}};I=x([d(0,A),d(1,O),d(2,M),d(3,N),d(4,Q),d(5,S),d(6,q),d(7,K),d(8,V),d(9,j),d(10,ae),d(11,X),d(12,_),d(13,oe)],I);export{B as OpenLocalFileCommand,w as OpenLocalFileFolderCommand,D as OpenLocalFolderCommand,le as RemoteFileDialogContext,U as SaveLocalFileCommand,I as SimpleFileDialog};
