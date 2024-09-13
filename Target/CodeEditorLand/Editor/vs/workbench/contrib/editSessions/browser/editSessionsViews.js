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
import { Codicon } from "../../../../base/common/codicons.js";
import { fromNow } from "../../../../base/common/date.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/path.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { API_OPEN_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import {
  TreeView,
  TreeViewPane
} from "../../../browser/parts/views/treeView.js";
import {
  Extensions,
  TreeItemCollapsibleState
} from "../../../common/views.js";
import {
  ChangeType,
  EDIT_SESSIONS_DATA_VIEW_ID,
  EDIT_SESSIONS_SCHEME,
  EDIT_SESSIONS_SHOW_VIEW,
  EDIT_SESSIONS_TITLE,
  IEditSessionsStorageService
} from "../common/editSessions.js";
const EDIT_SESSIONS_COUNT_KEY = "editSessionsCount";
const EDIT_SESSIONS_COUNT_CONTEXT_KEY = new RawContextKey(
  EDIT_SESSIONS_COUNT_KEY,
  0
);
let EditSessionsDataViews = class extends Disposable {
  constructor(container, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.registerViews(container);
  }
  static {
    __name(this, "EditSessionsDataViews");
  }
  registerViews(container) {
    const viewId = EDIT_SESSIONS_DATA_VIEW_ID;
    const treeView = this.instantiationService.createInstance(
      TreeView,
      viewId,
      EDIT_SESSIONS_TITLE.value
    );
    treeView.showCollapseAllAction = true;
    treeView.showRefreshAction = true;
    treeView.dataProvider = this.instantiationService.createInstance(
      EditSessionDataViewDataProvider
    );
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    viewsRegistry.registerViews(
      [
        {
          id: viewId,
          name: EDIT_SESSIONS_TITLE,
          ctorDescriptor: new SyncDescriptor(TreeViewPane),
          canToggleVisibility: true,
          canMoveView: false,
          treeView,
          collapsed: false,
          when: ContextKeyExpr.and(EDIT_SESSIONS_SHOW_VIEW),
          order: 100,
          hideByDefault: true
        }
      ],
      container
    );
    viewsRegistry.registerViewWelcomeContent(viewId, {
      content: localize(
        "noStoredChanges",
        "You have no stored changes in the cloud to display.\n{0}",
        `[${localize("storeWorkingChangesTitle", "Store Working Changes")}](command:workbench.editSessions.actions.store)`
      ),
      when: ContextKeyExpr.equals(EDIT_SESSIONS_COUNT_KEY, 0),
      order: 1
    });
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.editSessions.actions.resume",
              title: localize(
                "workbench.editSessions.actions.resume.v2",
                "Resume Working Changes"
              ),
              icon: Codicon.desktopDownload,
              menu: {
                id: MenuId.ViewItemContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", viewId),
                  ContextKeyExpr.regex(
                    "viewItem",
                    /edit-session/i
                  )
                ),
                group: "inline"
              }
            });
          }
          async run(accessor, handle) {
            const editSessionId = URI.parse(
              handle.$treeItemHandle
            ).path.substring(1);
            const commandService = accessor.get(ICommandService);
            await commandService.executeCommand(
              "workbench.editSessions.actions.resumeLatest",
              editSessionId,
              true
            );
            await treeView.refresh();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.editSessions.actions.store",
              title: localize(
                "workbench.editSessions.actions.store.v2",
                "Store Working Changes"
              ),
              icon: Codicon.cloudUpload
            });
          }
          async run(accessor, handle) {
            const commandService = accessor.get(ICommandService);
            await commandService.executeCommand(
              "workbench.editSessions.actions.storeCurrent"
            );
            await treeView.refresh();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.editSessions.actions.delete",
              title: localize(
                "workbench.editSessions.actions.delete.v2",
                "Delete Working Changes"
              ),
              icon: Codicon.trash,
              menu: {
                id: MenuId.ViewItemContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", viewId),
                  ContextKeyExpr.regex(
                    "viewItem",
                    /edit-session/i
                  )
                ),
                group: "inline"
              }
            });
          }
          async run(accessor, handle) {
            const editSessionId = URI.parse(
              handle.$treeItemHandle
            ).path.substring(1);
            const dialogService = accessor.get(IDialogService);
            const editSessionStorageService = accessor.get(
              IEditSessionsStorageService
            );
            const result = await dialogService.confirm({
              message: localize(
                "confirm delete.v2",
                "Are you sure you want to permanently delete your working changes with ref {0}?",
                editSessionId
              ),
              detail: localize(
                "confirm delete detail.v2",
                " You cannot undo this action."
              ),
              type: "warning",
              title: EDIT_SESSIONS_TITLE.value
            });
            if (result.confirmed) {
              await editSessionStorageService.delete(
                "editSessions",
                editSessionId
              );
              await treeView.refresh();
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.editSessions.actions.deleteAll",
              title: localize(
                "workbench.editSessions.actions.deleteAll",
                "Delete All Working Changes from Cloud"
              ),
              icon: Codicon.trash,
              menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", viewId),
                  ContextKeyExpr.greater(
                    EDIT_SESSIONS_COUNT_KEY,
                    0
                  )
                )
              }
            });
          }
          async run(accessor) {
            const dialogService = accessor.get(IDialogService);
            const editSessionStorageService = accessor.get(
              IEditSessionsStorageService
            );
            const result = await dialogService.confirm({
              message: localize(
                "confirm delete all",
                "Are you sure you want to permanently delete all stored changes from the cloud?"
              ),
              detail: localize(
                "confirm delete all detail",
                " You cannot undo this action."
              ),
              type: "warning",
              title: EDIT_SESSIONS_TITLE.value
            });
            if (result.confirmed) {
              await editSessionStorageService.delete(
                "editSessions",
                null
              );
              await treeView.refresh();
            }
          }
        }
      )
    );
  }
};
EditSessionsDataViews = __decorateClass([
  __decorateParam(1, IInstantiationService)
], EditSessionsDataViews);
let EditSessionDataViewDataProvider = class {
  constructor(editSessionsStorageService, contextKeyService, workspaceContextService, fileService) {
    this.editSessionsStorageService = editSessionsStorageService;
    this.contextKeyService = contextKeyService;
    this.workspaceContextService = workspaceContextService;
    this.fileService = fileService;
    this.editSessionsCount = EDIT_SESSIONS_COUNT_CONTEXT_KEY.bindTo(this.contextKeyService);
  }
  static {
    __name(this, "EditSessionDataViewDataProvider");
  }
  editSessionsCount;
  async getChildren(element) {
    if (!element) {
      return this.getAllEditSessions();
    }
    const [ref, folderName, filePath] = URI.parse(element.handle).path.substring(1).split("/");
    if (ref && !folderName) {
      return this.getEditSession(ref);
    } else if (ref && folderName && !filePath) {
      return this.getEditSessionFolderContents(ref, folderName);
    }
    return [];
  }
  async getAllEditSessions() {
    const allEditSessions = await this.editSessionsStorageService.list("editSessions");
    this.editSessionsCount.set(allEditSessions.length);
    const editSessions = [];
    for (const session of allEditSessions) {
      const resource = URI.from({
        scheme: EDIT_SESSIONS_SCHEME,
        authority: "remote-session-content",
        path: `/${session.ref}`
      });
      const sessionData = await this.editSessionsStorageService.read(
        "editSessions",
        session.ref
      );
      if (!sessionData) {
        continue;
      }
      const content = JSON.parse(sessionData.content);
      const label = content.folders.map((folder) => folder.name).join(", ") ?? session.ref;
      const machineId = content.machine;
      const machineName = machineId ? await this.editSessionsStorageService.getMachineById(
        machineId
      ) : void 0;
      const description = machineName === void 0 ? fromNow(session.created, true) : `${fromNow(session.created, true)}\xA0\xA0\u2022\xA0\xA0${machineName}`;
      editSessions.push({
        handle: resource.toString(),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        label: { label },
        description,
        themeIcon: Codicon.repo,
        contextValue: `edit-session`
      });
    }
    return editSessions;
  }
  async getEditSession(ref) {
    const data = await this.editSessionsStorageService.read(
      "editSessions",
      ref
    );
    if (!data) {
      return [];
    }
    const content = JSON.parse(data.content);
    if (content.folders.length === 1) {
      const folder = content.folders[0];
      return this.getEditSessionFolderContents(ref, folder.name);
    }
    return content.folders.map((folder) => {
      const resource = URI.from({
        scheme: EDIT_SESSIONS_SCHEME,
        authority: "remote-session-content",
        path: `/${data.ref}/${folder.name}`
      });
      return {
        handle: resource.toString(),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        label: { label: folder.name },
        themeIcon: Codicon.folder
      };
    });
  }
  async getEditSessionFolderContents(ref, folderName) {
    const data = await this.editSessionsStorageService.read(
      "editSessions",
      ref
    );
    if (!data) {
      return [];
    }
    const content = JSON.parse(data.content);
    const currentWorkspaceFolder = this.workspaceContextService.getWorkspace().folders.find((folder) => folder.name === folderName);
    const editSessionFolder = content.folders.find(
      (folder) => folder.name === folderName
    );
    if (!editSessionFolder) {
      return [];
    }
    return Promise.all(
      editSessionFolder.workingChanges.map(async (change) => {
        const cloudChangeUri = URI.from({
          scheme: EDIT_SESSIONS_SCHEME,
          authority: "remote-session-content",
          path: `/${data.ref}/${folderName}/${change.relativeFilePath}`
        });
        if (currentWorkspaceFolder?.uri) {
          const localCopy = joinPath(
            currentWorkspaceFolder.uri,
            change.relativeFilePath
          );
          if (change.type === ChangeType.Addition && await this.fileService.exists(localCopy)) {
            return {
              handle: cloudChangeUri.toString(),
              resourceUri: cloudChangeUri,
              collapsibleState: TreeItemCollapsibleState.None,
              label: { label: change.relativeFilePath },
              themeIcon: Codicon.file,
              command: {
                id: "vscode.diff",
                title: localize(
                  "compare changes",
                  "Compare Changes"
                ),
                arguments: [
                  localCopy,
                  cloudChangeUri,
                  `${basename(change.relativeFilePath)} (${localize("local copy", "Local Copy")} \u2194 ${localize("cloud changes", "Cloud Changes")})`,
                  void 0
                ]
              }
            };
          }
        }
        return {
          handle: cloudChangeUri.toString(),
          resourceUri: cloudChangeUri,
          collapsibleState: TreeItemCollapsibleState.None,
          label: { label: change.relativeFilePath },
          themeIcon: Codicon.file,
          command: {
            id: API_OPEN_EDITOR_COMMAND_ID,
            title: localize("open file", "Open File"),
            arguments: [cloudChangeUri, void 0, void 0]
          }
        };
      })
    );
  }
};
EditSessionDataViewDataProvider = __decorateClass([
  __decorateParam(0, IEditSessionsStorageService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IFileService)
], EditSessionDataViewDataProvider);
export {
  EditSessionsDataViews
};
//# sourceMappingURL=editSessionsViews.js.map
