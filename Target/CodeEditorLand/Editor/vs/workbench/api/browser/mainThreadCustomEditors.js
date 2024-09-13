var F=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var C=(v,m,t,i)=>{for(var e=i>1?void 0:i?H(m,t):m,o=v.length-1,s;o>=0;o--)(s=v[o])&&(e=(i?s(m,t,e):s(e))||e);return i&&e&&F(m,t,e),e},d=(v,m)=>(t,i)=>m(t,i,v);import{multibyteAwareBtoa as B}from"../../../base/browser/dom.js";import{createCancelablePromise as S}from"../../../base/common/async.js";import{CancellationToken as I}from"../../../base/common/cancellation.js";import{isCancellationError as $,onUnexpectedError as k}from"../../../base/common/errors.js";import{Emitter as x,Event as M}from"../../../base/common/event.js";import{Disposable as T,DisposableMap as N,DisposableStore as j}from"../../../base/common/lifecycle.js";import{Schemas as P}from"../../../base/common/network.js";import{basename as q}from"../../../base/common/path.js";import{isEqual as G,isEqualOrParent as L,toLocalResource as z}from"../../../base/common/resources.js";import{URI as D}from"../../../base/common/uri.js";import{generateUuid as V}from"../../../base/common/uuid.js";import{localize as R}from"../../../nls.js";import{IFileDialogService as J}from"../../../platform/dialogs/common/dialogs.js";import{FileOperation as K,IFileService as Y}from"../../../platform/files/common/files.js";import{IInstantiationService as Q}from"../../../platform/instantiation/common/instantiation.js";import{ILabelService as X}from"../../../platform/label/common/label.js";import{IStorageService as Z}from"../../../platform/storage/common/storage.js";import{IUndoRedoService as ee,UndoRedoElementType as te}from"../../../platform/undoRedo/common/undoRedo.js";import{CustomEditorInput as w}from"../../contrib/customEditor/browser/customEditorInput.js";import{ICustomEditorService as ie}from"../../contrib/customEditor/common/customEditor.js";import{CustomTextEditorModel as oe}from"../../contrib/customEditor/common/customTextEditorModel.js";import{ExtensionKeyedWebviewOriginStore as re}from"../../contrib/webview/browser/webview.js";import{IWebviewWorkbenchService as se}from"../../contrib/webviewPanel/browser/webviewWorkbenchService.js";import{editorGroupToColumn as ne}from"../../services/editor/common/editorGroupColumn.js";import{IEditorGroupsService as ae}from"../../services/editor/common/editorGroupsService.js";import{IEditorService as de}from"../../services/editor/common/editorService.js";import{IWorkbenchEnvironmentService as ce}from"../../services/environment/common/environmentService.js";import{IExtensionService as W}from"../../services/extensions/common/extensions.js";import{IPathService as le}from"../../services/path/common/pathService.js";import{ResourceWorkingCopy as pe}from"../../services/workingCopy/common/resourceWorkingCopy.js";import{NO_TYPE_ID as ue,WorkingCopyCapabilities as O}from"../../services/workingCopy/common/workingCopy.js";import{IWorkingCopyFileService as he}from"../../services/workingCopy/common/workingCopyFileService.js";import{IWorkingCopyService as U}from"../../services/workingCopy/common/workingCopyService.js";import*as me from"../common/extHost.protocol.js";import{reviveWebviewExtension as A}from"./mainThreadWebviews.js";var ve=(t=>(t[t.Custom=0]="Custom",t[t.Text=1]="Text",t))(ve||{});let E=class extends T{constructor(t,i,e,o,s,c,n,a,r,g,_,y){super();this.mainThreadWebview=i;this.mainThreadWebviewPanels=e;this._customEditorService=a;this._editorGroupService=r;this._editorService=g;this._instantiationService=_;this._webviewWorkbenchService=y;this._webviewOriginStore=new re("mainThreadCustomEditors.origins",s),this._proxyCustomEditors=t.getProxy(me.ExtHostContext.ExtHostCustomEditors),this._register(n.registerWorkingCopyProvider(u=>{const p=[];for(const l of c.workingCopies)l instanceof h&&L(u,l.editorResource)&&p.push(l);return p})),this._register(y.registerResolver({canResolve:u=>(u instanceof w&&o.activateByEvent(`onCustomEditor:${u.viewType}`),!1),resolveWebview:()=>{throw new Error("not implemented")}})),this._register(n.onWillRunWorkingCopyFileOperation(async u=>this.onWillRunWorkingCopyFileOperation(u)))}_proxyCustomEditors;_editorProviders=this._register(new N);_editorRenameBackups=new Map;_webviewOriginStore;$registerTextEditorProvider(t,i,e,o,s){this.registerEditorProvider(1,A(t),i,e,o,!0,s)}$registerCustomEditorProvider(t,i,e,o,s){this.registerEditorProvider(0,A(t),i,e,{},o,s)}registerEditorProvider(t,i,e,o,s,c,n){if(this._editorProviders.has(e))throw new Error(`Provider for ${e} already registered`);const a=new j;a.add(this._customEditorService.registerCustomEditorCapabilities(e,{supportsMultipleEditorsPerDocument:c})),a.add(this._webviewWorkbenchService.registerResolver({canResolve:r=>r instanceof w&&r.viewType===e,resolveWebview:async(r,g)=>{const _=V(),y=r.resource;r.webview.origin=this._webviewOriginStore.getOrigin(e,i.id),this.mainThreadWebviewPanels.addWebviewInput(_,r,{serializeBuffersForPostMessage:n}),r.webview.options=o,r.webview.extension=i;let u=r.backupId;r.oldResource&&!r.backupId&&(u=this._editorRenameBackups.get(r.oldResource.toString())?.backupId,this._editorRenameBackups.delete(r.oldResource.toString()));let p;try{p=await this.getOrCreateCustomEditorModel(t,y,e,{backupId:u},g)}catch(l){k(l),r.webview.setHtml(this.mainThreadWebview.getWebviewResolvedFailedContent(e));return}if(g.isCancellationRequested){p.dispose();return}r.webview.onDidDispose(()=>{if(p.object.isDirty()){const l=p.object.onDidChangeDirty(()=>{p.object.isDirty()||(l.dispose(),p.dispose())});return}p.dispose()}),s.supportsMove&&r.onMove(async l=>{const b=p;p=await this.getOrCreateCustomEditorModel(t,l,e,{},I.None),this._proxyCustomEditors.$onMoveCustomEditor(_,l,e),b.dispose()});try{await this._proxyCustomEditors.$resolveCustomEditor(y,_,e,{title:r.getTitle(),contentOptions:r.webview.contentOptions,options:r.webview.options,active:r===this._editorService.activeEditor},ne(this._editorGroupService,r.group||0),g)}catch(l){k(l),r.webview.setHtml(this.mainThreadWebview.getWebviewResolvedFailedContent(e)),p.dispose();return}}})),this._editorProviders.set(e,a)}$unregisterEditorProvider(t){if(!this._editorProviders.has(t))throw new Error(`No provider for ${t} registered`);this._editorProviders.deleteAndDispose(t),this._customEditorService.models.disposeAllModelsForView(t)}async getOrCreateCustomEditorModel(t,i,e,o,s){const c=this._customEditorService.models.tryRetain(i,e);if(c)return c;switch(t){case 1:{const n=oe.create(this._instantiationService,e,i);return this._customEditorService.models.add(i,e,n)}case 0:{const n=h.create(this._instantiationService,this._proxyCustomEditors,e,i,o,()=>Array.from(this.mainThreadWebviewPanels.webviewInputs).filter(a=>a instanceof w&&G(a.resource,i)),s);return this._customEditorService.models.add(i,e,n)}}}async $onDidEdit(t,i,e,o){(await this.getCustomEditorModel(t,i)).pushEdit(e,o)}async $onContentChange(t,i){(await this.getCustomEditorModel(t,i)).changeContent()}async getCustomEditorModel(t,i){const e=D.revive(t),o=await this._customEditorService.models.get(e,i);if(!o||!(o instanceof h))throw new Error("Could not find model for webview editor");return o}async onWillRunWorkingCopyFileOperation(t){t.operation===K.MOVE&&t.waitUntil((async()=>{const i=[];for(const e of t.files)e.source&&i.push(...await this._customEditorService.models.getAllModels(e.source));for(const e of i)if(e instanceof h&&e.isDirty()){const o=await e.backup(I.None);o.meta&&this._editorRenameBackups.set(e.editorResource.toString(),o.meta)}})())}};E=C([d(3,W),d(4,Z),d(5,U),d(6,he),d(7,ie),d(8,ae),d(9,de),d(10,Q),d(11,se)],E);var f;(e=>{let v;(n=>(n[n.Allowed=0]="Allowed",n[n.NotAllowed=1]="NotAllowed",n[n.Pending=2]="Pending"))(v=e.Type||={}),e.Allowed=Object.freeze({type:0}),e.NotAllowed=Object.freeze({type:1});class i{constructor(s){this.operation=s}type=2}e.Pending=i})(f||={});let h=class extends pe{constructor(t,i,e,o,s,c,n,a,r,g,_,y,u,p,l){super(h.toWorkingCopyResource(i,e),r);this._proxy=t;this._viewType=i;this._editorResource=e;this._editable=s;this._getEditors=n;this._fileDialogService=a;this._labelService=g;this._undoService=_;this._environmentService=y;this._pathService=p;this._fromBackup=o,s&&(this._register(u.registerWorkingCopy(this)),this._register(l.onWillStop(b=>{this.isDirty()&&b.veto((async()=>!await this.save())(),R("vetoExtHostRestart","Custom editor '{0}' could not be saved.",this.name))}))),c&&(this._isDirtyFromContentChange=!0)}_fromBackup=!1;_hotExitState=f.Allowed;_backupId;_currentEditIndex=-1;_savePoint=-1;_edits=[];_isDirtyFromContentChange=!1;_ongoingSave;typeId=ue;static async create(t,i,e,o,s,c,n){const a=c();let r;a.length!==0&&(r=a[0].untitledDocumentData);const{editable:g}=await i.$createCustomDocument(o,e,s.backupId,r,n);return t.createInstance(h,i,e,o,!!s.backupId,g,!!r,c)}get editorResource(){return this._editorResource}dispose(){this._editable&&this._undoService.removeElements(this._editorResource),this._proxy.$disposeCustomDocument(this._editorResource,this._viewType),super.dispose()}static toWorkingCopyResource(t,i){const e=t.replace(/[^a-z0-9\-_]/gi,"-"),o=`/${B(i.with({query:null,fragment:null}).toString(!0))}`;return D.from({scheme:P.vscodeCustomEditor,authority:e,path:o,query:JSON.stringify(i.toJSON())})}get name(){return q(this._labelService.getUriLabel(this._editorResource))}get capabilities(){return this.isUntitled()?O.Untitled:O.None}isDirty(){return this._isDirtyFromContentChange?!0:this._edits.length>0?this._savePoint!==this._currentEditIndex:this._fromBackup}isUntitled(){return this._editorResource.scheme===P.untitled}_onDidChangeDirty=this._register(new x);onDidChangeDirty=this._onDidChangeDirty.event;_onDidChangeContent=this._register(new x);onDidChangeContent=this._onDidChangeContent.event;_onDidSave=this._register(new x);onDidSave=this._onDidSave.event;onDidChangeReadonly=M.None;isReadonly(){return!this._editable}get viewType(){return this._viewType}get backupId(){return this._backupId}pushEdit(t,i){if(!this._editable)throw new Error("Document is not editable");this.change(()=>{this.spliceEdits(t),this._currentEditIndex=this._edits.length-1}),this._undoService.pushElement({type:te.Resource,resource:this._editorResource,label:i??R("defaultEditLabel","Edit"),code:"undoredo.customEditorEdit",undo:()=>this.undo(),redo:()=>this.redo()})}changeContent(){this.change(()=>{this._isDirtyFromContentChange=!0})}async undo(){if(!this._editable||this._currentEditIndex<0)return;const t=this._edits[this._currentEditIndex];this.change(()=>{--this._currentEditIndex}),await this._proxy.$undo(this._editorResource,this.viewType,t,this.isDirty())}async redo(){if(!this._editable||this._currentEditIndex>=this._edits.length-1)return;const t=this._edits[this._currentEditIndex+1];this.change(()=>{++this._currentEditIndex}),await this._proxy.$redo(this._editorResource,this.viewType,t,this.isDirty())}spliceEdits(t){const i=this._currentEditIndex+1,e=this._edits.length-this._currentEditIndex,o=typeof t=="number"?this._edits.splice(i,e,t):this._edits.splice(i,e);o.length&&this._proxy.$disposeEdits(this._editorResource,this._viewType,o)}change(t){const i=this.isDirty();t(),this._onDidChangeContent.fire(),this.isDirty()!==i&&this._onDidChangeDirty.fire()}async revert(t){this._editable&&(this._currentEditIndex===this._savePoint&&!this._isDirtyFromContentChange&&!this._fromBackup||(t?.soft||this._proxy.$revert(this._editorResource,this.viewType,I.None),this.change(()=>{this._isDirtyFromContentChange=!1,this._fromBackup=!1,this._currentEditIndex=this._savePoint,this.spliceEdits()})))}async save(t){const i=!!await this.saveCustomEditor(t);return i&&this._onDidSave.fire({reason:t?.reason,source:t?.source}),i}async saveCustomEditor(t){if(!this._editable)return;if(this.isUntitled()){const e=await this.suggestUntitledSavePath(t);return e?(await this.saveCustomEditorAs(this._editorResource,e,t),e):void 0}const i=S(e=>this._proxy.$onSave(this._editorResource,this.viewType,e));this._ongoingSave?.cancel(),this._ongoingSave=i;try{await i,this._ongoingSave===i&&this.change(()=>{this._isDirtyFromContentChange=!1,this._savePoint=this._currentEditIndex,this._fromBackup=!1})}finally{this._ongoingSave===i&&(this._ongoingSave=void 0)}return this._editorResource}suggestUntitledSavePath(t){if(!this.isUntitled())throw new Error("Resource is not untitled");const i=this._environmentService.remoteAuthority,e=z(this._editorResource,i,this._pathService.defaultUriScheme);return this._fileDialogService.pickFileToSave(e,t?.availableFileSystems)}async saveCustomEditorAs(t,i,e){return this._editable?(await S(o=>this._proxy.$onSaveAs(this._editorResource,this.viewType,i,o)),this.change(()=>{this._savePoint=this._currentEditIndex}),!0):(await this.fileService.copy(t,i,!1),!0)}get canHotExit(){return typeof this._backupId=="string"&&this._hotExitState.type===0}async backup(t){const i=this._getEditors();if(!i.length)throw new Error("No editors found for resource, cannot back up");const e=i[0],s={meta:{viewType:this.viewType,editorResource:this._editorResource,backupId:"",extension:e.extension?{id:e.extension.id.value,location:e.extension.location}:void 0,webview:{origin:e.webview.origin,options:e.webview.options,state:e.webview.state}}};if(!this._editable)return s;this._hotExitState.type===2&&this._hotExitState.operation.cancel();const c=new f.Pending(S(a=>this._proxy.$backup(this._editorResource.toJSON(),this.viewType,a)));this._hotExitState=c,t.onCancellationRequested(()=>{c.operation.cancel()});let n="";try{const a=await c.operation;this._hotExitState===c&&(this._hotExitState=f.Allowed,s.meta.backupId=a,this._backupId=a)}catch(a){if($(a))throw a;this._hotExitState===c&&(this._hotExitState=f.NotAllowed),a.message&&(n=a.message)}if(this._hotExitState===f.Allowed)return s;throw new Error(`Cannot backup in this state: ${n}`)}};h=C([d(7,J),d(8,Y),d(9,X),d(10,ee),d(11,ce),d(12,U),d(13,le),d(14,W)],h);export{E as MainThreadCustomEditors};
