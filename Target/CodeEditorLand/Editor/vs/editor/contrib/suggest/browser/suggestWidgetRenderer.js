var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { $, append, hide, show } from "../../../../base/browser/dom.js";
import { IconLabel, IIconLabelValueOptions } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { IListRenderer } from "../../../../base/browser/ui/list/list.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { createMatches } from "../../../../base/common/filters.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { CompletionItemKind, CompletionItemKinds, CompletionItemTag } from "../../../common/languages.js";
import { getIconClasses } from "../../../common/services/getIconClasses.js";
import { IModelService } from "../../../common/services/model.js";
import { ILanguageService } from "../../../common/languages/language.js";
import * as nls from "../../../../nls.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { CompletionItem } from "./suggest.js";
import { canExpandCompletionItem } from "./suggestWidgetDetails.js";
function getAriaId(index) {
  return `suggest-aria-id:${index}`;
}
__name(getAriaId, "getAriaId");
const suggestMoreInfoIcon = registerIcon("suggest-more-info", Codicon.chevronRight, nls.localize("suggestMoreInfoIcon", "Icon for more information in the suggest widget."));
const _completionItemColor = new class ColorExtractor {
  static {
    __name(this, "ColorExtractor");
  }
  static _regexRelaxed = /(#([\da-fA-F]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))/;
  static _regexStrict = new RegExp(`^${ColorExtractor._regexRelaxed.source}$`, "i");
  extract(item, out) {
    if (item.textLabel.match(ColorExtractor._regexStrict)) {
      out[0] = item.textLabel;
      return true;
    }
    if (item.completion.detail && item.completion.detail.match(ColorExtractor._regexStrict)) {
      out[0] = item.completion.detail;
      return true;
    }
    if (item.completion.documentation) {
      const value = typeof item.completion.documentation === "string" ? item.completion.documentation : item.completion.documentation.value;
      const match = ColorExtractor._regexRelaxed.exec(value);
      if (match && (match.index === 0 || match.index + match[0].length === value.length)) {
        out[0] = match[0];
        return true;
      }
    }
    return false;
  }
}();
let ItemRenderer = class {
  constructor(_editor, _modelService, _languageService, _themeService) {
    this._editor = _editor;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._themeService = _themeService;
  }
  static {
    __name(this, "ItemRenderer");
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
    const readMore = append(right, $("span.readMore" + ThemeIcon.asCSSSelector(suggestMoreInfoIcon)));
    readMore.title = nls.localize("readMore", "Read More");
    const configureFont = /* @__PURE__ */ __name(() => {
      const options = this._editor.getOptions();
      const fontInfo = options.get(EditorOption.fontInfo);
      const fontFamily = fontInfo.getMassagedFontFamily();
      const fontFeatureSettings = fontInfo.fontFeatureSettings;
      const fontSize = options.get(EditorOption.suggestFontSize) || fontInfo.fontSize;
      const lineHeight = options.get(EditorOption.suggestLineHeight) || fontInfo.lineHeight;
      const fontWeight = fontInfo.fontWeight;
      const letterSpacing = fontInfo.letterSpacing;
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
      readMore.style.height = lineHeightPx;
      readMore.style.width = lineHeightPx;
    }, "configureFont");
    return { root, left, right, icon, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, readMore, disposables, configureFont };
  }
  renderElement(element, index, data) {
    data.configureFont();
    const { completion } = element;
    data.root.id = getAriaId(index);
    data.colorspan.style.backgroundColor = "";
    const labelOptions = {
      labelEscapeNewLines: true,
      matches: createMatches(element.score)
    };
    const color = [];
    if (completion.kind === CompletionItemKind.Color && _completionItemColor.extract(element, color)) {
      data.icon.className = "icon customcolor";
      data.iconContainer.className = "icon hide";
      data.colorspan.style.backgroundColor = color[0];
    } else if (completion.kind === CompletionItemKind.File && this._themeService.getFileIconTheme().hasFileIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      const labelClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), FileKind.FILE);
      const detailClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), FileKind.FILE);
      labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
    } else if (completion.kind === CompletionItemKind.Folder && this._themeService.getFileIconTheme().hasFolderIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      labelOptions.extraClasses = [
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), FileKind.FOLDER),
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), FileKind.FOLDER)
      ].flat();
    } else {
      data.icon.className = "icon hide";
      data.iconContainer.className = "";
      data.iconContainer.classList.add("suggest-icon", ...ThemeIcon.asClassNameArray(CompletionItemKinds.toIcon(completion.kind)));
    }
    if (completion.tags && completion.tags.indexOf(CompletionItemTag.Deprecated) >= 0) {
      labelOptions.extraClasses = (labelOptions.extraClasses || []).concat(["deprecated"]);
      labelOptions.matches = [];
    }
    data.iconLabel.setLabel(element.textLabel, void 0, labelOptions);
    if (typeof completion.label === "string") {
      data.parametersLabel.textContent = "";
      data.detailsLabel.textContent = stripNewLines(completion.detail || "");
      data.root.classList.add("string-label");
    } else {
      data.parametersLabel.textContent = stripNewLines(completion.label.detail || "");
      data.detailsLabel.textContent = stripNewLines(completion.label.description || "");
      data.root.classList.remove("string-label");
    }
    if (this._editor.getOption(EditorOption.suggest).showInlineDetails) {
      show(data.detailsLabel);
    } else {
      hide(data.detailsLabel);
    }
    if (canExpandCompletionItem(element)) {
      data.right.classList.add("can-expand-details");
      show(data.readMore);
      data.readMore.onmousedown = (e) => {
        e.stopPropagation();
        e.preventDefault();
      };
      data.readMore.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._onDidToggleDetails.fire();
      };
    } else {
      data.right.classList.remove("can-expand-details");
      hide(data.readMore);
      data.readMore.onmousedown = null;
      data.readMore.onclick = null;
    }
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
ItemRenderer = __decorateClass([
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IThemeService)
], ItemRenderer);
function stripNewLines(str) {
  return str.replace(/\r\n|\r|\n/g, "");
}
__name(stripNewLines, "stripNewLines");
export {
  ItemRenderer,
  getAriaId
};
//# sourceMappingURL=suggestWidgetRenderer.js.map
