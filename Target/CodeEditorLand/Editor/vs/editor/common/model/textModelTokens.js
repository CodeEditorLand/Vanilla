var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  runWhenGlobalIdle
} from "../../../base/common/async.js";
import {
  BugIndicatingError,
  onUnexpectedError
} from "../../../base/common/errors.js";
import { setTimeout0 } from "../../../base/common/platform.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { countEOL } from "../core/eolCounter.js";
import { LineRange } from "../core/lineRange.js";
import { OffsetRange } from "../core/offsetRange.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
import { nullTokenizeEncoded } from "../languages/nullTokenize.js";
import { ContiguousMultilineTokensBuilder } from "../tokens/contiguousMultilineTokensBuilder.js";
import { LineTokens } from "../tokens/lineTokens.js";
import { FixedArray } from "./fixedArray.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["CHEAP_TOKENIZATION_LENGTH_LIMIT"] = 2048] = "CHEAP_TOKENIZATION_LENGTH_LIMIT";
  return Constants2;
})(Constants || {});
class TokenizerWithStateStore {
  constructor(lineCount, tokenizationSupport) {
    this.tokenizationSupport = tokenizationSupport;
    this.store = new TrackingTokenizationStateStore(lineCount);
  }
  static {
    __name(this, "TokenizerWithStateStore");
  }
  initialState = this.tokenizationSupport.getInitialState();
  store;
  getStartState(lineNumber) {
    return this.store.getStartState(lineNumber, this.initialState);
  }
  getFirstInvalidLine() {
    return this.store.getFirstInvalidLine(this.initialState);
  }
}
class TokenizerWithStateStoreAndTextModel extends TokenizerWithStateStore {
  constructor(lineCount, tokenizationSupport, _textModel, _languageIdCodec) {
    super(lineCount, tokenizationSupport);
    this._textModel = _textModel;
    this._languageIdCodec = _languageIdCodec;
  }
  static {
    __name(this, "TokenizerWithStateStoreAndTextModel");
  }
  updateTokensUntilLine(builder, lineNumber) {
    const languageId = this._textModel.getLanguageId();
    while (true) {
      const lineToTokenize = this.getFirstInvalidLine();
      if (!lineToTokenize || lineToTokenize.lineNumber > lineNumber) {
        break;
      }
      const text = this._textModel.getLineContent(
        lineToTokenize.lineNumber
      );
      const r = safeTokenize(
        this._languageIdCodec,
        languageId,
        this.tokenizationSupport,
        text,
        true,
        lineToTokenize.startState
      );
      builder.add(lineToTokenize.lineNumber, r.tokens);
      this.store.setEndState(
        lineToTokenize.lineNumber,
        r.endState
      );
    }
  }
  /** assumes state is up to date */
  getTokenTypeIfInsertingCharacter(position, character) {
    const lineStartState = this.getStartState(position.lineNumber);
    if (!lineStartState) {
      return StandardTokenType.Other;
    }
    const languageId = this._textModel.getLanguageId();
    const lineContent = this._textModel.getLineContent(position.lineNumber);
    const text = lineContent.substring(0, position.column - 1) + character + lineContent.substring(position.column - 1);
    const r = safeTokenize(
      this._languageIdCodec,
      languageId,
      this.tokenizationSupport,
      text,
      true,
      lineStartState
    );
    const lineTokens = new LineTokens(
      r.tokens,
      text,
      this._languageIdCodec
    );
    if (lineTokens.getCount() === 0) {
      return StandardTokenType.Other;
    }
    const tokenIndex = lineTokens.findTokenIndexAtOffset(
      position.column - 1
    );
    return lineTokens.getStandardTokenType(tokenIndex);
  }
  /** assumes state is up to date */
  tokenizeLineWithEdit(lineNumber, edit) {
    const lineStartState = this.getStartState(lineNumber);
    if (!lineStartState) {
      return { mainLineTokens: null, additionalLines: null };
    }
    const curLineContent = this._textModel.getLineContent(lineNumber);
    const newLineContent = edit.lineEdit.apply(curLineContent);
    const languageId = this._textModel.getLanguageIdAtPosition(
      lineNumber,
      0
    );
    const result = safeTokenize(
      this._languageIdCodec,
      languageId,
      this.tokenizationSupport,
      newLineContent,
      true,
      lineStartState
    );
    let additionalLines = null;
    if (edit.additionalLines) {
      additionalLines = [];
      let state = result.endState;
      for (const line of edit.additionalLines) {
        const r = safeTokenize(
          this._languageIdCodec,
          languageId,
          this.tokenizationSupport,
          line,
          true,
          state
        );
        additionalLines.push(
          new LineTokens(r.tokens, line, this._languageIdCodec)
        );
        state = r.endState;
      }
    }
    const mainLineTokens = new LineTokens(
      result.tokens,
      newLineContent,
      this._languageIdCodec
    );
    return { mainLineTokens, additionalLines };
  }
  hasAccurateTokensForLine(lineNumber) {
    const firstInvalidLineNumber = this.store.getFirstInvalidEndStateLineNumberOrMax();
    return lineNumber < firstInvalidLineNumber;
  }
  isCheapToTokenize(lineNumber) {
    const firstInvalidLineNumber = this.store.getFirstInvalidEndStateLineNumberOrMax();
    if (lineNumber < firstInvalidLineNumber) {
      return true;
    }
    if (lineNumber === firstInvalidLineNumber && this._textModel.getLineLength(lineNumber) < 2048 /* CHEAP_TOKENIZATION_LENGTH_LIMIT */) {
      return true;
    }
    return false;
  }
  /**
   * The result is not cached.
   */
  tokenizeHeuristically(builder, startLineNumber, endLineNumber) {
    if (endLineNumber <= this.store.getFirstInvalidEndStateLineNumberOrMax()) {
      return { heuristicTokens: false };
    }
    if (startLineNumber <= this.store.getFirstInvalidEndStateLineNumberOrMax()) {
      this.updateTokensUntilLine(builder, endLineNumber);
      return { heuristicTokens: false };
    }
    let state = this.guessStartState(startLineNumber);
    const languageId = this._textModel.getLanguageId();
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      const text = this._textModel.getLineContent(lineNumber);
      const r = safeTokenize(
        this._languageIdCodec,
        languageId,
        this.tokenizationSupport,
        text,
        true,
        state
      );
      builder.add(lineNumber, r.tokens);
      state = r.endState;
    }
    return { heuristicTokens: true };
  }
  guessStartState(lineNumber) {
    let nonWhitespaceColumn = this._textModel.getLineFirstNonWhitespaceColumn(lineNumber);
    const likelyRelevantLines = [];
    let initialState = null;
    for (let i = lineNumber - 1; nonWhitespaceColumn > 1 && i >= 1; i--) {
      const newNonWhitespaceIndex = this._textModel.getLineFirstNonWhitespaceColumn(i);
      if (newNonWhitespaceIndex === 0) {
        continue;
      }
      if (newNonWhitespaceIndex < nonWhitespaceColumn) {
        likelyRelevantLines.push(this._textModel.getLineContent(i));
        nonWhitespaceColumn = newNonWhitespaceIndex;
        initialState = this.getStartState(i);
        if (initialState) {
          break;
        }
      }
    }
    if (!initialState) {
      initialState = this.tokenizationSupport.getInitialState();
    }
    likelyRelevantLines.reverse();
    const languageId = this._textModel.getLanguageId();
    let state = initialState;
    for (const line of likelyRelevantLines) {
      const r = safeTokenize(
        this._languageIdCodec,
        languageId,
        this.tokenizationSupport,
        line,
        false,
        state
      );
      state = r.endState;
    }
    return state;
  }
}
class TrackingTokenizationStateStore {
  constructor(lineCount) {
    this.lineCount = lineCount;
    this._invalidEndStatesLineNumbers.addRange(
      new OffsetRange(1, lineCount + 1)
    );
  }
  static {
    __name(this, "TrackingTokenizationStateStore");
  }
  _tokenizationStateStore = new TokenizationStateStore();
  _invalidEndStatesLineNumbers = new RangePriorityQueueImpl();
  getEndState(lineNumber) {
    return this._tokenizationStateStore.getEndState(lineNumber);
  }
  /**
   * @returns if the end state has changed.
   */
  setEndState(lineNumber, state) {
    if (!state) {
      throw new BugIndicatingError("Cannot set null/undefined state");
    }
    this._invalidEndStatesLineNumbers.delete(lineNumber);
    const r = this._tokenizationStateStore.setEndState(lineNumber, state);
    if (r && lineNumber < this.lineCount) {
      this._invalidEndStatesLineNumbers.addRange(
        new OffsetRange(lineNumber + 1, lineNumber + 2)
      );
    }
    return r;
  }
  acceptChange(range, newLineCount) {
    this.lineCount += newLineCount - range.length;
    this._tokenizationStateStore.acceptChange(range, newLineCount);
    this._invalidEndStatesLineNumbers.addRangeAndResize(
      new OffsetRange(
        range.startLineNumber,
        range.endLineNumberExclusive
      ),
      newLineCount
    );
  }
  acceptChanges(changes) {
    for (const c of changes) {
      const [eolCount] = countEOL(c.text);
      this.acceptChange(
        new LineRange(
          c.range.startLineNumber,
          c.range.endLineNumber + 1
        ),
        eolCount + 1
      );
    }
  }
  invalidateEndStateRange(range) {
    this._invalidEndStatesLineNumbers.addRange(
      new OffsetRange(
        range.startLineNumber,
        range.endLineNumberExclusive
      )
    );
  }
  getFirstInvalidEndStateLineNumber() {
    return this._invalidEndStatesLineNumbers.min;
  }
  getFirstInvalidEndStateLineNumberOrMax() {
    return this.getFirstInvalidEndStateLineNumber() || Number.MAX_SAFE_INTEGER;
  }
  allStatesValid() {
    return this._invalidEndStatesLineNumbers.min === null;
  }
  getStartState(lineNumber, initialState) {
    if (lineNumber === 1) {
      return initialState;
    }
    return this.getEndState(lineNumber - 1);
  }
  getFirstInvalidLine(initialState) {
    const lineNumber = this.getFirstInvalidEndStateLineNumber();
    if (lineNumber === null) {
      return null;
    }
    const startState = this.getStartState(lineNumber, initialState);
    if (!startState) {
      throw new BugIndicatingError("Start state must be defined");
    }
    return { lineNumber, startState };
  }
}
class TokenizationStateStore {
  static {
    __name(this, "TokenizationStateStore");
  }
  _lineEndStates = new FixedArray(null);
  getEndState(lineNumber) {
    return this._lineEndStates.get(lineNumber);
  }
  setEndState(lineNumber, state) {
    const oldState = this._lineEndStates.get(lineNumber);
    if (oldState && oldState.equals(state)) {
      return false;
    }
    this._lineEndStates.set(lineNumber, state);
    return true;
  }
  acceptChange(range, newLineCount) {
    let length = range.length;
    if (newLineCount > 0 && length > 0) {
      length--;
      newLineCount--;
    }
    this._lineEndStates.replace(
      range.startLineNumber,
      length,
      newLineCount
    );
  }
  acceptChanges(changes) {
    for (const c of changes) {
      const [eolCount] = countEOL(c.text);
      this.acceptChange(
        new LineRange(
          c.range.startLineNumber,
          c.range.endLineNumber + 1
        ),
        eolCount + 1
      );
    }
  }
}
class RangePriorityQueueImpl {
  static {
    __name(this, "RangePriorityQueueImpl");
  }
  _ranges = [];
  getRanges() {
    return this._ranges;
  }
  get min() {
    if (this._ranges.length === 0) {
      return null;
    }
    return this._ranges[0].start;
  }
  removeMin() {
    if (this._ranges.length === 0) {
      return null;
    }
    const range = this._ranges[0];
    if (range.start + 1 === range.endExclusive) {
      this._ranges.shift();
    } else {
      this._ranges[0] = new OffsetRange(
        range.start + 1,
        range.endExclusive
      );
    }
    return range.start;
  }
  delete(value) {
    const idx = this._ranges.findIndex((r) => r.contains(value));
    if (idx !== -1) {
      const range = this._ranges[idx];
      if (range.start === value) {
        if (range.endExclusive === value + 1) {
          this._ranges.splice(idx, 1);
        } else {
          this._ranges[idx] = new OffsetRange(
            value + 1,
            range.endExclusive
          );
        }
      } else if (range.endExclusive === value + 1) {
        this._ranges[idx] = new OffsetRange(range.start, value);
      } else {
        this._ranges.splice(
          idx,
          1,
          new OffsetRange(range.start, value),
          new OffsetRange(value + 1, range.endExclusive)
        );
      }
    }
  }
  addRange(range) {
    OffsetRange.addRange(range, this._ranges);
  }
  addRangeAndResize(range, newLength) {
    let idxFirstMightBeIntersecting = 0;
    while (!(idxFirstMightBeIntersecting >= this._ranges.length || range.start <= this._ranges[idxFirstMightBeIntersecting].endExclusive)) {
      idxFirstMightBeIntersecting++;
    }
    let idxFirstIsAfter = idxFirstMightBeIntersecting;
    while (!(idxFirstIsAfter >= this._ranges.length || range.endExclusive < this._ranges[idxFirstIsAfter].start)) {
      idxFirstIsAfter++;
    }
    const delta = newLength - range.length;
    for (let i = idxFirstIsAfter; i < this._ranges.length; i++) {
      this._ranges[i] = this._ranges[i].delta(delta);
    }
    if (idxFirstMightBeIntersecting === idxFirstIsAfter) {
      const newRange = new OffsetRange(
        range.start,
        range.start + newLength
      );
      if (!newRange.isEmpty) {
        this._ranges.splice(idxFirstMightBeIntersecting, 0, newRange);
      }
    } else {
      const start = Math.min(
        range.start,
        this._ranges[idxFirstMightBeIntersecting].start
      );
      const endEx = Math.max(
        range.endExclusive,
        this._ranges[idxFirstIsAfter - 1].endExclusive
      );
      const newRange = new OffsetRange(start, endEx + delta);
      if (newRange.isEmpty) {
        this._ranges.splice(
          idxFirstMightBeIntersecting,
          idxFirstIsAfter - idxFirstMightBeIntersecting
        );
      } else {
        this._ranges.splice(
          idxFirstMightBeIntersecting,
          idxFirstIsAfter - idxFirstMightBeIntersecting,
          newRange
        );
      }
    }
  }
  toString() {
    return this._ranges.map((r) => r.toString()).join(" + ");
  }
}
function safeTokenize(languageIdCodec, languageId, tokenizationSupport, text, hasEOL, state) {
  let r = null;
  if (tokenizationSupport) {
    try {
      r = tokenizationSupport.tokenizeEncoded(
        text,
        hasEOL,
        state.clone()
      );
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  if (!r) {
    r = nullTokenizeEncoded(
      languageIdCodec.encodeLanguageId(languageId),
      state
    );
  }
  LineTokens.convertToEndOffset(r.tokens, text.length);
  return r;
}
__name(safeTokenize, "safeTokenize");
class DefaultBackgroundTokenizer {
  constructor(_tokenizerWithStateStore, _backgroundTokenStore) {
    this._tokenizerWithStateStore = _tokenizerWithStateStore;
    this._backgroundTokenStore = _backgroundTokenStore;
  }
  static {
    __name(this, "DefaultBackgroundTokenizer");
  }
  _isDisposed = false;
  dispose() {
    this._isDisposed = true;
  }
  handleChanges() {
    this._beginBackgroundTokenization();
  }
  _isScheduled = false;
  _beginBackgroundTokenization() {
    if (this._isScheduled || !this._tokenizerWithStateStore._textModel.isAttachedToEditor() || !this._hasLinesToTokenize()) {
      return;
    }
    this._isScheduled = true;
    runWhenGlobalIdle((deadline) => {
      this._isScheduled = false;
      this._backgroundTokenizeWithDeadline(deadline);
    });
  }
  /**
   * Tokenize until the deadline occurs, but try to yield every 1-2ms.
   */
  _backgroundTokenizeWithDeadline(deadline) {
    const endTime = Date.now() + deadline.timeRemaining();
    const execute = /* @__PURE__ */ __name(() => {
      if (this._isDisposed || !this._tokenizerWithStateStore._textModel.isAttachedToEditor() || !this._hasLinesToTokenize()) {
        return;
      }
      this._backgroundTokenizeForAtLeast1ms();
      if (Date.now() < endTime) {
        setTimeout0(execute);
      } else {
        this._beginBackgroundTokenization();
      }
    }, "execute");
    execute();
  }
  /**
   * Tokenize for at least 1ms.
   */
  _backgroundTokenizeForAtLeast1ms() {
    const lineCount = this._tokenizerWithStateStore._textModel.getLineCount();
    const builder = new ContiguousMultilineTokensBuilder();
    const sw = StopWatch.create(false);
    do {
      if (sw.elapsed() > 1) {
        break;
      }
      const tokenizedLineNumber = this._tokenizeOneInvalidLine(builder);
      if (tokenizedLineNumber >= lineCount) {
        break;
      }
    } while (this._hasLinesToTokenize());
    this._backgroundTokenStore.setTokens(builder.finalize());
    this.checkFinished();
  }
  _hasLinesToTokenize() {
    if (!this._tokenizerWithStateStore) {
      return false;
    }
    return !this._tokenizerWithStateStore.store.allStatesValid();
  }
  _tokenizeOneInvalidLine(builder) {
    const firstInvalidLine = this._tokenizerWithStateStore?.getFirstInvalidLine();
    if (!firstInvalidLine) {
      return this._tokenizerWithStateStore._textModel.getLineCount() + 1;
    }
    this._tokenizerWithStateStore.updateTokensUntilLine(
      builder,
      firstInvalidLine.lineNumber
    );
    return firstInvalidLine.lineNumber;
  }
  checkFinished() {
    if (this._isDisposed) {
      return;
    }
    if (this._tokenizerWithStateStore.store.allStatesValid()) {
      this._backgroundTokenStore.backgroundTokenizationFinished();
    }
  }
  requestTokens(startLineNumber, endLineNumberExclusive) {
    this._tokenizerWithStateStore.store.invalidateEndStateRange(
      new LineRange(startLineNumber, endLineNumberExclusive)
    );
  }
}
export {
  DefaultBackgroundTokenizer,
  RangePriorityQueueImpl,
  TokenizationStateStore,
  TokenizerWithStateStore,
  TokenizerWithStateStoreAndTextModel,
  TrackingTokenizationStateStore
};
//# sourceMappingURL=textModelTokens.js.map
