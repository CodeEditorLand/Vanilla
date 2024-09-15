var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { OutlineTarget } from "../../../../services/outline/browser/outline.js";
import { CellKind } from "../../common/notebookCommon.js";
import { NotebookOutlineContext } from "../contrib/outline/notebookOutline.js";
import { CellFoldingState } from "../notebookBrowser.js";
import * as icons from "../notebookIcons.js";
import { FoldingController } from "./foldingController.js";
class NotebookRunSingleCellInSection extends Action2 {
  static {
    __name(this, "NotebookRunSingleCellInSection");
  }
  constructor() {
    super({
      id: "notebook.section.runSingleCell",
      title: {
        ...localize2("runCell", "Run Cell"),
        mnemonicTitle: localize(
          { key: "mirunCell", comment: ["&& denotes a mnemonic"] },
          "&&Run Cell"
        )
      },
      shortTitle: localize("runCell", "Run Cell"),
      icon: icons.executeIcon,
      menu: [
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "inline",
          order: 1,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(
              CellKind.Code
            ),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(
              OutlineTarget.OutlinePane
            ),
            NotebookOutlineContext.CellHasChildren.toNegated(),
            NotebookOutlineContext.CellHasHeader.toNegated()
          )
        }
      ]
    });
  }
  async run(_accessor, context) {
    if (!checkSectionContext(context)) {
      return;
    }
    context.notebookEditor.executeNotebookCells([
      context.outlineEntry.cell
    ]);
  }
}
class NotebookRunCellsInSection extends Action2 {
  static {
    __name(this, "NotebookRunCellsInSection");
  }
  constructor() {
    super({
      id: "notebook.section.runCells",
      title: {
        ...localize2("runCellsInSection", "Run Cells In Section"),
        mnemonicTitle: localize(
          {
            key: "mirunCellsInSection",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Run Cells In Section"
        )
      },
      shortTitle: localize("runCellsInSection", "Run Cells In Section"),
      // icon: icons.executeBelowIcon, // TODO @Yoyokrazy replace this with new icon later
      menu: [
        {
          id: MenuId.NotebookStickyScrollContext,
          group: "notebookExecution",
          order: 1
        },
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "inline",
          order: 1,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(
              CellKind.Markup
            ),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(
              OutlineTarget.OutlinePane
            ),
            NotebookOutlineContext.CellHasChildren,
            NotebookOutlineContext.CellHasHeader
          )
        }
      ]
    });
  }
  async run(_accessor, context) {
    if (!checkSectionContext(context)) {
      return;
    }
    const cell = context.outlineEntry.cell;
    const idx = context.notebookEditor.getViewModel()?.getCellIndex(cell);
    if (idx === void 0) {
      return;
    }
    const length = context.notebookEditor.getViewModel()?.getFoldedLength(idx);
    if (length === void 0) {
      return;
    }
    const cells = context.notebookEditor.getCellsInRange({
      start: idx,
      end: idx + length + 1
    });
    context.notebookEditor.executeNotebookCells(cells);
  }
}
class NotebookFoldSection extends Action2 {
  static {
    __name(this, "NotebookFoldSection");
  }
  constructor() {
    super({
      id: "notebook.section.foldSection",
      title: {
        ...localize2("foldSection", "Fold Section"),
        mnemonicTitle: localize(
          {
            key: "mifoldSection",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Fold Section"
        )
      },
      shortTitle: localize("foldSection", "Fold Section"),
      menu: [
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "notebookFolding",
          order: 2,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(
              CellKind.Markup
            ),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(
              OutlineTarget.OutlinePane
            ),
            NotebookOutlineContext.CellHasChildren,
            NotebookOutlineContext.CellHasHeader,
            NotebookOutlineContext.CellFoldingState.isEqualTo(
              CellFoldingState.Expanded
            )
          )
        }
      ]
    });
  }
  async run(_accessor, context) {
    if (!checkSectionContext(context)) {
      return;
    }
    this.toggleFoldRange(context.outlineEntry, context.notebookEditor);
  }
  toggleFoldRange(entry, notebookEditor) {
    const foldingController = notebookEditor.getContribution(
      FoldingController.id
    );
    const index = entry.index;
    const headerLevel = entry.level;
    const newFoldingState = CellFoldingState.Collapsed;
    foldingController.setFoldingStateDown(
      index,
      newFoldingState,
      headerLevel
    );
  }
}
class NotebookExpandSection extends Action2 {
  static {
    __name(this, "NotebookExpandSection");
  }
  constructor() {
    super({
      id: "notebook.section.expandSection",
      title: {
        ...localize2("expandSection", "Expand Section"),
        mnemonicTitle: localize(
          {
            key: "miexpandSection",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Expand Section"
        )
      },
      shortTitle: localize("expandSection", "Expand Section"),
      menu: [
        {
          id: MenuId.NotebookOutlineActionMenu,
          group: "notebookFolding",
          order: 2,
          when: ContextKeyExpr.and(
            NotebookOutlineContext.CellKind.isEqualTo(
              CellKind.Markup
            ),
            NotebookOutlineContext.OutlineElementTarget.isEqualTo(
              OutlineTarget.OutlinePane
            ),
            NotebookOutlineContext.CellHasChildren,
            NotebookOutlineContext.CellHasHeader,
            NotebookOutlineContext.CellFoldingState.isEqualTo(
              CellFoldingState.Collapsed
            )
          )
        }
      ]
    });
  }
  async run(_accessor, context) {
    if (!checkSectionContext(context)) {
      return;
    }
    this.toggleFoldRange(context.outlineEntry, context.notebookEditor);
  }
  toggleFoldRange(entry, notebookEditor) {
    const foldingController = notebookEditor.getContribution(
      FoldingController.id
    );
    const index = entry.index;
    const headerLevel = entry.level;
    const newFoldingState = CellFoldingState.Expanded;
    foldingController.setFoldingStateDown(
      index,
      newFoldingState,
      headerLevel
    );
  }
}
function checkSectionContext(context) {
  return !!(context && context.notebookEditor && context.outlineEntry);
}
__name(checkSectionContext, "checkSectionContext");
registerAction2(NotebookRunSingleCellInSection);
registerAction2(NotebookRunCellsInSection);
registerAction2(NotebookFoldSection);
registerAction2(NotebookExpandSection);
export {
  NotebookExpandSection,
  NotebookFoldSection,
  NotebookRunCellsInSection,
  NotebookRunSingleCellInSection
};
//# sourceMappingURL=sectionActions.js.map
