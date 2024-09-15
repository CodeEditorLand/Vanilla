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
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import * as strings from "../../../base/common/strings.js";
import { ITextModel } from "../model.js";
import { DEFAULT_WORD_REGEXP, ensureValidWordDefinition } from "../core/wordHelper.js";
import { EnterAction, FoldingRules, IAutoClosingPair, IndentationRule, LanguageConfiguration, AutoClosingPairs, CharacterPair, ExplicitLanguageConfiguration } from "./languageConfiguration.js";
import { CharacterPairSupport } from "./supports/characterPair.js";
import { BracketElectricCharacterSupport } from "./supports/electricCharacter.js";
import { IndentRulesSupport } from "./supports/indentRules.js";
import { OnEnterSupport } from "./supports/onEnter.js";
import { RichEditBrackets } from "./supports/richEditBrackets.js";
import { EditorAutoIndentStrategy } from "../config/editorOptions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { ILanguageService } from "./language.js";
import { InstantiationType, registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { PLAINTEXT_LANGUAGE_ID } from "./modesRegistry.js";
import { LanguageBracketsConfiguration } from "./supports/languageBracketsConfiguration.js";
class LanguageConfigurationServiceChangeEvent {
  constructor(languageId) {
    this.languageId = languageId;
  }
  static {
    __name(this, "LanguageConfigurationServiceChangeEvent");
  }
  affects(languageId) {
    return !this.languageId ? true : this.languageId === languageId;
  }
}
const ILanguageConfigurationService = createDecorator("languageConfigurationService");
let LanguageConfigurationService = class extends Disposable {
  constructor(configurationService, languageService) {
    super();
    this.configurationService = configurationService;
    this.languageService = languageService;
    const languageConfigKeys = new Set(Object.values(customizedLanguageConfigKeys));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      const globalConfigChanged = e.change.keys.some(
        (k) => languageConfigKeys.has(k)
      );
      const localConfigChanged = e.change.overrides.filter(
        ([overrideLangName, keys]) => keys.some((k) => languageConfigKeys.has(k))
      ).map(([overrideLangName]) => overrideLangName);
      if (globalConfigChanged) {
        this.configurations.clear();
        this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(void 0));
      } else {
        for (const languageId of localConfigChanged) {
          if (this.languageService.isRegisteredLanguageId(languageId)) {
            this.configurations.delete(languageId);
            this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(languageId));
          }
        }
      }
    }));
    this._register(this._registry.onDidChange((e) => {
      this.configurations.delete(e.languageId);
      this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(e.languageId));
    }));
  }
  static {
    __name(this, "LanguageConfigurationService");
  }
  _serviceBrand;
  _registry = this._register(new LanguageConfigurationRegistry());
  onDidChangeEmitter = this._register(new Emitter());
  onDidChange = this.onDidChangeEmitter.event;
  configurations = /* @__PURE__ */ new Map();
  register(languageId, configuration, priority) {
    return this._registry.register(languageId, configuration, priority);
  }
  getLanguageConfiguration(languageId) {
    let result = this.configurations.get(languageId);
    if (!result) {
      result = computeConfig(languageId, this._registry, this.configurationService, this.languageService);
      this.configurations.set(languageId, result);
    }
    return result;
  }
};
LanguageConfigurationService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ILanguageService)
], LanguageConfigurationService);
function computeConfig(languageId, registry, configurationService, languageService) {
  let languageConfig = registry.getLanguageConfiguration(languageId);
  if (!languageConfig) {
    if (!languageService.isRegisteredLanguageId(languageId)) {
      return new ResolvedLanguageConfiguration(languageId, {});
    }
    languageConfig = new ResolvedLanguageConfiguration(languageId, {});
  }
  const customizedConfig = getCustomizedLanguageConfig(languageConfig.languageId, configurationService);
  const data = combineLanguageConfigurations([languageConfig.underlyingConfig, customizedConfig]);
  const config = new ResolvedLanguageConfiguration(languageConfig.languageId, data);
  return config;
}
__name(computeConfig, "computeConfig");
const customizedLanguageConfigKeys = {
  brackets: "editor.language.brackets",
  colorizedBracketPairs: "editor.language.colorizedBracketPairs"
};
function getCustomizedLanguageConfig(languageId, configurationService) {
  const brackets = configurationService.getValue(customizedLanguageConfigKeys.brackets, {
    overrideIdentifier: languageId
  });
  const colorizedBracketPairs = configurationService.getValue(customizedLanguageConfigKeys.colorizedBracketPairs, {
    overrideIdentifier: languageId
  });
  return {
    brackets: validateBracketPairs(brackets),
    colorizedBracketPairs: validateBracketPairs(colorizedBracketPairs)
  };
}
__name(getCustomizedLanguageConfig, "getCustomizedLanguageConfig");
function validateBracketPairs(data) {
  if (!Array.isArray(data)) {
    return void 0;
  }
  return data.map((pair) => {
    if (!Array.isArray(pair) || pair.length !== 2) {
      return void 0;
    }
    return [pair[0], pair[1]];
  }).filter((p) => !!p);
}
__name(validateBracketPairs, "validateBracketPairs");
function getIndentationAtPosition(model, lineNumber, column) {
  const lineText = model.getLineContent(lineNumber);
  let indentation = strings.getLeadingWhitespace(lineText);
  if (indentation.length > column - 1) {
    indentation = indentation.substring(0, column - 1);
  }
  return indentation;
}
__name(getIndentationAtPosition, "getIndentationAtPosition");
class ComposedLanguageConfiguration {
  constructor(languageId) {
    this.languageId = languageId;
    this._entries = [];
    this._order = 0;
    this._resolved = null;
  }
  static {
    __name(this, "ComposedLanguageConfiguration");
  }
  _entries;
  _order;
  _resolved = null;
  register(configuration, priority) {
    const entry = new LanguageConfigurationContribution(
      configuration,
      priority,
      ++this._order
    );
    this._entries.push(entry);
    this._resolved = null;
    return toDisposable(() => {
      for (let i = 0; i < this._entries.length; i++) {
        if (this._entries[i] === entry) {
          this._entries.splice(i, 1);
          this._resolved = null;
          break;
        }
      }
    });
  }
  getResolvedConfiguration() {
    if (!this._resolved) {
      const config = this._resolve();
      if (config) {
        this._resolved = new ResolvedLanguageConfiguration(
          this.languageId,
          config
        );
      }
    }
    return this._resolved;
  }
  _resolve() {
    if (this._entries.length === 0) {
      return null;
    }
    this._entries.sort(LanguageConfigurationContribution.cmp);
    return combineLanguageConfigurations(this._entries.map((e) => e.configuration));
  }
}
function combineLanguageConfigurations(configs) {
  let result = {
    comments: void 0,
    brackets: void 0,
    wordPattern: void 0,
    indentationRules: void 0,
    onEnterRules: void 0,
    autoClosingPairs: void 0,
    surroundingPairs: void 0,
    autoCloseBefore: void 0,
    folding: void 0,
    colorizedBracketPairs: void 0,
    __electricCharacterSupport: void 0
  };
  for (const entry of configs) {
    result = {
      comments: entry.comments || result.comments,
      brackets: entry.brackets || result.brackets,
      wordPattern: entry.wordPattern || result.wordPattern,
      indentationRules: entry.indentationRules || result.indentationRules,
      onEnterRules: entry.onEnterRules || result.onEnterRules,
      autoClosingPairs: entry.autoClosingPairs || result.autoClosingPairs,
      surroundingPairs: entry.surroundingPairs || result.surroundingPairs,
      autoCloseBefore: entry.autoCloseBefore || result.autoCloseBefore,
      folding: entry.folding || result.folding,
      colorizedBracketPairs: entry.colorizedBracketPairs || result.colorizedBracketPairs,
      __electricCharacterSupport: entry.__electricCharacterSupport || result.__electricCharacterSupport
    };
  }
  return result;
}
__name(combineLanguageConfigurations, "combineLanguageConfigurations");
class LanguageConfigurationContribution {
  constructor(configuration, priority, order) {
    this.configuration = configuration;
    this.priority = priority;
    this.order = order;
  }
  static {
    __name(this, "LanguageConfigurationContribution");
  }
  static cmp(a, b) {
    if (a.priority === b.priority) {
      return a.order - b.order;
    }
    return a.priority - b.priority;
  }
}
class LanguageConfigurationChangeEvent {
  constructor(languageId) {
    this.languageId = languageId;
  }
  static {
    __name(this, "LanguageConfigurationChangeEvent");
  }
}
class LanguageConfigurationRegistry extends Disposable {
  static {
    __name(this, "LanguageConfigurationRegistry");
  }
  _entries = /* @__PURE__ */ new Map();
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  constructor() {
    super();
    this._register(this.register(PLAINTEXT_LANGUAGE_ID, {
      brackets: [
        ["(", ")"],
        ["[", "]"],
        ["{", "}"]
      ],
      surroundingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "<", close: ">" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" }
      ],
      colorizedBracketPairs: [],
      folding: {
        offSide: true
      }
    }, 0));
  }
  /**
   * @param priority Use a higher number for higher priority
   */
  register(languageId, configuration, priority = 0) {
    let entries = this._entries.get(languageId);
    if (!entries) {
      entries = new ComposedLanguageConfiguration(languageId);
      this._entries.set(languageId, entries);
    }
    const disposable = entries.register(configuration, priority);
    this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
    return toDisposable(() => {
      disposable.dispose();
      this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
    });
  }
  getLanguageConfiguration(languageId) {
    const entries = this._entries.get(languageId);
    return entries?.getResolvedConfiguration() || null;
  }
}
class ResolvedLanguageConfiguration {
  constructor(languageId, underlyingConfig) {
    this.languageId = languageId;
    this.underlyingConfig = underlyingConfig;
    this._brackets = null;
    this._electricCharacter = null;
    this._onEnterSupport = this.underlyingConfig.brackets || this.underlyingConfig.indentationRules || this.underlyingConfig.onEnterRules ? new OnEnterSupport(this.underlyingConfig) : null;
    this.comments = ResolvedLanguageConfiguration._handleComments(this.underlyingConfig);
    this.characterPair = new CharacterPairSupport(this.underlyingConfig);
    this.wordDefinition = this.underlyingConfig.wordPattern || DEFAULT_WORD_REGEXP;
    this.indentationRules = this.underlyingConfig.indentationRules;
    if (this.underlyingConfig.indentationRules) {
      this.indentRulesSupport = new IndentRulesSupport(
        this.underlyingConfig.indentationRules
      );
    } else {
      this.indentRulesSupport = null;
    }
    this.foldingRules = this.underlyingConfig.folding || {};
    this.bracketsNew = new LanguageBracketsConfiguration(
      languageId,
      this.underlyingConfig
    );
  }
  static {
    __name(this, "ResolvedLanguageConfiguration");
  }
  _brackets;
  _electricCharacter;
  _onEnterSupport;
  comments;
  characterPair;
  wordDefinition;
  indentRulesSupport;
  indentationRules;
  foldingRules;
  bracketsNew;
  getWordDefinition() {
    return ensureValidWordDefinition(this.wordDefinition);
  }
  get brackets() {
    if (!this._brackets && this.underlyingConfig.brackets) {
      this._brackets = new RichEditBrackets(
        this.languageId,
        this.underlyingConfig.brackets
      );
    }
    return this._brackets;
  }
  get electricCharacter() {
    if (!this._electricCharacter) {
      this._electricCharacter = new BracketElectricCharacterSupport(
        this.brackets
      );
    }
    return this._electricCharacter;
  }
  onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
    if (!this._onEnterSupport) {
      return null;
    }
    return this._onEnterSupport.onEnter(
      autoIndent,
      previousLineText,
      beforeEnterText,
      afterEnterText
    );
  }
  getAutoClosingPairs() {
    return new AutoClosingPairs(this.characterPair.getAutoClosingPairs());
  }
  getAutoCloseBeforeSet(forQuotes) {
    return this.characterPair.getAutoCloseBeforeSet(forQuotes);
  }
  getSurroundingPairs() {
    return this.characterPair.getSurroundingPairs();
  }
  static _handleComments(conf) {
    const commentRule = conf.comments;
    if (!commentRule) {
      return null;
    }
    const comments = {};
    if (commentRule.lineComment) {
      comments.lineCommentToken = commentRule.lineComment;
    }
    if (commentRule.blockComment) {
      const [blockStart, blockEnd] = commentRule.blockComment;
      comments.blockCommentStartToken = blockStart;
      comments.blockCommentEndToken = blockEnd;
    }
    return comments;
  }
}
registerSingleton(ILanguageConfigurationService, LanguageConfigurationService, InstantiationType.Delayed);
export {
  ILanguageConfigurationService,
  LanguageConfigurationChangeEvent,
  LanguageConfigurationRegistry,
  LanguageConfigurationService,
  LanguageConfigurationServiceChangeEvent,
  ResolvedLanguageConfiguration,
  getIndentationAtPosition
};
//# sourceMappingURL=languageConfigurationRegistry.js.map
