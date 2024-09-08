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
  Dimension,
  getActiveElement,
  getWindowById,
  hide,
  isAncestor,
  isEditableElement,
  show
} from "../../../../base/browser/dom.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import Severity from "../../../../base/common/severity.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import {
  IDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import {
  EditorOpenSource
} from "../../../../platform/editor/common/editor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IEditorProgressService,
  LongRunningOperation
} from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import {
  EditorExtensions,
  EditorInputCapabilities,
  isEditorOpenError
} from "../../../common/editor.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import {
  DEFAULT_EDITOR_MAX_DIMENSIONS,
  DEFAULT_EDITOR_MIN_DIMENSIONS
} from "./editor.js";
import {
  ErrorPlaceholderEditor,
  WorkspaceTrustRequiredPlaceholderEditor
} from "./editorPlaceholder.js";
let EditorPanes = class extends Disposable {
  constructor(editorGroupParent, editorPanesParent, groupView, layoutService, instantiationService, editorProgressService, workspaceTrustService, logService, dialogService, hostService) {
    super();
    this.editorGroupParent = editorGroupParent;
    this.editorPanesParent = editorPanesParent;
    this.groupView = groupView;
    this.layoutService = layoutService;
    this.instantiationService = instantiationService;
    this.editorProgressService = editorProgressService;
    this.workspaceTrustService = workspaceTrustService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.registerListeners();
  }
  //#region Events
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidChangeSizeConstraints = this._register(
    new Emitter()
  );
  onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
  //#endregion
  get minimumWidth() {
    return this._activeEditorPane?.minimumWidth ?? DEFAULT_EDITOR_MIN_DIMENSIONS.width;
  }
  get minimumHeight() {
    return this._activeEditorPane?.minimumHeight ?? DEFAULT_EDITOR_MIN_DIMENSIONS.height;
  }
  get maximumWidth() {
    return this._activeEditorPane?.maximumWidth ?? DEFAULT_EDITOR_MAX_DIMENSIONS.width;
  }
  get maximumHeight() {
    return this._activeEditorPane?.maximumHeight ?? DEFAULT_EDITOR_MAX_DIMENSIONS.height;
  }
  _activeEditorPane = null;
  get activeEditorPane() {
    return this._activeEditorPane;
  }
  editorPanes = [];
  mapEditorPaneToPendingSetInput = /* @__PURE__ */ new Map();
  activeEditorPaneDisposables = this._register(
    new DisposableStore()
  );
  pagePosition;
  boundarySashes;
  editorOperation = this._register(
    new LongRunningOperation(this.editorProgressService)
  );
  editorPanesRegistry = Registry.as(
    EditorExtensions.EditorPane
  );
  registerListeners() {
    this._register(
      this.workspaceTrustService.onDidChangeTrust(
        () => this.onDidChangeWorkspaceTrust()
      )
    );
  }
  onDidChangeWorkspaceTrust() {
    const editor = this._activeEditorPane?.input;
    const options = this._activeEditorPane?.options;
    if (editor?.hasCapability(EditorInputCapabilities.RequiresTrust)) {
      this.groupView.openEditor(editor, options);
    }
  }
  async openEditor(editor, options, internalOptions, context = /* @__PURE__ */ Object.create(null)) {
    try {
      return await this.doOpenEditor(
        this.getEditorPaneDescriptor(editor),
        editor,
        options,
        internalOptions,
        context
      );
    } catch (error) {
      if (options?.ignoreError) {
        return { error };
      }
      return this.doShowError(
        error,
        editor,
        options,
        internalOptions,
        context
      );
    }
  }
  async doShowError(error, editor, options, internalOptions, context) {
    this.logService.error(error);
    let errorHandled = false;
    if (options?.source === EditorOpenSource.USER && (!isEditorOpenError(error) || error.allowDialog)) {
      errorHandled = await this.doShowErrorDialog(error, editor);
    }
    if (errorHandled) {
      return { error };
    }
    const editorPlaceholderOptions = {
      ...options
    };
    if (!isCancellationError(error)) {
      editorPlaceholderOptions.error = error;
    }
    return {
      ...await this.doOpenEditor(
        ErrorPlaceholderEditor.DESCRIPTOR,
        editor,
        editorPlaceholderOptions,
        internalOptions,
        context
      ),
      error
    };
  }
  async doShowErrorDialog(error, editor) {
    let severity = Severity.Error;
    let message;
    let detail = toErrorMessage(error);
    let errorActions;
    if (isEditorOpenError(error)) {
      errorActions = error.actions;
      severity = error.forceSeverity ?? Severity.Error;
      if (error.forceMessage) {
        message = error.message;
        detail = void 0;
      }
    }
    if (!message) {
      message = localize(
        "editorOpenErrorDialog",
        "Unable to open '{0}'",
        editor.getName()
      );
    }
    const buttons = [];
    if (errorActions && errorActions.length > 0) {
      for (const errorAction of errorActions) {
        buttons.push({
          label: errorAction.label,
          run: () => errorAction
        });
      }
    } else {
      buttons.push({
        label: localize(
          { key: "ok", comment: ["&& denotes a mnemonic"] },
          "&&OK"
        ),
        run: () => void 0
      });
    }
    let cancelButton;
    if (buttons.length === 1) {
      cancelButton = {
        run: () => {
          errorHandled = true;
          return void 0;
        }
      };
    }
    let errorHandled = false;
    const { result } = await this.dialogService.prompt({
      type: severity,
      message,
      detail,
      buttons,
      cancelButton
    });
    if (result) {
      const errorActionResult = result.run();
      if (errorActionResult instanceof Promise) {
        errorActionResult.catch(
          (error2) => this.dialogService.error(toErrorMessage(error2))
        );
      }
      errorHandled = true;
    }
    return errorHandled;
  }
  async doOpenEditor(descriptor, editor, options, internalOptions, context = /* @__PURE__ */ Object.create(null)) {
    const pane = this.doShowEditorPane(descriptor);
    const activeElement = getActiveElement();
    const { changed, cancelled } = await this.doSetInput(
      pane,
      editor,
      options,
      context
    );
    if (!cancelled) {
      const focus = !options || !options.preserveFocus;
      if (focus && this.shouldRestoreFocus(activeElement)) {
        pane.focus();
      } else if (!internalOptions?.preserveWindowOrder) {
        this.hostService.moveTop(
          getWindowById(this.groupView.windowId, true).window
        );
      }
    }
    return { pane, changed, cancelled };
  }
  shouldRestoreFocus(expectedActiveElement) {
    if (!this.layoutService.isRestored()) {
      return true;
    }
    if (!expectedActiveElement) {
      return true;
    }
    const activeElement = getActiveElement();
    if (!activeElement || activeElement === expectedActiveElement.ownerDocument.body) {
      return true;
    }
    const same = expectedActiveElement === activeElement;
    if (same) {
      return true;
    }
    if (!isEditableElement(activeElement)) {
      return true;
    }
    if (isAncestor(activeElement, this.editorGroupParent)) {
      return true;
    }
    return false;
  }
  getEditorPaneDescriptor(editor) {
    if (editor.hasCapability(EditorInputCapabilities.RequiresTrust) && !this.workspaceTrustService.isWorkspaceTrusted()) {
      return WorkspaceTrustRequiredPlaceholderEditor.DESCRIPTOR;
    }
    return assertIsDefined(this.editorPanesRegistry.getEditorPane(editor));
  }
  doShowEditorPane(descriptor) {
    if (this._activeEditorPane && descriptor.describes(this._activeEditorPane)) {
      return this._activeEditorPane;
    }
    this.doHideActiveEditorPane();
    const editorPane = this.doCreateEditorPane(descriptor);
    this.doSetActiveEditorPane(editorPane);
    const container = assertIsDefined(editorPane.getContainer());
    this.editorPanesParent.appendChild(container);
    show(container);
    editorPane.setVisible(true);
    if (this.pagePosition) {
      editorPane.layout(
        new Dimension(
          this.pagePosition.width,
          this.pagePosition.height
        ),
        { top: this.pagePosition.top, left: this.pagePosition.left }
      );
    }
    if (this.boundarySashes) {
      editorPane.setBoundarySashes(this.boundarySashes);
    }
    return editorPane;
  }
  doCreateEditorPane(descriptor) {
    const editorPane = this.doInstantiateEditorPane(descriptor);
    if (!editorPane.getContainer()) {
      const editorPaneContainer = document.createElement("div");
      editorPaneContainer.classList.add("editor-instance");
      this.editorPanesParent.appendChild(editorPaneContainer);
      editorPane.create(editorPaneContainer);
    }
    return editorPane;
  }
  doInstantiateEditorPane(descriptor) {
    const existingEditorPane = this.editorPanes.find(
      (editorPane2) => descriptor.describes(editorPane2)
    );
    if (existingEditorPane) {
      return existingEditorPane;
    }
    const editorPane = this._register(
      descriptor.instantiate(this.instantiationService, this.groupView)
    );
    this.editorPanes.push(editorPane);
    return editorPane;
  }
  doSetActiveEditorPane(editorPane) {
    this._activeEditorPane = editorPane;
    this.activeEditorPaneDisposables.clear();
    if (editorPane) {
      this.activeEditorPaneDisposables.add(
        editorPane.onDidChangeSizeConstraints(
          (e) => this._onDidChangeSizeConstraints.fire(e)
        )
      );
      this.activeEditorPaneDisposables.add(
        editorPane.onDidFocus(() => this._onDidFocus.fire())
      );
    }
    this._onDidChangeSizeConstraints.fire(void 0);
  }
  async doSetInput(editorPane, editor, options, context) {
    let inputMatches = editorPane.input?.matches(editor);
    if (inputMatches && !options?.forceReload) {
      if (this.mapEditorPaneToPendingSetInput.has(editorPane)) {
        await this.mapEditorPaneToPendingSetInput.get(editorPane);
      }
      inputMatches = editorPane.input?.matches(editor);
      if (inputMatches) {
        editorPane.setOptions(options);
      }
      return { changed: false, cancelled: !inputMatches };
    }
    const operation = this.editorOperation.start(
      this.layoutService.isRestored() ? 800 : 3200
    );
    let cancelled = false;
    try {
      editorPane.clearInput();
      const pendingSetInput = editorPane.setInput(
        editor,
        options,
        context,
        operation.token
      );
      this.mapEditorPaneToPendingSetInput.set(
        editorPane,
        pendingSetInput
      );
      await pendingSetInput;
      if (!operation.isCurrent()) {
        cancelled = true;
      }
    } catch (error) {
      if (operation.isCurrent()) {
        throw error;
      } else {
        cancelled = true;
      }
    } finally {
      if (operation.isCurrent()) {
        this.mapEditorPaneToPendingSetInput.delete(editorPane);
      }
      operation.stop();
    }
    return { changed: !inputMatches, cancelled };
  }
  doHideActiveEditorPane() {
    if (!this._activeEditorPane) {
      return;
    }
    this.editorOperation.stop();
    this.safeRun(() => this._activeEditorPane?.clearInput());
    this.safeRun(() => this._activeEditorPane?.setVisible(false));
    this.mapEditorPaneToPendingSetInput.delete(this._activeEditorPane);
    const editorPaneContainer = this._activeEditorPane.getContainer();
    if (editorPaneContainer) {
      editorPaneContainer.remove();
      hide(editorPaneContainer);
    }
    this.doSetActiveEditorPane(null);
  }
  closeEditor(editor) {
    if (this._activeEditorPane?.input && editor.matches(this._activeEditorPane.input)) {
      this.doHideActiveEditorPane();
    }
  }
  setVisible(visible) {
    this.safeRun(() => this._activeEditorPane?.setVisible(visible));
  }
  layout(pagePosition) {
    this.pagePosition = pagePosition;
    this.safeRun(
      () => this._activeEditorPane?.layout(
        new Dimension(pagePosition.width, pagePosition.height),
        pagePosition
      )
    );
  }
  setBoundarySashes(sashes) {
    this.boundarySashes = sashes;
    this.safeRun(() => this._activeEditorPane?.setBoundarySashes(sashes));
  }
  safeRun(fn) {
    try {
      fn();
    } catch (error) {
      this.logService.error(error);
    }
  }
};
EditorPanes = __decorateClass([
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IEditorProgressService),
  __decorateParam(6, IWorkspaceTrustManagementService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IHostService)
], EditorPanes);
export {
  EditorPanes
};
