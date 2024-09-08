var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
  Disposable
} from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  LanguageId,
  MetadataConsts
} from "../../../common/encodedTokenAttributes.js";
import * as languages from "../../../common/languages.js";
import {
  NullState,
  nullTokenize,
  nullTokenizeEncoded
} from "../../../common/languages/nullTokenize.js";
import * as monarchCommon from "./monarchCommon.js";
const CACHE_STACK_DEPTH = 5;
class MonarchStackElementFactory {
  static _INSTANCE = new MonarchStackElementFactory(
    CACHE_STACK_DEPTH
  );
  static create(parent, state) {
    return this._INSTANCE.create(parent, state);
  }
  _maxCacheDepth;
  _entries;
  constructor(maxCacheDepth) {
    this._maxCacheDepth = maxCacheDepth;
    this._entries = /* @__PURE__ */ Object.create(null);
  }
  create(parent, state) {
    if (parent !== null && parent.depth >= this._maxCacheDepth) {
      return new MonarchStackElement(parent, state);
    }
    let stackElementId = MonarchStackElement.getStackElementId(parent);
    if (stackElementId.length > 0) {
      stackElementId += "|";
    }
    stackElementId += state;
    let result = this._entries[stackElementId];
    if (result) {
      return result;
    }
    result = new MonarchStackElement(parent, state);
    this._entries[stackElementId] = result;
    return result;
  }
}
class MonarchStackElement {
  parent;
  state;
  depth;
  constructor(parent, state) {
    this.parent = parent;
    this.state = state;
    this.depth = (this.parent ? this.parent.depth : 0) + 1;
  }
  static getStackElementId(element) {
    let result = "";
    while (element !== null) {
      if (result.length > 0) {
        result += "|";
      }
      result += element.state;
      element = element.parent;
    }
    return result;
  }
  static _equals(a, b) {
    while (a !== null && b !== null) {
      if (a === b) {
        return true;
      }
      if (a.state !== b.state) {
        return false;
      }
      a = a.parent;
      b = b.parent;
    }
    if (a === null && b === null) {
      return true;
    }
    return false;
  }
  equals(other) {
    return MonarchStackElement._equals(this, other);
  }
  push(state) {
    return MonarchStackElementFactory.create(this, state);
  }
  pop() {
    return this.parent;
  }
  popall() {
    let result = this;
    while (result.parent) {
      result = result.parent;
    }
    return result;
  }
  switchTo(state) {
    return MonarchStackElementFactory.create(this.parent, state);
  }
}
class EmbeddedLanguageData {
  languageId;
  state;
  constructor(languageId, state) {
    this.languageId = languageId;
    this.state = state;
  }
  equals(other) {
    return this.languageId === other.languageId && this.state.equals(other.state);
  }
  clone() {
    const stateClone = this.state.clone();
    if (stateClone === this.state) {
      return this;
    }
    return new EmbeddedLanguageData(this.languageId, this.state);
  }
}
class MonarchLineStateFactory {
  static _INSTANCE = new MonarchLineStateFactory(
    CACHE_STACK_DEPTH
  );
  static create(stack, embeddedLanguageData) {
    return this._INSTANCE.create(stack, embeddedLanguageData);
  }
  _maxCacheDepth;
  _entries;
  constructor(maxCacheDepth) {
    this._maxCacheDepth = maxCacheDepth;
    this._entries = /* @__PURE__ */ Object.create(null);
  }
  create(stack, embeddedLanguageData) {
    if (embeddedLanguageData !== null) {
      return new MonarchLineState(stack, embeddedLanguageData);
    }
    if (stack !== null && stack.depth >= this._maxCacheDepth) {
      return new MonarchLineState(stack, embeddedLanguageData);
    }
    const stackElementId = MonarchStackElement.getStackElementId(stack);
    let result = this._entries[stackElementId];
    if (result) {
      return result;
    }
    result = new MonarchLineState(stack, null);
    this._entries[stackElementId] = result;
    return result;
  }
}
class MonarchLineState {
  stack;
  embeddedLanguageData;
  constructor(stack, embeddedLanguageData) {
    this.stack = stack;
    this.embeddedLanguageData = embeddedLanguageData;
  }
  clone() {
    const embeddedlanguageDataClone = this.embeddedLanguageData ? this.embeddedLanguageData.clone() : null;
    if (embeddedlanguageDataClone === this.embeddedLanguageData) {
      return this;
    }
    return MonarchLineStateFactory.create(
      this.stack,
      this.embeddedLanguageData
    );
  }
  equals(other) {
    if (!(other instanceof MonarchLineState)) {
      return false;
    }
    if (!this.stack.equals(other.stack)) {
      return false;
    }
    if (this.embeddedLanguageData === null && other.embeddedLanguageData === null) {
      return true;
    }
    if (this.embeddedLanguageData === null || other.embeddedLanguageData === null) {
      return false;
    }
    return this.embeddedLanguageData.equals(other.embeddedLanguageData);
  }
}
class MonarchClassicTokensCollector {
  _tokens;
  _languageId;
  _lastTokenType;
  _lastTokenLanguage;
  constructor() {
    this._tokens = [];
    this._languageId = null;
    this._lastTokenType = null;
    this._lastTokenLanguage = null;
  }
  enterLanguage(languageId) {
    this._languageId = languageId;
  }
  emit(startOffset, type) {
    if (this._lastTokenType === type && this._lastTokenLanguage === this._languageId) {
      return;
    }
    this._lastTokenType = type;
    this._lastTokenLanguage = this._languageId;
    this._tokens.push(
      new languages.Token(startOffset, type, this._languageId)
    );
  }
  nestedLanguageTokenize(embeddedLanguageLine, hasEOL, embeddedLanguageData, offsetDelta) {
    const nestedLanguageId = embeddedLanguageData.languageId;
    const embeddedModeState = embeddedLanguageData.state;
    const nestedLanguageTokenizationSupport = languages.TokenizationRegistry.get(nestedLanguageId);
    if (!nestedLanguageTokenizationSupport) {
      this.enterLanguage(nestedLanguageId);
      this.emit(offsetDelta, "");
      return embeddedModeState;
    }
    const nestedResult = nestedLanguageTokenizationSupport.tokenize(
      embeddedLanguageLine,
      hasEOL,
      embeddedModeState
    );
    if (offsetDelta !== 0) {
      for (const token of nestedResult.tokens) {
        this._tokens.push(
          new languages.Token(
            token.offset + offsetDelta,
            token.type,
            token.language
          )
        );
      }
    } else {
      this._tokens = this._tokens.concat(nestedResult.tokens);
    }
    this._lastTokenType = null;
    this._lastTokenLanguage = null;
    this._languageId = null;
    return nestedResult.endState;
  }
  finalize(endState) {
    return new languages.TokenizationResult(this._tokens, endState);
  }
}
class MonarchModernTokensCollector {
  _languageService;
  _theme;
  _prependTokens;
  _tokens;
  _currentLanguageId;
  _lastTokenMetadata;
  constructor(languageService, theme) {
    this._languageService = languageService;
    this._theme = theme;
    this._prependTokens = null;
    this._tokens = [];
    this._currentLanguageId = LanguageId.Null;
    this._lastTokenMetadata = 0;
  }
  enterLanguage(languageId) {
    this._currentLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
  }
  emit(startOffset, type) {
    const metadata = this._theme.match(this._currentLanguageId, type) | MetadataConsts.BALANCED_BRACKETS_MASK;
    if (this._lastTokenMetadata === metadata) {
      return;
    }
    this._lastTokenMetadata = metadata;
    this._tokens.push(startOffset);
    this._tokens.push(metadata);
  }
  static _merge(a, b, c) {
    const aLen = a !== null ? a.length : 0;
    const bLen = b.length;
    const cLen = c !== null ? c.length : 0;
    if (aLen === 0 && bLen === 0 && cLen === 0) {
      return new Uint32Array(0);
    }
    if (aLen === 0 && bLen === 0) {
      return c;
    }
    if (bLen === 0 && cLen === 0) {
      return a;
    }
    const result = new Uint32Array(aLen + bLen + cLen);
    if (a !== null) {
      result.set(a);
    }
    for (let i = 0; i < bLen; i++) {
      result[aLen + i] = b[i];
    }
    if (c !== null) {
      result.set(c, aLen + bLen);
    }
    return result;
  }
  nestedLanguageTokenize(embeddedLanguageLine, hasEOL, embeddedLanguageData, offsetDelta) {
    const nestedLanguageId = embeddedLanguageData.languageId;
    const embeddedModeState = embeddedLanguageData.state;
    const nestedLanguageTokenizationSupport = languages.TokenizationRegistry.get(nestedLanguageId);
    if (!nestedLanguageTokenizationSupport) {
      this.enterLanguage(nestedLanguageId);
      this.emit(offsetDelta, "");
      return embeddedModeState;
    }
    const nestedResult = nestedLanguageTokenizationSupport.tokenizeEncoded(
      embeddedLanguageLine,
      hasEOL,
      embeddedModeState
    );
    if (offsetDelta !== 0) {
      for (let i = 0, len = nestedResult.tokens.length; i < len; i += 2) {
        nestedResult.tokens[i] += offsetDelta;
      }
    }
    this._prependTokens = MonarchModernTokensCollector._merge(
      this._prependTokens,
      this._tokens,
      nestedResult.tokens
    );
    this._tokens = [];
    this._currentLanguageId = 0;
    this._lastTokenMetadata = 0;
    return nestedResult.endState;
  }
  finalize(endState) {
    return new languages.EncodedTokenizationResult(
      MonarchModernTokensCollector._merge(
        this._prependTokens,
        this._tokens,
        null
      ),
      endState
    );
  }
}
let MonarchTokenizer = class extends Disposable {
  constructor(languageService, standaloneThemeService, languageId, lexer, _configurationService) {
    super();
    this._configurationService = _configurationService;
    this._languageService = languageService;
    this._standaloneThemeService = standaloneThemeService;
    this._languageId = languageId;
    this._lexer = lexer;
    this._embeddedLanguages = /* @__PURE__ */ Object.create(null);
    this.embeddedLoaded = Promise.resolve(void 0);
    let emitting = false;
    this._register(languages.TokenizationRegistry.onDidChange((e) => {
      if (emitting) {
        return;
      }
      let isOneOfMyEmbeddedModes = false;
      for (let i = 0, len = e.changedLanguages.length; i < len; i++) {
        const language = e.changedLanguages[i];
        if (this._embeddedLanguages[language]) {
          isOneOfMyEmbeddedModes = true;
          break;
        }
      }
      if (isOneOfMyEmbeddedModes) {
        emitting = true;
        languages.TokenizationRegistry.handleChange([this._languageId]);
        emitting = false;
      }
    }));
    this._maxTokenizationLineLength = this._configurationService.getValue("editor.maxTokenizationLineLength", {
      overrideIdentifier: this._languageId
    });
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.maxTokenizationLineLength")) {
        this._maxTokenizationLineLength = this._configurationService.getValue("editor.maxTokenizationLineLength", {
          overrideIdentifier: this._languageId
        });
      }
    }));
  }
  _languageService;
  _standaloneThemeService;
  _languageId;
  _lexer;
  _embeddedLanguages;
  embeddedLoaded;
  _maxTokenizationLineLength;
  getLoadStatus() {
    const promises = [];
    for (const nestedLanguageId in this._embeddedLanguages) {
      const tokenizationSupport = languages.TokenizationRegistry.get(nestedLanguageId);
      if (tokenizationSupport) {
        if (tokenizationSupport instanceof MonarchTokenizer) {
          const nestedModeStatus = tokenizationSupport.getLoadStatus();
          if (nestedModeStatus.loaded === false) {
            promises.push(nestedModeStatus.promise);
          }
        }
        continue;
      }
      if (!languages.TokenizationRegistry.isResolved(nestedLanguageId)) {
        promises.push(
          languages.TokenizationRegistry.getOrCreate(
            nestedLanguageId
          )
        );
      }
    }
    if (promises.length === 0) {
      return {
        loaded: true
      };
    }
    return {
      loaded: false,
      promise: Promise.all(promises).then((_) => void 0)
    };
  }
  getInitialState() {
    const rootState = MonarchStackElementFactory.create(
      null,
      this._lexer.start
    );
    return MonarchLineStateFactory.create(rootState, null);
  }
  tokenize(line, hasEOL, lineState) {
    if (line.length >= this._maxTokenizationLineLength) {
      return nullTokenize(this._languageId, lineState);
    }
    const tokensCollector = new MonarchClassicTokensCollector();
    const endLineState = this._tokenize(
      line,
      hasEOL,
      lineState,
      tokensCollector
    );
    return tokensCollector.finalize(endLineState);
  }
  tokenizeEncoded(line, hasEOL, lineState) {
    if (line.length >= this._maxTokenizationLineLength) {
      return nullTokenizeEncoded(
        this._languageService.languageIdCodec.encodeLanguageId(
          this._languageId
        ),
        lineState
      );
    }
    const tokensCollector = new MonarchModernTokensCollector(
      this._languageService,
      this._standaloneThemeService.getColorTheme().tokenTheme
    );
    const endLineState = this._tokenize(
      line,
      hasEOL,
      lineState,
      tokensCollector
    );
    return tokensCollector.finalize(endLineState);
  }
  _tokenize(line, hasEOL, lineState, collector) {
    if (lineState.embeddedLanguageData) {
      return this._nestedTokenize(line, hasEOL, lineState, 0, collector);
    } else {
      return this._myTokenize(line, hasEOL, lineState, 0, collector);
    }
  }
  _findLeavingNestedLanguageOffset(line, state) {
    let rules = this._lexer.tokenizer[state.stack.state];
    if (!rules) {
      rules = monarchCommon.findRules(this._lexer, state.stack.state);
      if (!rules) {
        throw monarchCommon.createError(
          this._lexer,
          "tokenizer state is not defined: " + state.stack.state
        );
      }
    }
    let popOffset = -1;
    let hasEmbeddedPopRule = false;
    for (const rule of rules) {
      if (!monarchCommon.isIAction(rule.action) || rule.action.nextEmbedded !== "@pop") {
        continue;
      }
      hasEmbeddedPopRule = true;
      let regex = rule.resolveRegex(state.stack.state);
      const regexSource = regex.source;
      if (regexSource.substr(0, 4) === "^(?:" && regexSource.substr(regexSource.length - 1, 1) === ")") {
        const flags = (regex.ignoreCase ? "i" : "") + (regex.unicode ? "u" : "");
        regex = new RegExp(
          regexSource.substr(4, regexSource.length - 5),
          flags
        );
      }
      const result = line.search(regex);
      if (result === -1 || result !== 0 && rule.matchOnlyAtLineStart) {
        continue;
      }
      if (popOffset === -1 || result < popOffset) {
        popOffset = result;
      }
    }
    if (!hasEmbeddedPopRule) {
      throw monarchCommon.createError(
        this._lexer,
        'no rule containing nextEmbedded: "@pop" in tokenizer embedded state: ' + state.stack.state
      );
    }
    return popOffset;
  }
  _nestedTokenize(line, hasEOL, lineState, offsetDelta, tokensCollector) {
    const popOffset = this._findLeavingNestedLanguageOffset(
      line,
      lineState
    );
    if (popOffset === -1) {
      const nestedEndState = tokensCollector.nestedLanguageTokenize(
        line,
        hasEOL,
        lineState.embeddedLanguageData,
        offsetDelta
      );
      return MonarchLineStateFactory.create(
        lineState.stack,
        new EmbeddedLanguageData(
          lineState.embeddedLanguageData.languageId,
          nestedEndState
        )
      );
    }
    const nestedLanguageLine = line.substring(0, popOffset);
    if (nestedLanguageLine.length > 0) {
      tokensCollector.nestedLanguageTokenize(
        nestedLanguageLine,
        false,
        lineState.embeddedLanguageData,
        offsetDelta
      );
    }
    const restOfTheLine = line.substring(popOffset);
    return this._myTokenize(
      restOfTheLine,
      hasEOL,
      lineState,
      offsetDelta + popOffset,
      tokensCollector
    );
  }
  _safeRuleName(rule) {
    if (rule) {
      return rule.name;
    }
    return "(unknown)";
  }
  _myTokenize(lineWithoutLF, hasEOL, lineState, offsetDelta, tokensCollector) {
    tokensCollector.enterLanguage(this._languageId);
    const lineWithoutLFLength = lineWithoutLF.length;
    const line = hasEOL && this._lexer.includeLF ? lineWithoutLF + "\n" : lineWithoutLF;
    const lineLength = line.length;
    let embeddedLanguageData = lineState.embeddedLanguageData;
    let stack = lineState.stack;
    let pos = 0;
    let groupMatching = null;
    let forceEvaluation = true;
    while (forceEvaluation || pos < lineLength) {
      const pos0 = pos;
      const stackLen0 = stack.depth;
      const groupLen0 = groupMatching ? groupMatching.groups.length : 0;
      const state = stack.state;
      let matches = null;
      let matched = null;
      let action = null;
      let rule = null;
      let enteringEmbeddedLanguage = null;
      if (groupMatching) {
        matches = groupMatching.matches;
        const groupEntry = groupMatching.groups.shift();
        matched = groupEntry.matched;
        action = groupEntry.action;
        rule = groupMatching.rule;
        if (groupMatching.groups.length === 0) {
          groupMatching = null;
        }
      } else {
        if (!forceEvaluation && pos >= lineLength) {
          break;
        }
        forceEvaluation = false;
        let rules = this._lexer.tokenizer[state];
        if (!rules) {
          rules = monarchCommon.findRules(this._lexer, state);
          if (!rules) {
            throw monarchCommon.createError(
              this._lexer,
              "tokenizer state is not defined: " + state
            );
          }
        }
        const restOfLine = line.substr(pos);
        for (const rule2 of rules) {
          if (pos === 0 || !rule2.matchOnlyAtLineStart) {
            matches = restOfLine.match(rule2.resolveRegex(state));
            if (matches) {
              matched = matches[0];
              action = rule2.action;
              break;
            }
          }
        }
      }
      if (!matches) {
        matches = [""];
        matched = "";
      }
      if (!action) {
        if (pos < lineLength) {
          matches = [line.charAt(pos)];
          matched = matches[0];
        }
        action = this._lexer.defaultToken;
      }
      if (matched === null) {
        break;
      }
      pos += matched.length;
      while (monarchCommon.isFuzzyAction(action) && monarchCommon.isIAction(action) && action.test) {
        action = action.test(
          matched,
          matches,
          state,
          pos === lineLength
        );
      }
      let result = null;
      if (typeof action === "string" || Array.isArray(action)) {
        result = action;
      } else if (action.group) {
        result = action.group;
      } else if (action.token !== null && action.token !== void 0) {
        if (action.tokenSubst) {
          result = monarchCommon.substituteMatches(
            this._lexer,
            action.token,
            matched,
            matches,
            state
          );
        } else {
          result = action.token;
        }
        if (action.nextEmbedded) {
          if (action.nextEmbedded === "@pop") {
            if (!embeddedLanguageData) {
              throw monarchCommon.createError(
                this._lexer,
                "cannot pop embedded language if not inside one"
              );
            }
            embeddedLanguageData = null;
          } else if (embeddedLanguageData) {
            throw monarchCommon.createError(
              this._lexer,
              "cannot enter embedded language from within an embedded language"
            );
          } else {
            enteringEmbeddedLanguage = monarchCommon.substituteMatches(
              this._lexer,
              action.nextEmbedded,
              matched,
              matches,
              state
            );
          }
        }
        if (action.goBack) {
          pos = Math.max(0, pos - action.goBack);
        }
        if (action.switchTo && typeof action.switchTo === "string") {
          let nextState = monarchCommon.substituteMatches(
            this._lexer,
            action.switchTo,
            matched,
            matches,
            state
          );
          if (nextState[0] === "@") {
            nextState = nextState.substr(1);
          }
          if (monarchCommon.findRules(this._lexer, nextState)) {
            stack = stack.switchTo(nextState);
          } else {
            throw monarchCommon.createError(
              this._lexer,
              "trying to switch to a state '" + nextState + "' that is undefined in rule: " + this._safeRuleName(rule)
            );
          }
        } else if (action.transform && typeof action.transform === "function") {
          throw monarchCommon.createError(
            this._lexer,
            "action.transform not supported"
          );
        } else if (action.next) {
          if (action.next === "@push") {
            if (stack.depth >= this._lexer.maxStack) {
              throw monarchCommon.createError(
                this._lexer,
                "maximum tokenizer stack size reached: [" + stack.state + "," + stack.parent.state + ",...]"
              );
            } else {
              stack = stack.push(state);
            }
          } else if (action.next === "@pop") {
            if (stack.depth <= 1) {
              throw monarchCommon.createError(
                this._lexer,
                "trying to pop an empty stack in rule: " + this._safeRuleName(rule)
              );
            } else {
              stack = stack.pop();
            }
          } else if (action.next === "@popall") {
            stack = stack.popall();
          } else {
            let nextState = monarchCommon.substituteMatches(
              this._lexer,
              action.next,
              matched,
              matches,
              state
            );
            if (nextState[0] === "@") {
              nextState = nextState.substr(1);
            }
            if (monarchCommon.findRules(this._lexer, nextState)) {
              stack = stack.push(nextState);
            } else {
              throw monarchCommon.createError(
                this._lexer,
                "trying to set a next state '" + nextState + "' that is undefined in rule: " + this._safeRuleName(rule)
              );
            }
          }
        }
        if (action.log && typeof action.log === "string") {
          monarchCommon.log(
            this._lexer,
            this._lexer.languageId + ": " + monarchCommon.substituteMatches(
              this._lexer,
              action.log,
              matched,
              matches,
              state
            )
          );
        }
      }
      if (result === null) {
        throw monarchCommon.createError(
          this._lexer,
          "lexer rule has no well-defined action in rule: " + this._safeRuleName(rule)
        );
      }
      const computeNewStateForEmbeddedLanguage = (enteringEmbeddedLanguage2) => {
        const languageId = this._languageService.getLanguageIdByLanguageName(
          enteringEmbeddedLanguage2
        ) || this._languageService.getLanguageIdByMimeType(
          enteringEmbeddedLanguage2
        ) || enteringEmbeddedLanguage2;
        const embeddedLanguageData2 = this._getNestedEmbeddedLanguageData(languageId);
        if (pos < lineLength) {
          const restOfLine = lineWithoutLF.substr(pos);
          return this._nestedTokenize(
            restOfLine,
            hasEOL,
            MonarchLineStateFactory.create(
              stack,
              embeddedLanguageData2
            ),
            offsetDelta + pos,
            tokensCollector
          );
        } else {
          return MonarchLineStateFactory.create(
            stack,
            embeddedLanguageData2
          );
        }
      };
      if (Array.isArray(result)) {
        if (groupMatching && groupMatching.groups.length > 0) {
          throw monarchCommon.createError(
            this._lexer,
            "groups cannot be nested: " + this._safeRuleName(rule)
          );
        }
        if (matches.length !== result.length + 1) {
          throw monarchCommon.createError(
            this._lexer,
            "matched number of groups does not match the number of actions in rule: " + this._safeRuleName(rule)
          );
        }
        let totalLen = 0;
        for (let i = 1; i < matches.length; i++) {
          totalLen += matches[i].length;
        }
        if (totalLen !== matched.length) {
          throw monarchCommon.createError(
            this._lexer,
            "with groups, all characters should be matched in consecutive groups in rule: " + this._safeRuleName(rule)
          );
        }
        groupMatching = {
          rule,
          matches,
          groups: []
        };
        for (let i = 0; i < result.length; i++) {
          groupMatching.groups[i] = {
            action: result[i],
            matched: matches[i + 1]
          };
        }
        pos -= matched.length;
        continue;
      } else {
        if (result === "@rematch") {
          pos -= matched.length;
          matched = "";
          matches = null;
          result = "";
          if (enteringEmbeddedLanguage !== null) {
            return computeNewStateForEmbeddedLanguage(
              enteringEmbeddedLanguage
            );
          }
        }
        if (matched.length === 0) {
          if (lineLength === 0 || stackLen0 !== stack.depth || state !== stack.state || (groupMatching ? groupMatching.groups.length : 0) !== groupLen0) {
            continue;
          } else {
            throw monarchCommon.createError(
              this._lexer,
              "no progress in tokenizer in rule: " + this._safeRuleName(rule)
            );
          }
        }
        let tokenType = null;
        if (monarchCommon.isString(result) && result.indexOf("@brackets") === 0) {
          const rest = result.substr("@brackets".length);
          const bracket = findBracket(this._lexer, matched);
          if (!bracket) {
            throw monarchCommon.createError(
              this._lexer,
              "@brackets token returned but no bracket defined as: " + matched
            );
          }
          tokenType = monarchCommon.sanitize(bracket.token + rest);
        } else {
          const token = result === "" ? "" : result + this._lexer.tokenPostfix;
          tokenType = monarchCommon.sanitize(token);
        }
        if (pos0 < lineWithoutLFLength) {
          tokensCollector.emit(pos0 + offsetDelta, tokenType);
        }
      }
      if (enteringEmbeddedLanguage !== null) {
        return computeNewStateForEmbeddedLanguage(
          enteringEmbeddedLanguage
        );
      }
    }
    return MonarchLineStateFactory.create(stack, embeddedLanguageData);
  }
  _getNestedEmbeddedLanguageData(languageId) {
    if (!this._languageService.isRegisteredLanguageId(languageId)) {
      return new EmbeddedLanguageData(languageId, NullState);
    }
    if (languageId !== this._languageId) {
      this._languageService.requestBasicLanguageFeatures(languageId);
      languages.TokenizationRegistry.getOrCreate(languageId);
      this._embeddedLanguages[languageId] = true;
    }
    const tokenizationSupport = languages.TokenizationRegistry.get(languageId);
    if (tokenizationSupport) {
      return new EmbeddedLanguageData(
        languageId,
        tokenizationSupport.getInitialState()
      );
    }
    return new EmbeddedLanguageData(languageId, NullState);
  }
};
MonarchTokenizer = __decorateClass([
  __decorateParam(4, IConfigurationService)
], MonarchTokenizer);
function findBracket(lexer, matched) {
  if (!matched) {
    return null;
  }
  matched = monarchCommon.fixCase(lexer, matched);
  const brackets = lexer.brackets;
  for (const bracket of brackets) {
    if (bracket.open === matched) {
      return {
        token: bracket.token,
        bracketType: monarchCommon.MonarchBracket.Open
      };
    } else if (bracket.close === matched) {
      return {
        token: bracket.token,
        bracketType: monarchCommon.MonarchBracket.Close
      };
    }
  }
  return null;
}
export {
  MonarchTokenizer
};
