var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { ActionRunner } from "../../../../base/common/actions.js";
import { asArray } from "../../../../base/common/arrays.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
class InstanceContext {
  static {
    __name(this, "InstanceContext");
  }
  instanceId;
  constructor(instance) {
    this.instanceId = instance.instanceId;
  }
  toJSON() {
    return {
      $mid: MarshalledId.TerminalContext,
      instanceId: this.instanceId
    };
  }
}
class TerminalContextActionRunner extends ActionRunner {
  static {
    __name(this, "TerminalContextActionRunner");
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  async runAction(action, context) {
    if (Array.isArray(context) && context.every((e) => e instanceof InstanceContext)) {
      await action.run(context?.[0], context);
      return;
    }
    return super.runAction(action, context);
  }
}
function openContextMenu(targetWindow, event, contextInstances, menu, contextMenuService, extraActions) {
  const standardEvent = new StandardMouseEvent(targetWindow, event);
  const actions = [];
  createAndFillInContextMenuActions(
    menu,
    { shouldForwardArgs: true },
    actions
  );
  if (extraActions) {
    actions.push(...extraActions);
  }
  const context = contextInstances ? asArray(contextInstances).map((e) => new InstanceContext(e)) : [];
  contextMenuService.showContextMenu({
    actionRunner: new TerminalContextActionRunner(),
    getAnchor: /* @__PURE__ */ __name(() => standardEvent, "getAnchor"),
    getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
    getActionsContext: /* @__PURE__ */ __name(() => context, "getActionsContext")
  });
}
__name(openContextMenu, "openContextMenu");
export {
  InstanceContext,
  TerminalContextActionRunner,
  openContextMenu
};
//# sourceMappingURL=terminalContextMenu.js.map
