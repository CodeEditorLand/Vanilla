var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import {
  Extensions as JSONExtensions
} from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { iconsSchemaId } from "../../../../platform/theme/common/iconRegistry.js";
const fontIdRegex = "^([\\w_-]+)$";
const fontStyleRegex = "^(normal|italic|(oblique[ \\w\\s-]+))$";
const fontWeightRegex = "^(normal|bold|lighter|bolder|(\\d{0-1000}))$";
const fontSizeRegex = "^([\\w .%_-]+)$";
const fontFormatRegex = "^woff|woff2|truetype|opentype|embedded-opentype|svg$";
const schemaId = "vscode://schemas/product-icon-theme";
const schema = {
  type: "object",
  allowComments: true,
  allowTrailingCommas: true,
  properties: {
    fonts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: nls.localize(
              "schema.id",
              "The ID of the font."
            ),
            pattern: fontIdRegex,
            patternErrorMessage: nls.localize(
              "schema.id.formatError",
              "The ID must only contain letters, numbers, underscore and minus."
            )
          },
          src: {
            type: "array",
            description: nls.localize(
              "schema.src",
              "The location of the font."
            ),
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: nls.localize(
                    "schema.font-path",
                    "The font path, relative to the current product icon theme file."
                  )
                },
                format: {
                  type: "string",
                  description: nls.localize(
                    "schema.font-format",
                    "The format of the font."
                  ),
                  enum: [
                    "woff",
                    "woff2",
                    "truetype",
                    "opentype",
                    "embedded-opentype",
                    "svg"
                  ]
                }
              },
              required: ["path", "format"]
            }
          },
          weight: {
            type: "string",
            description: nls.localize(
              "schema.font-weight",
              "The weight of the font. See https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight for valid values."
            ),
            anyOf: [
              { enum: ["normal", "bold", "lighter", "bolder"] },
              { type: "string", pattern: fontWeightRegex }
            ]
          },
          style: {
            type: "string",
            description: nls.localize(
              "schema.font-style",
              "The style of the font. See https://developer.mozilla.org/en-US/docs/Web/CSS/font-style for valid values."
            ),
            anyOf: [
              { enum: ["normal", "italic", "oblique"] },
              { type: "string", pattern: fontStyleRegex }
            ]
          }
        },
        required: ["id", "src"]
      }
    },
    iconDefinitions: {
      description: nls.localize(
        "schema.iconDefinitions",
        "Association of icon name to a font character."
      ),
      $ref: iconsSchemaId
    }
  }
};
function registerProductIconThemeSchemas() {
  const schemaRegistry = Registry.as(
    JSONExtensions.JSONContribution
  );
  schemaRegistry.registerSchema(schemaId, schema);
}
__name(registerProductIconThemeSchemas, "registerProductIconThemeSchemas");
export {
  fontFormatRegex,
  fontIdRegex,
  fontSizeRegex,
  fontStyleRegex,
  fontWeightRegex,
  registerProductIconThemeSchemas
};
//# sourceMappingURL=productIconThemeSchema.js.map
