import { Codicon } from "../../../../base/common/codicons.js";
import { localize2 } from "../../../../nls.js";
import {
  Action2,
  MenuId
} from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import {
  TextEditorSelectionRevealType
} from "../../../../platform/editor/common/editor.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { resolveCommandsContext } from "../../../browser/parts/editor/editorCommandsContext.js";
import { ActiveEditorContext } from "../../../common/contextkeys.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { MultiDiffEditor } from "./multiDiffEditor.js";
import { MultiDiffEditorInput } from "./multiDiffEditorInput.js";
class GoToFileAction extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.goToFile",
      title: localize2("goToFile", "Open File"),
      icon: Codicon.goToFile,
      precondition: ActiveEditorContext.isEqualTo(MultiDiffEditor.ID),
      menu: {
        when: ActiveEditorContext.isEqualTo(MultiDiffEditor.ID),
        id: MenuId.MultiDiffEditorFileToolbar,
        order: 22,
        group: "navigation"
      }
    });
  }
  async run(accessor, ...args) {
    const uri = args[0];
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    let selections;
    if (!(activeEditorPane instanceof MultiDiffEditor)) {
      return;
    }
    const editor = activeEditorPane.tryGetCodeEditor(uri);
    if (editor) {
      selections = editor.editor.getSelections() ?? void 0;
    }
    let targetUri = uri;
    const item = activeEditorPane.findDocumentDiffItem(uri);
    if (item && item.goToFileUri) {
      targetUri = item.goToFileUri;
    }
    await editorService.openEditor({
      resource: targetUri,
      options: {
        selection: selections?.[0],
        selectionRevealType: TextEditorSelectionRevealType.CenterIfOutsideViewport
      }
    });
  }
}
class CollapseAllAction extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.collapseAll",
      title: localize2("collapseAllDiffs", "Collapse All Diffs"),
      icon: Codicon.collapseAll,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
        ContextKeyExpr.not("multiDiffEditorAllCollapsed")
      ),
      menu: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
          ContextKeyExpr.not("multiDiffEditorAllCollapsed")
        ),
        id: MenuId.EditorTitle,
        group: "navigation",
        order: 100
      },
      f1: true
    });
  }
  async run(accessor, ...args) {
    const resolvedContext = resolveCommandsContext(
      args,
      accessor.get(IEditorService),
      accessor.get(IEditorGroupsService),
      accessor.get(IListService)
    );
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (editor instanceof MultiDiffEditorInput) {
      const viewModel = await editor.getViewModel();
      viewModel.collapseAll();
    }
  }
}
class ExpandAllAction extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.expandAll",
      title: localize2("ExpandAllDiffs", "Expand All Diffs"),
      icon: Codicon.expandAll,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
        ContextKeyExpr.has("multiDiffEditorAllCollapsed")
      ),
      menu: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
          ContextKeyExpr.has("multiDiffEditorAllCollapsed")
        ),
        id: MenuId.EditorTitle,
        group: "navigation",
        order: 100
      },
      f1: true
    });
  }
  async run(accessor, ...args) {
    const resolvedContext = resolveCommandsContext(
      args,
      accessor.get(IEditorService),
      accessor.get(IEditorGroupsService),
      accessor.get(IListService)
    );
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (editor instanceof MultiDiffEditorInput) {
      const viewModel = await editor.getViewModel();
      viewModel.expandAll();
    }
  }
}
export {
  CollapseAllAction,
  ExpandAllAction,
  GoToFileAction
};
