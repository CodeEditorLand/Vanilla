var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import {
  Extensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
const defaultExternalUriOpenerId = "default";
const externalUriOpenersSettingId = "workbench.externalUriOpeners";
const externalUriOpenerIdSchemaAddition = {
  type: "string",
  enum: []
};
const exampleUriPatterns = `
- \`https://microsoft.com\`: Matches this specific domain using https
- \`https://microsoft.com:8080\`: Matches this specific domain on this port using https
- \`https://microsoft.com:*\`: Matches this specific domain on any port using https
- \`https://microsoft.com/foo\`: Matches \`https://microsoft.com/foo\` and \`https://microsoft.com/foo/bar\`, but not \`https://microsoft.com/foobar\` or \`https://microsoft.com/bar\`
- \`https://*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using https
- \`microsoft.com\`: Match this specific domain using either http or https
- \`*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using either http or https
- \`http://192.168.0.1\`: Matches this specific IP using http
- \`http://192.168.0.*\`: Matches all IP's with this prefix using http
- \`*\`: Match all domains using either http or https`;
const externalUriOpenersConfigurationNode = {
  ...workbenchConfigurationNodeBase,
  properties: {
    [externalUriOpenersSettingId]: {
      type: "object",
      markdownDescription: nls.localize(
        "externalUriOpeners",
        "Configure the opener to use for external URIs (http, https)."
      ),
      defaultSnippets: [
        {
          body: {
            "example.com": "$1"
          }
        }
      ],
      additionalProperties: {
        anyOf: [
          {
            type: "string",
            markdownDescription: nls.localize(
              "externalUriOpeners.uri",
              "Map URI pattern to an opener id.\nExample patterns: \n{0}",
              exampleUriPatterns
            )
          },
          {
            type: "string",
            markdownDescription: nls.localize(
              "externalUriOpeners.uri",
              "Map URI pattern to an opener id.\nExample patterns: \n{0}",
              exampleUriPatterns
            ),
            enum: [defaultExternalUriOpenerId],
            enumDescriptions: [
              nls.localize(
                "externalUriOpeners.defaultId",
                "Open using VS Code's standard opener."
              )
            ]
          },
          externalUriOpenerIdSchemaAddition
        ]
      }
    }
  }
};
function updateContributedOpeners(enumValues, enumDescriptions) {
  externalUriOpenerIdSchemaAddition.enum = enumValues;
  externalUriOpenerIdSchemaAddition.enumDescriptions = enumDescriptions;
  Registry.as(
    Extensions.Configuration
  ).notifyConfigurationSchemaUpdated(externalUriOpenersConfigurationNode);
}
__name(updateContributedOpeners, "updateContributedOpeners");
export {
  defaultExternalUriOpenerId,
  externalUriOpenersConfigurationNode,
  externalUriOpenersSettingId,
  updateContributedOpeners
};
//# sourceMappingURL=configuration.js.map
