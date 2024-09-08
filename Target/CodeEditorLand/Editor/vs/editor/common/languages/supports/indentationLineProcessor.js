import * as strings from "../../../../base/common/strings.js";
import { StandardTokenType } from "../../encodedTokenAttributes.js";
import { LineTokens } from "../../tokens/lineTokens.js";
import { createScopedLineTokens } from "../supports.js";
class ProcessedIndentRulesSupport {
  _indentRulesSupport;
  _indentationLineProcessor;
  constructor(model, indentRulesSupport, languageConfigurationService) {
    this._indentRulesSupport = indentRulesSupport;
    this._indentationLineProcessor = new IndentationLineProcessor(
      model,
      languageConfigurationService
    );
  }
  /**
   * Apply the new indentation and return whether the indentation level should be increased after the given line number
   */
  shouldIncrease(lineNumber, newIndentation) {
    const processedLine = this._indentationLineProcessor.getProcessedLine(
      lineNumber,
      newIndentation
    );
    return this._indentRulesSupport.shouldIncrease(processedLine);
  }
  /**
   * Apply the new indentation and return whether the indentation level should be decreased after the given line number
   */
  shouldDecrease(lineNumber, newIndentation) {
    const processedLine = this._indentationLineProcessor.getProcessedLine(
      lineNumber,
      newIndentation
    );
    return this._indentRulesSupport.shouldDecrease(processedLine);
  }
  /**
   * Apply the new indentation and return whether the indentation level should remain unchanged at the given line number
   */
  shouldIgnore(lineNumber, newIndentation) {
    const processedLine = this._indentationLineProcessor.getProcessedLine(
      lineNumber,
      newIndentation
    );
    return this._indentRulesSupport.shouldIgnore(processedLine);
  }
  /**
   * Apply the new indentation and return whether the indentation level should increase on the line after the given line number
   */
  shouldIndentNextLine(lineNumber, newIndentation) {
    const processedLine = this._indentationLineProcessor.getProcessedLine(
      lineNumber,
      newIndentation
    );
    return this._indentRulesSupport.shouldIndentNextLine(processedLine);
  }
}
class IndentationContextProcessor {
  model;
  indentationLineProcessor;
  constructor(model, languageConfigurationService) {
    this.model = model;
    this.indentationLineProcessor = new IndentationLineProcessor(
      model,
      languageConfigurationService
    );
  }
  /**
   * Returns the processed text, stripped from the language configuration brackets within the string, comment and regex tokens, around the given range
   */
  getProcessedTokenContextAroundRange(range) {
    const beforeRangeProcessedTokens = this._getProcessedTokensBeforeRange(range);
    const afterRangeProcessedTokens = this._getProcessedTokensAfterRange(range);
    const previousLineProcessedTokens = this._getProcessedPreviousLineTokens(range);
    return {
      beforeRangeProcessedTokens,
      afterRangeProcessedTokens,
      previousLineProcessedTokens
    };
  }
  _getProcessedTokensBeforeRange(range) {
    this.model.tokenization.forceTokenization(range.startLineNumber);
    const lineTokens = this.model.tokenization.getLineTokens(
      range.startLineNumber
    );
    const scopedLineTokens = createScopedLineTokens(
      lineTokens,
      range.startColumn - 1
    );
    let slicedTokens;
    if (isLanguageDifferentFromLineStart(
      this.model,
      range.getStartPosition()
    )) {
      const columnIndexWithinScope = range.startColumn - 1 - scopedLineTokens.firstCharOffset;
      const firstCharacterOffset = scopedLineTokens.firstCharOffset;
      const lastCharacterOffset = firstCharacterOffset + columnIndexWithinScope;
      slicedTokens = lineTokens.sliceAndInflate(
        firstCharacterOffset,
        lastCharacterOffset,
        0
      );
    } else {
      const columnWithinLine = range.startColumn - 1;
      slicedTokens = lineTokens.sliceAndInflate(0, columnWithinLine, 0);
    }
    const processedTokens = this.indentationLineProcessor.getProcessedTokens(slicedTokens);
    return processedTokens;
  }
  _getProcessedTokensAfterRange(range) {
    const position = range.isEmpty() ? range.getStartPosition() : range.getEndPosition();
    this.model.tokenization.forceTokenization(position.lineNumber);
    const lineTokens = this.model.tokenization.getLineTokens(
      position.lineNumber
    );
    const scopedLineTokens = createScopedLineTokens(
      lineTokens,
      position.column - 1
    );
    const columnIndexWithinScope = position.column - 1 - scopedLineTokens.firstCharOffset;
    const firstCharacterOffset = scopedLineTokens.firstCharOffset + columnIndexWithinScope;
    const lastCharacterOffset = scopedLineTokens.firstCharOffset + scopedLineTokens.getLineLength();
    const slicedTokens = lineTokens.sliceAndInflate(
      firstCharacterOffset,
      lastCharacterOffset,
      0
    );
    const processedTokens = this.indentationLineProcessor.getProcessedTokens(slicedTokens);
    return processedTokens;
  }
  _getProcessedPreviousLineTokens(range) {
    const getScopedLineTokensAtEndColumnOfLine = (lineNumber) => {
      this.model.tokenization.forceTokenization(lineNumber);
      const lineTokens2 = this.model.tokenization.getLineTokens(lineNumber);
      const endColumnOfLine = this.model.getLineMaxColumn(lineNumber) - 1;
      const scopedLineTokensAtEndColumn = createScopedLineTokens(
        lineTokens2,
        endColumnOfLine
      );
      return scopedLineTokensAtEndColumn;
    };
    this.model.tokenization.forceTokenization(range.startLineNumber);
    const lineTokens = this.model.tokenization.getLineTokens(
      range.startLineNumber
    );
    const scopedLineTokens = createScopedLineTokens(
      lineTokens,
      range.startColumn - 1
    );
    const emptyTokens = LineTokens.createEmpty(
      "",
      scopedLineTokens.languageIdCodec
    );
    const previousLineNumber = range.startLineNumber - 1;
    const isFirstLine = previousLineNumber === 0;
    if (isFirstLine) {
      return emptyTokens;
    }
    const canScopeExtendOnPreviousLine = scopedLineTokens.firstCharOffset === 0;
    if (!canScopeExtendOnPreviousLine) {
      return emptyTokens;
    }
    const scopedLineTokensAtEndColumnOfPreviousLine = getScopedLineTokensAtEndColumnOfLine(previousLineNumber);
    const doesLanguageContinueOnPreviousLine = scopedLineTokens.languageId === scopedLineTokensAtEndColumnOfPreviousLine.languageId;
    if (!doesLanguageContinueOnPreviousLine) {
      return emptyTokens;
    }
    const previousSlicedLineTokens = scopedLineTokensAtEndColumnOfPreviousLine.toIViewLineTokens();
    const processedTokens = this.indentationLineProcessor.getProcessedTokens(
      previousSlicedLineTokens
    );
    return processedTokens;
  }
}
class IndentationLineProcessor {
  constructor(model, languageConfigurationService) {
    this.model = model;
    this.languageConfigurationService = languageConfigurationService;
  }
  /**
   * Get the processed line for the given line number and potentially adjust the indentation level.
   * Remove the language configuration brackets from the regex, string and comment tokens.
   */
  getProcessedLine(lineNumber, newIndentation) {
    const replaceIndentation = (line, newIndentation2) => {
      const currentIndentation = strings.getLeadingWhitespace(line);
      const adjustedLine = newIndentation2 + line.substring(currentIndentation.length);
      return adjustedLine;
    };
    this.model.tokenization.forceTokenization?.(lineNumber);
    const tokens = this.model.tokenization.getLineTokens(lineNumber);
    let processedLine = this.getProcessedTokens(tokens).getLineContent();
    if (newIndentation !== void 0) {
      processedLine = replaceIndentation(processedLine, newIndentation);
    }
    return processedLine;
  }
  /**
   * Process the line with the given tokens, remove the language configuration brackets from the regex, string and comment tokens.
   */
  getProcessedTokens(tokens) {
    const shouldRemoveBracketsFromTokenType = (tokenType) => {
      return tokenType === StandardTokenType.String || tokenType === StandardTokenType.RegEx || tokenType === StandardTokenType.Comment;
    };
    const languageId = tokens.getLanguageId(0);
    const bracketsConfiguration = this.languageConfigurationService.getLanguageConfiguration(
      languageId
    ).bracketsNew;
    const bracketsRegExp = bracketsConfiguration.getBracketRegExp({
      global: true
    });
    const textAndMetadata = [];
    tokens.forEach((tokenIndex) => {
      const tokenType = tokens.getStandardTokenType(tokenIndex);
      let text = tokens.getTokenText(tokenIndex);
      if (shouldRemoveBracketsFromTokenType(tokenType)) {
        text = text.replace(bracketsRegExp, "");
      }
      const metadata = tokens.getMetadata(tokenIndex);
      textAndMetadata.push({ text, metadata });
    });
    const processedLineTokens = LineTokens.createFromTextAndMetadata(
      textAndMetadata,
      tokens.languageIdCodec
    );
    return processedLineTokens;
  }
}
function isLanguageDifferentFromLineStart(model, position) {
  model.tokenization.forceTokenization(position.lineNumber);
  const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
  const scopedLineTokens = createScopedLineTokens(
    lineTokens,
    position.column - 1
  );
  const doesScopeStartAtOffsetZero = scopedLineTokens.firstCharOffset === 0;
  const isScopedLanguageEqualToFirstLanguageOnLine = lineTokens.getLanguageId(0) === scopedLineTokens.languageId;
  const languageIsDifferentFromLineStart = !doesScopeStartAtOffsetZero && !isScopedLanguageEqualToFirstLanguageOnLine;
  return languageIsDifferentFromLineStart;
}
export {
  IndentationContextProcessor,
  ProcessedIndentRulesSupport,
  isLanguageDifferentFromLineStart
};
