var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../editor/browser/editorBrowser.js";
import { RenderLineNumbersType, TextEditorCursorStyle, cursorStyleToString, EditorOption } from "../../../editor/common/config/editorOptions.js";
import { IRange, Range } from "../../../editor/common/core/range.js";
import { ISelection, Selection } from "../../../editor/common/core/selection.js";
import { IDecorationOptions, ScrollType } from "../../../editor/common/editorCommon.js";
import { ITextModel, ITextModelUpdateOptions } from "../../../editor/common/model.js";
import { ISingleEditOperation } from "../../../editor/common/core/editOperation.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { SnippetController2 } from "../../../editor/contrib/snippet/browser/snippetController2.js";
import { IApplyEditsOptions, IEditorPropertiesChangeData, IResolvedTextEditorConfiguration, ITextEditorConfigurationUpdate, IUndoStopOptions, TextEditorRevealType } from "../common/extHost.protocol.js";
import { IEditorPane } from "../../common/editor.js";
import { equals } from "../../../base/common/arrays.js";
import { CodeEditorStateFlag, EditorState } from "../../../editor/contrib/editorState/browser/editorState.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { SnippetParser } from "../../../editor/contrib/snippet/browser/snippetParser.js";
import { MainThreadDocuments } from "./mainThreadDocuments.js";
import { ISnippetEdit } from "../../../editor/contrib/snippet/browser/snippetSession.js";
class MainThreadTextEditorProperties {
  constructor(selections, options, visibleRanges) {
    this.selections = selections;
    this.options = options;
    this.visibleRanges = visibleRanges;
  }
  static {
    __name(this, "MainThreadTextEditorProperties");
  }
  static readFromEditor(previousProperties, model, codeEditor) {
    const selections = MainThreadTextEditorProperties._readSelectionsFromCodeEditor(previousProperties, codeEditor);
    const options = MainThreadTextEditorProperties._readOptionsFromCodeEditor(previousProperties, model, codeEditor);
    const visibleRanges = MainThreadTextEditorProperties._readVisibleRangesFromCodeEditor(previousProperties, codeEditor);
    return new MainThreadTextEditorProperties(selections, options, visibleRanges);
  }
  static _readSelectionsFromCodeEditor(previousProperties, codeEditor) {
    let result = null;
    if (codeEditor) {
      result = codeEditor.getSelections();
    }
    if (!result && previousProperties) {
      result = previousProperties.selections;
    }
    if (!result) {
      result = [new Selection(1, 1, 1, 1)];
    }
    return result;
  }
  static _readOptionsFromCodeEditor(previousProperties, model, codeEditor) {
    if (model.isDisposed()) {
      if (previousProperties) {
        return previousProperties.options;
      } else {
        throw new Error("No valid properties");
      }
    }
    let cursorStyle;
    let lineNumbers;
    if (codeEditor) {
      const options = codeEditor.getOptions();
      const lineNumbersOpts = options.get(EditorOption.lineNumbers);
      cursorStyle = options.get(EditorOption.cursorStyle);
      lineNumbers = lineNumbersOpts.renderType;
    } else if (previousProperties) {
      cursorStyle = previousProperties.options.cursorStyle;
      lineNumbers = previousProperties.options.lineNumbers;
    } else {
      cursorStyle = TextEditorCursorStyle.Line;
      lineNumbers = RenderLineNumbersType.On;
    }
    const modelOptions = model.getOptions();
    return {
      insertSpaces: modelOptions.insertSpaces,
      tabSize: modelOptions.tabSize,
      indentSize: modelOptions.indentSize,
      originalIndentSize: modelOptions.originalIndentSize,
      cursorStyle,
      lineNumbers
    };
  }
  static _readVisibleRangesFromCodeEditor(previousProperties, codeEditor) {
    if (codeEditor) {
      return codeEditor.getVisibleRanges();
    }
    return [];
  }
  generateDelta(oldProps, selectionChangeSource) {
    const delta = {
      options: null,
      selections: null,
      visibleRanges: null
    };
    if (!oldProps || !MainThreadTextEditorProperties._selectionsEqual(oldProps.selections, this.selections)) {
      delta.selections = {
        selections: this.selections,
        source: selectionChangeSource ?? void 0
      };
    }
    if (!oldProps || !MainThreadTextEditorProperties._optionsEqual(oldProps.options, this.options)) {
      delta.options = this.options;
    }
    if (!oldProps || !MainThreadTextEditorProperties._rangesEqual(oldProps.visibleRanges, this.visibleRanges)) {
      delta.visibleRanges = this.visibleRanges;
    }
    if (delta.selections || delta.options || delta.visibleRanges) {
      return delta;
    }
    return null;
  }
  static _selectionsEqual(a, b) {
    return equals(a, b, (aValue, bValue) => aValue.equalsSelection(bValue));
  }
  static _rangesEqual(a, b) {
    return equals(a, b, (aValue, bValue) => aValue.equalsRange(bValue));
  }
  static _optionsEqual(a, b) {
    if (a && !b || !a && b) {
      return false;
    }
    if (!a && !b) {
      return true;
    }
    return a.tabSize === b.tabSize && a.indentSize === b.indentSize && a.insertSpaces === b.insertSpaces && a.cursorStyle === b.cursorStyle && a.lineNumbers === b.lineNumbers;
  }
}
class MainThreadTextEditor {
  static {
    __name(this, "MainThreadTextEditor");
  }
  _id;
  _model;
  _mainThreadDocuments;
  _modelService;
  _clipboardService;
  _modelListeners = new DisposableStore();
  _codeEditor;
  _focusTracker;
  _codeEditorListeners = new DisposableStore();
  _properties;
  _onPropertiesChanged;
  constructor(id, model, codeEditor, focusTracker, mainThreadDocuments, modelService, clipboardService) {
    this._id = id;
    this._model = model;
    this._codeEditor = null;
    this._properties = null;
    this._focusTracker = focusTracker;
    this._mainThreadDocuments = mainThreadDocuments;
    this._modelService = modelService;
    this._clipboardService = clipboardService;
    this._onPropertiesChanged = new Emitter();
    this._modelListeners.add(this._model.onDidChangeOptions((e) => {
      this._updatePropertiesNow(null);
    }));
    this.setCodeEditor(codeEditor);
    this._updatePropertiesNow(null);
  }
  dispose() {
    this._modelListeners.dispose();
    this._codeEditor = null;
    this._codeEditorListeners.dispose();
  }
  _updatePropertiesNow(selectionChangeSource) {
    this._setProperties(
      MainThreadTextEditorProperties.readFromEditor(this._properties, this._model, this._codeEditor),
      selectionChangeSource
    );
  }
  _setProperties(newProperties, selectionChangeSource) {
    const delta = newProperties.generateDelta(this._properties, selectionChangeSource);
    this._properties = newProperties;
    if (delta) {
      this._onPropertiesChanged.fire(delta);
    }
  }
  getId() {
    return this._id;
  }
  getModel() {
    return this._model;
  }
  getCodeEditor() {
    return this._codeEditor;
  }
  hasCodeEditor(codeEditor) {
    return this._codeEditor === codeEditor;
  }
  setCodeEditor(codeEditor) {
    if (this.hasCodeEditor(codeEditor)) {
      return;
    }
    this._codeEditorListeners.clear();
    this._codeEditor = codeEditor;
    if (this._codeEditor) {
      this._codeEditorListeners.add(this._codeEditor.onDidChangeModel(() => {
        this.setCodeEditor(null);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidFocusEditorWidget(() => {
        this._focusTracker.onGainedFocus();
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidBlurEditorWidget(() => {
        this._focusTracker.onLostFocus();
      }));
      let nextSelectionChangeSource = null;
      this._codeEditorListeners.add(this._mainThreadDocuments.onIsCaughtUpWithContentChanges((uri) => {
        if (uri.toString() === this._model.uri.toString()) {
          const selectionChangeSource = nextSelectionChangeSource;
          nextSelectionChangeSource = null;
          this._updatePropertiesNow(selectionChangeSource);
        }
      }));
      const isValidCodeEditor = /* @__PURE__ */ __name(() => {
        return this._codeEditor && this._codeEditor.getModel() === this._model;
      }, "isValidCodeEditor");
      const updateProperties = /* @__PURE__ */ __name((selectionChangeSource) => {
        if (this._mainThreadDocuments.isCaughtUpWithContentChanges(this._model.uri)) {
          nextSelectionChangeSource = null;
          this._updatePropertiesNow(selectionChangeSource);
        } else {
          nextSelectionChangeSource = selectionChangeSource;
        }
      }, "updateProperties");
      this._codeEditorListeners.add(this._codeEditor.onDidChangeCursorSelection((e) => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(e.source);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidChangeConfiguration((e) => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(null);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidLayoutChange(() => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(null);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidScrollChange(() => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(null);
      }));
      this._updatePropertiesNow(null);
    }
  }
  isVisible() {
    return !!this._codeEditor;
  }
  getProperties() {
    return this._properties;
  }
  get onPropertiesChanged() {
    return this._onPropertiesChanged.event;
  }
  setSelections(selections) {
    if (this._codeEditor) {
      this._codeEditor.setSelections(selections);
      return;
    }
    const newSelections = selections.map(Selection.liftSelection);
    this._setProperties(
      new MainThreadTextEditorProperties(newSelections, this._properties.options, this._properties.visibleRanges),
      null
    );
  }
  _setIndentConfiguration(newConfiguration) {
    const creationOpts = this._modelService.getCreationOptions(this._model.getLanguageId(), this._model.uri, this._model.isForSimpleWidget);
    if (newConfiguration.tabSize === "auto" || newConfiguration.insertSpaces === "auto") {
      let insertSpaces = creationOpts.insertSpaces;
      let tabSize = creationOpts.tabSize;
      if (newConfiguration.insertSpaces !== "auto" && typeof newConfiguration.insertSpaces !== "undefined") {
        insertSpaces = newConfiguration.insertSpaces;
      }
      if (newConfiguration.tabSize !== "auto" && typeof newConfiguration.tabSize !== "undefined") {
        tabSize = newConfiguration.tabSize;
      }
      this._model.detectIndentation(insertSpaces, tabSize);
      return;
    }
    const newOpts = {};
    if (typeof newConfiguration.insertSpaces !== "undefined") {
      newOpts.insertSpaces = newConfiguration.insertSpaces;
    }
    if (typeof newConfiguration.tabSize !== "undefined") {
      newOpts.tabSize = newConfiguration.tabSize;
    }
    if (typeof newConfiguration.indentSize !== "undefined") {
      newOpts.indentSize = newConfiguration.indentSize;
    }
    this._model.updateOptions(newOpts);
  }
  setConfiguration(newConfiguration) {
    this._setIndentConfiguration(newConfiguration);
    if (!this._codeEditor) {
      return;
    }
    if (newConfiguration.cursorStyle) {
      const newCursorStyle = cursorStyleToString(newConfiguration.cursorStyle);
      this._codeEditor.updateOptions({
        cursorStyle: newCursorStyle
      });
    }
    if (typeof newConfiguration.lineNumbers !== "undefined") {
      let lineNumbers;
      switch (newConfiguration.lineNumbers) {
        case RenderLineNumbersType.On:
          lineNumbers = "on";
          break;
        case RenderLineNumbersType.Relative:
          lineNumbers = "relative";
          break;
        case RenderLineNumbersType.Interval:
          lineNumbers = "interval";
          break;
        default:
          lineNumbers = "off";
      }
      this._codeEditor.updateOptions({
        lineNumbers
      });
    }
  }
  setDecorations(key, ranges) {
    if (!this._codeEditor) {
      return;
    }
    this._codeEditor.setDecorationsByType("exthost-api", key, ranges);
  }
  setDecorationsFast(key, _ranges) {
    if (!this._codeEditor) {
      return;
    }
    const ranges = [];
    for (let i = 0, len = Math.floor(_ranges.length / 4); i < len; i++) {
      ranges[i] = new Range(_ranges[4 * i], _ranges[4 * i + 1], _ranges[4 * i + 2], _ranges[4 * i + 3]);
    }
    this._codeEditor.setDecorationsByTypeFast(key, ranges);
  }
  revealRange(range, revealType) {
    if (!this._codeEditor) {
      return;
    }
    switch (revealType) {
      case TextEditorRevealType.Default:
        this._codeEditor.revealRange(range, ScrollType.Smooth);
        break;
      case TextEditorRevealType.InCenter:
        this._codeEditor.revealRangeInCenter(range, ScrollType.Smooth);
        break;
      case TextEditorRevealType.InCenterIfOutsideViewport:
        this._codeEditor.revealRangeInCenterIfOutsideViewport(range, ScrollType.Smooth);
        break;
      case TextEditorRevealType.AtTop:
        this._codeEditor.revealRangeAtTop(range, ScrollType.Smooth);
        break;
      default:
        console.warn(`Unknown revealType: ${revealType}`);
        break;
    }
  }
  isFocused() {
    if (this._codeEditor) {
      return this._codeEditor.hasTextFocus();
    }
    return false;
  }
  matches(editor) {
    if (!editor) {
      return false;
    }
    return editor.getControl() === this._codeEditor;
  }
  applyEdits(versionIdCheck, edits, opts) {
    if (this._model.getVersionId() !== versionIdCheck) {
      return false;
    }
    if (!this._codeEditor) {
      return false;
    }
    if (typeof opts.setEndOfLine !== "undefined") {
      this._model.pushEOL(opts.setEndOfLine);
    }
    const transformedEdits = edits.map((edit) => {
      return {
        range: Range.lift(edit.range),
        text: edit.text,
        forceMoveMarkers: edit.forceMoveMarkers
      };
    });
    if (opts.undoStopBefore) {
      this._codeEditor.pushUndoStop();
    }
    this._codeEditor.executeEdits("MainThreadTextEditor", transformedEdits);
    if (opts.undoStopAfter) {
      this._codeEditor.pushUndoStop();
    }
    return true;
  }
  async insertSnippet(modelVersionId, template, ranges, opts) {
    if (!this._codeEditor || !this._codeEditor.hasModel()) {
      return false;
    }
    let clipboardText;
    const needsTemplate = SnippetParser.guessNeedsClipboard(template);
    if (needsTemplate) {
      const state = new EditorState(this._codeEditor, CodeEditorStateFlag.Value | CodeEditorStateFlag.Position);
      clipboardText = await this._clipboardService.readText();
      if (!state.validate(this._codeEditor)) {
        return false;
      }
    }
    if (this._codeEditor.getModel().getVersionId() !== modelVersionId) {
      return false;
    }
    const snippetController = SnippetController2.get(this._codeEditor);
    if (!snippetController) {
      return false;
    }
    this._codeEditor.focus();
    const edits = ranges.map((range) => ({ range: Range.lift(range), template }));
    snippetController.apply(edits, {
      overwriteBefore: 0,
      overwriteAfter: 0,
      undoStopBefore: opts.undoStopBefore,
      undoStopAfter: opts.undoStopAfter,
      clipboardText
    });
    return true;
  }
}
export {
  MainThreadTextEditor,
  MainThreadTextEditorProperties
};
//# sourceMappingURL=mainThreadEditor.js.map
