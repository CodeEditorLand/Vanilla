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
  DataTransfers
} from "../../../../../base/browser/dnd.js";
import * as DOM from "../../../../../base/browser/dom.js";
import {
  InputBox,
  MessageType
} from "../../../../../base/browser/ui/inputbox/inputBox.js";
import {
  ListDragOverEffectPosition,
  ListDragOverEffectType
} from "../../../../../base/browser/ui/list/list.js";
import {
  ExternalElementsDragAndDropData,
  ListViewTargetSector,
  NativeDragAndDropData
} from "../../../../../base/browser/ui/list/listView.js";
import {
  TreeDragOverBubble,
  TreeVisibility
} from "../../../../../base/browser/ui/tree/tree.js";
import { mainWindow } from "../../../../../base/browser/window.js";
import { timeout } from "../../../../../base/common/async.js";
import {
  compareFileExtensionsDefault,
  compareFileExtensionsLower,
  compareFileExtensionsUnicode,
  compareFileExtensionsUpper,
  compareFileNamesDefault,
  compareFileNamesLower,
  compareFileNamesUnicode,
  compareFileNamesUpper
} from "../../../../../base/common/comparers.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import {
  Emitter,
  Event,
  EventMultiplexer
} from "../../../../../base/common/event.js";
import {
  createMatches
} from "../../../../../base/common/filters.js";
import { createSingleCallFunction } from "../../../../../base/common/functional.js";
import * as glob from "../../../../../base/common/glob.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  dispose,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { deepClone, equals } from "../../../../../base/common/objects.js";
import * as path from "../../../../../base/common/path.js";
import { isMacintosh, isWeb } from "../../../../../base/common/platform.js";
import {
  dirname,
  distinctParents,
  joinPath
} from "../../../../../base/common/resources.js";
import { TernarySearchTree } from "../../../../../base/common/ternarySearchTree.js";
import { isNumber } from "../../../../../base/common/types.js";
import { ResourceFileEdit } from "../../../../../editor/browser/services/bulkEditService.js";
import { localize } from "../../../../../nls.js";
import {
  IConfigurationService
} from "../../../../../platform/configuration/common/configuration.js";
import {
  IContextMenuService,
  IContextViewService
} from "../../../../../platform/contextview/browser/contextView.js";
import {
  IDialogService,
  getFileNamesMessage
} from "../../../../../platform/dialogs/common/dialogs.js";
import {
  CodeDataTransfers,
  containsDragType
} from "../../../../../platform/dnd/browser/dnd.js";
import { WebFileSystemAccess } from "../../../../../platform/files/browser/webFileSystemAccess.js";
import {
  FileChangeType,
  FileKind,
  FileOperationResult,
  IFileService
} from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import {
  INotificationService,
  Severity
} from "../../../../../platform/notification/common/notification.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../../platform/progress/common/progress.js";
import { defaultInputBoxStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IWorkspaceContextService,
  WorkbenchState,
  isTemporaryWorkspace
} from "../../../../../platform/workspace/common/workspace.js";
import { fillEditorsDragData } from "../../../../browser/dnd.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IWorkbenchLayoutService } from "../../../../services/layout/browser/layoutService.js";
import { IgnoreFile } from "../../../../services/search/common/ignoreFile.js";
import { IWorkspaceEditingService } from "../../../../services/workspaces/common/workspaceEditing.js";
import { ExplorerItem, NewExplorerItem } from "../../common/explorerModel.js";
import {
  UndoConfirmLevel
} from "../../common/files.js";
import {
  explorerFileContribRegistry
} from "../explorerFileContrib.js";
import { findValidPasteFileTarget } from "../fileActions.js";
import {
  BrowserFileUpload,
  ExternalFileImport,
  getMultipleFilesOverwriteConfirm
} from "../fileImportExport.js";
import { IExplorerService } from "../files.js";
class ExplorerDelegate {
  static {
    __name(this, "ExplorerDelegate");
  }
  static ITEM_HEIGHT = 22;
  getHeight(element) {
    return ExplorerDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return FilesRenderer.ID;
  }
}
const explorerRootErrorEmitter = new Emitter();
let ExplorerDataSource = class {
  constructor(fileFilter, progressService, configService, notificationService, layoutService, fileService, explorerService, contextService, filesConfigService) {
    this.fileFilter = fileFilter;
    this.progressService = progressService;
    this.configService = configService;
    this.notificationService = notificationService;
    this.layoutService = layoutService;
    this.fileService = fileService;
    this.explorerService = explorerService;
    this.contextService = contextService;
    this.filesConfigService = filesConfigService;
  }
  static {
    __name(this, "ExplorerDataSource");
  }
  hasChildren(element) {
    return Array.isArray(element) || element.hasChildren(
      (stat) => this.fileFilter.filter(stat, TreeVisibility.Visible)
    );
  }
  getChildren(element) {
    if (Array.isArray(element)) {
      return element;
    }
    const hasError = element.error;
    const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
    const children = element.fetchChildren(sortOrder);
    if (Array.isArray(children)) {
      return children;
    }
    const promise = children.then(
      (children2) => {
        if (element instanceof ExplorerItem && element.isRoot && !element.error && hasError && this.contextService.getWorkbenchState() !== WorkbenchState.FOLDER) {
          explorerRootErrorEmitter.fire(element.resource);
        }
        return children2;
      },
      (e) => {
        if (element instanceof ExplorerItem && element.isRoot) {
          if (this.contextService.getWorkbenchState() === WorkbenchState.FOLDER) {
            const placeholder = new ExplorerItem(
              element.resource,
              this.fileService,
              this.configService,
              this.filesConfigService,
              void 0,
              void 0,
              false
            );
            placeholder.error = e;
            return [placeholder];
          } else {
            explorerRootErrorEmitter.fire(element.resource);
          }
        } else {
          this.notificationService.error(e);
        }
        return [];
      }
    );
    this.progressService.withProgress(
      {
        location: ProgressLocation.Explorer,
        delay: this.layoutService.isRestored() ? 800 : 1500
        // reduce progress visibility when still restoring
      },
      (_progress) => promise
    );
    return promise;
  }
};
ExplorerDataSource = __decorateClass([
  __decorateParam(1, IProgressService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IWorkbenchLayoutService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IExplorerService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IFilesConfigurationService)
], ExplorerDataSource);
class CompressedNavigationController {
  constructor(id, items, templateData, depth, collapsed) {
    this.id = id;
    this.items = items;
    this.depth = depth;
    this.collapsed = collapsed;
    this._index = items.length - 1;
    this.updateLabels(templateData);
    this._updateLabelDisposable = templateData.label.onDidRender(
      () => this.updateLabels(templateData)
    );
  }
  static {
    __name(this, "CompressedNavigationController");
  }
  static ID = 0;
  _index;
  _labels;
  _updateLabelDisposable;
  get index() {
    return this._index;
  }
  get count() {
    return this.items.length;
  }
  get current() {
    return this.items[this._index];
  }
  get currentId() {
    return `${this.id}_${this.index}`;
  }
  get labels() {
    return this._labels;
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  updateLabels(templateData) {
    this._labels = Array.from(
      templateData.container.querySelectorAll(".label-name")
    );
    let parents = "";
    for (let i = 0; i < this.labels.length; i++) {
      const ariaLabel = parents.length ? `${this.items[i].name}, compact, ${parents}` : this.items[i].name;
      this.labels[i].setAttribute("aria-label", ariaLabel);
      this.labels[i].setAttribute("aria-level", `${this.depth + i}`);
      parents = parents.length ? `${this.items[i].name} ${parents}` : this.items[i].name;
    }
    this.updateCollapsed(this.collapsed);
    if (this._index < this.labels.length) {
      this.labels[this._index].classList.add("active");
    }
  }
  previous() {
    if (this._index <= 0) {
      return;
    }
    this.setIndex(this._index - 1);
  }
  next() {
    if (this._index >= this.items.length - 1) {
      return;
    }
    this.setIndex(this._index + 1);
  }
  first() {
    if (this._index === 0) {
      return;
    }
    this.setIndex(0);
  }
  last() {
    if (this._index === this.items.length - 1) {
      return;
    }
    this.setIndex(this.items.length - 1);
  }
  setIndex(index) {
    if (index < 0 || index >= this.items.length) {
      return;
    }
    this.labels[this._index].classList.remove("active");
    this._index = index;
    this.labels[this._index].classList.add("active");
    this._onDidChange.fire();
  }
  updateCollapsed(collapsed) {
    this.collapsed = collapsed;
    for (let i = 0; i < this.labels.length; i++) {
      this.labels[i].setAttribute(
        "aria-expanded",
        collapsed ? "false" : "true"
      );
    }
  }
  dispose() {
    this._onDidChange.dispose();
    this._updateLabelDisposable.dispose();
  }
}
let FilesRenderer = class {
  constructor(container, labels, updateWidth, contextViewService, themeService, configurationService, explorerService, labelService, contextService, contextMenuService, instantiationService) {
    this.labels = labels;
    this.updateWidth = updateWidth;
    this.contextViewService = contextViewService;
    this.themeService = themeService;
    this.configurationService = configurationService;
    this.explorerService = explorerService;
    this.labelService = labelService;
    this.contextService = contextService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.config = this.configurationService.getValue();
    const updateOffsetStyles = /* @__PURE__ */ __name(() => {
      const indent = this.configurationService.getValue("workbench.tree.indent");
      const offset = Math.max(22 - indent, 0);
      container.style.setProperty(`--vscode-explorer-align-offset-margin-left`, `${offset}px`);
    }, "updateOffsetStyles");
    this.configListener = this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("explorer")) {
        this.config = this.configurationService.getValue();
      }
      if (e.affectsConfiguration("workbench.tree.indent")) {
        updateOffsetStyles();
      }
    });
    updateOffsetStyles();
  }
  static {
    __name(this, "FilesRenderer");
  }
  static ID = "file";
  config;
  configListener;
  compressedNavigationControllers = /* @__PURE__ */ new Map();
  _onDidChangeActiveDescendant = new EventMultiplexer();
  onDidChangeActiveDescendant = this._onDidChangeActiveDescendant.event;
  getWidgetAriaLabel() {
    return localize("treeAriaLabel", "Files Explorer");
  }
  get templateId() {
    return FilesRenderer.ID;
  }
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const label = templateDisposables.add(
      this.labels.create(container, { supportHighlights: true })
    );
    templateDisposables.add(
      label.onDidRender(() => {
        try {
          if (templateData.currentContext) {
            this.updateWidth(templateData.currentContext);
          }
        } catch (e) {
        }
      })
    );
    const contribs = explorerFileContribRegistry.create(
      this.instantiationService,
      container,
      templateDisposables
    );
    templateDisposables.add(
      explorerFileContribRegistry.onDidRegisterDescriptor((d) => {
        const contr = d.create(this.instantiationService, container);
        contribs.push(templateDisposables.add(contr));
        contr.setResource(templateData.currentContext?.resource);
      })
    );
    const templateData = {
      templateDisposables,
      elementDisposables: templateDisposables.add(new DisposableStore()),
      label,
      container,
      contribs
    };
    return templateData;
  }
  renderElement(node, index, templateData) {
    const stat = node.element;
    templateData.currentContext = stat;
    const editableData = this.explorerService.getEditableData(stat);
    templateData.label.element.classList.remove("compressed");
    if (editableData) {
      templateData.label.element.style.display = "none";
      templateData.contribs.forEach((c) => c.setResource(void 0));
      templateData.elementDisposables.add(
        this.renderInputBox(templateData.container, stat, editableData)
      );
    } else {
      templateData.label.element.style.display = "flex";
      this.renderStat(
        stat,
        stat.name,
        void 0,
        node.filterData,
        templateData
      );
    }
  }
  renderCompressedElements(node, index, templateData, height) {
    const stat = node.element.elements[node.element.elements.length - 1];
    templateData.currentContext = stat;
    const editable = node.element.elements.filter(
      (e) => this.explorerService.isEditable(e)
    );
    const editableData = editable.length === 0 ? void 0 : this.explorerService.getEditableData(editable[0]);
    if (editableData) {
      templateData.label.element.classList.remove("compressed");
      templateData.label.element.style.display = "none";
      templateData.contribs.forEach((c) => c.setResource(void 0));
      templateData.elementDisposables.add(
        this.renderInputBox(
          templateData.container,
          editable[0],
          editableData
        )
      );
    } else {
      templateData.label.element.classList.add("compressed");
      templateData.label.element.style.display = "flex";
      const id = `compressed-explorer_${CompressedNavigationController.ID++}`;
      const label = node.element.elements.map((e) => e.name);
      this.renderStat(stat, label, id, node.filterData, templateData);
      const compressedNavigationController = new CompressedNavigationController(
        id,
        node.element.elements,
        templateData,
        node.depth,
        node.collapsed
      );
      templateData.elementDisposables.add(compressedNavigationController);
      const nodeControllers = this.compressedNavigationControllers.get(stat) ?? [];
      this.compressedNavigationControllers.set(stat, [
        ...nodeControllers,
        compressedNavigationController
      ]);
      templateData.elementDisposables.add(
        this._onDidChangeActiveDescendant.add(
          compressedNavigationController.onDidChange
        )
      );
      templateData.elementDisposables.add(
        DOM.addDisposableListener(
          templateData.container,
          "mousedown",
          (e) => {
            const result = getIconLabelNameFromHTMLElement(
              e.target
            );
            if (result) {
              compressedNavigationController.setIndex(
                result.index
              );
            }
          }
        )
      );
      templateData.elementDisposables.add(
        toDisposable(() => {
          const nodeControllers2 = this.compressedNavigationControllers.get(stat) ?? [];
          const renderedIndex = nodeControllers2.findIndex(
            (controller) => controller === compressedNavigationController
          );
          if (renderedIndex < 0) {
            throw new Error(
              "Disposing unknown navigation controller"
            );
          }
          if (nodeControllers2.length === 1) {
            this.compressedNavigationControllers.delete(stat);
          } else {
            nodeControllers2.splice(renderedIndex, 1);
          }
        })
      );
    }
  }
  renderStat(stat, label, domId, filterData, templateData) {
    templateData.label.element.style.display = "flex";
    const extraClasses = ["explorer-item"];
    if (this.explorerService.isCut(stat)) {
      extraClasses.push("cut");
    }
    const theme = this.themeService.getFileIconTheme();
    const twistieContainer = templateData.container.parentElement?.parentElement?.querySelector(
      ".monaco-tl-twistie"
    );
    twistieContainer?.classList.toggle(
      "force-twistie",
      stat.hasNests && theme.hidesExplorerArrows
    );
    const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
    const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
    templateData.contribs.forEach((c) => c.setResource(stat.resource));
    templateData.label.setResource(
      { resource: stat.resource, name: label },
      {
        fileKind: stat.isRoot ? FileKind.ROOT_FOLDER : stat.isDirectory ? FileKind.FOLDER : FileKind.FILE,
        extraClasses: realignNestedChildren ? [...extraClasses, "align-nest-icon-with-parent-icon"] : extraClasses,
        fileDecorations: this.config.explorer.decorations,
        matches: createMatches(filterData),
        separator: this.labelService.getSeparator(
          stat.resource.scheme,
          stat.resource.authority
        ),
        domId
      }
    );
  }
  renderInputBox(container, stat, editableData) {
    const label = this.labels.create(container);
    const extraClasses = ["explorer-item", "explorer-item-edited"];
    const fileKind = stat.isRoot ? FileKind.ROOT_FOLDER : stat.isDirectory ? FileKind.FOLDER : FileKind.FILE;
    const theme = this.themeService.getFileIconTheme();
    const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
    const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
    const labelOptions = {
      hidePath: true,
      hideLabel: true,
      fileKind,
      extraClasses: realignNestedChildren ? [...extraClasses, "align-nest-icon-with-parent-icon"] : extraClasses
    };
    const parent = stat.name ? dirname(stat.resource) : stat.resource;
    const value = stat.name || "";
    label.setFile(joinPath(parent, value || " "), labelOptions);
    label.element.firstElementChild.style.display = "none";
    const inputBox = new InputBox(label.element, this.contextViewService, {
      validationOptions: {
        validation: /* @__PURE__ */ __name((value2) => {
          const message = editableData.validationMessage(value2);
          if (!message || message.severity !== Severity.Error) {
            return null;
          }
          return {
            content: message.content,
            formatContent: true,
            type: MessageType.ERROR
          };
        }, "validation")
      },
      ariaLabel: localize(
        "fileInputAriaLabel",
        "Type file name. Press Enter to confirm or Escape to cancel."
      ),
      inputBoxStyles: defaultInputBoxStyles
    });
    const lastDot = value.lastIndexOf(".");
    let currentSelectionState = "prefix";
    inputBox.value = value;
    inputBox.focus();
    inputBox.select({
      start: 0,
      end: lastDot > 0 && !stat.isDirectory ? lastDot : value.length
    });
    const done = createSingleCallFunction(
      (success, finishEditing) => {
        label.element.style.display = "none";
        const value2 = inputBox.value;
        dispose(toDispose);
        label.element.remove();
        if (finishEditing) {
          editableData.onFinish(value2, success);
        }
      }
    );
    const showInputBoxNotification = /* @__PURE__ */ __name(() => {
      if (inputBox.isInputValid()) {
        const message = editableData.validationMessage(inputBox.value);
        if (message) {
          inputBox.showMessage({
            content: message.content,
            formatContent: true,
            type: message.severity === Severity.Info ? MessageType.INFO : message.severity === Severity.Warning ? MessageType.WARNING : MessageType.ERROR
          });
        } else {
          inputBox.hideMessage();
        }
      }
    }, "showInputBoxNotification");
    showInputBoxNotification();
    const toDispose = [
      inputBox,
      inputBox.onDidChange((value2) => {
        label.setFile(joinPath(parent, value2 || " "), labelOptions);
      }),
      DOM.addStandardDisposableListener(
        inputBox.inputElement,
        DOM.EventType.KEY_DOWN,
        (e) => {
          if (e.equals(KeyCode.F2)) {
            const dotIndex = inputBox.value.lastIndexOf(".");
            if (stat.isDirectory || dotIndex === -1) {
              return;
            }
            if (currentSelectionState === "prefix") {
              currentSelectionState = "all";
              inputBox.select({
                start: 0,
                end: inputBox.value.length
              });
            } else if (currentSelectionState === "all") {
              currentSelectionState = "suffix";
              inputBox.select({
                start: dotIndex + 1,
                end: inputBox.value.length
              });
            } else {
              currentSelectionState = "prefix";
              inputBox.select({ start: 0, end: dotIndex });
            }
          } else if (e.equals(KeyCode.Enter)) {
            if (!inputBox.validate()) {
              done(true, true);
            }
          } else if (e.equals(KeyCode.Escape)) {
            done(false, true);
          }
        }
      ),
      DOM.addStandardDisposableListener(
        inputBox.inputElement,
        DOM.EventType.KEY_UP,
        (e) => {
          showInputBoxNotification();
        }
      ),
      DOM.addDisposableListener(
        inputBox.inputElement,
        DOM.EventType.BLUR,
        async () => {
          while (true) {
            await timeout(0);
            const ownerDocument = inputBox.inputElement.ownerDocument;
            if (!ownerDocument.hasFocus()) {
              break;
            }
            if (DOM.isActiveElement(inputBox.inputElement)) {
              return;
            } else if (DOM.isHTMLElement(ownerDocument.activeElement) && DOM.hasParentWithClass(
              ownerDocument.activeElement,
              "context-view"
            )) {
              await Event.toPromise(
                this.contextMenuService.onDidHideContextMenu
              );
            } else {
              break;
            }
          }
          done(inputBox.isInputValid(), true);
        }
      ),
      label
    ];
    return toDisposable(() => {
      done(false, false);
    });
  }
  disposeElement(element, index, templateData) {
    templateData.currentContext = void 0;
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index, templateData) {
    templateData.currentContext = void 0;
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  getCompressedNavigationController(stat) {
    return this.compressedNavigationControllers.get(stat);
  }
  // IAccessibilityProvider
  getAriaLabel(element) {
    return element.name;
  }
  getAriaLevel(element) {
    let depth = 0;
    let parent = element.parent;
    while (parent) {
      parent = parent.parent;
      depth++;
    }
    if (this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      depth = depth + 1;
    }
    return depth;
  }
  getActiveDescendantId(stat) {
    return this.compressedNavigationControllers.get(stat)?.[0]?.currentId ?? void 0;
  }
  dispose() {
    this.configListener.dispose();
  }
};
FilesRenderer = __decorateClass([
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IExplorerService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IInstantiationService)
], FilesRenderer);
let FilesFilter = class {
  constructor(contextService, configurationService, explorerService, editorService, uriIdentityService, fileService) {
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.explorerService = explorerService;
    this.editorService = editorService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.toDispose.push(this.contextService.onDidChangeWorkspaceFolders(() => this.updateConfiguration()));
    this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("files.exclude") || e.affectsConfiguration("explorer.excludeGitIgnore")) {
        this.updateConfiguration();
      }
    }));
    this.toDispose.push(this.fileService.onDidFilesChange((e) => {
      for (const [root, ignoreFileResourceSet] of this.ignoreFileResourcesPerRoot.entries()) {
        ignoreFileResourceSet.forEach(async (ignoreResource) => {
          if (e.contains(ignoreResource, FileChangeType.UPDATED)) {
            await this.processIgnoreFile(root, ignoreResource, true);
          }
          if (e.contains(ignoreResource, FileChangeType.DELETED)) {
            this.ignoreTreesPerRoot.get(root)?.delete(dirname(ignoreResource));
            ignoreFileResourceSet.delete(ignoreResource);
            this._onDidChange.fire();
          }
        });
      }
    }));
    this.toDispose.push(this.editorService.onDidVisibleEditorsChange(() => {
      const editors = this.editorService.visibleEditors;
      let shouldFire = false;
      for (const e of editors) {
        if (!e.resource) {
          continue;
        }
        const stat = this.explorerService.findClosest(e.resource);
        if (stat && stat.isExcluded) {
          shouldFire = true;
          break;
        }
      }
      for (const e of this.editorsAffectingFilter) {
        if (!editors.includes(e)) {
          shouldFire = true;
          break;
        }
      }
      if (shouldFire) {
        this.editorsAffectingFilter.clear();
        this._onDidChange.fire();
      }
    }));
    this.updateConfiguration();
  }
  static {
    __name(this, "FilesFilter");
  }
  hiddenExpressionPerRoot = /* @__PURE__ */ new Map();
  editorsAffectingFilter = /* @__PURE__ */ new Set();
  _onDidChange = new Emitter();
  toDispose = [];
  // List of ignoreFile resources. Used to detect changes to the ignoreFiles.
  ignoreFileResourcesPerRoot = /* @__PURE__ */ new Map();
  // Ignore tree per root. Similar to `hiddenExpressionPerRoot`
  // Note: URI in the ternary search tree is the URI of the folder containing the ignore file
  // It is not the ignore file itself. This is because of the way the IgnoreFile works and nested paths
  ignoreTreesPerRoot = /* @__PURE__ */ new Map();
  get onDidChange() {
    return this._onDidChange.event;
  }
  updateConfiguration() {
    let shouldFire = false;
    let updatedGitIgnoreSetting = false;
    this.contextService.getWorkspace().folders.forEach((folder) => {
      const configuration = this.configurationService.getValue({
        resource: folder.uri
      });
      const excludesConfig = configuration?.files?.exclude || /* @__PURE__ */ Object.create(null);
      const parseIgnoreFile = configuration.explorer.excludeGitIgnore;
      if (parseIgnoreFile && !this.ignoreTreesPerRoot.has(folder.uri.toString())) {
        updatedGitIgnoreSetting = true;
        this.ignoreFileResourcesPerRoot.set(
          folder.uri.toString(),
          new ResourceSet()
        );
        this.ignoreTreesPerRoot.set(
          folder.uri.toString(),
          TernarySearchTree.forUris(
            (uri) => this.uriIdentityService.extUri.ignorePathCasing(uri)
          )
        );
      }
      if (!parseIgnoreFile && this.ignoreTreesPerRoot.has(folder.uri.toString())) {
        updatedGitIgnoreSetting = true;
        this.ignoreFileResourcesPerRoot.delete(folder.uri.toString());
        this.ignoreTreesPerRoot.delete(folder.uri.toString());
      }
      if (!shouldFire) {
        const cached = this.hiddenExpressionPerRoot.get(
          folder.uri.toString()
        );
        shouldFire = !cached || !equals(cached.original, excludesConfig);
      }
      const excludesConfigCopy = deepClone(excludesConfig);
      this.hiddenExpressionPerRoot.set(folder.uri.toString(), {
        original: excludesConfigCopy,
        parsed: glob.parse(excludesConfigCopy)
      });
    });
    if (shouldFire || updatedGitIgnoreSetting) {
      this.editorsAffectingFilter.clear();
      this._onDidChange.fire();
    }
  }
  /**
   * Given a .gitignore file resource, processes the resource and adds it to the ignore tree which hides explorer items
   * @param root The root folder of the workspace as a string. Used for lookup key for ignore tree and resource list
   * @param ignoreFileResource The resource of the .gitignore file
   * @param update Whether or not we're updating an existing ignore file. If true it deletes the old entry
   */
  async processIgnoreFile(root, ignoreFileResource, update) {
    const dirUri = dirname(ignoreFileResource);
    const ignoreTree = this.ignoreTreesPerRoot.get(root);
    if (!ignoreTree) {
      return;
    }
    if (!update && ignoreTree.has(dirUri)) {
      return;
    }
    const content = await this.fileService.readFile(ignoreFileResource);
    if (update) {
      const ignoreFile = ignoreTree.get(dirUri);
      ignoreFile?.updateContents(content.value.toString());
    } else {
      const ignoreParent = ignoreTree.findSubstr(dirUri);
      const ignoreFile = new IgnoreFile(
        content.value.toString(),
        dirUri.path,
        ignoreParent
      );
      ignoreTree.set(dirUri, ignoreFile);
      if (!this.ignoreFileResourcesPerRoot.get(root)?.has(ignoreFileResource)) {
        this.ignoreFileResourcesPerRoot.get(root)?.add(ignoreFileResource);
      }
    }
    this._onDidChange.fire();
  }
  filter(stat, parentVisibility) {
    if (stat.name === ".gitignore" && this.ignoreTreesPerRoot.has(stat.root.resource.toString())) {
      this.processIgnoreFile(
        stat.root.resource.toString(),
        stat.resource,
        false
      );
      return true;
    }
    return this.isVisible(stat, parentVisibility);
  }
  isVisible(stat, parentVisibility) {
    stat.isExcluded = false;
    if (parentVisibility === TreeVisibility.Hidden) {
      stat.isExcluded = true;
      return false;
    }
    if (this.explorerService.getEditableData(stat)) {
      return true;
    }
    const cached = this.hiddenExpressionPerRoot.get(
      stat.root.resource.toString()
    );
    const globMatch = cached?.parsed(
      path.relative(stat.root.resource.path, stat.resource.path),
      stat.name,
      (name) => !!(stat.parent && stat.parent.getChild(name))
    );
    const ignoreFile = globMatch ? void 0 : this.ignoreTreesPerRoot.get(stat.root.resource.toString())?.findSubstr(stat.resource);
    const isIncludedInTraversal = ignoreFile?.isPathIncludedInTraversal(
      stat.resource.path,
      stat.isDirectory
    );
    const isIgnoredByIgnoreFile = isIncludedInTraversal === void 0 ? false : !isIncludedInTraversal;
    if (isIgnoredByIgnoreFile || globMatch || stat.parent?.isExcluded) {
      stat.isExcluded = true;
      const editors = this.editorService.visibleEditors;
      const editor = editors.find(
        (e) => e.resource && this.uriIdentityService.extUri.isEqualOrParent(
          e.resource,
          stat.resource
        )
      );
      if (editor && stat.root === this.explorerService.findClosestRoot(stat.resource)) {
        this.editorsAffectingFilter.add(editor);
        return true;
      }
      return false;
    }
    return true;
  }
  dispose() {
    dispose(this.toDispose);
  }
};
FilesFilter = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IExplorerService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IFileService)
], FilesFilter);
let FileSorter = class {
  constructor(explorerService, contextService) {
    this.explorerService = explorerService;
    this.contextService = contextService;
  }
  static {
    __name(this, "FileSorter");
  }
  compare(statA, statB) {
    if (statA.isRoot) {
      if (statB.isRoot) {
        const workspaceA = this.contextService.getWorkspaceFolder(
          statA.resource
        );
        const workspaceB = this.contextService.getWorkspaceFolder(
          statB.resource
        );
        return workspaceA && workspaceB ? workspaceA.index - workspaceB.index : -1;
      }
      return -1;
    }
    if (statB.isRoot) {
      return 1;
    }
    const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
    const lexicographicOptions = this.explorerService.sortOrderConfiguration.lexicographicOptions;
    const reverse = this.explorerService.sortOrderConfiguration.reverse;
    if (reverse) {
      [statA, statB] = [statB, statA];
    }
    let compareFileNames;
    let compareFileExtensions;
    switch (lexicographicOptions) {
      case "upper":
        compareFileNames = compareFileNamesUpper;
        compareFileExtensions = compareFileExtensionsUpper;
        break;
      case "lower":
        compareFileNames = compareFileNamesLower;
        compareFileExtensions = compareFileExtensionsLower;
        break;
      case "unicode":
        compareFileNames = compareFileNamesUnicode;
        compareFileExtensions = compareFileExtensionsUnicode;
        break;
      default:
        compareFileNames = compareFileNamesDefault;
        compareFileExtensions = compareFileExtensionsDefault;
    }
    switch (sortOrder) {
      case "type":
        if (statA.isDirectory && !statB.isDirectory) {
          return -1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return 1;
        }
        if (statA.isDirectory && statB.isDirectory) {
          return compareFileNames(statA.name, statB.name);
        }
        break;
      case "filesFirst":
        if (statA.isDirectory && !statB.isDirectory) {
          return 1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return -1;
        }
        break;
      case "foldersNestsFiles":
        if (statA.isDirectory && !statB.isDirectory) {
          return -1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return 1;
        }
        if (statA.hasNests && !statB.hasNests) {
          return -1;
        }
        if (statB.hasNests && !statA.hasNests) {
          return 1;
        }
        break;
      case "mixed":
        break;
      // not sorting when "mixed" is on
      default:
        if (statA.isDirectory && !statB.isDirectory) {
          return -1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return 1;
        }
        break;
    }
    switch (sortOrder) {
      case "type":
        return compareFileExtensions(statA.name, statB.name);
      case "modified":
        if (statA.mtime !== statB.mtime) {
          return statA.mtime && statB.mtime && statA.mtime < statB.mtime ? 1 : -1;
        }
        return compareFileNames(statA.name, statB.name);
      default:
        return compareFileNames(statA.name, statB.name);
    }
  }
};
FileSorter = __decorateClass([
  __decorateParam(0, IExplorerService),
  __decorateParam(1, IWorkspaceContextService)
], FileSorter);
let FileDragAndDrop = class {
  constructor(isCollapsed, explorerService, editorService, dialogService, contextService, fileService, configurationService, instantiationService, workspaceEditingService, uriIdentityService) {
    this.isCollapsed = isCollapsed;
    this.explorerService = explorerService;
    this.editorService = editorService;
    this.dialogService = dialogService;
    this.contextService = contextService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.workspaceEditingService = workspaceEditingService;
    this.uriIdentityService = uriIdentityService;
    const updateDropEnablement = /* @__PURE__ */ __name((e) => {
      if (!e || e.affectsConfiguration("explorer.enableDragAndDrop")) {
        this.dropEnabled = this.configurationService.getValue("explorer.enableDragAndDrop");
      }
    }, "updateDropEnablement");
    updateDropEnablement(void 0);
    this.disposables.add(this.configurationService.onDidChangeConfiguration((e) => updateDropEnablement(e)));
  }
  static {
    __name(this, "FileDragAndDrop");
  }
  static CONFIRM_DND_SETTING_KEY = "explorer.confirmDragAndDrop";
  compressedDragOverElement;
  compressedDropTargetDisposable = Disposable.None;
  disposables = new DisposableStore();
  dropEnabled = false;
  onDragOver(data, target, targetIndex, targetSector, originalEvent) {
    if (!this.dropEnabled) {
      return false;
    }
    if (target) {
      const compressedTarget = FileDragAndDrop.getCompressedStatFromDragEvent(
        target,
        originalEvent
      );
      if (compressedTarget) {
        const iconLabelName = getIconLabelNameFromHTMLElement(
          originalEvent.target
        );
        if (iconLabelName && iconLabelName.index < iconLabelName.count - 1) {
          const result = this.handleDragOver(
            data,
            compressedTarget,
            targetIndex,
            targetSector,
            originalEvent
          );
          if (result) {
            if (iconLabelName.element !== this.compressedDragOverElement) {
              this.compressedDragOverElement = iconLabelName.element;
              this.compressedDropTargetDisposable.dispose();
              this.compressedDropTargetDisposable = toDisposable(
                () => {
                  iconLabelName.element.classList.remove(
                    "drop-target"
                  );
                  this.compressedDragOverElement = void 0;
                }
              );
              iconLabelName.element.classList.add("drop-target");
            }
            return typeof result === "boolean" ? result : { ...result, feedback: [] };
          }
          this.compressedDropTargetDisposable.dispose();
          return false;
        }
      }
    }
    this.compressedDropTargetDisposable.dispose();
    return this.handleDragOver(
      data,
      target,
      targetIndex,
      targetSector,
      originalEvent
    );
  }
  handleDragOver(data, target, targetIndex, targetSector, originalEvent) {
    const isCopy = originalEvent && (originalEvent.ctrlKey && !isMacintosh || originalEvent.altKey && isMacintosh);
    const isNative = data instanceof NativeDragAndDropData;
    const effectType = isNative || isCopy ? ListDragOverEffectType.Copy : ListDragOverEffectType.Move;
    const effect = {
      type: effectType,
      position: ListDragOverEffectPosition.Over
    };
    if (isNative) {
      if (!containsDragType(
        originalEvent,
        DataTransfers.FILES,
        CodeDataTransfers.FILES,
        DataTransfers.RESOURCES
      )) {
        return false;
      }
    } else if (data instanceof ExternalElementsDragAndDropData) {
      return false;
    } else {
      const items = FileDragAndDrop.getStatsFromDragAndDropData(
        data
      );
      const isRootsReorder = items.every((item) => item.isRoot);
      if (!target) {
        if (!isCopy && items.every((i) => !!i.parent && i.parent.isRoot)) {
          return false;
        }
        if (isRootsReorder) {
          return {
            accept: true,
            effect: {
              type: ListDragOverEffectType.Move,
              position: ListDragOverEffectPosition.After
            }
          };
        }
        return {
          accept: true,
          bubble: TreeDragOverBubble.Down,
          effect,
          autoExpand: false
        };
      }
      if (!Array.isArray(items)) {
        return false;
      }
      if (!isCopy && items.every((source) => source.isReadonly)) {
        return false;
      }
      if (items.some((source) => {
        if (source.isRoot) {
          return false;
        }
        if (this.uriIdentityService.extUri.isEqual(
          source.resource,
          target.resource
        )) {
          return true;
        }
        if (!isCopy && this.uriIdentityService.extUri.isEqual(
          dirname(source.resource),
          target.resource
        )) {
          return true;
        }
        if (this.uriIdentityService.extUri.isEqualOrParent(
          target.resource,
          source.resource
        )) {
          return true;
        }
        return false;
      })) {
        return false;
      }
      if (isRootsReorder) {
        if (!target.isRoot) {
          return false;
        }
        let dropEffectPosition;
        switch (targetSector) {
          case ListViewTargetSector.TOP:
          case ListViewTargetSector.CENTER_TOP:
            dropEffectPosition = ListDragOverEffectPosition.Before;
            break;
          case ListViewTargetSector.CENTER_BOTTOM:
          case ListViewTargetSector.BOTTOM:
            dropEffectPosition = ListDragOverEffectPosition.After;
            break;
        }
        return {
          accept: true,
          effect: {
            type: ListDragOverEffectType.Move,
            position: dropEffectPosition
          }
        };
      }
    }
    if (target) {
      if (target.isDirectory) {
        if (target.isReadonly) {
          return false;
        }
        return {
          accept: true,
          bubble: TreeDragOverBubble.Down,
          effect,
          autoExpand: true
        };
      }
      if (this.contextService.getWorkspace().folders.every(
        (folder) => folder.uri.toString() !== target.resource.toString()
      )) {
        return { accept: true, bubble: TreeDragOverBubble.Up, effect };
      }
    } else {
      return { accept: true, bubble: TreeDragOverBubble.Down, effect };
    }
    return false;
  }
  getDragURI(element) {
    if (this.explorerService.isEditable(element)) {
      return null;
    }
    return element.resource.toString();
  }
  getDragLabel(elements, originalEvent) {
    if (elements.length === 1) {
      const stat = FileDragAndDrop.getCompressedStatFromDragEvent(
        elements[0],
        originalEvent
      );
      return stat.name;
    }
    return String(elements.length);
  }
  onDragStart(data, originalEvent) {
    const items = FileDragAndDrop.getStatsFromDragAndDropData(
      data,
      originalEvent
    );
    if (items && items.length && originalEvent.dataTransfer) {
      this.instantiationService.invokeFunction(
        (accessor) => fillEditorsDragData(accessor, items, originalEvent)
      );
      const fileResources = items.filter((s) => s.resource.scheme === Schemas.file).map((r) => r.resource.fsPath);
      if (fileResources.length) {
        originalEvent.dataTransfer.setData(
          CodeDataTransfers.FILES,
          JSON.stringify(fileResources)
        );
      }
    }
  }
  async drop(data, target, targetIndex, targetSector, originalEvent) {
    this.compressedDropTargetDisposable.dispose();
    if (target) {
      const compressedTarget = FileDragAndDrop.getCompressedStatFromDragEvent(
        target,
        originalEvent
      );
      if (compressedTarget) {
        target = compressedTarget;
      }
    }
    if (!target) {
      target = this.explorerService.roots[this.explorerService.roots.length - 1];
      targetSector = ListViewTargetSector.BOTTOM;
    }
    if (!target.isDirectory && target.parent) {
      target = target.parent;
    }
    if (target.isReadonly) {
      return;
    }
    const resolvedTarget = target;
    if (!resolvedTarget) {
      return;
    }
    try {
      if (data instanceof NativeDragAndDropData) {
        if (!isWeb || isTemporaryWorkspace(this.contextService.getWorkspace()) && WebFileSystemAccess.supported(mainWindow)) {
          const fileImport = this.instantiationService.createInstance(
            ExternalFileImport
          );
          await fileImport.import(
            resolvedTarget,
            originalEvent,
            mainWindow
          );
        } else {
          const browserUpload = this.instantiationService.createInstance(
            BrowserFileUpload
          );
          await browserUpload.upload(target, originalEvent);
        }
      } else {
        await this.handleExplorerDrop(
          data,
          resolvedTarget,
          targetIndex,
          targetSector,
          originalEvent
        );
      }
    } catch (error) {
      this.dialogService.error(toErrorMessage(error));
    }
  }
  async handleExplorerDrop(data, target, targetIndex, targetSector, originalEvent) {
    const elementsData = FileDragAndDrop.getStatsFromDragAndDropData(data);
    const distinctItems = new Map(
      elementsData.map((element) => [element, this.isCollapsed(element)])
    );
    for (const [item, collapsed] of distinctItems) {
      if (collapsed) {
        const nestedChildren = item.nestedChildren;
        if (nestedChildren) {
          for (const child of nestedChildren) {
            distinctItems.set(child, true);
          }
        }
      }
    }
    const items = distinctParents(
      [...distinctItems.keys()],
      (s) => s.resource
    );
    const isCopy = originalEvent.ctrlKey && !isMacintosh || originalEvent.altKey && isMacintosh;
    const confirmDragAndDrop = !isCopy && this.configurationService.getValue(
      FileDragAndDrop.CONFIRM_DND_SETTING_KEY
    );
    if (confirmDragAndDrop) {
      const message = items.length > 1 && items.every((s) => s.isRoot) ? localize(
        "confirmRootsMove",
        "Are you sure you want to change the order of multiple root folders in your workspace?"
      ) : items.length > 1 ? localize(
        "confirmMultiMove",
        "Are you sure you want to move the following {0} files into '{1}'?",
        items.length,
        target.name
      ) : items[0].isRoot ? localize(
        "confirmRootMove",
        "Are you sure you want to change the order of root folder '{0}' in your workspace?",
        items[0].name
      ) : localize(
        "confirmMove",
        "Are you sure you want to move '{0}' into '{1}'?",
        items[0].name,
        target.name
      );
      const detail = items.length > 1 && !items.every((s) => s.isRoot) ? getFileNamesMessage(items.map((i) => i.resource)) : void 0;
      const confirmation = await this.dialogService.confirm({
        message,
        detail,
        checkbox: {
          label: localize("doNotAskAgain", "Do not ask me again")
        },
        primaryButton: localize(
          {
            key: "moveButtonLabel",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Move"
        )
      });
      if (!confirmation.confirmed) {
        return;
      }
      if (confirmation.checkboxChecked === true) {
        await this.configurationService.updateValue(
          FileDragAndDrop.CONFIRM_DND_SETTING_KEY,
          false
        );
      }
    }
    await this.doHandleRootDrop(
      items.filter((s) => s.isRoot),
      target,
      targetSector
    );
    const sources = items.filter((s) => !s.isRoot);
    if (isCopy) {
      return this.doHandleExplorerDropOnCopy(sources, target);
    }
    return this.doHandleExplorerDropOnMove(sources, target);
  }
  async doHandleRootDrop(roots, target, targetSector) {
    if (roots.length === 0) {
      return;
    }
    const folders = this.contextService.getWorkspace().folders;
    let targetIndex;
    const sourceIndices = [];
    const workspaceCreationData = [];
    const rootsToMove = [];
    for (let index = 0; index < folders.length; index++) {
      const data = {
        uri: folders[index].uri,
        name: folders[index].name
      };
      if (target instanceof ExplorerItem && this.uriIdentityService.extUri.isEqual(
        folders[index].uri,
        target.resource
      )) {
        targetIndex = index;
      }
      for (const root of roots) {
        if (this.uriIdentityService.extUri.isEqual(
          folders[index].uri,
          root.resource
        )) {
          sourceIndices.push(index);
          break;
        }
      }
      if (roots.every(
        (r) => r.resource.toString() !== folders[index].uri.toString()
      )) {
        workspaceCreationData.push(data);
      } else {
        rootsToMove.push(data);
      }
    }
    if (targetIndex === void 0) {
      targetIndex = workspaceCreationData.length;
    } else {
      switch (targetSector) {
        case ListViewTargetSector.BOTTOM:
        case ListViewTargetSector.CENTER_BOTTOM:
          targetIndex++;
          break;
      }
      for (const sourceIndex of sourceIndices) {
        if (sourceIndex < targetIndex) {
          targetIndex--;
        }
      }
    }
    workspaceCreationData.splice(targetIndex, 0, ...rootsToMove);
    return this.workspaceEditingService.updateFolders(
      0,
      workspaceCreationData.length,
      workspaceCreationData
    );
  }
  async doHandleExplorerDropOnCopy(sources, target) {
    const explorerConfig = this.configurationService.getValue().explorer;
    const resourceFileEdits = [];
    for (const { resource, isDirectory } of sources) {
      const allowOverwrite = explorerConfig.incrementalNaming === "disabled";
      const newResource = await findValidPasteFileTarget(
        this.explorerService,
        this.fileService,
        this.dialogService,
        target,
        { resource, isDirectory, allowOverwrite },
        explorerConfig.incrementalNaming
      );
      if (!newResource) {
        continue;
      }
      const resourceEdit = new ResourceFileEdit(resource, newResource, {
        copy: true,
        overwrite: allowOverwrite
      });
      resourceFileEdits.push(resourceEdit);
    }
    const labelSuffix = getFileOrFolderLabelSuffix(sources);
    await this.explorerService.applyBulkEdit(resourceFileEdits, {
      confirmBeforeUndo: explorerConfig.confirmUndo === UndoConfirmLevel.Default || explorerConfig.confirmUndo === UndoConfirmLevel.Verbose,
      undoLabel: localize("copy", "Copy {0}", labelSuffix),
      progressLabel: localize("copying", "Copying {0}", labelSuffix)
    });
    const editors = resourceFileEdits.filter((edit) => {
      const item = edit.newResource ? this.explorerService.findClosest(edit.newResource) : void 0;
      return item && !item.isDirectory;
    }).map((edit) => ({
      resource: edit.newResource,
      options: { pinned: true }
    }));
    await this.editorService.openEditors(editors);
  }
  async doHandleExplorerDropOnMove(sources, target) {
    const resourceFileEdits = sources.filter((source) => !source.isReadonly).map(
      (source) => new ResourceFileEdit(
        source.resource,
        joinPath(target.resource, source.name)
      )
    );
    const labelSuffix = getFileOrFolderLabelSuffix(sources);
    const options = {
      confirmBeforeUndo: this.configurationService.getValue().explorer.confirmUndo === UndoConfirmLevel.Verbose,
      undoLabel: localize("move", "Move {0}", labelSuffix),
      progressLabel: localize("moving", "Moving {0}", labelSuffix)
    };
    try {
      await this.explorerService.applyBulkEdit(
        resourceFileEdits,
        options
      );
    } catch (error) {
      if (error.fileOperationResult === FileOperationResult.FILE_MOVE_CONFLICT) {
        const overwrites = [];
        for (const edit of resourceFileEdits) {
          if (edit.newResource && await this.fileService.exists(edit.newResource)) {
            overwrites.push(edit.newResource);
          }
        }
        const confirm = getMultipleFilesOverwriteConfirm(overwrites);
        const { confirmed } = await this.dialogService.confirm(confirm);
        if (confirmed) {
          await this.explorerService.applyBulkEdit(
            resourceFileEdits.map(
              (re) => new ResourceFileEdit(
                re.oldResource,
                re.newResource,
                { overwrite: true }
              )
            ),
            options
          );
        }
      } else {
        throw error;
      }
    }
  }
  static getStatsFromDragAndDropData(data, dragStartEvent) {
    if (data.context) {
      return data.context;
    }
    if (dragStartEvent && data.elements.length === 1) {
      data.context = [
        FileDragAndDrop.getCompressedStatFromDragEvent(
          data.elements[0],
          dragStartEvent
        )
      ];
      return data.context;
    }
    return data.elements;
  }
  static getCompressedStatFromDragEvent(stat, dragEvent) {
    const target = DOM.getWindow(dragEvent).document.elementFromPoint(
      dragEvent.clientX,
      dragEvent.clientY
    );
    const iconLabelName = getIconLabelNameFromHTMLElement(target);
    if (iconLabelName) {
      const { count, index } = iconLabelName;
      let i = count - 1;
      while (i > index && stat.parent) {
        stat = stat.parent;
        i--;
      }
      return stat;
    }
    return stat;
  }
  onDragEnd() {
    this.compressedDropTargetDisposable.dispose();
  }
  dispose() {
    this.compressedDropTargetDisposable.dispose();
  }
};
FileDragAndDrop = __decorateClass([
  __decorateParam(1, IExplorerService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IWorkspaceEditingService),
  __decorateParam(9, IUriIdentityService)
], FileDragAndDrop);
function getIconLabelNameFromHTMLElement(target) {
  if (!DOM.isHTMLElement(target)) {
    return null;
  }
  let element = target;
  while (element && !element.classList.contains("monaco-list-row")) {
    if (element.classList.contains("label-name") && element.hasAttribute("data-icon-label-count")) {
      const count = Number(element.getAttribute("data-icon-label-count"));
      const index = Number(element.getAttribute("data-icon-label-index"));
      if (isNumber(count) && isNumber(index)) {
        return { element, count, index };
      }
    }
    element = element.parentElement;
  }
  return null;
}
__name(getIconLabelNameFromHTMLElement, "getIconLabelNameFromHTMLElement");
function isCompressedFolderName(target) {
  return !!getIconLabelNameFromHTMLElement(target);
}
__name(isCompressedFolderName, "isCompressedFolderName");
class ExplorerCompressionDelegate {
  static {
    __name(this, "ExplorerCompressionDelegate");
  }
  isIncompressible(stat) {
    return stat.isRoot || !stat.isDirectory || stat instanceof NewExplorerItem || !stat.parent || stat.parent.isRoot;
  }
}
function getFileOrFolderLabelSuffix(items) {
  if (items.length === 1) {
    return items[0].name;
  }
  if (items.every((i) => i.isDirectory)) {
    return localize("numberOfFolders", "{0} folders", items.length);
  }
  if (items.every((i) => !i.isDirectory)) {
    return localize("numberOfFiles", "{0} files", items.length);
  }
  return `${items.length} files and folders`;
}
__name(getFileOrFolderLabelSuffix, "getFileOrFolderLabelSuffix");
export {
  CompressedNavigationController,
  ExplorerCompressionDelegate,
  ExplorerDataSource,
  ExplorerDelegate,
  FileDragAndDrop,
  FileSorter,
  FilesFilter,
  FilesRenderer,
  explorerRootErrorEmitter,
  isCompressedFolderName
};
//# sourceMappingURL=explorerViewer.js.map
