import * as nls from "../../../../nls.js";
import { IConfigurationPropertySchema } from "../../../../platform/configuration/common/configurationRegistry.js";
import { languagesExtPoint } from "../../../services/language/common/languageService.js";
var DocumentationExtensionPointFields = /* @__PURE__ */ ((DocumentationExtensionPointFields2) => {
  DocumentationExtensionPointFields2["when"] = "when";
  DocumentationExtensionPointFields2["title"] = "title";
  DocumentationExtensionPointFields2["command"] = "command";
  return DocumentationExtensionPointFields2;
})(DocumentationExtensionPointFields || {});
const documentationExtensionPointSchema = Object.freeze({
  type: "object",
  description: nls.localize("contributes.documentation", "Contributed documentation."),
  properties: {
    "refactoring": {
      type: "array",
      description: nls.localize("contributes.documentation.refactorings", "Contributed documentation for refactorings."),
      items: {
        type: "object",
        description: nls.localize("contributes.documentation.refactoring", "Contributed documentation for refactoring."),
        required: [
          "title" /* title */,
          "when" /* when */,
          "command" /* command */
        ],
        properties: {
          ["title" /* title */]: {
            type: "string",
            description: nls.localize("contributes.documentation.refactoring.title", "Label for the documentation used in the UI.")
          },
          ["when" /* when */]: {
            type: "string",
            description: nls.localize("contributes.documentation.refactoring.when", "When clause.")
          },
          ["command" /* command */]: {
            type: "string",
            description: nls.localize("contributes.documentation.refactoring.command", "Command executed.")
          }
        }
      }
    }
  }
});
const documentationExtensionPointDescriptor = {
  extensionPoint: "documentation",
  deps: [languagesExtPoint],
  jsonSchema: documentationExtensionPointSchema
};
export {
  documentationExtensionPointDescriptor
};
//# sourceMappingURL=documentationExtensionPoint.js.map
