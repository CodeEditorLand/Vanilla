var P=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var v=(d,e,i,o)=>{for(var t=o>1?void 0:o?L(e,i):e,r=d.length-1,n;r>=0;r--)(n=d[r])&&(t=(o?n(e,i,t):n(t))||t);return o&&t&&P(e,i,t),t},c=(d,e)=>(i,o)=>e(i,o,d);import"../../../../../base/browser/keyboardEvent.js";import{createCancelablePromise as D}from"../../../../../base/common/async.js";import"../../../../../base/common/cancellation.js";import{onUnexpectedError as f}from"../../../../../base/common/errors.js";import{MarkdownString as k}from"../../../../../base/common/htmlContent.js";import{DisposableStore as I}from"../../../../../base/common/lifecycle.js";import"./goToDefinitionAtPosition.css";import{CodeEditorStateFlag as u,EditorState as b}from"../../../editorState/browser/editorState.js";import{MouseTargetType as C}from"../../../../browser/editorBrowser.js";import{EditorContributionInstantiation as y,registerEditorContribution as S}from"../../../../browser/editorExtensions.js";import{EditorOption as M}from"../../../../common/config/editorOptions.js";import"../../../../common/core/position.js";import{Range as m}from"../../../../common/core/range.js";import"../../../../common/editorCommon.js";import"../../../../common/model.js";import"../../../../common/languages.js";import{ILanguageService as E}from"../../../../common/languages/language.js";import{ITextModelService as w}from"../../../../common/services/resolverService.js";import{ClickLinkGesture as F}from"./clickLinkGesture.js";import{PeekContext as R}from"../../../peekView/browser/peekView.js";import*as W from"../../../../../nls.js";import{IContextKeyService as T}from"../../../../../platform/contextkey/common/contextkey.js";import"../../../../../platform/instantiation/common/instantiation.js";import{DefinitionAction as U}from"../goToCommands.js";import{getDefinitionsAtPosition as x}from"../goToSymbol.js";import"../../../../common/core/wordHelper.js";import{ILanguageFeaturesService as A}from"../../../../common/services/languageFeatures.js";import{ModelDecorationInjectedTextOptions as N}from"../../../../common/model/textModel.js";let a=class{constructor(e,i,o,t){this.textModelResolverService=i;this.languageService=o;this.languageFeaturesService=t;this.editor=e,this.linkDecorations=this.editor.createDecorationsCollection();const r=new F(e);this.toUnhook.add(r),this.toUnhook.add(r.onMouseMoveOrRelevantKeyDown(([n,s])=>{this.startFindDefinitionFromMouse(n,s??void 0)})),this.toUnhook.add(r.onExecute(n=>{this.isEnabled(n)&&this.gotoDefinition(n.target.position,n.hasSideBySideModifier).catch(s=>{f(s)}).finally(()=>{this.removeLinkDecorations()})})),this.toUnhook.add(r.onCancel(()=>{this.removeLinkDecorations(),this.currentWordAtPosition=null}))}static ID="editor.contrib.gotodefinitionatposition";static MAX_SOURCE_PREVIEW_LINES=8;editor;toUnhook=new I;toUnhookForKeyboard=new I;linkDecorations;currentWordAtPosition=null;previousPromise=null;static get(e){return e.getContribution(a.ID)}async startFindDefinitionFromCursor(e){await this.startFindDefinition(e),this.toUnhookForKeyboard.add(this.editor.onDidChangeCursorPosition(()=>{this.currentWordAtPosition=null,this.removeLinkDecorations(),this.toUnhookForKeyboard.clear()})),this.toUnhookForKeyboard.add(this.editor.onKeyDown(i=>{i&&(this.currentWordAtPosition=null,this.removeLinkDecorations(),this.toUnhookForKeyboard.clear())}))}startFindDefinitionFromMouse(e,i){if(e.target.type===C.CONTENT_WIDGET&&this.linkDecorations.length>0)return;if(!this.editor.hasModel()||!this.isEnabled(e,i)){this.currentWordAtPosition=null,this.removeLinkDecorations();return}const o=e.target.position;this.startFindDefinition(o)}async startFindDefinition(e){this.toUnhookForKeyboard.clear();const i=e?this.editor.getModel()?.getWordAtPosition(e):null;if(!i){this.currentWordAtPosition=null,this.removeLinkDecorations();return}if(this.currentWordAtPosition&&this.currentWordAtPosition.startColumn===i.startColumn&&this.currentWordAtPosition.endColumn===i.endColumn&&this.currentWordAtPosition.word===i.word)return;this.currentWordAtPosition=i;const o=new b(this.editor,u.Position|u.Value|u.Selection|u.Scroll);this.previousPromise&&(this.previousPromise.cancel(),this.previousPromise=null),this.previousPromise=D(n=>this.findDefinition(e,n));let t;try{t=await this.previousPromise}catch(n){f(n);return}if(!t||!t.length||!o.validate(this.editor)){this.removeLinkDecorations();return}const r=t[0].originSelectionRange?m.lift(t[0].originSelectionRange):new m(e.lineNumber,i.startColumn,e.lineNumber,i.endColumn);if(t.length>1){let n=r;for(const{originSelectionRange:s}of t)s&&(n=m.plusRange(n,s));this.addDecoration(n,new k().appendText(W.localize("multipleResults","Click to show {0} definitions.",t.length)))}else{const n=t[0];if(!n.uri)return;this.textModelResolverService.createModelReference(n.uri).then(s=>{if(!s.object||!s.object.textEditorModel){s.dispose();return}const{object:{textEditorModel:l}}=s,{startLineNumber:h}=n.range;if(h<1||h>l.getLineCount()){s.dispose();return}const g=this.getPreviewValue(l,h,n),p=this.languageService.guessLanguageIdByFilepathOrFirstLine(l.uri);this.addDecoration(r,g?new k().appendCodeblock(p||"",g):void 0),s.dispose()})}}getPreviewValue(e,i,o){let t=o.range;return t.endLineNumber-t.startLineNumber>=a.MAX_SOURCE_PREVIEW_LINES&&(t=this.getPreviewRangeBasedOnIndentation(e,i)),this.stripIndentationFromPreviewRange(e,i,t)}stripIndentationFromPreviewRange(e,i,o){let r=e.getLineFirstNonWhitespaceColumn(i);for(let s=i+1;s<o.endLineNumber;s++){const l=e.getLineFirstNonWhitespaceColumn(s);r=Math.min(r,l)}return e.getValueInRange(o).replace(new RegExp(`^\\s{${r-1}}`,"gm"),"").trim()}getPreviewRangeBasedOnIndentation(e,i){const o=e.getLineFirstNonWhitespaceColumn(i),t=Math.min(e.getLineCount(),i+a.MAX_SOURCE_PREVIEW_LINES);let r=i+1;for(;r<t;r++){const n=e.getLineFirstNonWhitespaceColumn(r);if(o===n)break}return new m(i,1,r+1,1)}addDecoration(e,i){const o={range:e,options:{description:"goto-definition-link",inlineClassName:"goto-definition-link",hoverMessage:i}};this.linkDecorations.set([o])}removeLinkDecorations(){this.linkDecorations.clear()}isEnabled(e,i){return this.editor.hasModel()&&e.isLeftClick&&e.isNoneOrSingleMouseDown&&e.target.type===C.CONTENT_TEXT&&!(e.target.detail.injectedText?.options instanceof N)&&(e.hasTriggerModifier||(i?i.keyCodeIsTriggerKey:!1))&&this.languageFeaturesService.definitionProvider.has(this.editor.getModel())}findDefinition(e,i){const o=this.editor.getModel();return o?x(this.languageFeaturesService.definitionProvider,o,e,!1,i):Promise.resolve(null)}gotoDefinition(e,i){return this.editor.setPosition(e),this.editor.invokeWithinContext(o=>{const t=!i&&this.editor.getOption(M.definitionLinkOpensInPeek)&&!this.isInPeekEditor(o);return new U({openToSide:i,openInPeek:t,muteMessage:!0},{title:{value:"",original:""},id:"",precondition:void 0}).run(o)})}isInPeekEditor(e){const i=e.get(T);return R.inPeekEditor.getValue(i)}dispose(){this.toUnhook.dispose(),this.toUnhookForKeyboard.dispose()}};a=v([c(1,w),c(2,E),c(3,A)],a),S(a.ID,a,y.BeforeFirstInteraction);export{a as GotoDefinitionAtPositionEditorContribution};
