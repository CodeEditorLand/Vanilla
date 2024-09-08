import { CancellationToken } from "../../../base/common/cancellation.js";
import { mnemonicButtonLabel } from "../../../base/common/labels.js";
import { Schemas } from "../../../base/common/network.js";
import { dirname } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { localize, localize2 } from "../../../nls.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../platform/commands/common/commands.js";
import {
  IFileDialogService
} from "../../../platform/dialogs/common/dialogs.js";
import { FileKind } from "../../../platform/files/common/files.js";
import { ILabelService } from "../../../platform/label/common/label.js";
import {
  IQuickInputService
} from "../../../platform/quickinput/common/quickInput.js";
import {
  hasWorkspaceFileExtension,
  IWorkspaceContextService
} from "../../../platform/workspace/common/workspace.js";
import {
  IWorkspacesService
} from "../../../platform/workspaces/common/workspaces.js";
import { IPathService } from "../../services/path/common/pathService.js";
import { IWorkspaceEditingService } from "../../services/workspaces/common/workspaceEditing.js";
const ADD_ROOT_FOLDER_COMMAND_ID = "addRootFolder";
const ADD_ROOT_FOLDER_LABEL = localize2(
  "addFolderToWorkspace",
  "Add Folder to Workspace..."
);
const SET_ROOT_FOLDER_COMMAND_ID = "setRootFolder";
const PICK_WORKSPACE_FOLDER_COMMAND_ID = "_workbench.pickWorkspaceFolder";
CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFileFolderInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickFileFolderAndOpen({ forceNewWindow: true })
});
CommandsRegistry.registerCommand({
  id: "_files.pickFolderAndOpen",
  handler: (accessor, options) => accessor.get(IFileDialogService).pickFolderAndOpen(options)
});
CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFolderInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickFolderAndOpen({ forceNewWindow: true })
});
CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFileInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickFileAndOpen({ forceNewWindow: true })
});
CommandsRegistry.registerCommand({
  id: "workbench.action.openWorkspaceInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickWorkspaceAndOpen({ forceNewWindow: true })
});
CommandsRegistry.registerCommand({
  id: ADD_ROOT_FOLDER_COMMAND_ID,
  handler: async (accessor) => {
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const folders = await selectWorkspaceFolders(accessor);
    if (!folders || !folders.length) {
      return;
    }
    await workspaceEditingService.addFolders(
      folders.map((folder) => ({ uri: folder }))
    );
  }
});
CommandsRegistry.registerCommand({
  id: SET_ROOT_FOLDER_COMMAND_ID,
  handler: async (accessor) => {
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const contextService = accessor.get(IWorkspaceContextService);
    const folders = await selectWorkspaceFolders(accessor);
    if (!folders || !folders.length) {
      return;
    }
    await workspaceEditingService.updateFolders(
      0,
      contextService.getWorkspace().folders.length,
      folders.map((folder) => ({ uri: folder }))
    );
  }
});
async function selectWorkspaceFolders(accessor) {
  const dialogsService = accessor.get(IFileDialogService);
  const pathService = accessor.get(IPathService);
  const folders = await dialogsService.showOpenDialog({
    openLabel: mnemonicButtonLabel(
      localize(
        { key: "add", comment: ["&& denotes a mnemonic"] },
        "&&Add"
      )
    ),
    title: localize("addFolderToWorkspaceTitle", "Add Folder to Workspace"),
    canSelectFolders: true,
    canSelectMany: true,
    defaultUri: await dialogsService.defaultFolderPath(),
    availableFileSystems: [pathService.defaultUriScheme]
  });
  return folders;
}
CommandsRegistry.registerCommand(
  PICK_WORKSPACE_FOLDER_COMMAND_ID,
  async (accessor, args) => {
    const quickInputService = accessor.get(IQuickInputService);
    const labelService = accessor.get(ILabelService);
    const contextService = accessor.get(IWorkspaceContextService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const folders = contextService.getWorkspace().folders;
    if (!folders.length) {
      return;
    }
    const folderPicks = folders.map((folder) => {
      const label = folder.name;
      const description = labelService.getUriLabel(dirname(folder.uri), {
        relative: true
      });
      return {
        label,
        description: description !== label ? description : void 0,
        // https://github.com/microsoft/vscode/issues/183418
        folder,
        iconClasses: getIconClasses(
          modelService,
          languageService,
          folder.uri,
          FileKind.ROOT_FOLDER
        )
      };
    });
    const options = (args ? args[0] : void 0) || /* @__PURE__ */ Object.create(null);
    if (!options.activeItem) {
      options.activeItem = folderPicks[0];
    }
    if (!options.placeHolder) {
      options.placeHolder = localize(
        "workspaceFolderPickerPlaceholder",
        "Select workspace folder"
      );
    }
    if (typeof options.matchOnDescription !== "boolean") {
      options.matchOnDescription = true;
    }
    const token = (args ? args[1] : void 0) || CancellationToken.None;
    const pick = await quickInputService.pick(folderPicks, options, token);
    if (pick) {
      return folders[folderPicks.indexOf(pick)];
    }
    return;
  }
);
CommandsRegistry.registerCommand({
  id: "vscode.openFolder",
  handler: (accessor, uriComponents, arg) => {
    const commandService = accessor.get(ICommandService);
    if (typeof arg === "boolean") {
      arg = { forceNewWindow: arg };
    }
    if (!uriComponents) {
      const options2 = {
        forceNewWindow: arg?.forceNewWindow
      };
      if (arg?.forceLocalWindow) {
        options2.remoteAuthority = null;
        options2.availableFileSystems = ["file"];
      }
      return commandService.executeCommand(
        "_files.pickFolderAndOpen",
        options2
      );
    }
    const uri = URI.from(uriComponents, true);
    const options = {
      forceNewWindow: arg?.forceNewWindow,
      forceReuseWindow: arg?.forceReuseWindow,
      noRecentEntry: arg?.noRecentEntry,
      remoteAuthority: arg?.forceLocalWindow ? null : void 0,
      forceProfile: arg?.forceProfile,
      forceTempProfile: arg?.forceTempProfile
    };
    const uriToOpen = hasWorkspaceFileExtension(uri) || uri.scheme === Schemas.untitled ? { workspaceUri: uri } : { folderUri: uri };
    return commandService.executeCommand(
      "_files.windowOpen",
      [uriToOpen],
      options
    );
  },
  metadata: {
    description: "Open a folder or workspace in the current window or new window depending on the newWindow argument. Note that opening in the same window will shutdown the current extension host process and start a new one on the given folder/workspace unless the newWindow parameter is set to true.",
    args: [
      {
        name: "uri",
        description: "(optional) Uri of the folder or workspace file to open. If not provided, a native dialog will ask the user for the folder",
        constraint: (value) => value === void 0 || value === null || value instanceof URI
      },
      {
        name: "options",
        description: "(optional) Options. Object with the following properties: `forceNewWindow`: Whether to open the folder/workspace in a new window or the same. Defaults to opening in the same window. `forceReuseWindow`: Whether to force opening the folder/workspace in the same window.  Defaults to false. `noRecentEntry`: Whether the opened URI will appear in the 'Open Recent' list. Defaults to false. Note, for backward compatibility, options can also be of type boolean, representing the `forceNewWindow` setting.",
        constraint: (value) => value === void 0 || typeof value === "object" || typeof value === "boolean"
      }
    ]
  }
});
CommandsRegistry.registerCommand({
  id: "vscode.newWindow",
  handler: (accessor, options) => {
    const commandService = accessor.get(ICommandService);
    const commandOptions = {
      forceReuseWindow: options && options.reuseWindow,
      remoteAuthority: options && options.remoteAuthority
    };
    return commandService.executeCommand(
      "_files.newWindow",
      commandOptions
    );
  },
  metadata: {
    description: "Opens an new window depending on the newWindow argument.",
    args: [
      {
        name: "options",
        description: "(optional) Options. Object with the following properties: `reuseWindow`: Whether to open a new window or the same. Defaults to opening in a new window. ",
        constraint: (value) => value === void 0 || typeof value === "object"
      }
    ]
  }
});
CommandsRegistry.registerCommand(
  "_workbench.removeFromRecentlyOpened",
  (accessor, uri) => {
    const workspacesService = accessor.get(IWorkspacesService);
    return workspacesService.removeRecentlyOpened([uri]);
  }
);
CommandsRegistry.registerCommand({
  id: "vscode.removeFromRecentlyOpened",
  handler: (accessor, path) => {
    const workspacesService = accessor.get(IWorkspacesService);
    if (typeof path === "string") {
      path = path.match(/^[^:/?#]+:\/\//) ? URI.parse(path) : URI.file(path);
    } else {
      path = URI.revive(path);
    }
    return workspacesService.removeRecentlyOpened([path]);
  },
  metadata: {
    description: "Removes an entry with the given path from the recently opened list.",
    args: [
      {
        name: "path",
        description: "URI or URI string to remove from recently opened.",
        constraint: (value) => typeof value === "string" || value instanceof URI
      }
    ]
  }
});
CommandsRegistry.registerCommand(
  "_workbench.addToRecentlyOpened",
  async (accessor, recentEntry) => {
    const workspacesService = accessor.get(IWorkspacesService);
    const uri = recentEntry.uri;
    const label = recentEntry.label;
    const remoteAuthority = recentEntry.remoteAuthority;
    let recent;
    if (recentEntry.type === "workspace") {
      const workspace = await workspacesService.getWorkspaceIdentifier(uri);
      recent = { workspace, label, remoteAuthority };
    } else if (recentEntry.type === "folder") {
      recent = { folderUri: uri, label, remoteAuthority };
    } else {
      recent = { fileUri: uri, label, remoteAuthority };
    }
    return workspacesService.addRecentlyOpened([recent]);
  }
);
CommandsRegistry.registerCommand(
  "_workbench.getRecentlyOpened",
  async (accessor) => {
    const workspacesService = accessor.get(IWorkspacesService);
    return workspacesService.getRecentlyOpened();
  }
);
export {
  ADD_ROOT_FOLDER_COMMAND_ID,
  ADD_ROOT_FOLDER_LABEL,
  PICK_WORKSPACE_FOLDER_COMMAND_ID,
  SET_ROOT_FOLDER_COMMAND_ID
};
