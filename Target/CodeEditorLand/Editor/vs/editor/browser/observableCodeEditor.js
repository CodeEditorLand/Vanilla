var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equalsIfDefined, itemsEquals } from "../../base/common/equals.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../base/common/lifecycle.js";
import { IObservable, ITransaction, TransactionImpl, autorun, autorunOpts, derived, derivedOpts, derivedWithSetter, observableFromEvent, observableSignal, observableValue, observableValueOpts } from "../../base/common/observable.js";
import { EditorOption, FindComputedEditorOptionValueById } from "../common/config/editorOptions.js";
import { Position } from "../common/core/position.js";
import { Selection } from "../common/core/selection.js";
import { ICursorSelectionChangedEvent } from "../common/cursorEvents.js";
import { IModelDeltaDecoration, ITextModel } from "../common/model.js";
import { IModelContentChangedEvent } from "../common/textModelEvents.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "./editorBrowser.js";
function observableCodeEditor(editor) {
  return ObservableCodeEditor.get(editor);
}
__name(observableCodeEditor, "observableCodeEditor");
class ObservableCodeEditor extends Disposable {
  constructor(editor) {
    super();
    this.editor = editor;
    this._register(this.editor.onBeginUpdate(() => this._beginUpdate()));
    this._register(this.editor.onEndUpdate(() => this._endUpdate()));
    this._register(this.editor.onDidChangeModel(() => {
      this._beginUpdate();
      try {
        this._model.set(this.editor.getModel(), this._currentTransaction);
        this._forceUpdate();
      } finally {
        this._endUpdate();
      }
    }));
    this._register(this.editor.onDidType((e) => {
      this._beginUpdate();
      try {
        this._forceUpdate();
        this.onDidType.trigger(this._currentTransaction, e);
      } finally {
        this._endUpdate();
      }
    }));
    this._register(this.editor.onDidChangeModelContent((e) => {
      this._beginUpdate();
      try {
        this._versionId.set(this.editor.getModel()?.getVersionId() ?? null, this._currentTransaction, e);
        this._forceUpdate();
      } finally {
        this._endUpdate();
      }
    }));
    this._register(this.editor.onDidChangeCursorSelection((e) => {
      this._beginUpdate();
      try {
        this._selections.set(this.editor.getSelections(), this._currentTransaction, e);
        this._forceUpdate();
      } finally {
        this._endUpdate();
      }
    }));
  }
  static {
    __name(this, "ObservableCodeEditor");
  }
  static _map = /* @__PURE__ */ new Map();
  /**
   * Make sure that editor is not disposed yet!
  */
  static get(editor) {
    let result = ObservableCodeEditor._map.get(editor);
    if (!result) {
      result = new ObservableCodeEditor(editor);
      ObservableCodeEditor._map.set(editor, result);
      const d = editor.onDidDispose(() => {
        const item = ObservableCodeEditor._map.get(editor);
        if (item) {
          ObservableCodeEditor._map.delete(editor);
          item.dispose();
          d.dispose();
        }
      });
    }
    return result;
  }
  _updateCounter = 0;
  _currentTransaction = void 0;
  _beginUpdate() {
    this._updateCounter++;
    if (this._updateCounter === 1) {
      this._currentTransaction = new TransactionImpl(() => {
      });
    }
  }
  _endUpdate() {
    this._updateCounter--;
    if (this._updateCounter === 0) {
      const t = this._currentTransaction;
      this._currentTransaction = void 0;
      t.finish();
    }
  }
  forceUpdate(cb) {
    this._beginUpdate();
    try {
      this._forceUpdate();
      if (!cb) {
        return void 0;
      }
      return cb(this._currentTransaction);
    } finally {
      this._endUpdate();
    }
  }
  _forceUpdate() {
    this._beginUpdate();
    try {
      this._model.set(this.editor.getModel(), this._currentTransaction);
      this._versionId.set(this.editor.getModel()?.getVersionId() ?? null, this._currentTransaction, void 0);
      this._selections.set(this.editor.getSelections(), this._currentTransaction, void 0);
    } finally {
      this._endUpdate();
    }
  }
  _model = observableValue(this, this.editor.getModel());
  model = this._model;
  isReadonly = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.readOnly));
  _versionId = observableValueOpts({ owner: this, lazy: true }, this.editor.getModel()?.getVersionId() ?? null);
  versionId = this._versionId;
  _selections = observableValueOpts(
    { owner: this, equalsFn: equalsIfDefined(itemsEquals(Selection.selectionsEqual)), lazy: true },
    this.editor.getSelections() ?? null
  );
  selections = this._selections;
  positions = derivedOpts(
    { owner: this, equalsFn: equalsIfDefined(itemsEquals(Position.equals)) },
    (reader) => this.selections.read(reader)?.map((s) => s.getStartPosition()) ?? null
  );
  isFocused = observableFromEvent(this, (e) => {
    const d1 = this.editor.onDidFocusEditorWidget(e);
    const d2 = this.editor.onDidBlurEditorWidget(e);
    return {
      dispose() {
        d1.dispose();
        d2.dispose();
      }
    };
  }, () => this.editor.hasWidgetFocus());
  value = derivedWithSetter(
    this,
    (reader) => {
      this.versionId.read(reader);
      return this.model.read(reader)?.getValue() ?? "";
    },
    (value, tx) => {
      const model = this.model.get();
      if (model !== null) {
        if (value !== model.getValue()) {
          model.setValue(value);
        }
      }
    }
  );
  valueIsEmpty = derived(this, (reader) => {
    this.versionId.read(reader);
    return this.editor.getModel()?.getValueLength() === 0;
  });
  cursorSelection = derivedOpts({ owner: this, equalsFn: equalsIfDefined(Selection.selectionsEqual) }, (reader) => this.selections.read(reader)?.[0] ?? null);
  cursorPosition = derivedOpts({ owner: this, equalsFn: Position.equals }, (reader) => this.selections.read(reader)?.[0]?.getPosition() ?? null);
  onDidType = observableSignal(this);
  scrollTop = observableFromEvent(this.editor.onDidScrollChange, () => this.editor.getScrollTop());
  scrollLeft = observableFromEvent(this.editor.onDidScrollChange, () => this.editor.getScrollLeft());
  layoutInfo = observableFromEvent(this.editor.onDidLayoutChange, () => this.editor.getLayoutInfo());
  layoutInfoContentLeft = this.layoutInfo.map((l) => l.contentLeft);
  layoutInfoDecorationsLeft = this.layoutInfo.map((l) => l.decorationsLeft);
  contentWidth = observableFromEvent(this.editor.onDidContentSizeChange, () => this.editor.getContentWidth());
  getOption(id) {
    return observableFromEvent(this, (cb) => this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(id)) {
        cb(void 0);
      }
    }), () => this.editor.getOption(id));
  }
  setDecorations(decorations) {
    const d = new DisposableStore();
    const decorationsCollection = this.editor.createDecorationsCollection();
    d.add(autorunOpts({ owner: this, debugName: /* @__PURE__ */ __name(() => `Apply decorations from ${decorations.debugName}`, "debugName") }, (reader) => {
      const d2 = decorations.read(reader);
      decorationsCollection.set(d2);
    }));
    d.add({
      dispose: /* @__PURE__ */ __name(() => {
        decorationsCollection.clear();
      }, "dispose")
    });
    return d;
  }
  _overlayWidgetCounter = 0;
  createOverlayWidget(widget) {
    const overlayWidgetId = "observableOverlayWidget" + this._overlayWidgetCounter++;
    const w = {
      getDomNode: /* @__PURE__ */ __name(() => widget.domNode, "getDomNode"),
      getPosition: /* @__PURE__ */ __name(() => widget.position.get(), "getPosition"),
      getId: /* @__PURE__ */ __name(() => overlayWidgetId, "getId"),
      allowEditorOverflow: widget.allowEditorOverflow,
      getMinContentWidthInPx: /* @__PURE__ */ __name(() => widget.minContentWidthInPx.get(), "getMinContentWidthInPx")
    };
    this.editor.addOverlayWidget(w);
    const d = autorun((reader) => {
      widget.position.read(reader);
      widget.minContentWidthInPx.read(reader);
      this.editor.layoutOverlayWidget(w);
    });
    return toDisposable(() => {
      d.dispose();
      this.editor.removeOverlayWidget(w);
    });
  }
}
export {
  ObservableCodeEditor,
  observableCodeEditor
};
//# sourceMappingURL=observableCodeEditor.js.map
