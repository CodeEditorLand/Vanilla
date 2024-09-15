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
  $,
  EventHelper,
  EventType,
  addDisposableListener,
  addStandardDisposableListener,
  append,
  clearNode,
  isAncestorOfActiveElement
} from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { ButtonBar } from "../../../../base/browser/ui/button/button.js";
import {
  InputBox,
  MessageType
} from "../../../../base/browser/ui/inputbox/inputBox.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { debounce } from "../../../../base/common/decorators.js";
import { Emitter } from "../../../../base/common/event.js";
import { hasDriveLetter, toSlashes } from "../../../../base/common/extpath.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { normalizeDriveLetter } from "../../../../base/common/labels.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import { Schemas } from "../../../../base/common/network.js";
import { posix, win32 } from "../../../../base/common/path.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { basename, dirname } from "../../../../base/common/resources.js";
import { ScrollbarVisibility } from "../../../../base/common/scrollable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import {
  ConfigurationScope,
  Extensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { getExtensionDependencies } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchTable } from "../../../../platform/list/browser/listService.js";
import { Link } from "../../../../platform/opener/browser/link.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  defaultButtonStyles,
  defaultInputBoxStyles
} from "../../../../platform/theme/browser/defaultStyles.js";
import {
  asCssVariable,
  buttonBackground,
  buttonSecondaryBackground,
  editorErrorForeground
} from "../../../../platform/theme/common/colorRegistry.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  isVirtualResource,
  isVirtualWorkspace
} from "../../../../platform/workspace/common/virtualWorkspace.js";
import {
  IWorkspaceContextService,
  WorkbenchState,
  toWorkspaceIdentifier
} from "../../../../platform/workspace/common/workspace.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { IWorkbenchConfigurationService } from "../../../services/configuration/common/configuration.js";
import {
  EnablementState,
  IWorkbenchExtensionEnablementService
} from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionManifestPropertiesService } from "../../../services/extensions/common/extensionManifestPropertiesService.js";
import { debugIconStartForeground } from "../../debug/browser/debugColors.js";
import {
  IExtensionsWorkbenchService,
  LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID
} from "../../extensions/common/extensions.js";
const shieldIcon = registerIcon(
  "workspace-trust-banner",
  Codicon.shield,
  localize("shieldIcon", "Icon for workspace trust ion the banner.")
);
const checkListIcon = registerIcon(
  "workspace-trust-editor-check",
  Codicon.check,
  localize(
    "checkListIcon",
    "Icon for the checkmark in the workspace trust editor."
  )
);
const xListIcon = registerIcon(
  "workspace-trust-editor-cross",
  Codicon.x,
  localize("xListIcon", "Icon for the cross in the workspace trust editor.")
);
const folderPickerIcon = registerIcon(
  "workspace-trust-editor-folder-picker",
  Codicon.folder,
  localize(
    "folderPickerIcon",
    "Icon for the pick folder icon in the workspace trust editor."
  )
);
const editIcon = registerIcon(
  "workspace-trust-editor-edit-folder",
  Codicon.edit,
  localize(
    "editIcon",
    "Icon for the edit folder icon in the workspace trust editor."
  )
);
const removeIcon = registerIcon(
  "workspace-trust-editor-remove-folder",
  Codicon.close,
  localize(
    "removeIcon",
    "Icon for the remove folder icon in the workspace trust editor."
  )
);
let WorkspaceTrustedUrisTable = class extends Disposable {
  constructor(container, instantiationService, workspaceService, workspaceTrustManagementService, uriService, labelService, fileDialogService) {
    super();
    this.container = container;
    this.instantiationService = instantiationService;
    this.workspaceService = workspaceService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.uriService = uriService;
    this.labelService = labelService;
    this.fileDialogService = fileDialogService;
    this.descriptionElement = container.appendChild(
      $(".workspace-trusted-folders-description")
    );
    const tableElement = container.appendChild($(".trusted-uris-table"));
    const addButtonBarElement = container.appendChild(
      $(".trusted-uris-button-bar")
    );
    this.table = this.instantiationService.createInstance(
      WorkbenchTable,
      "WorkspaceTrust",
      tableElement,
      new TrustedUriTableVirtualDelegate(),
      [
        {
          label: localize("hostColumnLabel", "Host"),
          tooltip: "",
          weight: 1,
          templateId: TrustedUriHostColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize("pathColumnLabel", "Path"),
          tooltip: "",
          weight: 8,
          templateId: TrustedUriPathColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: "",
          tooltip: "",
          weight: 1,
          minimumWidth: 75,
          maximumWidth: 75,
          templateId: TrustedUriActionsColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        }
      ],
      [
        this.instantiationService.createInstance(
          TrustedUriHostColumnRenderer
        ),
        this.instantiationService.createInstance(
          TrustedUriPathColumnRenderer,
          this
        ),
        this.instantiationService.createInstance(
          TrustedUriActionsColumnRenderer,
          this,
          this.currentWorkspaceUri
        )
      ],
      {
        horizontalScrolling: false,
        alwaysConsumeMouseWheel: false,
        openOnSingleClick: false,
        multipleSelectionSupport: false,
        accessibilityProvider: {
          getAriaLabel: /* @__PURE__ */ __name((item) => {
            const hostLabel = getHostLabel(this.labelService, item);
            if (hostLabel === void 0 || hostLabel.length === 0) {
              return localize(
                "trustedFolderAriaLabel",
                "{0}, trusted",
                this.labelService.getUriLabel(item.uri)
              );
            }
            return localize(
              "trustedFolderWithHostAriaLabel",
              "{0} on {1}, trusted",
              this.labelService.getUriLabel(item.uri),
              hostLabel
            );
          }, "getAriaLabel"),
          getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize(
            "trustedFoldersAndWorkspaces",
            "Trusted Folders & Workspaces"
          ), "getWidgetAriaLabel")
        },
        identityProvider: {
          getId(element) {
            return element.uri.toString();
          }
        }
      }
    );
    this._register(
      this.table.onDidOpen((item) => {
        if (item && item.element && !item.browserEvent?.defaultPrevented) {
          this.edit(item.element, true);
        }
      })
    );
    const buttonBar = this._register(new ButtonBar(addButtonBarElement));
    const addButton = this._register(
      buttonBar.addButton({
        title: localize("addButton", "Add Folder"),
        ...defaultButtonStyles
      })
    );
    addButton.label = localize("addButton", "Add Folder");
    this._register(
      addButton.onDidClick(async () => {
        const uri = await this.fileDialogService.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          defaultUri: this.currentWorkspaceUri,
          openLabel: localize("trustUri", "Trust Folder"),
          title: localize(
            "selectTrustedUri",
            "Select Folder To Trust"
          )
        });
        if (uri) {
          this.workspaceTrustManagementService.setUrisTrust(
            uri,
            true
          );
        }
      })
    );
    this._register(
      this.workspaceTrustManagementService.onDidChangeTrustedFolders(
        () => {
          this.updateTable();
        }
      )
    );
  }
  static {
    __name(this, "WorkspaceTrustedUrisTable");
  }
  _onDidAcceptEdit = this._register(new Emitter());
  onDidAcceptEdit = this._onDidAcceptEdit.event;
  _onDidRejectEdit = this._register(new Emitter());
  onDidRejectEdit = this._onDidRejectEdit.event;
  _onEdit = this._register(
    new Emitter()
  );
  onEdit = this._onEdit.event;
  _onDelete = this._register(
    new Emitter()
  );
  onDelete = this._onDelete.event;
  table;
  descriptionElement;
  getIndexOfTrustedUriEntry(item) {
    const index = this.trustedUriEntries.indexOf(item);
    if (index === -1) {
      for (let i = 0; i < this.trustedUriEntries.length; i++) {
        if (this.trustedUriEntries[i].uri === item.uri) {
          return i;
        }
      }
    }
    return index;
  }
  selectTrustedUriEntry(item, focus = true) {
    const index = this.getIndexOfTrustedUriEntry(item);
    if (index !== -1) {
      if (focus) {
        this.table.domFocus();
        this.table.setFocus([index]);
      }
      this.table.setSelection([index]);
    }
  }
  get currentWorkspaceUri() {
    return this.workspaceService.getWorkspace().folders[0]?.uri || URI.file("/");
  }
  get trustedUriEntries() {
    const currentWorkspace = this.workspaceService.getWorkspace();
    const currentWorkspaceUris = currentWorkspace.folders.map(
      (folder) => folder.uri
    );
    if (currentWorkspace.configuration) {
      currentWorkspaceUris.push(currentWorkspace.configuration);
    }
    const entries = this.workspaceTrustManagementService.getTrustedUris().map((uri) => {
      let relatedToCurrentWorkspace = false;
      for (const workspaceUri of currentWorkspaceUris) {
        relatedToCurrentWorkspace = relatedToCurrentWorkspace || this.uriService.extUri.isEqualOrParent(
          workspaceUri,
          uri
        );
      }
      return {
        uri,
        parentOfWorkspaceItem: relatedToCurrentWorkspace
      };
    });
    const sortedEntries = entries.sort((a, b) => {
      if (a.uri.scheme !== b.uri.scheme) {
        if (a.uri.scheme === Schemas.file) {
          return -1;
        }
        if (b.uri.scheme === Schemas.file) {
          return 1;
        }
      }
      const aIsWorkspace = a.uri.path.endsWith(".code-workspace");
      const bIsWorkspace = b.uri.path.endsWith(".code-workspace");
      if (aIsWorkspace !== bIsWorkspace) {
        if (aIsWorkspace) {
          return 1;
        }
        if (bIsWorkspace) {
          return -1;
        }
      }
      return a.uri.fsPath.localeCompare(b.uri.fsPath);
    });
    return sortedEntries;
  }
  layout() {
    this.table.layout(
      this.trustedUriEntries.length * TrustedUriTableVirtualDelegate.ROW_HEIGHT + TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT,
      void 0
    );
  }
  updateTable() {
    const entries = this.trustedUriEntries;
    this.container.classList.toggle("empty", entries.length === 0);
    this.descriptionElement.innerText = entries.length ? localize(
      "trustedFoldersDescription",
      "You trust the following folders, their subfolders, and workspace files."
    ) : localize(
      "noTrustedFoldersDescriptions",
      "You haven't trusted any folders or workspace files yet."
    );
    this.table.splice(0, Number.POSITIVE_INFINITY, this.trustedUriEntries);
    this.layout();
  }
  validateUri(path, item) {
    if (!item) {
      return null;
    }
    if (item.uri.scheme === "vscode-vfs") {
      const segments = path.split(posix.sep).filter((s) => s.length);
      if (segments.length === 0 && path.startsWith(posix.sep)) {
        return {
          type: MessageType.WARNING,
          content: localize(
            {
              key: "trustAll",
              comment: [
                "The {0} will be a host name where repositories are hosted."
              ]
            },
            "You will trust all repositories on {0}.",
            getHostLabel(this.labelService, item)
          )
        };
      }
      if (segments.length === 1) {
        return {
          type: MessageType.WARNING,
          content: localize(
            {
              key: "trustOrg",
              comment: [
                "The {0} will be an organization or user name.",
                "The {1} will be a host name where repositories are hosted."
              ]
            },
            "You will trust all repositories and forks under '{0}' on {1}.",
            segments[0],
            getHostLabel(this.labelService, item)
          )
        };
      }
      if (segments.length > 2) {
        return {
          type: MessageType.ERROR,
          content: localize(
            "invalidTrust",
            "You cannot trust individual folders within a repository.",
            path
          )
        };
      }
    }
    return null;
  }
  acceptEdit(item, uri) {
    const trustedFolders = this.workspaceTrustManagementService.getTrustedUris();
    const index = trustedFolders.findIndex(
      (u) => this.uriService.extUri.isEqual(u, item.uri)
    );
    if (index >= trustedFolders.length || index === -1) {
      trustedFolders.push(uri);
    } else {
      trustedFolders[index] = uri;
    }
    this.workspaceTrustManagementService.setTrustedUris(trustedFolders);
    this._onDidAcceptEdit.fire(item);
  }
  rejectEdit(item) {
    this._onDidRejectEdit.fire(item);
  }
  async delete(item) {
    this.table.focusNext();
    await this.workspaceTrustManagementService.setUrisTrust(
      [item.uri],
      false
    );
    if (this.table.getFocus().length === 0) {
      this.table.focusLast();
    }
    this._onDelete.fire(item);
    this.table.domFocus();
  }
  async edit(item, usePickerIfPossible) {
    const canUseOpenDialog = item.uri.scheme === Schemas.file || item.uri.scheme === this.currentWorkspaceUri.scheme && this.uriService.extUri.isEqualAuthority(
      this.currentWorkspaceUri.authority,
      item.uri.authority
    ) && !isVirtualResource(item.uri);
    if (canUseOpenDialog && usePickerIfPossible) {
      const uri = await this.fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: item.uri,
        openLabel: localize("trustUri", "Trust Folder"),
        title: localize("selectTrustedUri", "Select Folder To Trust")
      });
      if (uri) {
        this.acceptEdit(item, uri[0]);
      } else {
        this.rejectEdit(item);
      }
    } else {
      this.selectTrustedUriEntry(item);
      this._onEdit.fire(item);
    }
  }
};
WorkspaceTrustedUrisTable = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkspaceTrustManagementService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IFileDialogService)
], WorkspaceTrustedUrisTable);
class TrustedUriTableVirtualDelegate {
  static {
    __name(this, "TrustedUriTableVirtualDelegate");
  }
  static HEADER_ROW_HEIGHT = 30;
  static ROW_HEIGHT = 24;
  headerRowHeight = TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT;
  getHeight(item) {
    return TrustedUriTableVirtualDelegate.ROW_HEIGHT;
  }
}
let TrustedUriActionsColumnRenderer = class {
  constructor(table, currentWorkspaceUri, uriService) {
    this.table = table;
    this.currentWorkspaceUri = currentWorkspaceUri;
    this.uriService = uriService;
  }
  static {
    __name(this, "TrustedUriActionsColumnRenderer");
  }
  static TEMPLATE_ID = "actions";
  templateId = TrustedUriActionsColumnRenderer.TEMPLATE_ID;
  renderTemplate(container) {
    const element = container.appendChild($(".actions"));
    const actionBar = new ActionBar(element);
    return { actionBar };
  }
  renderElement(item, index, templateData, height) {
    templateData.actionBar.clear();
    const canUseOpenDialog = item.uri.scheme === Schemas.file || item.uri.scheme === this.currentWorkspaceUri.scheme && this.uriService.extUri.isEqualAuthority(
      this.currentWorkspaceUri.authority,
      item.uri.authority
    ) && !isVirtualResource(item.uri);
    const actions = [];
    if (canUseOpenDialog) {
      actions.push(this.createPickerAction(item));
    }
    actions.push(this.createEditAction(item));
    actions.push(this.createDeleteAction(item));
    templateData.actionBar.push(actions, { icon: true });
  }
  createEditAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(editIcon),
      enabled: true,
      id: "editTrustedUri",
      tooltip: localize("editTrustedUri", "Edit Path"),
      run: /* @__PURE__ */ __name(() => {
        this.table.edit(item, false);
      }, "run")
    };
  }
  createPickerAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(folderPickerIcon),
      enabled: true,
      id: "pickerTrustedUri",
      tooltip: localize("pickerTrustedUri", "Open File Picker"),
      run: /* @__PURE__ */ __name(() => {
        this.table.edit(item, true);
      }, "run")
    };
  }
  createDeleteAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(removeIcon),
      enabled: true,
      id: "deleteTrustedUri",
      tooltip: localize("deleteTrustedUri", "Delete Path"),
      run: /* @__PURE__ */ __name(async () => {
        await this.table.delete(item);
      }, "run")
    };
  }
  disposeTemplate(templateData) {
    templateData.actionBar.dispose();
  }
};
TrustedUriActionsColumnRenderer = __decorateClass([
  __decorateParam(2, IUriIdentityService)
], TrustedUriActionsColumnRenderer);
let TrustedUriPathColumnRenderer = class {
  constructor(table, contextViewService) {
    this.table = table;
    this.contextViewService = contextViewService;
  }
  static {
    __name(this, "TrustedUriPathColumnRenderer");
  }
  static TEMPLATE_ID = "path";
  templateId = TrustedUriPathColumnRenderer.TEMPLATE_ID;
  currentItem;
  renderTemplate(container) {
    const element = container.appendChild($(".path"));
    const pathLabel = element.appendChild($("div.path-label"));
    const pathInput = new InputBox(element, this.contextViewService, {
      validationOptions: {
        validation: /* @__PURE__ */ __name((value) => this.table.validateUri(value, this.currentItem), "validation")
      },
      inputBoxStyles: defaultInputBoxStyles
    });
    const disposables = new DisposableStore();
    const renderDisposables = disposables.add(new DisposableStore());
    return {
      element,
      pathLabel,
      pathInput,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index, templateData, height) {
    templateData.renderDisposables.clear();
    this.currentItem = item;
    templateData.renderDisposables.add(
      this.table.onEdit(async (e) => {
        if (item === e) {
          templateData.element.classList.add("input-mode");
          templateData.pathInput.focus();
          templateData.pathInput.select();
          templateData.element.parentElement.style.paddingLeft = "0px";
        }
      })
    );
    templateData.renderDisposables.add(
      addDisposableListener(
        templateData.pathInput.element,
        EventType.DBLCLICK,
        (e) => {
          EventHelper.stop(e);
        }
      )
    );
    const hideInputBox = /* @__PURE__ */ __name(() => {
      templateData.element.classList.remove("input-mode");
      templateData.element.parentElement.style.paddingLeft = "5px";
    }, "hideInputBox");
    const accept = /* @__PURE__ */ __name(() => {
      hideInputBox();
      const pathToUse = templateData.pathInput.value;
      const uri = hasDriveLetter(pathToUse) ? item.uri.with({ path: posix.sep + toSlashes(pathToUse) }) : item.uri.with({ path: pathToUse });
      templateData.pathLabel.innerText = this.formatPath(uri);
      if (uri) {
        this.table.acceptEdit(item, uri);
      }
    }, "accept");
    const reject = /* @__PURE__ */ __name(() => {
      hideInputBox();
      templateData.pathInput.value = stringValue;
      this.table.rejectEdit(item);
    }, "reject");
    templateData.renderDisposables.add(
      addStandardDisposableListener(
        templateData.pathInput.inputElement,
        EventType.KEY_DOWN,
        (e) => {
          let handled = false;
          if (e.equals(KeyCode.Enter)) {
            accept();
            handled = true;
          } else if (e.equals(KeyCode.Escape)) {
            reject();
            handled = true;
          }
          if (handled) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      )
    );
    templateData.renderDisposables.add(
      addDisposableListener(
        templateData.pathInput.inputElement,
        EventType.BLUR,
        () => {
          reject();
        }
      )
    );
    const stringValue = this.formatPath(item.uri);
    templateData.pathInput.value = stringValue;
    templateData.pathLabel.innerText = stringValue;
    templateData.element.classList.toggle(
      "current-workspace-parent",
      item.parentOfWorkspaceItem
    );
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.renderDisposables.dispose();
  }
  formatPath(uri) {
    if (uri.scheme === Schemas.file) {
      return normalizeDriveLetter(uri.fsPath);
    }
    if (uri.path.startsWith(posix.sep)) {
      const pathWithoutLeadingSeparator = uri.path.substring(1);
      const isWindowsPath = hasDriveLetter(
        pathWithoutLeadingSeparator,
        true
      );
      if (isWindowsPath) {
        return normalizeDriveLetter(
          win32.normalize(pathWithoutLeadingSeparator),
          true
        );
      }
    }
    return uri.path;
  }
};
TrustedUriPathColumnRenderer = __decorateClass([
  __decorateParam(1, IContextViewService)
], TrustedUriPathColumnRenderer);
function getHostLabel(labelService, item) {
  return item.uri.authority ? labelService.getHostLabel(item.uri.scheme, item.uri.authority) : localize("localAuthority", "Local");
}
__name(getHostLabel, "getHostLabel");
let TrustedUriHostColumnRenderer = class {
  constructor(labelService) {
    this.labelService = labelService;
  }
  static {
    __name(this, "TrustedUriHostColumnRenderer");
  }
  static TEMPLATE_ID = "host";
  templateId = TrustedUriHostColumnRenderer.TEMPLATE_ID;
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const renderDisposables = disposables.add(new DisposableStore());
    const element = container.appendChild($(".host"));
    const hostContainer = element.appendChild($("div.host-label"));
    const buttonBarContainer = element.appendChild($("div.button-bar"));
    return {
      element,
      hostContainer,
      buttonBarContainer,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index, templateData, height) {
    templateData.renderDisposables.clear();
    templateData.renderDisposables.add({
      dispose: /* @__PURE__ */ __name(() => {
        clearNode(templateData.buttonBarContainer);
      }, "dispose")
    });
    templateData.hostContainer.innerText = getHostLabel(
      this.labelService,
      item
    );
    templateData.element.classList.toggle(
      "current-workspace-parent",
      item.parentOfWorkspaceItem
    );
    templateData.hostContainer.style.display = "";
    templateData.buttonBarContainer.style.display = "none";
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
TrustedUriHostColumnRenderer = __decorateClass([
  __decorateParam(0, ILabelService)
], TrustedUriHostColumnRenderer);
let WorkspaceTrustEditor = class extends EditorPane {
  constructor(group, telemetryService, themeService, storageService, workspaceService, extensionWorkbenchService, extensionManifestPropertiesService, instantiationService, workspaceTrustManagementService, configurationService, extensionEnablementService, productService, keybindingService) {
    super(
      WorkspaceTrustEditor.ID,
      group,
      telemetryService,
      themeService,
      storageService
    );
    this.workspaceService = workspaceService;
    this.extensionWorkbenchService = extensionWorkbenchService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.instantiationService = instantiationService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.configurationService = configurationService;
    this.extensionEnablementService = extensionEnablementService;
    this.productService = productService;
    this.keybindingService = keybindingService;
  }
  static {
    __name(this, "WorkspaceTrustEditor");
  }
  static ID = "workbench.editor.workspaceTrust";
  rootElement;
  // Header Section
  headerContainer;
  headerTitleContainer;
  headerTitleIcon;
  headerTitleText;
  headerDescription;
  bodyScrollBar;
  // Affected Features Section
  affectedFeaturesContainer;
  trustedContainer;
  untrustedContainer;
  // Settings Section
  configurationContainer;
  workspaceTrustedUrisTable;
  createEditor(parent) {
    this.rootElement = append(
      parent,
      $(".workspace-trust-editor", { tabindex: "0" })
    );
    this.createHeaderElement(this.rootElement);
    const scrollableContent = $(".workspace-trust-editor-body");
    this.bodyScrollBar = this._register(
      new DomScrollableElement(scrollableContent, {
        horizontal: ScrollbarVisibility.Hidden,
        vertical: ScrollbarVisibility.Auto
      })
    );
    append(this.rootElement, this.bodyScrollBar.getDomNode());
    this.createAffectedFeaturesElement(scrollableContent);
    this.createConfigurationElement(scrollableContent);
    this.rootElement.style.setProperty(
      "--workspace-trust-selected-color",
      asCssVariable(buttonBackground)
    );
    this.rootElement.style.setProperty(
      "--workspace-trust-unselected-color",
      asCssVariable(buttonSecondaryBackground)
    );
    this.rootElement.style.setProperty(
      "--workspace-trust-check-color",
      asCssVariable(debugIconStartForeground)
    );
    this.rootElement.style.setProperty(
      "--workspace-trust-x-color",
      asCssVariable(editorErrorForeground)
    );
    this._register(
      addDisposableListener(this.rootElement, EventType.KEY_DOWN, (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(KeyCode.UpArrow) || event.equals(KeyCode.DownArrow)) {
          const navOrder = [
            this.headerContainer,
            this.trustedContainer,
            this.untrustedContainer,
            this.configurationContainer
          ];
          const currentIndex = navOrder.findIndex((element) => {
            return isAncestorOfActiveElement(element);
          });
          let newIndex = currentIndex;
          if (event.equals(KeyCode.DownArrow)) {
            newIndex++;
          } else if (event.equals(KeyCode.UpArrow)) {
            newIndex = Math.max(0, newIndex);
            newIndex--;
          }
          newIndex += navOrder.length;
          newIndex %= navOrder.length;
          navOrder[newIndex].focus();
        } else if (event.equals(KeyCode.Escape)) {
          this.rootElement.focus();
        } else if (event.equals(KeyMod.CtrlCmd | KeyCode.Enter)) {
          if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
            this.workspaceTrustManagementService.setWorkspaceTrust(
              !this.workspaceTrustManagementService.isWorkspaceTrusted()
            );
          }
        } else if (event.equals(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter)) {
          if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
            this.workspaceTrustManagementService.setParentFolderTrust(
              true
            );
          }
        }
      })
    );
  }
  focus() {
    super.focus();
    this.rootElement.focus();
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (token.isCancellationRequested) {
      return;
    }
    await this.workspaceTrustManagementService.workspaceTrustInitialized;
    this.registerListeners();
    await this.render();
  }
  registerListeners() {
    this._register(
      this.extensionWorkbenchService.onChange(() => this.render())
    );
    this._register(
      this.configurationService.onDidChangeRestrictedSettings(
        () => this.render()
      )
    );
    this._register(
      this.workspaceTrustManagementService.onDidChangeTrust(
        () => this.render()
      )
    );
    this._register(
      this.workspaceTrustManagementService.onDidChangeTrustedFolders(
        () => this.render()
      )
    );
  }
  getHeaderContainerClass(trusted) {
    if (trusted) {
      return "workspace-trust-header workspace-trust-trusted";
    }
    return "workspace-trust-header workspace-trust-untrusted";
  }
  getHeaderTitleText(trusted) {
    if (trusted) {
      if (this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
        return localize(
          "trustedUnsettableWindow",
          "This window is trusted"
        );
      }
      switch (this.workspaceService.getWorkbenchState()) {
        case WorkbenchState.EMPTY:
          return localize(
            "trustedHeaderWindow",
            "You trust this window"
          );
        case WorkbenchState.FOLDER:
          return localize(
            "trustedHeaderFolder",
            "You trust this folder"
          );
        case WorkbenchState.WORKSPACE:
          return localize(
            "trustedHeaderWorkspace",
            "You trust this workspace"
          );
      }
    }
    return localize("untrustedHeader", "You are in Restricted Mode");
  }
  getHeaderTitleIconClassNames(trusted) {
    return ThemeIcon.asClassNameArray(shieldIcon);
  }
  getFeaturesHeaderText(trusted) {
    let title = "";
    let subTitle = "";
    switch (this.workspaceService.getWorkbenchState()) {
      case WorkbenchState.EMPTY: {
        title = trusted ? localize("trustedWindow", "In a Trusted Window") : localize("untrustedWorkspace", "In Restricted Mode");
        subTitle = trusted ? localize(
          "trustedWindowSubtitle",
          "You trust the authors of the files in the current window. All features are enabled:"
        ) : localize(
          "untrustedWindowSubtitle",
          "You do not trust the authors of the files in the current window. The following features are disabled:"
        );
        break;
      }
      case WorkbenchState.FOLDER: {
        title = trusted ? localize("trustedFolder", "In a Trusted Folder") : localize("untrustedWorkspace", "In Restricted Mode");
        subTitle = trusted ? localize(
          "trustedFolderSubtitle",
          "You trust the authors of the files in the current folder. All features are enabled:"
        ) : localize(
          "untrustedFolderSubtitle",
          "You do not trust the authors of the files in the current folder. The following features are disabled:"
        );
        break;
      }
      case WorkbenchState.WORKSPACE: {
        title = trusted ? localize("trustedWorkspace", "In a Trusted Workspace") : localize("untrustedWorkspace", "In Restricted Mode");
        subTitle = trusted ? localize(
          "trustedWorkspaceSubtitle",
          "You trust the authors of the files in the current workspace. All features are enabled:"
        ) : localize(
          "untrustedWorkspaceSubtitle",
          "You do not trust the authors of the files in the current workspace. The following features are disabled:"
        );
        break;
      }
    }
    return [title, subTitle];
  }
  rendering = false;
  rerenderDisposables = this._register(
    new DisposableStore()
  );
  async render() {
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    this.rerenderDisposables.clear();
    const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
    this.rootElement.classList.toggle("trusted", isWorkspaceTrusted);
    this.rootElement.classList.toggle("untrusted", !isWorkspaceTrusted);
    this.headerTitleText.innerText = this.getHeaderTitleText(isWorkspaceTrusted);
    this.headerTitleIcon.className = "workspace-trust-title-icon";
    this.headerTitleIcon.classList.add(
      ...this.getHeaderTitleIconClassNames(isWorkspaceTrusted)
    );
    this.headerDescription.innerText = "";
    const headerDescriptionText = append(this.headerDescription, $("div"));
    headerDescriptionText.innerText = isWorkspaceTrusted ? localize(
      "trustedDescription",
      "All features are enabled because trust has been granted to the workspace."
    ) : localize(
      "untrustedDescription",
      "{0} is in a restricted mode intended for safe code browsing.",
      this.productService.nameShort
    );
    const headerDescriptionActions = append(
      this.headerDescription,
      $("div")
    );
    const headerDescriptionActionsText = localize(
      {
        key: "workspaceTrustEditorHeaderActions",
        comment: [
          "Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)"
        ]
      },
      "[Configure your settings]({0}) or [learn more](https://aka.ms/vscode-workspace-trust).",
      `command:workbench.trust.configure`
    );
    for (const node of parseLinkedText(headerDescriptionActionsText).nodes) {
      if (typeof node === "string") {
        append(headerDescriptionActions, document.createTextNode(node));
      } else {
        this.rerenderDisposables.add(
          this.instantiationService.createInstance(
            Link,
            headerDescriptionActions,
            { ...node, tabIndex: -1 },
            {}
          )
        );
      }
    }
    this.headerContainer.className = this.getHeaderContainerClass(isWorkspaceTrusted);
    this.rootElement.setAttribute(
      "aria-label",
      `${localize("root element label", "Manage Workspace Trust")}:  ${this.headerContainer.innerText}`
    );
    const restrictedSettings = this.configurationService.restrictedSettings;
    const configurationRegistry = Registry.as(
      Extensions.Configuration
    );
    const settingsRequiringTrustedWorkspaceCount = restrictedSettings.default.filter((key) => {
      const property = configurationRegistry.getConfigurationProperties()[key];
      if (property.scope === ConfigurationScope.APPLICATION || property.scope === ConfigurationScope.MACHINE) {
        return false;
      }
      if (property.deprecationMessage || property.markdownDeprecationMessage) {
        if (restrictedSettings.workspace?.includes(key)) {
          return true;
        }
        if (restrictedSettings.workspaceFolder) {
          for (const workspaceFolderSettings of restrictedSettings.workspaceFolder.values()) {
            if (workspaceFolderSettings.includes(key)) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    }).length;
    this.renderAffectedFeatures(
      settingsRequiringTrustedWorkspaceCount,
      this.getExtensionCount()
    );
    this.workspaceTrustedUrisTable.updateTable();
    this.bodyScrollBar.getDomNode().style.height = `calc(100% - ${this.headerContainer.clientHeight}px)`;
    this.bodyScrollBar.scanDomNode();
    this.rendering = false;
  }
  getExtensionCount() {
    const set = /* @__PURE__ */ new Set();
    const inVirtualWorkspace = isVirtualWorkspace(
      this.workspaceService.getWorkspace()
    );
    const localExtensions = this.extensionWorkbenchService.local.filter((ext) => ext.local).map((ext) => ext.local);
    for (const extension of localExtensions) {
      const enablementState = this.extensionEnablementService.getEnablementState(extension);
      if (enablementState !== EnablementState.EnabledGlobally && enablementState !== EnablementState.EnabledWorkspace && enablementState !== EnablementState.DisabledByTrustRequirement && enablementState !== EnablementState.DisabledByExtensionDependency) {
        continue;
      }
      if (inVirtualWorkspace && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(
        extension.manifest
      ) === false) {
        continue;
      }
      if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(
        extension.manifest
      ) !== true) {
        set.add(extension.identifier.id);
        continue;
      }
      const dependencies = getExtensionDependencies(
        localExtensions,
        extension
      );
      if (dependencies.some(
        (ext) => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(
          ext.manifest
        ) === false
      )) {
        set.add(extension.identifier.id);
      }
    }
    return set.size;
  }
  createHeaderElement(parent) {
    this.headerContainer = append(
      parent,
      $(".workspace-trust-header", { tabIndex: "0" })
    );
    this.headerTitleContainer = append(
      this.headerContainer,
      $(".workspace-trust-title")
    );
    this.headerTitleIcon = append(
      this.headerTitleContainer,
      $(".workspace-trust-title-icon")
    );
    this.headerTitleText = append(
      this.headerTitleContainer,
      $(".workspace-trust-title-text")
    );
    this.headerDescription = append(
      this.headerContainer,
      $(".workspace-trust-description")
    );
  }
  createConfigurationElement(parent) {
    this.configurationContainer = append(
      parent,
      $(".workspace-trust-settings", { tabIndex: "0" })
    );
    const configurationTitle = append(
      this.configurationContainer,
      $(".workspace-trusted-folders-title")
    );
    configurationTitle.innerText = localize(
      "trustedFoldersAndWorkspaces",
      "Trusted Folders & Workspaces"
    );
    this.workspaceTrustedUrisTable = this._register(
      this.instantiationService.createInstance(
        WorkspaceTrustedUrisTable,
        this.configurationContainer
      )
    );
  }
  createAffectedFeaturesElement(parent) {
    this.affectedFeaturesContainer = append(
      parent,
      $(".workspace-trust-features")
    );
    this.trustedContainer = append(
      this.affectedFeaturesContainer,
      $(".workspace-trust-limitations.trusted", { tabIndex: "0" })
    );
    this.untrustedContainer = append(
      this.affectedFeaturesContainer,
      $(".workspace-trust-limitations.untrusted", { tabIndex: "0" })
    );
  }
  async renderAffectedFeatures(numSettings, numExtensions) {
    clearNode(this.trustedContainer);
    clearNode(this.untrustedContainer);
    const [trustedTitle, trustedSubTitle] = this.getFeaturesHeaderText(true);
    this.renderLimitationsHeaderElement(
      this.trustedContainer,
      trustedTitle,
      trustedSubTitle
    );
    const trustedContainerItems = this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY ? [
      localize("trustedTasks", "Tasks are allowed to run"),
      localize("trustedDebugging", "Debugging is enabled"),
      localize(
        "trustedExtensions",
        "All enabled extensions are activated"
      )
    ] : [
      localize("trustedTasks", "Tasks are allowed to run"),
      localize("trustedDebugging", "Debugging is enabled"),
      localize(
        "trustedSettings",
        "All workspace settings are applied"
      ),
      localize(
        "trustedExtensions",
        "All enabled extensions are activated"
      )
    ];
    this.renderLimitationsListElement(
      this.trustedContainer,
      trustedContainerItems,
      ThemeIcon.asClassNameArray(checkListIcon)
    );
    const [untrustedTitle, untrustedSubTitle] = this.getFeaturesHeaderText(false);
    this.renderLimitationsHeaderElement(
      this.untrustedContainer,
      untrustedTitle,
      untrustedSubTitle
    );
    const untrustedContainerItems = this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY ? [
      localize(
        "untrustedTasks",
        "Tasks are not allowed to run"
      ),
      localize("untrustedDebugging", "Debugging is disabled"),
      fixBadLocalizedLinks(
        localize(
          {
            key: "untrustedExtensions",
            comment: [
              "Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)"
            ]
          },
          "[{0} extensions]({1}) are disabled or have limited functionality",
          numExtensions,
          `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`
        )
      )
    ] : [
      localize(
        "untrustedTasks",
        "Tasks are not allowed to run"
      ),
      localize("untrustedDebugging", "Debugging is disabled"),
      fixBadLocalizedLinks(
        numSettings ? localize(
          {
            key: "untrustedSettings",
            comment: [
              "Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)"
            ]
          },
          "[{0} workspace settings]({1}) are not applied",
          numSettings,
          "command:settings.filterUntrusted"
        ) : localize(
          "no untrustedSettings",
          "Workspace settings requiring trust are not applied"
        )
      ),
      fixBadLocalizedLinks(
        localize(
          {
            key: "untrustedExtensions",
            comment: [
              "Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)"
            ]
          },
          "[{0} extensions]({1}) are disabled or have limited functionality",
          numExtensions,
          `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`
        )
      )
    ];
    this.renderLimitationsListElement(
      this.untrustedContainer,
      untrustedContainerItems,
      ThemeIcon.asClassNameArray(xListIcon)
    );
    if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
        this.addDontTrustButtonToElement(this.untrustedContainer);
      } else {
        this.addTrustedTextToElement(this.untrustedContainer);
      }
    } else if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
      this.addTrustButtonToElement(this.trustedContainer);
    }
  }
  createButtonRow(parent, buttonInfo, enabled) {
    const buttonRow = append(parent, $(".workspace-trust-buttons-row"));
    const buttonContainer = append(
      buttonRow,
      $(".workspace-trust-buttons")
    );
    const buttonBar = this.rerenderDisposables.add(
      new ButtonBar(buttonContainer)
    );
    for (const { action, keybinding } of buttonInfo) {
      const button = buttonBar.addButtonWithDescription(defaultButtonStyles);
      button.label = action.label;
      button.enabled = enabled !== void 0 ? enabled : action.enabled;
      button.description = keybinding.getLabel();
      button.element.ariaLabel = action.label + ", " + localize(
        "keyboardShortcut",
        "Keyboard Shortcut: {0}",
        keybinding.getAriaLabel()
      );
      this.rerenderDisposables.add(
        button.onDidClick((e) => {
          if (e) {
            EventHelper.stop(e, true);
          }
          action.run();
        })
      );
    }
  }
  addTrustButtonToElement(parent) {
    const trustAction = new Action(
      "workspace.trust.button.action.grant",
      localize("trustButton", "Trust"),
      void 0,
      true,
      async () => {
        await this.workspaceTrustManagementService.setWorkspaceTrust(
          true
        );
      }
    );
    const trustActions = [
      {
        action: trustAction,
        keybinding: this.keybindingService.resolveUserBinding(
          isMacintosh ? "Cmd+Enter" : "Ctrl+Enter"
        )[0]
      }
    ];
    if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
      const workspaceIdentifier = toWorkspaceIdentifier(
        this.workspaceService.getWorkspace()
      );
      const name = basename(dirname(workspaceIdentifier.uri));
      const trustMessageElement = append(parent, $(".trust-message-box"));
      trustMessageElement.innerText = localize(
        "trustMessage",
        "Trust the authors of all files in the current folder or its parent '{0}'.",
        name
      );
      const trustParentAction = new Action(
        "workspace.trust.button.action.grantParent",
        localize("trustParentButton", "Trust Parent"),
        void 0,
        true,
        async () => {
          await this.workspaceTrustManagementService.setParentFolderTrust(
            true
          );
        }
      );
      trustActions.push({
        action: trustParentAction,
        keybinding: this.keybindingService.resolveUserBinding(
          isMacintosh ? "Cmd+Shift+Enter" : "Ctrl+Shift+Enter"
        )[0]
      });
    }
    this.createButtonRow(parent, trustActions);
  }
  addDontTrustButtonToElement(parent) {
    this.createButtonRow(parent, [
      {
        action: new Action(
          "workspace.trust.button.action.deny",
          localize("dontTrustButton", "Don't Trust"),
          void 0,
          true,
          async () => {
            await this.workspaceTrustManagementService.setWorkspaceTrust(
              false
            );
          }
        ),
        keybinding: this.keybindingService.resolveUserBinding(
          isMacintosh ? "Cmd+Enter" : "Ctrl+Enter"
        )[0]
      }
    ]);
  }
  addTrustedTextToElement(parent) {
    if (this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY) {
      return;
    }
    const textElement = append(
      parent,
      $(".workspace-trust-untrusted-description")
    );
    if (this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
      textElement.innerText = localize(
        "trustedForcedReason",
        "This window is trusted by nature of the workspace that is opened."
      );
    } else {
      textElement.innerText = this.workspaceService.getWorkbenchState() === WorkbenchState.WORKSPACE ? localize(
        "untrustedWorkspaceReason",
        "This workspace is trusted via the bolded entries in the trusted folders below."
      ) : localize(
        "untrustedFolderReason",
        "This folder is trusted via the bolded entries in the the trusted folders below."
      );
    }
  }
  renderLimitationsHeaderElement(parent, headerText, subtitleText) {
    const limitationsHeaderContainer = append(
      parent,
      $(".workspace-trust-limitations-header")
    );
    const titleElement = append(
      limitationsHeaderContainer,
      $(".workspace-trust-limitations-title")
    );
    const textElement = append(
      titleElement,
      $(".workspace-trust-limitations-title-text")
    );
    const subtitleElement = append(
      limitationsHeaderContainer,
      $(".workspace-trust-limitations-subtitle")
    );
    textElement.innerText = headerText;
    subtitleElement.innerText = subtitleText;
  }
  renderLimitationsListElement(parent, limitations, iconClassNames) {
    const listContainer = append(
      parent,
      $(".workspace-trust-limitations-list-container")
    );
    const limitationsList = append(listContainer, $("ul"));
    for (const limitation of limitations) {
      const limitationListItem = append(limitationsList, $("li"));
      const icon = append(limitationListItem, $(".list-item-icon"));
      const text = append(limitationListItem, $(".list-item-text"));
      icon.classList.add(...iconClassNames);
      const linkedText = parseLinkedText(limitation);
      for (const node of linkedText.nodes) {
        if (typeof node === "string") {
          append(text, document.createTextNode(node));
        } else {
          this.rerenderDisposables.add(
            this.instantiationService.createInstance(
              Link,
              text,
              { ...node, tabIndex: -1 },
              {}
            )
          );
        }
      }
    }
  }
  layoutParticipants = [];
  layout(dimension) {
    if (!this.isVisible()) {
      return;
    }
    this.workspaceTrustedUrisTable.layout();
    this.layoutParticipants.forEach((participant) => {
      participant.layout();
    });
    this.bodyScrollBar.scanDomNode();
  }
};
__decorateClass([
  debounce(100)
], WorkspaceTrustEditor.prototype, "render", 1);
WorkspaceTrustEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IExtensionManifestPropertiesService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IWorkspaceTrustManagementService),
  __decorateParam(9, IWorkbenchConfigurationService),
  __decorateParam(10, IWorkbenchExtensionEnablementService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IKeybindingService)
], WorkspaceTrustEditor);
function fixBadLocalizedLinks(badString) {
  const regex = /(.*)\[(.+)\]\s*\((.+)\)(.*)/;
  return badString.replace(regex, "$1[$2]($3)$4");
}
__name(fixBadLocalizedLinks, "fixBadLocalizedLinks");
export {
  WorkspaceTrustEditor,
  shieldIcon
};
//# sourceMappingURL=workspaceTrustEditor.js.map
