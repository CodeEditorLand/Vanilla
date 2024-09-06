var v=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var m=(a,d,e,i)=>{for(var t=i>1?void 0:i?f(d,e):d,r=a.length-1,s;r>=0;r--)(s=a[r])&&(t=(i?s(d,e,t):s(t))||t);return i&&t&&v(d,e,t),t},h=(a,d)=>(e,i)=>d(e,i,a);import{binarySearch as p}from"../../../../base/common/arrays.js";import{RunOnceScheduler as b}from"../../../../base/common/async.js";import{CancellationTokenSource as C}from"../../../../base/common/cancellation.js";import{Emitter as L}from"../../../../base/common/event.js";import{Disposable as M,DisposableStore as I,toDisposable as D}from"../../../../base/common/lifecycle.js";import"../../../browser/editorBrowser.js";import{EditorOption as y}from"../../../common/config/editorOptions.js";import"../../../common/core/range.js";import{ILanguageConfigurationService as P}from"../../../common/languages/languageConfigurationRegistry.js";import{ILanguageFeaturesService as N}from"../../../common/services/languageFeatures.js";import"./stickyScrollElement.js";import{StickyModelProvider as R}from"./stickyScrollModelProvider.js";class w{constructor(d,e,i){this.startLineNumber=d;this.endLineNumber=e;this.nestingDepth=i}}let c=class extends M{constructor(e,i,t){super();this._languageFeaturesService=i;this._languageConfigurationService=t;this._editor=e,this._sessionStore=this._register(new I),this._updateSoon=this._register(new b(()=>this.update(),50)),this._register(this._editor.onDidChangeConfiguration(r=>{r.hasChanged(y.stickyScroll)&&this.readConfiguration()})),this.readConfiguration()}static ID="store.contrib.stickyScrollController";_onDidChangeStickyScroll=this._register(new L);onDidChangeStickyScroll=this._onDidChangeStickyScroll.event;_editor;_updateSoon;_sessionStore;_model=null;_cts=null;_stickyModelProvider=null;readConfiguration(){this._sessionStore.clear(),this._editor.getOption(y.stickyScroll).enabled&&(this._sessionStore.add(this._editor.onDidChangeModel(()=>{this._model=null,this.updateStickyModelProvider(),this._onDidChangeStickyScroll.fire(),this.update()})),this._sessionStore.add(this._editor.onDidChangeHiddenAreas(()=>this.update())),this._sessionStore.add(this._editor.onDidChangeModelContent(()=>this._updateSoon.schedule())),this._sessionStore.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(()=>this.update())),this._sessionStore.add(D(()=>{this._stickyModelProvider?.dispose(),this._stickyModelProvider=null})),this.updateStickyModelProvider(),this.update())}getVersionId(){return this._model?.version}updateStickyModelProvider(){this._stickyModelProvider?.dispose(),this._stickyModelProvider=null;const e=this._editor;e.hasModel()&&(this._stickyModelProvider=new R(e,()=>this._updateSoon.schedule(),this._languageConfigurationService,this._languageFeaturesService))}async update(){this._cts?.dispose(!0),this._cts=new C,await this.updateStickyModel(this._cts.token),this._onDidChangeStickyScroll.fire()}async updateStickyModel(e){if(!this._editor.hasModel()||!this._stickyModelProvider||this._editor.getModel().isTooLargeForTokenization()){this._model=null;return}const i=await this._stickyModelProvider.update(e);e.isCancellationRequested||(this._model=i)}updateIndex(e){return e===-1?e=0:e<0&&(e=-e-2),e}getCandidateStickyLinesIntersectingFromStickyModel(e,i,t,r,s){if(i.children.length===0)return;let S=s;const u=[];for(let o=0;o<i.children.length;o++){const n=i.children[o];n.range&&u.push(n.range.startLineNumber)}const _=this.updateIndex(p(u,e.startLineNumber,(o,n)=>o-n)),k=this.updateIndex(p(u,e.startLineNumber+r,(o,n)=>o-n));for(let o=_;o<=k;o++){const n=i.children[o];if(!n)return;if(n.range){const l=n.range.startLineNumber,g=n.range.endLineNumber;e.startLineNumber<=g+1&&l-1<=e.endLineNumber&&l!==S&&(S=l,t.push(new w(l,g-1,r+1)),this.getCandidateStickyLinesIntersectingFromStickyModel(e,n,t,r+1,l))}else this.getCandidateStickyLinesIntersectingFromStickyModel(e,n,t,r,s)}}getCandidateStickyLinesIntersecting(e){if(!this._model?.element)return[];let i=[];this.getCandidateStickyLinesIntersectingFromStickyModel(e,this._model.element,i,0,-1);const t=this._editor._getViewModel()?.getHiddenAreas();if(t)for(const r of t)i=i.filter(s=>!(s.startLineNumber>=r.startLineNumber&&s.endLineNumber<=r.endLineNumber+1));return i}};c=m([h(1,N),h(2,P)],c);export{w as StickyLineCandidate,c as StickyLineCandidateProvider};
