var U=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var v=(c,e,o,t)=>{for(var i=t>1?void 0:t?L(e,o):e,r=c.length-1,n;r>=0;r--)(n=c[r])&&(i=(t?n(e,o,i):n(i))||i);return t&&i&&U(e,o,i),i},g=(c,e)=>(o,t)=>e(o,t,c);import*as I from"../../../../nls.js";import{alert as R}from"../../../../base/browser/ui/aria/aria.js";import{createCancelablePromise as O,Delayer as V,first as b}from"../../../../base/common/async.js";import{CancellationToken as K}from"../../../../base/common/cancellation.js";import{onUnexpectedError as y,onUnexpectedExternalError as k}from"../../../../base/common/errors.js";import{KeyCode as x,KeyMod as B}from"../../../../base/common/keyCodes.js";import{Disposable as $,DisposableStore as z}from"../../../../base/common/lifecycle.js";import{ResourceMap as m}from"../../../../base/common/map.js";import{matchesScheme as G,Schemas as h}from"../../../../base/common/network.js";import{isEqual as H}from"../../../../base/common/resources.js";import{IContextKeyService as j,RawContextKey as Q}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as D}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{isDiffEditor as J}from"../../../browser/editorBrowser.js";import{EditorAction as P,EditorContributionInstantiation as W,registerEditorAction as w,registerEditorContribution as X,registerModelAndPositionCommand as Y}from"../../../browser/editorExtensions.js";import{ICodeEditorService as T}from"../../../browser/services/codeEditorService.js";import{EditorOption as f}from"../../../common/config/editorOptions.js";import{Range as q}from"../../../common/core/range.js";import{CursorChangeReason as Z}from"../../../common/cursorEvents.js";import{EditorContextKeys as C}from"../../../common/editorContextKeys.js";import{registerEditorFeature as ee}from"../../../common/editorFeatures.js";import{score as te}from"../../../common/languageSelector.js";import{shouldSynchronizeModel as oe}from"../../../common/model.js";import{ILanguageFeaturesService as S}from"../../../common/services/languageFeatures.js";import{ITextModelService as _}from"../../../common/services/resolverService.js";import{getHighlightDecorationOptions as ie}from"./highlightDecorations.js";import{TextualMultiDocumentHighlightFeature as re}from"./textualHighlightProvider.js";const M=new Q("hasWordHighlights",!1);function E(c,e,o,t){const i=c.ordered(e);return b(i.map(r=>()=>Promise.resolve(r.provideDocumentHighlights(e,o,t)).then(void 0,k)),r=>r!=null).then(r=>{if(r){const n=new m;return n.set(e.uri,r),n}return new m})}function ne(c,e,o,t,i){const r=c.ordered(e);return b(r.map(n=>()=>{const l=i.filter(d=>oe(d)).filter(d=>te(n.selector,d.uri,d.getLanguageId(),!0,void 0,void 0)>0);return Promise.resolve(n.provideMultiDocumentHighlights(e,o,l,t)).then(void 0,k)}),n=>n!=null)}class A{constructor(e,o,t){this._model=e;this._selection=o;this._wordSeparators=t;this._wordRange=this._getCurrentWordRange(e,o),this._result=null}_wordRange;_result;get result(){return this._result||(this._result=O(e=>this._compute(this._model,this._selection,this._wordSeparators,e))),this._result}_getCurrentWordRange(e,o){const t=e.getWordAtPosition(o.getPosition());return t?new q(o.startLineNumber,t.startColumn,o.startLineNumber,t.endColumn):null}isValid(e,o,t){const i=o.startLineNumber,r=o.startColumn,n=o.endColumn,l=this._getCurrentWordRange(e,o);let d=!!(this._wordRange&&this._wordRange.equalsRange(l));for(let a=0,F=t.length;!d&&a<F;a++){const p=t.getRange(a);p&&p.startLineNumber===i&&p.startColumn<=r&&p.endColumn>=n&&(d=!0)}return d}cancel(){this.result.cancel()}}class se extends A{_providers;constructor(e,o,t,i){super(e,o,t),this._providers=i}_compute(e,o,t,i){return E(this._providers,e,o.getPosition(),i).then(r=>r||new m)}}class le extends A{_providers;_otherModels;constructor(e,o,t,i,r){super(e,o,t),this._providers=i,this._otherModels=r}_compute(e,o,t,i){return ne(this._providers,e,o.getPosition(),i,this._otherModels).then(r=>r||new m)}}function de(c,e,o,t){return new se(e,o,t,c)}function ce(c,e,o,t,i){return new le(e,o,t,c,i)}Y("_executeDocumentHighlights",async(c,e,o)=>{const t=c.get(S);return(await E(t.documentHighlightProvider,e,o,K.None))?.get(e.uri)});let s=class{editor;providers;multiDocumentProviders;model;decorations;toUnhook=new z;textModelService;codeEditorService;occurrencesHighlight;workerRequestTokenId=0;workerRequest;workerRequestCompleted=!1;workerRequestValue=new m;lastCursorPositionChangeTime=0;renderDecorationsTimer=-1;_hasWordHighlights;_ignorePositionChangeEvent;runDelayer=this.toUnhook.add(new V(25));static storedDecorationIDs=new m;static query=null;constructor(e,o,t,i,r,n){this.editor=e,this.providers=o,this.multiDocumentProviders=t,this.codeEditorService=n,this.textModelService=r,this._hasWordHighlights=M.bindTo(i),this._ignorePositionChangeEvent=!1,this.occurrencesHighlight=this.editor.getOption(f.occurrencesHighlight),this.model=this.editor.getModel(),this.toUnhook.add(e.onDidChangeCursorPosition(l=>{this._ignorePositionChangeEvent||this.occurrencesHighlight!=="off"&&this.runDelayer.trigger(()=>{this._onPositionChanged(l)})})),this.toUnhook.add(e.onDidFocusEditorText(l=>{this.occurrencesHighlight!=="off"&&(this.workerRequest||this.runDelayer.trigger(()=>{this._run()}))})),this.toUnhook.add(e.onDidChangeModelContent(l=>{G(this.model.uri,"output")||this._stopAll()})),this.toUnhook.add(e.onDidChangeModel(l=>{!l.newModelUrl&&l.oldModelUrl?this._stopSingular():s.query&&this._run()})),this.toUnhook.add(e.onDidChangeConfiguration(l=>{const d=this.editor.getOption(f.occurrencesHighlight);if(this.occurrencesHighlight!==d)switch(this.occurrencesHighlight=d,d){case"off":this._stopAll();break;case"singleFile":this._stopAll(s.query?.modelInfo?.modelURI);break;case"multiFile":s.query&&this._run(!0);break;default:console.warn("Unknown occurrencesHighlight setting value:",d);break}})),this.toUnhook.add(e.onDidBlurEditorWidget(()=>{const l=this.codeEditorService.getFocusedCodeEditor();l?l.getModel()?.uri.scheme===h.vscodeNotebookCell&&this.editor.getModel()?.uri.scheme!==h.vscodeNotebookCell&&this._stopAll():this._stopAll()})),this.decorations=this.editor.createDecorationsCollection(),this.workerRequestTokenId=0,this.workerRequest=null,this.workerRequestCompleted=!1,this.lastCursorPositionChangeTime=0,this.renderDecorationsTimer=-1,s.query&&this._run()}hasDecorations(){return this.decorations.length>0}restore(){this.occurrencesHighlight!=="off"&&(this.runDelayer.cancel(),this._run())}stop(){this.occurrencesHighlight!=="off"&&this._stopAll()}_getSortedHighlights(){return this.decorations.getRanges().sort(q.compareRangesUsingStarts)}moveNext(){const e=this._getSortedHighlights(),t=(e.findIndex(r=>r.containsPosition(this.editor.getPosition()))+1)%e.length,i=e[t];try{this._ignorePositionChangeEvent=!0,this.editor.setPosition(i.getStartPosition()),this.editor.revealRangeInCenterIfOutsideViewport(i);const r=this._getWord();if(r){const n=this.editor.getModel().getLineContent(i.startLineNumber);R(`${n}, ${t+1} of ${e.length} for '${r.word}'`)}}finally{this._ignorePositionChangeEvent=!1}}moveBack(){const e=this._getSortedHighlights(),t=(e.findIndex(r=>r.containsPosition(this.editor.getPosition()))-1+e.length)%e.length,i=e[t];try{this._ignorePositionChangeEvent=!0,this.editor.setPosition(i.getStartPosition()),this.editor.revealRangeInCenterIfOutsideViewport(i);const r=this._getWord();if(r){const n=this.editor.getModel().getLineContent(i.startLineNumber);R(`${n}, ${t+1} of ${e.length} for '${r.word}'`)}}finally{this._ignorePositionChangeEvent=!1}}_removeSingleDecorations(){if(!this.editor.hasModel())return;const e=s.storedDecorationIDs.get(this.editor.getModel().uri);e&&(this.editor.removeDecorations(e),s.storedDecorationIDs.delete(this.editor.getModel().uri),this.decorations.length>0&&(this.decorations.clear(),this._hasWordHighlights.set(!1)))}_removeAllDecorations(e){const o=this.codeEditorService.listCodeEditors(),t=[];for(const i of o){if(!i.hasModel()||H(i.getModel().uri,e))continue;const r=s.storedDecorationIDs.get(i.getModel().uri);if(!r)continue;i.removeDecorations(r),t.push(i.getModel().uri);const n=u.get(i);n?.wordHighlighter&&n.wordHighlighter.decorations.length>0&&(n.wordHighlighter.decorations.clear(),n.wordHighlighter.workerRequest=null,n.wordHighlighter._hasWordHighlights.set(!1))}for(const i of t)s.storedDecorationIDs.delete(i)}_stopSingular(){this._removeSingleDecorations(),this.editor.hasTextFocus()&&(this.editor.getModel()?.uri.scheme!==h.vscodeNotebookCell&&s.query?.modelInfo?.modelURI.scheme!==h.vscodeNotebookCell?(s.query=null,this._run()):s.query?.modelInfo&&(s.query.modelInfo=null)),this.renderDecorationsTimer!==-1&&(clearTimeout(this.renderDecorationsTimer),this.renderDecorationsTimer=-1),this.workerRequest!==null&&(this.workerRequest.cancel(),this.workerRequest=null),this.workerRequestCompleted||(this.workerRequestTokenId++,this.workerRequestCompleted=!0)}_stopAll(e){this._removeAllDecorations(e),this.renderDecorationsTimer!==-1&&(clearTimeout(this.renderDecorationsTimer),this.renderDecorationsTimer=-1),this.workerRequest!==null&&(this.workerRequest.cancel(),this.workerRequest=null),this.workerRequestCompleted||(this.workerRequestTokenId++,this.workerRequestCompleted=!0)}_onPositionChanged(e){if(this.occurrencesHighlight==="off"){this._stopAll();return}if(e.reason!==Z.Explicit&&this.editor.getModel()?.uri.scheme!==h.vscodeNotebookCell){this._stopAll();return}this._run()}_getWord(){const e=this.editor.getSelection(),o=e.startLineNumber,t=e.startColumn;return this.model.isDisposed()?null:this.model.getWordAtPosition({lineNumber:o,column:t})}getOtherModelsToHighlight(e){if(!e)return[];if(e.uri.scheme===h.vscodeNotebookCell){const r=[],n=this.codeEditorService.listCodeEditors();for(const l of n){const d=l.getModel();d&&d!==e&&d.uri.scheme===h.vscodeNotebookCell&&r.push(d)}return r}const t=[],i=this.codeEditorService.listCodeEditors();for(const r of i){if(!J(r))continue;const n=r.getModel();n&&e===n.modified&&t.push(n.modified)}if(t.length)return t;if(this.occurrencesHighlight==="singleFile")return[];for(const r of i){const n=r.getModel();n&&n!==e&&t.push(n)}return t}async _run(e){if(this.editor.hasTextFocus()){const t=this.editor.getSelection();if(!t||t.startLineNumber!==t.endLineNumber){s.query=null,this._stopAll();return}const i=t.startColumn,r=t.endColumn,n=this._getWord();if(!n||n.startColumn>i||n.endColumn<r){s.query=null,this._stopAll();return}s.query={modelInfo:{modelURI:this.model.uri,selection:t}}}else if(!s.query){this._stopAll();return}if(this.lastCursorPositionChangeTime=new Date().getTime(),H(this.editor.getModel().uri,s.query.modelInfo?.modelURI)){if(!e){const l=this.decorations.getRanges();for(const d of l)if(d.containsPosition(this.editor.getPosition()))return}this._stopAll(e?this.model.uri:void 0);const t=++this.workerRequestTokenId;this.workerRequestCompleted=!1;const i=this.getOtherModelsToHighlight(this.editor.getModel());if(!s.query||!s.query.modelInfo)return;const n=(await this.textModelService.createModelReference(s.query.modelInfo.modelURI)).object.textEditorModel;this.workerRequest=this.computeWithModel(n,s.query.modelInfo.selection,i),this.workerRequest?.result.then(l=>{t===this.workerRequestTokenId&&(this.workerRequestCompleted=!0,this.workerRequestValue=l||[],this._beginRenderDecorations())},y)}else if(this.model.uri.scheme===h.vscodeNotebookCell){const t=++this.workerRequestTokenId;if(this.workerRequestCompleted=!1,!s.query||!s.query.modelInfo)return;const r=(await this.textModelService.createModelReference(s.query.modelInfo.modelURI)).object.textEditorModel;this.workerRequest=this.computeWithModel(r,s.query.modelInfo.selection,[this.model]),this.workerRequest?.result.then(n=>{t===this.workerRequestTokenId&&(this.workerRequestCompleted=!0,this.workerRequestValue=n||[],this._beginRenderDecorations())},y)}}computeWithModel(e,o,t){return t.length?ce(this.multiDocumentProviders,e,o,this.editor.getOption(f.wordSeparators),t):de(this.providers,e,o,this.editor.getOption(f.wordSeparators))}_beginRenderDecorations(){const e=new Date().getTime(),o=this.lastCursorPositionChangeTime+250;e>=o?(this.renderDecorationsTimer=-1,this.renderDecorations()):this.renderDecorationsTimer=setTimeout(()=>{this.renderDecorations()},o-e)}renderDecorations(){this.renderDecorationsTimer=-1;const e=this.codeEditorService.listCodeEditors();for(const o of e){const t=u.get(o);if(!t)continue;const i=[],r=o.getModel()?.uri;if(r&&this.workerRequestValue.has(r)){const n=s.storedDecorationIDs.get(r),l=this.workerRequestValue.get(r);if(l)for(const a of l)a.range&&i.push({range:a.range,options:ie(a.kind)});let d=[];o.changeDecorations(a=>{d=a.deltaDecorations(n??[],i)}),s.storedDecorationIDs=s.storedDecorationIDs.set(r,d),i.length>0&&(t.wordHighlighter?.decorations.set(i),t.wordHighlighter?._hasWordHighlights.set(!0))}}this.workerRequest=null}dispose(){this._stopSingular(),this.toUnhook.dispose()}};s=v([g(4,_),g(5,T)],s);let u=class extends ${static ID="editor.contrib.wordHighlighter";static get(e){return e.getContribution(u.ID)}_wordHighlighter;constructor(e,o,t,i,r){super(),this._wordHighlighter=null;const n=()=>{e.hasModel()&&!e.getModel().isTooLargeForTokenization()&&(this._wordHighlighter=new s(e,t.documentHighlightProvider,t.multiDocumentHighlightProvider,o,r,i))};this._register(e.onDidChangeModel(l=>{this._wordHighlighter&&(!l.newModelUrl&&l.oldModelUrl?.scheme!==h.vscodeNotebookCell&&this.wordHighlighter?.stop(),this._wordHighlighter.dispose(),this._wordHighlighter=null),n()})),n()}get wordHighlighter(){return this._wordHighlighter}saveViewState(){return!!(this._wordHighlighter&&this._wordHighlighter.hasDecorations())}moveNext(){this._wordHighlighter?.moveNext()}moveBack(){this._wordHighlighter?.moveBack()}restoreViewState(e){this._wordHighlighter&&e&&this._wordHighlighter.restore()}stopHighlighting(){this._wordHighlighter?.stop()}dispose(){this._wordHighlighter&&(this._wordHighlighter.dispose(),this._wordHighlighter=null),super.dispose()}};u=v([g(1,j),g(2,S),g(3,T),g(4,_)],u);class N extends P{_isNext;constructor(e,o){super(o),this._isNext=e}run(e,o){const t=u.get(o);t&&(this._isNext?t.moveNext():t.moveBack())}}class ue extends N{constructor(){super(!0,{id:"editor.action.wordHighlight.next",label:I.localize("wordHighlight.next.label","Go to Next Symbol Highlight"),alias:"Go to Next Symbol Highlight",precondition:M,kbOpts:{kbExpr:C.editorTextFocus,primary:x.F7,weight:D.EditorContrib}})}}class ae extends N{constructor(){super(!1,{id:"editor.action.wordHighlight.prev",label:I.localize("wordHighlight.previous.label","Go to Previous Symbol Highlight"),alias:"Go to Previous Symbol Highlight",precondition:M,kbOpts:{kbExpr:C.editorTextFocus,primary:B.Shift|x.F7,weight:D.EditorContrib}})}}class he extends P{constructor(){super({id:"editor.action.wordHighlight.trigger",label:I.localize("wordHighlight.trigger.label","Trigger Symbol Highlight"),alias:"Trigger Symbol Highlight",precondition:void 0,kbOpts:{kbExpr:C.editorTextFocus,primary:0,weight:D.EditorContrib}})}run(e,o,t){const i=u.get(o);i&&i.restoreViewState(!0)}}X(u.ID,u,W.Eager),w(ue),w(ae),w(he),ee(re);export{u as WordHighlighterContribution,ne as getOccurrencesAcrossMultipleModels,E as getOccurrencesAtPosition};
