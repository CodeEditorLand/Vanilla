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
import { getWindowById } from "../../../../base/browser/dom.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import { template } from "../../../../base/common/labels.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import {
  isMacintosh,
  isNative,
  isWeb,
  isWindows
} from "../../../../base/common/platform.js";
import { basename, dirname } from "../../../../base/common/resources.js";
import { trim } from "../../../../base/common/strings.js";
import {
  isCodeEditor,
  isDiffEditor
} from "../../../../editor/browser/editorBrowser.js";
import { localize } from "../../../../nls.js";
import {
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import {
  ILabelService,
  Verbosity as LabelVerbosity
} from "../../../../platform/label/common/label.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { getVirtualWorkspaceLocation } from "../../../../platform/workspace/common/virtualWorkspace.js";
import {
  IWorkspaceContextService,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
import {
  EditorResourceAccessor,
  SideBySideEditor,
  Verbosity
} from "../../../common/editor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
var WindowSettingNames = /* @__PURE__ */ ((WindowSettingNames2) => {
  WindowSettingNames2["titleSeparator"] = "window.titleSeparator";
  WindowSettingNames2["title"] = "window.title";
  return WindowSettingNames2;
})(WindowSettingNames || {});
const defaultWindowTitle = (() => {
  if (isMacintosh && isNative) {
    return "${activeEditorShort}${separator}${rootName}${separator}${profileName}";
  }
  const base = "${dirty}${activeEditorShort}${separator}${rootName}${separator}${profileName}${separator}${appName}";
  if (isWeb) {
    return base + "${separator}${remoteName}";
  }
  return base;
})();
const defaultWindowTitleSeparator = isMacintosh ? " \u2014 " : " - ";
let WindowTitle = class extends Disposable {
  constructor(targetWindow, editorGroupsContainer, configurationService, contextKeyService, editorService, environmentService, contextService, labelService, userDataProfileService, productService, viewsService) {
    super();
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.environmentService = environmentService;
    this.contextService = contextService;
    this.labelService = labelService;
    this.userDataProfileService = userDataProfileService;
    this.productService = productService;
    this.viewsService = viewsService;
    this.editorService = editorService.createScoped(editorGroupsContainer, this._store);
    this.windowId = targetWindow.vscodeWindowId;
    this.updateTitleIncludesFocusedView();
    this.registerListeners();
  }
  static NLS_USER_IS_ADMIN = isWindows ? localize("userIsAdmin", "[Administrator]") : localize("userIsSudo", "[Superuser]");
  static NLS_EXTENSION_HOST = localize(
    "devExtensionWindowTitlePrefix",
    "[Extension Development Host]"
  );
  static TITLE_DIRTY = "\u25CF ";
  properties = {
    isPure: true,
    isAdmin: false,
    prefix: void 0
  };
  variables = /* @__PURE__ */ new Map();
  activeEditorListeners = this._register(
    new DisposableStore()
  );
  titleUpdater = this._register(
    new RunOnceScheduler(() => this.doUpdateTitle(), 0)
  );
  onDidChangeEmitter = new Emitter();
  onDidChange = this.onDidChangeEmitter.event;
  get value() {
    return this.title ?? "";
  }
  get workspaceName() {
    return this.labelService.getWorkspaceLabel(
      this.contextService.getWorkspace()
    );
  }
  get fileName() {
    const activeEditor = this.editorService.activeEditor;
    if (!activeEditor) {
      return void 0;
    }
    const fileName = activeEditor.getTitle(Verbosity.SHORT);
    const dirty = activeEditor?.isDirty() && !activeEditor.isSaving() ? WindowTitle.TITLE_DIRTY : "";
    return `${dirty}${fileName}`;
  }
  title;
  titleIncludesFocusedView = false;
  editorService;
  windowId;
  registerListeners() {
    this._register(
      this.configurationService.onDidChangeConfiguration(
        (e) => this.onConfigurationChanged(e)
      )
    );
    this._register(
      this.editorService.onDidActiveEditorChange(
        () => this.onActiveEditorChange()
      )
    );
    this._register(
      this.contextService.onDidChangeWorkspaceFolders(
        () => this.titleUpdater.schedule()
      )
    );
    this._register(
      this.contextService.onDidChangeWorkbenchState(
        () => this.titleUpdater.schedule()
      )
    );
    this._register(
      this.contextService.onDidChangeWorkspaceName(
        () => this.titleUpdater.schedule()
      )
    );
    this._register(
      this.labelService.onDidChangeFormatters(
        () => this.titleUpdater.schedule()
      )
    );
    this._register(
      this.userDataProfileService.onDidChangeCurrentProfile(
        () => this.titleUpdater.schedule()
      )
    );
    this._register(
      this.viewsService.onDidChangeFocusedView(() => {
        if (this.titleIncludesFocusedView) {
          this.titleUpdater.schedule();
        }
      })
    );
    this._register(
      this.contextKeyService.onDidChangeContext((e) => {
        if (e.affectsSome(this.variables)) {
          this.titleUpdater.schedule();
        }
      })
    );
  }
  onConfigurationChanged(event) {
    if (event.affectsConfiguration("window.title" /* title */)) {
      this.updateTitleIncludesFocusedView();
    }
    if (event.affectsConfiguration("window.title" /* title */) || event.affectsConfiguration("window.titleSeparator" /* titleSeparator */)) {
      this.titleUpdater.schedule();
    }
  }
  updateTitleIncludesFocusedView() {
    const titleTemplate = this.configurationService.getValue(
      "window.title" /* title */
    );
    this.titleIncludesFocusedView = typeof titleTemplate === "string" && titleTemplate.includes("${focusedView}");
  }
  onActiveEditorChange() {
    this.activeEditorListeners.clear();
    this.titleUpdater.schedule();
    const activeEditor = this.editorService.activeEditor;
    if (activeEditor) {
      this.activeEditorListeners.add(
        activeEditor.onDidChangeDirty(
          () => this.titleUpdater.schedule()
        )
      );
      this.activeEditorListeners.add(
        activeEditor.onDidChangeLabel(
          () => this.titleUpdater.schedule()
        )
      );
    }
    if (this.titleIncludesFocusedView) {
      const activeTextEditorControl = this.editorService.activeTextEditorControl;
      const textEditorControls = [];
      if (isCodeEditor(activeTextEditorControl)) {
        textEditorControls.push(activeTextEditorControl);
      } else if (isDiffEditor(activeTextEditorControl)) {
        textEditorControls.push(
          activeTextEditorControl.getOriginalEditor(),
          activeTextEditorControl.getModifiedEditor()
        );
      }
      for (const textEditorControl of textEditorControls) {
        this.activeEditorListeners.add(
          textEditorControl.onDidBlurEditorText(
            () => this.titleUpdater.schedule()
          )
        );
        this.activeEditorListeners.add(
          textEditorControl.onDidFocusEditorText(
            () => this.titleUpdater.schedule()
          )
        );
      }
    }
  }
  doUpdateTitle() {
    const title = this.getFullWindowTitle();
    if (title !== this.title) {
      let nativeTitle = title;
      if (!trim(nativeTitle)) {
        nativeTitle = this.productService.nameLong;
      }
      const window = getWindowById(this.windowId, true).window;
      if (!window.document.title && isMacintosh && nativeTitle === this.productService.nameLong) {
        window.document.title = `${this.productService.nameLong} ${WindowTitle.TITLE_DIRTY}`;
      }
      window.document.title = nativeTitle;
      this.title = title;
      this.onDidChangeEmitter.fire();
    }
  }
  getFullWindowTitle() {
    const { prefix, suffix } = this.getTitleDecorations();
    let title = this.getWindowTitle() || this.productService.nameLong;
    if (prefix) {
      title = `${prefix} ${title}`;
    }
    if (suffix) {
      title = `${title} ${suffix}`;
    }
    return title.replace(/[^\S ]/g, " ");
  }
  getTitleDecorations() {
    let prefix;
    let suffix;
    if (this.properties.prefix) {
      prefix = this.properties.prefix;
    }
    if (this.environmentService.isExtensionDevelopment) {
      prefix = prefix ? `${WindowTitle.NLS_EXTENSION_HOST} - ${prefix}` : WindowTitle.NLS_EXTENSION_HOST;
    }
    if (this.properties.isAdmin) {
      suffix = WindowTitle.NLS_USER_IS_ADMIN;
    }
    return { prefix, suffix };
  }
  updateProperties(properties) {
    const isAdmin = typeof properties.isAdmin === "boolean" ? properties.isAdmin : this.properties.isAdmin;
    const isPure = typeof properties.isPure === "boolean" ? properties.isPure : this.properties.isPure;
    const prefix = typeof properties.prefix === "string" ? properties.prefix : this.properties.prefix;
    if (isAdmin !== this.properties.isAdmin || isPure !== this.properties.isPure || prefix !== this.properties.prefix) {
      this.properties.isAdmin = isAdmin;
      this.properties.isPure = isPure;
      this.properties.prefix = prefix;
      this.titleUpdater.schedule();
    }
  }
  registerVariables(variables) {
    let changed = false;
    for (const { name, contextKey } of variables) {
      if (!this.variables.has(contextKey)) {
        this.variables.set(contextKey, name);
        changed = true;
      }
    }
    if (changed) {
      this.titleUpdater.schedule();
    }
  }
  /**
   * Possible template values:
   *
   * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
   * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
   * {activeEditorShort}: e.g. myFile.txt
   * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
   * {activeFolderMedium}: e.g. myFolder/myFileFolder
   * {activeFolderShort}: e.g. myFileFolder
   * {rootName}: e.g. myFolder1, myFolder2, myFolder3
   * {rootPath}: e.g. /Users/Development
   * {folderName}: e.g. myFolder
   * {folderPath}: e.g. /Users/Development/myFolder
   * {appName}: e.g. VS Code
   * {remoteName}: e.g. SSH
   * {dirty}: indicator
   * {focusedView}: e.g. Terminal
   * {separator}: conditional separator
   */
  getWindowTitle() {
    const editor = this.editorService.activeEditor;
    const workspace = this.contextService.getWorkspace();
    let root;
    if (workspace.configuration) {
      root = workspace.configuration;
    } else if (workspace.folders.length) {
      root = workspace.folders[0].uri;
    }
    const editorResource = EditorResourceAccessor.getOriginalUri(editor, {
      supportSideBySide: SideBySideEditor.PRIMARY
    });
    let editorFolderResource = editorResource ? dirname(editorResource) : void 0;
    if (editorFolderResource?.path === ".") {
      editorFolderResource = void 0;
    }
    let folder;
    if (this.contextService.getWorkbenchState() === WorkbenchState.FOLDER) {
      folder = workspace.folders[0];
    } else if (editorResource) {
      folder = this.contextService.getWorkspaceFolder(editorResource) ?? void 0;
    }
    let remoteName;
    if (this.environmentService.remoteAuthority && !isWeb) {
      remoteName = this.labelService.getHostLabel(
        Schemas.vscodeRemote,
        this.environmentService.remoteAuthority
      );
    } else {
      const virtualWorkspaceLocation = getVirtualWorkspaceLocation(workspace);
      if (virtualWorkspaceLocation) {
        remoteName = this.labelService.getHostLabel(
          virtualWorkspaceLocation.scheme,
          virtualWorkspaceLocation.authority
        );
      }
    }
    const activeEditorShort = editor ? editor.getTitle(Verbosity.SHORT) : "";
    const activeEditorMedium = editor ? editor.getTitle(Verbosity.MEDIUM) : activeEditorShort;
    const activeEditorLong = editor ? editor.getTitle(Verbosity.LONG) : activeEditorMedium;
    const activeFolderShort = editorFolderResource ? basename(editorFolderResource) : "";
    const activeFolderMedium = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource, {
      relative: true
    }) : "";
    const activeFolderLong = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource) : "";
    const rootName = this.labelService.getWorkspaceLabel(workspace);
    const rootNameShort = this.labelService.getWorkspaceLabel(workspace, {
      verbose: LabelVerbosity.SHORT
    });
    const rootPath = root ? this.labelService.getUriLabel(root) : "";
    const folderName = folder ? folder.name : "";
    const folderPath = folder ? this.labelService.getUriLabel(folder.uri) : "";
    const dirty = editor?.isDirty() && !editor.isSaving() ? WindowTitle.TITLE_DIRTY : "";
    const appName = this.productService.nameLong;
    const profileName = this.userDataProfileService.currentProfile.isDefault ? "" : this.userDataProfileService.currentProfile.name;
    const focusedView = this.viewsService.getFocusedViewName();
    const variables = {};
    for (const [contextKey, name] of this.variables) {
      variables[name] = this.contextKeyService.getContextKeyValue(contextKey) ?? "";
    }
    let titleTemplate = this.configurationService.getValue(
      "window.title" /* title */
    );
    if (typeof titleTemplate !== "string") {
      titleTemplate = defaultWindowTitle;
    }
    let separator = this.configurationService.getValue(
      "window.titleSeparator" /* titleSeparator */
    );
    if (typeof separator !== "string") {
      separator = defaultWindowTitleSeparator;
    }
    return template(titleTemplate, {
      ...variables,
      activeEditorShort,
      activeEditorLong,
      activeEditorMedium,
      activeFolderShort,
      activeFolderMedium,
      activeFolderLong,
      rootName,
      rootPath,
      rootNameShort,
      folderName,
      folderPath,
      dirty,
      appName,
      remoteName,
      profileName,
      focusedView,
      separator: { label: separator }
    });
  }
  isCustomTitleFormat() {
    const title = this.configurationService.inspect(
      "window.title" /* title */
    );
    const titleSeparator = this.configurationService.inspect(
      "window.titleSeparator" /* titleSeparator */
    );
    return title.value !== title.defaultValue || titleSeparator.value !== titleSeparator.defaultValue;
  }
};
WindowTitle = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IBrowserWorkbenchEnvironmentService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IUserDataProfileService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IViewsService)
], WindowTitle);
export {
  WindowTitle,
  defaultWindowTitle,
  defaultWindowTitleSeparator
};
