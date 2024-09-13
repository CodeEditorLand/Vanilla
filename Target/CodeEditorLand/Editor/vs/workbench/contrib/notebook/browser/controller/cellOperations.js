var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  ResourceTextEdit
} from "../../../../../editor/browser/services/bulkEditService.js";
import {
  Position
} from "../../../../../editor/common/core/position.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import {
  EndOfLinePreference
} from "../../../../../editor/common/model.js";
import { localize } from "../../../../../nls.js";
import { ResourceNotebookCellEdit } from "../../../bulkEdit/browser/bulkCellEdits.js";
import { cloneNotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import {
  CellEditType,
  CellKind,
  SelectionStateType
} from "../../common/notebookCommon.js";
import {
  cellRangeContains,
  cellRangesToIndexes
} from "../../common/notebookRange.js";
import {
  CellEditState,
  CellFocusMode,
  expandCellRangesWithHiddenCells
} from "../notebookBrowser.js";
async function changeCellToKind(kind, context, language, mime) {
  const { notebookEditor } = context;
  if (!notebookEditor.hasModel()) {
    return;
  }
  if (notebookEditor.isReadOnly) {
    return;
  }
  if (context.ui && context.cell) {
    const { cell } = context;
    if (cell.cellKind === kind) {
      return;
    }
    const text = cell.getText();
    const idx = notebookEditor.getCellIndex(cell);
    if (language === void 0) {
      const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
      language = availableLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
    }
    notebookEditor.textModel.applyEdits(
      [
        {
          editType: CellEditType.Replace,
          index: idx,
          count: 1,
          cells: [
            {
              cellKind: kind,
              source: text,
              language,
              mime: mime ?? cell.mime,
              outputs: cell.model.outputs,
              metadata: cell.metadata
            }
          ]
        }
      ],
      true,
      {
        kind: SelectionStateType.Index,
        focus: notebookEditor.getFocus(),
        selections: notebookEditor.getSelections()
      },
      () => {
        return {
          kind: SelectionStateType.Index,
          focus: notebookEditor.getFocus(),
          selections: notebookEditor.getSelections()
        };
      },
      void 0,
      true
    );
    const newCell = notebookEditor.cellAt(idx);
    await notebookEditor.focusNotebookCell(
      newCell,
      cell.getEditState() === CellEditState.Editing ? "editor" : "container"
    );
  } else if (context.selectedCells) {
    const selectedCells = context.selectedCells;
    const rawEdits = [];
    selectedCells.forEach((cell) => {
      if (cell.cellKind === kind) {
        return;
      }
      const text = cell.getText();
      const idx = notebookEditor.getCellIndex(cell);
      if (language === void 0) {
        const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
        language = availableLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
      }
      rawEdits.push({
        editType: CellEditType.Replace,
        index: idx,
        count: 1,
        cells: [
          {
            cellKind: kind,
            source: text,
            language,
            mime: mime ?? cell.mime,
            outputs: cell.model.outputs,
            metadata: cell.metadata
          }
        ]
      });
    });
    notebookEditor.textModel.applyEdits(
      rawEdits,
      true,
      {
        kind: SelectionStateType.Index,
        focus: notebookEditor.getFocus(),
        selections: notebookEditor.getSelections()
      },
      () => {
        return {
          kind: SelectionStateType.Index,
          focus: notebookEditor.getFocus(),
          selections: notebookEditor.getSelections()
        };
      },
      void 0,
      true
    );
  }
}
__name(changeCellToKind, "changeCellToKind");
function runDeleteAction(editor, cell) {
  const textModel = editor.textModel;
  const selections = editor.getSelections();
  const targetCellIndex = editor.getCellIndex(cell);
  const containingSelection = selections.find(
    (selection) => selection.start <= targetCellIndex && targetCellIndex < selection.end
  );
  const computeUndoRedo = !editor.isReadOnly || textModel.viewType === "interactive";
  if (containingSelection) {
    const edits = selections.reverse().map((selection) => ({
      editType: CellEditType.Replace,
      index: selection.start,
      count: selection.end - selection.start,
      cells: []
    }));
    const nextCellAfterContainingSelection = containingSelection.end >= editor.getLength() ? void 0 : editor.cellAt(containingSelection.end);
    textModel.applyEdits(
      edits,
      true,
      {
        kind: SelectionStateType.Index,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      },
      () => {
        if (nextCellAfterContainingSelection) {
          const cellIndex = textModel.cells.findIndex(
            (cell2) => cell2.handle === nextCellAfterContainingSelection.handle
          );
          return {
            kind: SelectionStateType.Index,
            focus: { start: cellIndex, end: cellIndex + 1 },
            selections: [{ start: cellIndex, end: cellIndex + 1 }]
          };
        } else if (textModel.length) {
          const lastCellIndex = textModel.length - 1;
          return {
            kind: SelectionStateType.Index,
            focus: { start: lastCellIndex, end: lastCellIndex + 1 },
            selections: [
              { start: lastCellIndex, end: lastCellIndex + 1 }
            ]
          };
        } else {
          return {
            kind: SelectionStateType.Index,
            focus: { start: 0, end: 0 },
            selections: [{ start: 0, end: 0 }]
          };
        }
      },
      void 0,
      computeUndoRedo
    );
  } else {
    const focus = editor.getFocus();
    const edits = [
      {
        editType: CellEditType.Replace,
        index: targetCellIndex,
        count: 1,
        cells: []
      }
    ];
    const finalSelections = [];
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      if (selection.end <= targetCellIndex) {
        finalSelections.push(selection);
      } else if (selection.start > targetCellIndex) {
        finalSelections.push({
          start: selection.start - 1,
          end: selection.end - 1
        });
      } else {
        finalSelections.push({
          start: targetCellIndex,
          end: targetCellIndex + 1
        });
      }
    }
    if (editor.cellAt(focus.start) === cell) {
      const newFocus = focus.end === textModel.length ? { start: focus.start - 1, end: focus.end - 1 } : focus;
      textModel.applyEdits(
        edits,
        true,
        {
          kind: SelectionStateType.Index,
          focus: editor.getFocus(),
          selections: editor.getSelections()
        },
        () => ({
          kind: SelectionStateType.Index,
          focus: newFocus,
          selections: finalSelections
        }),
        void 0,
        computeUndoRedo
      );
    } else {
      const newFocus = focus.start > targetCellIndex ? { start: focus.start - 1, end: focus.end - 1 } : focus;
      textModel.applyEdits(
        edits,
        true,
        {
          kind: SelectionStateType.Index,
          focus: editor.getFocus(),
          selections: editor.getSelections()
        },
        () => ({
          kind: SelectionStateType.Index,
          focus: newFocus,
          selections: finalSelections
        }),
        void 0,
        computeUndoRedo
      );
    }
  }
}
__name(runDeleteAction, "runDeleteAction");
async function moveCellRange(context, direction) {
  if (!context.notebookEditor.hasModel()) {
    return;
  }
  const editor = context.notebookEditor;
  const textModel = editor.textModel;
  if (editor.isReadOnly) {
    return;
  }
  let range;
  if (context.cell) {
    const idx = editor.getCellIndex(context.cell);
    range = { start: idx, end: idx + 1 };
  } else {
    const selections = editor.getSelections();
    const modelRanges = expandCellRangesWithHiddenCells(editor, selections);
    range = modelRanges[0];
  }
  if (!range || range.start === range.end) {
    return;
  }
  if (direction === "up") {
    if (range.start === 0) {
      return;
    }
    const indexAbove = range.start - 1;
    const finalSelection = { start: range.start - 1, end: range.end - 1 };
    const focus = context.notebookEditor.getFocus();
    const newFocus = cellRangeContains(range, focus) ? { start: focus.start - 1, end: focus.end - 1 } : { start: range.start - 1, end: range.start };
    textModel.applyEdits(
      [
        {
          editType: CellEditType.Move,
          index: indexAbove,
          length: 1,
          newIdx: range.end - 1
        }
      ],
      true,
      {
        kind: SelectionStateType.Index,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      },
      () => ({
        kind: SelectionStateType.Index,
        focus: newFocus,
        selections: [finalSelection]
      }),
      void 0,
      true
    );
    const focusRange = editor.getSelections()[0] ?? editor.getFocus();
    editor.revealCellRangeInView(focusRange);
  } else {
    if (range.end >= textModel.length) {
      return;
    }
    const indexBelow = range.end;
    const finalSelection = { start: range.start + 1, end: range.end + 1 };
    const focus = editor.getFocus();
    const newFocus = cellRangeContains(range, focus) ? { start: focus.start + 1, end: focus.end + 1 } : { start: range.start + 1, end: range.start + 2 };
    textModel.applyEdits(
      [
        {
          editType: CellEditType.Move,
          index: indexBelow,
          length: 1,
          newIdx: range.start
        }
      ],
      true,
      {
        kind: SelectionStateType.Index,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      },
      () => ({
        kind: SelectionStateType.Index,
        focus: newFocus,
        selections: [finalSelection]
      }),
      void 0,
      true
    );
    const focusRange = editor.getSelections()[0] ?? editor.getFocus();
    editor.revealCellRangeInView(focusRange);
  }
}
__name(moveCellRange, "moveCellRange");
async function copyCellRange(context, direction) {
  const editor = context.notebookEditor;
  if (!editor.hasModel()) {
    return;
  }
  const textModel = editor.textModel;
  if (editor.isReadOnly) {
    return;
  }
  let range;
  if (context.ui) {
    const targetCell = context.cell;
    const targetCellIndex = editor.getCellIndex(targetCell);
    range = { start: targetCellIndex, end: targetCellIndex + 1 };
  } else {
    const selections = editor.getSelections();
    const modelRanges = expandCellRangesWithHiddenCells(editor, selections);
    range = modelRanges[0];
  }
  if (!range || range.start === range.end) {
    return;
  }
  if (direction === "up") {
    const focus = editor.getFocus();
    const selections = editor.getSelections();
    textModel.applyEdits(
      [
        {
          editType: CellEditType.Replace,
          index: range.end,
          count: 0,
          cells: cellRangesToIndexes([range]).map(
            (index) => cloneNotebookCellTextModel(editor.cellAt(index).model)
          )
        }
      ],
      true,
      {
        kind: SelectionStateType.Index,
        focus,
        selections
      },
      () => ({
        kind: SelectionStateType.Index,
        focus,
        selections
      }),
      void 0,
      true
    );
  } else {
    const focus = editor.getFocus();
    const selections = editor.getSelections();
    const newCells = cellRangesToIndexes([range]).map(
      (index) => cloneNotebookCellTextModel(editor.cellAt(index).model)
    );
    const countDelta = newCells.length;
    const newFocus = context.ui ? focus : { start: focus.start + countDelta, end: focus.end + countDelta };
    const newSelections = context.ui ? selections : [
      {
        start: range.start + countDelta,
        end: range.end + countDelta
      }
    ];
    textModel.applyEdits(
      [
        {
          editType: CellEditType.Replace,
          index: range.end,
          count: 0,
          cells: cellRangesToIndexes([range]).map(
            (index) => cloneNotebookCellTextModel(editor.cellAt(index).model)
          )
        }
      ],
      true,
      {
        kind: SelectionStateType.Index,
        focus,
        selections
      },
      () => ({
        kind: SelectionStateType.Index,
        focus: newFocus,
        selections: newSelections
      }),
      void 0,
      true
    );
    const focusRange = editor.getSelections()[0] ?? editor.getFocus();
    editor.revealCellRangeInView(focusRange);
  }
}
__name(copyCellRange, "copyCellRange");
async function joinSelectedCells(bulkEditService, notificationService, context) {
  const editor = context.notebookEditor;
  if (editor.isReadOnly) {
    return;
  }
  const edits = [];
  const cells = [];
  for (const selection of editor.getSelections()) {
    cells.push(...editor.getCellsInRange(selection));
  }
  if (cells.length <= 1) {
    return;
  }
  const cellKind = cells[0].cellKind;
  const isSameKind = cells.every((cell) => cell.cellKind === cellKind);
  if (!isSameKind) {
    const message = localize(
      "notebookActions.joinSelectedCells",
      "Cannot join cells of different kinds"
    );
    return notificationService.warn(message);
  }
  const firstCell = cells[0];
  const insertContent = cells.map((cell) => cell.getText()).join(firstCell.textBuffer.getEOL());
  const firstSelection = editor.getSelections()[0];
  edits.push(
    new ResourceNotebookCellEdit(editor.textModel.uri, {
      editType: CellEditType.Replace,
      index: firstSelection.start,
      count: firstSelection.end - firstSelection.start,
      cells: [
        {
          cellKind: firstCell.cellKind,
          source: insertContent,
          language: firstCell.language,
          mime: firstCell.mime,
          outputs: firstCell.model.outputs,
          metadata: firstCell.metadata
        }
      ]
    })
  );
  for (const selection of editor.getSelections().slice(1)) {
    edits.push(
      new ResourceNotebookCellEdit(editor.textModel.uri, {
        editType: CellEditType.Replace,
        index: selection.start,
        count: selection.end - selection.start,
        cells: []
      })
    );
  }
  if (edits.length) {
    await bulkEditService.apply(edits, {
      quotableLabel: localize(
        "notebookActions.joinSelectedCells.label",
        "Join Notebook Cells"
      )
    });
  }
}
__name(joinSelectedCells, "joinSelectedCells");
async function joinNotebookCells(editor, range, direction, constraint) {
  if (editor.isReadOnly) {
    return null;
  }
  const textModel = editor.textModel;
  const cells = editor.getCellsInRange(range);
  if (!cells.length) {
    return null;
  }
  if (range.start === 0 && direction === "above") {
    return null;
  }
  if (range.end === textModel.length && direction === "below") {
    return null;
  }
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (constraint && cell.cellKind !== constraint) {
      return null;
    }
  }
  if (direction === "above") {
    const above = editor.cellAt(range.start - 1);
    if (constraint && above.cellKind !== constraint) {
      return null;
    }
    const insertContent = cells.map((cell) => (cell.textBuffer.getEOL() ?? "") + cell.getText()).join("");
    const aboveCellLineCount = above.textBuffer.getLineCount();
    const aboveCellLastLineEndColumn = above.textBuffer.getLineLength(aboveCellLineCount);
    return {
      edits: [
        new ResourceTextEdit(above.uri, {
          range: new Range(
            aboveCellLineCount,
            aboveCellLastLineEndColumn + 1,
            aboveCellLineCount,
            aboveCellLastLineEndColumn + 1
          ),
          text: insertContent
        }),
        new ResourceNotebookCellEdit(textModel.uri, {
          editType: CellEditType.Replace,
          index: range.start,
          count: range.end - range.start,
          cells: []
        })
      ],
      cell: above,
      endFocus: { start: range.start - 1, end: range.start },
      endSelections: [{ start: range.start - 1, end: range.start }]
    };
  } else {
    const below = editor.cellAt(range.end);
    if (constraint && below.cellKind !== constraint) {
      return null;
    }
    const cell = cells[0];
    const restCells = [...cells.slice(1), below];
    const insertContent = restCells.map((cl) => (cl.textBuffer.getEOL() ?? "") + cl.getText()).join("");
    const cellLineCount = cell.textBuffer.getLineCount();
    const cellLastLineEndColumn = cell.textBuffer.getLineLength(cellLineCount);
    return {
      edits: [
        new ResourceTextEdit(cell.uri, {
          range: new Range(
            cellLineCount,
            cellLastLineEndColumn + 1,
            cellLineCount,
            cellLastLineEndColumn + 1
          ),
          text: insertContent
        }),
        new ResourceNotebookCellEdit(textModel.uri, {
          editType: CellEditType.Replace,
          index: range.start + 1,
          count: range.end - range.start,
          cells: []
        })
      ],
      cell,
      endFocus: { start: range.start, end: range.start + 1 },
      endSelections: [{ start: range.start, end: range.start + 1 }]
    };
  }
}
__name(joinNotebookCells, "joinNotebookCells");
async function joinCellsWithSurrounds(bulkEditService, context, direction) {
  const editor = context.notebookEditor;
  const textModel = editor.textModel;
  const viewModel = editor.getViewModel();
  let ret = null;
  if (context.ui) {
    const focusMode = context.cell.focusMode;
    const cellIndex = editor.getCellIndex(context.cell);
    ret = await joinNotebookCells(
      editor,
      { start: cellIndex, end: cellIndex + 1 },
      direction
    );
    if (!ret) {
      return;
    }
    await bulkEditService.apply(ret?.edits, {
      quotableLabel: "Join Notebook Cells"
    });
    viewModel.updateSelectionsState({
      kind: SelectionStateType.Index,
      focus: ret.endFocus,
      selections: ret.endSelections
    });
    ret.cell.updateEditState(
      CellEditState.Editing,
      "joinCellsWithSurrounds"
    );
    editor.revealCellRangeInView(editor.getFocus());
    if (focusMode === CellFocusMode.Editor) {
      ret.cell.focusMode = CellFocusMode.Editor;
    }
  } else {
    const selections = editor.getSelections();
    if (!selections.length) {
      return;
    }
    const focus = editor.getFocus();
    const focusMode = editor.cellAt(focus.start)?.focusMode;
    const edits = [];
    let cell = null;
    const cells = [];
    for (let i = selections.length - 1; i >= 0; i--) {
      const selection = selections[i];
      const containFocus = cellRangeContains(selection, focus);
      if (selection.end >= textModel.length && direction === "below" || selection.start === 0 && direction === "above") {
        if (containFocus) {
          cell = editor.cellAt(focus.start);
        }
        cells.push(...editor.getCellsInRange(selection));
        continue;
      }
      const singleRet = await joinNotebookCells(
        editor,
        selection,
        direction
      );
      if (!singleRet) {
        return;
      }
      edits.push(...singleRet.edits);
      cells.push(singleRet.cell);
      if (containFocus) {
        cell = singleRet.cell;
      }
    }
    if (!edits.length) {
      return;
    }
    if (!cell || !cells.length) {
      return;
    }
    await bulkEditService.apply(edits, {
      quotableLabel: "Join Notebook Cells"
    });
    cells.forEach((cell2) => {
      cell2.updateEditState(
        CellEditState.Editing,
        "joinCellsWithSurrounds"
      );
    });
    viewModel.updateSelectionsState({
      kind: SelectionStateType.Handle,
      primary: cell.handle,
      selections: cells.map((cell2) => cell2.handle)
    });
    editor.revealCellRangeInView(editor.getFocus());
    const newFocusedCell = editor.cellAt(editor.getFocus().start);
    if (focusMode === CellFocusMode.Editor && newFocusedCell) {
      newFocusedCell.focusMode = CellFocusMode.Editor;
    }
  }
}
__name(joinCellsWithSurrounds, "joinCellsWithSurrounds");
function _splitPointsToBoundaries(splitPoints, textBuffer) {
  const boundaries = [];
  const lineCnt = textBuffer.getLineCount();
  const getLineLen = /* @__PURE__ */ __name((lineNumber) => {
    return textBuffer.getLineLength(lineNumber);
  }, "getLineLen");
  splitPoints = splitPoints.sort((l, r) => {
    const lineDiff = l.lineNumber - r.lineNumber;
    const columnDiff = l.column - r.column;
    return lineDiff !== 0 ? lineDiff : columnDiff;
  });
  for (let sp of splitPoints) {
    if (getLineLen(sp.lineNumber) + 1 === sp.column && sp.column !== 1 && sp.lineNumber < lineCnt) {
      sp = new Position(sp.lineNumber + 1, 1);
    }
    _pushIfAbsent(boundaries, sp);
  }
  if (boundaries.length === 0) {
    return null;
  }
  const modelStart = new Position(1, 1);
  const modelEnd = new Position(lineCnt, getLineLen(lineCnt) + 1);
  return [modelStart, ...boundaries, modelEnd];
}
__name(_splitPointsToBoundaries, "_splitPointsToBoundaries");
function _pushIfAbsent(positions, p) {
  const last = positions.length > 0 ? positions[positions.length - 1] : void 0;
  if (!last || last.lineNumber !== p.lineNumber || last.column !== p.column) {
    positions.push(p);
  }
}
__name(_pushIfAbsent, "_pushIfAbsent");
function computeCellLinesContents(cell, splitPoints) {
  const rangeBoundaries = _splitPointsToBoundaries(
    splitPoints,
    cell.textBuffer
  );
  if (!rangeBoundaries) {
    return null;
  }
  const newLineModels = [];
  for (let i = 1; i < rangeBoundaries.length; i++) {
    const start = rangeBoundaries[i - 1];
    const end = rangeBoundaries[i];
    newLineModels.push(
      cell.textBuffer.getValueInRange(
        new Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        ),
        EndOfLinePreference.TextDefined
      )
    );
  }
  return newLineModels;
}
__name(computeCellLinesContents, "computeCellLinesContents");
function insertCell(languageService, editor, index, type, direction = "above", initialText = "", ui = false) {
  const viewModel = editor.getViewModel();
  const activeKernel = editor.activeKernel;
  if (viewModel.options.isReadOnly) {
    return null;
  }
  const cell = editor.cellAt(index);
  const nextIndex = ui ? viewModel.getNextVisibleCellIndex(index) : index + 1;
  let language;
  if (type === CellKind.Code) {
    const supportedLanguages = activeKernel?.supportedLanguages ?? languageService.getRegisteredLanguageIds();
    const defaultLanguage = supportedLanguages[0] || PLAINTEXT_LANGUAGE_ID;
    if (cell?.cellKind === CellKind.Code) {
      language = cell.language;
    } else if (cell?.cellKind === CellKind.Markup) {
      const nearestCodeCellIndex = viewModel.nearestCodeCellIndex(index);
      if (nearestCodeCellIndex > -1) {
        language = viewModel.cellAt(nearestCodeCellIndex).language;
      } else {
        language = defaultLanguage;
      }
    } else if (cell === void 0 && direction === "above") {
      language = viewModel.viewCells.find(
        (cell2) => cell2.cellKind === CellKind.Code
      )?.language || defaultLanguage;
    } else {
      language = defaultLanguage;
    }
    if (!supportedLanguages.includes(language)) {
      language = defaultLanguage;
    }
  } else {
    language = "markdown";
  }
  const insertIndex = cell ? direction === "above" ? index : nextIndex : index;
  return insertCellAtIndex(
    viewModel,
    insertIndex,
    initialText,
    language,
    type,
    void 0,
    [],
    true,
    true
  );
}
__name(insertCell, "insertCell");
function insertCellAtIndex(viewModel, index, source, language, type, metadata, outputs, synchronous, pushUndoStop) {
  const endSelections = {
    kind: SelectionStateType.Index,
    focus: { start: index, end: index + 1 },
    selections: [{ start: index, end: index + 1 }]
  };
  viewModel.notebookDocument.applyEdits(
    [
      {
        editType: CellEditType.Replace,
        index,
        count: 0,
        cells: [
          {
            cellKind: type,
            language,
            mime: void 0,
            outputs,
            metadata,
            source
          }
        ]
      }
    ],
    synchronous,
    {
      kind: SelectionStateType.Index,
      focus: viewModel.getFocus(),
      selections: viewModel.getSelections()
    },
    () => endSelections,
    void 0,
    pushUndoStop && !viewModel.options.isReadOnly
  );
  return viewModel.cellAt(index);
}
__name(insertCellAtIndex, "insertCellAtIndex");
export {
  changeCellToKind,
  computeCellLinesContents,
  copyCellRange,
  insertCell,
  insertCellAtIndex,
  joinCellsWithSurrounds,
  joinNotebookCells,
  joinSelectedCells,
  moveCellRange,
  runDeleteAction
};
//# sourceMappingURL=cellOperations.js.map
