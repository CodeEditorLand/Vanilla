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
import * as nls from "../../../../nls.js";
import { IWindowOpenable, isWorkspaceToOpen, isFileToOpen } from "../../../../platform/window/common/window.js";
import { IPickAndOpenOptions, ISaveDialogOptions, IOpenDialogOptions, FileFilter, IFileDialogService, IDialogService, ConfirmResult, getFileNamesMessage } from "../../../../platform/dialogs/common/dialogs.js";
import { isSavedWorkspace, isTemporaryWorkspace, IWorkspaceContextService, WorkbenchState, WORKSPACE_EXTENSION } from "../../../../platform/workspace/common/workspace.js";
import { IHistoryService } from "../../history/common/history.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { URI } from "../../../../base/common/uri.js";
import * as resources from "../../../../base/common/resources.js";
import { isAbsolute as localPathIsAbsolute, normalize as localPathNormalize } from "../../../../base/common/path.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ISimpleFileDialog, SimpleFileDialog } from "./simpleFileDialog.js";
import { IWorkspacesService } from "../../../../platform/workspaces/common/workspaces.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IHostService } from "../../host/browser/host.js";
import Severity from "../../../../base/common/severity.js";
import { coalesce, distinct } from "../../../../base/common/arrays.js";
import { trim } from "../../../../base/common/strings.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IPathService } from "../../path/common/pathService.js";
import { Schemas } from "../../../../base/common/network.js";
import { PLAINTEXT_EXTENSION } from "../../../../editor/common/languages/modesRegistry.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { EditorOpenSource } from "../../../../platform/editor/common/editor.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let AbstractFileDialogService = class {
  constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
    this.hostService = hostService;
    this.contextService = contextService;
    this.historyService = historyService;
    this.environmentService = environmentService;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.dialogService = dialogService;
    this.languageService = languageService;
    this.workspacesService = workspacesService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.commandService = commandService;
    this.editorService = editorService;
    this.codeEditorService = codeEditorService;
    this.logService = logService;
  }
  static {
    __name(this, "AbstractFileDialogService");
  }
  async defaultFilePath(schemeFilter = this.getSchemeFilterForWindow(), authorityFilter = this.getAuthorityFilterForWindow()) {
    let candidate = this.historyService.getLastActiveFile(schemeFilter, authorityFilter);
    if (!candidate) {
      candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter, authorityFilter);
    } else {
      candidate = resources.dirname(candidate);
    }
    if (!candidate) {
      candidate = await this.preferredHome(schemeFilter);
    }
    return candidate;
  }
  async defaultFolderPath(schemeFilter = this.getSchemeFilterForWindow(), authorityFilter = this.getAuthorityFilterForWindow()) {
    let candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter, authorityFilter);
    if (!candidate) {
      candidate = this.historyService.getLastActiveFile(schemeFilter, authorityFilter);
    }
    if (!candidate) {
      return this.preferredHome(schemeFilter);
    }
    return resources.dirname(candidate);
  }
  async preferredHome(schemeFilter = this.getSchemeFilterForWindow()) {
    const preferLocal = schemeFilter === Schemas.file;
    const preferredHomeConfig = this.configurationService.inspect("files.dialog.defaultPath");
    const preferredHomeCandidate = preferLocal ? preferredHomeConfig.userLocalValue : preferredHomeConfig.userRemoteValue;
    if (preferredHomeCandidate) {
      const isPreferredHomeCandidateAbsolute = preferLocal ? localPathIsAbsolute(preferredHomeCandidate) : (await this.pathService.path).isAbsolute(preferredHomeCandidate);
      if (isPreferredHomeCandidateAbsolute) {
        const preferredHomeNormalized = preferLocal ? localPathNormalize(preferredHomeCandidate) : (await this.pathService.path).normalize(preferredHomeCandidate);
        const preferredHome = resources.toLocalResource(await this.pathService.fileURI(preferredHomeNormalized), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
        if (await this.fileService.exists(preferredHome)) {
          return preferredHome;
        }
      }
    }
    return this.pathService.userHome({ preferLocal });
  }
  async defaultWorkspacePath(schemeFilter = this.getSchemeFilterForWindow()) {
    let defaultWorkspacePath;
    if (this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      const configuration = this.contextService.getWorkspace().configuration;
      if (configuration?.scheme === schemeFilter && isSavedWorkspace(configuration, this.environmentService) && !isTemporaryWorkspace(configuration)) {
        defaultWorkspacePath = resources.dirname(configuration);
      }
    }
    if (!defaultWorkspacePath) {
      defaultWorkspacePath = await this.defaultFilePath(schemeFilter);
    }
    return defaultWorkspacePath;
  }
  async showSaveConfirm(fileNamesOrResources) {
    if (this.skipDialogs()) {
      this.logService.trace("FileDialogService: refused to show save confirmation dialog in tests.");
      return ConfirmResult.DONT_SAVE;
    }
    return this.doShowSaveConfirm(fileNamesOrResources);
  }
  skipDialogs() {
    if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionTestsLocationURI) {
      return true;
    }
    return !!this.environmentService.enableSmokeTestDriver;
  }
  async doShowSaveConfirm(fileNamesOrResources) {
    if (fileNamesOrResources.length === 0) {
      return ConfirmResult.DONT_SAVE;
    }
    let message;
    let detail = nls.localize("saveChangesDetail", "Your changes will be lost if you don't save them.");
    if (fileNamesOrResources.length === 1) {
      message = nls.localize("saveChangesMessage", "Do you want to save the changes you made to {0}?", typeof fileNamesOrResources[0] === "string" ? fileNamesOrResources[0] : resources.basename(fileNamesOrResources[0]));
    } else {
      message = nls.localize("saveChangesMessages", "Do you want to save the changes to the following {0} files?", fileNamesOrResources.length);
      detail = getFileNamesMessage(fileNamesOrResources) + "\n" + detail;
    }
    const { result } = await this.dialogService.prompt({
      type: Severity.Warning,
      message,
      detail,
      buttons: [
        {
          label: fileNamesOrResources.length > 1 ? nls.localize({ key: "saveAll", comment: ["&& denotes a mnemonic"] }, "&&Save All") : nls.localize({ key: "save", comment: ["&& denotes a mnemonic"] }, "&&Save"),
          run: /* @__PURE__ */ __name(() => ConfirmResult.SAVE, "run")
        },
        {
          label: nls.localize({ key: "dontSave", comment: ["&& denotes a mnemonic"] }, "Do&&n't Save"),
          run: /* @__PURE__ */ __name(() => ConfirmResult.DONT_SAVE, "run")
        }
      ],
      cancelButton: {
        run: /* @__PURE__ */ __name(() => ConfirmResult.CANCEL, "run")
      }
    });
    return result;
  }
  addFileSchemaIfNeeded(schema, _isFolder) {
    return schema === Schemas.untitled ? [Schemas.file] : schema !== Schemas.file ? [schema, Schemas.file] : [schema];
  }
  async pickFileFolderAndOpenSimplified(schema, options, preferNewWindow) {
    const title = nls.localize("openFileOrFolder.title", "Open File or Folder");
    const availableFileSystems = this.addFileSchemaIfNeeded(schema);
    const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
    if (uri) {
      const stat = await this.fileService.stat(uri);
      const toOpen = stat.isDirectory ? { folderUri: uri } : { fileUri: uri };
      if (!isWorkspaceToOpen(toOpen) && isFileToOpen(toOpen)) {
        this.addFileToRecentlyOpened(toOpen.fileUri);
      }
      if (stat.isDirectory || options.forceNewWindow || preferNewWindow) {
        await this.hostService.openWindow([toOpen], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
      } else {
        await this.editorService.openEditors([{ resource: uri, options: { source: EditorOpenSource.USER, pinned: true } }], void 0, { validateTrust: true });
      }
    }
  }
  async pickFileAndOpenSimplified(schema, options, preferNewWindow) {
    const title = nls.localize("openFile.title", "Open File");
    const availableFileSystems = this.addFileSchemaIfNeeded(schema);
    const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
    if (uri) {
      this.addFileToRecentlyOpened(uri);
      if (options.forceNewWindow || preferNewWindow) {
        await this.hostService.openWindow([{ fileUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
      } else {
        await this.editorService.openEditors([{ resource: uri, options: { source: EditorOpenSource.USER, pinned: true } }], void 0, { validateTrust: true });
      }
    }
  }
  addFileToRecentlyOpened(uri) {
    this.workspacesService.addRecentlyOpened([{ fileUri: uri, label: this.labelService.getUriLabel(uri) }]);
  }
  async pickFolderAndOpenSimplified(schema, options) {
    const title = nls.localize("openFolder.title", "Open Folder");
    const availableFileSystems = this.addFileSchemaIfNeeded(schema, true);
    const uri = await this.pickResource({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
    if (uri) {
      return this.hostService.openWindow([{ folderUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
    }
  }
  async pickWorkspaceAndOpenSimplified(schema, options) {
    const title = nls.localize("openWorkspace.title", "Open Workspace from File");
    const filters = [{ name: nls.localize("filterName.workspace", "Workspace"), extensions: [WORKSPACE_EXTENSION] }];
    const availableFileSystems = this.addFileSchemaIfNeeded(schema, true);
    const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, filters, availableFileSystems });
    if (uri) {
      return this.hostService.openWindow([{ workspaceUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
    }
  }
  async pickFileToSaveSimplified(schema, options) {
    if (!options.availableFileSystems) {
      options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
    }
    options.title = nls.localize("saveFileAs.title", "Save As");
    const uri = await this.saveRemoteResource(options);
    if (uri) {
      this.addFileToRecentlyOpened(uri);
    }
    return uri;
  }
  async showSaveDialogSimplified(schema, options) {
    if (!options.availableFileSystems) {
      options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
    }
    return this.saveRemoteResource(options);
  }
  async showOpenDialogSimplified(schema, options) {
    if (!options.availableFileSystems) {
      options.availableFileSystems = this.addFileSchemaIfNeeded(schema, options.canSelectFolders);
    }
    const uri = await this.pickResource(options);
    return uri ? [uri] : void 0;
  }
  getSimpleFileDialog() {
    return this.instantiationService.createInstance(SimpleFileDialog);
  }
  pickResource(options) {
    return this.getSimpleFileDialog().showOpenDialog(options);
  }
  saveRemoteResource(options) {
    return this.getSimpleFileDialog().showSaveDialog(options);
  }
  getSchemeFilterForWindow(defaultUriScheme) {
    return defaultUriScheme ?? this.pathService.defaultUriScheme;
  }
  getAuthorityFilterForWindow() {
    return this.environmentService.remoteAuthority;
  }
  getFileSystemSchema(options) {
    return options.availableFileSystems && options.availableFileSystems[0] || this.getSchemeFilterForWindow(options.defaultUri?.scheme);
  }
  getWorkspaceAvailableFileSystems(options) {
    if (options.availableFileSystems && options.availableFileSystems.length > 0) {
      return options.availableFileSystems;
    }
    const availableFileSystems = [Schemas.file];
    if (this.environmentService.remoteAuthority) {
      availableFileSystems.unshift(Schemas.vscodeRemote);
    }
    return availableFileSystems;
  }
  getPickFileToSaveDialogOptions(defaultUri, availableFileSystems) {
    const options = {
      defaultUri,
      title: nls.localize("saveAsTitle", "Save As"),
      availableFileSystems
    };
    const ext = defaultUri ? resources.extname(defaultUri) : void 0;
    let matchingFilter;
    const registeredLanguageNames = this.languageService.getSortedRegisteredLanguageNames();
    const registeredLanguageFilters = coalesce(registeredLanguageNames.map(({ languageName, languageId }) => {
      const extensions = this.languageService.getExtensions(languageId);
      if (!extensions.length) {
        return null;
      }
      const filter = { name: languageName, extensions: distinct(extensions).slice(0, 10).map((e) => trim(e, ".")) };
      const extOrPlaintext = ext || PLAINTEXT_EXTENSION;
      if (!matchingFilter && extensions.includes(extOrPlaintext)) {
        matchingFilter = filter;
        const trimmedExt = trim(extOrPlaintext, ".");
        if (!filter.extensions.includes(trimmedExt)) {
          filter.extensions.unshift(trimmedExt);
        }
        return null;
      }
      return filter;
    }));
    if (!matchingFilter && ext) {
      matchingFilter = { name: trim(ext, ".").toUpperCase(), extensions: [trim(ext, ".")] };
    }
    options.filters = coalesce([
      { name: nls.localize("allFiles", "All Files"), extensions: ["*"] },
      matchingFilter,
      ...registeredLanguageFilters,
      { name: nls.localize("noExt", "No Extension"), extensions: [""] }
    ]);
    return options;
  }
};
AbstractFileDialogService = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IHistoryService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, ILanguageService),
  __decorateParam(10, IWorkspacesService),
  __decorateParam(11, ILabelService),
  __decorateParam(12, IPathService),
  __decorateParam(13, ICommandService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, ICodeEditorService),
  __decorateParam(16, ILogService)
], AbstractFileDialogService);
export {
  AbstractFileDialogService
};
//# sourceMappingURL=abstractFileDialogService.js.map
