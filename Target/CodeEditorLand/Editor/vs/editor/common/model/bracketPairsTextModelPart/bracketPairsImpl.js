var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CallbackIterable, compareBy } from "../../../../base/common/arrays.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { Range } from "../../core/range.js";
import { ignoreBracketsInToken } from "../../languages/supports.js";
import {
  BracketsUtils
} from "../../languages/supports/richEditBrackets.js";
import { BracketPairsTree } from "./bracketPairsTree/bracketPairsTree.js";
class BracketPairsTextModelPart extends Disposable {
  constructor(textModel, languageConfigurationService) {
    super();
    this.textModel = textModel;
    this.languageConfigurationService = languageConfigurationService;
  }
  static {
    __name(this, "BracketPairsTextModelPart");
  }
  bracketPairsTree = this._register(
    new MutableDisposable()
  );
  onDidChangeEmitter = new Emitter();
  onDidChange = this.onDidChangeEmitter.event;
  get canBuildAST() {
    const maxSupportedDocumentLength = (
      /* max lines */
      5e4 * /* average column count */
      100
    );
    return this.textModel.getValueLength() <= maxSupportedDocumentLength;
  }
  bracketsRequested = false;
  //#region TextModel events
  handleLanguageConfigurationServiceChange(e) {
    if (!e.languageId || this.bracketPairsTree.value?.object.didLanguageChange(e.languageId)) {
      this.bracketPairsTree.clear();
      this.updateBracketPairsTree();
    }
  }
  handleDidChangeOptions(e) {
    this.bracketPairsTree.clear();
    this.updateBracketPairsTree();
  }
  handleDidChangeLanguage(e) {
    this.bracketPairsTree.clear();
    this.updateBracketPairsTree();
  }
  handleDidChangeContent(change) {
    this.bracketPairsTree.value?.object.handleContentChanged(change);
  }
  handleDidChangeBackgroundTokenizationState() {
    this.bracketPairsTree.value?.object.handleDidChangeBackgroundTokenizationState();
  }
  handleDidChangeTokens(e) {
    this.bracketPairsTree.value?.object.handleDidChangeTokens(e);
  }
  //#endregion
  updateBracketPairsTree() {
    if (this.bracketsRequested && this.canBuildAST) {
      if (!this.bracketPairsTree.value) {
        const store = new DisposableStore();
        this.bracketPairsTree.value = createDisposableRef(
          store.add(
            new BracketPairsTree(this.textModel, (languageId) => {
              return this.languageConfigurationService.getLanguageConfiguration(
                languageId
              );
            })
          ),
          store
        );
        store.add(
          this.bracketPairsTree.value.object.onDidChange(
            (e) => this.onDidChangeEmitter.fire(e)
          )
        );
        this.onDidChangeEmitter.fire();
      }
    } else if (this.bracketPairsTree.value) {
      this.bracketPairsTree.clear();
      this.onDidChangeEmitter.fire();
    }
  }
  /**
   * Returns all bracket pairs that intersect the given range.
   * The result is sorted by the start position.
   */
  getBracketPairsInRange(range) {
    this.bracketsRequested = true;
    this.updateBracketPairsTree();
    return this.bracketPairsTree.value?.object.getBracketPairsInRange(
      range,
      false
    ) || CallbackIterable.empty;
  }
  getBracketPairsInRangeWithMinIndentation(range) {
    this.bracketsRequested = true;
    this.updateBracketPairsTree();
    return this.bracketPairsTree.value?.object.getBracketPairsInRange(
      range,
      true
    ) || CallbackIterable.empty;
  }
  getBracketsInRange(range, onlyColorizedBrackets = false) {
    this.bracketsRequested = true;
    this.updateBracketPairsTree();
    return this.bracketPairsTree.value?.object.getBracketsInRange(
      range,
      onlyColorizedBrackets
    ) || CallbackIterable.empty;
  }
  findMatchingBracketUp(_bracket, _position, maxDuration) {
    const position = this.textModel.validatePosition(_position);
    const languageId = this.textModel.getLanguageIdAtPosition(
      position.lineNumber,
      position.column
    );
    if (this.canBuildAST) {
      const closingBracketInfo = this.languageConfigurationService.getLanguageConfiguration(languageId).bracketsNew.getClosingBracketInfo(_bracket);
      if (!closingBracketInfo) {
        return null;
      }
      const bracketPair = this.getBracketPairsInRange(
        Range.fromPositions(_position, _position)
      ).findLast((b) => closingBracketInfo.closes(b.openingBracketInfo));
      if (bracketPair) {
        return bracketPair.openingBracketRange;
      }
      return null;
    } else {
      const bracket = _bracket.toLowerCase();
      const bracketsSupport = this.languageConfigurationService.getLanguageConfiguration(
        languageId
      ).brackets;
      if (!bracketsSupport) {
        return null;
      }
      const data = bracketsSupport.textIsBracket[bracket];
      if (!data) {
        return null;
      }
      return stripBracketSearchCanceled(
        this._findMatchingBracketUp(
          data,
          position,
          createTimeBasedContinueBracketSearchPredicate(maxDuration)
        )
      );
    }
  }
  matchBracket(position, maxDuration) {
    if (this.canBuildAST) {
      const bracketPair = this.getBracketPairsInRange(
        Range.fromPositions(position, position)
      ).filter(
        (item) => item.closingBracketRange !== void 0 && (item.openingBracketRange.containsPosition(position) || item.closingBracketRange.containsPosition(
          position
        ))
      ).findLastMaxBy(
        compareBy(
          (item) => item.openingBracketRange.containsPosition(position) ? item.openingBracketRange : item.closingBracketRange,
          Range.compareRangesUsingStarts
        )
      );
      if (bracketPair) {
        return [
          bracketPair.openingBracketRange,
          bracketPair.closingBracketRange
        ];
      }
      return null;
    } else {
      const continueSearchPredicate = createTimeBasedContinueBracketSearchPredicate(maxDuration);
      return this._matchBracket(
        this.textModel.validatePosition(position),
        continueSearchPredicate
      );
    }
  }
  _establishBracketSearchOffsets(position, lineTokens, modeBrackets, tokenIndex) {
    const tokenCount = lineTokens.getCount();
    const currentLanguageId = lineTokens.getLanguageId(tokenIndex);
    let searchStartOffset = Math.max(
      0,
      position.column - 1 - modeBrackets.maxBracketLength
    );
    for (let i = tokenIndex - 1; i >= 0; i--) {
      const tokenEndOffset = lineTokens.getEndOffset(i);
      if (tokenEndOffset <= searchStartOffset) {
        break;
      }
      if (ignoreBracketsInToken(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
        searchStartOffset = tokenEndOffset;
        break;
      }
    }
    let searchEndOffset = Math.min(
      lineTokens.getLineContent().length,
      position.column - 1 + modeBrackets.maxBracketLength
    );
    for (let i = tokenIndex + 1; i < tokenCount; i++) {
      const tokenStartOffset = lineTokens.getStartOffset(i);
      if (tokenStartOffset >= searchEndOffset) {
        break;
      }
      if (ignoreBracketsInToken(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
        searchEndOffset = tokenStartOffset;
        break;
      }
    }
    return { searchStartOffset, searchEndOffset };
  }
  _matchBracket(position, continueSearchPredicate) {
    const lineNumber = position.lineNumber;
    const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
    const lineText = this.textModel.getLineContent(lineNumber);
    const tokenIndex = lineTokens.findTokenIndexAtOffset(
      position.column - 1
    );
    if (tokenIndex < 0) {
      return null;
    }
    const currentModeBrackets = this.languageConfigurationService.getLanguageConfiguration(
      lineTokens.getLanguageId(tokenIndex)
    ).brackets;
    if (currentModeBrackets && !ignoreBracketsInToken(lineTokens.getStandardTokenType(tokenIndex))) {
      let { searchStartOffset, searchEndOffset } = this._establishBracketSearchOffsets(
        position,
        lineTokens,
        currentModeBrackets,
        tokenIndex
      );
      let bestResult = null;
      while (true) {
        const foundBracket = BracketsUtils.findNextBracketInRange(
          currentModeBrackets.forwardRegex,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (!foundBracket) {
          break;
        }
        if (foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
          const foundBracketText = lineText.substring(
            foundBracket.startColumn - 1,
            foundBracket.endColumn - 1
          ).toLowerCase();
          const r = this._matchFoundBracket(
            foundBracket,
            currentModeBrackets.textIsBracket[foundBracketText],
            currentModeBrackets.textIsOpenBracket[foundBracketText],
            continueSearchPredicate
          );
          if (r) {
            if (r instanceof BracketSearchCanceled) {
              return null;
            }
            bestResult = r;
          }
        }
        searchStartOffset = foundBracket.endColumn - 1;
      }
      if (bestResult) {
        return bestResult;
      }
    }
    if (tokenIndex > 0 && lineTokens.getStartOffset(tokenIndex) === position.column - 1) {
      const prevTokenIndex = tokenIndex - 1;
      const prevModeBrackets = this.languageConfigurationService.getLanguageConfiguration(
        lineTokens.getLanguageId(prevTokenIndex)
      ).brackets;
      if (prevModeBrackets && !ignoreBracketsInToken(
        lineTokens.getStandardTokenType(prevTokenIndex)
      )) {
        const { searchStartOffset, searchEndOffset } = this._establishBracketSearchOffsets(
          position,
          lineTokens,
          prevModeBrackets,
          prevTokenIndex
        );
        const foundBracket = BracketsUtils.findPrevBracketInRange(
          prevModeBrackets.reversedRegex,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (foundBracket && foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
          const foundBracketText = lineText.substring(
            foundBracket.startColumn - 1,
            foundBracket.endColumn - 1
          ).toLowerCase();
          const r = this._matchFoundBracket(
            foundBracket,
            prevModeBrackets.textIsBracket[foundBracketText],
            prevModeBrackets.textIsOpenBracket[foundBracketText],
            continueSearchPredicate
          );
          if (r) {
            if (r instanceof BracketSearchCanceled) {
              return null;
            }
            return r;
          }
        }
      }
    }
    return null;
  }
  _matchFoundBracket(foundBracket, data, isOpen, continueSearchPredicate) {
    if (!data) {
      return null;
    }
    const matched = isOpen ? this._findMatchingBracketDown(
      data,
      foundBracket.getEndPosition(),
      continueSearchPredicate
    ) : this._findMatchingBracketUp(
      data,
      foundBracket.getStartPosition(),
      continueSearchPredicate
    );
    if (!matched) {
      return null;
    }
    if (matched instanceof BracketSearchCanceled) {
      return matched;
    }
    return [foundBracket, matched];
  }
  _findMatchingBracketUp(bracket, position, continueSearchPredicate) {
    const languageId = bracket.languageId;
    const reversedBracketRegex = bracket.reversedRegex;
    let count = -1;
    let totalCallCount = 0;
    const searchPrevMatchingBracketInRange = /* @__PURE__ */ __name((lineNumber, lineText, searchStartOffset, searchEndOffset) => {
      while (true) {
        if (continueSearchPredicate && ++totalCallCount % 100 === 0 && !continueSearchPredicate()) {
          return BracketSearchCanceled.INSTANCE;
        }
        const r = BracketsUtils.findPrevBracketInRange(
          reversedBracketRegex,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (!r) {
          break;
        }
        const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
        if (bracket.isOpen(hitText)) {
          count++;
        } else if (bracket.isClose(hitText)) {
          count--;
        }
        if (count === 0) {
          return r;
        }
        searchEndOffset = r.startColumn - 1;
      }
      return null;
    }, "searchPrevMatchingBracketInRange");
    for (let lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
      const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
      const tokenCount = lineTokens.getCount();
      const lineText = this.textModel.getLineContent(lineNumber);
      let tokenIndex = tokenCount - 1;
      let searchStartOffset = lineText.length;
      let searchEndOffset = lineText.length;
      if (lineNumber === position.lineNumber) {
        tokenIndex = lineTokens.findTokenIndexAtOffset(
          position.column - 1
        );
        searchStartOffset = position.column - 1;
        searchEndOffset = position.column - 1;
      }
      let prevSearchInToken = true;
      for (; tokenIndex >= 0; tokenIndex--) {
        const searchInToken = lineTokens.getLanguageId(tokenIndex) === languageId && !ignoreBracketsInToken(
          lineTokens.getStandardTokenType(tokenIndex)
        );
        if (searchInToken) {
          if (prevSearchInToken) {
            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
          } else {
            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          }
        } else {
          if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = searchPrevMatchingBracketInRange(
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return r;
            }
          }
        }
        prevSearchInToken = searchInToken;
      }
      if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
        const r = searchPrevMatchingBracketInRange(
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (r) {
          return r;
        }
      }
    }
    return null;
  }
  _findMatchingBracketDown(bracket, position, continueSearchPredicate) {
    const languageId = bracket.languageId;
    const bracketRegex = bracket.forwardRegex;
    let count = 1;
    let totalCallCount = 0;
    const searchNextMatchingBracketInRange = /* @__PURE__ */ __name((lineNumber, lineText, searchStartOffset, searchEndOffset) => {
      while (true) {
        if (continueSearchPredicate && ++totalCallCount % 100 === 0 && !continueSearchPredicate()) {
          return BracketSearchCanceled.INSTANCE;
        }
        const r = BracketsUtils.findNextBracketInRange(
          bracketRegex,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (!r) {
          break;
        }
        const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
        if (bracket.isOpen(hitText)) {
          count++;
        } else if (bracket.isClose(hitText)) {
          count--;
        }
        if (count === 0) {
          return r;
        }
        searchStartOffset = r.endColumn - 1;
      }
      return null;
    }, "searchNextMatchingBracketInRange");
    const lineCount = this.textModel.getLineCount();
    for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
      const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
      const tokenCount = lineTokens.getCount();
      const lineText = this.textModel.getLineContent(lineNumber);
      let tokenIndex = 0;
      let searchStartOffset = 0;
      let searchEndOffset = 0;
      if (lineNumber === position.lineNumber) {
        tokenIndex = lineTokens.findTokenIndexAtOffset(
          position.column - 1
        );
        searchStartOffset = position.column - 1;
        searchEndOffset = position.column - 1;
      }
      let prevSearchInToken = true;
      for (; tokenIndex < tokenCount; tokenIndex++) {
        const searchInToken = lineTokens.getLanguageId(tokenIndex) === languageId && !ignoreBracketsInToken(
          lineTokens.getStandardTokenType(tokenIndex)
        );
        if (searchInToken) {
          if (prevSearchInToken) {
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          } else {
            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          }
        } else {
          if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = searchNextMatchingBracketInRange(
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return r;
            }
          }
        }
        prevSearchInToken = searchInToken;
      }
      if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
        const r = searchNextMatchingBracketInRange(
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (r) {
          return r;
        }
      }
    }
    return null;
  }
  findPrevBracket(_position) {
    const position = this.textModel.validatePosition(_position);
    if (this.canBuildAST) {
      this.bracketsRequested = true;
      this.updateBracketPairsTree();
      return this.bracketPairsTree.value?.object.getFirstBracketBefore(
        position
      ) || null;
    }
    let languageId = null;
    let modeBrackets = null;
    let bracketConfig = null;
    for (let lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
      const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
      const tokenCount = lineTokens.getCount();
      const lineText = this.textModel.getLineContent(lineNumber);
      let tokenIndex = tokenCount - 1;
      let searchStartOffset = lineText.length;
      let searchEndOffset = lineText.length;
      if (lineNumber === position.lineNumber) {
        tokenIndex = lineTokens.findTokenIndexAtOffset(
          position.column - 1
        );
        searchStartOffset = position.column - 1;
        searchEndOffset = position.column - 1;
        const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
        if (languageId !== tokenLanguageId) {
          languageId = tokenLanguageId;
          modeBrackets = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).brackets;
          bracketConfig = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).bracketsNew;
        }
      }
      let prevSearchInToken = true;
      for (; tokenIndex >= 0; tokenIndex--) {
        const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
        if (languageId !== tokenLanguageId) {
          if (modeBrackets && bracketConfig && prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = BracketsUtils.findPrevBracketInRange(
              modeBrackets.reversedRegex,
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return this._toFoundBracket(bracketConfig, r);
            }
            prevSearchInToken = false;
          }
          languageId = tokenLanguageId;
          modeBrackets = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).brackets;
          bracketConfig = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).bracketsNew;
        }
        const searchInToken = !!modeBrackets && !ignoreBracketsInToken(
          lineTokens.getStandardTokenType(tokenIndex)
        );
        if (searchInToken) {
          if (prevSearchInToken) {
            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
          } else {
            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          }
        } else {
          if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = BracketsUtils.findPrevBracketInRange(
              modeBrackets.reversedRegex,
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return this._toFoundBracket(bracketConfig, r);
            }
          }
        }
        prevSearchInToken = searchInToken;
      }
      if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
        const r = BracketsUtils.findPrevBracketInRange(
          modeBrackets.reversedRegex,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (r) {
          return this._toFoundBracket(bracketConfig, r);
        }
      }
    }
    return null;
  }
  findNextBracket(_position) {
    const position = this.textModel.validatePosition(_position);
    if (this.canBuildAST) {
      this.bracketsRequested = true;
      this.updateBracketPairsTree();
      return this.bracketPairsTree.value?.object.getFirstBracketAfter(
        position
      ) || null;
    }
    const lineCount = this.textModel.getLineCount();
    let languageId = null;
    let modeBrackets = null;
    let bracketConfig = null;
    for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
      const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
      const tokenCount = lineTokens.getCount();
      const lineText = this.textModel.getLineContent(lineNumber);
      let tokenIndex = 0;
      let searchStartOffset = 0;
      let searchEndOffset = 0;
      if (lineNumber === position.lineNumber) {
        tokenIndex = lineTokens.findTokenIndexAtOffset(
          position.column - 1
        );
        searchStartOffset = position.column - 1;
        searchEndOffset = position.column - 1;
        const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
        if (languageId !== tokenLanguageId) {
          languageId = tokenLanguageId;
          modeBrackets = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).brackets;
          bracketConfig = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).bracketsNew;
        }
      }
      let prevSearchInToken = true;
      for (; tokenIndex < tokenCount; tokenIndex++) {
        const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
        if (languageId !== tokenLanguageId) {
          if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = BracketsUtils.findNextBracketInRange(
              modeBrackets.forwardRegex,
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return this._toFoundBracket(bracketConfig, r);
            }
            prevSearchInToken = false;
          }
          languageId = tokenLanguageId;
          modeBrackets = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).brackets;
          bracketConfig = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).bracketsNew;
        }
        const searchInToken = !!modeBrackets && !ignoreBracketsInToken(
          lineTokens.getStandardTokenType(tokenIndex)
        );
        if (searchInToken) {
          if (prevSearchInToken) {
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          } else {
            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          }
        } else {
          if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = BracketsUtils.findNextBracketInRange(
              modeBrackets.forwardRegex,
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return this._toFoundBracket(bracketConfig, r);
            }
          }
        }
        prevSearchInToken = searchInToken;
      }
      if (bracketConfig && modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
        const r = BracketsUtils.findNextBracketInRange(
          modeBrackets.forwardRegex,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (r) {
          return this._toFoundBracket(bracketConfig, r);
        }
      }
    }
    return null;
  }
  findEnclosingBrackets(_position, maxDuration) {
    const position = this.textModel.validatePosition(_position);
    if (this.canBuildAST) {
      const range = Range.fromPositions(position);
      const bracketPair = this.getBracketPairsInRange(
        Range.fromPositions(position, position)
      ).findLast(
        (item) => item.closingBracketRange !== void 0 && item.range.strictContainsRange(range)
      );
      if (bracketPair) {
        return [
          bracketPair.openingBracketRange,
          bracketPair.closingBracketRange
        ];
      }
      return null;
    }
    const continueSearchPredicate = createTimeBasedContinueBracketSearchPredicate(maxDuration);
    const lineCount = this.textModel.getLineCount();
    const savedCounts = /* @__PURE__ */ new Map();
    let counts = [];
    const resetCounts = /* @__PURE__ */ __name((languageId2, modeBrackets2) => {
      if (!savedCounts.has(languageId2)) {
        const tmp = [];
        for (let i = 0, len = modeBrackets2 ? modeBrackets2.brackets.length : 0; i < len; i++) {
          tmp[i] = 0;
        }
        savedCounts.set(languageId2, tmp);
      }
      counts = savedCounts.get(languageId2);
    }, "resetCounts");
    let totalCallCount = 0;
    const searchInRange = /* @__PURE__ */ __name((modeBrackets2, lineNumber, lineText, searchStartOffset, searchEndOffset) => {
      while (true) {
        if (continueSearchPredicate && ++totalCallCount % 100 === 0 && !continueSearchPredicate()) {
          return BracketSearchCanceled.INSTANCE;
        }
        const r = BracketsUtils.findNextBracketInRange(
          modeBrackets2.forwardRegex,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (!r) {
          break;
        }
        const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
        const bracket = modeBrackets2.textIsBracket[hitText];
        if (bracket) {
          if (bracket.isOpen(hitText)) {
            counts[bracket.index]++;
          } else if (bracket.isClose(hitText)) {
            counts[bracket.index]--;
          }
          if (counts[bracket.index] === -1) {
            return this._matchFoundBracket(
              r,
              bracket,
              false,
              continueSearchPredicate
            );
          }
        }
        searchStartOffset = r.endColumn - 1;
      }
      return null;
    }, "searchInRange");
    let languageId = null;
    let modeBrackets = null;
    for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
      const lineTokens = this.textModel.tokenization.getLineTokens(lineNumber);
      const tokenCount = lineTokens.getCount();
      const lineText = this.textModel.getLineContent(lineNumber);
      let tokenIndex = 0;
      let searchStartOffset = 0;
      let searchEndOffset = 0;
      if (lineNumber === position.lineNumber) {
        tokenIndex = lineTokens.findTokenIndexAtOffset(
          position.column - 1
        );
        searchStartOffset = position.column - 1;
        searchEndOffset = position.column - 1;
        const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
        if (languageId !== tokenLanguageId) {
          languageId = tokenLanguageId;
          modeBrackets = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).brackets;
          resetCounts(languageId, modeBrackets);
        }
      }
      let prevSearchInToken = true;
      for (; tokenIndex < tokenCount; tokenIndex++) {
        const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
        if (languageId !== tokenLanguageId) {
          if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = searchInRange(
              modeBrackets,
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return stripBracketSearchCanceled(r);
            }
            prevSearchInToken = false;
          }
          languageId = tokenLanguageId;
          modeBrackets = this.languageConfigurationService.getLanguageConfiguration(
            languageId
          ).brackets;
          resetCounts(languageId, modeBrackets);
        }
        const searchInToken = !!modeBrackets && !ignoreBracketsInToken(
          lineTokens.getStandardTokenType(tokenIndex)
        );
        if (searchInToken) {
          if (prevSearchInToken) {
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          } else {
            searchStartOffset = lineTokens.getStartOffset(tokenIndex);
            searchEndOffset = lineTokens.getEndOffset(tokenIndex);
          }
        } else {
          if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
            const r = searchInRange(
              modeBrackets,
              lineNumber,
              lineText,
              searchStartOffset,
              searchEndOffset
            );
            if (r) {
              return stripBracketSearchCanceled(r);
            }
          }
        }
        prevSearchInToken = searchInToken;
      }
      if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
        const r = searchInRange(
          modeBrackets,
          lineNumber,
          lineText,
          searchStartOffset,
          searchEndOffset
        );
        if (r) {
          return stripBracketSearchCanceled(r);
        }
      }
    }
    return null;
  }
  _toFoundBracket(bracketConfig, r) {
    if (!r) {
      return null;
    }
    let text = this.textModel.getValueInRange(r);
    text = text.toLowerCase();
    const bracketInfo = bracketConfig.getBracketInfo(text);
    if (!bracketInfo) {
      return null;
    }
    return {
      range: r,
      bracketInfo
    };
  }
}
function createDisposableRef(object, disposable) {
  return {
    object,
    dispose: /* @__PURE__ */ __name(() => disposable?.dispose(), "dispose")
  };
}
__name(createDisposableRef, "createDisposableRef");
function createTimeBasedContinueBracketSearchPredicate(maxDuration) {
  if (typeof maxDuration === "undefined") {
    return () => true;
  } else {
    const startTime = Date.now();
    return () => {
      return Date.now() - startTime <= maxDuration;
    };
  }
}
__name(createTimeBasedContinueBracketSearchPredicate, "createTimeBasedContinueBracketSearchPredicate");
class BracketSearchCanceled {
  static {
    __name(this, "BracketSearchCanceled");
  }
  static INSTANCE = new BracketSearchCanceled();
  _searchCanceledBrand = void 0;
  constructor() {
  }
}
function stripBracketSearchCanceled(result) {
  if (result instanceof BracketSearchCanceled) {
    return null;
  }
  return result;
}
__name(stripBracketSearchCanceled, "stripBracketSearchCanceled");
export {
  BracketPairsTextModelPart
};
//# sourceMappingURL=bracketPairsImpl.js.map
