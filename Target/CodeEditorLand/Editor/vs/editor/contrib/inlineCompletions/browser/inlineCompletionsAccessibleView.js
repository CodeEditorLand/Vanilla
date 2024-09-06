import{Emitter as s}from"../../../../base/common/event.js";import{Disposable as l}from"../../../../base/common/lifecycle.js";import{AccessibleViewProviderId as d,AccessibleViewType as n}from"../../../../platform/accessibility/browser/accessibleView.js";import"../../../../platform/accessibility/browser/accessibleViewRegistry.js";import{ContextKeyExpr as m}from"../../../../platform/contextkey/common/contextkey.js";import"../../../../platform/instantiation/common/instantiation.js";import"../../../browser/editorBrowser.js";import{ICodeEditorService as p}from"../../../browser/services/codeEditorService.js";import{InlineCompletionContextKeys as c}from"./controller/inlineCompletionContextKeys.js";import{InlineCompletionsController as a}from"./controller/inlineCompletionsController.js";import"./model/inlineCompletionsModel.js";class T{type=n.View;priority=95;name="inline-completions";when=m.and(c.inlineSuggestionVisible);getProvider(o){const e=o.get(p),t=e.getActiveCodeEditor()||e.getFocusedCodeEditor();if(!t)return;const i=a.get(t)?.model.get();if(i?.state.get())return new C(t,i)}}class C extends l{constructor(e,t){super();this._editor=e;this._model=t}_onDidChangeContent=this._register(new s);onDidChangeContent=this._onDidChangeContent.event;id=d.InlineCompletions;verbositySettingKey="accessibility.verbosity.inlineCompletions";options={language:this._editor.getModel()?.getLanguageId()??void 0,type:n.View};provideContent(){const e=this._model.state.get();if(!e)throw new Error("Inline completion is visible but state is not available");const t=this._model.textModel.getLineContent(e.primaryGhostText.lineNumber),i=e.primaryGhostText.renderForScreenReader(t);if(!i)throw new Error("Inline completion is visible but ghost text is not available");return t+i}provideNextContent(){this._model.next().then(()=>this._onDidChangeContent.fire())}providePreviousContent(){this._model.previous().then(()=>this._onDidChangeContent.fire())}onClose(){this._model.stop(),this._editor.focus()}}export{T as InlineCompletionsAccessibleView};
