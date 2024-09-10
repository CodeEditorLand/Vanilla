var v=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var m=(r,t,e,i)=>{for(var o=i>1?void 0:i?g(t,e):t,f=r.length-1,n;f>=0;f--)(n=r[f])&&(o=(i?n(t,e,o):n(o))||o);return i&&o&&v(t,e,o),o},c=(r,t)=>(e,i)=>t(e,i,r);import{Disposable as p,DisposableStore as y,toDisposable as M}from"../../../../base/common/lifecycle.js";import{derived as d,observableValue as l,transaction as h}from"../../../../base/common/observable.js";import{constObservable as S,derivedObservableWithWritableCache as _,mapObservableArrayCached as O,observableFromValueWithChangeEvent as w}from"../../../../base/common/observableInternal/utils.js";import{DiffEditorOptions as E}from"../diffEditor/diffEditorOptions.js";import{DiffEditorViewModel as R}from"../diffEditor/diffEditorViewModel.js";import{RefCounted as V}from"../diffEditor/utils.js";import{IModelService as C}from"../../../common/services/model.js";import{IInstantiationService as x}from"../../../../platform/instantiation/common/instantiation.js";class te extends p{constructor(e,i){super();this.model=e;this._instantiationService=i}_documents=w(this.model,this.model.documents);_documentsArr=d(this,e=>{const i=this._documents.read(e);return i==="loading"?[]:i});isLoading=d(this,e=>this._documents.read(e)==="loading");items=O(this,this._documentsArr,(e,i)=>i.add(this._instantiationService.createInstance(s,e,this))).recomputeInitiallyAndOnChange(this._store);focusedDiffItem=d(this,e=>this.items.read(e).find(i=>i.isFocused.read(e)));activeDiffItem=_(this,(e,i)=>this.focusedDiffItem.read(e)??(i&&this.items.read(e).indexOf(i)!==-1)?i:void 0);async waitForDiffs(){for(const e of this.items.get())await e.diffEditorViewModel.waitForDiff()}collapseAll(){h(e=>{for(const i of this.items.get())i.collapsed.set(!0,e)})}expandAll(){h(e=>{for(const i of this.items.get())i.collapsed.set(!1,e)})}get contextKeys(){return this.model.contextKeys}}let s=class extends p{constructor(e,i,o,f){super();this._editorViewModel=i;this._instantiationService=o;this._modelService=f;this._register(M(()=>{this.isAlive.set(!1,void 0)})),this.documentDiffItemRef=this._register(e.createNewRef(this));function n(D){return{...D,hideUnchangedRegions:{enabled:!0}}}const u=this._instantiationService.createInstance(E,n(this.documentDiffItem.options||{}));this.documentDiffItem.onOptionsDidChange&&this._register(this.documentDiffItem.onOptionsDidChange(()=>{u.updateOptions(n(this.documentDiffItem.options||{}))}));const a=new y,I=this.documentDiffItem.original??a.add(this._modelService.createModel("",null)),b=this.documentDiffItem.modified??a.add(this._modelService.createModel("",null));a.add(this.documentDiffItemRef.createNewRef(this)),this.diffEditorViewModelRef=this._register(V.createWithDisposable(this._instantiationService.createInstance(R,{original:I,modified:b},u),a,this))}diffEditorViewModelRef;get diffEditorViewModel(){return this.diffEditorViewModelRef.object}collapsed=l(this,!1);lastTemplateData=l(this,{contentHeight:500,selections:void 0});get originalUri(){return this.documentDiffItem.original?.uri}get modifiedUri(){return this.documentDiffItem.modified?.uri}isActive=d(this,e=>this._editorViewModel.activeDiffItem.read(e)===this);_isFocusedSource=l(this,S(!1));isFocused=d(this,e=>this._isFocusedSource.read(e).read(e));setIsFocused(e,i){this._isFocusedSource.set(e,i)}documentDiffItemRef;get documentDiffItem(){return this.documentDiffItemRef.object}isAlive=l(this,!0);getKey(){return JSON.stringify([this.originalUri?.toString(),this.modifiedUri?.toString()])}};s=m([c(2,x),c(3,C)],s);export{s as DocumentDiffItemViewModel,te as MultiDiffEditorViewModel};
