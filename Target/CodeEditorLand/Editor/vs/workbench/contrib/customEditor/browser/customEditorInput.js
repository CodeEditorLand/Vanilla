var S=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var b=(l,d,e,i)=>{for(var t=i>1?void 0:i?D(d,e):d,r=l.length-1,s;r>=0;r--)(s=l[r])&&(t=(i?s(d,e,t):s(t))||t);return i&&t&&S(d,e,t),t},o=(l,d)=>(e,i)=>d(e,i,l);import{getWindow as y}from"../../../../base/browser/dom.js";import"../../../../base/browser/window.js";import{toAction as R}from"../../../../base/common/actions.js";import{VSBuffer as w}from"../../../../base/common/buffer.js";import"../../../../base/common/htmlContent.js";import"../../../../base/common/lifecycle.js";import{Schemas as E}from"../../../../base/common/network.js";import{basename as C}from"../../../../base/common/path.js";import{dirname as h,isEqual as _}from"../../../../base/common/resources.js";import{assertIsDefined as f}from"../../../../base/common/types.js";import"../../../../base/common/uri.js";import{localize as m}from"../../../../nls.js";import"../../../../platform/contextkey/common/contextkey.js";import{IFileDialogService as T}from"../../../../platform/dialogs/common/dialogs.js";import"../../../../platform/editor/common/editor.js";import{IFileService as U}from"../../../../platform/files/common/files.js";import{IInstantiationService as L}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as M}from"../../../../platform/label/common/label.js";import{IUndoRedoService as G}from"../../../../platform/undoRedo/common/undoRedo.js";import{createEditorOpenError as W,EditorInputCapabilities as u,Verbosity as a}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{ICustomEditorLabelService as O}from"../../../services/editor/common/customEditorLabelService.js";import{IEditorGroupsService as k}from"../../../services/editor/common/editorGroupsService.js";import{IFilesConfigurationService as P}from"../../../services/filesConfiguration/common/filesConfigurationService.js";import{IWorkbenchLayoutService as F}from"../../../services/layout/browser/layoutService.js";import{IUntitledTextEditorService as N}from"../../../services/untitled/common/untitledTextEditorService.js";import{IWebviewService as j}from"../../webview/browser/webview.js";import{IWebviewWorkbenchService as H,LazilyResolvedWebviewEditorInput as V}from"../../webviewPanel/browser/webviewWorkbenchService.js";import{ICustomEditorService as x}from"../common/customEditor.js";let n=class extends V{constructor(e,i,t,r,s,c,p,g,I,v,B,A,z,K){super({providedId:e.viewType,viewType:e.viewType,name:""},i,r);this.instantiationService=s;this.labelService=c;this.customEditorService=p;this.fileDialogService=g;this.undoRedoService=I;this.fileService=v;this.filesConfigurationService=B;this.editorGroupsService=A;this.layoutService=z;this.customEditorLabelService=K;this._editorResource=e.resource,this.oldResource=t.oldResource,this._defaultDirtyState=t.startsDirty,this._backupId=t.backupId,this._untitledDocumentData=t.untitledDocumentData,this.registerListeners()}static create(e,i,t,r,s){return e.invokeFunction(c=>{const p=c.get(N).getValue(i),g=p?w.fromString(p):void 0,I=c.get(j).createWebviewOverlay({providedViewType:t,title:void 0,options:{customClasses:s?.customClasses},contentOptions:{},extension:void 0}),v=e.createInstance(n,{resource:i,viewType:t},I,{untitledDocumentData:g,oldResource:s?.oldResource});return typeof r<"u"&&v.updateGroup(r),v})}static typeId="workbench.editors.webviewEditor";_editorResource;oldResource;_defaultDirtyState;_backupId;_untitledDocumentData;get resource(){return this._editorResource}_modelRef;registerListeners(){this._register(this.labelService.onDidChangeFormatters(e=>this.onLabelEvent(e.scheme))),this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e=>this.onLabelEvent(e.scheme))),this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e=>this.onLabelEvent(e.scheme))),this._register(this.customEditorLabelService.onDidChange(()=>this.updateLabel()))}onLabelEvent(e){e===this.resource.scheme&&this.updateLabel()}updateLabel(){this._editorName=void 0,this._shortDescription=void 0,this._mediumDescription=void 0,this._longDescription=void 0,this._shortTitle=void 0,this._mediumTitle=void 0,this._longTitle=void 0,this._onDidChangeLabel.fire()}get typeId(){return n.typeId}get editorId(){return this.viewType}get capabilities(){let e=u.None;return e|=u.CanDropIntoEditor,this.customEditorService.getCustomEditorCapabilities(this.viewType)?.supportsMultipleEditorsPerDocument||(e|=u.Singleton),this._modelRef?this._modelRef.object.isReadonly()&&(e|=u.Readonly):this.filesConfigurationService.isReadonly(this.resource)&&(e|=u.Readonly),this.resource.scheme===E.untitled&&(e|=u.Untitled),e}_editorName=void 0;getName(){return typeof this._editorName!="string"&&(this._editorName=this.customEditorLabelService.getName(this.resource)??C(this.labelService.getUriLabel(this.resource))),this._editorName}getDescription(e=a.MEDIUM){switch(e){case a.SHORT:return this.shortDescription;case a.LONG:return this.longDescription;case a.MEDIUM:default:return this.mediumDescription}}_shortDescription=void 0;get shortDescription(){return typeof this._shortDescription!="string"&&(this._shortDescription=this.labelService.getUriBasenameLabel(h(this.resource))),this._shortDescription}_mediumDescription=void 0;get mediumDescription(){return typeof this._mediumDescription!="string"&&(this._mediumDescription=this.labelService.getUriLabel(h(this.resource),{relative:!0})),this._mediumDescription}_longDescription=void 0;get longDescription(){return typeof this._longDescription!="string"&&(this._longDescription=this.labelService.getUriLabel(h(this.resource))),this._longDescription}_shortTitle=void 0;get shortTitle(){return typeof this._shortTitle!="string"&&(this._shortTitle=this.getName()),this._shortTitle}_mediumTitle=void 0;get mediumTitle(){return typeof this._mediumTitle!="string"&&(this._mediumTitle=this.labelService.getUriLabel(this.resource,{relative:!0})),this._mediumTitle}_longTitle=void 0;get longTitle(){return typeof this._longTitle!="string"&&(this._longTitle=this.labelService.getUriLabel(this.resource)),this._longTitle}getTitle(e){switch(e){case a.SHORT:return this.shortTitle;case a.LONG:return this.longTitle;default:case a.MEDIUM:return this.mediumTitle}}matches(e){return super.matches(e)?!0:this===e||e instanceof n&&this.viewType===e.viewType&&_(this.resource,e.resource)}copy(){return n.create(this.instantiationService,this.resource,this.viewType,this.group,this.webview.options)}isReadonly(){return this._modelRef?this._modelRef.object.isReadonly():this.filesConfigurationService.isReadonly(this.resource)}isDirty(){return this._modelRef?this._modelRef.object.isDirty():!!this._defaultDirtyState}async save(e,i){if(!this._modelRef)return;const t=await this._modelRef.object.saveCustomEditor(i);if(t)return _(t,this.resource)?this:{resource:t}}async saveAs(e,i){if(!this._modelRef)return;const t=this._editorResource,r=await this.fileDialogService.pickFileToSave(t,i?.availableFileSystems);if(r&&await this._modelRef.object.saveCustomEditorAs(this._editorResource,r,i))return(await this.rename(e,r))?.editor}async revert(e,i){if(this._modelRef)return this._modelRef.object.revert(i);this._defaultDirtyState=!1,this._onDidChangeDirty.fire()}async resolve(){if(await super.resolve(),this.isDisposed())return null;if(!this._modelRef){const e=this.capabilities;this._modelRef=this._register(f(await this.customEditorService.models.tryRetain(this.resource,this.viewType))),this._register(this._modelRef.object.onDidChangeDirty(()=>this._onDidChangeDirty.fire())),this._register(this._modelRef.object.onDidChangeReadonly(()=>this._onDidChangeCapabilities.fire())),this._untitledDocumentData&&(this._defaultDirtyState=!0),this.isDirty()&&this._onDidChangeDirty.fire(),this.capabilities!==e&&this._onDidChangeCapabilities.fire()}return null}async rename(e,i){return{editor:{resource:i}}}undo(){return f(this._modelRef),this.undoRedoService.undo(this.resource)}redo(){return f(this._modelRef),this.undoRedoService.redo(this.resource)}_moveHandler;onMove(e){this._moveHandler=e}transfer(e){if(super.transfer(e))return e._moveHandler=this._moveHandler,this._moveHandler=void 0,e}get backupId(){return this._modelRef?this._modelRef.object.backupId:this._backupId}get untitledDocumentData(){return this._untitledDocumentData}toUntyped(){return{resource:this.resource,options:{override:this.viewType}}}claim(e,i,t){if(this.doCanMove(i.vscodeWindowId)!==!0)throw W(m("editorUnsupportedInWindow","Unable to open the editor in this window, it contains modifications that can only be saved in the original window."),[R({id:"openInOriginalWindow",label:m("reopenInOriginalWindow","Open in Original Window"),run:async()=>{const r=this.editorGroupsService.getPart(this.layoutService.getContainer(y(this.webview.container).window));this.editorGroupsService.getPart(this.layoutService.getContainer(i.window)).activeGroup.moveEditor(this,r.activeGroup)}})],{forceMessage:!0});return super.claim(e,i,t)}canMove(e,i){const t=this.editorGroupsService.getGroup(i);if(t){const r=this.doCanMove(t.windowId);if(typeof r=="string")return r}return super.canMove(e,i)}doCanMove(e){return this.isModified()&&this._modelRef?.object.canHotExit===!1&&y(this.webview.container).vscodeWindowId!==e?m("editorCannotMove","Unable to move '{0}': The editor contains changes that can only be saved in its current window.",this.getName()):!0}};n=b([o(3,H),o(4,L),o(5,M),o(6,x),o(7,T),o(8,G),o(9,U),o(10,P),o(11,k),o(12,F),o(13,O)],n);export{n as CustomEditorInput};
