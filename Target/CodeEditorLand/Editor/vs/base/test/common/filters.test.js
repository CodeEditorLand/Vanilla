import assert from "assert";
import {
  anyScore,
  createMatches,
  fuzzyScore,
  fuzzyScoreGraceful,
  fuzzyScoreGracefulAggressive,
  matchesCamelCase,
  matchesContiguousSubString,
  matchesPrefix,
  matchesStrictPrefix,
  matchesSubString,
  matchesWords,
  or
} from "../../common/filters.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
function filterOk(filter, word, wordToMatchAgainst, highlights) {
  const r = filter(word, wordToMatchAgainst);
  assert(r, `${word} didn't match ${wordToMatchAgainst}`);
  if (highlights) {
    assert.deepStrictEqual(r, highlights);
  }
}
function filterNotOk(filter, word, wordToMatchAgainst) {
  assert(
    !filter(word, wordToMatchAgainst),
    `${word} matched ${wordToMatchAgainst}`
  );
}
suite("Filters", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("or", () => {
    let filter;
    let counters;
    const newFilter = (i, r) => () => {
      counters[i]++;
      return r;
    };
    counters = [0, 0];
    filter = or(newFilter(0, false), newFilter(1, false));
    filterNotOk(filter, "anything", "anything");
    assert.deepStrictEqual(counters, [1, 1]);
    counters = [0, 0];
    filter = or(newFilter(0, true), newFilter(1, false));
    filterOk(filter, "anything", "anything");
    assert.deepStrictEqual(counters, [1, 0]);
    counters = [0, 0];
    filter = or(newFilter(0, true), newFilter(1, true));
    filterOk(filter, "anything", "anything");
    assert.deepStrictEqual(counters, [1, 0]);
    counters = [0, 0];
    filter = or(newFilter(0, false), newFilter(1, true));
    filterOk(filter, "anything", "anything");
    assert.deepStrictEqual(counters, [1, 1]);
  });
  test("PrefixFilter - case sensitive", () => {
    filterNotOk(matchesStrictPrefix, "", "");
    filterOk(matchesStrictPrefix, "", "anything", []);
    filterOk(matchesStrictPrefix, "alpha", "alpha", [{ start: 0, end: 5 }]);
    filterOk(matchesStrictPrefix, "alpha", "alphasomething", [
      { start: 0, end: 5 }
    ]);
    filterNotOk(matchesStrictPrefix, "alpha", "alp");
    filterOk(matchesStrictPrefix, "a", "alpha", [{ start: 0, end: 1 }]);
    filterNotOk(matchesStrictPrefix, "x", "alpha");
    filterNotOk(matchesStrictPrefix, "A", "alpha");
    filterNotOk(matchesStrictPrefix, "AlPh", "alPHA");
  });
  test("PrefixFilter - ignore case", () => {
    filterOk(matchesPrefix, "alpha", "alpha", [{ start: 0, end: 5 }]);
    filterOk(matchesPrefix, "alpha", "alphasomething", [
      { start: 0, end: 5 }
    ]);
    filterNotOk(matchesPrefix, "alpha", "alp");
    filterOk(matchesPrefix, "a", "alpha", [{ start: 0, end: 1 }]);
    filterOk(matchesPrefix, "\xE4", "\xC4lpha", [{ start: 0, end: 1 }]);
    filterNotOk(matchesPrefix, "x", "alpha");
    filterOk(matchesPrefix, "A", "alpha", [{ start: 0, end: 1 }]);
    filterOk(matchesPrefix, "AlPh", "alPHA", [{ start: 0, end: 4 }]);
    filterNotOk(matchesPrefix, "T", "4");
  });
  test("CamelCaseFilter", () => {
    filterNotOk(matchesCamelCase, "", "");
    filterOk(matchesCamelCase, "", "anything", []);
    filterOk(matchesCamelCase, "alpha", "alpha", [{ start: 0, end: 5 }]);
    filterOk(matchesCamelCase, "AlPhA", "alpha", [{ start: 0, end: 5 }]);
    filterOk(matchesCamelCase, "alpha", "alphasomething", [
      { start: 0, end: 5 }
    ]);
    filterNotOk(matchesCamelCase, "alpha", "alp");
    filterOk(matchesCamelCase, "c", "CamelCaseRocks", [
      { start: 0, end: 1 }
    ]);
    filterOk(matchesCamelCase, "cc", "CamelCaseRocks", [
      { start: 0, end: 1 },
      { start: 5, end: 6 }
    ]);
    filterOk(matchesCamelCase, "ccr", "CamelCaseRocks", [
      { start: 0, end: 1 },
      { start: 5, end: 6 },
      { start: 9, end: 10 }
    ]);
    filterOk(matchesCamelCase, "cacr", "CamelCaseRocks", [
      { start: 0, end: 2 },
      { start: 5, end: 6 },
      { start: 9, end: 10 }
    ]);
    filterOk(matchesCamelCase, "cacar", "CamelCaseRocks", [
      { start: 0, end: 2 },
      { start: 5, end: 7 },
      { start: 9, end: 10 }
    ]);
    filterOk(matchesCamelCase, "ccarocks", "CamelCaseRocks", [
      { start: 0, end: 1 },
      { start: 5, end: 7 },
      { start: 9, end: 14 }
    ]);
    filterOk(matchesCamelCase, "cr", "CamelCaseRocks", [
      { start: 0, end: 1 },
      { start: 9, end: 10 }
    ]);
    filterOk(matchesCamelCase, "fba", "FooBarAbe", [
      { start: 0, end: 1 },
      { start: 3, end: 5 }
    ]);
    filterOk(matchesCamelCase, "fbar", "FooBarAbe", [
      { start: 0, end: 1 },
      { start: 3, end: 6 }
    ]);
    filterOk(matchesCamelCase, "fbara", "FooBarAbe", [
      { start: 0, end: 1 },
      { start: 3, end: 7 }
    ]);
    filterOk(matchesCamelCase, "fbaa", "FooBarAbe", [
      { start: 0, end: 1 },
      { start: 3, end: 5 },
      { start: 6, end: 7 }
    ]);
    filterOk(matchesCamelCase, "fbaab", "FooBarAbe", [
      { start: 0, end: 1 },
      { start: 3, end: 5 },
      { start: 6, end: 8 }
    ]);
    filterOk(matchesCamelCase, "c2d", "canvasCreation2D", [
      { start: 0, end: 1 },
      { start: 14, end: 16 }
    ]);
    filterOk(matchesCamelCase, "cce", "_canvasCreationEvent", [
      { start: 1, end: 2 },
      { start: 7, end: 8 },
      { start: 15, end: 16 }
    ]);
  });
  test("CamelCaseFilter - #19256", () => {
    assert(matchesCamelCase("Debug Console", "Open: Debug Console"));
    assert(matchesCamelCase("Debug console", "Open: Debug Console"));
    assert(matchesCamelCase("debug console", "Open: Debug Console"));
  });
  test("matchesContiguousSubString", () => {
    filterOk(matchesContiguousSubString, "cela", "cancelAnimationFrame()", [
      { start: 3, end: 7 }
    ]);
  });
  test("matchesSubString", () => {
    filterOk(matchesSubString, "cmm", "cancelAnimationFrame()", [
      { start: 0, end: 1 },
      { start: 9, end: 10 },
      { start: 18, end: 19 }
    ]);
    filterOk(matchesSubString, "abc", "abcabc", [{ start: 0, end: 3 }]);
    filterOk(matchesSubString, "abc", "aaabbbccc", [
      { start: 0, end: 1 },
      { start: 3, end: 4 },
      { start: 6, end: 7 }
    ]);
  });
  test("matchesSubString performance (#35346)", () => {
    filterNotOk(
      matchesSubString,
      "aaaaaaaaaaaaaaaaaaaax",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
  });
  test("WordFilter", () => {
    filterOk(matchesWords, "alpha", "alpha", [{ start: 0, end: 5 }]);
    filterOk(matchesWords, "alpha", "alphasomething", [
      { start: 0, end: 5 }
    ]);
    filterNotOk(matchesWords, "alpha", "alp");
    filterOk(matchesWords, "a", "alpha", [{ start: 0, end: 1 }]);
    filterNotOk(matchesWords, "x", "alpha");
    filterOk(matchesWords, "A", "alpha", [{ start: 0, end: 1 }]);
    filterOk(matchesWords, "AlPh", "alPHA", [{ start: 0, end: 4 }]);
    assert(matchesWords("Debug Console", "Open: Debug Console"));
    filterOk(matchesWords, "gp", "Git: Pull", [
      { start: 0, end: 1 },
      { start: 5, end: 6 }
    ]);
    filterOk(matchesWords, "g p", "Git: Pull", [
      { start: 0, end: 1 },
      { start: 5, end: 6 }
    ]);
    filterOk(matchesWords, "gipu", "Git: Pull", [
      { start: 0, end: 2 },
      { start: 5, end: 7 }
    ]);
    filterOk(matchesWords, "gp", "Category: Git: Pull", [
      { start: 10, end: 11 },
      { start: 15, end: 16 }
    ]);
    filterOk(matchesWords, "g p", "Category: Git: Pull", [
      { start: 10, end: 11 },
      { start: 15, end: 16 }
    ]);
    filterOk(matchesWords, "gipu", "Category: Git: Pull", [
      { start: 10, end: 12 },
      { start: 15, end: 17 }
    ]);
    filterNotOk(matchesWords, "it", "Git: Pull");
    filterNotOk(matchesWords, "ll", "Git: Pull");
    filterOk(matchesWords, "git: \u30D7\u30EB", "git: \u30D7\u30EB", [
      { start: 0, end: 7 }
    ]);
    filterOk(matchesWords, "git \u30D7\u30EB", "git: \u30D7\u30EB", [
      { start: 0, end: 3 },
      { start: 5, end: 7 }
    ]);
    filterOk(matchesWords, "\xF6\xE4k", "\xD6hm: \xC4lles Klar", [
      { start: 0, end: 1 },
      { start: 5, end: 6 },
      { start: 11, end: 12 }
    ]);
    filterOk(matchesWords, "C++", "C/C++: command", [{ start: 2, end: 5 }]);
    filterOk(matchesWords, ".", ":", []);
    filterOk(matchesWords, ".", ".", [{ start: 0, end: 1 }]);
    filterOk(matchesWords, "bar", "foo-bar");
    filterOk(matchesWords, "bar test", "foo-bar test");
    filterOk(matchesWords, "fbt", "foo-bar test");
    filterOk(matchesWords, "bar test", "foo-bar (test)");
    filterOk(matchesWords, "foo bar", "foo (bar)");
    filterNotOk(matchesWords, "bar est", "foo-bar test");
    filterNotOk(matchesWords, "fo ar", "foo-bar test");
    filterNotOk(matchesWords, "for", "foo-bar test");
    filterOk(matchesWords, "foo bar", "foo-bar");
    filterOk(matchesWords, "foo bar", "123 foo-bar 456");
    filterOk(matchesWords, "foo-bar", "foo bar");
    filterOk(matchesWords, "foo:bar", "foo:bar");
  });
  function assertMatches(pattern, word, decoratedWord, filter, opts = {}) {
    const r = filter(
      pattern,
      pattern.toLowerCase(),
      opts.patternPos || 0,
      word,
      word.toLowerCase(),
      opts.wordPos || 0,
      {
        firstMatchCanBeWeak: opts.firstMatchCanBeWeak ?? false,
        boostFullMatch: true
      }
    );
    assert.ok(!decoratedWord === !r);
    if (r) {
      const matches = createMatches(r);
      let actualWord = "";
      let pos = 0;
      for (const match of matches) {
        actualWord += word.substring(pos, match.start);
        actualWord += "^" + word.substring(match.start, match.end).split("").join("^");
        pos = match.end;
      }
      actualWord += word.substring(pos);
      assert.strictEqual(actualWord, decoratedWord);
    }
  }
  test("fuzzyScore, #23215", () => {
    assertMatches("tit", "win.tit", "win.^t^i^t", fuzzyScore);
    assertMatches("title", "win.title", "win.^t^i^t^l^e", fuzzyScore);
    assertMatches(
      "WordCla",
      "WordCharacterClassifier",
      "^W^o^r^dCharacter^C^l^assifier",
      fuzzyScore
    );
    assertMatches(
      "WordCCla",
      "WordCharacterClassifier",
      "^W^o^r^d^Character^C^l^assifier",
      fuzzyScore
    );
  });
  test("fuzzyScore, #23332", () => {
    assertMatches(
      "dete",
      '"editor.quickSuggestionsDelay"',
      void 0,
      fuzzyScore
    );
  });
  test("fuzzyScore, #23190", () => {
    assertMatches(
      "c:\\do",
      "& 'C:\\Documents and Settings'",
      "& '^C^:^\\^D^ocuments and Settings'",
      fuzzyScore
    );
    assertMatches(
      "c:\\do",
      "& 'c:\\Documents and Settings'",
      "& '^c^:^\\^D^ocuments and Settings'",
      fuzzyScore
    );
  });
  test("fuzzyScore, #23581", () => {
    assertMatches(
      "close",
      "css.lint.importStatement",
      "^css.^lint.imp^ort^Stat^ement",
      fuzzyScore
    );
    assertMatches(
      "close",
      "css.colorDecorators.enable",
      "^css.co^l^orDecorator^s.^enable",
      fuzzyScore
    );
    assertMatches(
      "close",
      "workbench.quickOpen.closeOnFocusOut",
      "workbench.quickOpen.^c^l^o^s^eOnFocusOut",
      fuzzyScore
    );
    assertTopScore(
      fuzzyScore,
      "close",
      2,
      "css.lint.importStatement",
      "css.colorDecorators.enable",
      "workbench.quickOpen.closeOnFocusOut"
    );
  });
  test("fuzzyScore, #23458", () => {
    assertMatches(
      "highlight",
      "editorHoverHighlight",
      "editorHover^H^i^g^h^l^i^g^h^t",
      fuzzyScore
    );
    assertMatches(
      "hhighlight",
      "editorHoverHighlight",
      "editor^Hover^H^i^g^h^l^i^g^h^t",
      fuzzyScore
    );
    assertMatches(
      "dhhighlight",
      "editorHoverHighlight",
      void 0,
      fuzzyScore
    );
  });
  test("fuzzyScore, #23746", () => {
    assertMatches("-moz", "-moz-foo", "^-^m^o^z-foo", fuzzyScore);
    assertMatches("moz", "-moz-foo", "-^m^o^z-foo", fuzzyScore);
    assertMatches("moz", "-moz-animation", "-^m^o^z-animation", fuzzyScore);
    assertMatches(
      "moza",
      "-moz-animation",
      "-^m^o^z-^animation",
      fuzzyScore
    );
  });
  test("fuzzyScore", () => {
    assertMatches("ab", "abA", "^a^bA", fuzzyScore);
    assertMatches("ccm", "cacmelCase", "^ca^c^melCase", fuzzyScore);
    assertMatches("bti", "the_black_knight", void 0, fuzzyScore);
    assertMatches("ccm", "camelCase", void 0, fuzzyScore);
    assertMatches("cmcm", "camelCase", void 0, fuzzyScore);
    assertMatches(
      "BK",
      "the_black_knight",
      "the_^black_^knight",
      fuzzyScore
    );
    assertMatches(
      "KeyboardLayout=",
      "KeyboardLayout",
      void 0,
      fuzzyScore
    );
    assertMatches(
      "LLL",
      "SVisualLoggerLogsList",
      "SVisual^Logger^Logs^List",
      fuzzyScore
    );
    assertMatches("LLLL", "SVilLoLosLi", void 0, fuzzyScore);
    assertMatches("LLLL", "SVisualLoggerLogsList", void 0, fuzzyScore);
    assertMatches("TEdit", "TextEdit", "^Text^E^d^i^t", fuzzyScore);
    assertMatches("TEdit", "TextEditor", "^Text^E^d^i^tor", fuzzyScore);
    assertMatches("TEdit", "Textedit", "^Text^e^d^i^t", fuzzyScore);
    assertMatches("TEdit", "text_edit", "^text_^e^d^i^t", fuzzyScore);
    assertMatches(
      "TEditDit",
      "TextEditorDecorationType",
      "^Text^E^d^i^tor^Decorat^ion^Type",
      fuzzyScore
    );
    assertMatches(
      "TEdit",
      "TextEditorDecorationType",
      "^Text^E^d^i^torDecorationType",
      fuzzyScore
    );
    assertMatches("Tedit", "TextEdit", "^Text^E^d^i^t", fuzzyScore);
    assertMatches("ba", "?AB?", void 0, fuzzyScore);
    assertMatches(
      "bkn",
      "the_black_knight",
      "the_^black_^k^night",
      fuzzyScore
    );
    assertMatches(
      "bt",
      "the_black_knight",
      "the_^black_knigh^t",
      fuzzyScore
    );
    assertMatches("ccm", "camelCasecm", "^camel^Casec^m", fuzzyScore);
    assertMatches("fdm", "findModel", "^fin^d^Model", fuzzyScore);
    assertMatches("fob", "foobar", "^f^oo^bar", fuzzyScore);
    assertMatches("fobz", "foobar", void 0, fuzzyScore);
    assertMatches("foobar", "foobar", "^f^o^o^b^a^r", fuzzyScore);
    assertMatches(
      "form",
      "editor.formatOnSave",
      "editor.^f^o^r^matOnSave",
      fuzzyScore
    );
    assertMatches("g p", "Git: Pull", "^Git:^ ^Pull", fuzzyScore);
    assertMatches("g p", "Git: Pull", "^Git:^ ^Pull", fuzzyScore);
    assertMatches("gip", "Git: Pull", "^G^it: ^Pull", fuzzyScore);
    assertMatches("gip", "Git: Pull", "^G^it: ^Pull", fuzzyScore);
    assertMatches("gp", "Git: Pull", "^Git: ^Pull", fuzzyScore);
    assertMatches("gp", "Git_Git_Pull", "^Git_Git_^Pull", fuzzyScore);
    assertMatches("is", "ImportStatement", "^Import^Statement", fuzzyScore);
    assertMatches("is", "isValid", "^i^sValid", fuzzyScore);
    assertMatches("lowrd", "lowWord", "^l^o^wWo^r^d", fuzzyScore);
    assertMatches("myvable", "myvariable", "^m^y^v^aria^b^l^e", fuzzyScore);
    assertMatches("no", "", void 0, fuzzyScore);
    assertMatches("no", "match", void 0, fuzzyScore);
    assertMatches("ob", "foobar", void 0, fuzzyScore);
    assertMatches(
      "sl",
      "SVisualLoggerLogsList",
      "^SVisual^LoggerLogsList",
      fuzzyScore
    );
    assertMatches(
      "sllll",
      "SVisualLoggerLogsList",
      "^SVisua^l^Logger^Logs^List",
      fuzzyScore
    );
    assertMatches("Three", "HTMLHRElement", void 0, fuzzyScore);
    assertMatches("Three", "Three", "^T^h^r^e^e", fuzzyScore);
    assertMatches("fo", "barfoo", void 0, fuzzyScore);
    assertMatches("fo", "bar_foo", "bar_^f^oo", fuzzyScore);
    assertMatches("fo", "bar_Foo", "bar_^F^oo", fuzzyScore);
    assertMatches("fo", "bar foo", "bar ^f^oo", fuzzyScore);
    assertMatches("fo", "bar.foo", "bar.^f^oo", fuzzyScore);
    assertMatches("fo", "bar/foo", "bar/^f^oo", fuzzyScore);
    assertMatches("fo", "bar\\foo", "bar\\^f^oo", fuzzyScore);
  });
  test("fuzzyScore (first match can be weak)", () => {
    assertMatches(
      "Three",
      "HTMLHRElement",
      "H^TML^H^R^El^ement",
      fuzzyScore,
      { firstMatchCanBeWeak: true }
    );
    assertMatches("tor", "constructor", "construc^t^o^r", fuzzyScore, {
      firstMatchCanBeWeak: true
    });
    assertMatches("ur", "constructor", "constr^ucto^r", fuzzyScore, {
      firstMatchCanBeWeak: true
    });
    assertTopScore(fuzzyScore, "tor", 2, "constructor", "Thor", "cTor");
  });
  test("fuzzyScore, many matches", () => {
    assertMatches(
      "aaaaaa",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "^a^a^a^a^a^aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      fuzzyScore
    );
  });
  test("Freeze when fjfj -> jfjf, https://github.com/microsoft/vscode/issues/91807", () => {
    assertMatches("jfjfj", "fjfjfjfjfjfjfjfjfjfjfj", void 0, fuzzyScore);
    assertMatches(
      "jfjfjfjfjfjfjfjfjfj",
      "fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj",
      void 0,
      fuzzyScore
    );
    assertMatches(
      "jfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfj",
      "fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj",
      void 0,
      fuzzyScore
    );
    assertMatches(
      "jfjfjfjfjfjfjfjfjfj",
      "fJfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj",
      "f^J^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^jfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj",
      // strong match
      fuzzyScore
    );
    assertMatches(
      "jfjfjfjfjfjfjfjfjfj",
      "fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj",
      "f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^jfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj",
      // any match
      fuzzyScore,
      { firstMatchCanBeWeak: true }
    );
  });
  test("fuzzyScore, issue #26423", () => {
    assertMatches("baba", "abababab", void 0, fuzzyScore);
    assertMatches(
      "fsfsfs",
      "dsafdsafdsafdsafdsafdsafdsafasdfdsa",
      void 0,
      fuzzyScore
    );
    assertMatches(
      "fsfsfsfsfsfsfsf",
      "dsafdsafdsafdsafdsafdsafdsafasdfdsafdsafdsafdsafdsfdsafdsfdfdfasdnfdsajfndsjnafjndsajlknfdsa",
      void 0,
      fuzzyScore
    );
  });
  test("Fuzzy IntelliSense matching vs Haxe metadata completion, #26995", () => {
    assertMatches("f", ":Foo", ":^Foo", fuzzyScore);
    assertMatches("f", ":foo", ":^foo", fuzzyScore);
  });
  test("Separator only match should not be weak #79558", () => {
    assertMatches(".", "foo.bar", "foo^.bar", fuzzyScore);
  });
  test("Cannot set property '1' of undefined, #26511", () => {
    const word = new Array(123).join("a");
    const pattern = new Array(120).join("a");
    fuzzyScore(
      pattern,
      pattern.toLowerCase(),
      0,
      word,
      word.toLowerCase(),
      0
    );
    assert.ok(true);
  });
  test("Vscode 1.12 no longer obeys 'sortText' in completion items (from language server), #26096", () => {
    assertMatches("  ", "  group", void 0, fuzzyScore, {
      patternPos: 2
    });
    assertMatches("  g", "  group", "  ^group", fuzzyScore, {
      patternPos: 2
    });
    assertMatches("g", "  group", "  ^group", fuzzyScore);
    assertMatches("g g", "  groupGroup", void 0, fuzzyScore);
    assertMatches("g g", "  group Group", "  ^group^ ^Group", fuzzyScore);
    assertMatches(" g g", "  group Group", "  ^group^ ^Group", fuzzyScore, {
      patternPos: 1
    });
    assertMatches("zz", "zzGroup", "^z^zGroup", fuzzyScore);
    assertMatches("zzg", "zzGroup", "^z^z^Group", fuzzyScore);
    assertMatches("g", "zzGroup", "zz^Group", fuzzyScore);
  });
  test("patternPos isn't working correctly #79815", () => {
    assertMatches(":p".substr(1), "prop", "^prop", fuzzyScore, {
      patternPos: 0
    });
    assertMatches(":p", "prop", "^prop", fuzzyScore, { patternPos: 1 });
    assertMatches(":p", "prop", void 0, fuzzyScore, { patternPos: 2 });
    assertMatches(":p", "proP", "pro^P", fuzzyScore, {
      patternPos: 1,
      wordPos: 1
    });
    assertMatches(":p", "aprop", "a^prop", fuzzyScore, {
      patternPos: 1,
      firstMatchCanBeWeak: true
    });
    assertMatches(":p", "aprop", void 0, fuzzyScore, {
      patternPos: 1,
      firstMatchCanBeWeak: false
    });
  });
  function assertTopScore(filter, pattern, expected, ...words) {
    let topScore = -(100 * 10);
    let topIdx = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const m = filter(
        pattern,
        pattern.toLowerCase(),
        0,
        word,
        word.toLowerCase(),
        0
      );
      if (m) {
        const [score] = m;
        if (score > topScore) {
          topScore = score;
          topIdx = i;
        }
      }
    }
    assert.strictEqual(
      topIdx,
      expected,
      `${pattern} -> actual=${words[topIdx]} <> expected=${words[expected]}`
    );
  }
  test("topScore - fuzzyScore", () => {
    assertTopScore(
      fuzzyScore,
      "cons",
      2,
      "ArrayBufferConstructor",
      "Console",
      "console"
    );
    assertTopScore(fuzzyScore, "Foo", 1, "foo", "Foo", "foo");
    assertTopScore(
      fuzzyScore,
      "onMess",
      1,
      "onmessage",
      "onMessage",
      "onThisMegaEscape"
    );
    assertTopScore(fuzzyScore, "CC", 1, "camelCase", "CamelCase");
    assertTopScore(fuzzyScore, "cC", 0, "camelCase", "CamelCase");
    assertTopScore(
      fuzzyScore,
      "p",
      4,
      "parse",
      "posix",
      "pafdsa",
      "path",
      "p"
    );
    assertTopScore(fuzzyScore, "pa", 0, "parse", "pafdsa", "path");
    assertTopScore(
      fuzzyScore,
      "log",
      3,
      "HTMLOptGroupElement",
      "ScrollLogicalPosition",
      "SVGFEMorphologyElement",
      "log",
      "logger"
    );
    assertTopScore(
      fuzzyScore,
      "e",
      2,
      "AbstractWorker",
      "ActiveXObject",
      "else"
    );
    assertTopScore(
      fuzzyScore,
      "workbench.sideb",
      1,
      "workbench.editor.defaultSideBySideLayout",
      "workbench.sideBar.location"
    );
    assertTopScore(
      fuzzyScore,
      "editor.r",
      2,
      "diffEditor.renderSideBySide",
      "editor.overviewRulerlanes",
      "editor.renderControlCharacter",
      "editor.renderWhitespace"
    );
    assertTopScore(fuzzyScore, "-mo", 1, "-ms-ime-mode", "-moz-columns");
    assertTopScore(
      fuzzyScore,
      "convertModelPosition",
      0,
      "convertModelPositionToViewPosition",
      "convertViewToModelPosition"
    );
    assertTopScore(
      fuzzyScore,
      "is",
      0,
      "isValidViewletId",
      "import statement"
    );
    assertTopScore(
      fuzzyScore,
      "title",
      1,
      "files.trimTrailingWhitespace",
      "window.title"
    );
    assertTopScore(
      fuzzyScore,
      "const",
      1,
      "constructor",
      "const",
      "cuOnstrul"
    );
  });
  test("Unexpected suggestion scoring, #28791", () => {
    assertTopScore(fuzzyScore, "_lines", 1, "_lineStarts", "_lines");
    assertTopScore(fuzzyScore, "_lines", 1, "_lineS", "_lines");
    assertTopScore(fuzzyScore, "_lineS", 0, "_lineS", "_lines");
  });
  test.skip('Bad completion ranking changes valid variable name to class name when pressing "." #187055', () => {
    assertTopScore(fuzzyScore, "a", 1, "A", "a");
    assertTopScore(fuzzyScore, "theme", 1, "Theme", "theme");
  });
  test("HTML closing tag proposal filtered out #38880", () => {
    assertMatches("		<", "		</body>", "^	^	^</body>", fuzzyScore, {
      patternPos: 0
    });
    assertMatches("		<", "		</body>", "		^</body>", fuzzyScore, {
      patternPos: 2
    });
    assertMatches("	<", "	</body>", "	^</body>", fuzzyScore, {
      patternPos: 1
    });
  });
  test("fuzzyScoreGraceful", () => {
    assertMatches("rlut", "result", void 0, fuzzyScore);
    assertMatches("rlut", "result", "^res^u^l^t", fuzzyScoreGraceful);
    assertMatches("cno", "console", "^co^ns^ole", fuzzyScore);
    assertMatches("cno", "console", "^co^ns^ole", fuzzyScoreGraceful);
    assertMatches(
      "cno",
      "console",
      "^c^o^nsole",
      fuzzyScoreGracefulAggressive
    );
    assertMatches("cno", "co_new", "^c^o_^new", fuzzyScoreGraceful);
    assertMatches(
      "cno",
      "co_new",
      "^c^o_^new",
      fuzzyScoreGracefulAggressive
    );
  });
  test("List highlight filter: Not all characters from match are highlighterd #66923", () => {
    assertMatches(
      "foo",
      "barbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo",
      "barbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_^f^o^o",
      fuzzyScore
    );
  });
  test("Autocompletion is matched against truncated filterText to 54 characters #74133", () => {
    assertMatches(
      "foo",
      "ffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo",
      "ffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_^f^o^o",
      fuzzyScore
    );
    assertMatches(
      "Aoo",
      "Affffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo",
      "^Affffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_f^o^o",
      fuzzyScore
    );
    assertMatches(
      "foo",
      "Gffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo",
      void 0,
      fuzzyScore
    );
  });
  test(`"Go to Symbol" with the exact method name doesn't work as expected #84787`, () => {
    const match = fuzzyScore(":get", ":get", 1, "get", "get", 0, {
      firstMatchCanBeWeak: true,
      boostFullMatch: true
    });
    assert.ok(Boolean(match));
  });
  test("Wrong highlight after emoji #113404", () => {
    assertMatches(
      "di",
      '\u2728div classname=""></div>',
      '\u2728^d^iv classname=""></div>',
      fuzzyScore
    );
    assertMatches(
      "di",
      'adiv classname=""></div>',
      'adiv classname=""></^d^iv>',
      fuzzyScore
    );
  });
  test("Suggestion is not highlighted #85826", () => {
    assertMatches(
      "SemanticTokens",
      "SemanticTokensEdits",
      "^S^e^m^a^n^t^i^c^T^o^k^e^n^sEdits",
      fuzzyScore
    );
    assertMatches(
      "SemanticTokens",
      "SemanticTokensEdits",
      "^S^e^m^a^n^t^i^c^T^o^k^e^n^sEdits",
      fuzzyScoreGracefulAggressive
    );
  });
  test("IntelliSense completion not correctly highlighting text in front of cursor #115250", () => {
    assertMatches("lo", "log", "^l^og", fuzzyScore);
    assertMatches(".lo", "log", "^l^og", anyScore);
    assertMatches(".", "log", "log", anyScore);
  });
  test("anyScore should not require a strong first match", () => {
    assertMatches("bar", "foobAr", "foo^b^A^r", anyScore);
    assertMatches("bar", "foobar", "foo^b^a^r", anyScore);
  });
  test("configurable full match boost", () => {
    const prefix = "create";
    const a = "createModelServices";
    const b = "create";
    let aBoost = fuzzyScore(prefix, prefix, 0, a, a.toLowerCase(), 0, {
      boostFullMatch: true,
      firstMatchCanBeWeak: true
    });
    let bBoost = fuzzyScore(prefix, prefix, 0, b, b.toLowerCase(), 0, {
      boostFullMatch: true,
      firstMatchCanBeWeak: true
    });
    assert.ok(aBoost);
    assert.ok(bBoost);
    assert.ok(aBoost[0] < bBoost[0]);
    const wordPrefix = "$(symbol-function) ";
    aBoost = fuzzyScore(
      prefix,
      prefix,
      0,
      `${wordPrefix}${a}`,
      `${wordPrefix}${a}`.toLowerCase(),
      wordPrefix.length,
      { boostFullMatch: true, firstMatchCanBeWeak: true }
    );
    bBoost = fuzzyScore(
      prefix,
      prefix,
      0,
      `${wordPrefix}${b}`,
      `${wordPrefix}${b}`.toLowerCase(),
      wordPrefix.length,
      { boostFullMatch: true, firstMatchCanBeWeak: true }
    );
    assert.ok(aBoost);
    assert.ok(bBoost);
    assert.ok(aBoost[0] < bBoost[0]);
    const aScore = fuzzyScore(prefix, prefix, 0, a, a.toLowerCase(), 0, {
      boostFullMatch: false,
      firstMatchCanBeWeak: true
    });
    const bScore = fuzzyScore(prefix, prefix, 0, b, b.toLowerCase(), 0, {
      boostFullMatch: false,
      firstMatchCanBeWeak: true
    });
    assert.ok(aScore);
    assert.ok(bScore);
    assert.ok(aScore[0] === bScore[0]);
  });
  test("Unexpected suggest highlighting ignores whole word match in favor of matching first letter#147423", () => {
    assertMatches("i", "machine/{id}", "machine/{^id}", fuzzyScore);
    assertMatches(
      "ok",
      "obobobf{ok}/user",
      "^obobobf{o^k}/user",
      fuzzyScore
    );
  });
});
