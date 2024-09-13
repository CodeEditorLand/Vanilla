var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { toAction } from "../../../../base/common/actions.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { hash } from "../../../../base/common/hash.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  dispose
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isWeb, isWindows } from "../../../../base/common/platform.js";
import {
  basename,
  isEqual,
  joinPath
} from "../../../../base/common/resources.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import * as nls from "../../../../nls.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
  EditorOpenSource,
  EditorResolution
} from "../../../../platform/editor/common/editor.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  isWorkspaceToOpen
} from "../../../../platform/window/common/window.js";
import {
  IWorkspaceContextService,
  UNTITLED_WORKSPACE_NAME
} from "../../../../platform/workspace/common/workspace.js";
import { RemoveRootFolderAction } from "../../../browser/actions/workspaceActions.js";
import { resolveCommandsContext } from "../../../browser/parts/editor/editorCommandsContext.js";
import {
  EditorInputCapabilities,
  EditorResourceAccessor,
  EditorsOrder,
  SaveReason,
  SideBySideEditor
} from "../../../common/editor.js";
import { SideBySideEditorInput } from "../../../common/editor/sideBySideEditorInput.js";
import { ViewContainerLocation } from "../../../common/views.js";
import {
  GroupsOrder,
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import {
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IWorkspaceEditingService } from "../../../services/workspaces/common/workspaceEditing.js";
import {
  ExplorerCompressedFirstFocusContext,
  ExplorerCompressedFocusContext,
  ExplorerCompressedLastFocusContext,
  ExplorerFocusCondition,
  ExplorerFolderContext,
  FilesExplorerFocusCondition,
  TextFileContentProvider,
  VIEWLET_ID,
  VIEW_ID
} from "../common/files.js";
import {
  COMPARE_RESOURCE_COMMAND_ID,
  COMPARE_SELECTED_COMMAND_ID,
  COMPARE_WITH_SAVED_COMMAND_ID,
  COPY_PATH_COMMAND_ID,
  COPY_RELATIVE_PATH_COMMAND_ID,
  FIRST_COMPRESSED_FOLDER,
  LAST_COMPRESSED_FOLDER,
  NEW_FILE_COMMAND_ID,
  NEW_UNTITLED_FILE_COMMAND_ID,
  NEW_UNTITLED_FILE_LABEL,
  NEXT_COMPRESSED_FOLDER,
  OPEN_TO_SIDE_COMMAND_ID,
  OPEN_WITH_EXPLORER_COMMAND_ID,
  PREVIOUS_COMPRESSED_FOLDER,
  REMOVE_ROOT_FOLDER_COMMAND_ID,
  REVEAL_IN_EXPLORER_COMMAND_ID,
  REVERT_FILE_COMMAND_ID,
  ResourceSelectedForCompareContext,
  SAVE_ALL_COMMAND_ID,
  SAVE_ALL_IN_GROUP_COMMAND_ID,
  SAVE_FILES_COMMAND_ID,
  SAVE_FILE_AS_COMMAND_ID,
  SAVE_FILE_COMMAND_ID,
  SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID,
  SELECT_FOR_COMPARE_COMMAND_ID
} from "./fileConstants.js";
import {
  IExplorerService,
  getMultiSelectedResources,
  getOpenEditorsViewMultiSelection,
  getResourceForCommand
} from "./files.js";
import { OpenEditorsView } from "./views/openEditorsView.js";
const openWindowCommand = /* @__PURE__ */ __name((accessor, toOpen, options) => {
  if (Array.isArray(toOpen)) {
    const hostService = accessor.get(IHostService);
    const environmentService = accessor.get(IEnvironmentService);
    toOpen = toOpen.map((openable) => {
      if (isWorkspaceToOpen(openable) && openable.workspaceUri.scheme === Schemas.untitled) {
        return {
          workspaceUri: joinPath(
            environmentService.untitledWorkspacesHome,
            openable.workspaceUri.path,
            UNTITLED_WORKSPACE_NAME
          )
        };
      }
      return openable;
    });
    hostService.openWindow(toOpen, options);
  }
}, "openWindowCommand");
const newWindowCommand = /* @__PURE__ */ __name((accessor, options) => {
  const hostService = accessor.get(IHostService);
  hostService.openWindow(options);
}, "newWindowCommand");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: ExplorerFocusCondition,
  primary: KeyMod.CtrlCmd | KeyCode.Enter,
  mac: {
    primary: KeyMod.WinCtrl | KeyCode.Enter
  },
  id: OPEN_TO_SIDE_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const explorerService = accessor.get(IExplorerService);
    const resources = getMultiSelectedResources(
      resource,
      accessor.get(IListService),
      editorService,
      accessor.get(IEditorGroupsService),
      explorerService
    );
    if (resources.length) {
      const untitledResources = resources.filter(
        (resource2) => resource2.scheme === Schemas.untitled
      );
      const fileResources = resources.filter(
        (resource2) => resource2.scheme !== Schemas.untitled
      );
      const items = await Promise.all(
        fileResources.map(async (resource2) => {
          const item = explorerService.findClosest(resource2);
          if (item) {
            return item;
          }
          return await fileService.stat(resource2);
        })
      );
      const files = items.filter((i) => !i.isDirectory);
      const editors = files.map((f) => ({
        resource: f.resource,
        options: { pinned: true }
      })).concat(
        ...untitledResources.map((untitledResource) => ({
          resource: untitledResource,
          options: { pinned: true }
        }))
      );
      await editorService.openEditors(editors, SIDE_GROUP);
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib + 10,
  when: ContextKeyExpr.and(
    FilesExplorerFocusCondition,
    ExplorerFolderContext.toNegated()
  ),
  primary: KeyCode.Enter,
  mac: {
    primary: KeyMod.CtrlCmd | KeyCode.DownArrow
  },
  id: "explorer.openAndPassFocus",
  handler: /* @__PURE__ */ __name(async (accessor, _resource) => {
    const editorService = accessor.get(IEditorService);
    const explorerService = accessor.get(IExplorerService);
    const resources = explorerService.getContext(true);
    if (resources.length) {
      await editorService.openEditors(
        resources.map((r) => ({
          resource: r.resource,
          options: { preserveFocus: false, pinned: true }
        }))
      );
    }
  }, "handler")
});
const COMPARE_WITH_SAVED_SCHEMA = "showModifications";
let providerDisposables = [];
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: COMPARE_WITH_SAVED_COMMAND_ID,
  when: void 0,
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyD),
  handler: /* @__PURE__ */ __name(async (accessor, resource) => {
    const instantiationService = accessor.get(IInstantiationService);
    const textModelService = accessor.get(ITextModelService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const listService = accessor.get(IListService);
    let registerEditorListener = false;
    if (providerDisposables.length === 0) {
      registerEditorListener = true;
      const provider = instantiationService.createInstance(
        TextFileContentProvider
      );
      providerDisposables.push(provider);
      providerDisposables.push(
        textModelService.registerTextModelContentProvider(
          COMPARE_WITH_SAVED_SCHEMA,
          provider
        )
      );
    }
    const uri = getResourceForCommand(resource, editorService, listService);
    if (uri && fileService.hasProvider(uri)) {
      const name = basename(uri);
      const editorLabel = nls.localize(
        "modifiedLabel",
        "{0} (in file) \u2194 {1}",
        name,
        name
      );
      try {
        await TextFileContentProvider.open(
          uri,
          COMPARE_WITH_SAVED_SCHEMA,
          editorLabel,
          editorService,
          { pinned: true }
        );
        if (registerEditorListener) {
          providerDisposables.push(
            editorService.onDidVisibleEditorsChange(() => {
              if (!editorService.editors.some(
                (editor) => !!EditorResourceAccessor.getCanonicalUri(
                  editor,
                  {
                    supportSideBySide: SideBySideEditor.SECONDARY,
                    filterByScheme: COMPARE_WITH_SAVED_SCHEMA
                  }
                )
              )) {
                providerDisposables = dispose(providerDisposables);
              }
            })
          );
        }
      } catch {
        providerDisposables = dispose(providerDisposables);
      }
    }
  }, "handler")
});
let globalResourceToCompare;
let resourceSelectedForCompareContext;
CommandsRegistry.registerCommand({
  id: SELECT_FOR_COMPARE_COMMAND_ID,
  handler: /* @__PURE__ */ __name((accessor, resource) => {
    globalResourceToCompare = getResourceForCommand(
      resource,
      accessor.get(IEditorService),
      accessor.get(IListService)
    );
    if (!resourceSelectedForCompareContext) {
      resourceSelectedForCompareContext = ResourceSelectedForCompareContext.bindTo(
        accessor.get(IContextKeyService)
      );
    }
    resourceSelectedForCompareContext.set(true);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: COMPARE_SELECTED_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const resources = getMultiSelectedResources(
      resource,
      accessor.get(IListService),
      editorService,
      accessor.get(IEditorGroupsService),
      accessor.get(IExplorerService)
    );
    if (resources.length === 2) {
      return editorService.openEditor({
        original: { resource: resources[0] },
        modified: { resource: resources[1] },
        options: { pinned: true }
      });
    }
    return true;
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: COMPARE_RESOURCE_COMMAND_ID,
  handler: /* @__PURE__ */ __name((accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const rightResource = getResourceForCommand(
      resource,
      editorService,
      accessor.get(IListService)
    );
    if (globalResourceToCompare && rightResource) {
      editorService.openEditor({
        original: { resource: globalResourceToCompare },
        modified: { resource: rightResource },
        options: { pinned: true }
      });
    }
  }, "handler")
});
async function resourcesToClipboard(resources, relative, clipboardService, labelService, configurationService) {
  if (resources.length) {
    const lineDelimiter = isWindows ? "\r\n" : "\n";
    let separator;
    if (relative) {
      const relativeSeparator = configurationService.getValue(
        "explorer.copyRelativePathSeparator"
      );
      if (relativeSeparator === "/" || relativeSeparator === "\\") {
        separator = relativeSeparator;
      }
    }
    const text = resources.map(
      (resource) => labelService.getUriLabel(resource, {
        relative,
        noPrefix: true,
        separator
      })
    ).join(lineDelimiter);
    await clipboardService.writeText(text);
  }
}
__name(resourcesToClipboard, "resourcesToClipboard");
const copyPathCommandHandler = /* @__PURE__ */ __name(async (accessor, resource) => {
  const resources = getMultiSelectedResources(
    resource,
    accessor.get(IListService),
    accessor.get(IEditorService),
    accessor.get(IEditorGroupsService),
    accessor.get(IExplorerService)
  );
  await resourcesToClipboard(
    resources,
    false,
    accessor.get(IClipboardService),
    accessor.get(ILabelService),
    accessor.get(IConfigurationService)
  );
}, "copyPathCommandHandler");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: EditorContextKeys.focus.toNegated(),
  primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyC,
  win: {
    primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyC
  },
  id: COPY_PATH_COMMAND_ID,
  handler: copyPathCommandHandler
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: EditorContextKeys.focus,
  primary: KeyChord(
    KeyMod.CtrlCmd | KeyCode.KeyK,
    KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyC
  ),
  win: {
    primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyC
  },
  id: COPY_PATH_COMMAND_ID,
  handler: copyPathCommandHandler
});
const copyRelativePathCommandHandler = /* @__PURE__ */ __name(async (accessor, resource) => {
  const resources = getMultiSelectedResources(
    resource,
    accessor.get(IListService),
    accessor.get(IEditorService),
    accessor.get(IEditorGroupsService),
    accessor.get(IExplorerService)
  );
  await resourcesToClipboard(
    resources,
    true,
    accessor.get(IClipboardService),
    accessor.get(ILabelService),
    accessor.get(IConfigurationService)
  );
}, "copyRelativePathCommandHandler");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: EditorContextKeys.focus.toNegated(),
  primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyMod.Alt | KeyCode.KeyC,
  win: {
    primary: KeyChord(
      KeyMod.CtrlCmd | KeyCode.KeyK,
      KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyC
    )
  },
  id: COPY_RELATIVE_PATH_COMMAND_ID,
  handler: copyRelativePathCommandHandler
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: EditorContextKeys.focus,
  primary: KeyChord(
    KeyMod.CtrlCmd | KeyCode.KeyK,
    KeyMod.CtrlCmd | KeyMod.Shift | KeyMod.Alt | KeyCode.KeyC
  ),
  win: {
    primary: KeyChord(
      KeyMod.CtrlCmd | KeyCode.KeyK,
      KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyC
    )
  },
  id: COPY_RELATIVE_PATH_COMMAND_ID,
  handler: copyRelativePathCommandHandler
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: void 0,
  primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyP),
  id: "workbench.action.files.copyPathOfActiveFile",
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeInput = editorService.activeEditor;
    const resource = EditorResourceAccessor.getOriginalUri(activeInput, {
      supportSideBySide: SideBySideEditor.PRIMARY
    });
    const resources = resource ? [resource] : [];
    await resourcesToClipboard(
      resources,
      false,
      accessor.get(IClipboardService),
      accessor.get(ILabelService),
      accessor.get(IConfigurationService)
    );
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: REVEAL_IN_EXPLORER_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor, resource) => {
    const viewService = accessor.get(IViewsService);
    const contextService = accessor.get(IWorkspaceContextService);
    const explorerService = accessor.get(IExplorerService);
    const editorService = accessor.get(IEditorService);
    const listService = accessor.get(IListService);
    const uri = getResourceForCommand(resource, editorService, listService);
    if (uri && contextService.isInsideWorkspace(uri)) {
      const explorerView = await viewService.openView(
        VIEW_ID,
        false
      );
      if (explorerView) {
        const oldAutoReveal = explorerView.autoReveal;
        explorerView.autoReveal = false;
        explorerView.setExpanded(true);
        await explorerService.select(uri, "force");
        explorerView.focus();
        explorerView.autoReveal = oldAutoReveal;
      }
    } else {
      const openEditorsView = viewService.getViewWithId(
        OpenEditorsView.ID
      );
      if (openEditorsView) {
        openEditorsView.setExpanded(true);
        openEditorsView.focus();
      }
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: OPEN_WITH_EXPLORER_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const listService = accessor.get(IListService);
    const uri = getResourceForCommand(resource, editorService, listService);
    if (uri) {
      return editorService.openEditor({
        resource: uri,
        options: {
          override: EditorResolution.PICK,
          source: EditorOpenSource.USER
        }
      });
    }
    return void 0;
  }, "handler")
});
async function saveSelectedEditors(accessor, options) {
  const editorGroupService = accessor.get(IEditorGroupsService);
  const codeEditorService = accessor.get(ICodeEditorService);
  const textFileService = accessor.get(ITextFileService);
  let editors = getOpenEditorsViewMultiSelection(accessor);
  if (!editors) {
    const activeGroup = editorGroupService.activeGroup;
    if (activeGroup.activeEditor) {
      editors = [];
      if (activeGroup.activeEditor instanceof SideBySideEditorInput && !options?.saveAs && !(activeGroup.activeEditor.primary.hasCapability(
        EditorInputCapabilities.Untitled
      ) || activeGroup.activeEditor.secondary.hasCapability(
        EditorInputCapabilities.Untitled
      )) && activeGroup.activeEditor.secondary.isModified()) {
        editors.push({
          groupId: activeGroup.id,
          editor: activeGroup.activeEditor.primary
        });
        editors.push({
          groupId: activeGroup.id,
          editor: activeGroup.activeEditor.secondary
        });
      } else {
        editors.push({
          groupId: activeGroup.id,
          editor: activeGroup.activeEditor
        });
      }
    }
  }
  if (!editors || editors.length === 0) {
    return;
  }
  await doSaveEditors(accessor, editors, options);
  const focusedCodeEditor = codeEditorService.getFocusedCodeEditor();
  if (focusedCodeEditor instanceof EmbeddedCodeEditorWidget && !focusedCodeEditor.isSimpleWidget) {
    const resource = focusedCodeEditor.getModel()?.uri;
    if (resource && !editors.some(
      ({ editor }) => isEqual(
        EditorResourceAccessor.getCanonicalUri(editor, {
          supportSideBySide: SideBySideEditor.PRIMARY
        }),
        resource
      )
    )) {
      const model = textFileService.files.get(resource);
      if (!model?.isReadonly()) {
        await textFileService.save(resource, options);
      }
    }
  }
}
__name(saveSelectedEditors, "saveSelectedEditors");
function saveDirtyEditorsOfGroups(accessor, groups, options) {
  const dirtyEditors = [];
  for (const group of groups) {
    for (const editor of group.getEditors(
      EditorsOrder.MOST_RECENTLY_ACTIVE
    )) {
      if (editor.isDirty()) {
        dirtyEditors.push({ groupId: group.id, editor });
      }
    }
  }
  return doSaveEditors(accessor, dirtyEditors, options);
}
__name(saveDirtyEditorsOfGroups, "saveDirtyEditorsOfGroups");
async function doSaveEditors(accessor, editors, options) {
  const editorService = accessor.get(IEditorService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  try {
    await editorService.save(editors, options);
  } catch (error) {
    if (!isCancellationError(error)) {
      const actions = [
        toAction({
          id: "workbench.action.files.saveEditors",
          label: nls.localize("retry", "Retry"),
          run: /* @__PURE__ */ __name(() => instantiationService.invokeFunction(
            (accessor2) => doSaveEditors(accessor2, editors, options)
          ), "run")
        })
      ];
      const editorsToRevert = editors.filter(
        ({ editor }) => !editor.hasCapability(
          EditorInputCapabilities.Untitled
        )
      );
      if (editorsToRevert.length > 0) {
        actions.push(
          toAction({
            id: "workbench.action.files.revertEditors",
            label: editorsToRevert.length > 1 ? nls.localize("revertAll", "Revert All") : nls.localize("revert", "Revert"),
            run: /* @__PURE__ */ __name(() => editorService.revert(editorsToRevert), "run")
          })
        );
      }
      notificationService.notify({
        id: editors.map(({ editor }) => hash(editor.resource?.toString())).join(),
        // ensure unique notification ID per set of editor
        severity: Severity.Error,
        message: nls.localize(
          {
            key: "genericSaveError",
            comment: [
              "{0} is the resource that failed to save and {1} the error message"
            ]
          },
          "Failed to save '{0}': {1}",
          editors.map(({ editor }) => editor.getName()).join(", "),
          toErrorMessage(error, false)
        ),
        actions: { primary: actions }
      });
    }
  }
}
__name(doSaveEditors, "doSaveEditors");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  when: void 0,
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyMod.CtrlCmd | KeyCode.KeyS,
  id: SAVE_FILE_COMMAND_ID,
  handler: /* @__PURE__ */ __name((accessor) => {
    return saveSelectedEditors(accessor, {
      reason: SaveReason.EXPLICIT,
      force: true
    });
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  when: void 0,
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyS),
  win: {
    primary: KeyChord(
      KeyMod.CtrlCmd | KeyCode.KeyK,
      KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyS
    )
  },
  id: SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID,
  handler: /* @__PURE__ */ __name((accessor) => {
    return saveSelectedEditors(accessor, {
      reason: SaveReason.EXPLICIT,
      force: true,
      skipSaveParticipants: true
    });
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: SAVE_FILE_AS_COMMAND_ID,
  weight: KeybindingWeight.WorkbenchContrib,
  when: void 0,
  primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyS,
  handler: /* @__PURE__ */ __name((accessor) => {
    return saveSelectedEditors(accessor, {
      reason: SaveReason.EXPLICIT,
      saveAs: true
    });
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  when: void 0,
  weight: KeybindingWeight.WorkbenchContrib,
  primary: void 0,
  mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyS },
  win: { primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyS) },
  id: SAVE_ALL_COMMAND_ID,
  handler: /* @__PURE__ */ __name((accessor) => {
    return saveDirtyEditorsOfGroups(
      accessor,
      accessor.get(IEditorGroupsService).getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE),
      { reason: SaveReason.EXPLICIT }
    );
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SAVE_ALL_IN_GROUP_COMMAND_ID,
  handler: /* @__PURE__ */ __name((accessor, _, editorContext) => {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const resolvedContext = resolveCommandsContext(
      [editorContext],
      accessor.get(IEditorService),
      editorGroupsService,
      accessor.get(IListService)
    );
    let groups;
    if (resolvedContext.groupedEditors.length) {
      groups = resolvedContext.groupedEditors.map(({ group }) => group);
    } else {
      groups = editorGroupsService.getGroups(
        GroupsOrder.MOST_RECENTLY_ACTIVE
      );
    }
    return saveDirtyEditorsOfGroups(accessor, groups, {
      reason: SaveReason.EXPLICIT
    });
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SAVE_FILES_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const editorService = accessor.get(IEditorService);
    const res = await editorService.saveAll({
      includeUntitled: false,
      reason: SaveReason.EXPLICIT
    });
    return res.success;
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: REVERT_FILE_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    let editors = getOpenEditorsViewMultiSelection(accessor);
    if (!editors) {
      const activeGroup = editorGroupService.activeGroup;
      if (activeGroup.activeEditor) {
        editors = [
          {
            groupId: activeGroup.id,
            editor: activeGroup.activeEditor
          }
        ];
      }
    }
    if (!editors || editors.length === 0) {
      return;
    }
    try {
      await editorService.revert(
        editors.filter(
          ({ editor }) => !editor.hasCapability(
            EditorInputCapabilities.Untitled
          )
        ),
        { force: true }
      );
    } catch (error) {
      const notificationService = accessor.get(INotificationService);
      notificationService.error(
        nls.localize(
          "genericRevertError",
          "Failed to revert '{0}': {1}",
          editors.map(({ editor }) => editor.getName()).join(", "),
          toErrorMessage(error, false)
        )
      );
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: REMOVE_ROOT_FOLDER_COMMAND_ID,
  handler: /* @__PURE__ */ __name((accessor, resource) => {
    const contextService = accessor.get(IWorkspaceContextService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const workspace = contextService.getWorkspace();
    const resources = getMultiSelectedResources(
      resource,
      accessor.get(IListService),
      accessor.get(IEditorService),
      accessor.get(IEditorGroupsService),
      accessor.get(IExplorerService)
    ).filter(
      (resource2) => workspace.folders.some(
        (folder) => uriIdentityService.extUri.isEqual(folder.uri, resource2)
      )
      // Need to verify resources are workspaces since multi selection can trigger this command on some non workspace resources
    );
    if (resources.length === 0) {
      const commandService = accessor.get(ICommandService);
      return commandService.executeCommand(RemoveRootFolderAction.ID);
    }
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    return workspaceEditingService.removeFolders(resources);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib + 10,
  when: ContextKeyExpr.and(
    FilesExplorerFocusCondition,
    ExplorerCompressedFocusContext,
    ExplorerCompressedFirstFocusContext.negate()
  ),
  primary: KeyCode.LeftArrow,
  id: PREVIOUS_COMPRESSED_FOLDER,
  handler: /* @__PURE__ */ __name((accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    );
    if (viewlet?.getId() !== VIEWLET_ID) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.previousCompressedStat();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib + 10,
  when: ContextKeyExpr.and(
    FilesExplorerFocusCondition,
    ExplorerCompressedFocusContext,
    ExplorerCompressedLastFocusContext.negate()
  ),
  primary: KeyCode.RightArrow,
  id: NEXT_COMPRESSED_FOLDER,
  handler: /* @__PURE__ */ __name((accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    );
    if (viewlet?.getId() !== VIEWLET_ID) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.nextCompressedStat();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib + 10,
  when: ContextKeyExpr.and(
    FilesExplorerFocusCondition,
    ExplorerCompressedFocusContext,
    ExplorerCompressedFirstFocusContext.negate()
  ),
  primary: KeyCode.Home,
  id: FIRST_COMPRESSED_FOLDER,
  handler: /* @__PURE__ */ __name((accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    );
    if (viewlet?.getId() !== VIEWLET_ID) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.firstCompressedStat();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib + 10,
  when: ContextKeyExpr.and(
    FilesExplorerFocusCondition,
    ExplorerCompressedFocusContext,
    ExplorerCompressedLastFocusContext.negate()
  ),
  primary: KeyCode.End,
  id: LAST_COMPRESSED_FOLDER,
  handler: /* @__PURE__ */ __name((accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    );
    if (viewlet?.getId() !== VIEWLET_ID) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.lastCompressedStat();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: null,
  primary: isWeb ? isWindows ? KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyN) : KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyN : KeyMod.CtrlCmd | KeyCode.KeyN,
  secondary: isWeb ? [KeyMod.CtrlCmd | KeyCode.KeyN] : void 0,
  id: NEW_UNTITLED_FILE_COMMAND_ID,
  metadata: {
    description: NEW_UNTITLED_FILE_LABEL,
    args: [
      {
        isOptional: true,
        name: "New Untitled Text File arguments",
        description: "The editor view type or language ID if known",
        schema: {
          type: "object",
          properties: {
            viewType: {
              type: "string"
            },
            languageId: {
              type: "string"
            }
          }
        }
      }
    ]
  },
  handler: /* @__PURE__ */ __name(async (accessor, args) => {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      resource: void 0,
      options: {
        override: args?.viewType,
        pinned: true
      },
      languageId: args?.languageId
    });
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: NEW_FILE_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor, args) => {
    const editorService = accessor.get(IEditorService);
    const dialogService = accessor.get(IFileDialogService);
    const fileService = accessor.get(IFileService);
    const createFileLocalized = nls.localize(
      "newFileCommand.saveLabel",
      "Create File"
    );
    const defaultFileUri = joinPath(
      await dialogService.defaultFilePath(),
      args?.fileName ?? "Untitled.txt"
    );
    const saveUri = await dialogService.showSaveDialog({
      saveLabel: createFileLocalized,
      title: createFileLocalized,
      defaultUri: defaultFileUri
    });
    if (!saveUri) {
      return;
    }
    await fileService.createFile(saveUri, void 0, { overwrite: true });
    await editorService.openEditor({
      resource: saveUri,
      options: {
        override: args?.viewType,
        pinned: true
      },
      languageId: args?.languageId
    });
  }, "handler")
});
export {
  newWindowCommand,
  openWindowCommand
};
//# sourceMappingURL=fileCommands.js.map
