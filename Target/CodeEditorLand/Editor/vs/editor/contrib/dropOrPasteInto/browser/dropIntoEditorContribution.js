import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorCommand, EditorContributionInstantiation, ServicesAccessor, registerEditorCommand, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { editorConfigurationBaseNode } from "../../../common/config/editorConfigurationSchema.js";
import { registerEditorFeature } from "../../../common/editorFeatures.js";
import { DefaultDropProvidersFeature } from "./defaultProviders.js";
import * as nls from "../../../../nls.js";
import { Extensions as ConfigurationExtensions, ConfigurationScope, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { DropIntoEditorController, changeDropTypeCommandId, defaultProviderConfig, dropWidgetVisibleCtx } from "./dropIntoEditorController.js";
registerEditorContribution(DropIntoEditorController.ID, DropIntoEditorController, EditorContributionInstantiation.BeforeFirstInteraction);
registerEditorFeature(DefaultDropProvidersFeature);
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: changeDropTypeCommandId,
      precondition: dropWidgetVisibleCtx,
      kbOpts: {
        weight: KeybindingWeight.EditorContrib,
        primary: KeyMod.CtrlCmd | KeyCode.Period
      }
    });
  }
  runEditorCommand(_accessor, editor, _args) {
    DropIntoEditorController.get(editor)?.changeDropType();
  }
}());
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.hideDropWidget",
      precondition: dropWidgetVisibleCtx,
      kbOpts: {
        weight: KeybindingWeight.EditorContrib,
        primary: KeyCode.Escape
      }
    });
  }
  runEditorCommand(_accessor, editor, _args) {
    DropIntoEditorController.get(editor)?.clearWidgets();
  }
}());
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    [defaultProviderConfig]: {
      type: "object",
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      description: nls.localize("defaultProviderDescription", "Configures the default drop provider to use for content of a given mime type."),
      default: {},
      additionalProperties: {
        type: "string"
      }
    }
  }
});
//# sourceMappingURL=dropIntoEditorContribution.js.map
