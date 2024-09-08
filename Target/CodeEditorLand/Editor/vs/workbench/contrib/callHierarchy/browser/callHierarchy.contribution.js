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
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import {
  EditorAction2,
  EditorContributionInstantiation,
  registerEditorContribution
} from "../../../../editor/browser/editorExtensions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { Range } from "../../../../editor/common/core/range.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { PeekContext } from "../../../../editor/contrib/peekView/browser/peekView.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import {
  CallHierarchyDirection,
  CallHierarchyModel,
  CallHierarchyProviderRegistry
} from "../common/callHierarchy.js";
import { CallHierarchyTreePeekWidget } from "./callHierarchyPeek.js";
const _ctxHasCallHierarchyProvider = new RawContextKey(
  "editorHasCallHierarchyProvider",
  false,
  localize(
    "editorHasCallHierarchyProvider",
    "Whether a call hierarchy provider is available"
  )
);
const _ctxCallHierarchyVisible = new RawContextKey(
  "callHierarchyVisible",
  false,
  localize(
    "callHierarchyVisible",
    "Whether call hierarchy peek is currently showing"
  )
);
const _ctxCallHierarchyDirection = new RawContextKey(
  "callHierarchyDirection",
  void 0,
  {
    type: "string",
    description: localize(
      "callHierarchyDirection",
      "Whether call hierarchy shows incoming or outgoing calls"
    )
  }
);
function sanitizedDirection(candidate) {
  return candidate === CallHierarchyDirection.CallsFrom || candidate === CallHierarchyDirection.CallsTo ? candidate : CallHierarchyDirection.CallsTo;
}
let CallHierarchyController = class {
  constructor(_editor, _contextKeyService, _storageService, _editorService, _instantiationService) {
    this._editor = _editor;
    this._contextKeyService = _contextKeyService;
    this._storageService = _storageService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._ctxIsVisible = _ctxCallHierarchyVisible.bindTo(this._contextKeyService);
    this._ctxHasProvider = _ctxHasCallHierarchyProvider.bindTo(this._contextKeyService);
    this._ctxDirection = _ctxCallHierarchyDirection.bindTo(this._contextKeyService);
    this._dispoables.add(Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, CallHierarchyProviderRegistry.onDidChange)(() => {
      this._ctxHasProvider.set(_editor.hasModel() && CallHierarchyProviderRegistry.has(_editor.getModel()));
    }));
    this._dispoables.add(this._sessionDisposables);
  }
  static Id = "callHierarchy";
  static get(editor) {
    return editor.getContribution(
      CallHierarchyController.Id
    );
  }
  static _StorageDirection = "callHierarchy/defaultDirection";
  _ctxHasProvider;
  _ctxIsVisible;
  _ctxDirection;
  _dispoables = new DisposableStore();
  _sessionDisposables = new DisposableStore();
  _widget;
  dispose() {
    this._ctxHasProvider.reset();
    this._ctxIsVisible.reset();
    this._dispoables.dispose();
  }
  async startCallHierarchyFromEditor() {
    this._sessionDisposables.clear();
    if (!this._editor.hasModel()) {
      return;
    }
    const document = this._editor.getModel();
    const position = this._editor.getPosition();
    if (!CallHierarchyProviderRegistry.has(document)) {
      return;
    }
    const cts = new CancellationTokenSource();
    const model = CallHierarchyModel.create(document, position, cts.token);
    const direction = sanitizedDirection(
      this._storageService.get(
        CallHierarchyController._StorageDirection,
        StorageScope.PROFILE,
        CallHierarchyDirection.CallsTo
      )
    );
    this._showCallHierarchyWidget(position, direction, model, cts);
  }
  async startCallHierarchyFromCallHierarchy() {
    if (!this._widget) {
      return;
    }
    const model = this._widget.getModel();
    const call = this._widget.getFocused();
    if (!call || !model) {
      return;
    }
    const newEditor = await this._editorService.openCodeEditor(
      { resource: call.item.uri },
      this._editor
    );
    if (!newEditor) {
      return;
    }
    const newModel = model.fork(call.item);
    this._sessionDisposables.clear();
    CallHierarchyController.get(newEditor)?._showCallHierarchyWidget(
      Range.lift(newModel.root.selectionRange).getStartPosition(),
      this._widget.direction,
      Promise.resolve(newModel),
      new CancellationTokenSource()
    );
  }
  _showCallHierarchyWidget(position, direction, model, cts) {
    this._ctxIsVisible.set(true);
    this._ctxDirection.set(direction);
    Event.any(
      this._editor.onDidChangeModel,
      this._editor.onDidChangeModelLanguage
    )(this.endCallHierarchy, this, this._sessionDisposables);
    this._widget = this._instantiationService.createInstance(
      CallHierarchyTreePeekWidget,
      this._editor,
      position,
      direction
    );
    this._widget.showLoading();
    this._sessionDisposables.add(
      this._widget.onDidClose(() => {
        this.endCallHierarchy();
        this._storageService.store(
          CallHierarchyController._StorageDirection,
          this._widget.direction,
          StorageScope.PROFILE,
          StorageTarget.USER
        );
      })
    );
    this._sessionDisposables.add({
      dispose() {
        cts.dispose(true);
      }
    });
    this._sessionDisposables.add(this._widget);
    model.then((model2) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (model2) {
        this._sessionDisposables.add(model2);
        this._widget.showModel(model2);
      } else {
        this._widget.showMessage(
          localize("no.item", "No results")
        );
      }
    }).catch((err) => {
      if (isCancellationError(err)) {
        this.endCallHierarchy();
        return;
      }
      this._widget.showMessage(
        localize("error", "Failed to show call hierarchy")
      );
    });
  }
  showOutgoingCalls() {
    this._widget?.updateDirection(CallHierarchyDirection.CallsFrom);
    this._ctxDirection.set(CallHierarchyDirection.CallsFrom);
  }
  showIncomingCalls() {
    this._widget?.updateDirection(CallHierarchyDirection.CallsTo);
    this._ctxDirection.set(CallHierarchyDirection.CallsTo);
  }
  endCallHierarchy() {
    this._sessionDisposables.clear();
    this._ctxIsVisible.set(false);
    this._editor.focus();
  }
};
CallHierarchyController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IInstantiationService)
], CallHierarchyController);
registerEditorContribution(
  CallHierarchyController.Id,
  CallHierarchyController,
  EditorContributionInstantiation.Eager
);
registerAction2(
  class PeekCallHierarchyAction extends EditorAction2 {
    constructor() {
      super({
        id: "editor.showCallHierarchy",
        title: localize2("title", "Peek Call Hierarchy"),
        menu: {
          id: MenuId.EditorContextPeek,
          group: "navigation",
          order: 1e3,
          when: ContextKeyExpr.and(
            _ctxHasCallHierarchyProvider,
            PeekContext.notInPeekEditor,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          )
        },
        keybinding: {
          when: EditorContextKeys.editorTextFocus,
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyMod.Shift + KeyMod.Alt + KeyCode.KeyH
        },
        precondition: ContextKeyExpr.and(
          _ctxHasCallHierarchyProvider,
          PeekContext.notInPeekEditor
        ),
        f1: true
      });
    }
    async runEditorCommand(_accessor, editor) {
      return CallHierarchyController.get(
        editor
      )?.startCallHierarchyFromEditor();
    }
  }
);
registerAction2(
  class extends EditorAction2 {
    constructor() {
      super({
        id: "editor.showIncomingCalls",
        title: localize2("title.incoming", "Show Incoming Calls"),
        icon: registerIcon(
          "callhierarchy-incoming",
          Codicon.callIncoming,
          localize(
            "showIncomingCallsIcons",
            "Icon for incoming calls in the call hierarchy view."
          )
        ),
        precondition: ContextKeyExpr.and(
          _ctxCallHierarchyVisible,
          _ctxCallHierarchyDirection.isEqualTo(
            CallHierarchyDirection.CallsFrom
          )
        ),
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyMod.Shift + KeyMod.Alt + KeyCode.KeyH
        },
        menu: {
          id: CallHierarchyTreePeekWidget.TitleMenu,
          when: _ctxCallHierarchyDirection.isEqualTo(
            CallHierarchyDirection.CallsFrom
          ),
          order: 1
        }
      });
    }
    runEditorCommand(_accessor, editor) {
      return CallHierarchyController.get(editor)?.showIncomingCalls();
    }
  }
);
registerAction2(
  class extends EditorAction2 {
    constructor() {
      super({
        id: "editor.showOutgoingCalls",
        title: localize2("title.outgoing", "Show Outgoing Calls"),
        icon: registerIcon(
          "callhierarchy-outgoing",
          Codicon.callOutgoing,
          localize(
            "showOutgoingCallsIcon",
            "Icon for outgoing calls in the call hierarchy view."
          )
        ),
        precondition: ContextKeyExpr.and(
          _ctxCallHierarchyVisible,
          _ctxCallHierarchyDirection.isEqualTo(
            CallHierarchyDirection.CallsTo
          )
        ),
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyMod.Shift + KeyMod.Alt + KeyCode.KeyH
        },
        menu: {
          id: CallHierarchyTreePeekWidget.TitleMenu,
          when: _ctxCallHierarchyDirection.isEqualTo(
            CallHierarchyDirection.CallsTo
          ),
          order: 1
        }
      });
    }
    runEditorCommand(_accessor, editor) {
      return CallHierarchyController.get(editor)?.showOutgoingCalls();
    }
  }
);
registerAction2(
  class extends EditorAction2 {
    constructor() {
      super({
        id: "editor.refocusCallHierarchy",
        title: localize2("title.refocus", "Refocus Call Hierarchy"),
        precondition: _ctxCallHierarchyVisible,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyMod.Shift + KeyCode.Enter
        }
      });
    }
    async runEditorCommand(_accessor, editor) {
      return CallHierarchyController.get(
        editor
      )?.startCallHierarchyFromCallHierarchy();
    }
  }
);
registerAction2(
  class extends EditorAction2 {
    constructor() {
      super({
        id: "editor.closeCallHierarchy",
        title: localize("close", "Close"),
        icon: Codicon.close,
        precondition: _ctxCallHierarchyVisible,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib + 10,
          primary: KeyCode.Escape,
          when: ContextKeyExpr.not("config.editor.stablePeek")
        },
        menu: {
          id: CallHierarchyTreePeekWidget.TitleMenu,
          order: 1e3
        }
      });
    }
    runEditorCommand(_accessor, editor) {
      return CallHierarchyController.get(editor)?.endCallHierarchy();
    }
  }
);
