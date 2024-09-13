var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
class ToggleRenderWhitespaceAction extends Action2 {
  static {
    __name(this, "ToggleRenderWhitespaceAction");
  }
  static ID = "editor.action.toggleRenderWhitespace";
  constructor() {
    super({
      id: ToggleRenderWhitespaceAction.ID,
      title: {
        ...localize2("toggleRenderWhitespace", "Toggle Render Whitespace"),
        mnemonicTitle: localize({ key: "miToggleRenderWhitespace", comment: ["&& denotes a mnemonic"] }, "&&Render Whitespace")
      },
      category: Categories.View,
      f1: true,
      toggled: ContextKeyExpr.notEquals("config.editor.renderWhitespace", "none"),
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "4_editor",
        order: 4
      }
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const renderWhitespace = configurationService.getValue("editor.renderWhitespace");
    let newRenderWhitespace;
    if (renderWhitespace === "none") {
      newRenderWhitespace = "all";
    } else {
      newRenderWhitespace = "none";
    }
    return configurationService.updateValue("editor.renderWhitespace", newRenderWhitespace);
  }
}
registerAction2(ToggleRenderWhitespaceAction);
//# sourceMappingURL=toggleRenderWhitespace.js.map
