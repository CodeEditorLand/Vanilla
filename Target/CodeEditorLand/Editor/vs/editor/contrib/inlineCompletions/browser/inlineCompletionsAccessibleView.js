var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { InlineCompletionContextKeys } from "./controller/inlineCompletionContextKeys.js";
import { InlineCompletionsController } from "./controller/inlineCompletionsController.js";
import { AccessibleViewType, AccessibleViewProviderId, IAccessibleViewContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { InlineCompletionsModel } from "./model/inlineCompletionsModel.js";
class InlineCompletionsAccessibleView {
  static {
    __name(this, "InlineCompletionsAccessibleView");
  }
  type = AccessibleViewType.View;
  priority = 95;
  name = "inline-completions";
  when = ContextKeyExpr.and(InlineCompletionContextKeys.inlineSuggestionVisible);
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!editor) {
      return;
    }
    const model = InlineCompletionsController.get(editor)?.model.get();
    if (!model?.state.get()) {
      return;
    }
    return new InlineCompletionsAccessibleViewContentProvider(editor, model);
  }
}
class InlineCompletionsAccessibleViewContentProvider extends Disposable {
  constructor(_editor, _model) {
    super();
    this._editor = _editor;
    this._model = _model;
  }
  static {
    __name(this, "InlineCompletionsAccessibleViewContentProvider");
  }
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  id = AccessibleViewProviderId.InlineCompletions;
  verbositySettingKey = "accessibility.verbosity.inlineCompletions";
  options = { language: this._editor.getModel()?.getLanguageId() ?? void 0, type: AccessibleViewType.View };
  provideContent() {
    const state = this._model.state.get();
    if (!state) {
      throw new Error("Inline completion is visible but state is not available");
    }
    const lineText = this._model.textModel.getLineContent(state.primaryGhostText.lineNumber);
    const ghostText = state.primaryGhostText.renderForScreenReader(lineText);
    if (!ghostText) {
      throw new Error("Inline completion is visible but ghost text is not available");
    }
    return lineText + ghostText;
  }
  provideNextContent() {
    this._model.next().then(() => this._onDidChangeContent.fire());
    return;
  }
  providePreviousContent() {
    this._model.previous().then(() => this._onDidChangeContent.fire());
    return;
  }
  onClose() {
    this._model.stop();
    this._editor.focus();
  }
}
export {
  InlineCompletionsAccessibleView
};
//# sourceMappingURL=inlineCompletionsAccessibleView.js.map
