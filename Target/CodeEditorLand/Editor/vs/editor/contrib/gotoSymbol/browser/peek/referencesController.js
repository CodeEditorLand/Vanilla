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
import {
  createCancelablePromise
} from "../../../../../base/common/async.js";
import { onUnexpectedError } from "../../../../../base/common/errors.js";
import {
  KeyChord,
  KeyCode,
  KeyMod
} from "../../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import * as nls from "../../../../../nls.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../../platform/contextkey/common/contextkey.js";
import { InputFocusedContext } from "../../../../../platform/contextkey/common/contextkeys.js";
import { TextEditorSelectionSource } from "../../../../../platform/editor/common/editor.js";
import {
  IInstantiationService
} from "../../../../../platform/instantiation/common/instantiation.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  IListService,
  WorkbenchListFocusContextKey,
  WorkbenchTreeElementCanCollapse,
  WorkbenchTreeElementCanExpand
} from "../../../../../platform/list/browser/listService.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import { ICodeEditorService } from "../../../../browser/services/codeEditorService.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { EditorContextKeys } from "../../../../common/editorContextKeys.js";
import {
  PeekContext,
  getOuterEditor
} from "../../../peekView/browser/peekView.js";
import { OneReference } from "../referencesModel.js";
import { LayoutData, ReferenceWidget } from "./referencesWidget.js";
const ctxReferenceSearchVisible = new RawContextKey(
  "referenceSearchVisible",
  false,
  nls.localize(
    "referenceSearchVisible",
    "Whether reference peek is visible, like 'Peek References' or 'Peek Definition'"
  )
);
let ReferencesController = class {
  constructor(_defaultTreeKeyboardSupport, _editor, contextKeyService, _editorService, _notificationService, _instantiationService, _storageService, _configurationService) {
    this._defaultTreeKeyboardSupport = _defaultTreeKeyboardSupport;
    this._editor = _editor;
    this._editorService = _editorService;
    this._notificationService = _notificationService;
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._referenceSearchVisible = ctxReferenceSearchVisible.bindTo(contextKeyService);
  }
  static {
    __name(this, "ReferencesController");
  }
  static ID = "editor.contrib.referencesController";
  _disposables = new DisposableStore();
  _widget;
  _model;
  _peekMode;
  _requestIdPool = 0;
  _ignoreModelChangeEvent = false;
  _referenceSearchVisible;
  static get(editor) {
    return editor.getContribution(
      ReferencesController.ID
    );
  }
  dispose() {
    this._referenceSearchVisible.reset();
    this._disposables.dispose();
    this._widget?.dispose();
    this._model?.dispose();
    this._widget = void 0;
    this._model = void 0;
  }
  toggleWidget(range, modelPromise, peekMode) {
    let widgetPosition;
    if (this._widget) {
      widgetPosition = this._widget.position;
    }
    this.closeWidget();
    if (!!widgetPosition && range.containsPosition(widgetPosition)) {
      return;
    }
    this._peekMode = peekMode;
    this._referenceSearchVisible.set(true);
    this._disposables.add(
      this._editor.onDidChangeModelLanguage(() => {
        this.closeWidget();
      })
    );
    this._disposables.add(
      this._editor.onDidChangeModel(() => {
        if (!this._ignoreModelChangeEvent) {
          this.closeWidget();
        }
      })
    );
    const storageKey = "peekViewLayout";
    const data = LayoutData.fromJSON(
      this._storageService.get(storageKey, StorageScope.PROFILE, "{}")
    );
    this._widget = this._instantiationService.createInstance(
      ReferenceWidget,
      this._editor,
      this._defaultTreeKeyboardSupport,
      data
    );
    this._widget.setTitle(nls.localize("labelLoading", "Loading..."));
    this._widget.show(range);
    this._disposables.add(
      this._widget.onDidClose(() => {
        modelPromise.cancel();
        if (this._widget) {
          this._storageService.store(
            storageKey,
            JSON.stringify(this._widget.layoutData),
            StorageScope.PROFILE,
            StorageTarget.MACHINE
          );
          if (!this._widget.isClosing) {
            this.closeWidget();
          }
          this._widget = void 0;
        } else {
          this.closeWidget();
        }
      })
    );
    this._disposables.add(
      this._widget.onDidSelectReference((event) => {
        const { element, kind } = event;
        if (!element) {
          return;
        }
        switch (kind) {
          case "open":
            if (event.source !== "editor" || !this._configurationService.getValue(
              "editor.stablePeek"
            )) {
              this.openReference(element, false, false);
            }
            break;
          case "side":
            this.openReference(element, true, false);
            break;
          case "goto":
            if (peekMode) {
              this._gotoReference(element, true);
            } else {
              this.openReference(element, false, true);
            }
            break;
        }
      })
    );
    const requestId = ++this._requestIdPool;
    modelPromise.then(
      (model) => {
        if (requestId !== this._requestIdPool || !this._widget) {
          model.dispose();
          return void 0;
        }
        this._model?.dispose();
        this._model = model;
        return this._widget.setModel(this._model).then(() => {
          if (this._widget && this._model && this._editor.hasModel()) {
            if (this._model.isEmpty) {
              this._widget.setMetaTitle("");
            } else {
              this._widget.setMetaTitle(
                nls.localize(
                  "metaTitle.N",
                  "{0} ({1})",
                  this._model.title,
                  this._model.references.length
                )
              );
            }
            const uri = this._editor.getModel().uri;
            const pos = new Position(
              range.startLineNumber,
              range.startColumn
            );
            const selection = this._model.nearestReference(
              uri,
              pos
            );
            if (selection) {
              return this._widget.setSelection(selection).then(() => {
                if (this._widget && this._editor.getOption(
                  EditorOption.peekWidgetDefaultFocus
                ) === "editor") {
                  this._widget.focusOnPreviewEditor();
                }
              });
            }
          }
          return void 0;
        });
      },
      (error) => {
        this._notificationService.error(error);
      }
    );
  }
  changeFocusBetweenPreviewAndReferences() {
    if (!this._widget) {
      return;
    }
    if (this._widget.isPreviewEditorFocused()) {
      this._widget.focusOnReferenceTree();
    } else {
      this._widget.focusOnPreviewEditor();
    }
  }
  async goToNextOrPreviousReference(fwd) {
    if (!this._editor.hasModel() || !this._model || !this._widget) {
      return;
    }
    const currentPosition = this._widget.position;
    if (!currentPosition) {
      return;
    }
    const source = this._model.nearestReference(
      this._editor.getModel().uri,
      currentPosition
    );
    if (!source) {
      return;
    }
    const target = this._model.nextOrPreviousReference(source, fwd);
    const editorFocus = this._editor.hasTextFocus();
    const previewEditorFocus = this._widget.isPreviewEditorFocused();
    await this._widget.setSelection(target);
    await this._gotoReference(target, false);
    if (editorFocus) {
      this._editor.focus();
    } else if (this._widget && previewEditorFocus) {
      this._widget.focusOnPreviewEditor();
    }
  }
  async revealReference(reference) {
    if (!this._editor.hasModel() || !this._model || !this._widget) {
      return;
    }
    await this._widget.revealReference(reference);
  }
  closeWidget(focusEditor = true) {
    this._widget?.dispose();
    this._model?.dispose();
    this._referenceSearchVisible.reset();
    this._disposables.clear();
    this._widget = void 0;
    this._model = void 0;
    if (focusEditor) {
      this._editor.focus();
    }
    this._requestIdPool += 1;
  }
  _gotoReference(ref, pinned) {
    this._widget?.hide();
    this._ignoreModelChangeEvent = true;
    const range = Range.lift(ref.range).collapseToStart();
    return this._editorService.openCodeEditor(
      {
        resource: ref.uri,
        options: {
          selection: range,
          selectionSource: TextEditorSelectionSource.JUMP,
          pinned
        }
      },
      this._editor
    ).then(
      (openedEditor) => {
        this._ignoreModelChangeEvent = false;
        if (!openedEditor || !this._widget) {
          this.closeWidget();
          return;
        }
        if (this._editor === openedEditor) {
          this._widget.show(range);
          this._widget.focusOnReferenceTree();
        } else {
          const other = ReferencesController.get(openedEditor);
          const model = this._model.clone();
          this.closeWidget();
          openedEditor.focus();
          other?.toggleWidget(
            range,
            createCancelablePromise(
              (_) => Promise.resolve(model)
            ),
            this._peekMode ?? false
          );
        }
      },
      (err) => {
        this._ignoreModelChangeEvent = false;
        onUnexpectedError(err);
      }
    );
  }
  openReference(ref, sideBySide, pinned) {
    if (!sideBySide) {
      this.closeWidget();
    }
    const { uri, range } = ref;
    this._editorService.openCodeEditor(
      {
        resource: uri,
        options: {
          selection: range,
          selectionSource: TextEditorSelectionSource.JUMP,
          pinned
        }
      },
      this._editor,
      sideBySide
    );
  }
};
ReferencesController = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IConfigurationService)
], ReferencesController);
function withController(accessor, fn) {
  const outerEditor = getOuterEditor(accessor);
  if (!outerEditor) {
    return;
  }
  const controller = ReferencesController.get(outerEditor);
  if (controller) {
    fn(controller);
  }
}
__name(withController, "withController");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "togglePeekWidgetFocus",
  weight: KeybindingWeight.EditorContrib,
  primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.F2),
  when: ContextKeyExpr.or(
    ctxReferenceSearchVisible,
    PeekContext.inPeekEditor
  ),
  handler(accessor) {
    withController(accessor, (controller) => {
      controller.changeFocusBetweenPreviewAndReferences();
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "goToNextReference",
  weight: KeybindingWeight.EditorContrib - 10,
  primary: KeyCode.F4,
  secondary: [KeyCode.F12],
  when: ContextKeyExpr.or(
    ctxReferenceSearchVisible,
    PeekContext.inPeekEditor
  ),
  handler(accessor) {
    withController(accessor, (controller) => {
      controller.goToNextOrPreviousReference(true);
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "goToPreviousReference",
  weight: KeybindingWeight.EditorContrib - 10,
  primary: KeyMod.Shift | KeyCode.F4,
  secondary: [KeyMod.Shift | KeyCode.F12],
  when: ContextKeyExpr.or(
    ctxReferenceSearchVisible,
    PeekContext.inPeekEditor
  ),
  handler(accessor) {
    withController(accessor, (controller) => {
      controller.goToNextOrPreviousReference(false);
    });
  }
});
CommandsRegistry.registerCommandAlias(
  "goToNextReferenceFromEmbeddedEditor",
  "goToNextReference"
);
CommandsRegistry.registerCommandAlias(
  "goToPreviousReferenceFromEmbeddedEditor",
  "goToPreviousReference"
);
CommandsRegistry.registerCommandAlias(
  "closeReferenceSearchEditor",
  "closeReferenceSearch"
);
CommandsRegistry.registerCommand(
  "closeReferenceSearch",
  (accessor) => withController(accessor, (controller) => controller.closeWidget())
);
KeybindingsRegistry.registerKeybindingRule({
  id: "closeReferenceSearch",
  weight: KeybindingWeight.EditorContrib - 101,
  primary: KeyCode.Escape,
  secondary: [KeyMod.Shift | KeyCode.Escape],
  when: ContextKeyExpr.and(
    PeekContext.inPeekEditor,
    ContextKeyExpr.not("config.editor.stablePeek")
  )
});
KeybindingsRegistry.registerKeybindingRule({
  id: "closeReferenceSearch",
  weight: KeybindingWeight.WorkbenchContrib + 50,
  primary: KeyCode.Escape,
  secondary: [KeyMod.Shift | KeyCode.Escape],
  when: ContextKeyExpr.and(
    ctxReferenceSearchVisible,
    ContextKeyExpr.not("config.editor.stablePeek"),
    ContextKeyExpr.or(
      EditorContextKeys.editorTextFocus,
      InputFocusedContext.negate()
    )
  )
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "revealReference",
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyCode.Enter,
  mac: {
    primary: KeyCode.Enter,
    secondary: [KeyMod.CtrlCmd | KeyCode.DownArrow]
  },
  when: ContextKeyExpr.and(
    ctxReferenceSearchVisible,
    WorkbenchListFocusContextKey,
    WorkbenchTreeElementCanCollapse.negate(),
    WorkbenchTreeElementCanExpand.negate()
  ),
  handler(accessor) {
    const listService = accessor.get(IListService);
    const focus = listService.lastFocusedList?.getFocus();
    if (Array.isArray(focus) && focus[0] instanceof OneReference) {
      withController(
        accessor,
        (controller) => controller.revealReference(focus[0])
      );
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "openReferenceToSide",
  weight: KeybindingWeight.EditorContrib,
  primary: KeyMod.CtrlCmd | KeyCode.Enter,
  mac: {
    primary: KeyMod.WinCtrl | KeyCode.Enter
  },
  when: ContextKeyExpr.and(
    ctxReferenceSearchVisible,
    WorkbenchListFocusContextKey,
    WorkbenchTreeElementCanCollapse.negate(),
    WorkbenchTreeElementCanExpand.negate()
  ),
  handler(accessor) {
    const listService = accessor.get(IListService);
    const focus = listService.lastFocusedList?.getFocus();
    if (Array.isArray(focus) && focus[0] instanceof OneReference) {
      withController(
        accessor,
        (controller) => controller.openReference(focus[0], true, true)
      );
    }
  }
});
CommandsRegistry.registerCommand("openReference", (accessor) => {
  const listService = accessor.get(IListService);
  const focus = listService.lastFocusedList?.getFocus();
  if (Array.isArray(focus) && focus[0] instanceof OneReference) {
    withController(
      accessor,
      (controller) => controller.openReference(focus[0], false, true)
    );
  }
});
export {
  ReferencesController,
  ctxReferenceSearchVisible
};
//# sourceMappingURL=referencesController.js.map
