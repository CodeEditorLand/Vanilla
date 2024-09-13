var v=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var u=(n,t,e,i)=>{for(var o=i>1?void 0:i?y(t,e):t,f=n.length-1,r;f>=0;f--)(r=n[f])&&(o=(i?r(t,e,o):r(o))||o);return i&&o&&v(t,e,o),o},c=(n,t)=>(e,i)=>t(e,i,n);import{Disposable as p,DisposableStore as g,toDisposable as M}from"../../../../base/common/lifecycle.js";import{constObservable as S,derived as s,derivedObservableWithWritableCache as _,mapObservableArrayCached as O,observableFromValueWithChangeEvent as w,observableValue as a,transaction as h}from"../../../../base/common/observable.js";import{IInstantiationService as E}from"../../../../platform/instantiation/common/instantiation.js";import{IModelService as R}from"../../../common/services/model.js";import{DiffEditorOptions as V}from"../diffEditor/diffEditorOptions.js";import{DiffEditorViewModel as x}from"../diffEditor/diffEditorViewModel.js";import{RefCounted as C}from"../diffEditor/utils.js";class k extends p{constructor(e,i){super();this.model=e;this._instantiationService=i}_documents=w(this.model,this.model.documents);_documentsArr=s(this,e=>{const i=this._documents.read(e);return i==="loading"?[]:i});isLoading=s(this,e=>this._documents.read(e)==="loading");items=O(this,this._documentsArr,(e,i)=>i.add(this._instantiationService.createInstance(d,e,this))).recomputeInitiallyAndOnChange(this._store);focusedDiffItem=s(this,e=>this.items.read(e).find(i=>i.isFocused.read(e)));activeDiffItem=_(this,(e,i)=>this.focusedDiffItem.read(e)??(i&&this.items.read(e).indexOf(i)!==-1)?i:void 0);async waitForDiffs(){for(const e of this.items.get())await e.diffEditorViewModel.waitForDiff()}collapseAll(){h(e=>{for(const i of this.items.get())i.collapsed.set(!0,e)})}expandAll(){h(e=>{for(const i of this.items.get())i.collapsed.set(!1,e)})}get contextKeys(){return this.model.contextKeys}}let d=class extends p{constructor(e,i,o,f){super();this._editorViewModel=i;this._instantiationService=o;this._modelService=f;this._register(M(()=>{this.isAlive.set(!1,void 0)})),this.documentDiffItemRef=this._register(e.createNewRef(this));function r(D){return{...D,hideUnchangedRegions:{enabled:!0}}}const m=this._instantiationService.createInstance(V,r(this.documentDiffItem.options||{}));this.documentDiffItem.onOptionsDidChange&&this._register(this.documentDiffItem.onOptionsDidChange(()=>{m.updateOptions(r(this.documentDiffItem.options||{}))}));const l=new g,b=this.documentDiffItem.original??l.add(this._modelService.createModel("",null)),I=this.documentDiffItem.modified??l.add(this._modelService.createModel("",null));l.add(this.documentDiffItemRef.createNewRef(this)),this.diffEditorViewModelRef=this._register(C.createWithDisposable(this._instantiationService.createInstance(x,{original:b,modified:I},m),l,this))}diffEditorViewModelRef;get diffEditorViewModel(){return this.diffEditorViewModelRef.object}collapsed=a(this,!1);lastTemplateData=a(this,{contentHeight:500,selections:void 0});get originalUri(){return this.documentDiffItem.original?.uri}get modifiedUri(){return this.documentDiffItem.modified?.uri}isActive=s(this,e=>this._editorViewModel.activeDiffItem.read(e)===this);_isFocusedSource=a(this,S(!1));isFocused=s(this,e=>this._isFocusedSource.read(e).read(e));setIsFocused(e,i){this._isFocusedSource.set(e,i)}documentDiffItemRef;get documentDiffItem(){return this.documentDiffItemRef.object}isAlive=a(this,!0);getKey(){return JSON.stringify([this.originalUri?.toString(),this.modifiedUri?.toString()])}};d=u([c(2,E),c(3,R)],d);export{d as DocumentDiffItemViewModel,k as MultiDiffEditorViewModel};
