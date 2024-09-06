var X=Object.defineProperty;var $=Object.getOwnPropertyDescriptor;var B=(x,S,o,t)=>{for(var e=t>1?void 0:t?$(S,o):S,r=x.length-1,c;r>=0;r--)(c=x[r])&&(e=(t?c(S,o,e):c(e))||e);return t&&e&&X(S,o,e),e},T=(x,S)=>(o,t)=>S(o,t,x);import{findLast as j}from"../../../../../vs/base/common/arraysFind.js";import{DeferredPromise as z}from"../../../../../vs/base/common/async.js";import{CancellationTokenSource as Y}from"../../../../../vs/base/common/cancellation.js";import{Codicon as G}from"../../../../../vs/base/common/codicons.js";import"../../../../../vs/base/common/filters.js";import{pieceToQuery as _,prepareQuery as V,scoreFuzzy2 as E}from"../../../../../vs/base/common/fuzzyScorer.js";import{Disposable as K,DisposableStore as w,toDisposable as H}from"../../../../../vs/base/common/lifecycle.js";import{format as U,trim as J}from"../../../../../vs/base/common/strings.js";import{ThemeIcon as A}from"../../../../../vs/base/common/themables.js";import"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/common/core/position.js";import{Range as W}from"../../../../../vs/editor/common/core/range.js";import{ScrollType as Z}from"../../../../../vs/editor/common/editorCommon.js";import{getAriaLabelForSymbol as q,SymbolKind as n,SymbolKinds as ee,SymbolTag as te}from"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import{ILanguageFeaturesService as oe}from"../../../../../vs/editor/common/services/languageFeatures.js";import{IOutlineModelService as ie}from"../../../../../vs/editor/contrib/documentSymbols/browser/outlineModel.js";import{AbstractEditorNavigationQuickAccessProvider as ne}from"../../../../../vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js";import{localize as i}from"../../../../../vs/nls.js";import"../../../../../vs/platform/quickinput/common/quickAccess.js";import"../../../../../vs/platform/quickinput/common/quickInput.js";let P=class extends ne{constructor(o,t,e=Object.create(null)){super(e);this._languageFeaturesService=o;this._outlineModelService=t;this.options=e,this.options.canAcceptInBackground=!0}static PREFIX="@";static SCOPE_PREFIX=":";static PREFIX_BY_CATEGORY=`${this.PREFIX}${this.SCOPE_PREFIX}`;options;provideWithoutTextEditor(o){return this.provideLabelPick(o,i("cannotRunGotoSymbolWithoutEditor","To go to a symbol, first open a text editor with symbol information.")),K.None}provideWithTextEditor(o,t,e,r){const c=o.editor,l=this.getModel(c);return l?this._languageFeaturesService.documentSymbolProvider.has(l)?this.doProvideWithEditorSymbols(o,l,t,e,r):this.doProvideWithoutEditorSymbols(o,l,t,e):K.None}doProvideWithoutEditorSymbols(o,t,e,r){const c=new w;return this.provideLabelPick(e,i("cannotRunGotoSymbolWithoutSymbolProvider","The active text editor does not provide symbol information.")),(async()=>!await this.waitForLanguageSymbolRegistry(t,c)||r.isCancellationRequested||c.add(this.doProvideWithEditorSymbols(o,t,e,r)))(),c}provideLabelPick(o,t){o.items=[{label:t,index:0,kind:n.String}],o.ariaLabel=t}async waitForLanguageSymbolRegistry(o,t){if(this._languageFeaturesService.documentSymbolProvider.has(o))return!0;const e=new z,r=t.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(()=>{this._languageFeaturesService.documentSymbolProvider.has(o)&&(r.dispose(),e.complete(!0))}));return t.add(H(()=>e.complete(!1))),e.p}doProvideWithEditorSymbols(o,t,e,r,c){const l=o.editor,m=new w;m.add(e.onDidAccept(a=>{const[d]=e.selectedItems;d&&d.range&&(this.gotoLocation(o,{range:d.range.selection,keyMods:e.keyMods,preserveFocus:a.inBackground}),c?.handleAccept?.(d),a.inBackground||e.hide())})),m.add(e.onDidTriggerItemButton(({item:a})=>{a&&a.range&&(this.gotoLocation(o,{range:a.range.selection,keyMods:e.keyMods,forceSideBySide:!0}),e.hide())}));const C=this.getDocumentSymbols(t,r);let p;const g=async a=>{p?.dispose(!0),e.busy=!1,p=new Y(r),e.busy=!0;try{const d=V(e.value.substr(P.PREFIX.length).trim()),h=await this.doGetSymbolPicks(C,d,void 0,p.token,t);if(r.isCancellationRequested)return;if(h.length>0){if(e.items=h,a&&d.original.length===0){const v=j(h,f=>!!(f.type!=="separator"&&f.range&&W.containsPosition(f.range.decoration,a)));v&&(e.activeItems=[v])}}else d.original.length>0?this.provideLabelPick(e,i("noMatchingSymbolResults","No matching editor symbols")):this.provideLabelPick(e,i("noSymbolResults","No editor symbols"))}finally{r.isCancellationRequested||(e.busy=!1)}};return m.add(e.onDidChangeValue(()=>g(void 0))),g(l.getSelection()?.getPosition()),m.add(e.onDidChangeActive(()=>{const[a]=e.activeItems;a&&a.range&&(l.revealRangeInCenter(a.range.selection,Z.Smooth),this.addDecorations(l,a.range.decoration))})),m}async doGetSymbolPicks(o,t,e,r,c){const l=await o;if(r.isCancellationRequested)return[];const m=t.original.indexOf(P.SCOPE_PREFIX)===0,C=m?1:0;let p,g;t.values&&t.values.length>1?(p=_(t.values[0]),g=_(t.values.slice(1))):p=t;let a;const d=this.options?.openSideBySideDirection?.();d&&(a=[{iconClass:d==="right"?A.asClassName(G.splitHorizontal):A.asClassName(G.splitVertical),tooltip:d==="right"?i("openToSide","Open to the Side"):i("openToBottom","Open to the Bottom")}]);const h=[];for(let u=0;u<l.length;u++){const s=l[u],b=J(s.name),y=`$(${ee.toIcon(s.kind).id}) ${b}`,Q=y.length-b.length;let k=s.containerName;e?.extraContainerLabel&&(k?k=`${e.extraContainerLabel} \u2022 ${k}`:k=e.extraContainerLabel);let I,L,R,O;if(t.original.length>C){let N=!1;if(p!==t&&([I,L]=E(y,{...t,values:void 0},C,Q),typeof I=="number"&&(N=!0)),typeof I!="number"&&([I,L]=E(y,p,C,Q),typeof I!="number"))continue;if(!N&&g){if(k&&g.original.length>0&&([R,O]=E(k,g)),typeof R!="number")continue;typeof I=="number"&&(I+=R)}}const F=s.tags&&s.tags.indexOf(te.Deprecated)>=0;h.push({index:u,kind:s.kind,score:I,label:y,ariaLabel:q(s.name,s.kind),description:k,highlights:F?void 0:{label:L,description:O},range:{selection:W.collapseToStart(s.selectionRange),decoration:s.range},uri:c.uri,symbolName:b,strikethrough:F,buttons:a})}const v=h.sort((u,s)=>m?this.compareByKindAndScore(u,s):this.compareByScore(u,s));let f=[];if(m){let y=function(){s&&typeof u=="number"&&b>0&&(s.label=U(M[u]||D,b))};var re=y;let u,s,b=0;for(const Q of v)u!==Q.kind?(y(),u=Q.kind,b=1,s={type:"separator"},f.push(s)):b++,f.push(Q);y()}else v.length>0&&(f=[{label:i("symbols","symbols ({0})",h.length),type:"separator"},...v]);return f}compareByScore(o,t){if(typeof o.score!="number"&&typeof t.score=="number")return 1;if(typeof o.score=="number"&&typeof t.score!="number")return-1;if(typeof o.score=="number"&&typeof t.score=="number"){if(o.score>t.score)return-1;if(o.score<t.score)return 1}return o.index<t.index?-1:o.index>t.index?1:0}compareByKindAndScore(o,t){const e=M[o.kind]||D,r=M[t.kind]||D,c=e.localeCompare(r);return c===0?this.compareByScore(o,t):c}async getDocumentSymbols(o,t){const e=await this._outlineModelService.getOrCreate(o,t);return t.isCancellationRequested?[]:e.asListOfDocumentSymbols()}};P=B([T(0,oe),T(1,ie)],P);const D=i("property","properties ({0})"),M={[n.Method]:i("method","methods ({0})"),[n.Function]:i("function","functions ({0})"),[n.Constructor]:i("_constructor","constructors ({0})"),[n.Variable]:i("variable","variables ({0})"),[n.Class]:i("class","classes ({0})"),[n.Struct]:i("struct","structs ({0})"),[n.Event]:i("event","events ({0})"),[n.Operator]:i("operator","operators ({0})"),[n.Interface]:i("interface","interfaces ({0})"),[n.Namespace]:i("namespace","namespaces ({0})"),[n.Package]:i("package","packages ({0})"),[n.TypeParameter]:i("typeParameter","type parameters ({0})"),[n.Module]:i("modules","modules ({0})"),[n.Property]:i("property","properties ({0})"),[n.Enum]:i("enum","enumerations ({0})"),[n.EnumMember]:i("enumMember","enumeration members ({0})"),[n.String]:i("string","strings ({0})"),[n.File]:i("file","files ({0})"),[n.Array]:i("array","arrays ({0})"),[n.Number]:i("number","numbers ({0})"),[n.Boolean]:i("boolean","booleans ({0})"),[n.Object]:i("object","objects ({0})"),[n.Key]:i("key","keys ({0})"),[n.Field]:i("field","fields ({0})"),[n.Constant]:i("constant","constants ({0})")};export{P as AbstractGotoSymbolQuickAccessProvider};