var h=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var m=(d,s,e,t)=>{for(var i=t>1?void 0:t?_(s,e):s,o=d.length-1,a;o>=0;o--)(a=d[o])&&(i=(t?a(s,e,i):a(i))||i);return t&&i&&h(s,e,i),i},u=(d,s)=>(e,t)=>s(e,t,d);import{createCancelablePromise as p,RunOnceScheduler as f}from"../../../../../vs/base/common/async.js";import{Disposable as v}from"../../../../../vs/base/common/lifecycle.js";import{StopWatch as S}from"../../../../../vs/base/common/stopwatch.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorContributionInstantiation as I,registerEditorContribution as k}from"../../../../../vs/editor/browser/editorExtensions.js";import"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/editorCommon.js";import"../../../../../vs/editor/common/languageFeatureRegistry.js";import"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import{ILanguageFeatureDebounceService as R}from"../../../../../vs/editor/common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as C}from"../../../../../vs/editor/common/services/languageFeatures.js";import{toMultilineTokens2 as T}from"../../../../../vs/editor/common/services/semanticTokensProviderStyling.js";import{ISemanticTokensStylingService as b}from"../../../../../vs/editor/common/services/semanticTokensStyling.js";import{getDocumentRangeSemanticTokens as D,hasDocumentRangeSemanticTokensProvider as y}from"../../../../../vs/editor/contrib/semanticTokens/common/getSemanticTokens.js";import{isSemanticColoringEnabled as q,SEMANTIC_HIGHLIGHTING_SETTING_ID as w}from"../../../../../vs/editor/contrib/semanticTokens/common/semanticTokensConfig.js";import{IConfigurationService as z}from"../../../../../vs/platform/configuration/common/configuration.js";import{IThemeService as P}from"../../../../../vs/platform/theme/common/themeService.js";let r=class extends v{constructor(e,t,i,o,a,c){super();this._semanticTokensStylingService=t;this._themeService=i;this._configurationService=o;this._editor=e,this._provider=c.documentRangeSemanticTokensProvider,this._debounceInformation=a.for(this._provider,"DocumentRangeSemanticTokens",{min:100,max:500}),this._tokenizeViewport=this._register(new f(()=>this._tokenizeViewportNow(),100)),this._outstandingRequests=[];const n=()=>{this._editor.hasModel()&&this._tokenizeViewport.schedule(this._debounceInformation.get(this._editor.getModel()))};this._register(this._editor.onDidScrollChange(()=>{n()})),this._register(this._editor.onDidChangeModel(()=>{this._cancelAll(),n()})),this._register(this._editor.onDidChangeModelContent(l=>{this._cancelAll(),n()})),this._register(this._provider.onDidChange(()=>{this._cancelAll(),n()})),this._register(this._configurationService.onDidChangeConfiguration(l=>{l.affectsConfiguration(w)&&(this._cancelAll(),n())})),this._register(this._themeService.onDidColorThemeChange(()=>{this._cancelAll(),n()})),n()}static ID="editor.contrib.viewportSemanticTokens";static get(e){return e.getContribution(r.ID)}_editor;_provider;_debounceInformation;_tokenizeViewport;_outstandingRequests;_cancelAll(){for(const e of this._outstandingRequests)e.cancel();this._outstandingRequests=[]}_removeOutstandingRequest(e){for(let t=0,i=this._outstandingRequests.length;t<i;t++)if(this._outstandingRequests[t]===e){this._outstandingRequests.splice(t,1);return}}_tokenizeViewportNow(){if(!this._editor.hasModel())return;const e=this._editor.getModel();if(e.tokenization.hasCompleteSemanticTokens())return;if(!q(e,this._themeService,this._configurationService)){e.tokenization.hasSomeSemanticTokens()&&e.tokenization.setSemanticTokens(null,!1);return}if(!y(this._provider,e)){e.tokenization.hasSomeSemanticTokens()&&e.tokenization.setSemanticTokens(null,!1);return}const t=this._editor.getVisibleRangesPlusViewportAboveBelow();this._outstandingRequests=this._outstandingRequests.concat(t.map(i=>this._requestRange(e,i)))}_requestRange(e,t){const i=e.getVersionId(),o=p(c=>Promise.resolve(D(this._provider,e,t,c))),a=new S(!1);return o.then(c=>{if(this._debounceInformation.update(e,a.elapsed()),!c||!c.tokens||e.isDisposed()||e.getVersionId()!==i)return;const{provider:n,tokens:l}=c,g=this._semanticTokensStylingService.getStyling(n);e.tokenization.setPartialSemanticTokens(t,T(l,g,e.getLanguageId()))}).then(()=>this._removeOutstandingRequest(o),()=>this._removeOutstandingRequest(o)),o}};r=m([u(1,b),u(2,P),u(3,z),u(4,R),u(5,C)],r),k(r.ID,r,I.AfterFirstRender);export{r as ViewportSemanticTokensContribution};
