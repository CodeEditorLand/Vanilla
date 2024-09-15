var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { TrimTrailingWhitespaceCommand, trimTrailingWhitespace } from "../../../common/commands/trimTrailingWhitespaceCommand.js";
import { ISingleEditOperation } from "../../../common/core/editOperation.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { MetadataConsts, StandardTokenType } from "../../../common/encodedTokenAttributes.js";
import { EncodedTokenizationResult, ITokenizationSupport, TokenizationRegistry } from "../../../common/languages.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { NullState } from "../../../common/languages/nullTokenize.js";
import { getEditOperation } from "../testCommand.js";
import { createModelServices, instantiateTextModel, withEditorModel } from "../../common/testTextModel.js";
function createInsertDeleteSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
  return {
    range: new Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
    text
  };
}
__name(createInsertDeleteSingleEditOp, "createInsertDeleteSingleEditOp");
function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
  return {
    range: new Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
    text,
    forceMoveMarkers: false
  };
}
__name(createSingleEditOp, "createSingleEditOp");
function assertTrimTrailingWhitespaceCommand(text, expected) {
  return withEditorModel(text, (model) => {
    const op = new TrimTrailingWhitespaceCommand(new Selection(1, 1, 1, 1), [], true);
    const actual = getEditOperation(model, op);
    assert.deepStrictEqual(actual, expected);
  });
}
__name(assertTrimTrailingWhitespaceCommand, "assertTrimTrailingWhitespaceCommand");
function assertTrimTrailingWhitespace(text, cursors, expected) {
  return withEditorModel(text, (model) => {
    const actual = trimTrailingWhitespace(model, cursors, true);
    assert.deepStrictEqual(actual, expected);
  });
}
__name(assertTrimTrailingWhitespace, "assertTrimTrailingWhitespace");
suite("Editor Commands - Trim Trailing Whitespace Command", () => {
  let disposables;
  setup(() => {
    disposables = new DisposableStore();
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("remove trailing whitespace", function() {
    assertTrimTrailingWhitespaceCommand([""], []);
    assertTrimTrailingWhitespaceCommand(["text"], []);
    assertTrimTrailingWhitespaceCommand(["text   "], [createSingleEditOp(null, 1, 5, 1, 8)]);
    assertTrimTrailingWhitespaceCommand(["text	   "], [createSingleEditOp(null, 1, 5, 1, 9)]);
    assertTrimTrailingWhitespaceCommand(["	   "], [createSingleEditOp(null, 1, 1, 1, 5)]);
    assertTrimTrailingWhitespaceCommand(["text	"], [createSingleEditOp(null, 1, 5, 1, 6)]);
    assertTrimTrailingWhitespaceCommand([
      "some text	",
      "some more text",
      "	  ",
      "even more text  ",
      "and some mixed	   	"
    ], [
      createSingleEditOp(null, 1, 10, 1, 11),
      createSingleEditOp(null, 3, 1, 3, 4),
      createSingleEditOp(null, 4, 15, 4, 17),
      createSingleEditOp(null, 5, 15, 5, 20)
    ]);
    assertTrimTrailingWhitespace(["text   "], [new Position(1, 1), new Position(1, 2), new Position(1, 3)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
    assertTrimTrailingWhitespace(["text   "], [new Position(1, 1), new Position(1, 5)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
    assertTrimTrailingWhitespace(["text   "], [new Position(1, 1), new Position(1, 5), new Position(1, 6)], [createInsertDeleteSingleEditOp(null, 1, 6, 1, 8)]);
    assertTrimTrailingWhitespace([
      "some text	",
      "some more text",
      "	  ",
      "even more text  ",
      "and some mixed	   	"
    ], [], [
      createInsertDeleteSingleEditOp(null, 1, 10, 1, 11),
      createInsertDeleteSingleEditOp(null, 3, 1, 3, 4),
      createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
      createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
    ]);
    assertTrimTrailingWhitespace([
      "some text	",
      "some more text",
      "	  ",
      "even more text  ",
      "and some mixed	   	"
    ], [new Position(1, 11), new Position(3, 2), new Position(5, 1), new Position(4, 1), new Position(5, 10)], [
      createInsertDeleteSingleEditOp(null, 3, 2, 3, 4),
      createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
      createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
    ]);
  });
  test("skips strings and regex if configured", function() {
    const instantiationService = createModelServices(disposables);
    const languageService = instantiationService.get(ILanguageService);
    const languageId = "testLanguageId";
    const languageIdCodec = languageService.languageIdCodec;
    disposables.add(languageService.registerLanguage({ id: languageId }));
    const encodedLanguageId = languageIdCodec.encodeLanguageId(languageId);
    const otherMetadata = (encodedLanguageId << MetadataConsts.LANGUAGEID_OFFSET | StandardTokenType.Other << MetadataConsts.TOKEN_TYPE_OFFSET | MetadataConsts.BALANCED_BRACKETS_MASK) >>> 0;
    const stringMetadata = (encodedLanguageId << MetadataConsts.LANGUAGEID_OFFSET | StandardTokenType.String << MetadataConsts.TOKEN_TYPE_OFFSET | MetadataConsts.BALANCED_BRACKETS_MASK) >>> 0;
    const tokenizationSupport = {
      getInitialState: /* @__PURE__ */ __name(() => NullState, "getInitialState"),
      tokenize: void 0,
      tokenizeEncoded: /* @__PURE__ */ __name((line, hasEOL, state) => {
        switch (line) {
          case "const a = `  ": {
            const tokens = new Uint32Array([
              0,
              otherMetadata,
              10,
              stringMetadata
            ]);
            return new EncodedTokenizationResult(tokens, state);
          }
          case "  a string  ": {
            const tokens = new Uint32Array([
              0,
              stringMetadata
            ]);
            return new EncodedTokenizationResult(tokens, state);
          }
          case "`;  ": {
            const tokens = new Uint32Array([
              0,
              stringMetadata,
              1,
              otherMetadata
            ]);
            return new EncodedTokenizationResult(tokens, state);
          }
        }
        throw new Error(`Unexpected`);
      }, "tokenizeEncoded")
    };
    disposables.add(TokenizationRegistry.register(languageId, tokenizationSupport));
    const model = disposables.add(instantiateTextModel(
      instantiationService,
      [
        "const a = `  ",
        "  a string  ",
        "`;  "
      ].join("\n"),
      languageId
    ));
    model.tokenization.forceTokenization(1);
    model.tokenization.forceTokenization(2);
    model.tokenization.forceTokenization(3);
    const op = new TrimTrailingWhitespaceCommand(new Selection(1, 1, 1, 1), [], false);
    const actual = getEditOperation(model, op);
    assert.deepStrictEqual(actual, [createSingleEditOp(null, 3, 3, 3, 5)]);
  });
});
//# sourceMappingURL=trimTrailingWhitespaceCommand.test.js.map
