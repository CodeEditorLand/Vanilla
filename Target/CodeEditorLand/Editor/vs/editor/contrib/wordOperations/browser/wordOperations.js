var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import * as nls from "../../../../nls.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IsWindowsContext } from "../../../../platform/contextkey/common/contextkeys.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  EditorAction,
  EditorCommand,
  registerEditorAction,
  registerEditorCommand
} from "../../../browser/editorExtensions.js";
import { ReplaceCommand } from "../../../common/commands/replaceCommand.js";
import {
  EditorOption,
  EditorOptions
} from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import {
  getMapForWordSeparators
} from "../../../common/core/wordCharacterClassifier.js";
import {
  WordNavigationType,
  WordOperations
} from "../../../common/cursor/cursorWordOperations.js";
import { CursorState } from "../../../common/cursorCommon.js";
import { CursorChangeReason } from "../../../common/cursorEvents.js";
import { ScrollType } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
class MoveWordCommand extends EditorCommand {
  static {
    __name(this, "MoveWordCommand");
  }
  _inSelectionMode;
  _wordNavigationType;
  constructor(opts) {
    super(opts);
    this._inSelectionMode = opts.inSelectionMode;
    this._wordNavigationType = opts.wordNavigationType;
  }
  runEditorCommand(accessor, editor, args) {
    if (!editor.hasModel()) {
      return;
    }
    const wordSeparators = getMapForWordSeparators(
      editor.getOption(EditorOption.wordSeparators),
      editor.getOption(EditorOption.wordSegmenterLocales)
    );
    const model = editor.getModel();
    const selections = editor.getSelections();
    const hasMulticursor = selections.length > 1;
    const result = selections.map((sel) => {
      const inPosition = new Position(
        sel.positionLineNumber,
        sel.positionColumn
      );
      const outPosition = this._move(
        wordSeparators,
        model,
        inPosition,
        this._wordNavigationType,
        hasMulticursor
      );
      return this._moveTo(sel, outPosition, this._inSelectionMode);
    });
    model.pushStackElement();
    editor._getViewModel().setCursorStates(
      "moveWordCommand",
      CursorChangeReason.Explicit,
      result.map((r) => CursorState.fromModelSelection(r))
    );
    if (result.length === 1) {
      const pos = new Position(
        result[0].positionLineNumber,
        result[0].positionColumn
      );
      editor.revealPosition(pos, ScrollType.Smooth);
    }
  }
  _moveTo(from, to, inSelectionMode) {
    if (inSelectionMode) {
      return new Selection(
        from.selectionStartLineNumber,
        from.selectionStartColumn,
        to.lineNumber,
        to.column
      );
    } else {
      return new Selection(
        to.lineNumber,
        to.column,
        to.lineNumber,
        to.column
      );
    }
  }
}
class WordLeftCommand extends MoveWordCommand {
  static {
    __name(this, "WordLeftCommand");
  }
  _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
    return WordOperations.moveWordLeft(
      wordSeparators,
      model,
      position,
      wordNavigationType,
      hasMulticursor
    );
  }
}
class WordRightCommand extends MoveWordCommand {
  static {
    __name(this, "WordRightCommand");
  }
  _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
    return WordOperations.moveWordRight(
      wordSeparators,
      model,
      position,
      wordNavigationType
    );
  }
}
class CursorWordStartLeft extends WordLeftCommand {
  static {
    __name(this, "CursorWordStartLeft");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordStart,
      id: "cursorWordStartLeft",
      precondition: void 0
    });
  }
}
class CursorWordEndLeft extends WordLeftCommand {
  static {
    __name(this, "CursorWordEndLeft");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "cursorWordEndLeft",
      precondition: void 0
    });
  }
}
class CursorWordLeft extends WordLeftCommand {
  static {
    __name(this, "CursorWordLeft");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordStartFast,
      id: "cursorWordLeft",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(
          EditorContextKeys.textInputFocus,
          ContextKeyExpr.and(
            CONTEXT_ACCESSIBILITY_MODE_ENABLED,
            IsWindowsContext
          )?.negate()
        ),
        primary: KeyMod.CtrlCmd | KeyCode.LeftArrow,
        mac: { primary: KeyMod.Alt | KeyCode.LeftArrow },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class CursorWordStartLeftSelect extends WordLeftCommand {
  static {
    __name(this, "CursorWordStartLeftSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordStart,
      id: "cursorWordStartLeftSelect",
      precondition: void 0
    });
  }
}
class CursorWordEndLeftSelect extends WordLeftCommand {
  static {
    __name(this, "CursorWordEndLeftSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "cursorWordEndLeftSelect",
      precondition: void 0
    });
  }
}
class CursorWordLeftSelect extends WordLeftCommand {
  static {
    __name(this, "CursorWordLeftSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordStartFast,
      id: "cursorWordLeftSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(
          EditorContextKeys.textInputFocus,
          ContextKeyExpr.and(
            CONTEXT_ACCESSIBILITY_MODE_ENABLED,
            IsWindowsContext
          )?.negate()
        ),
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.LeftArrow,
        mac: { primary: KeyMod.Alt | KeyMod.Shift | KeyCode.LeftArrow },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class CursorWordAccessibilityLeft extends WordLeftCommand {
  static {
    __name(this, "CursorWordAccessibilityLeft");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordAccessibility,
      id: "cursorWordAccessibilityLeft",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position, wordNavigationType, hasMulticursor) {
    return super._move(
      getMapForWordSeparators(
        EditorOptions.wordSeparators.defaultValue,
        wordCharacterClassifier.intlSegmenterLocales
      ),
      model,
      position,
      wordNavigationType,
      hasMulticursor
    );
  }
}
class CursorWordAccessibilityLeftSelect extends WordLeftCommand {
  static {
    __name(this, "CursorWordAccessibilityLeftSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordAccessibility,
      id: "cursorWordAccessibilityLeftSelect",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position, wordNavigationType, hasMulticursor) {
    return super._move(
      getMapForWordSeparators(
        EditorOptions.wordSeparators.defaultValue,
        wordCharacterClassifier.intlSegmenterLocales
      ),
      model,
      position,
      wordNavigationType,
      hasMulticursor
    );
  }
}
class CursorWordStartRight extends WordRightCommand {
  static {
    __name(this, "CursorWordStartRight");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordStart,
      id: "cursorWordStartRight",
      precondition: void 0
    });
  }
}
class CursorWordEndRight extends WordRightCommand {
  static {
    __name(this, "CursorWordEndRight");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "cursorWordEndRight",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(
          EditorContextKeys.textInputFocus,
          ContextKeyExpr.and(
            CONTEXT_ACCESSIBILITY_MODE_ENABLED,
            IsWindowsContext
          )?.negate()
        ),
        primary: KeyMod.CtrlCmd | KeyCode.RightArrow,
        mac: { primary: KeyMod.Alt | KeyCode.RightArrow },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class CursorWordRight extends WordRightCommand {
  static {
    __name(this, "CursorWordRight");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "cursorWordRight",
      precondition: void 0
    });
  }
}
class CursorWordStartRightSelect extends WordRightCommand {
  static {
    __name(this, "CursorWordStartRightSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordStart,
      id: "cursorWordStartRightSelect",
      precondition: void 0
    });
  }
}
class CursorWordEndRightSelect extends WordRightCommand {
  static {
    __name(this, "CursorWordEndRightSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "cursorWordEndRightSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(
          EditorContextKeys.textInputFocus,
          ContextKeyExpr.and(
            CONTEXT_ACCESSIBILITY_MODE_ENABLED,
            IsWindowsContext
          )?.negate()
        ),
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.RightArrow,
        mac: {
          primary: KeyMod.Alt | KeyMod.Shift | KeyCode.RightArrow
        },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class CursorWordRightSelect extends WordRightCommand {
  static {
    __name(this, "CursorWordRightSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "cursorWordRightSelect",
      precondition: void 0
    });
  }
}
class CursorWordAccessibilityRight extends WordRightCommand {
  static {
    __name(this, "CursorWordAccessibilityRight");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: WordNavigationType.WordAccessibility,
      id: "cursorWordAccessibilityRight",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position, wordNavigationType, hasMulticursor) {
    return super._move(
      getMapForWordSeparators(
        EditorOptions.wordSeparators.defaultValue,
        wordCharacterClassifier.intlSegmenterLocales
      ),
      model,
      position,
      wordNavigationType,
      hasMulticursor
    );
  }
}
class CursorWordAccessibilityRightSelect extends WordRightCommand {
  static {
    __name(this, "CursorWordAccessibilityRightSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: WordNavigationType.WordAccessibility,
      id: "cursorWordAccessibilityRightSelect",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position, wordNavigationType, hasMulticursor) {
    return super._move(
      getMapForWordSeparators(
        EditorOptions.wordSeparators.defaultValue,
        wordCharacterClassifier.intlSegmenterLocales
      ),
      model,
      position,
      wordNavigationType,
      hasMulticursor
    );
  }
}
class DeleteWordCommand extends EditorCommand {
  static {
    __name(this, "DeleteWordCommand");
  }
  _whitespaceHeuristics;
  _wordNavigationType;
  constructor(opts) {
    super(opts);
    this._whitespaceHeuristics = opts.whitespaceHeuristics;
    this._wordNavigationType = opts.wordNavigationType;
  }
  runEditorCommand(accessor, editor, args) {
    const languageConfigurationService = accessor.get(
      ILanguageConfigurationService
    );
    if (!editor.hasModel()) {
      return;
    }
    const wordSeparators = getMapForWordSeparators(
      editor.getOption(EditorOption.wordSeparators),
      editor.getOption(EditorOption.wordSegmenterLocales)
    );
    const model = editor.getModel();
    const selections = editor.getSelections();
    const autoClosingBrackets = editor.getOption(
      EditorOption.autoClosingBrackets
    );
    const autoClosingQuotes = editor.getOption(
      EditorOption.autoClosingQuotes
    );
    const autoClosingPairs = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getAutoClosingPairs();
    const viewModel = editor._getViewModel();
    const commands = selections.map((sel) => {
      const deleteRange = this._delete(
        {
          wordSeparators,
          model,
          selection: sel,
          whitespaceHeuristics: this._whitespaceHeuristics,
          autoClosingDelete: editor.getOption(
            EditorOption.autoClosingDelete
          ),
          autoClosingBrackets,
          autoClosingQuotes,
          autoClosingPairs,
          autoClosedCharacters: viewModel.getCursorAutoClosedCharacters()
        },
        this._wordNavigationType
      );
      return new ReplaceCommand(deleteRange, "");
    });
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
class DeleteWordLeftCommand extends DeleteWordCommand {
  static {
    __name(this, "DeleteWordLeftCommand");
  }
  _delete(ctx, wordNavigationType) {
    const r = WordOperations.deleteWordLeft(ctx, wordNavigationType);
    if (r) {
      return r;
    }
    return new Range(1, 1, 1, 1);
  }
}
class DeleteWordRightCommand extends DeleteWordCommand {
  static {
    __name(this, "DeleteWordRightCommand");
  }
  _delete(ctx, wordNavigationType) {
    const r = WordOperations.deleteWordRight(ctx, wordNavigationType);
    if (r) {
      return r;
    }
    const lineCount = ctx.model.getLineCount();
    const maxColumn = ctx.model.getLineMaxColumn(lineCount);
    return new Range(lineCount, maxColumn, lineCount, maxColumn);
  }
}
class DeleteWordStartLeft extends DeleteWordLeftCommand {
  static {
    __name(this, "DeleteWordStartLeft");
  }
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: WordNavigationType.WordStart,
      id: "deleteWordStartLeft",
      precondition: EditorContextKeys.writable
    });
  }
}
class DeleteWordEndLeft extends DeleteWordLeftCommand {
  static {
    __name(this, "DeleteWordEndLeft");
  }
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "deleteWordEndLeft",
      precondition: EditorContextKeys.writable
    });
  }
}
class DeleteWordLeft extends DeleteWordLeftCommand {
  static {
    __name(this, "DeleteWordLeft");
  }
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: WordNavigationType.WordStart,
      id: "deleteWordLeft",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: KeyMod.CtrlCmd | KeyCode.Backspace,
        mac: { primary: KeyMod.Alt | KeyCode.Backspace },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class DeleteWordStartRight extends DeleteWordRightCommand {
  static {
    __name(this, "DeleteWordStartRight");
  }
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: WordNavigationType.WordStart,
      id: "deleteWordStartRight",
      precondition: EditorContextKeys.writable
    });
  }
}
class DeleteWordEndRight extends DeleteWordRightCommand {
  static {
    __name(this, "DeleteWordEndRight");
  }
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "deleteWordEndRight",
      precondition: EditorContextKeys.writable
    });
  }
}
class DeleteWordRight extends DeleteWordRightCommand {
  static {
    __name(this, "DeleteWordRight");
  }
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: WordNavigationType.WordEnd,
      id: "deleteWordRight",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: KeyMod.CtrlCmd | KeyCode.Delete,
        mac: { primary: KeyMod.Alt | KeyCode.Delete },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class DeleteInsideWord extends EditorAction {
  static {
    __name(this, "DeleteInsideWord");
  }
  constructor() {
    super({
      id: "deleteInsideWord",
      precondition: EditorContextKeys.writable,
      label: nls.localize("deleteInsideWord", "Delete Word"),
      alias: "Delete Word"
    });
  }
  run(accessor, editor, args) {
    if (!editor.hasModel()) {
      return;
    }
    const wordSeparators = getMapForWordSeparators(
      editor.getOption(EditorOption.wordSeparators),
      editor.getOption(EditorOption.wordSegmenterLocales)
    );
    const model = editor.getModel();
    const selections = editor.getSelections();
    const commands = selections.map((sel) => {
      const deleteRange = WordOperations.deleteInsideWord(
        wordSeparators,
        model,
        sel
      );
      return new ReplaceCommand(deleteRange, "");
    });
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
registerEditorCommand(new CursorWordStartLeft());
registerEditorCommand(new CursorWordEndLeft());
registerEditorCommand(new CursorWordLeft());
registerEditorCommand(new CursorWordStartLeftSelect());
registerEditorCommand(new CursorWordEndLeftSelect());
registerEditorCommand(new CursorWordLeftSelect());
registerEditorCommand(new CursorWordStartRight());
registerEditorCommand(new CursorWordEndRight());
registerEditorCommand(new CursorWordRight());
registerEditorCommand(new CursorWordStartRightSelect());
registerEditorCommand(new CursorWordEndRightSelect());
registerEditorCommand(new CursorWordRightSelect());
registerEditorCommand(new CursorWordAccessibilityLeft());
registerEditorCommand(new CursorWordAccessibilityLeftSelect());
registerEditorCommand(new CursorWordAccessibilityRight());
registerEditorCommand(new CursorWordAccessibilityRightSelect());
registerEditorCommand(new DeleteWordStartLeft());
registerEditorCommand(new DeleteWordEndLeft());
registerEditorCommand(new DeleteWordLeft());
registerEditorCommand(new DeleteWordStartRight());
registerEditorCommand(new DeleteWordEndRight());
registerEditorCommand(new DeleteWordRight());
registerEditorAction(DeleteInsideWord);
export {
  CursorWordAccessibilityLeft,
  CursorWordAccessibilityLeftSelect,
  CursorWordAccessibilityRight,
  CursorWordAccessibilityRightSelect,
  CursorWordEndLeft,
  CursorWordEndLeftSelect,
  CursorWordEndRight,
  CursorWordEndRightSelect,
  CursorWordLeft,
  CursorWordLeftSelect,
  CursorWordRight,
  CursorWordRightSelect,
  CursorWordStartLeft,
  CursorWordStartLeftSelect,
  CursorWordStartRight,
  CursorWordStartRightSelect,
  DeleteInsideWord,
  DeleteWordCommand,
  DeleteWordEndLeft,
  DeleteWordEndRight,
  DeleteWordLeft,
  DeleteWordLeftCommand,
  DeleteWordRight,
  DeleteWordRightCommand,
  DeleteWordStartLeft,
  DeleteWordStartRight,
  MoveWordCommand,
  WordLeftCommand,
  WordRightCommand
};
//# sourceMappingURL=wordOperations.js.map
