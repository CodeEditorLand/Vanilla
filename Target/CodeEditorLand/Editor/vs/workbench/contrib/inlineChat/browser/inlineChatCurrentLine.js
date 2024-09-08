var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import {
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import {
  EditorAction2
} from "../../../../editor/browser/editorExtensions.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { CursorChangeReason } from "../../../../editor/common/cursorEvents.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IChatAgentService } from "../../chat/common/chatAgents.js";
import {
  CTX_INLINE_CHAT_HAS_AGENT,
  CTX_INLINE_CHAT_VISIBLE
} from "../common/inlineChat.js";
import { AbstractInlineChatAction } from "./inlineChatActions.js";
import { InlineChatController, State } from "./inlineChatController.js";
const CTX_INLINE_CHAT_EXPANSION = new RawContextKey(
  "inlineChatExpansion",
  false,
  localize(
    "inlineChatExpansion",
    "Whether the inline chat expansion is enabled when at the end of a just-typed line"
  )
);
let InlineChatExansionContextKey = class {
  static Id = "editor.inlineChatExpansion";
  _store = new DisposableStore();
  _editorListener = this._store.add(new MutableDisposable());
  _ctxInlineChatExpansion;
  constructor(editor, contextKeyService, chatAgentService) {
    this._ctxInlineChatExpansion = CTX_INLINE_CHAT_EXPANSION.bindTo(contextKeyService);
    const update = () => {
      if (editor.hasModel() && chatAgentService.getAgents().length > 0) {
        this._install(editor);
      } else {
        this._uninstall();
      }
    };
    this._store.add(chatAgentService.onDidChangeAgents(update));
    this._store.add(editor.onDidChangeModel(update));
    update();
  }
  dispose() {
    this._ctxInlineChatExpansion.reset();
    this._store.dispose();
  }
  _install(editor) {
    const store = new DisposableStore();
    this._editorListener.value = store;
    const model = editor.getModel();
    const lastChangeEnds = [];
    store.add(
      editor.onDidChangeCursorPosition((e) => {
        let enabled = false;
        if (e.reason === CursorChangeReason.NotSet) {
          const position = editor.getPosition();
          const positionOffset = model.getOffsetAt(position);
          const lineLength = model.getLineLength(position.lineNumber);
          const firstNonWhitespace = model.getLineFirstNonWhitespaceColumn(
            position.lineNumber
          );
          if (firstNonWhitespace !== 0 && position.column > lineLength && lastChangeEnds.includes(positionOffset)) {
            enabled = true;
          }
        }
        lastChangeEnds.length = 0;
        this._ctxInlineChatExpansion.set(enabled);
      })
    );
    store.add(
      editor.onDidChangeModelContent((e) => {
        lastChangeEnds.length = 0;
        for (const change of e.changes) {
          const changeEnd = change.rangeOffset + change.text.length;
          lastChangeEnds.push(changeEnd);
        }
        queueMicrotask(() => {
          if (lastChangeEnds.length > 0) {
            this._ctxInlineChatExpansion.set(false);
          }
        });
      })
    );
  }
  _uninstall() {
    this._editorListener.clear();
  }
};
InlineChatExansionContextKey = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IChatAgentService)
], InlineChatExansionContextKey);
class InlineChatExpandLineAction extends EditorAction2 {
  constructor() {
    super({
      id: "inlineChat.startWithCurrentLine",
      category: AbstractInlineChatAction.category,
      title: localize2(
        "startWithCurrentLine",
        "Start in Editor with Current Line"
      ),
      f1: true,
      precondition: ContextKeyExpr.and(
        CTX_INLINE_CHAT_VISIBLE.negate(),
        CTX_INLINE_CHAT_HAS_AGENT,
        EditorContextKeys.writable
      )
      // keybinding: {
      // 	when: CTX_INLINE_CHAT_EXPANSION,
      // 	weight: KeybindingWeight.EditorContrib,
      // 	primary: KeyCode.Tab
      // }
    });
  }
  async runEditorCommand(_accessor, editor) {
    const ctrl = InlineChatController.get(editor);
    if (!ctrl || !editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const lineNumber = editor.getSelection().positionLineNumber;
    const lineContent = model.getLineContent(lineNumber);
    const startColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    const endColumn = model.getLineMaxColumn(lineNumber);
    let undoEdits = [];
    model.pushEditOperations(
      null,
      [
        EditOperation.replace(
          new Range(lineNumber, startColumn, lineNumber, endColumn),
          ""
        )
      ],
      (edits) => {
        undoEdits = edits;
        return null;
      }
    );
    let lastState;
    const d = ctrl.onDidEnterState((e) => lastState = e);
    try {
      await ctrl.run({
        autoSend: true,
        message: lineContent.trim(),
        position: new Position(lineNumber, startColumn)
      });
    } finally {
      d.dispose();
    }
    if (lastState === State.CANCEL) {
      model.pushEditOperations(null, undoEdits, () => null);
    }
  }
}
export {
  CTX_INLINE_CHAT_EXPANSION,
  InlineChatExansionContextKey,
  InlineChatExpandLineAction
};
