import {
  matchesFuzzy,
  matchesFuzzy2
} from "../../../../base/common/filters.js";
import * as strings from "../../../../base/common/strings.js";
class FilterOptions {
  constructor(filter, showResolved, showUnresolved) {
    this.filter = filter;
    filter = filter.trim();
    this.showResolved = showResolved;
    this.showUnresolved = showUnresolved;
    const negate = filter.startsWith("!");
    this.textFilter = {
      text: (negate ? strings.ltrim(filter, "!") : filter).trim(),
      negate
    };
  }
  static _filter = matchesFuzzy2;
  static _messageFilter = matchesFuzzy;
  showResolved = true;
  showUnresolved = true;
  textFilter;
}
export {
  FilterOptions
};
