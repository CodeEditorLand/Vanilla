var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { findLast } from "../../../../../base/common/arraysFind.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import {
  derived,
  derivedObservableWithWritableCache,
  observableValue,
  transaction
} from "../../../../../base/common/observable.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ScrollType } from "../../../../../editor/common/editorCommon.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { LineRange } from "../model/lineRange.js";
let MergeEditorViewModel = class extends Disposable {
  constructor(model, inputCodeEditorView1, inputCodeEditorView2, resultCodeEditorView, baseCodeEditorView, showNonConflictingChanges, configurationService, notificationService) {
    super();
    this.model = model;
    this.inputCodeEditorView1 = inputCodeEditorView1;
    this.inputCodeEditorView2 = inputCodeEditorView2;
    this.resultCodeEditorView = resultCodeEditorView;
    this.baseCodeEditorView = baseCodeEditorView;
    this.showNonConflictingChanges = showNonConflictingChanges;
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this._register(resultCodeEditorView.editor.onDidChangeModelContent((e) => {
      if (this.model.isApplyingEditInResult || e.isRedoing || e.isUndoing) {
        return;
      }
      const baseRangeStates = [];
      for (const change of e.changes) {
        const rangeInBase = this.model.translateResultRangeToBase(Range.lift(change.range));
        const baseRanges = this.model.findModifiedBaseRangesInRange(new LineRange(rangeInBase.startLineNumber, rangeInBase.endLineNumber - rangeInBase.startLineNumber));
        if (baseRanges.length === 1) {
          const isHandled = this.model.isHandled(baseRanges[0]).get();
          if (!isHandled) {
            baseRangeStates.push(baseRanges[0]);
          }
        }
      }
      if (baseRangeStates.length === 0) {
        return;
      }
      const element = {
        model: this.model,
        redo() {
          transaction((tx) => {
            for (const r of baseRangeStates) {
              this.model.setHandled(r, true, tx);
            }
          });
        },
        undo() {
          transaction((tx) => {
            for (const r of baseRangeStates) {
              this.model.setHandled(r, false, tx);
            }
          });
        }
      };
      this.attachedHistory.pushAttachedHistoryElement(element);
      element.redo();
    }));
  }
  static {
    __name(this, "MergeEditorViewModel");
  }
  manuallySetActiveModifiedBaseRange = observableValue(this, { range: void 0, counter: 0 });
  attachedHistory = this._register(
    new AttachedHistory(this.model.resultTextModel)
  );
  shouldUseAppendInsteadOfAccept = observableConfigValue(
    "mergeEditor.shouldUseAppendInsteadOfAccept",
    false,
    this.configurationService
  );
  counter = 0;
  lastFocusedEditor = derivedObservableWithWritableCache(this, (reader, lastValue) => {
    const editors = [
      this.inputCodeEditorView1,
      this.inputCodeEditorView2,
      this.resultCodeEditorView,
      this.baseCodeEditorView.read(reader)
    ];
    const view = editors.find((e) => e && e.isFocused.read(reader));
    return view ? { view, counter: this.counter++ } : lastValue || { view: void 0, counter: this.counter++ };
  });
  baseShowDiffAgainst = derived(
    this,
    (reader) => {
      const lastFocusedEditor = this.lastFocusedEditor.read(reader);
      if (lastFocusedEditor.view === this.inputCodeEditorView1) {
        return 1;
      } else if (lastFocusedEditor.view === this.inputCodeEditorView2) {
        return 2;
      }
      return void 0;
    }
  );
  selectionInBase = derived(this, (reader) => {
    const sourceEditor = this.lastFocusedEditor.read(reader).view;
    if (!sourceEditor) {
      return void 0;
    }
    const selections = sourceEditor.selection.read(reader) || [];
    const rangesInBase = selections.map((selection) => {
      if (sourceEditor === this.inputCodeEditorView1) {
        return this.model.translateInputRangeToBase(1, selection);
      } else if (sourceEditor === this.inputCodeEditorView2) {
        return this.model.translateInputRangeToBase(2, selection);
      } else if (sourceEditor === this.resultCodeEditorView) {
        return this.model.translateResultRangeToBase(selection);
      } else if (sourceEditor === this.baseCodeEditorView.read(reader)) {
        return selection;
      } else {
        return selection;
      }
    });
    return {
      rangesInBase,
      sourceEditor
    };
  });
  getRangeOfModifiedBaseRange(editor, modifiedBaseRange, reader) {
    if (editor === this.resultCodeEditorView) {
      return this.model.getLineRangeInResult(
        modifiedBaseRange.baseRange,
        reader
      );
    } else if (editor === this.baseCodeEditorView.get()) {
      return modifiedBaseRange.baseRange;
    } else {
      const input = editor === this.inputCodeEditorView1 ? 1 : 2;
      return modifiedBaseRange.getInputRange(input);
    }
  }
  activeModifiedBaseRange = derived(this, (reader) => {
    const focusedEditor = this.lastFocusedEditor.read(reader);
    const manualRange = this.manuallySetActiveModifiedBaseRange.read(reader);
    if (manualRange.counter > focusedEditor.counter) {
      return manualRange.range;
    }
    if (!focusedEditor.view) {
      return;
    }
    const cursorLineNumber = focusedEditor.view.cursorLineNumber.read(reader);
    if (!cursorLineNumber) {
      return void 0;
    }
    const modifiedBaseRanges = this.model.modifiedBaseRanges.read(reader);
    return modifiedBaseRanges.find((r) => {
      const range = this.getRangeOfModifiedBaseRange(
        focusedEditor.view,
        r,
        reader
      );
      return range.isEmpty ? range.startLineNumber === cursorLineNumber : range.contains(cursorLineNumber);
    });
  });
  setActiveModifiedBaseRange(range, tx) {
    this.manuallySetActiveModifiedBaseRange.set(
      { range, counter: this.counter++ },
      tx
    );
  }
  setState(baseRange, state, tx, inputNumber) {
    this.manuallySetActiveModifiedBaseRange.set(
      { range: baseRange, counter: this.counter++ },
      tx
    );
    this.model.setState(baseRange, state, inputNumber, tx);
    this.lastFocusedEditor.clearCache(tx);
  }
  goToConflict(getModifiedBaseRange) {
    let editor = this.lastFocusedEditor.get().view;
    if (!editor) {
      editor = this.resultCodeEditorView;
    }
    const curLineNumber = editor.editor.getPosition()?.lineNumber;
    if (curLineNumber === void 0) {
      return;
    }
    const modifiedBaseRange = getModifiedBaseRange(editor, curLineNumber);
    if (modifiedBaseRange) {
      const range = this.getRangeOfModifiedBaseRange(
        editor,
        modifiedBaseRange,
        void 0
      );
      editor.editor.focus();
      let startLineNumber = range.startLineNumber;
      let endLineNumberExclusive = range.endLineNumberExclusive;
      if (range.startLineNumber > editor.editor.getModel().getLineCount()) {
        transaction((tx) => {
          this.setActiveModifiedBaseRange(modifiedBaseRange, tx);
        });
        startLineNumber = endLineNumberExclusive = editor.editor.getModel().getLineCount();
      }
      editor.editor.setPosition({
        lineNumber: startLineNumber,
        column: editor.editor.getModel().getLineFirstNonWhitespaceColumn(startLineNumber)
      });
      editor.editor.revealLinesNearTop(
        startLineNumber,
        endLineNumberExclusive,
        ScrollType.Smooth
      );
    }
  }
  goToNextModifiedBaseRange(predicate) {
    this.goToConflict(
      (e, l) => this.model.modifiedBaseRanges.get().find(
        (r) => predicate(r) && this.getRangeOfModifiedBaseRange(e, r, void 0).startLineNumber > l
      ) || this.model.modifiedBaseRanges.get().find((r) => predicate(r))
    );
  }
  goToPreviousModifiedBaseRange(predicate) {
    this.goToConflict(
      (e, l) => findLast(
        this.model.modifiedBaseRanges.get(),
        (r) => predicate(r) && this.getRangeOfModifiedBaseRange(e, r, void 0).endLineNumberExclusive < l
      ) || findLast(
        this.model.modifiedBaseRanges.get(),
        (r) => predicate(r)
      )
    );
  }
  toggleActiveConflict(inputNumber) {
    const activeModifiedBaseRange = this.activeModifiedBaseRange.get();
    if (!activeModifiedBaseRange) {
      this.notificationService.error(
        localize(
          "noConflictMessage",
          "There is currently no conflict focused that can be toggled."
        )
      );
      return;
    }
    transaction((tx) => {
      this.setState(
        activeModifiedBaseRange,
        this.model.getState(activeModifiedBaseRange).get().toggle(inputNumber),
        tx,
        inputNumber
      );
    });
  }
  acceptAll(inputNumber) {
    transaction((tx) => {
      for (const range of this.model.modifiedBaseRanges.get()) {
        this.setState(
          range,
          this.model.getState(range).get().withInputValue(inputNumber, true),
          tx,
          inputNumber
        );
      }
    });
  }
};
MergeEditorViewModel = __decorateClass([
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, INotificationService)
], MergeEditorViewModel);
class AttachedHistory extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    this._register(
      model.onDidChangeContent((e) => {
        const currentAltId = model.getAlternativeVersionId();
        if (e.isRedoing) {
          for (const item of this.attachedHistory) {
            if (this.previousAltId < item.altId && item.altId <= currentAltId) {
              item.element.redo();
            }
          }
        } else if (e.isUndoing) {
          for (let i = this.attachedHistory.length - 1; i >= 0; i--) {
            const item = this.attachedHistory[i];
            if (currentAltId < item.altId && item.altId <= this.previousAltId) {
              item.element.undo();
            }
          }
        } else {
          while (this.attachedHistory.length > 0 && this.attachedHistory[this.attachedHistory.length - 1].altId > this.previousAltId) {
            this.attachedHistory.pop();
          }
        }
        this.previousAltId = currentAltId;
      })
    );
  }
  static {
    __name(this, "AttachedHistory");
  }
  attachedHistory = [];
  previousAltId = this.model.getAlternativeVersionId();
  /**
   * Pushes an history item that is tied to the last text edit (or an extension of it).
   * When the last text edit is undone/redone, so is is this history item.
   */
  pushAttachedHistoryElement(element) {
    this.attachedHistory.push({
      altId: this.model.getAlternativeVersionId(),
      element
    });
  }
}
export {
  MergeEditorViewModel
};
//# sourceMappingURL=viewModel.js.map
