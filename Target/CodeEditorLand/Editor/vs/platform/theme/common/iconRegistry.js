import { RunOnceScheduler } from "../../../base/common/async.js";
import { Codicon } from "../../../base/common/codicons.js";
import { getCodiconFontCharacters } from "../../../base/common/codiconsUtil.js";
import { Emitter } from "../../../base/common/event.js";
import {
  ThemeIcon
} from "../../../base/common/themables.js";
import { isString } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import {
  Extensions as JSONExtensions
} from "../../jsonschemas/common/jsonContributionRegistry.js";
import * as platform from "../../registry/common/platform.js";
const Extensions = {
  IconContribution: "base.contributions.icons"
};
var IconContribution;
((IconContribution2) => {
  function getDefinition(contribution, registry) {
    let definition = contribution.defaults;
    while (ThemeIcon.isThemeIcon(definition)) {
      const c = iconRegistry.getIcon(definition.id);
      if (!c) {
        return void 0;
      }
      definition = c.defaults;
    }
    return definition;
  }
  IconContribution2.getDefinition = getDefinition;
})(IconContribution || (IconContribution = {}));
var IconFontDefinition;
((IconFontDefinition2) => {
  function toJSONObject(iconFont) {
    return {
      weight: iconFont.weight,
      style: iconFont.style,
      src: iconFont.src.map((s) => ({
        format: s.format,
        location: s.location.toString()
      }))
    };
  }
  IconFontDefinition2.toJSONObject = toJSONObject;
  function fromJSONObject(json) {
    const stringOrUndef = (s) => isString(s) ? s : void 0;
    if (json && Array.isArray(json.src) && json.src.every(
      (s) => isString(s.format) && isString(s.location)
    )) {
      return {
        weight: stringOrUndef(json.weight),
        style: stringOrUndef(json.style),
        src: json.src.map((s) => ({
          format: s.format,
          location: URI.parse(s.location)
        }))
      };
    }
    return void 0;
  }
  IconFontDefinition2.fromJSONObject = fromJSONObject;
})(IconFontDefinition || (IconFontDefinition = {}));
class IconRegistry {
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  iconsById;
  iconSchema = {
    definitions: {
      icons: {
        type: "object",
        properties: {
          fontId: {
            type: "string",
            description: localize(
              "iconDefinition.fontId",
              "The id of the font to use. If not set, the font that is defined first is used."
            )
          },
          fontCharacter: {
            type: "string",
            description: localize(
              "iconDefinition.fontCharacter",
              "The font character associated with the icon definition."
            )
          }
        },
        additionalProperties: false,
        defaultSnippets: [{ body: { fontCharacter: "\\\\e030" } }]
      }
    },
    type: "object",
    properties: {}
  };
  iconReferenceSchema = {
    type: "string",
    pattern: `^${ThemeIcon.iconNameExpression}$`,
    enum: [],
    enumDescriptions: []
  };
  iconFontsById;
  constructor() {
    this.iconsById = {};
    this.iconFontsById = {};
  }
  registerIcon(id, defaults, description, deprecationMessage) {
    const existing = this.iconsById[id];
    if (existing) {
      if (description && !existing.description) {
        existing.description = description;
        this.iconSchema.properties[id].markdownDescription = `${description} $(${id})`;
        const enumIndex = this.iconReferenceSchema.enum.indexOf(id);
        if (enumIndex !== -1) {
          this.iconReferenceSchema.enumDescriptions[enumIndex] = description;
        }
        this._onDidChange.fire();
      }
      return existing;
    }
    const iconContribution = {
      id,
      description,
      defaults,
      deprecationMessage
    };
    this.iconsById[id] = iconContribution;
    const propertySchema = { $ref: "#/definitions/icons" };
    if (deprecationMessage) {
      propertySchema.deprecationMessage = deprecationMessage;
    }
    if (description) {
      propertySchema.markdownDescription = `${description}: $(${id})`;
    }
    this.iconSchema.properties[id] = propertySchema;
    this.iconReferenceSchema.enum.push(id);
    this.iconReferenceSchema.enumDescriptions.push(description || "");
    this._onDidChange.fire();
    return { id };
  }
  deregisterIcon(id) {
    delete this.iconsById[id];
    delete this.iconSchema.properties[id];
    const index = this.iconReferenceSchema.enum.indexOf(id);
    if (index !== -1) {
      this.iconReferenceSchema.enum.splice(index, 1);
      this.iconReferenceSchema.enumDescriptions.splice(index, 1);
    }
    this._onDidChange.fire();
  }
  getIcons() {
    return Object.keys(this.iconsById).map((id) => this.iconsById[id]);
  }
  getIcon(id) {
    return this.iconsById[id];
  }
  getIconSchema() {
    return this.iconSchema;
  }
  getIconReferenceSchema() {
    return this.iconReferenceSchema;
  }
  registerIconFont(id, definition) {
    const existing = this.iconFontsById[id];
    if (existing) {
      return existing;
    }
    this.iconFontsById[id] = definition;
    this._onDidChange.fire();
    return definition;
  }
  deregisterIconFont(id) {
    delete this.iconFontsById[id];
  }
  getIconFont(id) {
    return this.iconFontsById[id];
  }
  toString() {
    const sorter = (i1, i2) => {
      return i1.id.localeCompare(i2.id);
    };
    const classNames = (i) => {
      while (ThemeIcon.isThemeIcon(i.defaults)) {
        i = this.iconsById[i.defaults.id];
      }
      return `codicon codicon-${i ? i.id : ""}`;
    };
    const reference = [];
    reference.push(
      `| preview     | identifier                        | default codicon ID                | description`
    );
    reference.push(
      `| ----------- | --------------------------------- | --------------------------------- | --------------------------------- |`
    );
    const contributions = Object.keys(this.iconsById).map(
      (key) => this.iconsById[key]
    );
    for (const i of contributions.filter((i2) => !!i2.description).sort(sorter)) {
      reference.push(
        `|<i class="${classNames(i)}"></i>|${i.id}|${ThemeIcon.isThemeIcon(i.defaults) ? i.defaults.id : i.id}|${i.description || ""}|`
      );
    }
    reference.push(`| preview     | identifier                        `);
    reference.push(`| ----------- | --------------------------------- |`);
    for (const i of contributions.filter((i2) => !ThemeIcon.isThemeIcon(i2.defaults)).sort(sorter)) {
      reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|`);
    }
    return reference.join("\n");
  }
}
const iconRegistry = new IconRegistry();
platform.Registry.add(Extensions.IconContribution, iconRegistry);
function registerIcon(id, defaults, description, deprecationMessage) {
  return iconRegistry.registerIcon(
    id,
    defaults,
    description,
    deprecationMessage
  );
}
function getIconRegistry() {
  return iconRegistry;
}
function initialize() {
  const codiconFontCharacters = getCodiconFontCharacters();
  for (const icon in codiconFontCharacters) {
    const fontCharacter = "\\" + codiconFontCharacters[icon].toString(16);
    iconRegistry.registerIcon(icon, { fontCharacter });
  }
}
initialize();
const iconsSchemaId = "vscode://schemas/icons";
const schemaRegistry = platform.Registry.as(
  JSONExtensions.JSONContribution
);
schemaRegistry.registerSchema(iconsSchemaId, iconRegistry.getIconSchema());
const delayer = new RunOnceScheduler(
  () => schemaRegistry.notifySchemaChanged(iconsSchemaId),
  200
);
iconRegistry.onDidChange(() => {
  if (!delayer.isScheduled()) {
    delayer.schedule();
  }
});
const widgetClose = registerIcon(
  "widget-close",
  Codicon.close,
  localize("widgetClose", "Icon for the close action in widgets.")
);
const gotoPreviousLocation = registerIcon(
  "goto-previous-location",
  Codicon.arrowUp,
  localize("previousChangeIcon", "Icon for goto previous editor location.")
);
const gotoNextLocation = registerIcon(
  "goto-next-location",
  Codicon.arrowDown,
  localize("nextChangeIcon", "Icon for goto next editor location.")
);
const syncing = ThemeIcon.modify(Codicon.sync, "spin");
const spinningLoading = ThemeIcon.modify(Codicon.loading, "spin");
export {
  Extensions,
  IconContribution,
  IconFontDefinition,
  getIconRegistry,
  gotoNextLocation,
  gotoPreviousLocation,
  iconsSchemaId,
  registerIcon,
  spinningLoading,
  syncing,
  widgetClose
};
