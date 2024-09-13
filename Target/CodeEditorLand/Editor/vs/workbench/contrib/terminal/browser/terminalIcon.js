var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createStyleSheet } from "../../../../base/browser/dom.js";
import { hash } from "../../../../base/common/hash.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { getIconRegistry } from "../../../../platform/theme/common/iconRegistry.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { ITerminalProfileResolverService } from "../common/terminal.js";
import { ansiColorMap } from "../common/terminalColorRegistry.js";
function getColorClass(terminalOrColorKey) {
  let color;
  if (typeof terminalOrColorKey === "string") {
    color = terminalOrColorKey;
  } else if (terminalOrColorKey.color) {
    color = terminalOrColorKey.color.replace(/\./g, "_");
  } else if (ThemeIcon.isThemeIcon(terminalOrColorKey.icon) && terminalOrColorKey.icon.color) {
    color = terminalOrColorKey.icon.color.id.replace(/\./g, "_");
  }
  if (color) {
    return `terminal-icon-${color.replace(/\./g, "_")}`;
  }
  return void 0;
}
__name(getColorClass, "getColorClass");
function getStandardColors(colorTheme) {
  const standardColors = [];
  for (const colorKey in ansiColorMap) {
    const color = colorTheme.getColor(colorKey);
    if (color && !colorKey.toLowerCase().includes("bright")) {
      standardColors.push(colorKey);
    }
  }
  return standardColors;
}
__name(getStandardColors, "getStandardColors");
function createColorStyleElement(colorTheme) {
  const disposable = new DisposableStore();
  const standardColors = getStandardColors(colorTheme);
  const styleElement = createStyleSheet(void 0, void 0, disposable);
  let css = "";
  for (const colorKey of standardColors) {
    const colorClass = getColorClass(colorKey);
    const color = colorTheme.getColor(colorKey);
    if (color) {
      css += `.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon){ color: ${color} !important; }`;
    }
  }
  styleElement.textContent = css;
  return disposable;
}
__name(createColorStyleElement, "createColorStyleElement");
function getColorStyleContent(colorTheme, editor) {
  const standardColors = getStandardColors(colorTheme);
  let css = "";
  for (const colorKey of standardColors) {
    const colorClass = getColorClass(colorKey);
    const color = colorTheme.getColor(colorKey);
    if (color) {
      if (editor) {
        css += `.monaco-workbench .show-file-icons .predefined-file-icon.terminal-tab.${colorClass}::before,.monaco-workbench .show-file-icons .file-icon.terminal-tab.${colorClass}::before{ color: ${color} !important; }`;
      } else {
        css += `.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon){ color: ${color} !important; }`;
      }
    }
  }
  return css;
}
__name(getColorStyleContent, "getColorStyleContent");
function getUriClasses(terminal, colorScheme, extensionContributed) {
  const icon = terminal.icon;
  if (!icon) {
    return void 0;
  }
  const iconClasses = [];
  let uri;
  if (extensionContributed) {
    if (typeof icon === "string" && (icon.startsWith("$(") || getIconRegistry().getIcon(icon))) {
      return iconClasses;
    } else if (typeof icon === "string") {
      uri = URI.parse(icon);
    }
  }
  if (icon instanceof URI) {
    uri = icon;
  } else if (icon instanceof Object && "light" in icon && "dark" in icon) {
    uri = colorScheme === ColorScheme.LIGHT ? icon.light : icon.dark;
  }
  if (uri instanceof URI) {
    const uriIconKey = hash(uri.path).toString(36);
    const className = `terminal-uri-icon-${uriIconKey}`;
    iconClasses.push(className);
    iconClasses.push(`terminal-uri-icon`);
  }
  return iconClasses;
}
__name(getUriClasses, "getUriClasses");
function getIconId(accessor, terminal) {
  if (!terminal.icon || terminal.icon instanceof Object && !("id" in terminal.icon)) {
    return accessor.get(ITerminalProfileResolverService).getDefaultIcon().id;
  }
  return typeof terminal.icon === "string" ? terminal.icon : terminal.icon.id;
}
__name(getIconId, "getIconId");
export {
  createColorStyleElement,
  getColorClass,
  getColorStyleContent,
  getIconId,
  getStandardColors,
  getUriClasses
};
//# sourceMappingURL=terminalIcon.js.map
