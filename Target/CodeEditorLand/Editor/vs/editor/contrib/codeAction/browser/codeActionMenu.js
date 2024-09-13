var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "../../../../base/browser/ui/codicons/codiconStyles.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { CodeActionKind } from "../common/types.js";
import "../../symbolIcons/browser/symbolIcons.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { localize } from "../../../../nls.js";
import {
  ActionListItemKind
} from "../../../../platform/actionWidget/browser/actionList.js";
const uncategorizedCodeActionGroup = Object.freeze({
  kind: HierarchicalKind.Empty,
  title: localize("codeAction.widget.id.more", "More Actions...")
});
const codeActionGroups = Object.freeze([
  {
    kind: CodeActionKind.QuickFix,
    title: localize("codeAction.widget.id.quickfix", "Quick Fix")
  },
  {
    kind: CodeActionKind.RefactorExtract,
    title: localize("codeAction.widget.id.extract", "Extract"),
    icon: Codicon.wrench
  },
  {
    kind: CodeActionKind.RefactorInline,
    title: localize("codeAction.widget.id.inline", "Inline"),
    icon: Codicon.wrench
  },
  {
    kind: CodeActionKind.RefactorRewrite,
    title: localize("codeAction.widget.id.convert", "Rewrite"),
    icon: Codicon.wrench
  },
  {
    kind: CodeActionKind.RefactorMove,
    title: localize("codeAction.widget.id.move", "Move"),
    icon: Codicon.wrench
  },
  {
    kind: CodeActionKind.SurroundWith,
    title: localize("codeAction.widget.id.surround", "Surround With"),
    icon: Codicon.surroundWith
  },
  {
    kind: CodeActionKind.Source,
    title: localize("codeAction.widget.id.source", "Source Action"),
    icon: Codicon.symbolFile
  },
  uncategorizedCodeActionGroup
]);
function toMenuItems(inputCodeActions, showHeaders, keybindingResolver) {
  if (!showHeaders) {
    return inputCodeActions.map(
      (action) => {
        return {
          kind: ActionListItemKind.Action,
          item: action,
          group: uncategorizedCodeActionGroup,
          disabled: !!action.action.disabled,
          label: action.action.disabled || action.action.title,
          canPreview: !!action.action.edit?.edits.length
        };
      }
    );
  }
  const menuEntries = codeActionGroups.map((group) => ({
    group,
    actions: []
  }));
  for (const action of inputCodeActions) {
    const kind = action.action.kind ? new HierarchicalKind(action.action.kind) : HierarchicalKind.None;
    for (const menuEntry of menuEntries) {
      if (menuEntry.group.kind.contains(kind)) {
        menuEntry.actions.push(action);
        break;
      }
    }
  }
  const allMenuItems = [];
  for (const menuEntry of menuEntries) {
    if (menuEntry.actions.length) {
      allMenuItems.push({
        kind: ActionListItemKind.Header,
        group: menuEntry.group
      });
      for (const action of menuEntry.actions) {
        const group = menuEntry.group;
        allMenuItems.push({
          kind: ActionListItemKind.Action,
          item: action,
          group: action.action.isAI ? {
            title: group.title,
            kind: group.kind,
            icon: Codicon.sparkle
          } : group,
          label: action.action.title,
          disabled: !!action.action.disabled,
          keybinding: keybindingResolver(action.action)
        });
      }
    }
  }
  return allMenuItems;
}
__name(toMenuItems, "toMenuItems");
export {
  toMenuItems
};
//# sourceMappingURL=codeActionMenu.js.map
