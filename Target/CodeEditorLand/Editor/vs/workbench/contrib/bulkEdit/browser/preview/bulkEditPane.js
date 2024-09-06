var T=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var _=(h,u,e,i)=>{for(var t=i>1?void 0:i?P(u,e):u,r=h.length-1,s;r>=0;r--)(s=h[r])&&(t=(i?s(u,e,t):s(t))||t);return i&&t&&T(u,e,t),t},o=(h,u)=>(e,i)=>u(e,i,h);import{ButtonBar as V}from"../../../../../base/browser/ui/button/button.js";import"../../../../../base/browser/ui/tree/tree.js";import{CachedFunction as H,LRUCachedFunction as L}from"../../../../../base/common/cache.js";import"../../../../../base/common/cancellation.js";import"../../../../../base/common/filters.js";import{DisposableStore as g}from"../../../../../base/common/lifecycle.js";import"../../../../../base/common/types.js";import{URI as m}from"../../../../../base/common/uri.js";import"./bulkEdit.css";import"../../../../../editor/browser/services/bulkEditService.js";import"../../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.js";import"../../../../../editor/common/core/range.js";import{ITextModelService as G}from"../../../../../editor/common/services/resolverService.js";import{localize as p}from"../../../../../nls.js";import{MenuId as I}from"../../../../../platform/actions/common/actions.js";import{IConfigurationService as U}from"../../../../../platform/configuration/common/configuration.js";import{IContextKeyService as A,RawContextKey as f}from"../../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as y}from"../../../../../platform/contextview/browser/contextView.js";import{IDialogService as N}from"../../../../../platform/dialogs/common/dialogs.js";import{IHoverService as K}from"../../../../../platform/hover/browser/hover.js";import{IInstantiationService as z}from"../../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as W}from"../../../../../platform/keybinding/common/keybinding.js";import{ILabelService as $}from"../../../../../platform/label/common/label.js";import{WorkbenchAsyncDataTree as j}from"../../../../../platform/list/browser/listService.js";import{IOpenerService as q}from"../../../../../platform/opener/common/opener.js";import{IStorageService as J,StorageScope as S,StorageTarget as Q}from"../../../../../platform/storage/common/storage.js";import{ITelemetryService as X}from"../../../../../platform/telemetry/common/telemetry.js";import{defaultButtonStyles as E}from"../../../../../platform/theme/browser/defaultStyles.js";import{IThemeService as Y}from"../../../../../platform/theme/common/themeService.js";import{ResourceLabels as Z}from"../../../../browser/labels.js";import{ViewPane as ee}from"../../../../browser/parts/views/viewPane.js";import"../../../../browser/parts/views/viewsViewlet.js";import"../../../../common/editor.js";import{IViewDescriptorService as te}from"../../../../common/views.js";import{ACTIVE_GROUP as ie,IEditorService as re,SIDE_GROUP as oe}from"../../../../services/editor/common/editorService.js";import{BulkEditPreviewProvider as C,BulkFileOperations as se,BulkFileOperationType as ne}from"./bulkEditPreview.js";import{BulkEditAccessibilityProvider as ae,BulkEditDataSource as ce,BulkEditDelegate as le,BulkEditIdentityProvider as de,BulkEditNaviLabelProvider as ue,BulkEditSorter as pe,CategoryElement as D,CategoryElementRenderer as he,compareBulkFileOperations as me,FileElement as v,FileElementRenderer as fe,TextEditElement as b,TextEditElementRenderer as ve}from"./bulkEditTree.js";var _e=(e=>(e.Data="data",e.Message="message",e))(_e||{});let l=class extends ee{constructor(e,i,t,r,s,n,c,d,a,w,B,k,x,F,R,O,M){super({...e,titleMenuId:I.BulkEditTitle},B,k,x,a,w,i,F,R,O,M);this._instaService=i;this._editorService=t;this._labelService=r;this._textModelService=s;this._dialogService=n;this._contextMenuService=c;this._storageService=d;this.element.classList.add("bulk-edit-panel","show-file-icons"),this._ctxHasCategories=l.ctxHasCategories.bindTo(a),this._ctxGroupByFile=l.ctxGroupByFile.bindTo(a),this._ctxHasCheckedChanges=l.ctxHasCheckedChanges.bindTo(a),this.telemetryService.publicLog2("views.bulkEditPane")}static ID="refactorPreview";static Schema="vscode-bulkeditpreview-multieditor";static ctxHasCategories=new f("refactorPreview.hasCategories",!1);static ctxGroupByFile=new f("refactorPreview.groupByFile",!0);static ctxHasCheckedChanges=new f("refactorPreview.hasCheckedChanges",!0);static _memGroupByFile=`${this.ID}.groupByFile`;_tree;_treeDataSource;_treeViewStates=new Map;_message;_ctxHasCategories;_ctxGroupByFile;_ctxHasCheckedChanges;_disposables=new g;_sessionDisposables=new g;_currentResolve;_currentInput;_currentProvider;dispose(){this._tree.dispose(),this._disposables.dispose(),super.dispose()}renderBody(e){super.renderBody(e);const i=this._instaService.createInstance(Z,{onDidChangeVisibility:this.onDidChangeBodyVisibility});this._disposables.add(i);const t=document.createElement("div");t.className="content",e.appendChild(t);const r=document.createElement("div");t.appendChild(r),this._treeDataSource=this._instaService.createInstance(ce),this._treeDataSource.groupByFile=this._storageService.getBoolean(l._memGroupByFile,S.PROFILE,!0),this._ctxGroupByFile.set(this._treeDataSource.groupByFile),this._tree=this._instaService.createInstance(j,this.id,r,new le,[this._instaService.createInstance(ve),this._instaService.createInstance(fe,i),this._instaService.createInstance(he)],this._treeDataSource,{accessibilityProvider:this._instaService.createInstance(ae),identityProvider:new de,expandOnlyOnTwistieClick:!0,multipleSelectionSupport:!1,keyboardNavigationLabelProvider:new ue,sorter:new pe,selectionNavigation:!0}),this._disposables.add(this._tree.onContextMenu(this._onContextMenu,this)),this._disposables.add(this._tree.onDidOpen(a=>this._openElementInMultiDiffEditor(a)));const s=document.createElement("div");s.className="buttons",t.appendChild(s);const n=new V(s);this._disposables.add(n);const c=n.addButton({supportIcons:!0,...E});c.label=p("ok","Apply"),c.onDidClick(()=>this.accept(),this,this._disposables);const d=n.addButton({...E,secondary:!0});d.label=p("cancel","Discard"),d.onDidClick(()=>this.discard(),this,this._disposables),this._message=document.createElement("span"),this._message.className="message",this._message.innerText=p("empty.msg","Invoke a code action, like rename, to see a preview of its changes here."),e.appendChild(this._message),this._setState("message")}layoutBody(e,i){super.layoutBody(e,i);const t=e-50;this._tree.getHTMLElement().parentElement.style.height=`${t}px`,this._tree.layout(t,i)}_setState(e){this.element.dataset.state=e}async setInput(e,i){this._setState("data"),this._sessionDisposables.clear(),this._treeViewStates.clear(),this._currentResolve&&(this._currentResolve(void 0),this._currentResolve=void 0);const t=await this._instaService.invokeFunction(se.create,e);this._currentProvider=this._instaService.createInstance(C,t),this._sessionDisposables.add(this._currentProvider),this._sessionDisposables.add(t);const r=t.categories.length>1;return this._ctxHasCategories.set(r),this._treeDataSource.groupByFile=!r||this._treeDataSource.groupByFile,this._ctxHasCheckedChanges.set(t.checked.checkedCount>0),this._currentInput=t,new Promise(s=>{i.onCancellationRequested(()=>s(void 0)),this._currentResolve=s,this._setTreeInput(t),this._sessionDisposables.add(t.checked.onDidChange(()=>{this._tree.updateChildren(),this._ctxHasCheckedChanges.set(t.checked.checkedCount>0)}))})}hasInput(){return!!this._currentInput}async _setTreeInput(e){const i=this._treeViewStates.get(this._treeDataSource.groupByFile);if(await this._tree.setInput(e,i),this._tree.domFocus(),i)return;const t=[...this._tree.getNode(e).children].slice(0,10);for(;t.length>0;){const{element:r}=t.shift();r instanceof v&&await this._tree.expand(r,!0),r instanceof D&&(await this._tree.expand(r,!0),t.push(...this._tree.getNode(r).children))}}accept(){const e=this._currentInput?.conflicts.list();if(!e||e.length===0){this._done(!0);return}let i;e.length===1?i=p("conflict.1","Cannot apply refactoring because '{0}' has changed in the meantime.",this._labelService.getUriLabel(e[0],{relative:!0})):i=p("conflict.N","Cannot apply refactoring because {0} other files have changed in the meantime.",e.length),this._dialogService.warn(i).finally(()=>this._done(!1))}discard(){this._done(!1)}_done(e){this._currentResolve?.(e?this._currentInput?.getWorkspaceEdit():void 0),this._currentInput=void 0,this._setState("message"),this._sessionDisposables.clear()}toggleChecked(){const[e]=this._tree.getFocus();((e instanceof v||e instanceof b)&&!e.isDisabled()||e instanceof D)&&e.setChecked(!e.isChecked())}groupByFile(){this._treeDataSource.groupByFile||this.toggleGrouping()}groupByType(){this._treeDataSource.groupByFile&&this.toggleGrouping()}toggleGrouping(){const e=this._tree.getInput();if(e){const i=this._tree.getViewState();this._treeViewStates.set(this._treeDataSource.groupByFile,i),this._treeDataSource.groupByFile=!this._treeDataSource.groupByFile,this._setTreeInput(e),this._storageService.store(l._memGroupByFile,this._treeDataSource.groupByFile,S.PROFILE,Q.USER),this._ctxGroupByFile.set(this._treeDataSource.groupByFile)}}async _openElementInMultiDiffEditor(e){const i=this._currentInput?.fileOperations;if(!i)return;let t,r;if(e.element instanceof b)r=e.element.parent,t=e.element.edit.textEdit.textEdit.range;else if(e.element instanceof v)r=e.element,t=e.element.edit.textEdits[0]?.textEdit.textEdit.range;else return;const s=await this._computeResourceDiffEditorInputs.get(i),n=await s.getResourceDiffEditorInputIdOfOperation(r.edit),c={...e.editorOptions,viewState:{revealData:{resource:n,range:t}}},d=m.from({scheme:l.Schema}),a="Refactor Preview";this._editorService.openEditor({multiDiffSource:d,label:a,options:c,isTransient:!0,description:a,resources:s.resources},e.sideBySide?oe:ie)}_computeResourceDiffEditorInputs=new L(async e=>{const i=new H(async n=>{const c=n.uri,d=this._currentProvider.asPreviewUri(c);if(n.type&ne.Delete)return{original:{resource:m.revive(d)},modified:{resource:void 0},goToFileResource:n.uri};{let a;try{(await this._textModelService.createModelReference(c)).dispose(),a=c}catch{a=C.emptyPreview}return{original:{resource:m.revive(a)},modified:{resource:m.revive(d)},goToFileResource:a}}}),t=e.slice().sort(me),r=[];for(const n of t)r.push(await i.get(n));return{resources:r,getResourceDiffEditorInputIdOfOperation:async n=>{const c=await i.get(n);return{original:c.original.resource,modified:c.modified.resource}}}});_onContextMenu(e){this._contextMenuService.showContextMenu({menuId:I.BulkEditContext,contextKeyService:this.contextKeyService,getAnchor:()=>e.anchor})}};l=_([o(1,z),o(2,re),o(3,$),o(4,G),o(5,N),o(6,y),o(7,J),o(8,A),o(9,te),o(10,W),o(11,y),o(12,U),o(13,q),o(14,Y),o(15,X),o(16,K)],l);export{l as BulkEditPane};
