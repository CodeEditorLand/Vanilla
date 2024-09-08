import assert from "assert";
import {
  compareFileExtensions,
  compareFileExtensionsDefault,
  compareFileExtensionsLower,
  compareFileExtensionsUnicode,
  compareFileExtensionsUpper,
  compareFileNames,
  compareFileNamesDefault,
  compareFileNamesLower,
  compareFileNamesUnicode,
  compareFileNamesUpper
} from "../../common/comparers.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
const compareLocale = (a, b) => a.localeCompare(b);
const compareLocaleNumeric = (a, b) => a.localeCompare(b, void 0, { numeric: true });
suite("Comparers", () => {
  test("compareFileNames", () => {
    assert(compareFileNames(null, null) === 0, "null should be equal");
    assert(
      compareFileNames(null, "abc") < 0,
      "null should be come before real values"
    );
    assert(compareFileNames("", "") === 0, "empty should be equal");
    assert(
      compareFileNames("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileNames("z", "A") > 0, "z comes after A");
    assert(compareFileNames("Z", "a") > 0, "Z comes after a");
    assert(
      compareFileNames("bbb.aaa", "aaa.bbb") > 0,
      "compares the whole name all at once by locale"
    );
    assert(
      compareFileNames("aggregate.go", "aggregate_repo.go") > 0,
      "compares the whole name all at once by locale"
    );
    assert(
      compareFileNames(".abc", ".abc") === 0,
      "equal dotfile names should be equal"
    );
    assert(
      compareFileNames(".env.", ".gitattributes") < 0,
      "filenames starting with dots and with extensions should still sort properly"
    );
    assert(
      compareFileNames(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileNames(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileNames(".aaa_env", ".aaa.env") < 0,
      "an underscore in a dotfile name will sort before a dot"
    );
    assert(
      compareFileNames(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileNames(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileNames(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileNames(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileNames(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileNames("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileNames("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileNames("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileNames("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileNames("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileNames("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileNames("a.ext1", "b.Ext1") < 0,
      "if names are different and extensions with numbers are equal except for case, filenames are sorted in name order"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(compareFileNames),
      ["A2.txt", "a10.txt", "a20.txt", "A100.txt"],
      "filenames with number and case differences compare numerically"
    );
    assert(
      compareFileNames("a", "A") !== compareLocale("a", "A"),
      "the same letter sorts in unicode order, not by locale"
    );
    assert(
      compareFileNames("\xE2", "\xC2") !== compareLocale("\xE2", "\xC2"),
      "the same accented letter sorts in unicode order, not by locale"
    );
    assert.notDeepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(compareFileNames),
      ["artichoke", "Artichoke", "art", "Art"].sort(compareLocale),
      "words with the same root and different cases do not sort in locale order"
    );
    assert.notDeepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareFileNames),
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareLocale),
      "the same base characters with different case or accents do not sort in locale order"
    );
    assert(
      compareFileNames("abc02.txt", "abc002.txt") > 0,
      "filenames with equivalent numbers and leading zeros sort in unicode order"
    );
    assert(
      compareFileNames("abc.txt1", "abc.txt01") > 0,
      "same name plus extensions with equal numbers sort in unicode order"
    );
    assert(
      compareFileNames("art01", "Art01") !== "art01".localeCompare("Art01", void 0, { numeric: true }),
      "a numerically equivalent word of a different case does not compare numerically based on locale"
    );
    assert(
      compareFileNames("a.ext1", "a.Ext1") > 0,
      "if names are equal and extensions with numbers are equal except for case, filenames are sorted in full filename unicode order"
    );
  });
  test("compareFileExtensions", () => {
    assert(compareFileExtensions(null, null) === 0, "null should be equal");
    assert(
      compareFileExtensions(null, "abc") < 0,
      "null should come before real files without extension"
    );
    assert(compareFileExtensions("", "") === 0, "empty should be equal");
    assert(
      compareFileExtensions("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileExtensions("z", "A") > 0, "z comes after A");
    assert(compareFileExtensions("Z", "a") > 0, "Z comes after a");
    assert(
      compareFileExtensions("file.ext", "file.ext") === 0,
      "equal full names should be equal"
    );
    assert(
      compareFileExtensions("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileExtensions("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileExtensions("bbb.aaa", "aaa.bbb") < 0,
      "files should be compared by extensions even if filenames compare differently"
    );
    assert(
      compareFileExtensions(".abc", ".abc") === 0,
      "equal dotfiles should be equal"
    );
    assert(
      compareFileExtensions(".md", ".Gitattributes") > 0,
      "dotfiles sort alphabetically regardless of case"
    );
    assert(
      compareFileExtensions(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileExtensions(".env", "aaa.env") < 0,
      "if equal extensions, filenames should be compared, empty filename should come before others"
    );
    assert(
      compareFileExtensions(".MD", "a.md") < 0,
      "if extensions differ in case, files sort by extension in unicode order"
    );
    assert(
      compareFileExtensions("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileExtensions("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileExtensions("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensions("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileExtensions("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileExtensions("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileExtensions("abc2.txt2", "abc1.txt10") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensions("txt.abc1", "txt.abc1") === 0,
      "equal extensions with numbers should be equal"
    );
    assert(
      compareFileExtensions("txt.abc1", "txt.abc2") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensions("txt.abc2", "txt.abc10") < 0,
      "extensions with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileExtensions("a.ext1", "b.ext1") < 0,
      "if equal extensions with numbers, names should be compared"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileExtensions
      ),
      ["A2.txt", "a10.txt", "a20.txt", "A100.txt"],
      "filenames with number and case differences compare numerically"
    );
    assert(
      compareFileExtensions("a", "A") !== compareLocale("a", "A"),
      "the same letter of different case does not sort by locale"
    );
    assert(
      compareFileExtensions("\xE2", "\xC2") !== compareLocale("\xE2", "\xC2"),
      "the same accented letter of different case does not sort by locale"
    );
    assert.notDeepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(
        compareFileExtensions
      ),
      ["artichoke", "Artichoke", "art", "Art"].sort(compareLocale),
      "words with the same root and different cases do not sort in locale order"
    );
    assert.notDeepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareFileExtensions),
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(
        (a, b) => a.localeCompare(b)
      ),
      "the same base characters with different case or accents do not sort in locale order"
    );
    assert(
      compareFileExtensions("a.MD", "a.md") < 0,
      "case differences in extensions sort in unicode order"
    );
    assert(
      compareFileExtensions("a.md", "A.md") > 0,
      "case differences in names sort in unicode order"
    );
    assert(
      compareFileExtensions("a.md", "b.MD") > 0,
      "when extensions are the same except for case, the files sort by extension"
    );
    assert(
      compareFileExtensions("aggregate.go", "aggregate_repo.go") < 0,
      "when extensions are equal, names sort in dictionary order"
    );
    assert(
      compareFileExtensions(".env", ".aaa.env") < 0,
      "a dotfile with an extension is treated as a name plus an extension - equal extensions"
    );
    assert(
      compareFileExtensions(".env", ".env.aaa") > 0,
      "a dotfile with an extension is treated as a name plus an extension - unequal extensions"
    );
    assert(
      compareFileExtensions(".env", "aaa") > 0,
      "filenames without extensions come before dotfiles"
    );
    assert(
      compareFileExtensions(".md", "A.MD") > 0,
      "a file with an uppercase extension sorts before a dotfile of the same lowercase extension"
    );
    assert(
      compareFileExtensions("abc.txt01", "abc.txt1") < 0,
      "extensions with equal numbers sort in unicode order"
    );
    assert(
      compareFileExtensions("art01", "Art01") !== compareLocaleNumeric("art01", "Art01"),
      "a numerically equivalent word of a different case does not compare by locale"
    );
    assert(
      compareFileExtensions("abc02.txt", "abc002.txt") > 0,
      "filenames with equivalent numbers and leading zeros sort in unicode order"
    );
    assert(
      compareFileExtensions("txt.abc01", "txt.abc1") < 0,
      "extensions with equivalent numbers sort in unicode order"
    );
    assert(
      compareFileExtensions("a.ext1", "b.Ext1") > 0,
      "if names are different and extensions with numbers are equal except for case, filenames are sorted in extension unicode order"
    );
    assert(
      compareFileExtensions("a.ext1", "a.Ext1") > 0,
      "if names are equal and extensions with numbers are equal except for case, filenames are sorted in extension unicode order"
    );
  });
  test("compareFileNamesDefault", () => {
    assert(
      compareFileNamesDefault(null, null) === 0,
      "null should be equal"
    );
    assert(
      compareFileNamesDefault(null, "abc") < 0,
      "null should be come before real values"
    );
    assert(compareFileNamesDefault("", "") === 0, "empty should be equal");
    assert(
      compareFileNamesDefault("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileNamesDefault("z", "A") > 0, "z comes after A");
    assert(compareFileNamesDefault("Z", "a") > 0, "Z comes after a");
    assert(
      compareFileNamesDefault("file.ext", "file.ext") === 0,
      "equal full names should be equal"
    );
    assert(
      compareFileNamesDefault("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileNamesDefault("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileNamesDefault("bbb.aaa", "aaa.bbb") > 0,
      "files should be compared by names even if extensions compare differently"
    );
    assert(
      compareFileNamesDefault("aggregate.go", "aggregate_repo.go") > 0,
      "compares the whole filename in locale order"
    );
    assert(
      compareFileNamesDefault(".abc", ".abc") === 0,
      "equal dotfile names should be equal"
    );
    assert(
      compareFileNamesDefault(".env.", ".gitattributes") < 0,
      "filenames starting with dots and with extensions should still sort properly"
    );
    assert(
      compareFileNamesDefault(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileNamesDefault(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileNamesDefault(".aaa_env", ".aaa.env") < 0,
      "an underscore in a dotfile name will sort before a dot"
    );
    assert(
      compareFileNamesDefault(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileNamesDefault(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileNamesDefault(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileNamesDefault(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileNamesDefault(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileNamesDefault("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileNamesDefault("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileNamesDefault("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileNamesDefault("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileNamesDefault("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileNamesDefault("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileNamesDefault("a.ext1", "b.Ext1") < 0,
      "if names are different and extensions with numbers are equal except for case, filenames are compared by full filename"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileNamesDefault
      ),
      ["A2.txt", "a10.txt", "a20.txt", "A100.txt"],
      "filenames with number and case differences compare numerically"
    );
    assert(
      compareFileNamesDefault("a", "A") === compareLocale("a", "A"),
      "the same letter sorts by locale"
    );
    assert(
      compareFileNamesDefault("\xE2", "\xC2") === compareLocale("\xE2", "\xC2"),
      "the same accented letter sorts by locale"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareFileNamesDefault),
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareLocale),
      "the same base characters with different case or accents sort in locale order"
    );
    assert(
      compareFileNamesDefault("abc02.txt", "abc002.txt") < 0,
      "filenames with equivalent numbers and leading zeros sort shortest number first"
    );
    assert(
      compareFileNamesDefault("abc.txt1", "abc.txt01") < 0,
      "same name plus extensions with equal numbers sort shortest number first"
    );
    assert(
      compareFileNamesDefault("art01", "Art01") === compareLocaleNumeric("art01", "Art01"),
      "a numerically equivalent word of a different case compares numerically based on locale"
    );
    assert(
      compareFileNamesDefault("a.ext1", "a.Ext1") === compareLocale("ext1", "Ext1"),
      "if names are equal and extensions with numbers are equal except for case, filenames are sorted in extension locale order"
    );
  });
  test("compareFileExtensionsDefault", () => {
    assert(
      compareFileExtensionsDefault(null, null) === 0,
      "null should be equal"
    );
    assert(
      compareFileExtensionsDefault(null, "abc") < 0,
      "null should come before real files without extensions"
    );
    assert(
      compareFileExtensionsDefault("", "") === 0,
      "empty should be equal"
    );
    assert(
      compareFileExtensionsDefault("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileExtensionsDefault("z", "A") > 0, "z comes after A");
    assert(compareFileExtensionsDefault("Z", "a") > 0, "Z comes after a");
    assert(
      compareFileExtensionsDefault("file.ext", "file.ext") === 0,
      "equal full filenames should be equal"
    );
    assert(
      compareFileExtensionsDefault("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileExtensionsDefault("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileExtensionsDefault("bbb.aaa", "aaa.bbb") < 0,
      "files should be compared by extension first"
    );
    assert(
      compareFileExtensionsDefault(".abc", ".abc") === 0,
      "equal dotfiles should be equal"
    );
    assert(
      compareFileExtensionsDefault(".md", ".Gitattributes") > 0,
      "dotfiles sort alphabetically regardless of case"
    );
    assert(
      compareFileExtensionsDefault(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileExtensionsDefault(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileExtensionsDefault(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileExtensionsDefault("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileExtensionsDefault("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileExtensionsDefault("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsDefault("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order"
    );
    assert(
      compareFileExtensionsDefault("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileExtensionsDefault("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileExtensionsDefault("abc2.txt2", "abc1.txt10") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsDefault("txt.abc1", "txt.abc1") === 0,
      "equal extensions with numbers should be equal"
    );
    assert(
      compareFileExtensionsDefault("txt.abc1", "txt.abc2") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsDefault("txt.abc2", "txt.abc10") < 0,
      "extensions with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileExtensionsDefault("a.ext1", "b.ext1") < 0,
      "if equal extensions with numbers, full filenames should be compared"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileExtensionsDefault
      ),
      ["A2.txt", "a10.txt", "a20.txt", "A100.txt"],
      "filenames with number and case differences compare numerically"
    );
    assert(
      compareFileExtensionsDefault("a", "A") === compareLocale("a", "A"),
      "the same letter of different case sorts by locale"
    );
    assert(
      compareFileExtensionsDefault("\xE2", "\xC2") === compareLocale("\xE2", "\xC2"),
      "the same accented letter of different case sorts by locale"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(
        compareFileExtensionsDefault
      ),
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(
        (a, b) => a.localeCompare(b)
      ),
      "the same base characters with different case or accents sort in locale order"
    );
    assert(
      compareFileExtensionsDefault("a.MD", "a.md") === compareLocale("MD", "md"),
      "case differences in extensions sort by locale"
    );
    assert(
      compareFileExtensionsDefault("a.md", "A.md") === compareLocale("a", "A"),
      "case differences in names sort by locale"
    );
    assert(
      compareFileExtensionsDefault("a.md", "b.MD") < 0,
      "when extensions are the same except for case, the files sort by name"
    );
    assert(
      compareFileExtensionsDefault("aggregate.go", "aggregate_repo.go") > 0,
      "names with the same extension sort in full filename locale order"
    );
    assert(
      compareFileExtensionsDefault(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileExtensionsDefault(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileExtensionsDefault(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileExtensionsDefault(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileExtensionsDefault("abc.txt01", "abc.txt1") > 0,
      "extensions with equal numbers should be in shortest-first order"
    );
    assert(
      compareFileExtensionsDefault("art01", "Art01") === compareLocaleNumeric("art01", "Art01"),
      "a numerically equivalent word of a different case compares numerically based on locale"
    );
    assert(
      compareFileExtensionsDefault("abc02.txt", "abc002.txt") < 0,
      "filenames with equivalent numbers and leading zeros sort shortest string first"
    );
    assert(
      compareFileExtensionsDefault("txt.abc01", "txt.abc1") > 0,
      "extensions with equivalent numbers sort shortest extension first"
    );
    assert(
      compareFileExtensionsDefault("a.ext1", "b.Ext1") < 0,
      "if extensions with numbers are equal except for case, full filenames should be compared"
    );
    assert(
      compareFileExtensionsDefault("a.ext1", "a.Ext1") === compareLocale("a.ext1", "a.Ext1"),
      "if extensions with numbers are equal except for case, full filenames are compared in locale order"
    );
  });
  test("compareFileNamesUpper", () => {
    assert(compareFileNamesUpper(null, null) === 0, "null should be equal");
    assert(
      compareFileNamesUpper(null, "abc") < 0,
      "null should be come before real values"
    );
    assert(compareFileNamesUpper("", "") === 0, "empty should be equal");
    assert(
      compareFileNamesUpper("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileNamesUpper("z", "A") > 0, "z comes after A");
    assert(
      compareFileNamesUpper("file.ext", "file.ext") === 0,
      "equal full names should be equal"
    );
    assert(
      compareFileNamesUpper("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileNamesUpper("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileNamesUpper("bbb.aaa", "aaa.bbb") > 0,
      "files should be compared by names even if extensions compare differently"
    );
    assert(
      compareFileNamesUpper("aggregate.go", "aggregate_repo.go") > 0,
      "compares the full filename in locale order"
    );
    assert(
      compareFileNamesUpper(".abc", ".abc") === 0,
      "equal dotfile names should be equal"
    );
    assert(
      compareFileNamesUpper(".env.", ".gitattributes") < 0,
      "filenames starting with dots and with extensions should still sort properly"
    );
    assert(
      compareFileNamesUpper(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileNamesUpper(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileNamesUpper(".aaa_env", ".aaa.env") < 0,
      "an underscore in a dotfile name will sort before a dot"
    );
    assert(
      compareFileNamesUpper(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileNamesUpper(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileNamesUpper(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileNamesUpper(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileNamesUpper(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileNamesUpper("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileNamesUpper("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileNamesUpper("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileNamesUpper("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileNamesUpper("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileNamesUpper("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileNamesUpper("abc02.txt", "abc002.txt") < 0,
      "filenames with equivalent numbers and leading zeros sort shortest number first"
    );
    assert(
      compareFileNamesUpper("abc.txt1", "abc.txt01") < 0,
      "same name plus extensions with equal numbers sort shortest number first"
    );
    assert(
      compareFileNamesUpper("a.ext1", "b.Ext1") < 0,
      "different names with the equal extensions except for case are sorted by full filename"
    );
    assert(
      compareFileNamesUpper("a.ext1", "a.Ext1") === compareLocale("a.ext1", "a.Ext1"),
      "same names with equal and extensions except for case are sorted in full filename locale order"
    );
    assert(compareFileNamesUpper("Z", "a") < 0, "Z comes before a");
    assert(
      compareFileNamesUpper("a", "A") > 0,
      "the same letter sorts uppercase first"
    );
    assert(
      compareFileNamesUpper("\xE2", "\xC2") > 0,
      "the same accented letter sorts uppercase first"
    );
    assert.deepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(
        compareFileNamesUpper
      ),
      ["Art", "Artichoke", "art", "artichoke"],
      "names with the same root and different cases sort uppercase first"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareFileNamesUpper),
      ["Email", "\xC9mail", "email", "\xE9mail"],
      "the same base characters with different case or accents sort uppercase first"
    );
    assert(
      compareFileNamesUpper("art01", "Art01") > 0,
      "a numerically equivalent name of a different case compares uppercase first"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileNamesUpper
      ),
      ["A2.txt", "A100.txt", "a10.txt", "a20.txt"],
      "filenames with number and case differences group by case then compare by number"
    );
  });
  test("compareFileExtensionsUpper", () => {
    assert(
      compareFileExtensionsUpper(null, null) === 0,
      "null should be equal"
    );
    assert(
      compareFileExtensionsUpper(null, "abc") < 0,
      "null should come before real files without extensions"
    );
    assert(
      compareFileExtensionsUpper("", "") === 0,
      "empty should be equal"
    );
    assert(
      compareFileExtensionsUpper("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileExtensionsUpper("z", "A") > 0, "z comes after A");
    assert(
      compareFileExtensionsUpper("file.ext", "file.ext") === 0,
      "equal full filenames should be equal"
    );
    assert(
      compareFileExtensionsUpper("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileExtensionsUpper("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileExtensionsUpper("bbb.aaa", "aaa.bbb") < 0,
      "files should be compared by extension first"
    );
    assert(
      compareFileExtensionsUpper("a.md", "b.MD") < 0,
      "when extensions are the same except for case, the files sort by name"
    );
    assert(
      compareFileExtensionsUpper("a.MD", "a.md") === compareLocale("MD", "md"),
      "case differences in extensions sort by locale"
    );
    assert(
      compareFileExtensionsUpper("aggregate.go", "aggregate_repo.go") > 0,
      "when extensions are equal, compares the full filename"
    );
    assert(
      compareFileExtensionsUpper(".abc", ".abc") === 0,
      "equal dotfiles should be equal"
    );
    assert(
      compareFileExtensionsUpper(".md", ".Gitattributes") > 0,
      "dotfiles sort alphabetically regardless of case"
    );
    assert(
      compareFileExtensionsUpper(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileExtensionsUpper(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileExtensionsUpper(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileExtensionsUpper(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileExtensionsUpper(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileExtensionsUpper(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileExtensionsUpper(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileExtensionsUpper("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileExtensionsUpper("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileExtensionsUpper("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsUpper("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order"
    );
    assert(
      compareFileExtensionsUpper("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileExtensionsUpper("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileExtensionsUpper("abc2.txt2", "abc1.txt10") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsUpper("txt.abc1", "txt.abc1") === 0,
      "equal extensions with numbers should be equal"
    );
    assert(
      compareFileExtensionsUpper("txt.abc1", "txt.abc2") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsUpper("txt.abc2", "txt.abc10") < 0,
      "extensions with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileExtensionsUpper("a.ext1", "b.ext1") < 0,
      "if equal extensions with numbers, full filenames should be compared"
    );
    assert(
      compareFileExtensionsUpper("abc.txt01", "abc.txt1") > 0,
      "extensions with equal numbers should be in shortest-first order"
    );
    assert(
      compareFileExtensionsUpper("abc02.txt", "abc002.txt") < 0,
      "filenames with equivalent numbers and leading zeros sort shortest string first"
    );
    assert(
      compareFileExtensionsUpper("txt.abc01", "txt.abc1") > 0,
      "extensions with equivalent numbers sort shortest extension first"
    );
    assert(
      compareFileExtensionsUpper("a.ext1", "b.Ext1") < 0,
      "different names and extensions that are equal except for case are sorted in full filename order"
    );
    assert(
      compareFileExtensionsUpper("a.ext1", "a.Ext1") === compareLocale("a.ext1", "b.Ext1"),
      "same names and extensions that are equal except for case are sorted in full filename locale order"
    );
    assert(compareFileExtensionsUpper("Z", "a") < 0, "Z comes before a");
    assert(
      compareFileExtensionsUpper("a", "A") > 0,
      "the same letter sorts uppercase first"
    );
    assert(
      compareFileExtensionsUpper("\xE2", "\xC2") > 0,
      "the same accented letter sorts uppercase first"
    );
    assert.deepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(
        compareFileExtensionsUpper
      ),
      ["Art", "Artichoke", "art", "artichoke"],
      "names with the same root and different cases sort uppercase names first"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(
        compareFileExtensionsUpper
      ),
      ["Email", "\xC9mail", "email", "\xE9mail"],
      "the same base characters with different case or accents sort uppercase names first"
    );
    assert(
      compareFileExtensionsUpper("a.md", "A.md") > 0,
      "case differences in names sort uppercase first"
    );
    assert(
      compareFileExtensionsUpper("art01", "Art01") > 0,
      "a numerically equivalent word of a different case sorts uppercase first"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileExtensionsUpper
      ),
      ["A2.txt", "A100.txt", "a10.txt", "a20.txt"],
      "filenames with number and case differences group by case then sort by number"
    );
  });
  test("compareFileNamesLower", () => {
    assert(compareFileNamesLower(null, null) === 0, "null should be equal");
    assert(
      compareFileNamesLower(null, "abc") < 0,
      "null should be come before real values"
    );
    assert(compareFileNamesLower("", "") === 0, "empty should be equal");
    assert(
      compareFileNamesLower("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileNamesLower("Z", "a") > 0, "Z comes after a");
    assert(
      compareFileNamesLower("file.ext", "file.ext") === 0,
      "equal full names should be equal"
    );
    assert(
      compareFileNamesLower("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileNamesLower("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileNamesLower("bbb.aaa", "aaa.bbb") > 0,
      "files should be compared by names even if extensions compare differently"
    );
    assert(
      compareFileNamesLower("aggregate.go", "aggregate_repo.go") > 0,
      "compares full filenames"
    );
    assert(
      compareFileNamesLower(".abc", ".abc") === 0,
      "equal dotfile names should be equal"
    );
    assert(
      compareFileNamesLower(".env.", ".gitattributes") < 0,
      "filenames starting with dots and with extensions should still sort properly"
    );
    assert(
      compareFileNamesLower(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileNamesLower(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileNamesLower(".aaa_env", ".aaa.env") < 0,
      "an underscore in a dotfile name will sort before a dot"
    );
    assert(
      compareFileNamesLower(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileNamesLower(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileNamesLower(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileNamesLower(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileNamesLower(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileNamesLower("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileNamesLower("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileNamesLower("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileNamesLower("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileNamesLower("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileNamesLower("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileNamesLower("abc02.txt", "abc002.txt") < 0,
      "filenames with equivalent numbers and leading zeros sort shortest number first"
    );
    assert(
      compareFileNamesLower("abc.txt1", "abc.txt01") < 0,
      "same name plus extensions with equal numbers sort shortest number first"
    );
    assert(
      compareFileNamesLower("a.ext1", "b.Ext1") < 0,
      "different names and extensions that are equal except for case are sorted in full filename order"
    );
    assert(
      compareFileNamesLower("a.ext1", "a.Ext1") === compareLocale("a.ext1", "b.Ext1"),
      "same names and extensions that are equal except for case are sorted in full filename locale order"
    );
    assert(compareFileNamesLower("z", "A") < 0, "z comes before A");
    assert(
      compareFileNamesLower("a", "A") < 0,
      "the same letter sorts lowercase first"
    );
    assert(
      compareFileNamesLower("\xE2", "\xC2") < 0,
      "the same accented letter sorts lowercase first"
    );
    assert.deepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(
        compareFileNamesLower
      ),
      ["art", "artichoke", "Art", "Artichoke"],
      "names with the same root and different cases sort lowercase first"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareFileNamesLower),
      ["email", "\xE9mail", "Email", "\xC9mail"],
      "the same base characters with different case or accents sort lowercase first"
    );
    assert(
      compareFileNamesLower("art01", "Art01") < 0,
      "a numerically equivalent name of a different case compares lowercase first"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileNamesLower
      ),
      ["a10.txt", "a20.txt", "A2.txt", "A100.txt"],
      "filenames with number and case differences group by case then compare by number"
    );
  });
  test("compareFileExtensionsLower", () => {
    assert(
      compareFileExtensionsLower(null, null) === 0,
      "null should be equal"
    );
    assert(
      compareFileExtensionsLower(null, "abc") < 0,
      "null should come before real files without extensions"
    );
    assert(
      compareFileExtensionsLower("", "") === 0,
      "empty should be equal"
    );
    assert(
      compareFileExtensionsLower("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileExtensionsLower("Z", "a") > 0, "Z comes after a");
    assert(
      compareFileExtensionsLower("file.ext", "file.ext") === 0,
      "equal full filenames should be equal"
    );
    assert(
      compareFileExtensionsLower("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileExtensionsLower("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileExtensionsLower("bbb.aaa", "aaa.bbb") < 0,
      "files should be compared by extension first"
    );
    assert(
      compareFileExtensionsLower("a.md", "b.MD") < 0,
      "when extensions are the same except for case, the files sort by name"
    );
    assert(
      compareFileExtensionsLower("a.MD", "a.md") === compareLocale("MD", "md"),
      "case differences in extensions sort by locale"
    );
    assert(
      compareFileExtensionsLower(".abc", ".abc") === 0,
      "equal dotfiles should be equal"
    );
    assert(
      compareFileExtensionsLower(".md", ".Gitattributes") > 0,
      "dotfiles sort alphabetically regardless of case"
    );
    assert(
      compareFileExtensionsLower(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileExtensionsLower(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileExtensionsLower(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileExtensionsLower(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileExtensionsLower(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileExtensionsLower(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileExtensionsLower(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileExtensionsLower("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileExtensionsLower("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileExtensionsLower("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsLower("abc2.txt", "abc10.txt") < 0,
      "filenames with numbers should be in numerical order"
    );
    assert(
      compareFileExtensionsLower("abc02.txt", "abc010.txt") < 0,
      "filenames with numbers that have leading zeros sort numerically"
    );
    assert(
      compareFileExtensionsLower("abc1.10.txt", "abc1.2.txt") > 0,
      "numbers with dots between them are treated as two separate numbers, not one decimal number"
    );
    assert(
      compareFileExtensionsLower("abc2.txt2", "abc1.txt10") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsLower("txt.abc1", "txt.abc1") === 0,
      "equal extensions with numbers should be equal"
    );
    assert(
      compareFileExtensionsLower("txt.abc1", "txt.abc2") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsLower("txt.abc2", "txt.abc10") < 0,
      "extensions with numbers should be in numerical order even when they are multiple digits long"
    );
    assert(
      compareFileExtensionsLower("a.ext1", "b.ext1") < 0,
      "if equal extensions with numbers, full filenames should be compared"
    );
    assert(
      compareFileExtensionsLower("abc.txt01", "abc.txt1") > 0,
      "extensions with equal numbers should be in shortest-first order"
    );
    assert(
      compareFileExtensionsLower("abc02.txt", "abc002.txt") < 0,
      "filenames with equivalent numbers and leading zeros sort shortest string first"
    );
    assert(
      compareFileExtensionsLower("txt.abc01", "txt.abc1") > 0,
      "extensions with equivalent numbers sort shortest extension first"
    );
    assert(
      compareFileExtensionsLower("a.ext1", "b.Ext1") < 0,
      "if extensions with numbers are equal except for case, full filenames should be compared"
    );
    assert(
      compareFileExtensionsLower("a.ext1", "a.Ext1") === compareLocale("a.ext1", "a.Ext1"),
      "if extensions with numbers are equal except for case, filenames are sorted in locale order"
    );
    assert(compareFileExtensionsLower("z", "A") < 0, "z comes before A");
    assert(
      compareFileExtensionsLower("a", "A") < 0,
      "the same letter sorts lowercase first"
    );
    assert(
      compareFileExtensionsLower("\xE2", "\xC2") < 0,
      "the same accented letter sorts lowercase first"
    );
    assert.deepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(
        compareFileExtensionsLower
      ),
      ["art", "artichoke", "Art", "Artichoke"],
      "names with the same root and different cases sort lowercase names first"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(
        compareFileExtensionsLower
      ),
      ["email", "\xE9mail", "Email", "\xC9mail"],
      "the same base characters with different case or accents sort lowercase names first"
    );
    assert(
      compareFileExtensionsLower("a.md", "A.md") < 0,
      "case differences in names sort lowercase first"
    );
    assert(
      compareFileExtensionsLower("art01", "Art01") < 0,
      "a numerically equivalent word of a different case sorts lowercase first"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileExtensionsLower
      ),
      ["a10.txt", "a20.txt", "A2.txt", "A100.txt"],
      "filenames with number and case differences group by case then sort by number"
    );
    assert(
      compareFileExtensionsLower("aggregate.go", "aggregate_repo.go") > 0,
      "when extensions are equal, compares full filenames"
    );
  });
  test("compareFileNamesUnicode", () => {
    assert(
      compareFileNamesUnicode(null, null) === 0,
      "null should be equal"
    );
    assert(
      compareFileNamesUnicode(null, "abc") < 0,
      "null should be come before real values"
    );
    assert(compareFileNamesUnicode("", "") === 0, "empty should be equal");
    assert(
      compareFileNamesUnicode("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileNamesUnicode("z", "A") > 0, "z comes after A");
    assert(
      compareFileNamesUnicode("file.ext", "file.ext") === 0,
      "equal full names should be equal"
    );
    assert(
      compareFileNamesUnicode("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileNamesUnicode("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileNamesUnicode("bbb.aaa", "aaa.bbb") > 0,
      "files should be compared by names even if extensions compare differently"
    );
    assert(
      compareFileNamesUnicode(".abc", ".abc") === 0,
      "equal dotfile names should be equal"
    );
    assert(
      compareFileNamesUnicode(".env.", ".gitattributes") < 0,
      "filenames starting with dots and with extensions should still sort properly"
    );
    assert(
      compareFileNamesUnicode(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileNamesUnicode(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileNamesUnicode(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileNamesUnicode(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileNamesUnicode(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileNamesUnicode(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileNamesUnicode(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileNamesUnicode("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileNamesUnicode("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileNamesUnicode("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileNamesUnicode("a.ext1", "b.Ext1") < 0,
      "if names are different and extensions with numbers are equal except for case, filenames are sorted by unicode full filename"
    );
    assert(
      compareFileNamesUnicode("a.ext1", "a.Ext1") > 0,
      "if names are equal and extensions with numbers are equal except for case, filenames are sorted by unicode full filename"
    );
    assert(compareFileNamesUnicode("Z", "a") < 0, "Z comes before a");
    assert(
      compareFileNamesUnicode("a", "A") > 0,
      "the same letter sorts uppercase first"
    );
    assert(
      compareFileNamesUnicode("\xE2", "\xC2") > 0,
      "the same accented letter sorts uppercase first"
    );
    assert.deepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(
        compareFileNamesUnicode
      ),
      ["Art", "Artichoke", "art", "artichoke"],
      "names with the same root and different cases sort uppercase first"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(compareFileNamesUnicode),
      ["Email", "email", "\xC9mail", "\xE9mail"],
      "the same base characters with different case or accents sort in unicode order"
    );
    assert(
      compareFileNamesUnicode("aggregate.go", "aggregate_repo.go") < 0,
      "compares the whole name in unicode order, but dot comes before underscore"
    );
    assert(
      compareFileNamesUnicode(".aaa_env", ".aaa.env") > 0,
      "an underscore in a dotfile name will sort after a dot"
    );
    assert(
      compareFileNamesUnicode("abc2.txt", "abc10.txt") > 0,
      "filenames with numbers should be in unicode order even when they are multiple digits long"
    );
    assert(
      compareFileNamesUnicode("abc02.txt", "abc010.txt") > 0,
      "filenames with numbers that have leading zeros sort in unicode order"
    );
    assert(
      compareFileNamesUnicode("abc1.10.txt", "abc1.2.txt") < 0,
      "numbers with dots between them are sorted in unicode order"
    );
    assert(
      compareFileNamesUnicode("abc02.txt", "abc002.txt") > 0,
      "filenames with equivalent numbers and leading zeros sort in unicode order"
    );
    assert(
      compareFileNamesUnicode("abc.txt1", "abc.txt01") > 0,
      "same name plus extensions with equal numbers sort in unicode order"
    );
    assert(
      compareFileNamesUnicode("art01", "Art01") > 0,
      "a numerically equivalent name of a different case compares uppercase first"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileNamesUnicode
      ),
      ["A100.txt", "A2.txt", "a10.txt", "a20.txt"],
      "filenames with number and case differences sort in unicode order"
    );
  });
  test("compareFileExtensionsUnicode", () => {
    assert(
      compareFileExtensionsUnicode(null, null) === 0,
      "null should be equal"
    );
    assert(
      compareFileExtensionsUnicode(null, "abc") < 0,
      "null should come before real files without extensions"
    );
    assert(
      compareFileExtensionsUnicode("", "") === 0,
      "empty should be equal"
    );
    assert(
      compareFileExtensionsUnicode("abc", "abc") === 0,
      "equal names should be equal"
    );
    assert(compareFileExtensionsUnicode("z", "A") > 0, "z comes after A");
    assert(
      compareFileExtensionsUnicode("file.ext", "file.ext") === 0,
      "equal full filenames should be equal"
    );
    assert(
      compareFileExtensionsUnicode("a.ext", "b.ext") < 0,
      "if equal extensions, filenames should be compared"
    );
    assert(
      compareFileExtensionsUnicode("file.aaa", "file.bbb") < 0,
      "files with equal names should be compared by extensions"
    );
    assert(
      compareFileExtensionsUnicode("bbb.aaa", "aaa.bbb") < 0,
      "files should be compared by extension first"
    );
    assert(
      compareFileExtensionsUnicode("a.md", "b.MD") < 0,
      "when extensions are the same except for case, the files sort by name"
    );
    assert(
      compareFileExtensionsUnicode("a.MD", "a.md") < 0,
      "case differences in extensions sort in unicode order"
    );
    assert(
      compareFileExtensionsUnicode(".abc", ".abc") === 0,
      "equal dotfiles should be equal"
    );
    assert(
      compareFileExtensionsUnicode(".md", ".Gitattributes") > 0,
      "dotfiles sort alphabetically regardless of case"
    );
    assert(
      compareFileExtensionsUnicode(".env", ".aaa.env") > 0,
      "dotfiles sort alphabetically when they contain multiple dots"
    );
    assert(
      compareFileExtensionsUnicode(".env", ".env.aaa") < 0,
      "dotfiles with the same root sort shortest first"
    );
    assert(
      compareFileExtensionsUnicode(null, ".abc") < 0,
      "null should come before dotfiles"
    );
    assert(
      compareFileExtensionsUnicode(".env", "aaa.env") < 0,
      "dotfiles come before filenames with extensions"
    );
    assert(
      compareFileExtensionsUnicode(".MD", "a.md") < 0,
      "dotfiles sort before lowercase files"
    );
    assert(
      compareFileExtensionsUnicode(".env", "aaa") < 0,
      "dotfiles come before filenames without extensions"
    );
    assert(
      compareFileExtensionsUnicode(".md", "A.MD") < 0,
      "dotfiles sort before uppercase files"
    );
    assert(
      compareFileExtensionsUnicode("1", "1") === 0,
      "numerically equal full names should be equal"
    );
    assert(
      compareFileExtensionsUnicode("abc1.txt", "abc1.txt") === 0,
      "equal filenames with numbers should be equal"
    );
    assert(
      compareFileExtensionsUnicode("abc1.txt", "abc2.txt") < 0,
      "filenames with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsUnicode("txt.abc1", "txt.abc1") === 0,
      "equal extensions with numbers should be equal"
    );
    assert(
      compareFileExtensionsUnicode("txt.abc1", "txt.abc2") < 0,
      "extensions with numbers should be in numerical order, not alphabetical order"
    );
    assert(
      compareFileExtensionsUnicode("a.ext1", "b.ext1") < 0,
      "if equal extensions with numbers, full filenames should be compared"
    );
    assert(compareFileExtensionsUnicode("Z", "a") < 0, "Z comes before a");
    assert(
      compareFileExtensionsUnicode("a", "A") > 0,
      "the same letter sorts uppercase first"
    );
    assert(
      compareFileExtensionsUnicode("\xE2", "\xC2") > 0,
      "the same accented letter sorts uppercase first"
    );
    assert.deepStrictEqual(
      ["artichoke", "Artichoke", "art", "Art"].sort(
        compareFileExtensionsUnicode
      ),
      ["Art", "Artichoke", "art", "artichoke"],
      "names with the same root and different cases sort uppercase names first"
    );
    assert.deepStrictEqual(
      ["email", "Email", "\xE9mail", "\xC9mail"].sort(
        compareFileExtensionsUnicode
      ),
      ["Email", "email", "\xC9mail", "\xE9mail"],
      "the same base characters with different case or accents sort in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("a.MD", "a.md") < 0,
      "case differences in extensions sort by uppercase extension first"
    );
    assert(
      compareFileExtensionsUnicode("a.md", "A.md") > 0,
      "case differences in names sort uppercase first"
    );
    assert(
      compareFileExtensionsUnicode("art01", "Art01") > 0,
      "a numerically equivalent name of a different case sorts uppercase first"
    );
    assert.deepStrictEqual(
      ["a10.txt", "A2.txt", "A100.txt", "a20.txt"].sort(
        compareFileExtensionsUnicode
      ),
      ["A100.txt", "A2.txt", "a10.txt", "a20.txt"],
      "filenames with number and case differences sort in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("aggregate.go", "aggregate_repo.go") < 0,
      "when extensions are equal, compares full filenames in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("abc2.txt", "abc10.txt") > 0,
      "filenames with numbers should be in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("abc02.txt", "abc010.txt") > 0,
      "filenames with numbers that have leading zeros sort in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("abc1.10.txt", "abc1.2.txt") < 0,
      "numbers with dots between them sort in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("abc2.txt2", "abc1.txt10") > 0,
      "extensions with numbers should be in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("txt.abc2", "txt.abc10") > 0,
      "extensions with numbers should be in unicode order even when they are multiple digits long"
    );
    assert(
      compareFileExtensionsUnicode("abc.txt01", "abc.txt1") < 0,
      "extensions with equal numbers should be in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("abc02.txt", "abc002.txt") > 0,
      "filenames with equivalent numbers and leading zeros sort in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("txt.abc01", "txt.abc1") < 0,
      "extensions with equivalent numbers sort in unicode order"
    );
    assert(
      compareFileExtensionsUnicode("a.ext1", "b.Ext1") < 0,
      "if extensions with numbers are equal except for case, unicode full filenames should be compared"
    );
    assert(
      compareFileExtensionsUnicode("a.ext1", "a.Ext1") > 0,
      "if extensions with numbers are equal except for case, unicode full filenames should be compared"
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
