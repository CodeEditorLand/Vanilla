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
import * as dom from "../../../base/browser/dom.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
import * as strings from "../../../base/common/strings.js";
import { URI } from "../../../base/common/uri.js";
import {
  IThemeService
} from "../../../platform/theme/common/themeService.js";
import {
  isThemeColor
} from "../../common/editorCommon.js";
import {
  OverviewRulerLane
} from "../../common/model.js";
let AbstractCodeEditorService = class extends Disposable {
  constructor(_themeService) {
    super();
    this._themeService = _themeService;
    this._codeEditors = /* @__PURE__ */ Object.create(null);
    this._diffEditors = /* @__PURE__ */ Object.create(null);
    this._globalStyleSheet = null;
  }
  static {
    __name(this, "AbstractCodeEditorService");
  }
  _onWillCreateCodeEditor = this._register(
    new Emitter()
  );
  onWillCreateCodeEditor = this._onWillCreateCodeEditor.event;
  _onCodeEditorAdd = this._register(
    new Emitter()
  );
  onCodeEditorAdd = this._onCodeEditorAdd.event;
  _onCodeEditorRemove = this._register(
    new Emitter()
  );
  onCodeEditorRemove = this._onCodeEditorRemove.event;
  _onWillCreateDiffEditor = this._register(
    new Emitter()
  );
  onWillCreateDiffEditor = this._onWillCreateDiffEditor.event;
  _onDiffEditorAdd = this._register(
    new Emitter()
  );
  onDiffEditorAdd = this._onDiffEditorAdd.event;
  _onDiffEditorRemove = this._register(
    new Emitter()
  );
  onDiffEditorRemove = this._onDiffEditorRemove.event;
  _onDidChangeTransientModelProperty = this._register(new Emitter());
  onDidChangeTransientModelProperty = this._onDidChangeTransientModelProperty.event;
  _onDecorationTypeRegistered = this._register(new Emitter());
  onDecorationTypeRegistered = this._onDecorationTypeRegistered.event;
  _codeEditors;
  _diffEditors;
  _globalStyleSheet;
  _decorationOptionProviders = /* @__PURE__ */ new Map();
  _editorStyleSheets = /* @__PURE__ */ new Map();
  _codeEditorOpenHandlers = new LinkedList();
  willCreateCodeEditor() {
    this._onWillCreateCodeEditor.fire();
  }
  addCodeEditor(editor) {
    this._codeEditors[editor.getId()] = editor;
    this._onCodeEditorAdd.fire(editor);
  }
  removeCodeEditor(editor) {
    if (delete this._codeEditors[editor.getId()]) {
      this._onCodeEditorRemove.fire(editor);
    }
  }
  listCodeEditors() {
    return Object.keys(this._codeEditors).map(
      (id) => this._codeEditors[id]
    );
  }
  willCreateDiffEditor() {
    this._onWillCreateDiffEditor.fire();
  }
  addDiffEditor(editor) {
    this._diffEditors[editor.getId()] = editor;
    this._onDiffEditorAdd.fire(editor);
  }
  removeDiffEditor(editor) {
    if (delete this._diffEditors[editor.getId()]) {
      this._onDiffEditorRemove.fire(editor);
    }
  }
  listDiffEditors() {
    return Object.keys(this._diffEditors).map(
      (id) => this._diffEditors[id]
    );
  }
  getFocusedCodeEditor() {
    let editorWithWidgetFocus = null;
    const editors = this.listCodeEditors();
    for (const editor of editors) {
      if (editor.hasTextFocus()) {
        return editor;
      }
      if (editor.hasWidgetFocus()) {
        editorWithWidgetFocus = editor;
      }
    }
    return editorWithWidgetFocus;
  }
  _getOrCreateGlobalStyleSheet() {
    if (!this._globalStyleSheet) {
      this._globalStyleSheet = this._createGlobalStyleSheet();
    }
    return this._globalStyleSheet;
  }
  _createGlobalStyleSheet() {
    return new GlobalStyleSheet(dom.createStyleSheet());
  }
  _getOrCreateStyleSheet(editor) {
    if (!editor) {
      return this._getOrCreateGlobalStyleSheet();
    }
    const domNode = editor.getContainerDomNode();
    if (!dom.isInShadowDOM(domNode)) {
      return this._getOrCreateGlobalStyleSheet();
    }
    const editorId = editor.getId();
    if (!this._editorStyleSheets.has(editorId)) {
      const refCountedStyleSheet = new RefCountedStyleSheet(
        this,
        editorId,
        dom.createStyleSheet(domNode)
      );
      this._editorStyleSheets.set(editorId, refCountedStyleSheet);
    }
    return this._editorStyleSheets.get(editorId);
  }
  _removeEditorStyleSheets(editorId) {
    this._editorStyleSheets.delete(editorId);
  }
  registerDecorationType(description, key, options, parentTypeKey, editor) {
    let provider = this._decorationOptionProviders.get(key);
    if (!provider) {
      const styleSheet = this._getOrCreateStyleSheet(editor);
      const providerArgs = {
        styleSheet,
        key,
        parentTypeKey,
        options: options || /* @__PURE__ */ Object.create(null)
      };
      if (parentTypeKey) {
        provider = new DecorationSubTypeOptionsProvider(
          this._themeService,
          styleSheet,
          providerArgs
        );
      } else {
        provider = new DecorationTypeOptionsProvider(
          description,
          this._themeService,
          styleSheet,
          providerArgs
        );
      }
      this._decorationOptionProviders.set(key, provider);
      this._onDecorationTypeRegistered.fire(key);
    }
    provider.refCount++;
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.removeDecorationType(key);
      }, "dispose")
    };
  }
  listDecorationTypes() {
    return Array.from(this._decorationOptionProviders.keys());
  }
  removeDecorationType(key) {
    const provider = this._decorationOptionProviders.get(key);
    if (provider) {
      provider.refCount--;
      if (provider.refCount <= 0) {
        this._decorationOptionProviders.delete(key);
        provider.dispose();
        this.listCodeEditors().forEach(
          (ed) => ed.removeDecorationsByType(key)
        );
      }
    }
  }
  resolveDecorationOptions(decorationTypeKey, writable) {
    const provider = this._decorationOptionProviders.get(decorationTypeKey);
    if (!provider) {
      throw new Error(
        "Unknown decoration type key: " + decorationTypeKey
      );
    }
    return provider.getOptions(this, writable);
  }
  resolveDecorationCSSRules(decorationTypeKey) {
    const provider = this._decorationOptionProviders.get(decorationTypeKey);
    if (!provider) {
      return null;
    }
    return provider.resolveDecorationCSSRules();
  }
  _transientWatchers = {};
  _modelProperties = /* @__PURE__ */ new Map();
  setModelProperty(resource, key, value) {
    const key1 = resource.toString();
    let dest;
    if (this._modelProperties.has(key1)) {
      dest = this._modelProperties.get(key1);
    } else {
      dest = /* @__PURE__ */ new Map();
      this._modelProperties.set(key1, dest);
    }
    dest.set(key, value);
  }
  getModelProperty(resource, key) {
    const key1 = resource.toString();
    if (this._modelProperties.has(key1)) {
      const innerMap = this._modelProperties.get(key1);
      return innerMap.get(key);
    }
    return void 0;
  }
  setTransientModelProperty(model, key, value) {
    const uri = model.uri.toString();
    let w;
    if (this._transientWatchers.hasOwnProperty(uri)) {
      w = this._transientWatchers[uri];
    } else {
      w = new ModelTransientSettingWatcher(uri, model, this);
      this._transientWatchers[uri] = w;
    }
    const previousValue = w.get(key);
    if (previousValue !== value) {
      w.set(key, value);
      this._onDidChangeTransientModelProperty.fire(model);
    }
  }
  getTransientModelProperty(model, key) {
    const uri = model.uri.toString();
    if (!this._transientWatchers.hasOwnProperty(uri)) {
      return void 0;
    }
    return this._transientWatchers[uri].get(key);
  }
  getTransientModelProperties(model) {
    const uri = model.uri.toString();
    if (!this._transientWatchers.hasOwnProperty(uri)) {
      return void 0;
    }
    return this._transientWatchers[uri].keys().map((key) => [key, this._transientWatchers[uri].get(key)]);
  }
  _removeWatcher(w) {
    delete this._transientWatchers[w.uri];
  }
  async openCodeEditor(input, source, sideBySide) {
    for (const handler of this._codeEditorOpenHandlers) {
      const candidate = await handler(input, source, sideBySide);
      if (candidate !== null) {
        return candidate;
      }
    }
    return null;
  }
  registerCodeEditorOpenHandler(handler) {
    const rm = this._codeEditorOpenHandlers.unshift(handler);
    return toDisposable(rm);
  }
};
AbstractCodeEditorService = __decorateClass([
  __decorateParam(0, IThemeService)
], AbstractCodeEditorService);
class ModelTransientSettingWatcher {
  static {
    __name(this, "ModelTransientSettingWatcher");
  }
  uri;
  _values;
  constructor(uri, model, owner) {
    this.uri = uri;
    this._values = {};
    model.onWillDispose(() => owner._removeWatcher(this));
  }
  set(key, value) {
    this._values[key] = value;
  }
  get(key) {
    return this._values[key];
  }
  keys() {
    return Object.keys(this._values);
  }
}
class RefCountedStyleSheet {
  static {
    __name(this, "RefCountedStyleSheet");
  }
  _parent;
  _editorId;
  _styleSheet;
  _refCount;
  get sheet() {
    return this._styleSheet.sheet;
  }
  constructor(parent, editorId, styleSheet) {
    this._parent = parent;
    this._editorId = editorId;
    this._styleSheet = styleSheet;
    this._refCount = 0;
  }
  ref() {
    this._refCount++;
  }
  unref() {
    this._refCount--;
    if (this._refCount === 0) {
      this._styleSheet.remove();
      this._parent._removeEditorStyleSheets(this._editorId);
    }
  }
  insertRule(selector, rule) {
    dom.createCSSRule(selector, rule, this._styleSheet);
  }
  removeRulesContainingSelector(ruleName) {
    dom.removeCSSRulesContainingSelector(ruleName, this._styleSheet);
  }
}
class GlobalStyleSheet {
  static {
    __name(this, "GlobalStyleSheet");
  }
  _styleSheet;
  get sheet() {
    return this._styleSheet.sheet;
  }
  constructor(styleSheet) {
    this._styleSheet = styleSheet;
  }
  ref() {
  }
  unref() {
  }
  insertRule(selector, rule) {
    dom.createCSSRule(selector, rule, this._styleSheet);
  }
  removeRulesContainingSelector(ruleName) {
    dom.removeCSSRulesContainingSelector(ruleName, this._styleSheet);
  }
}
class DecorationSubTypeOptionsProvider {
  static {
    __name(this, "DecorationSubTypeOptionsProvider");
  }
  _styleSheet;
  refCount;
  _parentTypeKey;
  _beforeContentRules;
  _afterContentRules;
  constructor(themeService, styleSheet, providerArgs) {
    this._styleSheet = styleSheet;
    this._styleSheet.ref();
    this._parentTypeKey = providerArgs.parentTypeKey;
    this.refCount = 0;
    this._beforeContentRules = new DecorationCSSRules(
      3 /* BeforeContentClassName */,
      providerArgs,
      themeService
    );
    this._afterContentRules = new DecorationCSSRules(
      4 /* AfterContentClassName */,
      providerArgs,
      themeService
    );
  }
  getOptions(codeEditorService, writable) {
    const options = codeEditorService.resolveDecorationOptions(
      this._parentTypeKey,
      true
    );
    if (this._beforeContentRules) {
      options.beforeContentClassName = this._beforeContentRules.className;
    }
    if (this._afterContentRules) {
      options.afterContentClassName = this._afterContentRules.className;
    }
    return options;
  }
  resolveDecorationCSSRules() {
    return this._styleSheet.sheet.cssRules;
  }
  dispose() {
    if (this._beforeContentRules) {
      this._beforeContentRules.dispose();
      this._beforeContentRules = null;
    }
    if (this._afterContentRules) {
      this._afterContentRules.dispose();
      this._afterContentRules = null;
    }
    this._styleSheet.unref();
  }
}
class DecorationTypeOptionsProvider {
  static {
    __name(this, "DecorationTypeOptionsProvider");
  }
  _disposables = new DisposableStore();
  _styleSheet;
  refCount;
  description;
  className;
  inlineClassName;
  inlineClassNameAffectsLetterSpacing;
  beforeContentClassName;
  afterContentClassName;
  glyphMarginClassName;
  isWholeLine;
  overviewRuler;
  stickiness;
  beforeInjectedText;
  afterInjectedText;
  constructor(description, themeService, styleSheet, providerArgs) {
    this.description = description;
    this._styleSheet = styleSheet;
    this._styleSheet.ref();
    this.refCount = 0;
    const createCSSRules = /* @__PURE__ */ __name((type) => {
      const rules = new DecorationCSSRules(
        type,
        providerArgs,
        themeService
      );
      this._disposables.add(rules);
      if (rules.hasContent) {
        return rules.className;
      }
      return void 0;
    }, "createCSSRules");
    const createInlineCSSRules = /* @__PURE__ */ __name((type) => {
      const rules = new DecorationCSSRules(
        type,
        providerArgs,
        themeService
      );
      this._disposables.add(rules);
      if (rules.hasContent) {
        return {
          className: rules.className,
          hasLetterSpacing: rules.hasLetterSpacing
        };
      }
      return null;
    }, "createInlineCSSRules");
    this.className = createCSSRules(0 /* ClassName */);
    const inlineData = createInlineCSSRules(
      1 /* InlineClassName */
    );
    if (inlineData) {
      this.inlineClassName = inlineData.className;
      this.inlineClassNameAffectsLetterSpacing = inlineData.hasLetterSpacing;
    }
    this.beforeContentClassName = createCSSRules(
      3 /* BeforeContentClassName */
    );
    this.afterContentClassName = createCSSRules(
      4 /* AfterContentClassName */
    );
    if (providerArgs.options.beforeInjectedText && providerArgs.options.beforeInjectedText.contentText) {
      const beforeInlineData = createInlineCSSRules(
        5 /* BeforeInjectedTextClassName */
      );
      this.beforeInjectedText = {
        content: providerArgs.options.beforeInjectedText.contentText,
        inlineClassName: beforeInlineData?.className,
        inlineClassNameAffectsLetterSpacing: beforeInlineData?.hasLetterSpacing || providerArgs.options.beforeInjectedText.affectsLetterSpacing
      };
    }
    if (providerArgs.options.afterInjectedText && providerArgs.options.afterInjectedText.contentText) {
      const afterInlineData = createInlineCSSRules(
        6 /* AfterInjectedTextClassName */
      );
      this.afterInjectedText = {
        content: providerArgs.options.afterInjectedText.contentText,
        inlineClassName: afterInlineData?.className,
        inlineClassNameAffectsLetterSpacing: afterInlineData?.hasLetterSpacing || providerArgs.options.afterInjectedText.affectsLetterSpacing
      };
    }
    this.glyphMarginClassName = createCSSRules(
      2 /* GlyphMarginClassName */
    );
    const options = providerArgs.options;
    this.isWholeLine = Boolean(options.isWholeLine);
    this.stickiness = options.rangeBehavior;
    const lightOverviewRulerColor = options.light && options.light.overviewRulerColor || options.overviewRulerColor;
    const darkOverviewRulerColor = options.dark && options.dark.overviewRulerColor || options.overviewRulerColor;
    if (typeof lightOverviewRulerColor !== "undefined" || typeof darkOverviewRulerColor !== "undefined") {
      this.overviewRuler = {
        color: lightOverviewRulerColor || darkOverviewRulerColor,
        darkColor: darkOverviewRulerColor || lightOverviewRulerColor,
        position: options.overviewRulerLane || OverviewRulerLane.Center
      };
    }
  }
  getOptions(codeEditorService, writable) {
    if (!writable) {
      return this;
    }
    return {
      description: this.description,
      inlineClassName: this.inlineClassName,
      beforeContentClassName: this.beforeContentClassName,
      afterContentClassName: this.afterContentClassName,
      className: this.className,
      glyphMarginClassName: this.glyphMarginClassName,
      isWholeLine: this.isWholeLine,
      overviewRuler: this.overviewRuler,
      stickiness: this.stickiness,
      before: this.beforeInjectedText,
      after: this.afterInjectedText
    };
  }
  resolveDecorationCSSRules() {
    return this._styleSheet.sheet.rules;
  }
  dispose() {
    this._disposables.dispose();
    this._styleSheet.unref();
  }
}
const _CSS_MAP = {
  color: "color:{0} !important;",
  opacity: "opacity:{0};",
  backgroundColor: "background-color:{0};",
  outline: "outline:{0};",
  outlineColor: "outline-color:{0};",
  outlineStyle: "outline-style:{0};",
  outlineWidth: "outline-width:{0};",
  border: "border:{0};",
  borderColor: "border-color:{0};",
  borderRadius: "border-radius:{0};",
  borderSpacing: "border-spacing:{0};",
  borderStyle: "border-style:{0};",
  borderWidth: "border-width:{0};",
  fontStyle: "font-style:{0};",
  fontWeight: "font-weight:{0};",
  fontSize: "font-size:{0};",
  fontFamily: "font-family:{0};",
  textDecoration: "text-decoration:{0};",
  cursor: "cursor:{0};",
  letterSpacing: "letter-spacing:{0};",
  gutterIconPath: "background:{0} center center no-repeat;",
  gutterIconSize: "background-size:{0};",
  contentText: "content:'{0}';",
  contentIconPath: "content:{0};",
  margin: "margin:{0};",
  padding: "padding:{0};",
  width: "width:{0};",
  height: "height:{0};",
  verticalAlign: "vertical-align:{0};"
};
class DecorationCSSRules {
  static {
    __name(this, "DecorationCSSRules");
  }
  _theme;
  _className;
  _unThemedSelector;
  _hasContent;
  _hasLetterSpacing;
  _ruleType;
  _themeListener;
  _providerArgs;
  _usesThemeColors;
  constructor(ruleType, providerArgs, themeService) {
    this._theme = themeService.getColorTheme();
    this._ruleType = ruleType;
    this._providerArgs = providerArgs;
    this._usesThemeColors = false;
    this._hasContent = false;
    this._hasLetterSpacing = false;
    let className = CSSNameHelper.getClassName(
      this._providerArgs.key,
      ruleType
    );
    if (this._providerArgs.parentTypeKey) {
      className = className + " " + CSSNameHelper.getClassName(
        this._providerArgs.parentTypeKey,
        ruleType
      );
    }
    this._className = className;
    this._unThemedSelector = CSSNameHelper.getSelector(
      this._providerArgs.key,
      this._providerArgs.parentTypeKey,
      ruleType
    );
    this._buildCSS();
    if (this._usesThemeColors) {
      this._themeListener = themeService.onDidColorThemeChange(
        (theme) => {
          this._theme = themeService.getColorTheme();
          this._removeCSS();
          this._buildCSS();
        }
      );
    } else {
      this._themeListener = null;
    }
  }
  dispose() {
    if (this._hasContent) {
      this._removeCSS();
      this._hasContent = false;
    }
    if (this._themeListener) {
      this._themeListener.dispose();
      this._themeListener = null;
    }
  }
  get hasContent() {
    return this._hasContent;
  }
  get hasLetterSpacing() {
    return this._hasLetterSpacing;
  }
  get className() {
    return this._className;
  }
  _buildCSS() {
    const options = this._providerArgs.options;
    let unthemedCSS, lightCSS, darkCSS;
    switch (this._ruleType) {
      case 0 /* ClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationClassName(options);
        lightCSS = this.getCSSTextForModelDecorationClassName(
          options.light
        );
        darkCSS = this.getCSSTextForModelDecorationClassName(
          options.dark
        );
        break;
      case 1 /* InlineClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationInlineClassName(options);
        lightCSS = this.getCSSTextForModelDecorationInlineClassName(
          options.light
        );
        darkCSS = this.getCSSTextForModelDecorationInlineClassName(
          options.dark
        );
        break;
      case 2 /* GlyphMarginClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(
          options
        );
        lightCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(
          options.light
        );
        darkCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(
          options.dark
        );
        break;
      case 3 /* BeforeContentClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(
          options.before
        );
        lightCSS = this.getCSSTextForModelDecorationContentClassName(
          options.light && options.light.before
        );
        darkCSS = this.getCSSTextForModelDecorationContentClassName(
          options.dark && options.dark.before
        );
        break;
      case 4 /* AfterContentClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(
          options.after
        );
        lightCSS = this.getCSSTextForModelDecorationContentClassName(
          options.light && options.light.after
        );
        darkCSS = this.getCSSTextForModelDecorationContentClassName(
          options.dark && options.dark.after
        );
        break;
      case 5 /* BeforeInjectedTextClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(
          options.beforeInjectedText
        );
        lightCSS = this.getCSSTextForModelDecorationContentClassName(
          options.light && options.light.beforeInjectedText
        );
        darkCSS = this.getCSSTextForModelDecorationContentClassName(
          options.dark && options.dark.beforeInjectedText
        );
        break;
      case 6 /* AfterInjectedTextClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(
          options.afterInjectedText
        );
        lightCSS = this.getCSSTextForModelDecorationContentClassName(
          options.light && options.light.afterInjectedText
        );
        darkCSS = this.getCSSTextForModelDecorationContentClassName(
          options.dark && options.dark.afterInjectedText
        );
        break;
      default:
        throw new Error("Unknown rule type: " + this._ruleType);
    }
    const sheet = this._providerArgs.styleSheet;
    let hasContent = false;
    if (unthemedCSS.length > 0) {
      sheet.insertRule(this._unThemedSelector, unthemedCSS);
      hasContent = true;
    }
    if (lightCSS.length > 0) {
      sheet.insertRule(
        `.vs${this._unThemedSelector}, .hc-light${this._unThemedSelector}`,
        lightCSS
      );
      hasContent = true;
    }
    if (darkCSS.length > 0) {
      sheet.insertRule(
        `.vs-dark${this._unThemedSelector}, .hc-black${this._unThemedSelector}`,
        darkCSS
      );
      hasContent = true;
    }
    this._hasContent = hasContent;
  }
  _removeCSS() {
    this._providerArgs.styleSheet.removeRulesContainingSelector(
      this._unThemedSelector
    );
  }
  /**
   * Build the CSS for decorations styled via `className`.
   */
  getCSSTextForModelDecorationClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    this.collectCSSText(opts, ["backgroundColor"], cssTextArr);
    this.collectCSSText(
      opts,
      ["outline", "outlineColor", "outlineStyle", "outlineWidth"],
      cssTextArr
    );
    this.collectBorderSettingsCSSText(opts, cssTextArr);
    return cssTextArr.join("");
  }
  /**
   * Build the CSS for decorations styled via `inlineClassName`.
   */
  getCSSTextForModelDecorationInlineClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    this.collectCSSText(
      opts,
      [
        "fontStyle",
        "fontWeight",
        "textDecoration",
        "cursor",
        "color",
        "opacity",
        "letterSpacing"
      ],
      cssTextArr
    );
    if (opts.letterSpacing) {
      this._hasLetterSpacing = true;
    }
    return cssTextArr.join("");
  }
  /**
   * Build the CSS for decorations styled before or after content.
   */
  getCSSTextForModelDecorationContentClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    if (typeof opts !== "undefined") {
      this.collectBorderSettingsCSSText(opts, cssTextArr);
      if (typeof opts.contentIconPath !== "undefined") {
        cssTextArr.push(
          strings.format(
            _CSS_MAP.contentIconPath,
            dom.asCSSUrl(URI.revive(opts.contentIconPath))
          )
        );
      }
      if (typeof opts.contentText === "string") {
        const truncated = opts.contentText.match(/^.*$/m)[0];
        const escaped = truncated.replace(/['\\]/g, "\\$&");
        cssTextArr.push(strings.format(_CSS_MAP.contentText, escaped));
      }
      this.collectCSSText(
        opts,
        [
          "verticalAlign",
          "fontStyle",
          "fontWeight",
          "fontSize",
          "fontFamily",
          "textDecoration",
          "color",
          "opacity",
          "backgroundColor",
          "margin",
          "padding"
        ],
        cssTextArr
      );
      if (this.collectCSSText(opts, ["width", "height"], cssTextArr)) {
        cssTextArr.push("display:inline-block;");
      }
    }
    return cssTextArr.join("");
  }
  /**
   * Build the CSS for decorations styled via `glyphMarginClassName`.
   */
  getCSSTextForModelDecorationGlyphMarginClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    if (typeof opts.gutterIconPath !== "undefined") {
      cssTextArr.push(
        strings.format(
          _CSS_MAP.gutterIconPath,
          dom.asCSSUrl(URI.revive(opts.gutterIconPath))
        )
      );
      if (typeof opts.gutterIconSize !== "undefined") {
        cssTextArr.push(
          strings.format(
            _CSS_MAP.gutterIconSize,
            opts.gutterIconSize
          )
        );
      }
    }
    return cssTextArr.join("");
  }
  collectBorderSettingsCSSText(opts, cssTextArr) {
    if (this.collectCSSText(
      opts,
      [
        "border",
        "borderColor",
        "borderRadius",
        "borderSpacing",
        "borderStyle",
        "borderWidth"
      ],
      cssTextArr
    )) {
      cssTextArr.push(strings.format("box-sizing: border-box;"));
      return true;
    }
    return false;
  }
  collectCSSText(opts, properties, cssTextArr) {
    const lenBefore = cssTextArr.length;
    for (const property of properties) {
      const value = this.resolveValue(opts[property]);
      if (typeof value === "string") {
        cssTextArr.push(strings.format(_CSS_MAP[property], value));
      }
    }
    return cssTextArr.length !== lenBefore;
  }
  resolveValue(value) {
    if (isThemeColor(value)) {
      this._usesThemeColors = true;
      const color = this._theme.getColor(value.id);
      if (color) {
        return color.toString();
      }
      return "transparent";
    }
    return value;
  }
}
var ModelDecorationCSSRuleType = /* @__PURE__ */ ((ModelDecorationCSSRuleType2) => {
  ModelDecorationCSSRuleType2[ModelDecorationCSSRuleType2["ClassName"] = 0] = "ClassName";
  ModelDecorationCSSRuleType2[ModelDecorationCSSRuleType2["InlineClassName"] = 1] = "InlineClassName";
  ModelDecorationCSSRuleType2[ModelDecorationCSSRuleType2["GlyphMarginClassName"] = 2] = "GlyphMarginClassName";
  ModelDecorationCSSRuleType2[ModelDecorationCSSRuleType2["BeforeContentClassName"] = 3] = "BeforeContentClassName";
  ModelDecorationCSSRuleType2[ModelDecorationCSSRuleType2["AfterContentClassName"] = 4] = "AfterContentClassName";
  ModelDecorationCSSRuleType2[ModelDecorationCSSRuleType2["BeforeInjectedTextClassName"] = 5] = "BeforeInjectedTextClassName";
  ModelDecorationCSSRuleType2[ModelDecorationCSSRuleType2["AfterInjectedTextClassName"] = 6] = "AfterInjectedTextClassName";
  return ModelDecorationCSSRuleType2;
})(ModelDecorationCSSRuleType || {});
class CSSNameHelper {
  static {
    __name(this, "CSSNameHelper");
  }
  static getClassName(key, type) {
    return "ced-" + key + "-" + type;
  }
  static getSelector(key, parentKey, ruleType) {
    let selector = ".monaco-editor ." + this.getClassName(key, ruleType);
    if (parentKey) {
      selector = selector + "." + this.getClassName(parentKey, ruleType);
    }
    if (ruleType === 3 /* BeforeContentClassName */) {
      selector += "::before";
    } else if (ruleType === 4 /* AfterContentClassName */) {
      selector += "::after";
    }
    return selector;
  }
}
export {
  AbstractCodeEditorService,
  GlobalStyleSheet,
  ModelTransientSettingWatcher,
  _CSS_MAP
};
//# sourceMappingURL=abstractCodeEditorService.js.map
