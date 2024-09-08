import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions
} from "../../../services/extensionManagement/common/extensionFeatures.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import {
  ClearDisplayLanguageAction,
  ConfigureDisplayLanguageAction
} from "./localizationsActions.js";
class BaseLocalizationWorkbenchContribution extends Disposable {
  constructor() {
    super();
    registerAction2(ConfigureDisplayLanguageAction);
    registerAction2(ClearDisplayLanguageAction);
    ExtensionsRegistry.registerExtensionPoint({
      extensionPoint: "localizations",
      defaultExtensionKind: ["ui", "workspace"],
      jsonSchema: {
        description: localize(
          "vscode.extension.contributes.localizations",
          "Contributes localizations to the editor"
        ),
        type: "array",
        default: [],
        items: {
          type: "object",
          required: ["languageId", "translations"],
          defaultSnippets: [
            {
              body: {
                languageId: "",
                languageName: "",
                localizedLanguageName: "",
                translations: [{ id: "vscode", path: "" }]
              }
            }
          ],
          properties: {
            languageId: {
              description: localize(
                "vscode.extension.contributes.localizations.languageId",
                "Id of the language into which the display strings are translated."
              ),
              type: "string"
            },
            languageName: {
              description: localize(
                "vscode.extension.contributes.localizations.languageName",
                "Name of the language in English."
              ),
              type: "string"
            },
            localizedLanguageName: {
              description: localize(
                "vscode.extension.contributes.localizations.languageNameLocalized",
                "Name of the language in contributed language."
              ),
              type: "string"
            },
            translations: {
              description: localize(
                "vscode.extension.contributes.localizations.translations",
                "List of translations associated to the language."
              ),
              type: "array",
              default: [{ id: "vscode", path: "" }],
              items: {
                type: "object",
                required: ["id", "path"],
                properties: {
                  id: {
                    type: "string",
                    description: localize(
                      "vscode.extension.contributes.localizations.translations.id",
                      "Id of VS Code or Extension for which this translation is contributed to. Id of VS Code is always `vscode` and of extension should be in format `publisherId.extensionName`."
                    ),
                    pattern: "^((vscode)|([a-z0-9A-Z][a-z0-9A-Z-]*)\\.([a-z0-9A-Z][a-z0-9A-Z-]*))$",
                    patternErrorMessage: localize(
                      "vscode.extension.contributes.localizations.translations.id.pattern",
                      "Id should be `vscode` or in format `publisherId.extensionName` for translating VS code or an extension respectively."
                    )
                  },
                  path: {
                    type: "string",
                    description: localize(
                      "vscode.extension.contributes.localizations.translations.path",
                      "A relative path to a file containing translations for the language."
                    )
                  }
                },
                defaultSnippets: [
                  { body: { id: "", path: "" } }
                ]
              }
            }
          }
        }
      }
    });
  }
}
class LocalizationsDataRenderer extends Disposable {
  type = "table";
  shouldRender(manifest) {
    return !!manifest.contributes?.localizations;
  }
  render(manifest) {
    const localizations = manifest.contributes?.localizations || [];
    if (!localizations.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize("language id", "Language ID"),
      localize("localizations language name", "Language Name"),
      localize(
        "localizations localized language name",
        "Language Name (Localized)"
      )
    ];
    const rows = localizations.sort((a, b) => a.languageId.localeCompare(b.languageId)).map((localization) => {
      return [
        localization.languageId,
        localization.languageName ?? "",
        localization.localizedLanguageName ?? ""
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
}
Registry.as(
  Extensions.ExtensionFeaturesRegistry
).registerExtensionFeature({
  id: "localizations",
  label: localize("localizations", "Langauage Packs"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(LocalizationsDataRenderer)
});
export {
  BaseLocalizationWorkbenchContribution
};
