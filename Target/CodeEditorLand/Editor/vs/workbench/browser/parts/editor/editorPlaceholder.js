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
import "./media/editorplaceholder.css";
import { localize } from "../../../../nls.js";
import { truncate, truncateMiddle } from "../../../../base/common/strings.js";
import Severity from "../../../../base/common/severity.js";
import { IEditorOpenContext, isEditorOpenError } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { EditorPane } from "./editorPane.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { ScrollbarVisibility } from "../../../../base/common/scrollable.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { Dimension, size, clearNode, $, EventHelper } from "../../../../base/browser/dom.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { DisposableStore, IDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { assertAllDefined } from "../../../../base/common/types.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, toWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import { EditorOpenSource, IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { computeEditorAriaLabel, EditorPaneDescriptor } from "../../editor.js";
import { ButtonBar } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { SimpleIconLabel } from "../../../../base/browser/ui/iconLabel/simpleIconLabel.js";
import { FileChangeType, FileOperationError, FileOperationResult, IFileService } from "../../../../platform/files/common/files.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
let EditorPlaceholder = class extends EditorPane {
  static {
    __name(this, "EditorPlaceholder");
  }
  static PLACEHOLDER_LABEL_MAX_LENGTH = 1024;
  container;
  scrollbar;
  inputDisposable = this._register(new MutableDisposable());
  constructor(id, group, telemetryService, themeService, storageService) {
    super(id, group, telemetryService, themeService, storageService);
  }
  createEditor(parent) {
    this.container = document.createElement("div");
    this.container.className = "monaco-editor-pane-placeholder";
    this.container.style.outline = "none";
    this.container.tabIndex = 0;
    this.scrollbar = this._register(new DomScrollableElement(this.container, { horizontal: ScrollbarVisibility.Auto, vertical: ScrollbarVisibility.Auto }));
    parent.appendChild(this.scrollbar.getDomNode());
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (token.isCancellationRequested) {
      return;
    }
    this.inputDisposable.value = await this.renderInput(input, options);
  }
  async renderInput(input, options) {
    const [container, scrollbar] = assertAllDefined(this.container, this.scrollbar);
    clearNode(container);
    const disposables = new DisposableStore();
    const { icon, label, actions } = await this.getContents(input, options, disposables);
    const truncatedLabel = truncate(label, EditorPlaceholder.PLACEHOLDER_LABEL_MAX_LENGTH);
    const iconContainer = container.appendChild($(".editor-placeholder-icon-container"));
    const iconWidget = disposables.add(new SimpleIconLabel(iconContainer));
    iconWidget.text = icon;
    const labelContainer = container.appendChild($(".editor-placeholder-label-container"));
    const labelWidget = document.createElement("span");
    labelWidget.textContent = truncatedLabel;
    labelContainer.appendChild(labelWidget);
    container.setAttribute("aria-label", `${computeEditorAriaLabel(input, void 0, this.group, void 0)}, ${truncatedLabel}`);
    if (actions.length) {
      const actionsContainer = container.appendChild($(".editor-placeholder-buttons-container"));
      const buttons = disposables.add(new ButtonBar(actionsContainer));
      for (let i = 0; i < actions.length; i++) {
        const button = disposables.add(buttons.addButton({
          ...defaultButtonStyles,
          secondary: i !== 0
        }));
        button.label = actions[i].label;
        disposables.add(button.onDidClick((e) => {
          if (e) {
            EventHelper.stop(e, true);
          }
          actions[i].run();
        }));
      }
    }
    scrollbar.scanDomNode();
    return disposables;
  }
  clearInput() {
    if (this.container) {
      clearNode(this.container);
    }
    this.inputDisposable.clear();
    super.clearInput();
  }
  layout(dimension) {
    const [container, scrollbar] = assertAllDefined(this.container, this.scrollbar);
    size(container, dimension.width, dimension.height);
    scrollbar.scanDomNode();
    container.classList.toggle("max-height-200px", dimension.height <= 200);
  }
  focus() {
    super.focus();
    this.container?.focus();
  }
  dispose() {
    this.container?.remove();
    super.dispose();
  }
};
EditorPlaceholder = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService)
], EditorPlaceholder);
let WorkspaceTrustRequiredPlaceholderEditor = class extends EditorPlaceholder {
  constructor(group, telemetryService, themeService, commandService, workspaceService, storageService) {
    super(WorkspaceTrustRequiredPlaceholderEditor.ID, group, telemetryService, themeService, storageService);
    this.commandService = commandService;
    this.workspaceService = workspaceService;
  }
  static {
    __name(this, "WorkspaceTrustRequiredPlaceholderEditor");
  }
  static ID = "workbench.editors.workspaceTrustRequiredEditor";
  static LABEL = localize("trustRequiredEditor", "Workspace Trust Required");
  static DESCRIPTOR = EditorPaneDescriptor.create(WorkspaceTrustRequiredPlaceholderEditor, this.ID, this.LABEL);
  getTitle() {
    return WorkspaceTrustRequiredPlaceholderEditor.LABEL;
  }
  async getContents() {
    return {
      icon: "$(workspace-untrusted)",
      label: isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceService.getWorkspace())) ? localize("requiresFolderTrustText", "The file is not displayed in the editor because trust has not been granted to the folder.") : localize("requiresWorkspaceTrustText", "The file is not displayed in the editor because trust has not been granted to the workspace."),
      actions: [
        {
          label: localize("manageTrust", "Manage Workspace Trust"),
          run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("workbench.trust.manage"), "run")
        }
      ]
    };
  }
};
WorkspaceTrustRequiredPlaceholderEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IStorageService)
], WorkspaceTrustRequiredPlaceholderEditor);
let ErrorPlaceholderEditor = class extends EditorPlaceholder {
  constructor(group, telemetryService, themeService, storageService, fileService, dialogService) {
    super(ErrorPlaceholderEditor.ID, group, telemetryService, themeService, storageService);
    this.fileService = fileService;
    this.dialogService = dialogService;
  }
  static {
    __name(this, "ErrorPlaceholderEditor");
  }
  static ID = "workbench.editors.errorEditor";
  static LABEL = localize("errorEditor", "Error Editor");
  static DESCRIPTOR = EditorPaneDescriptor.create(ErrorPlaceholderEditor, this.ID, this.LABEL);
  async getContents(input, options, disposables) {
    const resource = input.resource;
    const error = options.error;
    const isFileNotFound = error?.fileOperationResult === FileOperationResult.FILE_NOT_FOUND;
    let label;
    if (isFileNotFound) {
      label = localize("unavailableResourceErrorEditorText", "The editor could not be opened because the file was not found.");
    } else if (isEditorOpenError(error) && error.forceMessage) {
      label = error.message;
    } else if (error) {
      label = localize("unknownErrorEditorTextWithError", "The editor could not be opened due to an unexpected error: {0}", truncateMiddle(toErrorMessage(error), EditorPlaceholder.PLACEHOLDER_LABEL_MAX_LENGTH / 2));
    } else {
      label = localize("unknownErrorEditorTextWithoutError", "The editor could not be opened due to an unexpected error.");
    }
    let icon = "$(error)";
    if (isEditorOpenError(error)) {
      if (error.forceSeverity === Severity.Info) {
        icon = "$(info)";
      } else if (error.forceSeverity === Severity.Warning) {
        icon = "$(warning)";
      }
    }
    let actions = void 0;
    if (isEditorOpenError(error) && error.actions.length > 0) {
      actions = error.actions.map((action) => {
        return {
          label: action.label,
          run: /* @__PURE__ */ __name(() => {
            const result = action.run();
            if (result instanceof Promise) {
              result.catch((error2) => this.dialogService.error(toErrorMessage(error2)));
            }
          }, "run")
        };
      });
    } else {
      actions = [
        {
          label: localize("retry", "Try Again"),
          run: /* @__PURE__ */ __name(() => this.group.openEditor(input, {
            ...options,
            source: EditorOpenSource.USER
            /* explicit user gesture */
          }), "run")
        }
      ];
    }
    if (isFileNotFound && resource && this.fileService.hasProvider(resource)) {
      disposables.add(this.fileService.onDidFilesChange((e) => {
        if (e.contains(resource, FileChangeType.ADDED, FileChangeType.UPDATED)) {
          this.group.openEditor(input, options);
        }
      }));
    }
    return { icon, label, actions: actions ?? [] };
  }
};
ErrorPlaceholderEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IDialogService)
], ErrorPlaceholderEditor);
export {
  EditorPlaceholder,
  ErrorPlaceholderEditor,
  WorkspaceTrustRequiredPlaceholderEditor
};
//# sourceMappingURL=editorPlaceholder.js.map
