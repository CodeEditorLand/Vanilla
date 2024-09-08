import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { ActionRunner } from "../../../../base/common/actions.js";
import { asArray } from "../../../../base/common/arrays.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
class InstanceContext {
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
    getAnchor: () => standardEvent,
    getActions: () => actions,
    getActionsContext: () => context
  });
}
export {
  InstanceContext,
  TerminalContextActionRunner,
  openContextMenu
};
