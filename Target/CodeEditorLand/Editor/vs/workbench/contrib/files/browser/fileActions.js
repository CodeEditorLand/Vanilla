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
import { triggerUpload } from "../../../../base/browser/dom.js";
import { Action } from "../../../../base/common/actions.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { timeout } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  dispose
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename, extname, isAbsolute } from "../../../../base/common/path.js";
import {
  OS,
  isWindows
} from "../../../../base/common/platform.js";
import * as resources from "../../../../base/common/resources.js";
import { rtrim, trim } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Constants } from "../../../../base/common/uint.js";
import { URI } from "../../../../base/common/uri.js";
import { ResourceFileEdit } from "../../../../editor/browser/services/bulkEditService.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import {
  ITextModelService
} from "../../../../editor/common/services/resolverService.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import {
  IDialogService,
  getFileNamesMessage
} from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import {
  IQuickInputService,
  ItemActivation
} from "../../../../platform/quickinput/common/quickInput.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { CLOSE_EDITORS_AND_GROUP_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import {
  ActiveEditorCanToggleReadonlyContext,
  ActiveEditorContext,
  EmptyWorkspaceSupportContext
} from "../../../common/contextkeys.js";
import {
  EditorResourceAccessor,
  SideBySideEditor
} from "../../../common/editor.js";
import { ViewContainerLocation } from "../../../common/views.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IPathService } from "../../../services/path/common/pathService.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IWorkingCopyFileService } from "../../../services/workingCopy/common/workingCopyFileService.js";
import { IWorkingCopyService } from "../../../services/workingCopy/common/workingCopyService.js";
import { NewExplorerItem } from "../common/explorerModel.js";
import {
  UndoConfirmLevel,
  VIEWLET_ID,
  VIEW_ID
} from "../common/files.js";
import {
  NEW_UNTITLED_FILE_COMMAND_ID,
  REVEAL_IN_EXPLORER_COMMAND_ID,
  SAVE_ALL_IN_GROUP_COMMAND_ID
} from "./fileConstants.js";
import { BrowserFileUpload, FileDownload } from "./fileImportExport.js";
import { IExplorerService } from "./files.js";
const NEW_FILE_COMMAND_ID = "explorer.newFile";
const NEW_FILE_LABEL = nls.localize2("newFile", "New File...");
const NEW_FOLDER_COMMAND_ID = "explorer.newFolder";
const NEW_FOLDER_LABEL = nls.localize2("newFolder", "New Folder...");
const TRIGGER_RENAME_LABEL = nls.localize("rename", "Rename...");
const MOVE_FILE_TO_TRASH_LABEL = nls.localize("delete", "Delete");
const COPY_FILE_LABEL = nls.localize("copyFile", "Copy");
const PASTE_FILE_LABEL = nls.localize("pasteFile", "Paste");
const FileCopiedContext = new RawContextKey(
  "fileCopied",
  false
);
const DOWNLOAD_COMMAND_ID = "explorer.download";
const DOWNLOAD_LABEL = nls.localize("download", "Download...");
const UPLOAD_COMMAND_ID = "explorer.upload";
const UPLOAD_LABEL = nls.localize("upload", "Upload...");
const CONFIRM_DELETE_SETTING_KEY = "explorer.confirmDelete";
const MAX_UNDO_FILE_SIZE = 5e6;
function onError(notificationService, error) {
  if (error.message === "string") {
    error = error.message;
  }
  notificationService.error(toErrorMessage(error, false));
}
__name(onError, "onError");
async function refreshIfSeparator(value, explorerService) {
  if (value && (value.indexOf("/") >= 0 || value.indexOf("\\") >= 0)) {
    await explorerService.refresh();
  }
}
__name(refreshIfSeparator, "refreshIfSeparator");
async function deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, elements, useTrash, skipConfirm = false, ignoreIfNotExists = false) {
  let primaryButton;
  if (useTrash) {
    primaryButton = isWindows ? nls.localize(
      "deleteButtonLabelRecycleBin",
      "&&Move to Recycle Bin"
    ) : nls.localize(
      {
        key: "deleteButtonLabelTrash",
        comment: ["&& denotes a mnemonic"]
      },
      "&&Move to Trash"
    );
  } else {
    primaryButton = nls.localize(
      { key: "deleteButtonLabel", comment: ["&& denotes a mnemonic"] },
      "&&Delete"
    );
  }
  const distinctElements = resources.distinctParents(
    elements,
    (e) => e.resource
  );
  const dirtyWorkingCopies = /* @__PURE__ */ new Set();
  for (const distinctElement of distinctElements) {
    for (const dirtyWorkingCopy of workingCopyFileService.getDirty(
      distinctElement.resource
    )) {
      dirtyWorkingCopies.add(dirtyWorkingCopy);
    }
  }
  let confirmed = true;
  if (dirtyWorkingCopies.size) {
    let message;
    if (distinctElements.length > 1) {
      message = nls.localize(
        "dirtyMessageFilesDelete",
        "You are deleting files with unsaved changes. Do you want to continue?"
      );
    } else if (distinctElements[0].isDirectory) {
      if (dirtyWorkingCopies.size === 1) {
        message = nls.localize(
          "dirtyMessageFolderOneDelete",
          "You are deleting a folder {0} with unsaved changes in 1 file. Do you want to continue?",
          distinctElements[0].name
        );
      } else {
        message = nls.localize(
          "dirtyMessageFolderDelete",
          "You are deleting a folder {0} with unsaved changes in {1} files. Do you want to continue?",
          distinctElements[0].name,
          dirtyWorkingCopies.size
        );
      }
    } else {
      message = nls.localize(
        "dirtyMessageFileDelete",
        "You are deleting {0} with unsaved changes. Do you want to continue?",
        distinctElements[0].name
      );
    }
    const response = await dialogService.confirm({
      type: "warning",
      message,
      detail: nls.localize(
        "dirtyWarning",
        "Your changes will be lost if you don't save them."
      ),
      primaryButton
    });
    if (response.confirmed) {
      skipConfirm = true;
    } else {
      confirmed = false;
    }
  }
  if (!confirmed) {
    return;
  }
  let confirmation;
  const deleteDetail = distinctElements.some((e) => e.isDirectory) ? nls.localize("irreversible", "This action is irreversible!") : distinctElements.length > 1 ? nls.localize(
    "restorePlural",
    "You can restore these files using the Undo command."
  ) : nls.localize(
    "restore",
    "You can restore this file using the Undo command."
  );
  if (skipConfirm || useTrash && configurationService.getValue(
    CONFIRM_DELETE_SETTING_KEY
  ) === false) {
    confirmation = { confirmed: true };
  } else if (useTrash) {
    let { message, detail } = getMoveToTrashMessage(distinctElements);
    detail += detail ? "\n" : "";
    if (isWindows) {
      detail += distinctElements.length > 1 ? nls.localize(
        "undoBinFiles",
        "You can restore these files from the Recycle Bin."
      ) : nls.localize(
        "undoBin",
        "You can restore this file from the Recycle Bin."
      );
    } else {
      detail += distinctElements.length > 1 ? nls.localize(
        "undoTrashFiles",
        "You can restore these files from the Trash."
      ) : nls.localize(
        "undoTrash",
        "You can restore this file from the Trash."
      );
    }
    confirmation = await dialogService.confirm({
      message,
      detail,
      primaryButton,
      checkbox: {
        label: nls.localize("doNotAskAgain", "Do not ask me again")
      }
    });
  } else {
    let { message, detail } = getDeleteMessage(distinctElements);
    detail += detail ? "\n" : "";
    detail += deleteDetail;
    confirmation = await dialogService.confirm({
      type: "warning",
      message,
      detail,
      primaryButton
    });
  }
  if (confirmation.confirmed && confirmation.checkboxChecked === true) {
    await configurationService.updateValue(
      CONFIRM_DELETE_SETTING_KEY,
      false
    );
  }
  if (!confirmation.confirmed) {
    return;
  }
  try {
    const resourceFileEdits = distinctElements.map(
      (e) => new ResourceFileEdit(e.resource, void 0, {
        recursive: true,
        folder: e.isDirectory,
        ignoreIfNotExists,
        skipTrashBin: !useTrash,
        maxSize: MAX_UNDO_FILE_SIZE
      })
    );
    const options = {
      undoLabel: distinctElements.length > 1 ? nls.localize(
        {
          key: "deleteBulkEdit",
          comment: [
            "Placeholder will be replaced by the number of files deleted"
          ]
        },
        "Delete {0} files",
        distinctElements.length
      ) : nls.localize(
        {
          key: "deleteFileBulkEdit",
          comment: [
            "Placeholder will be replaced by the name of the file deleted"
          ]
        },
        "Delete {0}",
        distinctElements[0].name
      ),
      progressLabel: distinctElements.length > 1 ? nls.localize(
        {
          key: "deletingBulkEdit",
          comment: [
            "Placeholder will be replaced by the number of files deleted"
          ]
        },
        "Deleting {0} files",
        distinctElements.length
      ) : nls.localize(
        {
          key: "deletingFileBulkEdit",
          comment: [
            "Placeholder will be replaced by the name of the file deleted"
          ]
        },
        "Deleting {0}",
        distinctElements[0].name
      )
    };
    await explorerService.applyBulkEdit(resourceFileEdits, options);
  } catch (error) {
    let errorMessage;
    let detailMessage;
    let primaryButton2;
    if (useTrash) {
      errorMessage = isWindows ? nls.localize(
        "binFailed",
        "Failed to delete using the Recycle Bin. Do you want to permanently delete instead?"
      ) : nls.localize(
        "trashFailed",
        "Failed to delete using the Trash. Do you want to permanently delete instead?"
      );
      detailMessage = deleteDetail;
      primaryButton2 = nls.localize(
        {
          key: "deletePermanentlyButtonLabel",
          comment: ["&& denotes a mnemonic"]
        },
        "&&Delete Permanently"
      );
    } else {
      errorMessage = toErrorMessage(error, false);
      primaryButton2 = nls.localize(
        { key: "retryButtonLabel", comment: ["&& denotes a mnemonic"] },
        "&&Retry"
      );
    }
    const res = await dialogService.confirm({
      type: "warning",
      message: errorMessage,
      detail: detailMessage,
      primaryButton: primaryButton2
    });
    if (res.confirmed) {
      if (useTrash) {
        useTrash = false;
      }
      skipConfirm = true;
      ignoreIfNotExists = true;
      return deleteFiles(
        explorerService,
        workingCopyFileService,
        dialogService,
        configurationService,
        elements,
        useTrash,
        skipConfirm,
        ignoreIfNotExists
      );
    }
  }
}
__name(deleteFiles, "deleteFiles");
function getMoveToTrashMessage(distinctElements) {
  if (containsBothDirectoryAndFile(distinctElements)) {
    return {
      message: nls.localize(
        "confirmMoveTrashMessageFilesAndDirectories",
        "Are you sure you want to delete the following {0} files/directories and their contents?",
        distinctElements.length
      ),
      detail: getFileNamesMessage(
        distinctElements.map((e) => e.resource)
      )
    };
  }
  if (distinctElements.length > 1) {
    if (distinctElements[0].isDirectory) {
      return {
        message: nls.localize(
          "confirmMoveTrashMessageMultipleDirectories",
          "Are you sure you want to delete the following {0} directories and their contents?",
          distinctElements.length
        ),
        detail: getFileNamesMessage(
          distinctElements.map((e) => e.resource)
        )
      };
    }
    return {
      message: nls.localize(
        "confirmMoveTrashMessageMultiple",
        "Are you sure you want to delete the following {0} files?",
        distinctElements.length
      ),
      detail: getFileNamesMessage(
        distinctElements.map((e) => e.resource)
      )
    };
  }
  if (distinctElements[0].isDirectory && !distinctElements[0].isSymbolicLink) {
    return {
      message: nls.localize(
        "confirmMoveTrashMessageFolder",
        "Are you sure you want to delete '{0}' and its contents?",
        distinctElements[0].name
      ),
      detail: ""
    };
  }
  return {
    message: nls.localize(
      "confirmMoveTrashMessageFile",
      "Are you sure you want to delete '{0}'?",
      distinctElements[0].name
    ),
    detail: ""
  };
}
__name(getMoveToTrashMessage, "getMoveToTrashMessage");
function getDeleteMessage(distinctElements) {
  if (containsBothDirectoryAndFile(distinctElements)) {
    return {
      message: nls.localize(
        "confirmDeleteMessageFilesAndDirectories",
        "Are you sure you want to permanently delete the following {0} files/directories and their contents?",
        distinctElements.length
      ),
      detail: getFileNamesMessage(
        distinctElements.map((e) => e.resource)
      )
    };
  }
  if (distinctElements.length > 1) {
    if (distinctElements[0].isDirectory) {
      return {
        message: nls.localize(
          "confirmDeleteMessageMultipleDirectories",
          "Are you sure you want to permanently delete the following {0} directories and their contents?",
          distinctElements.length
        ),
        detail: getFileNamesMessage(
          distinctElements.map((e) => e.resource)
        )
      };
    }
    return {
      message: nls.localize(
        "confirmDeleteMessageMultiple",
        "Are you sure you want to permanently delete the following {0} files?",
        distinctElements.length
      ),
      detail: getFileNamesMessage(
        distinctElements.map((e) => e.resource)
      )
    };
  }
  if (distinctElements[0].isDirectory) {
    return {
      message: nls.localize(
        "confirmDeleteMessageFolder",
        "Are you sure you want to permanently delete '{0}' and its contents?",
        distinctElements[0].name
      ),
      detail: ""
    };
  }
  return {
    message: nls.localize(
      "confirmDeleteMessageFile",
      "Are you sure you want to permanently delete '{0}'?",
      distinctElements[0].name
    ),
    detail: ""
  };
}
__name(getDeleteMessage, "getDeleteMessage");
function containsBothDirectoryAndFile(distinctElements) {
  const directory = distinctElements.find((element) => element.isDirectory);
  const file = distinctElements.find((element) => !element.isDirectory);
  return !!directory && !!file;
}
__name(containsBothDirectoryAndFile, "containsBothDirectoryAndFile");
async function findValidPasteFileTarget(explorerService, fileService, dialogService, targetFolder, fileToPaste, incrementalNaming) {
  let name = typeof fileToPaste.resource === "string" ? fileToPaste.resource : resources.basenameOrAuthority(fileToPaste.resource);
  let candidate = resources.joinPath(targetFolder.resource, name);
  if (incrementalNaming === "disabled") {
    const canOverwrite = await askForOverwrite(
      fileService,
      dialogService,
      candidate
    );
    if (!canOverwrite) {
      return;
    }
  }
  while (!fileToPaste.allowOverwrite) {
    if (!explorerService.findClosest(candidate)) {
      break;
    }
    if (incrementalNaming !== "disabled") {
      name = incrementFileName(
        name,
        !!fileToPaste.isDirectory,
        incrementalNaming
      );
    }
    candidate = resources.joinPath(targetFolder.resource, name);
  }
  return candidate;
}
__name(findValidPasteFileTarget, "findValidPasteFileTarget");
function incrementFileName(name, isFolder, incrementalNaming) {
  if (incrementalNaming === "simple") {
    let namePrefix = name;
    let extSuffix = "";
    if (!isFolder) {
      extSuffix = extname(name);
      namePrefix = basename(name, extSuffix);
    }
    const suffixRegex = /^(.+ copy)( \d+)?$/;
    if (suffixRegex.test(namePrefix)) {
      return namePrefix.replace(suffixRegex, (match, g1, g2) => {
        const number = g2 ? Number.parseInt(g2) : 1;
        return number === 0 ? `${g1}` : number < Constants.MAX_SAFE_SMALL_INTEGER ? `${g1} ${number + 1}` : `${g1}${g2} copy`;
      }) + extSuffix;
    }
    return `${namePrefix} copy${extSuffix}`;
  }
  const separators = "[\\.\\-_]";
  const maxNumber = Constants.MAX_SAFE_SMALL_INTEGER;
  const suffixFileRegex = RegExp("(.*" + separators + ")(\\d+)(\\..*)$");
  if (!isFolder && name.match(suffixFileRegex)) {
    return name.replace(suffixFileRegex, (match, g1, g2, g3) => {
      const number = Number.parseInt(g2);
      return number < maxNumber ? g1 + String(number + 1).padStart(g2.length, "0") + g3 : `${g1}${g2}.1${g3}`;
    });
  }
  const prefixFileRegex = RegExp("(\\d+)(" + separators + ".*)(\\..*)$");
  if (!isFolder && name.match(prefixFileRegex)) {
    return name.replace(prefixFileRegex, (match, g1, g2, g3) => {
      const number = Number.parseInt(g1);
      return number < maxNumber ? String(number + 1).padStart(g1.length, "0") + g2 + g3 : `${g1}${g2}.1${g3}`;
    });
  }
  const prefixFileNoNameRegex = /(\d+)(\..*)$/;
  if (!isFolder && name.match(prefixFileNoNameRegex)) {
    return name.replace(prefixFileNoNameRegex, (match, g1, g2) => {
      const number = Number.parseInt(g1);
      return number < maxNumber ? String(number + 1).padStart(g1.length, "0") + g2 : `${g1}.1${g2}`;
    });
  }
  const lastIndexOfDot = name.lastIndexOf(".");
  if (!isFolder && lastIndexOfDot >= 0) {
    return `${name.substr(0, lastIndexOfDot)}.1${name.substr(lastIndexOfDot)}`;
  }
  const noNameNoExtensionRegex = /(\d+)$/;
  if (!isFolder && lastIndexOfDot === -1 && name.match(noNameNoExtensionRegex)) {
    return name.replace(noNameNoExtensionRegex, (match, g1) => {
      const number = Number.parseInt(g1);
      return number < maxNumber ? String(number + 1).padStart(g1.length, "0") : `${g1}.1`;
    });
  }
  const noExtensionRegex = /(.*)(\d*)$/;
  if (!isFolder && lastIndexOfDot === -1 && name.match(noExtensionRegex)) {
    return name.replace(noExtensionRegex, (match, g1, g2) => {
      let number = Number.parseInt(g2);
      if (isNaN(number)) {
        number = 0;
      }
      return number < maxNumber ? g1 + String(number + 1).padStart(g2.length, "0") : `${g1}${g2}.1`;
    });
  }
  if (isFolder && name.match(/(\d+)$/)) {
    return name.replace(/(\d+)$/, (match, ...groups) => {
      const number = Number.parseInt(groups[0]);
      return number < maxNumber ? String(number + 1).padStart(groups[0].length, "0") : `${groups[0]}.1`;
    });
  }
  if (isFolder && name.match(/^(\d+)/)) {
    return name.replace(/^(\d+)(.*)$/, (match, ...groups) => {
      const number = Number.parseInt(groups[0]);
      return number < maxNumber ? String(number + 1).padStart(groups[0].length, "0") + groups[1] : `${groups[0]}${groups[1]}.1`;
    });
  }
  return `${name}.1`;
}
__name(incrementFileName, "incrementFileName");
async function askForOverwrite(fileService, dialogService, targetResource) {
  const exists = await fileService.exists(targetResource);
  if (!exists) {
    return true;
  }
  const { confirmed } = await dialogService.confirm({
    type: Severity.Warning,
    message: nls.localize(
      "confirmOverwrite",
      "A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?",
      basename(targetResource.path)
    ),
    primaryButton: nls.localize("replaceButtonLabel", "&&Replace")
  });
  return confirmed;
}
__name(askForOverwrite, "askForOverwrite");
class GlobalCompareResourcesAction extends Action2 {
  static {
    __name(this, "GlobalCompareResourcesAction");
  }
  static ID = "workbench.files.action.compareFileWith";
  static LABEL = nls.localize2(
    "globalCompareFile",
    "Compare Active File With..."
  );
  constructor() {
    super({
      id: GlobalCompareResourcesAction.ID,
      title: GlobalCompareResourcesAction.LABEL,
      f1: true,
      category: Categories.File,
      precondition: ActiveEditorContext,
      metadata: {
        description: nls.localize2(
          "compareFileWithMeta",
          "Opens a picker to select a file to diff with the active editor."
        )
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const textModelService = accessor.get(ITextModelService);
    const quickInputService = accessor.get(IQuickInputService);
    const activeInput = editorService.activeEditor;
    const activeResource = EditorResourceAccessor.getOriginalUri(activeInput);
    if (activeResource && textModelService.canHandleResource(activeResource)) {
      const picks = await quickInputService.quickAccess.pick("", {
        itemActivation: ItemActivation.SECOND
      });
      if (picks?.length === 1) {
        const resource = picks[0].resource;
        if (URI.isUri(resource) && textModelService.canHandleResource(resource)) {
          editorService.openEditor({
            original: { resource: activeResource },
            modified: { resource },
            options: { pinned: true }
          });
        }
      }
    }
  }
}
class ToggleAutoSaveAction extends Action2 {
  static {
    __name(this, "ToggleAutoSaveAction");
  }
  static ID = "workbench.action.toggleAutoSave";
  constructor() {
    super({
      id: ToggleAutoSaveAction.ID,
      title: nls.localize2("toggleAutoSave", "Toggle Auto Save"),
      f1: true,
      category: Categories.File,
      metadata: {
        description: nls.localize2(
          "toggleAutoSaveDescription",
          "Toggle the ability to save files automatically after typing"
        )
      }
    });
  }
  run(accessor) {
    const filesConfigurationService = accessor.get(
      IFilesConfigurationService
    );
    return filesConfigurationService.toggleAutoSave();
  }
}
let BaseSaveAllAction = class extends Action {
  constructor(id, label, commandService, notificationService, workingCopyService) {
    super(id, label);
    this.commandService = commandService;
    this.notificationService = notificationService;
    this.workingCopyService = workingCopyService;
    this.lastDirtyState = this.workingCopyService.hasDirty;
    this.enabled = this.lastDirtyState;
    this.registerListeners();
  }
  static {
    __name(this, "BaseSaveAllAction");
  }
  lastDirtyState;
  registerListeners() {
    this._register(
      this.workingCopyService.onDidChangeDirty(
        (workingCopy) => this.updateEnablement(workingCopy)
      )
    );
  }
  updateEnablement(workingCopy) {
    const hasDirty = workingCopy.isDirty() || this.workingCopyService.hasDirty;
    if (this.lastDirtyState !== hasDirty) {
      this.enabled = hasDirty;
      this.lastDirtyState = this.enabled;
    }
  }
  async run(context) {
    try {
      await this.doRun(context);
    } catch (error) {
      onError(this.notificationService, error);
    }
  }
};
BaseSaveAllAction = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IWorkingCopyService)
], BaseSaveAllAction);
class SaveAllInGroupAction extends BaseSaveAllAction {
  static {
    __name(this, "SaveAllInGroupAction");
  }
  static ID = "workbench.files.action.saveAllInGroup";
  static LABEL = nls.localize("saveAllInGroup", "Save All in Group");
  get class() {
    return "explorer-action " + ThemeIcon.asClassName(Codicon.saveAll);
  }
  doRun(context) {
    return this.commandService.executeCommand(
      SAVE_ALL_IN_GROUP_COMMAND_ID,
      {},
      context
    );
  }
}
let CloseGroupAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label, ThemeIcon.asClassName(Codicon.closeAll));
    this.commandService = commandService;
  }
  static {
    __name(this, "CloseGroupAction");
  }
  static ID = "workbench.files.action.closeGroup";
  static LABEL = nls.localize("closeGroup", "Close Group");
  run(context) {
    return this.commandService.executeCommand(
      CLOSE_EDITORS_AND_GROUP_COMMAND_ID,
      {},
      context
    );
  }
};
CloseGroupAction = __decorateClass([
  __decorateParam(2, ICommandService)
], CloseGroupAction);
class FocusFilesExplorer extends Action2 {
  static {
    __name(this, "FocusFilesExplorer");
  }
  static ID = "workbench.files.action.focusFilesExplorer";
  static LABEL = nls.localize2(
    "focusFilesExplorer",
    "Focus on Files Explorer"
  );
  constructor() {
    super({
      id: FocusFilesExplorer.ID,
      title: FocusFilesExplorer.LABEL,
      f1: true,
      category: Categories.File,
      metadata: {
        description: nls.localize2(
          "focusFilesExplorerMetadata",
          "Moves focus to the file explorer view container."
        )
      }
    });
  }
  async run(accessor) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    await paneCompositeService.openPaneComposite(
      VIEWLET_ID,
      ViewContainerLocation.Sidebar,
      true
    );
  }
}
class ShowActiveFileInExplorer extends Action2 {
  static {
    __name(this, "ShowActiveFileInExplorer");
  }
  static ID = "workbench.files.action.showActiveFileInExplorer";
  static LABEL = nls.localize2(
    "showInExplorer",
    "Reveal Active File in Explorer View"
  );
  constructor() {
    super({
      id: ShowActiveFileInExplorer.ID,
      title: ShowActiveFileInExplorer.LABEL,
      f1: true,
      category: Categories.File,
      metadata: {
        description: nls.localize2(
          "showInExplorerMetadata",
          "Reveals and selects the active file within the explorer view."
        )
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const editorService = accessor.get(IEditorService);
    const resource = EditorResourceAccessor.getOriginalUri(
      editorService.activeEditor,
      { supportSideBySide: SideBySideEditor.PRIMARY }
    );
    if (resource) {
      commandService.executeCommand(
        REVEAL_IN_EXPLORER_COMMAND_ID,
        resource
      );
    }
  }
}
class OpenActiveFileInEmptyWorkspace extends Action2 {
  static {
    __name(this, "OpenActiveFileInEmptyWorkspace");
  }
  static ID = "workbench.action.files.showOpenedFileInNewWindow";
  static LABEL = nls.localize2(
    "openFileInEmptyWorkspace",
    "Open Active File in New Empty Workspace"
  );
  constructor() {
    super({
      id: OpenActiveFileInEmptyWorkspace.ID,
      title: OpenActiveFileInEmptyWorkspace.LABEL,
      f1: true,
      category: Categories.File,
      precondition: EmptyWorkspaceSupportContext,
      metadata: {
        description: nls.localize2(
          "openFileInEmptyWorkspaceMetadata",
          "Opens the active file in a new window with no folders open."
        )
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const hostService = accessor.get(IHostService);
    const dialogService = accessor.get(IDialogService);
    const fileService = accessor.get(IFileService);
    const fileResource = EditorResourceAccessor.getOriginalUri(
      editorService.activeEditor,
      { supportSideBySide: SideBySideEditor.PRIMARY }
    );
    if (fileResource) {
      if (fileService.hasProvider(fileResource)) {
        hostService.openWindow([{ fileUri: fileResource }], {
          forceNewWindow: true
        });
      } else {
        dialogService.error(
          nls.localize(
            "openFileToShowInNewWindow.unsupportedschema",
            "The active editor must contain an openable resource."
          )
        );
      }
    }
  }
}
function validateFileName(pathService, item, name, os) {
  name = getWellFormedFileName(name);
  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return {
      content: nls.localize(
        "emptyFileNameError",
        "A file or folder name must be provided."
      ),
      severity: Severity.Error
    };
  }
  if (name[0] === "/" || name[0] === "\\") {
    return {
      content: nls.localize(
        "fileNameStartsWithSlashError",
        "A file or folder name cannot start with a slash."
      ),
      severity: Severity.Error
    };
  }
  const names = coalesce(name.split(/[\\/]/));
  const parent = item.parent;
  if (name !== item.name) {
    const child = parent?.getChild(name);
    if (child && child !== item) {
      return {
        content: nls.localize(
          "fileNameExistsError",
          "A file or folder **{0}** already exists at this location. Please choose a different name.",
          name
        ),
        severity: Severity.Error
      };
    }
  }
  if (names.some(
    (folderName) => !pathService.hasValidBasename(item.resource, os, folderName)
  )) {
    const escapedName = name.replace(/\*/g, "\\*");
    return {
      content: nls.localize(
        "invalidFileNameError",
        "The name **{0}** is not valid as a file or folder name. Please choose a different name.",
        trimLongName(escapedName)
      ),
      severity: Severity.Error
    };
  }
  if (names.some((name2) => /^\s|\s$/.test(name2))) {
    return {
      content: nls.localize(
        "fileNameWhitespaceWarning",
        "Leading or trailing whitespace detected in file or folder name."
      ),
      severity: Severity.Warning
    };
  }
  return null;
}
__name(validateFileName, "validateFileName");
function trimLongName(name) {
  if (name?.length > 255) {
    return `${name.substr(0, 255)}...`;
  }
  return name;
}
__name(trimLongName, "trimLongName");
function getWellFormedFileName(filename) {
  if (!filename) {
    return filename;
  }
  filename = trim(filename, "	");
  filename = rtrim(filename, "/");
  filename = rtrim(filename, "\\");
  return filename;
}
__name(getWellFormedFileName, "getWellFormedFileName");
class CompareNewUntitledTextFilesAction extends Action2 {
  static {
    __name(this, "CompareNewUntitledTextFilesAction");
  }
  static ID = "workbench.files.action.compareNewUntitledTextFiles";
  static LABEL = nls.localize2(
    "compareNewUntitledTextFiles",
    "Compare New Untitled Text Files"
  );
  constructor() {
    super({
      id: CompareNewUntitledTextFilesAction.ID,
      title: CompareNewUntitledTextFilesAction.LABEL,
      f1: true,
      category: Categories.File,
      metadata: {
        description: nls.localize2(
          "compareNewUntitledTextFilesMeta",
          "Opens a new diff editor with two untitled files."
        )
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      original: { resource: void 0 },
      modified: { resource: void 0 },
      options: { pinned: true }
    });
  }
}
class CompareWithClipboardAction extends Action2 {
  static {
    __name(this, "CompareWithClipboardAction");
  }
  static ID = "workbench.files.action.compareWithClipboard";
  static LABEL = nls.localize2(
    "compareWithClipboard",
    "Compare Active File with Clipboard"
  );
  registrationDisposal;
  static SCHEME_COUNTER = 0;
  constructor() {
    super({
      id: CompareWithClipboardAction.ID,
      title: CompareWithClipboardAction.LABEL,
      f1: true,
      category: Categories.File,
      keybinding: {
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyC),
        weight: KeybindingWeight.WorkbenchContrib
      },
      metadata: {
        description: nls.localize2(
          "compareWithClipboardMeta",
          "Opens a new diff editor to compare the active file with the contents of the clipboard."
        )
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    const textModelService = accessor.get(ITextModelService);
    const fileService = accessor.get(IFileService);
    const resource = EditorResourceAccessor.getOriginalUri(
      editorService.activeEditor,
      { supportSideBySide: SideBySideEditor.PRIMARY }
    );
    const scheme = `clipboardCompare${CompareWithClipboardAction.SCHEME_COUNTER++}`;
    if (resource && (fileService.hasProvider(resource) || resource.scheme === Schemas.untitled)) {
      if (!this.registrationDisposal) {
        const provider = instantiationService.createInstance(
          ClipboardContentProvider
        );
        this.registrationDisposal = textModelService.registerTextModelContentProvider(
          scheme,
          provider
        );
      }
      const name = resources.basename(resource);
      const editorLabel = nls.localize(
        "clipboardComparisonLabel",
        "Clipboard \u2194 {0}",
        name
      );
      await editorService.openEditor({
        original: { resource: resource.with({ scheme }) },
        modified: { resource },
        label: editorLabel,
        options: { pinned: true }
      }).finally(() => {
        dispose(this.registrationDisposal);
        this.registrationDisposal = void 0;
      });
    }
  }
  dispose() {
    dispose(this.registrationDisposal);
    this.registrationDisposal = void 0;
  }
}
let ClipboardContentProvider = class {
  constructor(clipboardService, languageService, modelService) {
    this.clipboardService = clipboardService;
    this.languageService = languageService;
    this.modelService = modelService;
  }
  static {
    __name(this, "ClipboardContentProvider");
  }
  async provideTextContent(resource) {
    const text = await this.clipboardService.readText();
    const model = this.modelService.createModel(
      text,
      this.languageService.createByFilepathOrFirstLine(resource),
      resource
    );
    return model;
  }
};
ClipboardContentProvider = __decorateClass([
  __decorateParam(0, IClipboardService),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService)
], ClipboardContentProvider);
function onErrorWithRetry(notificationService, error, retry) {
  notificationService.prompt(Severity.Error, toErrorMessage(error, false), [
    {
      label: nls.localize("retry", "Retry"),
      run: /* @__PURE__ */ __name(() => retry(), "run")
    }
  ]);
}
__name(onErrorWithRetry, "onErrorWithRetry");
async function openExplorerAndCreate(accessor, isFolder) {
  const explorerService = accessor.get(IExplorerService);
  const fileService = accessor.get(IFileService);
  const configService = accessor.get(IConfigurationService);
  const filesConfigService = accessor.get(IFilesConfigurationService);
  const editorService = accessor.get(IEditorService);
  const viewsService = accessor.get(IViewsService);
  const notificationService = accessor.get(INotificationService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const commandService = accessor.get(ICommandService);
  const pathService = accessor.get(IPathService);
  const wasHidden = !viewsService.isViewVisible(VIEW_ID);
  const view = await viewsService.openView(VIEW_ID, true);
  if (wasHidden) {
    await timeout(500);
  }
  if (!view) {
    if (isFolder) {
      throw new Error("Open a folder or workspace first.");
    }
    return commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
  }
  const stats = explorerService.getContext(false);
  const stat = stats.length > 0 ? stats[0] : void 0;
  let folder;
  if (stat) {
    folder = stat.isDirectory ? stat : stat.parent || explorerService.roots[0];
  } else {
    folder = explorerService.roots[0];
  }
  if (folder.isReadonly) {
    throw new Error("Parent folder is readonly.");
  }
  const newStat = new NewExplorerItem(
    fileService,
    configService,
    filesConfigService,
    folder,
    isFolder
  );
  folder.addChild(newStat);
  const onSuccess = /* @__PURE__ */ __name(async (value) => {
    try {
      const resourceToCreate = resources.joinPath(folder.resource, value);
      if (value.endsWith("/")) {
        isFolder = true;
      }
      await explorerService.applyBulkEdit(
        [
          new ResourceFileEdit(void 0, resourceToCreate, {
            folder: isFolder
          })
        ],
        {
          undoLabel: nls.localize(
            "createBulkEdit",
            "Create {0}",
            value
          ),
          progressLabel: nls.localize(
            "creatingBulkEdit",
            "Creating {0}",
            value
          ),
          confirmBeforeUndo: true
        }
      );
      await refreshIfSeparator(value, explorerService);
      if (isFolder) {
        await explorerService.select(resourceToCreate, true);
      } else {
        await editorService.openEditor({
          resource: resourceToCreate,
          options: { pinned: true }
        });
      }
    } catch (error) {
      onErrorWithRetry(
        notificationService,
        error,
        () => onSuccess(value)
      );
    }
  }, "onSuccess");
  const os = (await remoteAgentService.getEnvironment())?.os ?? OS;
  await explorerService.setEditable(newStat, {
    validationMessage: /* @__PURE__ */ __name((value) => validateFileName(pathService, newStat, value, os), "validationMessage"),
    onFinish: /* @__PURE__ */ __name(async (value, success) => {
      folder.removeChild(newStat);
      await explorerService.setEditable(newStat, null);
      if (success) {
        onSuccess(value);
      }
    }, "onFinish")
  });
}
__name(openExplorerAndCreate, "openExplorerAndCreate");
CommandsRegistry.registerCommand({
  id: NEW_FILE_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    await openExplorerAndCreate(accessor, false);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: NEW_FOLDER_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    await openExplorerAndCreate(accessor, true);
  }, "handler")
});
const renameHandler = /* @__PURE__ */ __name(async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const notificationService = accessor.get(INotificationService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const pathService = accessor.get(IPathService);
  const configurationService = accessor.get(IConfigurationService);
  const stats = explorerService.getContext(false);
  const stat = stats.length > 0 ? stats[0] : void 0;
  if (!stat) {
    return;
  }
  const os = (await remoteAgentService.getEnvironment())?.os ?? OS;
  await explorerService.setEditable(stat, {
    validationMessage: /* @__PURE__ */ __name((value) => validateFileName(pathService, stat, value, os), "validationMessage"),
    onFinish: /* @__PURE__ */ __name(async (value, success) => {
      if (success) {
        const parentResource = stat.parent.resource;
        const targetResource = resources.joinPath(
          parentResource,
          value
        );
        if (stat.resource.toString() !== targetResource.toString()) {
          try {
            await explorerService.applyBulkEdit(
              [
                new ResourceFileEdit(
                  stat.resource,
                  targetResource
                )
              ],
              {
                confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === UndoConfirmLevel.Verbose,
                undoLabel: nls.localize(
                  "renameBulkEdit",
                  "Rename {0} to {1}",
                  stat.name,
                  value
                ),
                progressLabel: nls.localize(
                  "renamingBulkEdit",
                  "Renaming {0} to {1}",
                  stat.name,
                  value
                )
              }
            );
            await refreshIfSeparator(value, explorerService);
          } catch (e) {
            notificationService.error(e);
          }
        }
      }
      await explorerService.setEditable(stat, null);
    }, "onFinish")
  });
}, "renameHandler");
const moveFileToTrashHandler = /* @__PURE__ */ __name(async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true).filter((s) => !s.isRoot);
  if (stats.length) {
    await deleteFiles(
      accessor.get(IExplorerService),
      accessor.get(IWorkingCopyFileService),
      accessor.get(IDialogService),
      accessor.get(IConfigurationService),
      stats,
      true
    );
  }
}, "moveFileToTrashHandler");
const deleteFileHandler = /* @__PURE__ */ __name(async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true).filter((s) => !s.isRoot);
  if (stats.length) {
    await deleteFiles(
      accessor.get(IExplorerService),
      accessor.get(IWorkingCopyFileService),
      accessor.get(IDialogService),
      accessor.get(IConfigurationService),
      stats,
      false
    );
  }
}, "deleteFileHandler");
let pasteShouldMove = false;
const copyFileHandler = /* @__PURE__ */ __name(async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true);
  if (stats.length > 0) {
    await explorerService.setToCopy(stats, false);
    pasteShouldMove = false;
  }
}, "copyFileHandler");
const cutFileHandler = /* @__PURE__ */ __name(async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true);
  if (stats.length > 0) {
    await explorerService.setToCopy(stats, true);
    pasteShouldMove = true;
  }
}, "cutFileHandler");
const downloadFileHandler = /* @__PURE__ */ __name(async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  const context = explorerService.getContext(true);
  const explorerItems = context.length ? context : explorerService.roots;
  const downloadHandler = instantiationService.createInstance(FileDownload);
  try {
    await downloadHandler.download(explorerItems);
  } catch (error) {
    notificationService.error(error);
    throw error;
  }
}, "downloadFileHandler");
CommandsRegistry.registerCommand({
  id: DOWNLOAD_COMMAND_ID,
  handler: downloadFileHandler
});
const uploadFileHandler = /* @__PURE__ */ __name(async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  const context = explorerService.getContext(false);
  const element = context.length ? context[0] : explorerService.roots[0];
  try {
    const files = await triggerUpload();
    if (files) {
      const browserUpload = instantiationService.createInstance(BrowserFileUpload);
      await browserUpload.upload(element, files);
    }
  } catch (error) {
    notificationService.error(error);
    throw error;
  }
}, "uploadFileHandler");
CommandsRegistry.registerCommand({
  id: UPLOAD_COMMAND_ID,
  handler: uploadFileHandler
});
const pasteFileHandler = /* @__PURE__ */ __name(async (accessor, fileList) => {
  const clipboardService = accessor.get(IClipboardService);
  const explorerService = accessor.get(IExplorerService);
  const fileService = accessor.get(IFileService);
  const notificationService = accessor.get(INotificationService);
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const uriIdentityService = accessor.get(IUriIdentityService);
  const dialogService = accessor.get(IDialogService);
  const hostService = accessor.get(IHostService);
  const context = explorerService.getContext(false);
  const hasNativeFilesToPaste = fileList && fileList.length > 0;
  const confirmPasteNative = hasNativeFilesToPaste && configurationService.getValue("explorer.confirmPasteNative");
  const toPaste = await getFilesToPaste(
    fileList,
    clipboardService,
    hostService
  );
  if (confirmPasteNative && toPaste.files.length >= 1) {
    const message = toPaste.files.length > 1 ? nls.localize(
      "confirmMultiPasteNative",
      "Are you sure you want to paste the following {0} items?",
      toPaste.files.length
    ) : nls.localize(
      "confirmPasteNative",
      "Are you sure you want to paste '{0}'?",
      basename(
        toPaste.type === "paths" ? toPaste.files[0].fsPath : toPaste.files[0].name
      )
    );
    const detail = toPaste.files.length > 1 ? getFileNamesMessage(
      toPaste.files.map((item) => {
        if (URI.isUri(item)) {
          return item.fsPath;
        }
        if (toPaste.type === "paths") {
          const path = hostService.getPathForFile(item);
          if (path) {
            return path;
          }
        }
        return item.name;
      })
    ) : void 0;
    const confirmation = await dialogService.confirm({
      message,
      detail,
      checkbox: {
        label: nls.localize("doNotAskAgain", "Do not ask me again")
      },
      primaryButton: nls.localize(
        { key: "pasteButtonLabel", comment: ["&& denotes a mnemonic"] },
        "&&Paste"
      )
    });
    if (!confirmation.confirmed) {
      return;
    }
    if (confirmation.checkboxChecked === true) {
      await configurationService.updateValue(
        "explorer.confirmPasteNative",
        false
      );
    }
  }
  const element = context.length ? context[0] : explorerService.roots[0];
  const incrementalNaming = configurationService.getValue().explorer.incrementalNaming;
  const editableItem = explorerService.getEditable();
  if (editableItem) {
    return;
  }
  try {
    let targets = [];
    if (toPaste.type === "paths") {
      const sourceTargetPairs = coalesce(
        await Promise.all(
          toPaste.files.map(async (fileToPaste) => {
            if (element.resource.toString() !== fileToPaste.toString() && resources.isEqualOrParent(
              element.resource,
              fileToPaste
            )) {
              throw new Error(
                nls.localize(
                  "fileIsAncestor",
                  "File to paste is an ancestor of the destination folder"
                )
              );
            }
            const fileToPasteStat = await fileService.stat(fileToPaste);
            let target;
            if (uriIdentityService.extUri.isEqual(
              element.resource,
              fileToPaste
            )) {
              target = element.parent;
            } else {
              target = element.isDirectory ? element : element.parent;
            }
            const targetFile = await findValidPasteFileTarget(
              explorerService,
              fileService,
              dialogService,
              target,
              {
                resource: fileToPaste,
                isDirectory: fileToPasteStat.isDirectory,
                allowOverwrite: pasteShouldMove || incrementalNaming === "disabled"
              },
              incrementalNaming
            );
            if (!targetFile) {
              return void 0;
            }
            return { source: fileToPaste, target: targetFile };
          })
        )
      );
      if (sourceTargetPairs.length >= 1) {
        if (pasteShouldMove) {
          const resourceFileEdits = sourceTargetPairs.map(
            (pair) => new ResourceFileEdit(pair.source, pair.target, {
              overwrite: incrementalNaming === "disabled"
            })
          );
          const options = {
            confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === UndoConfirmLevel.Verbose,
            progressLabel: sourceTargetPairs.length > 1 ? nls.localize(
              {
                key: "movingBulkEdit",
                comment: [
                  "Placeholder will be replaced by the number of files being moved"
                ]
              },
              "Moving {0} files",
              sourceTargetPairs.length
            ) : nls.localize(
              {
                key: "movingFileBulkEdit",
                comment: [
                  "Placeholder will be replaced by the name of the file moved."
                ]
              },
              "Moving {0}",
              resources.basenameOrAuthority(
                sourceTargetPairs[0].target
              )
            ),
            undoLabel: sourceTargetPairs.length > 1 ? nls.localize(
              {
                key: "moveBulkEdit",
                comment: [
                  "Placeholder will be replaced by the number of files being moved"
                ]
              },
              "Move {0} files",
              sourceTargetPairs.length
            ) : nls.localize(
              {
                key: "moveFileBulkEdit",
                comment: [
                  "Placeholder will be replaced by the name of the file moved."
                ]
              },
              "Move {0}",
              resources.basenameOrAuthority(
                sourceTargetPairs[0].target
              )
            )
          };
          await explorerService.applyBulkEdit(
            resourceFileEdits,
            options
          );
        } else {
          const resourceFileEdits = sourceTargetPairs.map(
            (pair) => new ResourceFileEdit(pair.source, pair.target, {
              copy: true,
              overwrite: incrementalNaming === "disabled"
            })
          );
          await applyCopyResourceEdit(
            sourceTargetPairs.map((pair) => pair.target),
            resourceFileEdits
          );
        }
      }
      targets = sourceTargetPairs.map((pair) => pair.target);
    } else {
      const targetAndEdits = coalesce(
        await Promise.all(
          toPaste.files.map(async (file) => {
            const target = element.isDirectory ? element : element.parent;
            const targetFile = await findValidPasteFileTarget(
              explorerService,
              fileService,
              dialogService,
              target,
              {
                resource: file.name,
                isDirectory: false,
                allowOverwrite: pasteShouldMove || incrementalNaming === "disabled"
              },
              incrementalNaming
            );
            if (!targetFile) {
              return;
            }
            return {
              target: targetFile,
              edit: new ResourceFileEdit(void 0, targetFile, {
                overwrite: incrementalNaming === "disabled",
                contents: (async () => VSBuffer.wrap(
                  new Uint8Array(
                    await file.arrayBuffer()
                  )
                ))()
              })
            };
          })
        )
      );
      await applyCopyResourceEdit(
        targetAndEdits.map((pair) => pair.target),
        targetAndEdits.map((pair) => pair.edit)
      );
      targets = targetAndEdits.map((pair) => pair.target);
    }
    if (targets.length) {
      const firstTarget = targets[0];
      await explorerService.select(firstTarget);
      if (targets.length === 1) {
        const item = explorerService.findClosest(firstTarget);
        if (item && !item.isDirectory) {
          await editorService.openEditor({
            resource: item.resource,
            options: { pinned: true, preserveFocus: true }
          });
        }
      }
    }
  } catch (e) {
    onError(
      notificationService,
      new Error(
        nls.localize(
          "fileDeleted",
          "The file(s) to paste have been deleted or moved since you copied them. {0}",
          getErrorMessage(e)
        )
      )
    );
  } finally {
    if (pasteShouldMove) {
      await explorerService.setToCopy([], false);
      pasteShouldMove = false;
    }
  }
  async function applyCopyResourceEdit(targets, resourceFileEdits) {
    const undoLevel = configurationService.getValue().explorer.confirmUndo;
    const options = {
      confirmBeforeUndo: undoLevel === UndoConfirmLevel.Default || undoLevel === UndoConfirmLevel.Verbose,
      progressLabel: targets.length > 1 ? nls.localize(
        {
          key: "copyingBulkEdit",
          comment: [
            "Placeholder will be replaced by the number of files being copied"
          ]
        },
        "Copying {0} files",
        targets.length
      ) : nls.localize(
        {
          key: "copyingFileBulkEdit",
          comment: [
            "Placeholder will be replaced by the name of the file copied."
          ]
        },
        "Copying {0}",
        resources.basenameOrAuthority(targets[0])
      ),
      undoLabel: targets.length > 1 ? nls.localize(
        {
          key: "copyBulkEdit",
          comment: [
            "Placeholder will be replaced by the number of files being copied"
          ]
        },
        "Paste {0} files",
        targets.length
      ) : nls.localize(
        {
          key: "copyFileBulkEdit",
          comment: [
            "Placeholder will be replaced by the name of the file copied."
          ]
        },
        "Paste {0}",
        resources.basenameOrAuthority(targets[0])
      )
    };
    await explorerService.applyBulkEdit(resourceFileEdits, options);
  }
  __name(applyCopyResourceEdit, "applyCopyResourceEdit");
}, "pasteFileHandler");
async function getFilesToPaste(fileList, clipboardService, hostService) {
  if (fileList && fileList.length > 0) {
    const resources2 = [...fileList].map((file) => hostService.getPathForFile(file)).filter((filePath) => !!filePath && isAbsolute(filePath)).map((filePath) => URI.file(filePath));
    if (resources2.length) {
      return { type: "paths", files: resources2 };
    }
    return {
      type: "data",
      files: [...fileList].filter(
        (file) => !hostService.getPathForFile(file)
      )
    };
  } else {
    return {
      type: "paths",
      files: resources.distinctParents(
        await clipboardService.readResources(),
        (resource) => resource
      )
    };
  }
}
__name(getFilesToPaste, "getFilesToPaste");
const openFilePreserveFocusHandler = /* @__PURE__ */ __name(async (accessor) => {
  const editorService = accessor.get(IEditorService);
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true);
  await editorService.openEditors(
    stats.filter((s) => !s.isDirectory).map((s) => ({
      resource: s.resource,
      options: { preserveFocus: true }
    }))
  );
}, "openFilePreserveFocusHandler");
class BaseSetActiveEditorReadonlyInSession extends Action2 {
  constructor(id, title, newReadonlyState) {
    super({
      id,
      title,
      f1: true,
      category: Categories.File,
      precondition: ActiveEditorCanToggleReadonlyContext
    });
    this.newReadonlyState = newReadonlyState;
  }
  static {
    __name(this, "BaseSetActiveEditorReadonlyInSession");
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const filesConfigurationService = accessor.get(
      IFilesConfigurationService
    );
    const fileResource = EditorResourceAccessor.getOriginalUri(
      editorService.activeEditor,
      { supportSideBySide: SideBySideEditor.PRIMARY }
    );
    if (!fileResource) {
      return;
    }
    await filesConfigurationService.updateReadonly(
      fileResource,
      this.newReadonlyState
    );
  }
}
class SetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    __name(this, "SetActiveEditorReadonlyInSession");
  }
  static ID = "workbench.action.files.setActiveEditorReadonlyInSession";
  static LABEL = nls.localize2(
    "setActiveEditorReadonlyInSession",
    "Set Active Editor Read-only in Session"
  );
  constructor() {
    super(
      SetActiveEditorReadonlyInSession.ID,
      SetActiveEditorReadonlyInSession.LABEL,
      true
    );
  }
}
class SetActiveEditorWriteableInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    __name(this, "SetActiveEditorWriteableInSession");
  }
  static ID = "workbench.action.files.setActiveEditorWriteableInSession";
  static LABEL = nls.localize2(
    "setActiveEditorWriteableInSession",
    "Set Active Editor Writeable in Session"
  );
  constructor() {
    super(
      SetActiveEditorWriteableInSession.ID,
      SetActiveEditorWriteableInSession.LABEL,
      false
    );
  }
}
class ToggleActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    __name(this, "ToggleActiveEditorReadonlyInSession");
  }
  static ID = "workbench.action.files.toggleActiveEditorReadonlyInSession";
  static LABEL = nls.localize2(
    "toggleActiveEditorReadonlyInSession",
    "Toggle Active Editor Read-only in Session"
  );
  constructor() {
    super(
      ToggleActiveEditorReadonlyInSession.ID,
      ToggleActiveEditorReadonlyInSession.LABEL,
      "toggle"
    );
  }
}
class ResetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    __name(this, "ResetActiveEditorReadonlyInSession");
  }
  static ID = "workbench.action.files.resetActiveEditorReadonlyInSession";
  static LABEL = nls.localize2(
    "resetActiveEditorReadonlyInSession",
    "Reset Active Editor Read-only in Session"
  );
  constructor() {
    super(
      ResetActiveEditorReadonlyInSession.ID,
      ResetActiveEditorReadonlyInSession.LABEL,
      "reset"
    );
  }
}
export {
  COPY_FILE_LABEL,
  CloseGroupAction,
  CompareNewUntitledTextFilesAction,
  CompareWithClipboardAction,
  DOWNLOAD_COMMAND_ID,
  DOWNLOAD_LABEL,
  FileCopiedContext,
  FocusFilesExplorer,
  GlobalCompareResourcesAction,
  MOVE_FILE_TO_TRASH_LABEL,
  NEW_FILE_COMMAND_ID,
  NEW_FILE_LABEL,
  NEW_FOLDER_COMMAND_ID,
  NEW_FOLDER_LABEL,
  OpenActiveFileInEmptyWorkspace,
  PASTE_FILE_LABEL,
  ResetActiveEditorReadonlyInSession,
  SaveAllInGroupAction,
  SetActiveEditorReadonlyInSession,
  SetActiveEditorWriteableInSession,
  ShowActiveFileInExplorer,
  TRIGGER_RENAME_LABEL,
  ToggleActiveEditorReadonlyInSession,
  ToggleAutoSaveAction,
  UPLOAD_COMMAND_ID,
  UPLOAD_LABEL,
  copyFileHandler,
  cutFileHandler,
  deleteFileHandler,
  findValidPasteFileTarget,
  incrementFileName,
  moveFileToTrashHandler,
  openFilePreserveFocusHandler,
  pasteFileHandler,
  renameHandler,
  validateFileName
};
//# sourceMappingURL=fileActions.js.map
