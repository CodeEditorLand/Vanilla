var v=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var c=(n,t,e,i)=>{for(var r=i>1?void 0:i?p(t,e):t,s=n.length-1,l;s>=0;s--)(l=n[s])&&(r=(i?l(t,e,r):l(r))||r);return i&&r&&v(t,e,r),r},o=(n,t)=>(e,i)=>t(e,i,n);import{readHotReloadableExport as u}from"../../../../base/common/hotReloadHelpers.js";import{Disposable as h}from"../../../../base/common/lifecycle.js";import{derived as f,derivedObservableWithCache as I,observableValue as _}from"../../../../base/common/observable.js";import{derivedDisposable as m,derivedWithSetter as S}from"../../../../base/common/observableInternal/derived.js";import{IConfigurationService as g}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as y}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as E}from"../../../../platform/instantiation/common/instantiation.js";import{bindContextKey as b,observableConfigValue as C}from"../../../../platform/observable/common/platformObservableUtils.js";import"../../../browser/editorBrowser.js";import{observableCodeEditor as x}from"../../../browser/observableCodeEditor.js";import{Selection as O}from"../../../common/core/selection.js";import{ILanguageFeatureDebounceService as D}from"../../../common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as K}from"../../../common/services/languageFeatures.js";import{inlineEditVisible as R,isPinnedContextKey as F}from"./consts.js";import{InlineEditsModel as V}from"./inlineEditsModel.js";import{InlineEditsWidget as L}from"./inlineEditsWidget.js";let d=class extends h{constructor(e,i,r,s,l,P){super();this.editor=e;this._instantiationService=i;this._contextKeyService=r;this._debounceService=s;this._languageFeaturesService=l;this._configurationService=P;this._register(b(R,this._contextKeyService,a=>!!this.model.read(a)?.inlineEdit.read(a))),this._register(b(F,this._contextKeyService,a=>!!this.model.read(a)?.isPinned.read(a))),this.model.recomputeInitiallyAndOnChange(this._store),this._widget.recomputeInitiallyAndOnChange(this._store)}static ID="editor.contrib.inlineEditsController";static get(e){return e.getContribution(d.ID)}_enabled=C("editor.inlineEdits.enabled",!1,this._configurationService);_editorObs=x(this.editor);_selection=f(this,e=>this._editorObs.cursorSelection.read(e)??new O(1,1,1,1));_debounceValue=this._debounceService.for(this._languageFeaturesService.inlineCompletionsProvider,"InlineEditsDebounce",{min:50,max:50});model=m(this,e=>{if(!this._enabled.read(e)||this._editorObs.isReadonly.read(e))return;const i=this._editorObs.model.read(e);return i?this._instantiationService.createInstance(u(V,e),i,this._editorObs.versionId,this._selection,this._debounceValue):void 0});_hadInlineEdit=I(this,(e,i)=>i||this.model.read(e)?.inlineEdit.read(e)!==void 0);_widget=m(this,e=>{if(this._hadInlineEdit.read(e))return this._instantiationService.createInstance(u(L,e),this.editor,this.model.map((i,r)=>i?.inlineEdit.read(r)),M(i=>this.model.read(i)?.userPrompt??_("empty","")))})};d=c([o(1,E),o(2,y),o(3,D),o(4,K),o(5,g)],d);function M(n){return S(void 0,t=>n(t).read(t),(t,e)=>{n(void 0).set(t,e)})}export{d as InlineEditsController};
