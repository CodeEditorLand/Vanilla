var p=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var u=(a,n,t,o)=>{for(var r=o>1?void 0:o?v(n,t):n,i=a.length-1,e;i>=0;i--)(e=a[i])&&(r=(o?e(n,t,r):e(r))||r);return o&&r&&p(n,t,r),r},s=(a,n)=>(t,o)=>n(t,o,a);import{reverseOrder as f,compareBy as S,numberComparator as h}from"../../../../base/common/arrays.js";import{observableValue as M,observableSignalFromEvent as c,autorunWithStore as y}from"../../../../base/common/observable.js";import{HideUnchangedRegionsFeature as I}from"../../../browser/widget/diffEditor/features/hideUnchangedRegionsFeature.js";import{DisposableCancellationTokenSource as L}from"../../../browser/widget/diffEditor/utils.js";import{ILanguageFeaturesService as _}from"../../../common/services/languageFeatures.js";import{IOutlineModelService as C}from"../../documentSymbols/browser/outlineModel.js";import{Disposable as x}from"../../../../base/common/lifecycle.js";import{Event as D}from"../../../../base/common/event.js";let d=class extends x{constructor(t,o,r){super();this._textModel=t;this._languageFeaturesService=o;this._outlineModelService=r;const i=c("documentSymbolProvider.onDidChange",this._languageFeaturesService.documentSymbolProvider.onDidChange),e=c("_textModel.onDidChangeContent",D.debounce(m=>this._textModel.onDidChangeContent(m),()=>{},100));this._register(y(async(m,l)=>{i.read(m),e.read(m);const g=l.add(new L),b=await this._outlineModelService.getOrCreate(this._textModel,g.token);l.isDisposed||this._currentModel.set(b,void 0)}))}_currentModel=M(this,void 0);getBreadcrumbItems(t,o){const r=this._currentModel.read(o);if(!r)return[];const i=r.asListOfDocumentSymbols().filter(e=>t.contains(e.range.startLineNumber)&&!t.contains(e.range.endLineNumber));return i.sort(f(S(e=>e.range.endLineNumber-e.range.startLineNumber,h))),i.map(e=>({name:e.name,kind:e.kind,startLineNumber:e.range.startLineNumber}))}};d=u([s(1,_),s(2,C)],d),I.setBreadcrumbsSourceFactory((a,n)=>n.createInstance(d,a));
