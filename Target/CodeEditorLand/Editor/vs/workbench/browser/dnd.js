var j=Object.defineProperty;var J=Object.getOwnPropertyDescriptor;var A=(d,r,e,a)=>{for(var o=a>1?void 0:a?J(r,e):r,t=d.length-1,s;t>=0;t--)(s=d[t])&&(o=(a?s(r,e,o):s(o))||o);return a&&o&&j(r,e,o),o},c=(d,r)=>(e,a)=>r(e,a,d);import{DataTransfers as E}from"../../base/browser/dnd.js";import{DragAndDropObserver as W,EventType as U,addDisposableListener as F,onDidRegisterWindow as q}from"../../base/browser/dom.js";import{coalesce as S}from"../../base/common/arrays.js";import{UriList as T}from"../../base/common/dataTransfer.js";import{Emitter as k,Event as z}from"../../base/common/event.js";import{Disposable as V,DisposableStore as M,markAsSingleton as K}from"../../base/common/lifecycle.js";import{stringify as X}from"../../base/common/marshalling.js";import{Mimes as O}from"../../base/common/mime.js";import{FileAccess as Q,Schemas as b}from"../../base/common/network.js";import{isWindows as Y}from"../../base/common/platform.js";import{basename as N,isEqual as Z}from"../../base/common/resources.js";import{URI as x}from"../../base/common/uri.js";import{CodeDataTransfers as $,Extensions as ee,LocalSelectionTransfer as re,createDraggedEditorInputFromRawResourcesData as te,extractEditorsAndFilesDropData as ae}from"../../platform/dnd/browser/dnd.js";import{IFileService as G}from"../../platform/files/common/files.js";import{IInstantiationService as _}from"../../platform/instantiation/common/instantiation.js";import{ILabelService as oe}from"../../platform/label/common/label.js";import{extractSelection as ie}from"../../platform/opener/common/opener.js";import{Registry as ne}from"../../platform/registry/common/platform.js";import{IWorkspaceContextService as se,hasWorkspaceFileExtension as de,isTemporaryWorkspace as ge}from"../../platform/workspace/common/workspace.js";import{IWorkspacesService as De}from"../../platform/workspaces/common/workspaces.js";import{EditorResourceAccessor as pe,isEditorIdentifier as P,isResourceDiffEditorInput as ce,isResourceMergeEditorInput as fe,isResourceSideBySideEditorInput as ve}from"../common/editor.js";import{IEditorService as B}from"../services/editor/common/editorService.js";import{IHostService as ue}from"../services/host/browser/host.js";import{ITextFileService as le}from"../services/textfile/common/textfiles.js";import{IWorkspaceEditingService as me}from"../services/workspaces/common/workspaceEditing.js";import{mainWindow as he}from"../../base/browser/window.js";import{BroadcastDataChannel as Ie}from"../../base/browser/broadcast.js";class wr{constructor(r){this.identifier=r}}class yr{constructor(r){this.identifier=r}}async function Ar(d){const r=[],e=O.uriList.toLowerCase();if(d.has(e))try{const a=await d.get(e)?.asString(),o=JSON.stringify(T.parse(a??""));r.push(...te(o))}catch{}return r}let w=class{constructor(r,e,a,o,t,s,p,u){this.options=r;this.fileService=e;this.workspacesService=a;this.editorService=o;this.workspaceEditingService=t;this.hostService=s;this.contextService=p;this.instantiationService=u}async handleDrop(r,e,a,o,t){const s=await this.instantiationService.invokeFunction(g=>ae(g,r));if(!s.length)return;if(await this.hostService.focus(e),this.options.allowWorkspaceOpen){const g=S(s.filter(f=>f.allowWorkspaceOpen&&f.resource?.scheme===b.file).map(f=>f.resource));if(g.length>0&&await this.handleWorkspaceDrop(g))return}const p=S(s.filter(g=>g.isExternal&&g.resource?.scheme===b.file).map(g=>g.resource));p.length&&this.workspacesService.addRecentlyOpened(p.map(g=>({fileUri:g})));const u=a?.();await this.editorService.openEditors(s.map(g=>({...g,resource:g.resource,options:{...g.options,...t,pinned:!0}})),u,{validateTrust:!0}),o?.(u)}async handleWorkspaceDrop(r){const e=[],a=[];return await Promise.all(r.map(async o=>{if(de(o)){e.push({workspaceUri:o});return}try{const t=await this.fileService.stat(o);t.isDirectory&&(e.push({folderUri:t.resource}),a.push({uri:t.resource}))}catch{}})),e.length===0?!1:(e.length>a.length||a.length===1?await this.hostService.openWindow(e):ge(this.contextService.getWorkspace())?await this.workspaceEditingService.addFolders(a):await this.workspaceEditingService.createAndEnterWorkspace(a),!0)}};w=A([c(1,G),c(2,De),c(3,B),c(4,me),c(5,ue),c(6,se),c(7,_)],w);function Ee(d,r,e,a){if(r.length===0||!e.dataTransfer)return;const o=d.get(le),t=d.get(B),s=d.get(G),p=d.get(oe),u=S(r.map(i=>x.isUri(i)?{resource:i}:P(i)?x.isUri(i.editor.resource)?{resource:i.editor.resource}:void 0:i)),g=u.filter(({resource:i})=>s.hasProvider(i));if(!a?.disableStandardTransfer){const i=Y?`\r
`:`
`;e.dataTransfer.setData(E.TEXT,g.map(({resource:D})=>p.getUriLabel(D,{noPrefix:!0})).join(i));const n=g.find(({isDirectory:D})=>!D);if(n){const D=Q.uriToFileUri(n.resource);D.scheme===b.file&&e.dataTransfer.setData(E.DOWNLOAD_URL,[O.binary,N(n.resource),D.toString()].join(":"))}}const f=g.filter(({isDirectory:i})=>!i);f.length&&e.dataTransfer.setData(E.RESOURCES,JSON.stringify(f.map(({resource:i})=>i.toString())));const H=ne.as(ee.DragAndDropContribution).getAll();for(const i of H)i.setData(u,e);const I=[];for(const i of r){let n;if(P(i)){const D=i.editor.toUntyped({preserveViewState:i.groupId});D&&(n={...D,resource:pe.getCanonicalUri(D)})}else if(x.isUri(i)){const{selection:D,uri:v}=ie(i);n={resource:v,options:D?{selection:D}:void 0}}else i.isDirectory||(n={resource:i.resource});if(n){{const D=n.resource;if(D){const v=o.files.get(D);v&&(typeof n.languageId!="string"&&(n.languageId=v.getLanguageId()),typeof n.encoding!="string"&&(n.encoding=v.getEncoding()),typeof n.contents!="string"&&v.isDirty()&&!v.textEditorModel.isTooLargeForHeapOperation()&&(n.contents=v.textEditorModel.getValue())),n.options?.viewState||(n.options={...n.options,viewState:(()=>{for(const C of t.visibleEditorPanes)if(Z(C.input.resource,D)){const L=C.getViewState();if(L)return L}})()})}}I.push(n)}}if(I.length){e.dataTransfer.setData($.EDITORS,X(I));const i=[];for(const n of I)n.resource?i.push(n.resource):ce(n)?n.modified.resource&&i.push(n.modified.resource):ve(n)?n.primary.resource&&i.push(n.primary.resource):fe(n)&&i.push(n.result.resource);a?.disableStandardTransfer||e.dataTransfer.setData(O.uriList,T.create(i.slice(0,1))),e.dataTransfer.setData(E.INTERNAL_URI_LIST,T.create(i))}}class Se{constructor(r,e){this.type=r;this.id=e}update(r){}getData(){return{type:this.type,id:this.id}}}class m{constructor(r){this.compositeId=r}get id(){return this.compositeId}}class h{constructor(r){this.viewId=r}get id(){return this.viewId}}class l extends V{static instance;static get INSTANCE(){return l.instance||(l.instance=new l,K(l.instance)),l.instance}transferData=re.getInstance();onDragStart=this._register(new k);onDragEnd=this._register(new k);constructor(){super(),this._register(this.onDragEnd.event(r=>{const e=r.dragAndDropData.getData().id,a=r.dragAndDropData.getData().type;this.readDragData(a)?.getData().id===e&&this.transferData.clearData(a==="view"?h.prototype:m.prototype)}))}readDragData(r){if(this.transferData.hasData(r==="view"?h.prototype:m.prototype)){const e=this.transferData.getData(r==="view"?h.prototype:m.prototype);if(e&&e[0])return new Se(r,e[0].id)}}writeDragData(r,e){this.transferData.setData([e==="view"?new h(r):new m(r)],e==="view"?h.prototype:m.prototype)}registerTarget(r,e){const a=new M;return a.add(new W(r,{onDragEnter:o=>{if(o.preventDefault(),e.onDragEnter){const t=this.readDragData("composite")||this.readDragData("view");t&&e.onDragEnter({eventData:o,dragAndDropData:t})}},onDragLeave:o=>{const t=this.readDragData("composite")||this.readDragData("view");e.onDragLeave&&t&&e.onDragLeave({eventData:o,dragAndDropData:t})},onDrop:o=>{if(e.onDrop){const t=this.readDragData("composite")||this.readDragData("view");if(!t)return;e.onDrop({eventData:o,dragAndDropData:t}),this.onDragEnd.fire({eventData:o,dragAndDropData:t})}},onDragOver:o=>{if(o.preventDefault(),e.onDragOver){const t=this.readDragData("composite")||this.readDragData("view");if(!t)return;e.onDragOver({eventData:o,dragAndDropData:t})}}})),e.onDragStart&&this.onDragStart.event(o=>{e.onDragStart(o)},this,a),e.onDragEnd&&this.onDragEnd.event(o=>{e.onDragEnd(o)},this,a),this._register(a)}registerDraggable(r,e,a){r.draggable=!0;const o=new M;return o.add(new W(r,{onDragStart:t=>{const{id:s,type:p}=e();this.writeDragData(s,p),t.dataTransfer?.setDragImage(r,0,0),this.onDragStart.fire({eventData:t,dragAndDropData:this.readDragData(p)})},onDragEnd:t=>{const{type:s}=e(),p=this.readDragData(s);p&&this.onDragEnd.fire({eventData:t,dragAndDropData:p})},onDragEnter:t=>{if(a.onDragEnter){const s=this.readDragData("composite")||this.readDragData("view");if(!s)return;s&&a.onDragEnter({eventData:t,dragAndDropData:s})}},onDragLeave:t=>{const s=this.readDragData("composite")||this.readDragData("view");s&&a.onDragLeave?.({eventData:t,dragAndDropData:s})},onDrop:t=>{if(a.onDrop){const s=this.readDragData("composite")||this.readDragData("view");if(!s)return;a.onDrop({eventData:t,dragAndDropData:s}),this.onDragEnd.fire({eventData:t,dragAndDropData:s})}},onDragOver:t=>{if(a.onDragOver){const s=this.readDragData("composite")||this.readDragData("view");if(!s)return;a.onDragOver({eventData:t,dragAndDropData:s})}}})),a.onDragStart&&this.onDragStart.event(t=>{a.onDragStart(t)},this,o),a.onDragEnd&&this.onDragEnd.event(t=>{a.onDragEnd(t)},this,o),this._register(o)}}function Tr(d,r,e){d&&(d.dropEffect=e?r:"none")}let y=class{constructor(r,e){this.toResource=r;this.instantiationService=e}getDragURI(r){const e=this.toResource(r);return e?e.toString():null}getDragLabel(r){const e=S(r.map(this.toResource));return e.length===1?N(e[0]):e.length>1?String(e.length):void 0}onDragStart(r,e){const a=[];for(const o of r.elements){const t=this.toResource(o);t&&a.push(t)}a.length&&this.instantiationService.invokeFunction(o=>Ee(o,a,e))}onDragOver(r,e,a,o,t){return!1}drop(r,e,a,o,t){}dispose(){}};y=A([c(1,_)],y);class R extends V{static CHANNEL_NAME="monaco-workbench-global-dragged-over";broadcaster=this._register(new Ie(R.CHANNEL_NAME));constructor(){super(),this.registerListeners()}registerListeners(){this._register(z.runAndSubscribe(q,({window:r,disposables:e})=>{e.add(F(r,U.DRAG_OVER,()=>this.markDraggedOver(!1),!0)),e.add(F(r,U.DRAG_LEAVE,()=>this.clearDraggedOver(!1),!0))},{window:he,disposables:this._store})),this._register(this.broadcaster.onDidReceiveData(r=>{r===!0?this.markDraggedOver(!0):this.clearDraggedOver(!0)}))}draggedOver=!1;get isDraggedOver(){return this.draggedOver}markDraggedOver(r){this.draggedOver!==!0&&(this.draggedOver=!0,r||this.broadcaster.postData(!0))}clearDraggedOver(r){this.draggedOver!==!1&&(this.draggedOver=!1,r||this.broadcaster.postData(!1))}}const we=new R;function Or(){return we.isDraggedOver}export{Se as CompositeDragAndDropData,l as CompositeDragAndDropObserver,m as DraggedCompositeIdentifier,yr as DraggedEditorGroupIdentifier,wr as DraggedEditorIdentifier,h as DraggedViewIdentifier,y as ResourceListDnDHandler,w as ResourcesDropHandler,Ar as extractTreeDropData,Ee as fillEditorsDragData,Or as isWindowDraggedOver,Tr as toggleDropEffect};
