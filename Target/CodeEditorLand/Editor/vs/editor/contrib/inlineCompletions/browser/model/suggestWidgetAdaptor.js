var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { compareBy, numberComparator } from "../../../../../base/common/arrays.js";
import { findFirstMax } from "../../../../../base/common/arraysFind.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { CompletionItemInsertTextRule, CompletionItemKind, SelectedSuggestionInfo } from "../../../../common/languages.js";
import { ITextModel } from "../../../../common/model.js";
import { singleTextEditAugments, singleTextRemoveCommonPrefix } from "./singleTextEditHelpers.js";
import { SnippetParser } from "../../../snippet/browser/snippetParser.js";
import { SnippetSession } from "../../../snippet/browser/snippetSession.js";
import { CompletionItem } from "../../../suggest/browser/suggest.js";
import { SuggestController } from "../../../suggest/browser/suggestController.js";
class SuggestWidgetAdaptor extends Disposable {
  constructor(editor, suggestControllerPreselector, onWillAccept) {
    super();
    this.editor = editor;
    this.suggestControllerPreselector = suggestControllerPreselector;
    this.onWillAccept = onWillAccept;
    this._register(editor.onKeyDown((e) => {
      if (e.shiftKey && !this.isShiftKeyPressed) {
        this.isShiftKeyPressed = true;
        this.update(this._isActive);
      }
    }));
    this._register(editor.onKeyUp((e) => {
      if (e.shiftKey && this.isShiftKeyPressed) {
        this.isShiftKeyPressed = false;
        this.update(this._isActive);
      }
    }));
    const suggestController = SuggestController.get(this.editor);
    if (suggestController) {
      this._register(suggestController.registerSelector({
        priority: 100,
        select: /* @__PURE__ */ __name((model, pos, suggestItems) => {
          const textModel = this.editor.getModel();
          if (!textModel) {
            return -1;
          }
          const i = this.suggestControllerPreselector();
          const itemToPreselect = i ? singleTextRemoveCommonPrefix(i, textModel) : void 0;
          if (!itemToPreselect) {
            return -1;
          }
          const position = Position.lift(pos);
          const candidates = suggestItems.map((suggestItem, index) => {
            const suggestItemInfo = SuggestItemInfo.fromSuggestion(suggestController, textModel, position, suggestItem, this.isShiftKeyPressed);
            const suggestItemTextEdit = singleTextRemoveCommonPrefix(suggestItemInfo.toSingleTextEdit(), textModel);
            const valid = singleTextEditAugments(itemToPreselect, suggestItemTextEdit);
            return { index, valid, prefixLength: suggestItemTextEdit.text.length, suggestItem };
          }).filter((item) => item && item.valid && item.prefixLength > 0);
          const result = findFirstMax(
            candidates,
            compareBy((s) => s.prefixLength, numberComparator)
          );
          return result ? result.index : -1;
        }, "select")
      }));
      let isBoundToSuggestWidget = false;
      const bindToSuggestWidget = /* @__PURE__ */ __name(() => {
        if (isBoundToSuggestWidget) {
          return;
        }
        isBoundToSuggestWidget = true;
        this._register(suggestController.widget.value.onDidShow(() => {
          this.isSuggestWidgetVisible = true;
          this.update(true);
        }));
        this._register(suggestController.widget.value.onDidHide(() => {
          this.isSuggestWidgetVisible = false;
          this.update(false);
        }));
        this._register(suggestController.widget.value.onDidFocus(() => {
          this.isSuggestWidgetVisible = true;
          this.update(true);
        }));
      }, "bindToSuggestWidget");
      this._register(Event.once(suggestController.model.onDidTrigger)((e) => {
        bindToSuggestWidget();
      }));
      this._register(suggestController.onWillInsertSuggestItem((e) => {
        const position = this.editor.getPosition();
        const model = this.editor.getModel();
        if (!position || !model) {
          return void 0;
        }
        const suggestItemInfo = SuggestItemInfo.fromSuggestion(
          suggestController,
          model,
          position,
          e.item,
          this.isShiftKeyPressed
        );
        this.onWillAccept(suggestItemInfo);
      }));
    }
    this.update(this._isActive);
  }
  static {
    __name(this, "SuggestWidgetAdaptor");
  }
  isSuggestWidgetVisible = false;
  isShiftKeyPressed = false;
  _isActive = false;
  _currentSuggestItemInfo = void 0;
  get selectedItem() {
    return this._currentSuggestItemInfo;
  }
  _onDidSelectedItemChange = this._register(new Emitter());
  onDidSelectedItemChange = this._onDidSelectedItemChange.event;
  update(newActive) {
    const newInlineCompletion = this.getSuggestItemInfo();
    if (this._isActive !== newActive || !suggestItemInfoEquals(this._currentSuggestItemInfo, newInlineCompletion)) {
      this._isActive = newActive;
      this._currentSuggestItemInfo = newInlineCompletion;
      this._onDidSelectedItemChange.fire();
    }
  }
  getSuggestItemInfo() {
    const suggestController = SuggestController.get(this.editor);
    if (!suggestController || !this.isSuggestWidgetVisible) {
      return void 0;
    }
    const focusedItem = suggestController.widget.value.getFocusedItem();
    const position = this.editor.getPosition();
    const model = this.editor.getModel();
    if (!focusedItem || !position || !model) {
      return void 0;
    }
    return SuggestItemInfo.fromSuggestion(
      suggestController,
      model,
      position,
      focusedItem.item,
      this.isShiftKeyPressed
    );
  }
  stopForceRenderingAbove() {
    const suggestController = SuggestController.get(this.editor);
    suggestController?.stopForceRenderingAbove();
  }
  forceRenderingAbove() {
    const suggestController = SuggestController.get(this.editor);
    suggestController?.forceRenderingAbove();
  }
}
class SuggestItemInfo {
  constructor(range, insertText, completionItemKind, isSnippetText) {
    this.range = range;
    this.insertText = insertText;
    this.completionItemKind = completionItemKind;
    this.isSnippetText = isSnippetText;
  }
  static {
    __name(this, "SuggestItemInfo");
  }
  static fromSuggestion(suggestController, model, position, item, toggleMode) {
    let { insertText } = item.completion;
    let isSnippetText = false;
    if (item.completion.insertTextRules & CompletionItemInsertTextRule.InsertAsSnippet) {
      const snippet = new SnippetParser().parse(insertText);
      if (snippet.children.length < 100) {
        SnippetSession.adjustWhitespace(model, position, true, snippet);
      }
      insertText = snippet.toString();
      isSnippetText = true;
    }
    const info = suggestController.getOverwriteInfo(item, toggleMode);
    return new SuggestItemInfo(
      Range.fromPositions(
        position.delta(0, -info.overwriteBefore),
        position.delta(0, Math.max(info.overwriteAfter, 0))
      ),
      insertText,
      item.completion.kind,
      isSnippetText
    );
  }
  equals(other) {
    return this.range.equalsRange(other.range) && this.insertText === other.insertText && this.completionItemKind === other.completionItemKind && this.isSnippetText === other.isSnippetText;
  }
  toSelectedSuggestionInfo() {
    return new SelectedSuggestionInfo(this.range, this.insertText, this.completionItemKind, this.isSnippetText);
  }
  toSingleTextEdit() {
    return new SingleTextEdit(this.range, this.insertText);
  }
}
function suggestItemInfoEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.equals(b);
}
__name(suggestItemInfoEquals, "suggestItemInfoEquals");
export {
  SuggestItemInfo,
  SuggestWidgetAdaptor
};
//# sourceMappingURL=suggestWidgetAdaptor.js.map
