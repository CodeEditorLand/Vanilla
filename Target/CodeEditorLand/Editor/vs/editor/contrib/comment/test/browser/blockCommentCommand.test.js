import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Selection } from "../../../../common/core/selection.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { testCommand } from "../../../../test/browser/testCommand.js";
import { BlockCommentCommand } from "../../browser/blockCommentCommand.js";
function _testCommentCommand(lines, selection, commandFactory, expectedLines, expectedSelection) {
  const languageId = "commentMode";
  const prepare = (accessor, disposables) => {
    const languageConfigurationService = accessor.get(
      ILanguageConfigurationService
    );
    const languageService = accessor.get(ILanguageService);
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(
      languageConfigurationService.register(languageId, {
        comments: { lineComment: "!@#", blockComment: ["<0", "0>"] }
      })
    );
  };
  testCommand(
    lines,
    languageId,
    selection,
    commandFactory,
    expectedLines,
    expectedSelection,
    void 0,
    prepare
  );
}
function testBlockCommentCommand(lines, selection, expectedLines, expectedSelection) {
  _testCommentCommand(
    lines,
    selection,
    (accessor, sel) => new BlockCommentCommand(
      sel,
      true,
      accessor.get(ILanguageConfigurationService)
    ),
    expectedLines,
    expectedSelection
  );
}
suite("Editor Contrib - Block Comment Command", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("empty selection wraps itself", () => {
    testBlockCommentCommand(
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 3, 1, 3),
      [
        "fi<0  0>rst",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 6, 1, 6)
    );
  });
  test("invisible selection ignored", () => {
    testBlockCommentCommand(
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(2, 1, 1, 1),
      [
        "<0 first",
        " 0>	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 4, 2, 1)
    );
  });
  test("bug9511", () => {
    testBlockCommentCommand(
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 6, 1, 1),
      [
        "<0 first 0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 4, 1, 9)
    );
    testBlockCommentCommand(
      [
        "<0first0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 8, 1, 3),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 1, 6)
    );
  });
  test("one line selection", () => {
    testBlockCommentCommand(
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 6, 1, 3),
      [
        "fi<0 rst 0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 6, 1, 9)
    );
  });
  test("one line selection toggle", () => {
    testBlockCommentCommand(
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 6, 1, 3),
      [
        "fi<0 rst 0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 6, 1, 9)
    );
    testBlockCommentCommand(
      [
        "fi<0rst0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 8, 1, 5),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 3, 1, 6)
    );
    testBlockCommentCommand(
      [
        "<0 first 0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 10, 1, 1),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 1, 6)
    );
    testBlockCommentCommand(
      [
        "<0 first0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 9, 1, 1),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 1, 6)
    );
    testBlockCommentCommand(
      [
        "<0first 0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 9, 1, 1),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 1, 6)
    );
    testBlockCommentCommand(
      [
        "fi<0rst0>",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 8, 1, 5),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 3, 1, 6)
    );
  });
  test("multi line selection", () => {
    testBlockCommentCommand(
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(2, 4, 1, 1),
      [
        "<0 first",
        "	se 0>cond line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 4, 2, 4)
    );
  });
  test("multi line selection toggle", () => {
    testBlockCommentCommand(
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(2, 4, 1, 1),
      [
        "<0 first",
        "	se 0>cond line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 4, 2, 4)
    );
    testBlockCommentCommand(
      [
        "<0first",
        "	se0>cond line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 4, 1, 3),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 2, 4)
    );
    testBlockCommentCommand(
      [
        "<0 first",
        "	se0>cond line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 4, 1, 3),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 2, 4)
    );
    testBlockCommentCommand(
      [
        "<0first",
        "	se 0>cond line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 4, 1, 3),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 2, 4)
    );
    testBlockCommentCommand(
      [
        "<0 first",
        "	se 0>cond line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 4, 1, 3),
      ["first", "	second line", "third line", "fourth line", "fifth"],
      new Selection(1, 1, 2, 4)
    );
  });
  test("fuzzy removes", () => {
    testBlockCommentCommand(
      ["asd <0 qwe", "asd 0> qwe"],
      new Selection(2, 5, 1, 7),
      ["asd qwe", "asd qwe"],
      new Selection(1, 5, 2, 4)
    );
    testBlockCommentCommand(
      ["asd <0 qwe", "asd 0> qwe"],
      new Selection(2, 5, 1, 6),
      ["asd qwe", "asd qwe"],
      new Selection(1, 5, 2, 4)
    );
    testBlockCommentCommand(
      ["asd <0 qwe", "asd 0> qwe"],
      new Selection(2, 5, 1, 5),
      ["asd qwe", "asd qwe"],
      new Selection(1, 5, 2, 4)
    );
    testBlockCommentCommand(
      ["asd <0 qwe", "asd 0> qwe"],
      new Selection(2, 5, 1, 11),
      ["asd qwe", "asd qwe"],
      new Selection(1, 5, 2, 4)
    );
    testBlockCommentCommand(
      ["asd <0 qwe", "asd 0> qwe"],
      new Selection(2, 1, 1, 11),
      ["asd qwe", "asd qwe"],
      new Selection(1, 5, 2, 4)
    );
    testBlockCommentCommand(
      ["asd <0 qwe", "asd 0> qwe"],
      new Selection(2, 7, 1, 11),
      ["asd qwe", "asd qwe"],
      new Selection(1, 5, 2, 4)
    );
  });
  test("bug #30358", () => {
    testBlockCommentCommand(
      ["<0 start 0> middle end"],
      new Selection(1, 20, 1, 23),
      ["<0 start 0> middle <0 end 0>"],
      new Selection(1, 23, 1, 26)
    );
    testBlockCommentCommand(
      ["<0 start 0> middle <0 end 0>"],
      new Selection(1, 13, 1, 19),
      ["<0 start 0> <0 middle 0> <0 end 0>"],
      new Selection(1, 16, 1, 22)
    );
  });
  test("issue #34618", () => {
    testBlockCommentCommand(
      ["<0  0> middle end"],
      new Selection(1, 4, 1, 4),
      [" middle end"],
      new Selection(1, 1, 1, 1)
    );
  });
  test("insertSpace false", () => {
    function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
      _testCommentCommand(
        lines,
        selection,
        (accessor, sel) => new BlockCommentCommand(
          sel,
          false,
          accessor.get(ILanguageConfigurationService)
        ),
        expectedLines,
        expectedSelection
      );
    }
    testLineCommentCommand(
      ["some text"],
      new Selection(1, 1, 1, 5),
      ["<0some0> text"],
      new Selection(1, 3, 1, 7)
    );
  });
  test("insertSpace false does not remove space", () => {
    function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
      _testCommentCommand(
        lines,
        selection,
        (accessor, sel) => new BlockCommentCommand(
          sel,
          false,
          accessor.get(ILanguageConfigurationService)
        ),
        expectedLines,
        expectedSelection
      );
    }
    testLineCommentCommand(
      ["<0 some 0> text"],
      new Selection(1, 4, 1, 8),
      [" some  text"],
      new Selection(1, 1, 1, 7)
    );
  });
});
