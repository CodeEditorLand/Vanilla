var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { CoreEditingCommands, CoreNavigationCommands } from "../../../../browser/coreCommands.js";
import { Position } from "../../../../common/core/position.js";
import { ITextModel } from "../../../../common/model.js";
import { InlineCompletion, InlineCompletionContext, InlineCompletionsProvider } from "../../../../common/languages.js";
import { ITestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { InlineCompletionsModel } from "../../browser/model/inlineCompletionsModel.js";
import { autorun } from "../../../../../base/common/observable.js";
class MockInlineCompletionsProvider {
  static {
    __name(this, "MockInlineCompletionsProvider");
  }
  returnValue = [];
  delayMs = 0;
  callHistory = new Array();
  calledTwiceIn50Ms = false;
  setReturnValue(value, delayMs = 0) {
    this.returnValue = value ? [value] : [];
    this.delayMs = delayMs;
  }
  setReturnValues(values, delayMs = 0) {
    this.returnValue = values;
    this.delayMs = delayMs;
  }
  getAndClearCallHistory() {
    const history = [...this.callHistory];
    this.callHistory = [];
    return history;
  }
  assertNotCalledTwiceWithin50ms() {
    if (this.calledTwiceIn50Ms) {
      throw new Error("provideInlineCompletions has been called at least twice within 50ms. This should not happen.");
    }
  }
  lastTimeMs = void 0;
  async provideInlineCompletions(model, position, context, token) {
    const currentTimeMs = (/* @__PURE__ */ new Date()).getTime();
    if (this.lastTimeMs && currentTimeMs - this.lastTimeMs < 50) {
      this.calledTwiceIn50Ms = true;
    }
    this.lastTimeMs = currentTimeMs;
    this.callHistory.push({
      position: position.toString(),
      triggerKind: context.triggerKind,
      text: model.getValue()
    });
    const result = new Array();
    result.push(...this.returnValue);
    if (this.delayMs > 0) {
      await timeout(this.delayMs);
    }
    return { items: result };
  }
  freeInlineCompletions() {
  }
  handleItemDidShow() {
  }
}
class GhostTextContext extends Disposable {
  constructor(model, editor) {
    super();
    this.editor = editor;
    this._register(autorun((reader) => {
      const ghostText = model.primaryGhostText.read(reader);
      let view;
      if (ghostText) {
        view = ghostText.render(this.editor.getValue(), true);
      } else {
        view = this.editor.getValue();
      }
      if (this._currentPrettyViewState !== view) {
        this.prettyViewStates.push(view);
      }
      this._currentPrettyViewState = view;
    }));
  }
  static {
    __name(this, "GhostTextContext");
  }
  prettyViewStates = new Array();
  _currentPrettyViewState;
  get currentPrettyViewState() {
    return this._currentPrettyViewState;
  }
  getAndClearViewStates() {
    const arr = [...this.prettyViewStates];
    this.prettyViewStates.length = 0;
    return arr;
  }
  keyboardType(text) {
    this.editor.trigger("keyboard", "type", { text });
  }
  cursorUp() {
    CoreNavigationCommands.CursorUp.runEditorCommand(null, this.editor, null);
  }
  cursorRight() {
    CoreNavigationCommands.CursorRight.runEditorCommand(null, this.editor, null);
  }
  cursorLeft() {
    CoreNavigationCommands.CursorLeft.runEditorCommand(null, this.editor, null);
  }
  cursorDown() {
    CoreNavigationCommands.CursorDown.runEditorCommand(null, this.editor, null);
  }
  cursorLineEnd() {
    CoreNavigationCommands.CursorLineEnd.runEditorCommand(null, this.editor, null);
  }
  leftDelete() {
    CoreEditingCommands.DeleteLeft.runEditorCommand(null, this.editor, null);
  }
}
export {
  GhostTextContext,
  MockInlineCompletionsProvider
};
//# sourceMappingURL=utils.js.map
