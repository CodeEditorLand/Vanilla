var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { $, append, show } from "../../../../base/browser/dom.js";
import { IconLabel, IIconLabelValueOptions } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { IListRenderer } from "../../../../base/browser/ui/list/list.js";
import { SimpleCompletionItem } from "./simpleCompletionItem.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { createMatches } from "../../../../base/common/filters.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
function getAriaId(index) {
  return `simple-suggest-aria-id:${index}`;
}
__name(getAriaId, "getAriaId");
class SimpleSuggestWidgetItemRenderer {
  constructor(_getFontInfo) {
    this._getFontInfo = _getFontInfo;
  }
  static {
    __name(this, "SimpleSuggestWidgetItemRenderer");
  }
  _onDidToggleDetails = new Emitter();
  onDidToggleDetails = this._onDidToggleDetails.event;
  templateId = "suggestion";
  dispose() {
    this._onDidToggleDetails.dispose();
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const root = container;
    root.classList.add("show-file-icons");
    const icon = append(container, $(".icon"));
    const colorspan = append(icon, $("span.colorspan"));
    const text = append(container, $(".contents"));
    const main = append(text, $(".main"));
    const iconContainer = append(main, $(".icon-label.codicon"));
    const left = append(main, $("span.left"));
    const right = append(main, $("span.right"));
    const iconLabel = new IconLabel(left, { supportHighlights: true, supportIcons: true });
    disposables.add(iconLabel);
    const parametersLabel = append(left, $("span.signature-label"));
    const qualifierLabel = append(left, $("span.qualifier-label"));
    const detailsLabel = append(right, $("span.details-label"));
    const configureFont = /* @__PURE__ */ __name(() => {
      const fontFeatureSettings = "";
      const { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } = this._getFontInfo();
      const fontSizePx = `${fontSize}px`;
      const lineHeightPx = `${lineHeight}px`;
      const letterSpacingPx = `${letterSpacing}px`;
      root.style.fontSize = fontSizePx;
      root.style.fontWeight = fontWeight;
      root.style.letterSpacing = letterSpacingPx;
      main.style.fontFamily = fontFamily;
      main.style.fontFeatureSettings = fontFeatureSettings;
      main.style.lineHeight = lineHeightPx;
      icon.style.height = lineHeightPx;
      icon.style.width = lineHeightPx;
    }, "configureFont");
    configureFont();
    return { root, left, right, icon, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, disposables };
  }
  renderElement(element, index, data) {
    const { completion } = element;
    data.root.id = getAriaId(index);
    data.colorspan.style.backgroundColor = "";
    const labelOptions = {
      labelEscapeNewLines: true,
      matches: createMatches(element.score)
    };
    data.icon.className = "icon hide";
    data.iconContainer.className = "";
    data.iconContainer.classList.add("suggest-icon", ...ThemeIcon.asClassNameArray(completion.icon || Codicon.symbolText));
    data.iconLabel.setLabel(completion.label, void 0, labelOptions);
    data.parametersLabel.textContent = "";
    data.detailsLabel.textContent = stripNewLines(completion.detail || "");
    data.root.classList.add("string-label");
    show(data.detailsLabel);
    data.right.classList.remove("can-expand-details");
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
}
function stripNewLines(str) {
  return str.replace(/\r\n|\r|\n/g, "");
}
__name(stripNewLines, "stripNewLines");
export {
  SimpleSuggestWidgetItemRenderer,
  getAriaId
};
//# sourceMappingURL=simpleSuggestWidgetRenderer.js.map
