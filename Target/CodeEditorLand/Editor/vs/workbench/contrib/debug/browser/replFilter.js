var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { splitGlobAware } from "../../../../base/common/glob.js";
import { ITreeFilter, TreeVisibility, TreeFilterResult } from "../../../../base/browser/ui/tree/tree.js";
import { IReplElement } from "../common/debug.js";
import { ReplEvaluationResult, ReplEvaluationInput } from "../common/replModel.js";
import { Variable } from "../common/debugModel.js";
class ReplFilter {
  static {
    __name(this, "ReplFilter");
  }
  static matchQuery = matchesFuzzy;
  _parsedQueries = [];
  set filterQuery(query) {
    this._parsedQueries = [];
    query = query.trim();
    if (query && query !== "") {
      const filters = splitGlobAware(query, ",").map((s) => s.trim()).filter((s) => !!s.length);
      for (const f of filters) {
        if (f.startsWith("\\")) {
          this._parsedQueries.push({ type: "include", query: f.slice(1) });
        } else if (f.startsWith("!")) {
          this._parsedQueries.push({ type: "exclude", query: f.slice(1) });
        } else {
          this._parsedQueries.push({ type: "include", query: f });
        }
      }
    }
  }
  filter(element, parentVisibility) {
    if (element instanceof ReplEvaluationInput || element instanceof ReplEvaluationResult || element instanceof Variable) {
      return TreeVisibility.Visible;
    }
    let includeQueryPresent = false;
    let includeQueryMatched = false;
    const text = element.toString(true);
    for (const { type, query } of this._parsedQueries) {
      if (type === "exclude" && ReplFilter.matchQuery(query, text)) {
        return false;
      } else if (type === "include") {
        includeQueryPresent = true;
        if (ReplFilter.matchQuery(query, text)) {
          includeQueryMatched = true;
        }
      }
    }
    return includeQueryPresent ? includeQueryMatched : typeof parentVisibility !== "undefined" ? parentVisibility : TreeVisibility.Visible;
  }
}
export {
  ReplFilter
};
//# sourceMappingURL=replFilter.js.map
