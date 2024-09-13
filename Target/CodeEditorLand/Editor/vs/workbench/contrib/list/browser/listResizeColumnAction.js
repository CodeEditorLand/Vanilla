var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Table } from "../../../../base/browser/ui/table/tableWidget.js";
import { localize } from "../../../../nls.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  IListService,
  WorkbenchListFocusContextKey
} from "../../../../platform/list/browser/listService.js";
import { TableColumnResizeQuickPick } from "./tableColumnResizeQuickPick.js";
class ListResizeColumnAction extends Action2 {
  static {
    __name(this, "ListResizeColumnAction");
  }
  constructor() {
    super({
      id: "list.resizeColumn",
      title: {
        value: localize("list.resizeColumn", "Resize Column"),
        original: "Resize Column"
      },
      category: { value: localize("list", "List"), original: "List" },
      precondition: WorkbenchListFocusContextKey,
      f1: true
    });
  }
  async run(accessor) {
    const listService = accessor.get(IListService);
    const instantiationService = accessor.get(IInstantiationService);
    const list = listService.lastFocusedList;
    if (list instanceof Table) {
      await instantiationService.createInstance(TableColumnResizeQuickPick, list).show();
    }
  }
}
export {
  ListResizeColumnAction
};
//# sourceMappingURL=listResizeColumnAction.js.map
