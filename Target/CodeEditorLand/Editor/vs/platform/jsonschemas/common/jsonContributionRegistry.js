var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import {
  getCompressedContent
} from "../../../base/common/jsonSchema.js";
import * as platform from "../../registry/common/platform.js";
const Extensions = {
  JSONContribution: "base.contributions.json"
};
function normalizeId(id) {
  if (id.length > 0 && id.charAt(id.length - 1) === "#") {
    return id.substring(0, id.length - 1);
  }
  return id;
}
__name(normalizeId, "normalizeId");
class JSONContributionRegistry {
  static {
    __name(this, "JSONContributionRegistry");
  }
  schemasById;
  _onDidChangeSchema = new Emitter();
  onDidChangeSchema = this._onDidChangeSchema.event;
  constructor() {
    this.schemasById = {};
  }
  registerSchema(uri, unresolvedSchemaContent) {
    this.schemasById[normalizeId(uri)] = unresolvedSchemaContent;
    this._onDidChangeSchema.fire(uri);
  }
  notifySchemaChanged(uri) {
    this._onDidChangeSchema.fire(uri);
  }
  getSchemaContributions() {
    return {
      schemas: this.schemasById
    };
  }
  getSchemaContent(uri) {
    const schema = this.schemasById[uri];
    return schema ? getCompressedContent(schema) : void 0;
  }
  hasSchemaContent(uri) {
    return !!this.schemasById[uri];
  }
}
const jsonContributionRegistry = new JSONContributionRegistry();
platform.Registry.add(Extensions.JSONContribution, jsonContributionRegistry);
export {
  Extensions
};
//# sourceMappingURL=jsonContributionRegistry.js.map
