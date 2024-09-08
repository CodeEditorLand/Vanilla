var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { DisposableMap } from "../../../../../base/common/lifecycle.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import * as extensionsRegistry from "../../../../services/extensions/common/extensionsRegistry.js";
import {
  ILanguageModelToolsService
} from "../languageModelToolsService.js";
const languageModelToolsExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModelTools",
  activationEventsGenerator: (contributions, result) => {
    for (const contrib of contributions) {
      result.push(`onLanguageModelTool:${contrib.id}`);
    }
  },
  jsonSchema: {
    description: localize(
      "vscode.extension.contributes.tools",
      "Contributes a tool that can be invoked by a language model."
    ),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{ body: { name: "", description: "" } }],
      required: ["id", "modelDescription"],
      properties: {
        id: {
          description: localize(
            "toolId",
            "A unique id for this tool."
          ),
          type: "string",
          // Borrow OpenAI's requirement for tool names
          pattern: "^[\\w-]+$"
        },
        name: {
          description: localize(
            "toolName",
            "If {0} is enabled for this tool, the user may use '#' with this name to invoke the tool in a query. Otherwise, the name is not required. Name must not contain whitespace.",
            "`canBeInvokedManually`"
          ),
          type: "string",
          pattern: "^[\\w-]+$"
        },
        displayName: {
          description: localize(
            "toolDisplayName",
            "A human-readable name for this tool that may be used to describe it in the UI."
          ),
          type: "string"
        },
        userDescription: {
          description: localize(
            "toolUserDescription",
            "A description of this tool that may be shown to the user."
          ),
          type: "string"
        },
        modelDescription: {
          description: localize(
            "toolModelDescription",
            "A description of this tool that may be passed to a language model."
          ),
          type: "string"
        },
        parametersSchema: {
          description: localize(
            "parametersSchema",
            "A JSON schema for the parameters this tool accepts."
          ),
          type: "object",
          $ref: "http://json-schema.org/draft-07/schema#"
        },
        canBeInvokedManually: {
          description: localize(
            "canBeInvokedManually",
            "Whether this tool can be invoked manually by the user through the chat UX."
          ),
          type: "boolean"
        },
        icon: {
          description: localize(
            "icon",
            "An icon that represents this tool. Either a file path, an object with file paths for dark and light themes, or a theme icon reference, like `\\$(zap)`"
          ),
          anyOf: [
            {
              type: "string"
            },
            {
              type: "object",
              properties: {
                light: {
                  description: localize(
                    "icon.light",
                    "Icon path when a light theme is used"
                  ),
                  type: "string"
                },
                dark: {
                  description: localize(
                    "icon.dark",
                    "Icon path when a dark theme is used"
                  ),
                  type: "string"
                }
              }
            }
          ]
        },
        when: {
          markdownDescription: localize(
            "condition",
            "Condition which must be true for this tool to be enabled. Note that a tool may still be invoked by another extension even when its `when` condition is false."
          ),
          type: "string"
        }
      }
    }
  }
});
function toToolKey(extensionIdentifier, toolName) {
  return `${extensionIdentifier.value}/${toolName}`;
}
let LanguageModelToolsExtensionPointHandler = class {
  static ID = "workbench.contrib.toolsExtensionPointHandler";
  _registrationDisposables = new DisposableMap();
  constructor(languageModelToolsService, logService) {
    languageModelToolsExtensionPoint.setHandler((extensions, delta) => {
      for (const extension of delta.added) {
        for (const rawTool of extension.value) {
          if (!rawTool.id || !rawTool.modelDescription) {
            logService.error(
              `Extension '${extension.description.identifier.value}' CANNOT register tool without name and modelDescription: ${JSON.stringify(rawTool)}`
            );
            continue;
          }
          if (!rawTool.id.match(/^[\w-]+$/)) {
            logService.error(
              `Extension '${extension.description.identifier.value}' CANNOT register tool with invalid id: ${rawTool.id}. The id must match /^[\\w-]+$/.`
            );
            continue;
          }
          if (rawTool.canBeInvokedManually && !rawTool.name) {
            logService.error(
              `Extension '${extension.description.identifier.value}' CANNOT register tool with 'canBeInvokedManually' set without a name: ${JSON.stringify(rawTool)}`
            );
            continue;
          }
          const rawIcon = rawTool.icon;
          let icon;
          if (typeof rawIcon === "string") {
            icon = ThemeIcon.fromString(rawIcon) ?? {
              dark: joinPath(
                extension.description.extensionLocation,
                rawIcon
              ),
              light: joinPath(
                extension.description.extensionLocation,
                rawIcon
              )
            };
          } else if (rawIcon) {
            icon = {
              dark: joinPath(
                extension.description.extensionLocation,
                rawIcon.dark
              ),
              light: joinPath(
                extension.description.extensionLocation,
                rawIcon.light
              )
            };
          }
          const tool = {
            ...rawTool,
            icon,
            when: rawTool.when ? ContextKeyExpr.deserialize(rawTool.when) : void 0
          };
          const disposable = languageModelToolsService.registerToolData(tool);
          this._registrationDisposables.set(
            toToolKey(extension.description.identifier, rawTool.id),
            disposable
          );
        }
      }
      for (const extension of delta.removed) {
        for (const tool of extension.value) {
          this._registrationDisposables.deleteAndDispose(
            toToolKey(extension.description.identifier, tool.id)
          );
        }
      }
    });
  }
};
LanguageModelToolsExtensionPointHandler = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, ILogService)
], LanguageModelToolsExtensionPointHandler);
export {
  LanguageModelToolsExtensionPointHandler
};
