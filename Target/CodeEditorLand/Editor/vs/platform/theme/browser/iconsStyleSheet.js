var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asCSSPropertyValue, asCSSUrl } from "../../../base/browser/dom.js";
import { Emitter } from "../../../base/common/event.js";
import {
  DisposableStore
} from "../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import {
  getIconRegistry
} from "../common/iconRegistry.js";
function getIconsStyleSheet(themeService) {
  const disposable = new DisposableStore();
  const onDidChangeEmmiter = disposable.add(new Emitter());
  const iconRegistry = getIconRegistry();
  disposable.add(iconRegistry.onDidChange(() => onDidChangeEmmiter.fire()));
  if (themeService) {
    disposable.add(
      themeService.onDidProductIconThemeChange(
        () => onDidChangeEmmiter.fire()
      )
    );
  }
  return {
    dispose: /* @__PURE__ */ __name(() => disposable.dispose(), "dispose"),
    onDidChange: onDidChangeEmmiter.event,
    getCSS() {
      const productIconTheme = themeService ? themeService.getProductIconTheme() : new UnthemedProductIconTheme();
      const usedFontIds = {};
      const rules = [];
      const rootAttribs = [];
      for (const contribution of iconRegistry.getIcons()) {
        const definition = productIconTheme.getIcon(contribution);
        if (!definition) {
          continue;
        }
        const fontContribution = definition.font;
        const fontFamilyVar = `--vscode-icon-${contribution.id}-font-family`;
        const contentVar = `--vscode-icon-${contribution.id}-content`;
        if (fontContribution) {
          usedFontIds[fontContribution.id] = fontContribution.definition;
          rootAttribs.push(
            `${fontFamilyVar}: ${asCSSPropertyValue(fontContribution.id)};`,
            `${contentVar}: '${definition.fontCharacter}';`
          );
          rules.push(
            `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; font-family: ${asCSSPropertyValue(fontContribution.id)}; }`
          );
        } else {
          rootAttribs.push(
            `${contentVar}: '${definition.fontCharacter}'; ${fontFamilyVar}: 'codicon';`
          );
          rules.push(
            `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; }`
          );
        }
      }
      for (const id in usedFontIds) {
        const definition = usedFontIds[id];
        const fontWeight = definition.weight ? `font-weight: ${definition.weight};` : "";
        const fontStyle = definition.style ? `font-style: ${definition.style};` : "";
        const src = definition.src.map((l) => `${asCSSUrl(l.location)} format('${l.format}')`).join(", ");
        rules.push(
          `@font-face { src: ${src}; font-family: ${asCSSPropertyValue(id)};${fontWeight}${fontStyle} font-display: block; }`
        );
      }
      rules.push(`:root { ${rootAttribs.join(" ")} }`);
      return rules.join("\n");
    }
  };
}
__name(getIconsStyleSheet, "getIconsStyleSheet");
class UnthemedProductIconTheme {
  static {
    __name(this, "UnthemedProductIconTheme");
  }
  getIcon(contribution) {
    const iconRegistry = getIconRegistry();
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
}
export {
  UnthemedProductIconTheme,
  getIconsStyleSheet
};
//# sourceMappingURL=iconsStyleSheet.js.map
