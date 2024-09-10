var f=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var l=(r,a,e,t)=>{for(var n=t>1?void 0:t?S(a,e):a,i=r.length-1,o;i>=0;i--)(o=r[i])&&(n=(t?o(a,e,n):o(n))||n);return t&&n&&f(a,e,n),n},g=(r,a)=>(e,t)=>a(e,t,r);import{RunOnceScheduler as I}from"../../../../base/common/async.js";import{Disposable as O}from"../../../../base/common/lifecycle.js";import{EditorContributionInstantiation as C,registerEditorContribution as v}from"../../../browser/editorExtensions.js";import{EditorOption as c}from"../../../common/config/editorOptions.js";import{StandardTokenType as H}from"../../../common/encodedTokenAttributes.js";import{ILanguageConfigurationService as D}from"../../../common/languages/languageConfigurationRegistry.js";import{MinimapPosition as M,MinimapSectionHeaderStyle as m,TrackedRangeStickiness as k}from"../../../common/model.js";import{ModelDecorationOptions as y}from"../../../common/model/textModel.js";import{IEditorWorkerService as L}from"../../../common/services/editorWorker.js";let d=class extends O{constructor(e,t,n){super();this.editor=e;this.languageConfigurationService=t;this.editorWorkerService=n;this.options=this.createOptions(e.getOption(c.minimap)),this.computePromise=null,this.currentOccurrences={},this._register(e.onDidChangeModel(i=>{this.currentOccurrences={},this.options=this.createOptions(e.getOption(c.minimap)),this.stop(),this.computeSectionHeaders.schedule(0)})),this._register(e.onDidChangeModelLanguage(i=>{this.currentOccurrences={},this.options=this.createOptions(e.getOption(c.minimap)),this.stop(),this.computeSectionHeaders.schedule(0)})),this._register(t.onDidChange(i=>{const o=this.editor.getModel()?.getLanguageId();o&&i.affects(o)&&(this.currentOccurrences={},this.options=this.createOptions(e.getOption(c.minimap)),this.stop(),this.computeSectionHeaders.schedule(0))})),this._register(e.onDidChangeConfiguration(i=>{this.options&&!i.hasChanged(c.minimap)||(this.options=this.createOptions(e.getOption(c.minimap)),this.updateDecorations([]),this.stop(),this.computeSectionHeaders.schedule(0))})),this._register(this.editor.onDidChangeModelContent(i=>{this.computeSectionHeaders.schedule()})),this._register(e.onDidChangeModelTokens(i=>{this.computeSectionHeaders.isScheduled()||this.computeSectionHeaders.schedule(1e3)})),this.computeSectionHeaders=this._register(new I(()=>{this.findSectionHeaders()},250)),this.computeSectionHeaders.schedule(0)}static ID="editor.sectionHeaderDetector";options;decorations=this.editor.createDecorationsCollection();computeSectionHeaders;computePromise;currentOccurrences;createOptions(e){if(!e||!this.editor.hasModel())return;const t=this.editor.getModel().getLanguageId();if(!t)return;const n=this.languageConfigurationService.getLanguageConfiguration(t).comments,i=this.languageConfigurationService.getLanguageConfiguration(t).foldingRules;if(!(!n&&!i?.markers))return{foldingRules:i,findMarkSectionHeaders:e.showMarkSectionHeaders,findRegionSectionHeaders:e.showRegionSectionHeaders}}findSectionHeaders(){if(!this.editor.hasModel()||!this.options?.findMarkSectionHeaders&&!this.options?.findRegionSectionHeaders)return;const e=this.editor.getModel();if(e.isDisposed()||e.isTooLargeForSyncing())return;const t=e.getVersionId();this.editorWorkerService.findSectionHeaders(e.uri,this.options).then(n=>{e.isDisposed()||e.getVersionId()!==t||this.updateDecorations(n)})}updateDecorations(e){const t=this.editor.getModel();t&&(e=e.filter(o=>{if(!o.shouldBeInComments)return!0;const u=t.validateRange(o.range),s=t.tokenization.getLineTokens(u.startLineNumber),p=s.findTokenIndexAtOffset(u.startColumn-1),h=s.getStandardTokenType(p);return s.getLanguageId(p)===t.getLanguageId()&&h===H.Comment}));const n=Object.values(this.currentOccurrences).map(o=>o.decorationId),i=e.map(o=>R(o));this.editor.changeDecorations(o=>{const u=o.deltaDecorations(n,i);this.currentOccurrences={};for(let s=0,p=u.length;s<p;s++){const h={sectionHeader:e[s],decorationId:u[s]};this.currentOccurrences[h.decorationId]=h}})}stop(){this.computeSectionHeaders.cancel(),this.computePromise&&(this.computePromise.cancel(),this.computePromise=null)}dispose(){super.dispose(),this.stop(),this.decorations.clear()}};d=l([g(1,D),g(2,L)],d);function R(r){return{range:r.range,options:y.createDynamic({description:"section-header",stickiness:k.GrowsOnlyWhenTypingAfter,collapseOnReplaceEdit:!0,minimap:{color:void 0,position:M.Inline,sectionHeaderStyle:r.hasSeparatorLine?m.Underlined:m.Normal,sectionHeaderText:r.text}})}}v(d.ID,d,C.AfterFirstRender);export{d as SectionHeaderDetector};
