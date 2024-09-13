var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "../../../../base/common/strings.js";
import { ICodeEditor, IActiveCodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { Range, IRange } from "../../../common/core/range.js";
import { CancellationTokenSource, CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ITextModel } from "../../../common/model.js";
import { EditorKeybindingCancellationTokenSource } from "./keybindingCancellation.js";
var CodeEditorStateFlag = /* @__PURE__ */ ((CodeEditorStateFlag2) => {
  CodeEditorStateFlag2[CodeEditorStateFlag2["Value"] = 1] = "Value";
  CodeEditorStateFlag2[CodeEditorStateFlag2["Selection"] = 2] = "Selection";
  CodeEditorStateFlag2[CodeEditorStateFlag2["Position"] = 4] = "Position";
  CodeEditorStateFlag2[CodeEditorStateFlag2["Scroll"] = 8] = "Scroll";
  return CodeEditorStateFlag2;
})(CodeEditorStateFlag || {});
class EditorState {
  static {
    __name(this, "EditorState");
  }
  flags;
  position;
  selection;
  modelVersionId;
  scrollLeft;
  scrollTop;
  constructor(editor, flags) {
    this.flags = flags;
    if ((this.flags & 1 /* Value */) !== 0) {
      const model = editor.getModel();
      this.modelVersionId = model ? strings.format("{0}#{1}", model.uri.toString(), model.getVersionId()) : null;
    } else {
      this.modelVersionId = null;
    }
    if ((this.flags & 4 /* Position */) !== 0) {
      this.position = editor.getPosition();
    } else {
      this.position = null;
    }
    if ((this.flags & 2 /* Selection */) !== 0) {
      this.selection = editor.getSelection();
    } else {
      this.selection = null;
    }
    if ((this.flags & 8 /* Scroll */) !== 0) {
      this.scrollLeft = editor.getScrollLeft();
      this.scrollTop = editor.getScrollTop();
    } else {
      this.scrollLeft = -1;
      this.scrollTop = -1;
    }
  }
  _equals(other) {
    if (!(other instanceof EditorState)) {
      return false;
    }
    const state = other;
    if (this.modelVersionId !== state.modelVersionId) {
      return false;
    }
    if (this.scrollLeft !== state.scrollLeft || this.scrollTop !== state.scrollTop) {
      return false;
    }
    if (!this.position && state.position || this.position && !state.position || this.position && state.position && !this.position.equals(state.position)) {
      return false;
    }
    if (!this.selection && state.selection || this.selection && !state.selection || this.selection && state.selection && !this.selection.equalsRange(state.selection)) {
      return false;
    }
    return true;
  }
  validate(editor) {
    return this._equals(new EditorState(editor, this.flags));
  }
}
class EditorStateCancellationTokenSource extends EditorKeybindingCancellationTokenSource {
  static {
    __name(this, "EditorStateCancellationTokenSource");
  }
  _listener = new DisposableStore();
  constructor(editor, flags, range, parent) {
    super(editor, parent);
    if (flags & 4 /* Position */) {
      this._listener.add(editor.onDidChangeCursorPosition((e) => {
        if (!range || !Range.containsPosition(range, e.position)) {
          this.cancel();
        }
      }));
    }
    if (flags & 2 /* Selection */) {
      this._listener.add(editor.onDidChangeCursorSelection((e) => {
        if (!range || !Range.containsRange(range, e.selection)) {
          this.cancel();
        }
      }));
    }
    if (flags & 8 /* Scroll */) {
      this._listener.add(editor.onDidScrollChange((_) => this.cancel()));
    }
    if (flags & 1 /* Value */) {
      this._listener.add(editor.onDidChangeModel((_) => this.cancel()));
      this._listener.add(editor.onDidChangeModelContent((_) => this.cancel()));
    }
  }
  dispose() {
    this._listener.dispose();
    super.dispose();
  }
}
class TextModelCancellationTokenSource extends CancellationTokenSource {
  static {
    __name(this, "TextModelCancellationTokenSource");
  }
  _listener;
  constructor(model, parent) {
    super(parent);
    this._listener = model.onDidChangeContent(() => this.cancel());
  }
  dispose() {
    this._listener.dispose();
    super.dispose();
  }
}
export {
  CodeEditorStateFlag,
  EditorState,
  EditorStateCancellationTokenSource,
  TextModelCancellationTokenSource
};
//# sourceMappingURL=editorState.js.map
