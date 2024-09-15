var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { format } from "../../../common/strings.js";
import { $, append } from "../../dom.js";
import "./countBadge.css";
const unthemedCountStyles = {
  badgeBackground: "#4D4D4D",
  badgeForeground: "#FFFFFF",
  badgeBorder: void 0
};
class CountBadge {
  constructor(container, options, styles) {
    this.options = options;
    this.styles = styles;
    this.element = append(container, $(".monaco-count-badge"));
    this.countFormat = this.options.countFormat || "{0}";
    this.titleFormat = this.options.titleFormat || "";
    this.setCount(this.options.count || 0);
  }
  static {
    __name(this, "CountBadge");
  }
  element;
  count = 0;
  countFormat;
  titleFormat;
  setCount(count) {
    this.count = count;
    this.render();
  }
  setCountFormat(countFormat) {
    this.countFormat = countFormat;
    this.render();
  }
  setTitleFormat(titleFormat) {
    this.titleFormat = titleFormat;
    this.render();
  }
  render() {
    this.element.textContent = format(this.countFormat, this.count);
    this.element.title = format(this.titleFormat, this.count);
    this.element.style.backgroundColor = this.styles.badgeBackground ?? "";
    this.element.style.color = this.styles.badgeForeground ?? "";
    if (this.styles.badgeBorder) {
      this.element.style.border = `1px solid ${this.styles.badgeBorder}`;
    }
  }
}
export {
  CountBadge,
  unthemedCountStyles
};
//# sourceMappingURL=countBadge.js.map
