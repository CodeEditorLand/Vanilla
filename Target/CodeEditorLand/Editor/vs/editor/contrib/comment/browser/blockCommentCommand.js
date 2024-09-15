var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../../../../base/common/charCode.js";
import { EditOperation, ISingleEditOperation } from "../../../common/core/editOperation.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../../../common/editorCommon.js";
import { ITextModel } from "../../../common/model.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
class BlockCommentCommand {
  constructor(selection, insertSpace, languageConfigurationService) {
    this.languageConfigurationService = languageConfigurationService;
    this._selection = selection;
    this._insertSpace = insertSpace;
    this._usedEndToken = null;
  }
  static {
    __name(this, "BlockCommentCommand");
  }
  _selection;
  _insertSpace;
  _usedEndToken;
  static _haystackHasNeedleAtOffset(haystack, needle, offset) {
    if (offset < 0) {
      return false;
    }
    const needleLength = needle.length;
    const haystackLength = haystack.length;
    if (offset + needleLength > haystackLength) {
      return false;
    }
    for (let i = 0; i < needleLength; i++) {
      const codeA = haystack.charCodeAt(offset + i);
      const codeB = needle.charCodeAt(i);
      if (codeA === codeB) {
        continue;
      }
      if (codeA >= CharCode.A && codeA <= CharCode.Z && codeA + 32 === codeB) {
        continue;
      }
      if (codeB >= CharCode.A && codeB <= CharCode.Z && codeB + 32 === codeA) {
        continue;
      }
      return false;
    }
    return true;
  }
  _createOperationsForBlockComment(selection, startToken, endToken, insertSpace, model, builder) {
    const startLineNumber = selection.startLineNumber;
    const startColumn = selection.startColumn;
    const endLineNumber = selection.endLineNumber;
    const endColumn = selection.endColumn;
    const startLineText = model.getLineContent(startLineNumber);
    const endLineText = model.getLineContent(endLineNumber);
    let startTokenIndex = startLineText.lastIndexOf(startToken, startColumn - 1 + startToken.length);
    let endTokenIndex = endLineText.indexOf(endToken, endColumn - 1 - endToken.length);
    if (startTokenIndex !== -1 && endTokenIndex !== -1) {
      if (startLineNumber === endLineNumber) {
        const lineBetweenTokens = startLineText.substring(startTokenIndex + startToken.length, endTokenIndex);
        if (lineBetweenTokens.indexOf(endToken) >= 0) {
          startTokenIndex = -1;
          endTokenIndex = -1;
        }
      } else {
        const startLineAfterStartToken = startLineText.substring(startTokenIndex + startToken.length);
        const endLineBeforeEndToken = endLineText.substring(0, endTokenIndex);
        if (startLineAfterStartToken.indexOf(endToken) >= 0 || endLineBeforeEndToken.indexOf(endToken) >= 0) {
          startTokenIndex = -1;
          endTokenIndex = -1;
        }
      }
    }
    let ops;
    if (startTokenIndex !== -1 && endTokenIndex !== -1) {
      if (insertSpace && startTokenIndex + startToken.length < startLineText.length && startLineText.charCodeAt(startTokenIndex + startToken.length) === CharCode.Space) {
        startToken = startToken + " ";
      }
      if (insertSpace && endTokenIndex > 0 && endLineText.charCodeAt(endTokenIndex - 1) === CharCode.Space) {
        endToken = " " + endToken;
        endTokenIndex -= 1;
      }
      ops = BlockCommentCommand._createRemoveBlockCommentOperations(
        new Range(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1),
        startToken,
        endToken
      );
    } else {
      ops = BlockCommentCommand._createAddBlockCommentOperations(selection, startToken, endToken, this._insertSpace);
      this._usedEndToken = ops.length === 1 ? endToken : null;
    }
    for (const op of ops) {
      builder.addTrackedEditOperation(op.range, op.text);
    }
  }
  static _createRemoveBlockCommentOperations(r, startToken, endToken) {
    const res = [];
    if (!Range.isEmpty(r)) {
      res.push(EditOperation.delete(new Range(
        r.startLineNumber,
        r.startColumn - startToken.length,
        r.startLineNumber,
        r.startColumn
      )));
      res.push(EditOperation.delete(new Range(
        r.endLineNumber,
        r.endColumn,
        r.endLineNumber,
        r.endColumn + endToken.length
      )));
    } else {
      res.push(EditOperation.delete(new Range(
        r.startLineNumber,
        r.startColumn - startToken.length,
        r.endLineNumber,
        r.endColumn + endToken.length
      )));
    }
    return res;
  }
  static _createAddBlockCommentOperations(r, startToken, endToken, insertSpace) {
    const res = [];
    if (!Range.isEmpty(r)) {
      res.push(EditOperation.insert(new Position(r.startLineNumber, r.startColumn), startToken + (insertSpace ? " " : "")));
      res.push(EditOperation.insert(new Position(r.endLineNumber, r.endColumn), (insertSpace ? " " : "") + endToken));
    } else {
      res.push(EditOperation.replace(new Range(
        r.startLineNumber,
        r.startColumn,
        r.endLineNumber,
        r.endColumn
      ), startToken + "  " + endToken));
    }
    return res;
  }
  getEditOperations(model, builder) {
    const startLineNumber = this._selection.startLineNumber;
    const startColumn = this._selection.startColumn;
    model.tokenization.tokenizeIfCheap(startLineNumber);
    const languageId = model.getLanguageIdAtPosition(startLineNumber, startColumn);
    const config = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
    if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
      return;
    }
    this._createOperationsForBlockComment(this._selection, config.blockCommentStartToken, config.blockCommentEndToken, this._insertSpace, model, builder);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    if (inverseEditOperations.length === 2) {
      const startTokenEditOperation = inverseEditOperations[0];
      const endTokenEditOperation = inverseEditOperations[1];
      return new Selection(
        startTokenEditOperation.range.endLineNumber,
        startTokenEditOperation.range.endColumn,
        endTokenEditOperation.range.startLineNumber,
        endTokenEditOperation.range.startColumn
      );
    } else {
      const srcRange = inverseEditOperations[0].range;
      const deltaColumn = this._usedEndToken ? -this._usedEndToken.length - 1 : 0;
      return new Selection(
        srcRange.endLineNumber,
        srcRange.endColumn + deltaColumn,
        srcRange.endLineNumber,
        srcRange.endColumn + deltaColumn
      );
    }
  }
}
export {
  BlockCommentCommand
};
//# sourceMappingURL=blockCommentCommand.js.map
