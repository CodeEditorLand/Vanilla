var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getActiveElement } from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { ICodeEditor, IDiffEditor } from "../../editorBrowser.js";
import { EditorAction2, ServicesAccessor } from "../../editorExtensions.js";
import { ICodeEditorService } from "../../services/codeEditorService.js";
import { DiffEditorWidget } from "./diffEditorWidget.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { localize2 } from "../../../../nls.js";
import { ILocalizedString } from "../../../../platform/action/common/action.js";
import { Action2, MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import "./registrations.contribution.js";
import { DiffEditorSelectionHunkToolbarContext } from "./features/gutterFeature.js";
import { URI } from "../../../../base/common/uri.js";
class ToggleCollapseUnchangedRegions extends Action2 {
  static {
    __name(this, "ToggleCollapseUnchangedRegions");
  }
  constructor() {
    super({
      id: "diffEditor.toggleCollapseUnchangedRegions",
      title: localize2("toggleCollapseUnchangedRegions", "Toggle Collapse Unchanged Regions"),
      icon: Codicon.map,
      toggled: ContextKeyExpr.has("config.diffEditor.hideUnchangedRegions.enabled"),
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      menu: {
        when: ContextKeyExpr.has("isInDiffEditor"),
        id: MenuId.EditorTitle,
        order: 22,
        group: "navigation"
      }
    });
  }
  run(accessor, ...args) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("diffEditor.hideUnchangedRegions.enabled");
    configurationService.updateValue("diffEditor.hideUnchangedRegions.enabled", newValue);
  }
}
class ToggleShowMovedCodeBlocks extends Action2 {
  static {
    __name(this, "ToggleShowMovedCodeBlocks");
  }
  constructor() {
    super({
      id: "diffEditor.toggleShowMovedCodeBlocks",
      title: localize2("toggleShowMovedCodeBlocks", "Toggle Show Moved Code Blocks"),
      precondition: ContextKeyExpr.has("isInDiffEditor")
    });
  }
  run(accessor, ...args) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("diffEditor.experimental.showMoves");
    configurationService.updateValue("diffEditor.experimental.showMoves", newValue);
  }
}
class ToggleUseInlineViewWhenSpaceIsLimited extends Action2 {
  static {
    __name(this, "ToggleUseInlineViewWhenSpaceIsLimited");
  }
  constructor() {
    super({
      id: "diffEditor.toggleUseInlineViewWhenSpaceIsLimited",
      title: localize2("toggleUseInlineViewWhenSpaceIsLimited", "Toggle Use Inline View When Space Is Limited"),
      precondition: ContextKeyExpr.has("isInDiffEditor")
    });
  }
  run(accessor, ...args) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("diffEditor.useInlineViewWhenSpaceIsLimited");
    configurationService.updateValue("diffEditor.useInlineViewWhenSpaceIsLimited", newValue);
  }
}
const diffEditorCategory = localize2("diffEditor", "Diff Editor");
class SwitchSide extends EditorAction2 {
  static {
    __name(this, "SwitchSide");
  }
  constructor() {
    super({
      id: "diffEditor.switchSide",
      title: localize2("switchSide", "Switch Side"),
      icon: Codicon.arrowSwap,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      f1: true,
      category: diffEditorCategory
    });
  }
  runEditorCommand(accessor, editor, arg) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      if (arg && arg.dryRun) {
        return { destinationSelection: diffEditor.mapToOtherSide().destinationSelection };
      } else {
        diffEditor.switchSide();
      }
    }
    return void 0;
  }
}
class ExitCompareMove extends EditorAction2 {
  static {
    __name(this, "ExitCompareMove");
  }
  constructor() {
    super({
      id: "diffEditor.exitCompareMove",
      title: localize2("exitCompareMove", "Exit Compare Move"),
      icon: Codicon.close,
      precondition: EditorContextKeys.comparingMovedCode,
      f1: false,
      category: diffEditorCategory,
      keybinding: {
        weight: 1e4,
        primary: KeyCode.Escape
      }
    });
  }
  runEditorCommand(accessor, editor, ...args) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.exitCompareMove();
    }
  }
}
class CollapseAllUnchangedRegions extends EditorAction2 {
  static {
    __name(this, "CollapseAllUnchangedRegions");
  }
  constructor() {
    super({
      id: "diffEditor.collapseAllUnchangedRegions",
      title: localize2("collapseAllUnchangedRegions", "Collapse All Unchanged Regions"),
      icon: Codicon.fold,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      f1: true,
      category: diffEditorCategory
    });
  }
  runEditorCommand(accessor, editor, ...args) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.collapseAllUnchangedRegions();
    }
  }
}
class ShowAllUnchangedRegions extends EditorAction2 {
  static {
    __name(this, "ShowAllUnchangedRegions");
  }
  constructor() {
    super({
      id: "diffEditor.showAllUnchangedRegions",
      title: localize2("showAllUnchangedRegions", "Show All Unchanged Regions"),
      icon: Codicon.unfold,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      f1: true,
      category: diffEditorCategory
    });
  }
  runEditorCommand(accessor, editor, ...args) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.showAllUnchangedRegions();
    }
  }
}
class RevertHunkOrSelection extends Action2 {
  static {
    __name(this, "RevertHunkOrSelection");
  }
  constructor() {
    super({
      id: "diffEditor.revert",
      title: localize2("revert", "Revert"),
      f1: false,
      category: diffEditorCategory
    });
  }
  run(accessor, arg) {
    const diffEditor = findDiffEditor(accessor, arg.originalUri, arg.modifiedUri);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.revertRangeMappings(arg.mapping.innerChanges ?? []);
    }
    return void 0;
  }
}
const accessibleDiffViewerCategory = localize2("accessibleDiffViewer", "Accessible Diff Viewer");
class AccessibleDiffViewerNext extends Action2 {
  static {
    __name(this, "AccessibleDiffViewerNext");
  }
  static id = "editor.action.accessibleDiffViewer.next";
  constructor() {
    super({
      id: AccessibleDiffViewerNext.id,
      title: localize2("editor.action.accessibleDiffViewer.next", "Go to Next Difference"),
      category: accessibleDiffViewerCategory,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      keybinding: {
        primary: KeyCode.F7,
        weight: KeybindingWeight.EditorContrib
      },
      f1: true
    });
  }
  run(accessor) {
    const diffEditor = findFocusedDiffEditor(accessor);
    diffEditor?.accessibleDiffViewerNext();
  }
}
class AccessibleDiffViewerPrev extends Action2 {
  static {
    __name(this, "AccessibleDiffViewerPrev");
  }
  static id = "editor.action.accessibleDiffViewer.prev";
  constructor() {
    super({
      id: AccessibleDiffViewerPrev.id,
      title: localize2("editor.action.accessibleDiffViewer.prev", "Go to Previous Difference"),
      category: accessibleDiffViewerCategory,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      keybinding: {
        primary: KeyMod.Shift | KeyCode.F7,
        weight: KeybindingWeight.EditorContrib
      },
      f1: true
    });
  }
  run(accessor) {
    const diffEditor = findFocusedDiffEditor(accessor);
    diffEditor?.accessibleDiffViewerPrev();
  }
}
function findDiffEditor(accessor, originalUri, modifiedUri) {
  const codeEditorService = accessor.get(ICodeEditorService);
  const diffEditors = codeEditorService.listDiffEditors();
  return diffEditors.find((diffEditor) => {
    const modified = diffEditor.getModifiedEditor();
    const original = diffEditor.getOriginalEditor();
    return modified && modified.getModel()?.uri.toString() === modifiedUri.toString() && original && original.getModel()?.uri.toString() === originalUri.toString();
  }) || null;
}
__name(findDiffEditor, "findDiffEditor");
function findFocusedDiffEditor(accessor) {
  const codeEditorService = accessor.get(ICodeEditorService);
  const diffEditors = codeEditorService.listDiffEditors();
  const activeElement = getActiveElement();
  if (activeElement) {
    for (const d of diffEditors) {
      const container = d.getContainerDomNode();
      if (isElementOrParentOf(container, activeElement)) {
        return d;
      }
    }
  }
  return null;
}
__name(findFocusedDiffEditor, "findFocusedDiffEditor");
function isElementOrParentOf(elementOrParent, element) {
  let e = element;
  while (e) {
    if (e === elementOrParent) {
      return true;
    }
    e = e.parentElement;
  }
  return false;
}
__name(isElementOrParentOf, "isElementOrParentOf");
export {
  AccessibleDiffViewerNext,
  AccessibleDiffViewerPrev,
  CollapseAllUnchangedRegions,
  ExitCompareMove,
  RevertHunkOrSelection,
  ShowAllUnchangedRegions,
  SwitchSide,
  ToggleCollapseUnchangedRegions,
  ToggleShowMovedCodeBlocks,
  ToggleUseInlineViewWhenSpaceIsLimited,
  findDiffEditor,
  findFocusedDiffEditor
};
//# sourceMappingURL=commands.js.map
