var b=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var u=(a,r,t,o)=>{for(var n=o>1?void 0:o?y(r,t):r,i=a.length-1,e;i>=0;i--)(e=a[i])&&(n=(o?e(r,t,n):e(n))||n);return o&&n&&b(r,t,n),n},s=(a,r)=>(t,o)=>r(t,o,a);import{compareBy as v,numberComparator as f,reverseOrder as S}from"../../../../base/common/arrays.js";import{Event as h}from"../../../../base/common/event.js";import{Disposable as M}from"../../../../base/common/lifecycle.js";import{autorunWithStore as I,observableSignalFromEvent as c,observableValue as L}from"../../../../base/common/observable.js";import{HideUnchangedRegionsFeature as _}from"../../../browser/widget/diffEditor/features/hideUnchangedRegionsFeature.js";import{DisposableCancellationTokenSource as C}from"../../../browser/widget/diffEditor/utils.js";import{ILanguageFeaturesService as x}from"../../../common/services/languageFeatures.js";import{IOutlineModelService as D}from"../../documentSymbols/browser/outlineModel.js";let m=class extends M{constructor(t,o,n){super();this._textModel=t;this._languageFeaturesService=o;this._outlineModelService=n;const i=c("documentSymbolProvider.onDidChange",this._languageFeaturesService.documentSymbolProvider.onDidChange),e=c("_textModel.onDidChangeContent",h.debounce(d=>this._textModel.onDidChangeContent(d),()=>{},100));this._register(I(async(d,l)=>{i.read(d),e.read(d);const g=l.add(new C),p=await this._outlineModelService.getOrCreate(this._textModel,g.token);l.isDisposed||this._currentModel.set(p,void 0)}))}_currentModel=L(this,void 0);getBreadcrumbItems(t,o){const n=this._currentModel.read(o);if(!n)return[];const i=n.asListOfDocumentSymbols().filter(e=>t.contains(e.range.startLineNumber)&&!t.contains(e.range.endLineNumber));return i.sort(S(v(e=>e.range.endLineNumber-e.range.startLineNumber,f))),i.map(e=>({name:e.name,kind:e.kind,startLineNumber:e.range.startLineNumber}))}};m=u([s(1,x),s(2,D)],m),_.setBreadcrumbsSourceFactory((a,r)=>r.createInstance(m,a));
