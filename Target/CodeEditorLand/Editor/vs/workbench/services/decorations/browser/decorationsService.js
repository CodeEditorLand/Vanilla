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
import {
  asCSSPropertyValue,
  createCSSRule,
  createStyleSheet,
  removeCSSRulesContainingSelector
} from "../../../../base/browser/dom.js";
import { asArray, distinct } from "../../../../base/common/arrays.js";
import { isThenable } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import {
  DebounceEmitter,
  Emitter
} from "../../../../base/common/event.js";
import { hash } from "../../../../base/common/hash.js";
import {
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  asCssVariable
} from "../../../../platform/theme/common/colorRegistry.js";
import { getIconRegistry } from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IDecorationsService
} from "../common/decorations.js";
class DecorationRule {
  constructor(themeService, data, key) {
    this.themeService = themeService;
    this.data = data;
    const suffix = hash(key).toString(36);
    this.itemColorClassName = `${DecorationRule._classNamesPrefix}-itemColor-${suffix}`;
    this.itemBadgeClassName = `${DecorationRule._classNamesPrefix}-itemBadge-${suffix}`;
    this.bubbleBadgeClassName = `${DecorationRule._classNamesPrefix}-bubbleBadge-${suffix}`;
    this.iconBadgeClassName = `${DecorationRule._classNamesPrefix}-iconBadge-${suffix}`;
  }
  static {
    __name(this, "DecorationRule");
  }
  static keyOf(data) {
    if (Array.isArray(data)) {
      return data.map(DecorationRule.keyOf).join(",");
    } else {
      const { color, letter } = data;
      if (ThemeIcon.isThemeIcon(letter)) {
        return `${color}+${letter.id}`;
      } else {
        return `${color}/${letter}`;
      }
    }
  }
  static _classNamesPrefix = "monaco-decoration";
  data;
  itemColorClassName;
  itemBadgeClassName;
  iconBadgeClassName;
  bubbleBadgeClassName;
  _refCounter = 0;
  acquire() {
    this._refCounter += 1;
  }
  release() {
    return --this._refCounter === 0;
  }
  appendCSSRules(element) {
    if (Array.isArray(this.data)) {
      this._appendForMany(this.data, element);
    } else {
      this._appendForOne(this.data, element);
    }
  }
  _appendForOne(data, element) {
    const { color, letter } = data;
    createCSSRule(
      `.${this.itemColorClassName}`,
      `color: ${getColor(color)};`,
      element
    );
    if (ThemeIcon.isThemeIcon(letter)) {
      this._createIconCSSRule(letter, color, element);
    } else if (letter) {
      createCSSRule(
        `.${this.itemBadgeClassName}::after`,
        `content: "${letter}"; color: ${getColor(color)};`,
        element
      );
    }
  }
  _appendForMany(data, element) {
    const { color } = data.find((d) => !!d.color) ?? data[0];
    createCSSRule(
      `.${this.itemColorClassName}`,
      `color: ${getColor(color)};`,
      element
    );
    const letters = [];
    let icon;
    for (const d of data) {
      if (ThemeIcon.isThemeIcon(d.letter)) {
        icon = d.letter;
        break;
      } else if (d.letter) {
        letters.push(d.letter);
      }
    }
    if (icon) {
      this._createIconCSSRule(icon, color, element);
    } else {
      if (letters.length) {
        createCSSRule(
          `.${this.itemBadgeClassName}::after`,
          `content: "${letters.join(", ")}"; color: ${getColor(color)};`,
          element
        );
      }
      createCSSRule(
        `.${this.bubbleBadgeClassName}::after`,
        `content: "\uEA71"; color: ${getColor(color)}; font-family: codicon; font-size: 14px; margin-right: 14px; opacity: 0.4;`,
        element
      );
    }
  }
  _createIconCSSRule(icon, color, element) {
    const modifier = ThemeIcon.getModifier(icon);
    if (modifier) {
      icon = ThemeIcon.modify(icon, void 0);
    }
    const iconContribution = getIconRegistry().getIcon(icon.id);
    if (!iconContribution) {
      return;
    }
    const definition = this.themeService.getProductIconTheme().getIcon(iconContribution);
    if (!definition) {
      return;
    }
    createCSSRule(
      `.${this.iconBadgeClassName}::after`,
      `content: '${definition.fontCharacter}';
			color: ${icon.color ? getColor(icon.color.id) : getColor(color)};
			font-family: ${asCSSPropertyValue(definition.font?.id ?? "codicon")};
			font-size: 16px;
			margin-right: 14px;
			font-weight: normal;
			${modifier === "spin" ? "animation: codicon-spin 1.5s steps(30) infinite" : ""};
			`,
      element
    );
  }
  removeCSSRules(element) {
    removeCSSRulesContainingSelector(this.itemColorClassName, element);
    removeCSSRulesContainingSelector(this.itemBadgeClassName, element);
    removeCSSRulesContainingSelector(this.bubbleBadgeClassName, element);
    removeCSSRulesContainingSelector(this.iconBadgeClassName, element);
  }
}
class DecorationStyles {
  constructor(_themeService) {
    this._themeService = _themeService;
  }
  static {
    __name(this, "DecorationStyles");
  }
  _dispoables = new DisposableStore();
  _styleElement = createStyleSheet(
    void 0,
    void 0,
    this._dispoables
  );
  _decorationRules = /* @__PURE__ */ new Map();
  dispose() {
    this._dispoables.dispose();
  }
  asDecoration(data, onlyChildren) {
    data.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    const key = DecorationRule.keyOf(data);
    let rule = this._decorationRules.get(key);
    if (!rule) {
      rule = new DecorationRule(this._themeService, data, key);
      this._decorationRules.set(key, rule);
      rule.appendCSSRules(this._styleElement);
    }
    rule.acquire();
    const labelClassName = rule.itemColorClassName;
    let badgeClassName = rule.itemBadgeClassName;
    const iconClassName = rule.iconBadgeClassName;
    let tooltip = distinct(
      data.filter((d) => !isFalsyOrWhitespace(d.tooltip)).map((d) => d.tooltip)
    ).join(" \u2022 ");
    const strikethrough = data.some((d) => d.strikethrough);
    if (onlyChildren) {
      badgeClassName = rule.bubbleBadgeClassName;
      tooltip = localize("bubbleTitle", "Contains emphasized items");
    }
    return {
      labelClassName,
      badgeClassName,
      iconClassName,
      strikethrough,
      tooltip,
      dispose: /* @__PURE__ */ __name(() => {
        if (rule?.release()) {
          this._decorationRules.delete(key);
          rule.removeCSSRules(this._styleElement);
          rule = void 0;
        }
      }, "dispose")
    };
  }
}
class FileDecorationChangeEvent {
  static {
    __name(this, "FileDecorationChangeEvent");
  }
  _data = TernarySearchTree.forUris((_uri) => true);
  // events ignore all path casings
  constructor(all) {
    this._data.fill(true, asArray(all));
  }
  affectsResource(uri) {
    return this._data.hasElementOrSubtree(uri);
  }
}
class DecorationDataRequest {
  constructor(source, thenable) {
    this.source = source;
    this.thenable = thenable;
  }
  static {
    __name(this, "DecorationDataRequest");
  }
}
function getColor(color) {
  return color ? asCssVariable(color) : "inherit";
}
__name(getColor, "getColor");
let DecorationsService = class {
  static {
    __name(this, "DecorationsService");
  }
  _store = new DisposableStore();
  _onDidChangeDecorationsDelayed = this._store.add(
    new DebounceEmitter({ merge: /* @__PURE__ */ __name((all) => all.flat(), "merge") })
  );
  _onDidChangeDecorations = this._store.add(
    new Emitter()
  );
  onDidChangeDecorations = this._onDidChangeDecorations.event;
  _provider = new LinkedList();
  _decorationStyles;
  _data;
  constructor(uriIdentityService, themeService) {
    this._decorationStyles = new DecorationStyles(themeService);
    this._data = TernarySearchTree.forUris(
      (key) => uriIdentityService.extUri.ignorePathCasing(key)
    );
    this._store.add(
      this._onDidChangeDecorationsDelayed.event((event) => {
        this._onDidChangeDecorations.fire(
          new FileDecorationChangeEvent(event)
        );
      })
    );
  }
  dispose() {
    this._store.dispose();
    this._data.clear();
  }
  registerDecorationsProvider(provider) {
    const rm = this._provider.unshift(provider);
    this._onDidChangeDecorations.fire({
      // everything might have changed
      affectsResource() {
        return true;
      }
    });
    const removeAll = /* @__PURE__ */ __name(() => {
      const uris = [];
      for (const [uri, map] of this._data) {
        if (map.delete(provider)) {
          uris.push(uri);
        }
      }
      if (uris.length > 0) {
        this._onDidChangeDecorationsDelayed.fire(uris);
      }
    }, "removeAll");
    const listener = provider.onDidChange((uris) => {
      if (uris) {
        for (const uri of uris) {
          const map = this._ensureEntry(uri);
          this._fetchData(map, uri, provider);
        }
      } else {
        removeAll();
      }
    });
    return toDisposable(() => {
      rm();
      listener.dispose();
      removeAll();
    });
  }
  _ensureEntry(uri) {
    let map = this._data.get(uri);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      this._data.set(uri, map);
    }
    return map;
  }
  getDecoration(uri, includeChildren) {
    const all = [];
    let containsChildren = false;
    const map = this._ensureEntry(uri);
    for (const provider of this._provider) {
      let data = map.get(provider);
      if (data === void 0) {
        data = this._fetchData(map, uri, provider);
      }
      if (data && !(data instanceof DecorationDataRequest)) {
        all.push(data);
      }
    }
    if (includeChildren) {
      const iter = this._data.findSuperstr(uri);
      if (iter) {
        for (const tuple of iter) {
          for (const data of tuple[1].values()) {
            if (data && !(data instanceof DecorationDataRequest)) {
              if (data.bubble) {
                all.push(data);
                containsChildren = true;
              }
            }
          }
        }
      }
    }
    return all.length === 0 ? void 0 : this._decorationStyles.asDecoration(all, containsChildren);
  }
  _fetchData(map, uri, provider) {
    const pendingRequest = map.get(provider);
    if (pendingRequest instanceof DecorationDataRequest) {
      pendingRequest.source.cancel();
      map.delete(provider);
    }
    const cts = new CancellationTokenSource();
    const dataOrThenable = provider.provideDecorations(uri, cts.token);
    if (isThenable(dataOrThenable)) {
      const request = new DecorationDataRequest(
        cts,
        Promise.resolve(dataOrThenable).then((data) => {
          if (map.get(provider) === request) {
            this._keepItem(map, provider, uri, data);
          }
        }).catch((err) => {
          if (!isCancellationError(err) && map.get(provider) === request) {
            map.delete(provider);
          }
        }).finally(() => {
          cts.dispose();
        })
      );
      map.set(provider, request);
      return null;
    } else {
      cts.dispose();
      return this._keepItem(map, provider, uri, dataOrThenable);
    }
  }
  _keepItem(map, provider, uri, data) {
    const deco = data ? data : null;
    const old = map.get(provider);
    map.set(provider, deco);
    if (deco || old) {
      this._onDidChangeDecorationsDelayed.fire(uri);
    }
    return deco;
  }
};
DecorationsService = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, IThemeService)
], DecorationsService);
registerSingleton(
  IDecorationsService,
  DecorationsService,
  InstantiationType.Delayed
);
export {
  DecorationsService
};
//# sourceMappingURL=decorationsService.js.map
