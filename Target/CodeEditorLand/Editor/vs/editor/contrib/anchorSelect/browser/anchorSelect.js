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
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import "./anchorSelect.css";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorContributionInstantiation, registerEditorAction, registerEditorContribution, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { Selection } from "../../../common/core/selection.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { TrackedRangeStickiness } from "../../../common/model.js";
import { localize } from "../../../../nls.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
const SelectionAnchorSet = new RawContextKey("selectionAnchorSet", false);
let SelectionAnchorController = class {
  constructor(editor, contextKeyService) {
    this.editor = editor;
    this.selectionAnchorSetContextKey = SelectionAnchorSet.bindTo(contextKeyService);
    this.modelChangeListener = editor.onDidChangeModel(() => this.selectionAnchorSetContextKey.reset());
  }
  static {
    __name(this, "SelectionAnchorController");
  }
  static ID = "editor.contrib.selectionAnchorController";
  static get(editor) {
    return editor.getContribution(SelectionAnchorController.ID);
  }
  decorationId;
  selectionAnchorSetContextKey;
  modelChangeListener;
  setSelectionAnchor() {
    if (this.editor.hasModel()) {
      const position = this.editor.getPosition();
      this.editor.changeDecorations((accessor) => {
        if (this.decorationId) {
          accessor.removeDecoration(this.decorationId);
        }
        this.decorationId = accessor.addDecoration(
          Selection.fromPositions(position, position),
          {
            description: "selection-anchor",
            stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            hoverMessage: new MarkdownString().appendText(localize("selectionAnchor", "Selection Anchor")),
            className: "selection-anchor"
          }
        );
      });
      this.selectionAnchorSetContextKey.set(!!this.decorationId);
      alert(localize("anchorSet", "Anchor set at {0}:{1}", position.lineNumber, position.column));
    }
  }
  goToSelectionAnchor() {
    if (this.editor.hasModel() && this.decorationId) {
      const anchorPosition = this.editor.getModel().getDecorationRange(this.decorationId);
      if (anchorPosition) {
        this.editor.setPosition(anchorPosition.getStartPosition());
      }
    }
  }
  selectFromAnchorToCursor() {
    if (this.editor.hasModel() && this.decorationId) {
      const start = this.editor.getModel().getDecorationRange(this.decorationId);
      if (start) {
        const end = this.editor.getPosition();
        this.editor.setSelection(Selection.fromPositions(start.getStartPosition(), end));
        this.cancelSelectionAnchor();
      }
    }
  }
  cancelSelectionAnchor() {
    if (this.decorationId) {
      const decorationId = this.decorationId;
      this.editor.changeDecorations((accessor) => {
        accessor.removeDecoration(decorationId);
        this.decorationId = void 0;
      });
      this.selectionAnchorSetContextKey.set(false);
    }
  }
  dispose() {
    this.cancelSelectionAnchor();
    this.modelChangeListener.dispose();
  }
};
SelectionAnchorController = __decorateClass([
  __decorateParam(1, IContextKeyService)
], SelectionAnchorController);
class SetSelectionAnchor extends EditorAction {
  static {
    __name(this, "SetSelectionAnchor");
  }
  constructor() {
    super({
      id: "editor.action.setSelectionAnchor",
      label: localize("setSelectionAnchor", "Set Selection Anchor"),
      alias: "Set Selection Anchor",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyMod.CtrlCmd | KeyCode.KeyB),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.setSelectionAnchor();
  }
}
class GoToSelectionAnchor extends EditorAction {
  static {
    __name(this, "GoToSelectionAnchor");
  }
  constructor() {
    super({
      id: "editor.action.goToSelectionAnchor",
      label: localize("goToSelectionAnchor", "Go to Selection Anchor"),
      alias: "Go to Selection Anchor",
      precondition: SelectionAnchorSet
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.goToSelectionAnchor();
  }
}
class SelectFromAnchorToCursor extends EditorAction {
  static {
    __name(this, "SelectFromAnchorToCursor");
  }
  constructor() {
    super({
      id: "editor.action.selectFromAnchorToCursor",
      label: localize("selectFromAnchorToCursor", "Select from Anchor to Cursor"),
      alias: "Select from Anchor to Cursor",
      precondition: SelectionAnchorSet,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyMod.CtrlCmd | KeyCode.KeyK),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.selectFromAnchorToCursor();
  }
}
class CancelSelectionAnchor extends EditorAction {
  static {
    __name(this, "CancelSelectionAnchor");
  }
  constructor() {
    super({
      id: "editor.action.cancelSelectionAnchor",
      label: localize("cancelSelectionAnchor", "Cancel Selection Anchor"),
      alias: "Cancel Selection Anchor",
      precondition: SelectionAnchorSet,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyCode.Escape,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.cancelSelectionAnchor();
  }
}
registerEditorContribution(SelectionAnchorController.ID, SelectionAnchorController, EditorContributionInstantiation.Lazy);
registerEditorAction(SetSelectionAnchor);
registerEditorAction(GoToSelectionAnchor);
registerEditorAction(SelectFromAnchorToCursor);
registerEditorAction(CancelSelectionAnchor);
export {
  SelectionAnchorSet
};
//# sourceMappingURL=anchorSelect.js.map
