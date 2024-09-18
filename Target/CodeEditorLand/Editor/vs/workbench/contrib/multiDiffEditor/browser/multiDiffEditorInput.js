var F=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var b=(n,r,e,i)=>{for(var t=i>1?void 0:i?P(r,e):r,o=n.length-1,a;o>=0;o--)(a=n[o])&&(t=(i?a(r,e,t):a(t))||t);return i&&t&&F(r,e,t),t},u=(n,r)=>(e,i)=>r(e,i,n);import{LazyStatefulPromise as k,raceTimeout as z}from"../../../../base/common/async.js";import{BugIndicatingError as L,onUnexpectedError as M}from"../../../../base/common/errors.js";import{Event as V,ValueWithChangeEvent as W}from"../../../../base/common/event.js";import"../../../../base/common/htmlContent.js";import{Disposable as K,DisposableStore as A}from"../../../../base/common/lifecycle.js";import{parse as N}from"../../../../base/common/marshalling.js";import{Schemas as j}from"../../../../base/common/network.js";import{deepClone as R}from"../../../../base/common/objects.js";import{ObservableLazyPromise as G,ValueWithChangeEventFromObservable as H,autorun as q,constObservable as E,derived as g,mapObservableArrayCached as O,observableFromEvent as J,observableFromValueWithChangeEvent as B,observableValue as $,recomputeInitiallyAndOnChange as Q}from"../../../../base/common/observable.js";import"../../../../base/common/themables.js";import{isDefined as X,isObject as Y}from"../../../../base/common/types.js";import{URI as v}from"../../../../base/common/uri.js";import{RefCounted as Z}from"../../../../editor/browser/widget/diffEditor/utils.js";import"../../../../editor/browser/widget/multiDiffEditor/model.js";import{MultiDiffEditorViewModel as ee}from"../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.js";import"../../../../editor/common/config/editorOptions.js";import{ITextModelService as ie}from"../../../../editor/common/services/resolverService.js";import{ITextResourceConfigurationService as te}from"../../../../editor/common/services/textResourceConfiguration.js";import{localize as x}from"../../../../nls.js";import{ConfirmResult as re}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as w}from"../../../../platform/instantiation/common/instantiation.js";import"../../../browser/parts/editor/textEditor.js";import{DEFAULT_EDITOR_ASSOCIATION as I,EditorInputCapabilities as oe}from"../../../common/editor.js";import{EditorInput as ne}from"../../../common/editor/editorInput.js";import{IEditorResolverService as se,RegisteredEditorPriority as ae}from"../../../services/editor/common/editorResolverService.js";import{ITextFileService as de}from"../../../services/textfile/common/textfiles.js";import{MultiDiffEditorIcon as le}from"./icons.contribution.js";import{IMultiDiffSourceResolverService as fe,MultiDiffEditorItem as U}from"./multiDiffSourceResolverService.js";let d=class extends ne{constructor(e,i,t,o=!1,a,f,S,s,p){super();this.multiDiffSource=e;this.label=i;this.initialResources=t;this.isTransient=o;this._textModelService=a;this._textResourceConfigurationService=f;this._instantiationService=S;this._multiDiffSourceResolverService=s;this._textFileService=p;this._register(q(c=>{const l=this.resources.read(c),m=this.label??x("name","Multi Diff Editor");l?this._name=m+x({key:"files",comment:["the number of files being shown"]}," ({0} files)",l.length):this._name=m,this._onDidChangeLabel.fire()}))}static fromResourceMultiDiffEditorInput(e,i){if(!e.multiDiffSource&&!e.resources)throw new L("MultiDiffEditorInput requires either multiDiffSource or resources");const t=e.multiDiffSource??v.parse(`multi-diff-editor:${new Date().getMilliseconds().toString()+Math.random().toString()}`);return i.createInstance(d,t,e.label,e.resources?.map(o=>new U(o.original.resource,o.modified.resource,o.goToFileResource)),e.isTransient??!1)}static fromSerialized(e,i){return i.createInstance(d,v.parse(e.multiDiffSourceUri),e.label,e.resources?.map(t=>new U(t.originalUri?v.parse(t.originalUri):void 0,t.modifiedUri?v.parse(t.modifiedUri):void 0,t.goToFileUri?v.parse(t.goToFileUri):void 0)),!1)}static ID="workbench.input.multiDiffEditor";get resource(){return this.multiDiffSource}get capabilities(){return oe.Readonly}get typeId(){return d.ID}_name="";getName(){return this._name}get editorId(){return I.id}getIcon(){return le}serialize(){return{label:this.label,multiDiffSourceUri:this.multiDiffSource.toString(),resources:this.initialResources?.map(e=>({originalUri:e.originalUri?.toString(),modifiedUri:e.modifiedUri?.toString(),goToFileUri:e.goToFileUri?.toString()}))}}setLanguageId(e,i){const o=this._viewModel.requireValue().activeDiffItem.get()?.documentDiffItem;if(!o)return;const a=o.modified??o.original;a&&a.setLanguage(e,i)}async getViewModel(){return this._viewModel.getPromise()}_viewModel=new k(async()=>{const e=await this._createModel();this._register(e);const i=new ee(e,this._instantiationService);return this._register(i),await z(i.waitForDiffs(),1e3),i});async _createModel(){const e=await this._resolvedSource.getPromise(),i=this._textResourceConfigurationService,t=O(this,e.resources,async(s,p)=>{let c,l;const m=new A;try{[c,l]=await Promise.all([s.originalUri?this._textModelService.createModelReference(s.originalUri):void 0,s.modifiedUri?this._textModelService.createModelReference(s.modifiedUri):void 0]),c&&m.add(c),l&&m.add(l)}catch(y){M(y);return}const D=s.modifiedUri??s.originalUri,C={multiDiffEditorItem:s,original:c?.object.textEditorModel,modified:l?.object.textEditorModel,contextKeys:s.contextKeys,get options(){return{...ce(l?.object.isReadonly()??!0),...me(i.getValue(D))}},onOptionsDidChange:y=>this._textResourceConfigurationService.onDidChangeConfiguration(_=>{(_.affectsConfiguration(D,"editor")||_.affectsConfiguration(D,"diffEditor"))&&y()})};return p.add(Z.createOfNonDisposable(C,m,this))},s=>JSON.stringify([s.modifiedUri?.toString(),s.originalUri?.toString()])),o=$("documents","loading"),a=g(async s=>{const p=t.read(s),l=(await Promise.all(p)).filter(X);o.set(l,void 0)}),f=Q(a);return await a.get(),{dispose:()=>f.dispose(),documents:new H(o),contextKeys:e.source?.contextKeys}}_resolvedSource=new G(async()=>{const e=this.initialResources?{resources:W.const(this.initialResources)}:await this._multiDiffSourceResolverService.resolve(this.multiDiffSource);return{source:e,resources:e?B(this,e.resources):E([])}});matches(e){return super.matches(e)?!0:e instanceof d?this.multiDiffSource.toString()===e.multiDiffSource.toString():!1}resources=g(this,e=>this._resolvedSource.cachedPromiseResult.read(e)?.data?.resources.read(e));textFileServiceOnDidChange=new ue(this._textFileService.files.onDidChangeDirty,e=>e.resource.toString(),e=>e.toString());_isDirtyObservables=O(this,this.resources.map(e=>e??[]),e=>{const i=e.modifiedUri?T(this.textFileServiceOnDidChange,this._textFileService,e.modifiedUri):E(!1),t=e.originalUri?T(this.textFileServiceOnDidChange,this._textFileService,e.originalUri):E(!1);return g(o=>i.read(o)||t.read(o))},e=>e.getKey());_isDirtyObservable=g(this,e=>this._isDirtyObservables.read(e).some(i=>i.read(e))).keepObserved(this._store);onDidChangeDirty=V.fromObservableLight(this._isDirtyObservable);isDirty(){return this._isDirtyObservable.get()}async save(e,i){return await this.doSaveOrRevert("save",e,i),this}revert(e,i){return this.doSaveOrRevert("revert",e,i)}async doSaveOrRevert(e,i,t){const o=this._viewModel.currentValue?.items.get();o&&await Promise.all(o.map(async a=>{const f=a.diffEditorViewModel.model,S=f.original.uri.scheme!==j.untitled&&this._textFileService.isDirty(f.original.uri);await Promise.all([S?e==="save"?this._textFileService.save(f.original.uri,t):this._textFileService.revert(f.original.uri,t):Promise.resolve(),e==="save"?this._textFileService.save(f.modified.uri,t):this._textFileService.revert(f.modified.uri,t)])}))}closeHandler={async confirm(){return re.DONT_SAVE},showConfirm(){return!1}}};d=b([u(4,ie),u(5,te),u(6,w),u(7,fe),u(8,de)],d);class ue{constructor(r,e,i){this._event=r;this._getEventArgsKey=e;this._keyToString=i}_count=0;_buckets=new Map;_eventSubscription;filteredEvent(r){return e=>{const i=this._keyToString(r);let t=this._buckets.get(i);return t||(t=new Set,this._buckets.set(i,t)),t.add(e),this._count++,this._count===1&&(this._eventSubscription=this._event(this._handleEventChange)),{dispose:()=>{t.delete(e),t.size===0&&this._buckets.delete(i),this._count--,this._count===0&&(this._eventSubscription?.dispose(),this._eventSubscription=void 0)}}}}_handleEventChange=r=>{const e=this._getEventArgsKey(r),i=this._buckets.get(e);if(i)for(const t of i)t(r)}}function T(n,r,e){return J(n.filteredEvent(e),()=>r.isDirty(e))}function ce(n){return{readOnly:!!n,readOnlyMessage:typeof n!="boolean"?n:void 0}}function me(n){const r=R(n.editor);if(Y(n.diffEditor)){const e=R(n.diffEditor);e.diffCodeLens=e.codeLens,delete e.codeLens,e.diffWordWrap=e.wordWrap,delete e.wordWrap,Object.assign(r,e)}return r}let h=class extends K{static ID="workbench.contrib.multiDiffEditorResolver";constructor(r,e){super(),this._register(r.registerEditor("*",{id:I.id,label:I.displayName,detail:I.providerDisplayName,priority:ae.builtin},{},{createMultiDiffEditorInput:i=>({editor:d.fromResourceMultiDiffEditorInput(i,e)})}))}};h=b([u(0,se),u(1,w)],h);class li{canSerialize(r){return r instanceof d&&!r.isTransient}serialize(r){if(this.canSerialize(r))return JSON.stringify(r.serialize())}deserialize(r,e){try{const i=N(e);return d.fromSerialized(i,r)}catch(i){M(i);return}}}export{d as MultiDiffEditorInput,h as MultiDiffEditorResolverContribution,li as MultiDiffEditorSerializer};
