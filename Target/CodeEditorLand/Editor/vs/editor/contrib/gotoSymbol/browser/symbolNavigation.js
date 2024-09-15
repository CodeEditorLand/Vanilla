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
import { Emitter, Event } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { combinedDisposable, DisposableStore, dispose, IDisposable } from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorCommand, registerEditorCommand } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { Range } from "../../../common/core/range.js";
import { OneReference, ReferencesModel } from "./referencesModel.js";
import { localize } from "../../../../nls.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { TextEditorSelectionRevealType } from "../../../../platform/editor/common/editor.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingsRegistry, KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
const ctxHasSymbols = new RawContextKey("hasSymbols", false, localize("hasSymbols", "Whether there are symbol locations that can be navigated via keyboard-only."));
const ISymbolNavigationService = createDecorator("ISymbolNavigationService");
let SymbolNavigationService = class {
  constructor(contextKeyService, _editorService, _notificationService, _keybindingService) {
    this._editorService = _editorService;
    this._notificationService = _notificationService;
    this._keybindingService = _keybindingService;
    this._ctxHasSymbols = ctxHasSymbols.bindTo(contextKeyService);
  }
  static {
    __name(this, "SymbolNavigationService");
  }
  _ctxHasSymbols;
  _currentModel = void 0;
  _currentIdx = -1;
  _currentState;
  _currentMessage;
  _ignoreEditorChange = false;
  reset() {
    this._ctxHasSymbols.reset();
    this._currentState?.dispose();
    this._currentMessage?.dispose();
    this._currentModel = void 0;
    this._currentIdx = -1;
  }
  put(anchor) {
    const refModel = anchor.parent.parent;
    if (refModel.references.length <= 1) {
      this.reset();
      return;
    }
    this._currentModel = refModel;
    this._currentIdx = refModel.references.indexOf(anchor);
    this._ctxHasSymbols.set(true);
    this._showMessage();
    const editorState = new EditorState(this._editorService);
    const listener = editorState.onDidChange((_) => {
      if (this._ignoreEditorChange) {
        return;
      }
      const editor = this._editorService.getActiveCodeEditor();
      if (!editor) {
        return;
      }
      const model = editor.getModel();
      const position = editor.getPosition();
      if (!model || !position) {
        return;
      }
      let seenUri = false;
      let seenPosition = false;
      for (const reference of refModel.references) {
        if (isEqual(reference.uri, model.uri)) {
          seenUri = true;
          seenPosition = seenPosition || Range.containsPosition(reference.range, position);
        } else if (seenUri) {
          break;
        }
      }
      if (!seenUri || !seenPosition) {
        this.reset();
      }
    });
    this._currentState = combinedDisposable(editorState, listener);
  }
  revealNext(source) {
    if (!this._currentModel) {
      return Promise.resolve();
    }
    this._currentIdx += 1;
    this._currentIdx %= this._currentModel.references.length;
    const reference = this._currentModel.references[this._currentIdx];
    this._showMessage();
    this._ignoreEditorChange = true;
    return this._editorService.openCodeEditor({
      resource: reference.uri,
      options: {
        selection: Range.collapseToStart(reference.range),
        selectionRevealType: TextEditorSelectionRevealType.NearTopIfOutsideViewport
      }
    }, source).finally(() => {
      this._ignoreEditorChange = false;
    });
  }
  _showMessage() {
    this._currentMessage?.dispose();
    const kb = this._keybindingService.lookupKeybinding("editor.gotoNextSymbolFromResult");
    const message = kb ? localize("location.kb", "Symbol {0} of {1}, {2} for next", this._currentIdx + 1, this._currentModel.references.length, kb.getLabel()) : localize("location", "Symbol {0} of {1}", this._currentIdx + 1, this._currentModel.references.length);
    this._currentMessage = this._notificationService.status(message);
  }
};
SymbolNavigationService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IKeybindingService)
], SymbolNavigationService);
registerSingleton(ISymbolNavigationService, SymbolNavigationService, InstantiationType.Delayed);
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.gotoNextSymbolFromResult",
      precondition: ctxHasSymbols,
      kbOpts: {
        weight: KeybindingWeight.EditorContrib,
        primary: KeyCode.F12
      }
    });
  }
  runEditorCommand(accessor, editor) {
    return accessor.get(ISymbolNavigationService).revealNext(editor);
  }
}());
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.gotoNextSymbolFromResult.cancel",
  weight: KeybindingWeight.EditorContrib,
  when: ctxHasSymbols,
  primary: KeyCode.Escape,
  handler(accessor) {
    accessor.get(ISymbolNavigationService).reset();
  }
});
let EditorState = class {
  static {
    __name(this, "EditorState");
  }
  _listener = /* @__PURE__ */ new Map();
  _disposables = new DisposableStore();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  constructor(editorService) {
    this._disposables.add(editorService.onCodeEditorRemove(this._onDidRemoveEditor, this));
    this._disposables.add(editorService.onCodeEditorAdd(this._onDidAddEditor, this));
    editorService.listCodeEditors().forEach(this._onDidAddEditor, this);
  }
  dispose() {
    this._disposables.dispose();
    this._onDidChange.dispose();
    dispose(this._listener.values());
  }
  _onDidAddEditor(editor) {
    this._listener.set(editor, combinedDisposable(
      editor.onDidChangeCursorPosition((_) => this._onDidChange.fire({ editor })),
      editor.onDidChangeModelContent((_) => this._onDidChange.fire({ editor }))
    ));
  }
  _onDidRemoveEditor(editor) {
    this._listener.get(editor)?.dispose();
    this._listener.delete(editor);
  }
};
EditorState = __decorateClass([
  __decorateParam(0, ICodeEditorService)
], EditorState);
export {
  ISymbolNavigationService,
  ctxHasSymbols
};
//# sourceMappingURL=symbolNavigation.js.map
