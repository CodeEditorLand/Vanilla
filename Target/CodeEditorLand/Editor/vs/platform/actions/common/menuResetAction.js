var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../nls.js";
import { Categories } from "../../action/common/actionCommonCategories.js";
import { ILogService } from "../../log/common/log.js";
import { Action2, IMenuService } from "./actions.js";
class MenuHiddenStatesReset extends Action2 {
  static {
    __name(this, "MenuHiddenStatesReset");
  }
  constructor() {
    super({
      id: "menu.resetHiddenStates",
      title: localize2("title", "Reset All Menus"),
      category: Categories.View,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IMenuService).resetHiddenStates();
    accessor.get(ILogService).info("did RESET all menu hidden states");
  }
}
export {
  MenuHiddenStatesReset
};
//# sourceMappingURL=menuResetAction.js.map
