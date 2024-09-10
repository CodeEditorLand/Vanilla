var P=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var g=(E,r,t,e)=>{for(var o=e>1?void 0:e?R(r,t):r,n=E.length-1,i;n>=0;n--)(i=E[n])&&(o=(e?i(r,t,o):i(o))||o);return e&&o&&P(r,t,o),o},s=(E,r)=>(t,e)=>r(t,e,E);import"./media/editorplaceholder.css";import{localize as c}from"../../../../nls.js";import{truncate as G,truncateMiddle as W}from"../../../../base/common/strings.js";import A from"../../../../base/common/severity.js";import{isEditorOpenError as S}from"../../../common/editor.js";import{EditorPane as _}from"./editorPane.js";import{ITelemetryService as D}from"../../../../platform/telemetry/common/telemetry.js";import{DomScrollableElement as $}from"../../../../base/browser/ui/scrollbar/scrollableElement.js";import{ScrollbarVisibility as w}from"../../../../base/common/scrollable.js";import{IThemeService as C}from"../../../../platform/theme/common/themeService.js";import{size as z,clearNode as O,$ as y,EventHelper as U}from"../../../../base/browser/dom.js";import{DisposableStore as X,MutableDisposable as V}from"../../../../base/common/lifecycle.js";import{IStorageService as L}from"../../../../platform/storage/common/storage.js";import{assertAllDefined as k}from"../../../../base/common/types.js";import{ICommandService as j}from"../../../../platform/commands/common/commands.js";import{IWorkspaceContextService as q,isSingleFolderWorkspaceIdentifier as J,toWorkspaceIdentifier as K}from"../../../../platform/workspace/common/workspace.js";import{EditorOpenSource as Q}from"../../../../platform/editor/common/editor.js";import{computeEditorAriaLabel as Y,EditorPaneDescriptor as F}from"../../editor.js";import{ButtonBar as Z}from"../../../../base/browser/ui/button/button.js";import{defaultButtonStyles as ee}from"../../../../platform/theme/browser/defaultStyles.js";import{SimpleIconLabel as te}from"../../../../base/browser/ui/iconLabel/simpleIconLabel.js";import{FileChangeType as B,FileOperationResult as re,IFileService as oe}from"../../../../platform/files/common/files.js";import{toErrorMessage as N}from"../../../../base/common/errorMessage.js";import{IDialogService as ie}from"../../../../platform/dialogs/common/dialogs.js";let l=class extends _{static PLACEHOLDER_LABEL_MAX_LENGTH=1024;container;scrollbar;inputDisposable=this._register(new V);constructor(r,t,e,o,n){super(r,t,e,o,n)}createEditor(r){this.container=document.createElement("div"),this.container.className="monaco-editor-pane-placeholder",this.container.style.outline="none",this.container.tabIndex=0,this.scrollbar=this._register(new $(this.container,{horizontal:w.Auto,vertical:w.Auto})),r.appendChild(this.scrollbar.getDomNode())}async setInput(r,t,e,o){await super.setInput(r,t,e,o),!o.isCancellationRequested&&(this.inputDisposable.value=await this.renderInput(r,t))}async renderInput(r,t){const[e,o]=k(this.container,this.scrollbar);O(e);const n=new X,{icon:i,label:p,actions:a}=await this.getContents(r,t,n),m=G(p,l.PLACEHOLDER_LABEL_MAX_LENGTH),h=e.appendChild(y(".editor-placeholder-icon-container")),f=n.add(new te(h));f.text=i;const v=e.appendChild(y(".editor-placeholder-label-container")),b=document.createElement("span");if(b.textContent=m,v.appendChild(b),e.setAttribute("aria-label",`${Y(r,void 0,this.group,void 0)}, ${m}`),a.length){const M=e.appendChild(y(".editor-placeholder-buttons-container")),H=n.add(new Z(M));for(let I=0;I<a.length;I++){const T=n.add(H.addButton({...ee,secondary:I!==0}));T.label=a[I].label,n.add(T.onDidClick(x=>{x&&U.stop(x,!0),a[I].run()}))}}return o.scanDomNode(),n}clearInput(){this.container&&O(this.container),this.inputDisposable.clear(),super.clearInput()}layout(r){const[t,e]=k(this.container,this.scrollbar);z(t,r.width,r.height),e.scanDomNode(),t.classList.toggle("max-height-200px",r.height<=200)}focus(){super.focus(),this.container?.focus()}dispose(){this.container?.remove(),super.dispose()}};l=g([s(2,D),s(3,C),s(4,L)],l);let d=class extends l{constructor(t,e,o,n,i,p){super(d.ID,t,e,o,p);this.commandService=n;this.workspaceService=i}static ID="workbench.editors.workspaceTrustRequiredEditor";static LABEL=c("trustRequiredEditor","Workspace Trust Required");static DESCRIPTOR=F.create(d,this.ID,this.LABEL);getTitle(){return d.LABEL}async getContents(){return{icon:"$(workspace-untrusted)",label:J(K(this.workspaceService.getWorkspace()))?c("requiresFolderTrustText","The file is not displayed in the editor because trust has not been granted to the folder."):c("requiresWorkspaceTrustText","The file is not displayed in the editor because trust has not been granted to the workspace."),actions:[{label:c("manageTrust","Manage Workspace Trust"),run:()=>this.commandService.executeCommand("workbench.trust.manage")}]}}};d=g([s(1,D),s(2,C),s(3,j),s(4,q),s(5,L)],d);let u=class extends l{constructor(t,e,o,n,i,p){super(u.ID,t,e,o,n);this.fileService=i;this.dialogService=p}static ID="workbench.editors.errorEditor";static LABEL=c("errorEditor","Error Editor");static DESCRIPTOR=F.create(u,this.ID,this.LABEL);async getContents(t,e,o){const n=t.resource,i=e.error,p=i?.fileOperationResult===re.FILE_NOT_FOUND;let a;p?a=c("unavailableResourceErrorEditorText","The editor could not be opened because the file was not found."):S(i)&&i.forceMessage?a=i.message:i?a=c("unknownErrorEditorTextWithError","The editor could not be opened due to an unexpected error: {0}",W(N(i),l.PLACEHOLDER_LABEL_MAX_LENGTH/2)):a=c("unknownErrorEditorTextWithoutError","The editor could not be opened due to an unexpected error.");let m="$(error)";S(i)&&(i.forceSeverity===A.Info?m="$(info)":i.forceSeverity===A.Warning&&(m="$(warning)"));let h;return S(i)&&i.actions.length>0?h=i.actions.map(f=>({label:f.label,run:()=>{const v=f.run();v instanceof Promise&&v.catch(b=>this.dialogService.error(N(b)))}})):h=[{label:c("retry","Try Again"),run:()=>this.group.openEditor(t,{...e,source:Q.USER})}],p&&n&&this.fileService.hasProvider(n)&&o.add(this.fileService.onDidFilesChange(f=>{f.contains(n,B.ADDED,B.UPDATED)&&this.group.openEditor(t,e)})),{icon:m,label:a,actions:h??[]}}};u=g([s(1,D),s(2,C),s(3,L),s(4,oe),s(5,ie)],u);export{l as EditorPlaceholder,u as ErrorPlaceholderEditor,d as WorkspaceTrustRequiredPlaceholderEditor};
