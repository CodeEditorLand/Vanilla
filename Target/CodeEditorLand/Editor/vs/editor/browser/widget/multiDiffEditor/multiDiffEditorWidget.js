var p=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var m=(r,o,e,t)=>{for(var i=t>1?void 0:t?c(o,e):o,d=r.length-1,l;d>=0;d--)(l=r[d])&&(i=(t?l(o,e,i):l(i))||i);return t&&i&&p(o,e,i),i},f=(r,o)=>(e,t)=>o(e,t,r);import{Event as u}from"../../../../base/common/event.js";import{readHotReloadableExport as a}from"../../../../base/common/hotReloadHelpers.js";import{Disposable as I}from"../../../../base/common/lifecycle.js";import{derived as h,derivedWithStore as v,observableValue as s,recomputeInitiallyAndOnChange as w}from"../../../../base/common/observable.js";import{IInstantiationService as g}from"../../../../platform/instantiation/common/instantiation.js";import"./colors.js";import{DiffEditorItemTemplate as y}from"./diffEditorItemTemplate.js";import{MultiDiffEditorViewModel as D}from"./multiDiffEditorViewModel.js";import{MultiDiffEditorWidgetImpl as E}from"./multiDiffEditorWidgetImpl.js";let n=class extends I{constructor(e,t,i){super();this._element=e;this._workbenchUIElementFactory=t;this._instantiationService=i;this._register(w(this._widgetImpl))}_dimension=s(this,void 0);_viewModel=s(this,void 0);_widgetImpl=v(this,(e,t)=>(a(y,e),t.add(this._instantiationService.createInstance(a(E,e),this._element,this._dimension,this._viewModel,this._workbenchUIElementFactory))));reveal(e,t){this._widgetImpl.get().reveal(e,t)}createViewModel(e){return new D(e,this._instantiationService)}setViewModel(e){this._viewModel.set(e,void 0)}layout(e){this._dimension.set(e,void 0)}_activeControl=h(this,e=>this._widgetImpl.read(e).activeControl.read(e));getActiveControl(){return this._activeControl.get()}onDidChangeActiveControl=u.fromObservableLight(this._activeControl);getViewState(){return this._widgetImpl.get().getViewState()}setViewState(e){this._widgetImpl.get().setViewState(e)}tryGetCodeEditor(e){return this._widgetImpl.get().tryGetCodeEditor(e)}findDocumentDiffItem(e){return this._widgetImpl.get().findDocumentDiffItem(e)}};n=m([f(2,g)],n);export{n as MultiDiffEditorWidget};
