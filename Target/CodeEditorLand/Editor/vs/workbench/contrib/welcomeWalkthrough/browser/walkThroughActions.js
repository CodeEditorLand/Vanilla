var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { WalkThroughPart, WALK_THROUGH_FOCUS } from "./walkThroughPart.js";
import { ICommandAndKeybindingRule, KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
const WalkThroughArrowUp = {
  id: "workbench.action.interactivePlayground.arrowUp",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: KeyCode.UpArrow,
  handler: /* @__PURE__ */ __name((accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.arrowUp();
    }
  }, "handler")
};
const WalkThroughArrowDown = {
  id: "workbench.action.interactivePlayground.arrowDown",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: KeyCode.DownArrow,
  handler: /* @__PURE__ */ __name((accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.arrowDown();
    }
  }, "handler")
};
const WalkThroughPageUp = {
  id: "workbench.action.interactivePlayground.pageUp",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: KeyCode.PageUp,
  handler: /* @__PURE__ */ __name((accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.pageUp();
    }
  }, "handler")
};
const WalkThroughPageDown = {
  id: "workbench.action.interactivePlayground.pageDown",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: KeyCode.PageDown,
  handler: /* @__PURE__ */ __name((accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.pageDown();
    }
  }, "handler")
};
export {
  WalkThroughArrowDown,
  WalkThroughArrowUp,
  WalkThroughPageDown,
  WalkThroughPageUp
};
//# sourceMappingURL=walkThroughActions.js.map
