var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import * as nls from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { CoreEditingCommands } from "../../../browser/coreCommands.js";
import {
  EditorAction,
  registerEditorAction
} from "../../../browser/editorExtensions.js";
import {
  ReplaceCommand,
  ReplaceCommandThatPreservesSelection,
  ReplaceCommandThatSelectsText
} from "../../../common/commands/replaceCommand.js";
import { TrimTrailingWhitespaceCommand } from "../../../common/commands/trimTrailingWhitespaceCommand.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import {
  EditOperation
} from "../../../common/core/editOperation.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { EnterOperation } from "../../../common/cursor/cursorTypeEditOperations.js";
import { TypeOperations } from "../../../common/cursor/cursorTypeOperations.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { CopyLinesCommand } from "./copyLinesCommand.js";
import { MoveLinesCommand } from "./moveLinesCommand.js";
import { SortLinesCommand } from "./sortLinesCommand.js";
class AbstractCopyLinesAction extends EditorAction {
  static {
    __name(this, "AbstractCopyLinesAction");
  }
  down;
  constructor(down, opts) {
    super(opts);
    this.down = down;
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections().map((selection, index) => ({ selection, index, ignore: false }));
    selections.sort(
      (a, b) => Range.compareRangesUsingStarts(a.selection, b.selection)
    );
    let prev = selections[0];
    for (let i = 1; i < selections.length; i++) {
      const curr = selections[i];
      if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
        if (prev.index < curr.index) {
          curr.ignore = true;
        } else {
          prev.ignore = true;
          prev = curr;
        }
      }
    }
    const commands = [];
    for (const selection of selections) {
      commands.push(
        new CopyLinesCommand(
          selection.selection,
          this.down,
          selection.ignore
        )
      );
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
class CopyLinesUpAction extends AbstractCopyLinesAction {
  static {
    __name(this, "CopyLinesUpAction");
  }
  constructor() {
    super(false, {
      id: "editor.action.copyLinesUpAction",
      label: nls.localize("lines.copyUp", "Copy Line Up"),
      alias: "Copy Line Up",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Alt | KeyMod.Shift | KeyCode.UpArrow,
        linux: {
          primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyMod.Shift | KeyCode.UpArrow
        },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: nls.localize(
          {
            key: "miCopyLinesUp",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Copy Line Up"
        ),
        order: 1
      }
    });
  }
}
class CopyLinesDownAction extends AbstractCopyLinesAction {
  static {
    __name(this, "CopyLinesDownAction");
  }
  constructor() {
    super(true, {
      id: "editor.action.copyLinesDownAction",
      label: nls.localize("lines.copyDown", "Copy Line Down"),
      alias: "Copy Line Down",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Alt | KeyMod.Shift | KeyCode.DownArrow,
        linux: {
          primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyMod.Shift | KeyCode.DownArrow
        },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: nls.localize(
          {
            key: "miCopyLinesDown",
            comment: ["&& denotes a mnemonic"]
          },
          "Co&&py Line Down"
        ),
        order: 2
      }
    });
  }
}
class DuplicateSelectionAction extends EditorAction {
  static {
    __name(this, "DuplicateSelectionAction");
  }
  constructor() {
    super({
      id: "editor.action.duplicateSelection",
      label: nls.localize("duplicateSelection", "Duplicate Selection"),
      alias: "Duplicate Selection",
      precondition: EditorContextKeys.writable,
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: nls.localize(
          {
            key: "miDuplicateSelection",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Duplicate Selection"
        ),
        order: 5
      }
    });
  }
  run(accessor, editor, args) {
    if (!editor.hasModel()) {
      return;
    }
    const commands = [];
    const selections = editor.getSelections();
    const model = editor.getModel();
    for (const selection of selections) {
      if (selection.isEmpty()) {
        commands.push(new CopyLinesCommand(selection, true));
      } else {
        const insertSelection = new Selection(
          selection.endLineNumber,
          selection.endColumn,
          selection.endLineNumber,
          selection.endColumn
        );
        commands.push(
          new ReplaceCommandThatSelectsText(
            insertSelection,
            model.getValueInRange(selection)
          )
        );
      }
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
class AbstractMoveLinesAction extends EditorAction {
  static {
    __name(this, "AbstractMoveLinesAction");
  }
  down;
  constructor(down, opts) {
    super(opts);
    this.down = down;
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(
      ILanguageConfigurationService
    );
    const commands = [];
    const selections = editor.getSelections() || [];
    const autoIndent = editor.getOption(EditorOption.autoIndent);
    for (const selection of selections) {
      commands.push(
        new MoveLinesCommand(
          selection,
          this.down,
          autoIndent,
          languageConfigurationService
        )
      );
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
class MoveLinesUpAction extends AbstractMoveLinesAction {
  static {
    __name(this, "MoveLinesUpAction");
  }
  constructor() {
    super(false, {
      id: "editor.action.moveLinesUpAction",
      label: nls.localize("lines.moveUp", "Move Line Up"),
      alias: "Move Line Up",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Alt | KeyCode.UpArrow,
        linux: { primary: KeyMod.Alt | KeyCode.UpArrow },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: nls.localize(
          {
            key: "miMoveLinesUp",
            comment: ["&& denotes a mnemonic"]
          },
          "Mo&&ve Line Up"
        ),
        order: 3
      }
    });
  }
}
class MoveLinesDownAction extends AbstractMoveLinesAction {
  static {
    __name(this, "MoveLinesDownAction");
  }
  constructor() {
    super(true, {
      id: "editor.action.moveLinesDownAction",
      label: nls.localize("lines.moveDown", "Move Line Down"),
      alias: "Move Line Down",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Alt | KeyCode.DownArrow,
        linux: { primary: KeyMod.Alt | KeyCode.DownArrow },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "2_line",
        title: nls.localize(
          {
            key: "miMoveLinesDown",
            comment: ["&& denotes a mnemonic"]
          },
          "Move &&Line Down"
        ),
        order: 4
      }
    });
  }
}
class AbstractSortLinesAction extends EditorAction {
  static {
    __name(this, "AbstractSortLinesAction");
  }
  descending;
  constructor(descending, opts) {
    super(opts);
    this.descending = descending;
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    let selections = editor.getSelections();
    if (selections.length === 1 && selections[0].isEmpty()) {
      selections = [
        new Selection(
          1,
          1,
          model.getLineCount(),
          model.getLineMaxColumn(model.getLineCount())
        )
      ];
    }
    for (const selection of selections) {
      if (!SortLinesCommand.canRun(
        editor.getModel(),
        selection,
        this.descending
      )) {
        return;
      }
    }
    const commands = [];
    for (let i = 0, len = selections.length; i < len; i++) {
      commands[i] = new SortLinesCommand(selections[i], this.descending);
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
class SortLinesAscendingAction extends AbstractSortLinesAction {
  static {
    __name(this, "SortLinesAscendingAction");
  }
  constructor() {
    super(false, {
      id: "editor.action.sortLinesAscending",
      label: nls.localize("lines.sortAscending", "Sort Lines Ascending"),
      alias: "Sort Lines Ascending",
      precondition: EditorContextKeys.writable
    });
  }
}
class SortLinesDescendingAction extends AbstractSortLinesAction {
  static {
    __name(this, "SortLinesDescendingAction");
  }
  constructor() {
    super(true, {
      id: "editor.action.sortLinesDescending",
      label: nls.localize(
        "lines.sortDescending",
        "Sort Lines Descending"
      ),
      alias: "Sort Lines Descending",
      precondition: EditorContextKeys.writable
    });
  }
}
class DeleteDuplicateLinesAction extends EditorAction {
  static {
    __name(this, "DeleteDuplicateLinesAction");
  }
  constructor() {
    super({
      id: "editor.action.removeDuplicateLines",
      label: nls.localize(
        "lines.deleteDuplicates",
        "Delete Duplicate Lines"
      ),
      alias: "Delete Duplicate Lines",
      precondition: EditorContextKeys.writable
    });
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
      return;
    }
    const edits = [];
    const endCursorState = [];
    let linesDeleted = 0;
    let updateSelection = true;
    let selections = editor.getSelections();
    if (selections.length === 1 && selections[0].isEmpty()) {
      selections = [
        new Selection(
          1,
          1,
          model.getLineCount(),
          model.getLineMaxColumn(model.getLineCount())
        )
      ];
      updateSelection = false;
    }
    for (const selection of selections) {
      const uniqueLines = /* @__PURE__ */ new Set();
      const lines = [];
      for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
        const line = model.getLineContent(i);
        if (uniqueLines.has(line)) {
          continue;
        }
        lines.push(line);
        uniqueLines.add(line);
      }
      const selectionToReplace = new Selection(
        selection.startLineNumber,
        1,
        selection.endLineNumber,
        model.getLineMaxColumn(selection.endLineNumber)
      );
      const adjustedSelectionStart = selection.startLineNumber - linesDeleted;
      const finalSelection = new Selection(
        adjustedSelectionStart,
        1,
        adjustedSelectionStart + lines.length - 1,
        lines[lines.length - 1].length
      );
      edits.push(
        EditOperation.replace(selectionToReplace, lines.join("\n"))
      );
      endCursorState.push(finalSelection);
      linesDeleted += selection.endLineNumber - selection.startLineNumber + 1 - lines.length;
    }
    editor.pushUndoStop();
    editor.executeEdits(
      this.id,
      edits,
      updateSelection ? endCursorState : void 0
    );
    editor.pushUndoStop();
  }
}
class TrimTrailingWhitespaceAction extends EditorAction {
  static {
    __name(this, "TrimTrailingWhitespaceAction");
  }
  static ID = "editor.action.trimTrailingWhitespace";
  constructor() {
    super({
      id: TrimTrailingWhitespaceAction.ID,
      label: nls.localize(
        "lines.trimTrailingWhitespace",
        "Trim Trailing Whitespace"
      ),
      alias: "Trim Trailing Whitespace",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.KeyX
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(_accessor, editor, args) {
    let cursors = [];
    if (args.reason === "auto-save") {
      cursors = (editor.getSelections() || []).map(
        (s) => new Position(s.positionLineNumber, s.positionColumn)
      );
    }
    const selection = editor.getSelection();
    if (selection === null) {
      return;
    }
    const config = _accessor.get(IConfigurationService);
    const model = editor.getModel();
    const trimInRegexAndStrings = config.getValue(
      "files.trimTrailingWhitespaceInRegexAndStrings",
      {
        overrideIdentifier: model?.getLanguageId(),
        resource: model?.uri
      }
    );
    const command = new TrimTrailingWhitespaceCommand(
      selection,
      cursors,
      trimInRegexAndStrings
    );
    editor.pushUndoStop();
    editor.executeCommands(this.id, [command]);
    editor.pushUndoStop();
  }
}
class DeleteLinesAction extends EditorAction {
  static {
    __name(this, "DeleteLinesAction");
  }
  constructor() {
    super({
      id: "editor.action.deleteLines",
      label: nls.localize("lines.delete", "Delete Line"),
      alias: "Delete Line",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyK,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const ops = this._getLinesToRemove(editor);
    const model = editor.getModel();
    if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
      return;
    }
    let linesDeleted = 0;
    const edits = [];
    const cursorState = [];
    for (let i = 0, len = ops.length; i < len; i++) {
      const op = ops[i];
      let startLineNumber = op.startLineNumber;
      let endLineNumber = op.endLineNumber;
      let startColumn = 1;
      let endColumn = model.getLineMaxColumn(endLineNumber);
      if (endLineNumber < model.getLineCount()) {
        endLineNumber += 1;
        endColumn = 1;
      } else if (startLineNumber > 1) {
        startLineNumber -= 1;
        startColumn = model.getLineMaxColumn(startLineNumber);
      }
      edits.push(
        EditOperation.replace(
          new Selection(
            startLineNumber,
            startColumn,
            endLineNumber,
            endColumn
          ),
          ""
        )
      );
      cursorState.push(
        new Selection(
          startLineNumber - linesDeleted,
          op.positionColumn,
          startLineNumber - linesDeleted,
          op.positionColumn
        )
      );
      linesDeleted += op.endLineNumber - op.startLineNumber + 1;
    }
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, cursorState);
    editor.pushUndoStop();
  }
  _getLinesToRemove(editor) {
    const operations = editor.getSelections().map((s) => {
      let endLineNumber = s.endLineNumber;
      if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
        endLineNumber -= 1;
      }
      return {
        startLineNumber: s.startLineNumber,
        selectionStartColumn: s.selectionStartColumn,
        endLineNumber,
        positionColumn: s.positionColumn
      };
    });
    operations.sort((a, b) => {
      if (a.startLineNumber === b.startLineNumber) {
        return a.endLineNumber - b.endLineNumber;
      }
      return a.startLineNumber - b.startLineNumber;
    });
    const mergedOperations = [];
    let previousOperation = operations[0];
    for (let i = 1; i < operations.length; i++) {
      if (previousOperation.endLineNumber + 1 >= operations[i].startLineNumber) {
        previousOperation.endLineNumber = operations[i].endLineNumber;
      } else {
        mergedOperations.push(previousOperation);
        previousOperation = operations[i];
      }
    }
    mergedOperations.push(previousOperation);
    return mergedOperations;
  }
}
class IndentLinesAction extends EditorAction {
  static {
    __name(this, "IndentLinesAction");
  }
  constructor() {
    super({
      id: "editor.action.indentLines",
      label: nls.localize("lines.indent", "Indent Line"),
      alias: "Indent Line",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyCode.BracketRight,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(_accessor, editor) {
    const viewModel = editor._getViewModel();
    if (!viewModel) {
      return;
    }
    editor.pushUndoStop();
    editor.executeCommands(
      this.id,
      TypeOperations.indent(
        viewModel.cursorConfig,
        editor.getModel(),
        editor.getSelections()
      )
    );
    editor.pushUndoStop();
  }
}
class OutdentLinesAction extends EditorAction {
  static {
    __name(this, "OutdentLinesAction");
  }
  constructor() {
    super({
      id: "editor.action.outdentLines",
      label: nls.localize("lines.outdent", "Outdent Line"),
      alias: "Outdent Line",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyCode.BracketLeft,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(_accessor, editor) {
    CoreEditingCommands.Outdent.runEditorCommand(_accessor, editor, null);
  }
}
class InsertLineBeforeAction extends EditorAction {
  static {
    __name(this, "InsertLineBeforeAction");
  }
  constructor() {
    super({
      id: "editor.action.insertLineBefore",
      label: nls.localize("lines.insertBefore", "Insert Line Above"),
      alias: "Insert Line Above",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(_accessor, editor) {
    const viewModel = editor._getViewModel();
    if (!viewModel) {
      return;
    }
    editor.pushUndoStop();
    editor.executeCommands(
      this.id,
      EnterOperation.lineInsertBefore(
        viewModel.cursorConfig,
        editor.getModel(),
        editor.getSelections()
      )
    );
  }
}
class InsertLineAfterAction extends EditorAction {
  static {
    __name(this, "InsertLineAfterAction");
  }
  constructor() {
    super({
      id: "editor.action.insertLineAfter",
      label: nls.localize("lines.insertAfter", "Insert Line Below"),
      alias: "Insert Line Below",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyCode.Enter,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(_accessor, editor) {
    const viewModel = editor._getViewModel();
    if (!viewModel) {
      return;
    }
    editor.pushUndoStop();
    editor.executeCommands(
      this.id,
      EnterOperation.lineInsertAfter(
        viewModel.cursorConfig,
        editor.getModel(),
        editor.getSelections()
      )
    );
  }
}
class AbstractDeleteAllToBoundaryAction extends EditorAction {
  static {
    __name(this, "AbstractDeleteAllToBoundaryAction");
  }
  run(_accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const primaryCursor = editor.getSelection();
    const rangesToDelete = this._getRangesToDelete(editor);
    const effectiveRanges = [];
    for (let i = 0, count = rangesToDelete.length - 1; i < count; i++) {
      const range = rangesToDelete[i];
      const nextRange = rangesToDelete[i + 1];
      if (Range.intersectRanges(range, nextRange) === null) {
        effectiveRanges.push(range);
      } else {
        rangesToDelete[i + 1] = Range.plusRange(range, nextRange);
      }
    }
    effectiveRanges.push(rangesToDelete[rangesToDelete.length - 1]);
    const endCursorState = this._getEndCursorState(
      primaryCursor,
      effectiveRanges
    );
    const edits = effectiveRanges.map((range) => {
      return EditOperation.replace(range, "");
    });
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, endCursorState);
    editor.pushUndoStop();
  }
}
class DeleteAllLeftAction extends AbstractDeleteAllToBoundaryAction {
  static {
    __name(this, "DeleteAllLeftAction");
  }
  constructor() {
    super({
      id: "deleteAllLeft",
      label: nls.localize("lines.deleteAllLeft", "Delete All Left"),
      alias: "Delete All Left",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: KeyMod.CtrlCmd | KeyCode.Backspace },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  _getEndCursorState(primaryCursor, rangesToDelete) {
    let endPrimaryCursor = null;
    const endCursorState = [];
    let deletedLines = 0;
    rangesToDelete.forEach((range) => {
      let endCursor;
      if (range.endColumn === 1 && deletedLines > 0) {
        const newStartLine = range.startLineNumber - deletedLines;
        endCursor = new Selection(
          newStartLine,
          range.startColumn,
          newStartLine,
          range.startColumn
        );
      } else {
        endCursor = new Selection(
          range.startLineNumber,
          range.startColumn,
          range.startLineNumber,
          range.startColumn
        );
      }
      deletedLines += range.endLineNumber - range.startLineNumber;
      if (range.intersectRanges(primaryCursor)) {
        endPrimaryCursor = endCursor;
      } else {
        endCursorState.push(endCursor);
      }
    });
    if (endPrimaryCursor) {
      endCursorState.unshift(endPrimaryCursor);
    }
    return endCursorState;
  }
  _getRangesToDelete(editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return [];
    }
    let rangesToDelete = selections;
    const model = editor.getModel();
    if (model === null) {
      return [];
    }
    rangesToDelete.sort(Range.compareRangesUsingStarts);
    rangesToDelete = rangesToDelete.map((selection) => {
      if (selection.isEmpty()) {
        if (selection.startColumn === 1) {
          const deleteFromLine = Math.max(
            1,
            selection.startLineNumber - 1
          );
          const deleteFromColumn = selection.startLineNumber === 1 ? 1 : model.getLineLength(deleteFromLine) + 1;
          return new Range(
            deleteFromLine,
            deleteFromColumn,
            selection.startLineNumber,
            1
          );
        } else {
          return new Range(
            selection.startLineNumber,
            1,
            selection.startLineNumber,
            selection.startColumn
          );
        }
      } else {
        return new Range(
          selection.startLineNumber,
          1,
          selection.endLineNumber,
          selection.endColumn
        );
      }
    });
    return rangesToDelete;
  }
}
class DeleteAllRightAction extends AbstractDeleteAllToBoundaryAction {
  static {
    __name(this, "DeleteAllRightAction");
  }
  constructor() {
    super({
      id: "deleteAllRight",
      label: nls.localize("lines.deleteAllRight", "Delete All Right"),
      alias: "Delete All Right",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: KeyMod.WinCtrl | KeyCode.KeyK,
          secondary: [KeyMod.CtrlCmd | KeyCode.Delete]
        },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  _getEndCursorState(primaryCursor, rangesToDelete) {
    let endPrimaryCursor = null;
    const endCursorState = [];
    for (let i = 0, len = rangesToDelete.length, offset = 0; i < len; i++) {
      const range = rangesToDelete[i];
      const endCursor = new Selection(
        range.startLineNumber - offset,
        range.startColumn,
        range.startLineNumber - offset,
        range.startColumn
      );
      if (range.intersectRanges(primaryCursor)) {
        endPrimaryCursor = endCursor;
      } else {
        endCursorState.push(endCursor);
      }
    }
    if (endPrimaryCursor) {
      endCursorState.unshift(endPrimaryCursor);
    }
    return endCursorState;
  }
  _getRangesToDelete(editor) {
    const model = editor.getModel();
    if (model === null) {
      return [];
    }
    const selections = editor.getSelections();
    if (selections === null) {
      return [];
    }
    const rangesToDelete = selections.map((sel) => {
      if (sel.isEmpty()) {
        const maxColumn = model.getLineMaxColumn(sel.startLineNumber);
        if (sel.startColumn === maxColumn) {
          return new Range(
            sel.startLineNumber,
            sel.startColumn,
            sel.startLineNumber + 1,
            1
          );
        } else {
          return new Range(
            sel.startLineNumber,
            sel.startColumn,
            sel.startLineNumber,
            maxColumn
          );
        }
      }
      return sel;
    });
    rangesToDelete.sort(Range.compareRangesUsingStarts);
    return rangesToDelete;
  }
}
class JoinLinesAction extends EditorAction {
  static {
    __name(this, "JoinLinesAction");
  }
  constructor() {
    super({
      id: "editor.action.joinLines",
      label: nls.localize("lines.joinLines", "Join Lines"),
      alias: "Join Lines",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 0,
        mac: { primary: KeyMod.WinCtrl | KeyCode.KeyJ },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(_accessor, editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    let primaryCursor = editor.getSelection();
    if (primaryCursor === null) {
      return;
    }
    selections.sort(Range.compareRangesUsingStarts);
    const reducedSelections = [];
    const lastSelection = selections.reduce(
      (previousValue, currentValue) => {
        if (previousValue.isEmpty()) {
          if (previousValue.endLineNumber === currentValue.startLineNumber) {
            if (primaryCursor.equalsSelection(previousValue)) {
              primaryCursor = currentValue;
            }
            return currentValue;
          }
          if (currentValue.startLineNumber > previousValue.endLineNumber + 1) {
            reducedSelections.push(previousValue);
            return currentValue;
          } else {
            return new Selection(
              previousValue.startLineNumber,
              previousValue.startColumn,
              currentValue.endLineNumber,
              currentValue.endColumn
            );
          }
        } else if (currentValue.startLineNumber > previousValue.endLineNumber) {
          reducedSelections.push(previousValue);
          return currentValue;
        } else {
          return new Selection(
            previousValue.startLineNumber,
            previousValue.startColumn,
            currentValue.endLineNumber,
            currentValue.endColumn
          );
        }
      }
    );
    reducedSelections.push(lastSelection);
    const model = editor.getModel();
    if (model === null) {
      return;
    }
    const edits = [];
    const endCursorState = [];
    let endPrimaryCursor = primaryCursor;
    let lineOffset = 0;
    for (let i = 0, len = reducedSelections.length; i < len; i++) {
      const selection = reducedSelections[i];
      const startLineNumber = selection.startLineNumber;
      const startColumn = 1;
      let columnDeltaOffset = 0;
      let endLineNumber, endColumn;
      const selectionEndPositionOffset = model.getLineLength(selection.endLineNumber) - selection.endColumn;
      if (selection.isEmpty() || selection.startLineNumber === selection.endLineNumber) {
        const position = selection.getStartPosition();
        if (position.lineNumber < model.getLineCount()) {
          endLineNumber = startLineNumber + 1;
          endColumn = model.getLineMaxColumn(endLineNumber);
        } else {
          endLineNumber = position.lineNumber;
          endColumn = model.getLineMaxColumn(position.lineNumber);
        }
      } else {
        endLineNumber = selection.endLineNumber;
        endColumn = model.getLineMaxColumn(endLineNumber);
      }
      let trimmedLinesContent = model.getLineContent(startLineNumber);
      for (let i2 = startLineNumber + 1; i2 <= endLineNumber; i2++) {
        const lineText = model.getLineContent(i2);
        const firstNonWhitespaceIdx = model.getLineFirstNonWhitespaceColumn(i2);
        if (firstNonWhitespaceIdx >= 1) {
          let insertSpace = true;
          if (trimmedLinesContent === "") {
            insertSpace = false;
          }
          if (insertSpace && (trimmedLinesContent.charAt(
            trimmedLinesContent.length - 1
          ) === " " || trimmedLinesContent.charAt(
            trimmedLinesContent.length - 1
          ) === "	")) {
            insertSpace = false;
            trimmedLinesContent = trimmedLinesContent.replace(
              /[\s\uFEFF\xA0]+$/g,
              " "
            );
          }
          const lineTextWithoutIndent = lineText.substr(
            firstNonWhitespaceIdx - 1
          );
          trimmedLinesContent += (insertSpace ? " " : "") + lineTextWithoutIndent;
          if (insertSpace) {
            columnDeltaOffset = lineTextWithoutIndent.length + 1;
          } else {
            columnDeltaOffset = lineTextWithoutIndent.length;
          }
        } else {
          columnDeltaOffset = 0;
        }
      }
      const deleteSelection = new Range(
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
      );
      if (!deleteSelection.isEmpty()) {
        let resultSelection;
        if (selection.isEmpty()) {
          edits.push(
            EditOperation.replace(
              deleteSelection,
              trimmedLinesContent
            )
          );
          resultSelection = new Selection(
            deleteSelection.startLineNumber - lineOffset,
            trimmedLinesContent.length - columnDeltaOffset + 1,
            startLineNumber - lineOffset,
            trimmedLinesContent.length - columnDeltaOffset + 1
          );
        } else if (selection.startLineNumber === selection.endLineNumber) {
          edits.push(
            EditOperation.replace(
              deleteSelection,
              trimmedLinesContent
            )
          );
          resultSelection = new Selection(
            selection.startLineNumber - lineOffset,
            selection.startColumn,
            selection.endLineNumber - lineOffset,
            selection.endColumn
          );
        } else {
          edits.push(
            EditOperation.replace(
              deleteSelection,
              trimmedLinesContent
            )
          );
          resultSelection = new Selection(
            selection.startLineNumber - lineOffset,
            selection.startColumn,
            selection.startLineNumber - lineOffset,
            trimmedLinesContent.length - selectionEndPositionOffset
          );
        }
        if (Range.intersectRanges(deleteSelection, primaryCursor) !== null) {
          endPrimaryCursor = resultSelection;
        } else {
          endCursorState.push(resultSelection);
        }
      }
      lineOffset += deleteSelection.endLineNumber - deleteSelection.startLineNumber;
    }
    endCursorState.unshift(endPrimaryCursor);
    editor.pushUndoStop();
    editor.executeEdits(this.id, edits, endCursorState);
    editor.pushUndoStop();
  }
}
class TransposeAction extends EditorAction {
  static {
    __name(this, "TransposeAction");
  }
  constructor() {
    super({
      id: "editor.action.transpose",
      label: nls.localize(
        "editor.transpose",
        "Transpose Characters around the Cursor"
      ),
      alias: "Transpose Characters around the Cursor",
      precondition: EditorContextKeys.writable
    });
  }
  run(_accessor, editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    const model = editor.getModel();
    if (model === null) {
      return;
    }
    const commands = [];
    for (let i = 0, len = selections.length; i < len; i++) {
      const selection = selections[i];
      if (!selection.isEmpty()) {
        continue;
      }
      const cursor = selection.getStartPosition();
      const maxColumn = model.getLineMaxColumn(cursor.lineNumber);
      if (cursor.column >= maxColumn) {
        if (cursor.lineNumber === model.getLineCount()) {
          continue;
        }
        const deleteSelection = new Range(
          cursor.lineNumber,
          Math.max(1, cursor.column - 1),
          cursor.lineNumber + 1,
          1
        );
        const chars = model.getValueInRange(deleteSelection).split("").reverse().join("");
        commands.push(
          new ReplaceCommand(
            new Selection(
              cursor.lineNumber,
              Math.max(1, cursor.column - 1),
              cursor.lineNumber + 1,
              1
            ),
            chars
          )
        );
      } else {
        const deleteSelection = new Range(
          cursor.lineNumber,
          Math.max(1, cursor.column - 1),
          cursor.lineNumber,
          cursor.column + 1
        );
        const chars = model.getValueInRange(deleteSelection).split("").reverse().join("");
        commands.push(
          new ReplaceCommandThatPreservesSelection(
            deleteSelection,
            chars,
            new Selection(
              cursor.lineNumber,
              cursor.column + 1,
              cursor.lineNumber,
              cursor.column + 1
            )
          )
        );
      }
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
class AbstractCaseAction extends EditorAction {
  static {
    __name(this, "AbstractCaseAction");
  }
  run(_accessor, editor) {
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    const model = editor.getModel();
    if (model === null) {
      return;
    }
    const wordSeparators = editor.getOption(EditorOption.wordSeparators);
    const textEdits = [];
    for (const selection of selections) {
      if (selection.isEmpty()) {
        const cursor = selection.getStartPosition();
        const word = editor.getConfiguredWordAtPosition(cursor);
        if (!word) {
          continue;
        }
        const wordRange = new Range(
          cursor.lineNumber,
          word.startColumn,
          cursor.lineNumber,
          word.endColumn
        );
        const text = model.getValueInRange(wordRange);
        textEdits.push(
          EditOperation.replace(
            wordRange,
            this._modifyText(text, wordSeparators)
          )
        );
      } else {
        const text = model.getValueInRange(selection);
        textEdits.push(
          EditOperation.replace(
            selection,
            this._modifyText(text, wordSeparators)
          )
        );
      }
    }
    editor.pushUndoStop();
    editor.executeEdits(this.id, textEdits);
    editor.pushUndoStop();
  }
}
class UpperCaseAction extends AbstractCaseAction {
  static {
    __name(this, "UpperCaseAction");
  }
  constructor() {
    super({
      id: "editor.action.transformToUppercase",
      label: nls.localize(
        "editor.transformToUppercase",
        "Transform to Uppercase"
      ),
      alias: "Transform to Uppercase",
      precondition: EditorContextKeys.writable
    });
  }
  _modifyText(text, wordSeparators) {
    return text.toLocaleUpperCase();
  }
}
class LowerCaseAction extends AbstractCaseAction {
  static {
    __name(this, "LowerCaseAction");
  }
  constructor() {
    super({
      id: "editor.action.transformToLowercase",
      label: nls.localize(
        "editor.transformToLowercase",
        "Transform to Lowercase"
      ),
      alias: "Transform to Lowercase",
      precondition: EditorContextKeys.writable
    });
  }
  _modifyText(text, wordSeparators) {
    return text.toLocaleLowerCase();
  }
}
class BackwardsCompatibleRegExp {
  constructor(_pattern, _flags) {
    this._pattern = _pattern;
    this._flags = _flags;
    this._actual = null;
    this._evaluated = false;
  }
  static {
    __name(this, "BackwardsCompatibleRegExp");
  }
  _actual;
  _evaluated;
  get() {
    if (!this._evaluated) {
      this._evaluated = true;
      try {
        this._actual = new RegExp(this._pattern, this._flags);
      } catch (err) {
      }
    }
    return this._actual;
  }
  isSupported() {
    return this.get() !== null;
  }
}
class TitleCaseAction extends AbstractCaseAction {
  static {
    __name(this, "TitleCaseAction");
  }
  static titleBoundary = new BackwardsCompatibleRegExp(
    "(^|[^\\p{L}\\p{N}']|((^|\\P{L})'))\\p{L}",
    "gmu"
  );
  constructor() {
    super({
      id: "editor.action.transformToTitlecase",
      label: nls.localize(
        "editor.transformToTitlecase",
        "Transform to Title Case"
      ),
      alias: "Transform to Title Case",
      precondition: EditorContextKeys.writable
    });
  }
  _modifyText(text, wordSeparators) {
    const titleBoundary = TitleCaseAction.titleBoundary.get();
    if (!titleBoundary) {
      return text;
    }
    return text.toLocaleLowerCase().replace(titleBoundary, (b) => b.toLocaleUpperCase());
  }
}
class SnakeCaseAction extends AbstractCaseAction {
  static {
    __name(this, "SnakeCaseAction");
  }
  static caseBoundary = new BackwardsCompatibleRegExp(
    "(\\p{Ll})(\\p{Lu})",
    "gmu"
  );
  static singleLetters = new BackwardsCompatibleRegExp(
    "(\\p{Lu}|\\p{N})(\\p{Lu})(\\p{Ll})",
    "gmu"
  );
  constructor() {
    super({
      id: "editor.action.transformToSnakecase",
      label: nls.localize(
        "editor.transformToSnakecase",
        "Transform to Snake Case"
      ),
      alias: "Transform to Snake Case",
      precondition: EditorContextKeys.writable
    });
  }
  _modifyText(text, wordSeparators) {
    const caseBoundary = SnakeCaseAction.caseBoundary.get();
    const singleLetters = SnakeCaseAction.singleLetters.get();
    if (!caseBoundary || !singleLetters) {
      return text;
    }
    return text.replace(caseBoundary, "$1_$2").replace(singleLetters, "$1_$2$3").toLocaleLowerCase();
  }
}
class CamelCaseAction extends AbstractCaseAction {
  static {
    __name(this, "CamelCaseAction");
  }
  static wordBoundary = new BackwardsCompatibleRegExp("[_\\s-]", "gm");
  constructor() {
    super({
      id: "editor.action.transformToCamelcase",
      label: nls.localize(
        "editor.transformToCamelcase",
        "Transform to Camel Case"
      ),
      alias: "Transform to Camel Case",
      precondition: EditorContextKeys.writable
    });
  }
  _modifyText(text, wordSeparators) {
    const wordBoundary = CamelCaseAction.wordBoundary.get();
    if (!wordBoundary) {
      return text;
    }
    const words = text.split(wordBoundary);
    const firstWord = words.shift();
    return firstWord + words.map(
      (word) => word.substring(0, 1).toLocaleUpperCase() + word.substring(1)
    ).join("");
  }
}
class PascalCaseAction extends AbstractCaseAction {
  static {
    __name(this, "PascalCaseAction");
  }
  static wordBoundary = new BackwardsCompatibleRegExp("[_\\s-]", "gm");
  static wordBoundaryToMaintain = new BackwardsCompatibleRegExp(
    "(?<=\\.)",
    "gm"
  );
  constructor() {
    super({
      id: "editor.action.transformToPascalcase",
      label: nls.localize(
        "editor.transformToPascalcase",
        "Transform to Pascal Case"
      ),
      alias: "Transform to Pascal Case",
      precondition: EditorContextKeys.writable
    });
  }
  _modifyText(text, wordSeparators) {
    const wordBoundary = PascalCaseAction.wordBoundary.get();
    const wordBoundaryToMaintain = PascalCaseAction.wordBoundaryToMaintain.get();
    if (!wordBoundary || !wordBoundaryToMaintain) {
      return text;
    }
    const wordsWithMaintainBoundaries = text.split(wordBoundaryToMaintain);
    const words = wordsWithMaintainBoundaries.flatMap(
      (word) => word.split(wordBoundary)
    );
    return words.map(
      (word) => word.substring(0, 1).toLocaleUpperCase() + word.substring(1)
    ).join("");
  }
}
class KebabCaseAction extends AbstractCaseAction {
  static {
    __name(this, "KebabCaseAction");
  }
  static isSupported() {
    const areAllRegexpsSupported = [
      this.caseBoundary,
      this.singleLetters,
      this.underscoreBoundary
    ].every((regexp) => regexp.isSupported());
    return areAllRegexpsSupported;
  }
  static caseBoundary = new BackwardsCompatibleRegExp(
    "(\\p{Ll})(\\p{Lu})",
    "gmu"
  );
  static singleLetters = new BackwardsCompatibleRegExp(
    "(\\p{Lu}|\\p{N})(\\p{Lu}\\p{Ll})",
    "gmu"
  );
  static underscoreBoundary = new BackwardsCompatibleRegExp(
    "(\\S)(_)(\\S)",
    "gm"
  );
  constructor() {
    super({
      id: "editor.action.transformToKebabcase",
      label: nls.localize(
        "editor.transformToKebabcase",
        "Transform to Kebab Case"
      ),
      alias: "Transform to Kebab Case",
      precondition: EditorContextKeys.writable
    });
  }
  _modifyText(text, _) {
    const caseBoundary = KebabCaseAction.caseBoundary.get();
    const singleLetters = KebabCaseAction.singleLetters.get();
    const underscoreBoundary = KebabCaseAction.underscoreBoundary.get();
    if (!caseBoundary || !singleLetters || !underscoreBoundary) {
      return text;
    }
    return text.replace(underscoreBoundary, "$1-$3").replace(caseBoundary, "$1-$2").replace(singleLetters, "$1-$2").toLocaleLowerCase();
  }
}
registerEditorAction(CopyLinesUpAction);
registerEditorAction(CopyLinesDownAction);
registerEditorAction(DuplicateSelectionAction);
registerEditorAction(MoveLinesUpAction);
registerEditorAction(MoveLinesDownAction);
registerEditorAction(SortLinesAscendingAction);
registerEditorAction(SortLinesDescendingAction);
registerEditorAction(DeleteDuplicateLinesAction);
registerEditorAction(TrimTrailingWhitespaceAction);
registerEditorAction(DeleteLinesAction);
registerEditorAction(IndentLinesAction);
registerEditorAction(OutdentLinesAction);
registerEditorAction(InsertLineBeforeAction);
registerEditorAction(InsertLineAfterAction);
registerEditorAction(DeleteAllLeftAction);
registerEditorAction(DeleteAllRightAction);
registerEditorAction(JoinLinesAction);
registerEditorAction(TransposeAction);
registerEditorAction(UpperCaseAction);
registerEditorAction(LowerCaseAction);
if (SnakeCaseAction.caseBoundary.isSupported() && SnakeCaseAction.singleLetters.isSupported()) {
  registerEditorAction(SnakeCaseAction);
}
if (CamelCaseAction.wordBoundary.isSupported()) {
  registerEditorAction(CamelCaseAction);
}
if (PascalCaseAction.wordBoundary.isSupported()) {
  registerEditorAction(PascalCaseAction);
}
if (TitleCaseAction.titleBoundary.isSupported()) {
  registerEditorAction(TitleCaseAction);
}
if (KebabCaseAction.isSupported()) {
  registerEditorAction(KebabCaseAction);
}
export {
  AbstractCaseAction,
  AbstractDeleteAllToBoundaryAction,
  AbstractSortLinesAction,
  CamelCaseAction,
  DeleteAllLeftAction,
  DeleteAllRightAction,
  DeleteDuplicateLinesAction,
  DeleteLinesAction,
  DuplicateSelectionAction,
  IndentLinesAction,
  InsertLineAfterAction,
  InsertLineBeforeAction,
  JoinLinesAction,
  KebabCaseAction,
  LowerCaseAction,
  PascalCaseAction,
  SnakeCaseAction,
  SortLinesAscendingAction,
  SortLinesDescendingAction,
  TitleCaseAction,
  TransposeAction,
  TrimTrailingWhitespaceAction,
  UpperCaseAction
};
//# sourceMappingURL=linesOperations.js.map
