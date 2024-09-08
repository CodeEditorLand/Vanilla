import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { Schemas } from "../../../../base/common/network.js";
import { isMacintosh, isWindows } from "../../../../base/common/platform.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import * as nls from "../../../../nls.js";
import {
  MenuId,
  MenuRegistry
} from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ResourceContextKey } from "../../../common/contextkeys.js";
import {
  EditorResourceAccessor,
  SideBySideEditor
} from "../../../common/editor.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  appendEditorTitleContextMenuItem,
  appendToCommandPalette
} from "../browser/fileActions.contribution.js";
import {
  IExplorerService,
  getMultiSelectedResources
} from "../browser/files.js";
import { revealResourcesInOS } from "./fileCommands.js";
const REVEAL_IN_OS_COMMAND_ID = "revealFileInOS";
const REVEAL_IN_OS_LABEL = isWindows ? nls.localize2("revealInWindows", "Reveal in File Explorer") : isMacintosh ? nls.localize2("revealInMac", "Reveal in Finder") : nls.localize2("openContainer", "Open Containing Folder");
const REVEAL_IN_OS_WHEN_CONTEXT = ContextKeyExpr.or(
  ResourceContextKey.Scheme.isEqualTo(Schemas.file),
  ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeUserData)
);
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: REVEAL_IN_OS_COMMAND_ID,
  weight: KeybindingWeight.WorkbenchContrib,
  when: EditorContextKeys.focus.toNegated(),
  primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyR,
  win: {
    primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyR
  },
  handler: (accessor, resource) => {
    const resources = getMultiSelectedResources(
      resource,
      accessor.get(IListService),
      accessor.get(IEditorService),
      accessor.get(IEditorGroupsService),
      accessor.get(IExplorerService)
    );
    revealResourcesInOS(
      resources,
      accessor.get(INativeHostService),
      accessor.get(IWorkspaceContextService)
    );
  }
});
const REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID = "workbench.action.files.revealActiveFileInWindows";
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: KeybindingWeight.WorkbenchContrib,
  when: void 0,
  primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyR),
  id: REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID,
  handler: (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeInput = editorService.activeEditor;
    const resource = EditorResourceAccessor.getOriginalUri(activeInput, {
      filterByScheme: Schemas.file,
      supportSideBySide: SideBySideEditor.PRIMARY
    });
    const resources = resource ? [resource] : [];
    revealResourcesInOS(
      resources,
      accessor.get(INativeHostService),
      accessor.get(IWorkspaceContextService)
    );
  }
});
appendEditorTitleContextMenuItem(
  REVEAL_IN_OS_COMMAND_ID,
  REVEAL_IN_OS_LABEL.value,
  REVEAL_IN_OS_WHEN_CONTEXT,
  "2_files",
  false,
  0
);
const revealInOsCommand = {
  id: REVEAL_IN_OS_COMMAND_ID,
  title: REVEAL_IN_OS_LABEL.value
};
MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "navigation",
  order: 20,
  command: revealInOsCommand,
  when: REVEAL_IN_OS_WHEN_CONTEXT
});
MenuRegistry.appendMenuItem(MenuId.OpenEditorsContextShare, {
  title: nls.localize("miShare", "Share"),
  submenu: MenuId.MenubarShare,
  group: "share",
  order: 3
});
MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "navigation",
  order: 20,
  command: revealInOsCommand,
  when: REVEAL_IN_OS_WHEN_CONTEXT
});
const category = nls.localize2("filesCategory", "File");
appendToCommandPalette(
  {
    id: REVEAL_IN_OS_COMMAND_ID,
    title: REVEAL_IN_OS_LABEL,
    category
  },
  REVEAL_IN_OS_WHEN_CONTEXT
);
