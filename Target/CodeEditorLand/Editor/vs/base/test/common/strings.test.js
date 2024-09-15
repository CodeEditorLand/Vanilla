var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as strings from "../../common/strings.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Strings", () => {
  test("equalsIgnoreCase", () => {
    assert(strings.equalsIgnoreCase("", ""));
    assert(!strings.equalsIgnoreCase("", "1"));
    assert(!strings.equalsIgnoreCase("1", ""));
    assert(strings.equalsIgnoreCase("a", "a"));
    assert(strings.equalsIgnoreCase("abc", "Abc"));
    assert(strings.equalsIgnoreCase("abc", "ABC"));
    assert(strings.equalsIgnoreCase("H\xF6henmeter", "H\xD6henmeter"));
    assert(strings.equalsIgnoreCase("\xD6L", "\xD6l"));
  });
  test("beginsWithIgnoreCase", () => {
    assert(strings.startsWithIgnoreCase("", ""));
    assert(!strings.startsWithIgnoreCase("", "1"));
    assert(strings.startsWithIgnoreCase("1", ""));
    assert(strings.startsWithIgnoreCase("a", "a"));
    assert(strings.startsWithIgnoreCase("abc", "Abc"));
    assert(strings.startsWithIgnoreCase("abc", "ABC"));
    assert(strings.startsWithIgnoreCase("H\xF6henmeter", "H\xD6henmeter"));
    assert(strings.startsWithIgnoreCase("\xD6L", "\xD6l"));
    assert(strings.startsWithIgnoreCase("alles klar", "a"));
    assert(strings.startsWithIgnoreCase("alles klar", "A"));
    assert(strings.startsWithIgnoreCase("alles klar", "alles k"));
    assert(strings.startsWithIgnoreCase("alles klar", "alles K"));
    assert(strings.startsWithIgnoreCase("alles klar", "ALLES K"));
    assert(strings.startsWithIgnoreCase("alles klar", "alles klar"));
    assert(strings.startsWithIgnoreCase("alles klar", "ALLES KLAR"));
    assert(!strings.startsWithIgnoreCase("alles klar", " ALLES K"));
    assert(!strings.startsWithIgnoreCase("alles klar", "ALLES K "));
    assert(!strings.startsWithIgnoreCase("alles klar", "\xF6ALLES K "));
    assert(!strings.startsWithIgnoreCase("alles klar", " "));
    assert(!strings.startsWithIgnoreCase("alles klar", "\xF6"));
  });
  test("compareIgnoreCase", () => {
    function assertCompareIgnoreCase(a, b, recurse = true) {
      let actual = strings.compareIgnoreCase(a, b);
      actual = actual > 0 ? 1 : actual < 0 ? -1 : actual;
      let expected = strings.compare(a.toLowerCase(), b.toLowerCase());
      expected = expected > 0 ? 1 : expected < 0 ? -1 : expected;
      assert.strictEqual(actual, expected, `${a} <> ${b}`);
      if (recurse) {
        assertCompareIgnoreCase(b, a, false);
      }
    }
    __name(assertCompareIgnoreCase, "assertCompareIgnoreCase");
    assertCompareIgnoreCase("", "");
    assertCompareIgnoreCase("abc", "ABC");
    assertCompareIgnoreCase("abc", "ABc");
    assertCompareIgnoreCase("abc", "ABcd");
    assertCompareIgnoreCase("abc", "abcd");
    assertCompareIgnoreCase("foo", "f\xF6o");
    assertCompareIgnoreCase("Code", "code");
    assertCompareIgnoreCase("Code", "c\xF6de");
    assertCompareIgnoreCase("B", "a");
    assertCompareIgnoreCase("a", "B");
    assertCompareIgnoreCase("b", "a");
    assertCompareIgnoreCase("a", "b");
    assertCompareIgnoreCase("aa", "ab");
    assertCompareIgnoreCase("aa", "aB");
    assertCompareIgnoreCase("aa", "aA");
    assertCompareIgnoreCase("a", "aa");
    assertCompareIgnoreCase("ab", "aA");
    assertCompareIgnoreCase("O", "/");
  });
  test("compareIgnoreCase (substring)", () => {
    function assertCompareIgnoreCase(a, b, aStart, aEnd, bStart, bEnd, recurse = true) {
      let actual = strings.compareSubstringIgnoreCase(a, b, aStart, aEnd, bStart, bEnd);
      actual = actual > 0 ? 1 : actual < 0 ? -1 : actual;
      let expected = strings.compare(a.toLowerCase().substring(aStart, aEnd), b.toLowerCase().substring(bStart, bEnd));
      expected = expected > 0 ? 1 : expected < 0 ? -1 : expected;
      assert.strictEqual(actual, expected, `${a} <> ${b}`);
      if (recurse) {
        assertCompareIgnoreCase(b, a, bStart, bEnd, aStart, aEnd, false);
      }
    }
    __name(assertCompareIgnoreCase, "assertCompareIgnoreCase");
    assertCompareIgnoreCase("", "", 0, 0, 0, 0);
    assertCompareIgnoreCase("abc", "ABC", 0, 1, 0, 1);
    assertCompareIgnoreCase("abc", "Aabc", 0, 3, 1, 4);
    assertCompareIgnoreCase("abcABc", "ABcd", 3, 6, 0, 4);
  });
  test("format", () => {
    assert.strictEqual(strings.format("Foo Bar"), "Foo Bar");
    assert.strictEqual(strings.format("Foo {0} Bar"), "Foo {0} Bar");
    assert.strictEqual(strings.format("Foo {0} Bar", "yes"), "Foo yes Bar");
    assert.strictEqual(strings.format("Foo {0} Bar {0}", "yes"), "Foo yes Bar yes");
    assert.strictEqual(strings.format("Foo {0} Bar {1}{2}", "yes"), "Foo yes Bar {1}{2}");
    assert.strictEqual(strings.format("Foo {0} Bar {1}{2}", "yes", void 0), "Foo yes Bar undefined{2}");
    assert.strictEqual(strings.format("Foo {0} Bar {1}{2}", "yes", 5, false), "Foo yes Bar 5false");
    assert.strictEqual(strings.format("Foo {0} Bar. {1}", "(foo)", ".test"), "Foo (foo) Bar. .test");
  });
  test("format2", () => {
    assert.strictEqual(strings.format2("Foo Bar", {}), "Foo Bar");
    assert.strictEqual(strings.format2("Foo {oops} Bar", {}), "Foo {oops} Bar");
    assert.strictEqual(strings.format2("Foo {foo} Bar", { foo: "bar" }), "Foo bar Bar");
    assert.strictEqual(strings.format2("Foo {foo} Bar {foo}", { foo: "bar" }), "Foo bar Bar bar");
    assert.strictEqual(strings.format2("Foo {foo} Bar {bar}{boo}", { foo: "bar" }), "Foo bar Bar {bar}{boo}");
    assert.strictEqual(strings.format2("Foo {foo} Bar {bar}{boo}", { foo: "bar", bar: "undefined" }), "Foo bar Bar undefined{boo}");
    assert.strictEqual(strings.format2("Foo {foo} Bar {bar}{boo}", { foo: "bar", bar: "5", boo: false }), "Foo bar Bar 5false");
    assert.strictEqual(strings.format2("Foo {foo} Bar. {bar}", { foo: "(foo)", bar: ".test" }), "Foo (foo) Bar. .test");
  });
  test("lcut", () => {
    assert.strictEqual(strings.lcut("foo bar", 0), "");
    assert.strictEqual(strings.lcut("foo bar", 1), "bar");
    assert.strictEqual(strings.lcut("foo bar", 3), "bar");
    assert.strictEqual(strings.lcut("foo bar", 4), "bar");
    assert.strictEqual(strings.lcut("foo bar", 5), "foo bar");
    assert.strictEqual(strings.lcut("test string 0.1.2.3", 3), "2.3");
    assert.strictEqual(strings.lcut("foo bar", 0, "\u2026"), "\u2026");
    assert.strictEqual(strings.lcut("foo bar", 1, "\u2026"), "\u2026bar");
    assert.strictEqual(strings.lcut("foo bar", 3, "\u2026"), "\u2026bar");
    assert.strictEqual(strings.lcut("foo bar", 4, "\u2026"), "\u2026bar");
    assert.strictEqual(strings.lcut("foo bar", 5, "\u2026"), "foo bar");
    assert.strictEqual(strings.lcut("test string 0.1.2.3", 3, "\u2026"), "\u20262.3");
    assert.strictEqual(strings.lcut("", 10), "");
    assert.strictEqual(strings.lcut("a", 10), "a");
    assert.strictEqual(strings.lcut(" a", 10), "a");
    assert.strictEqual(strings.lcut("            a", 10), "a");
    assert.strictEqual(strings.lcut(" bbbb       a", 10), "bbbb       a");
    assert.strictEqual(strings.lcut("............a", 10), "............a");
    assert.strictEqual(strings.lcut("", 10, "\u2026"), "");
    assert.strictEqual(strings.lcut("a", 10, "\u2026"), "a");
    assert.strictEqual(strings.lcut(" a", 10, "\u2026"), "a");
    assert.strictEqual(strings.lcut("            a", 10, "\u2026"), "a");
    assert.strictEqual(strings.lcut(" bbbb       a", 10, "\u2026"), "bbbb       a");
    assert.strictEqual(strings.lcut("............a", 10, "\u2026"), "............a");
  });
  test("escape", () => {
    assert.strictEqual(strings.escape(""), "");
    assert.strictEqual(strings.escape("foo"), "foo");
    assert.strictEqual(strings.escape("foo bar"), "foo bar");
    assert.strictEqual(strings.escape("<foo bar>"), "&lt;foo bar&gt;");
    assert.strictEqual(strings.escape("<foo>Hello</foo>"), "&lt;foo&gt;Hello&lt;/foo&gt;");
  });
  test("ltrim", () => {
    assert.strictEqual(strings.ltrim("foo", "f"), "oo");
    assert.strictEqual(strings.ltrim("foo", "o"), "foo");
    assert.strictEqual(strings.ltrim("http://www.test.de", "http://"), "www.test.de");
    assert.strictEqual(strings.ltrim("/foo/", "/"), "foo/");
    assert.strictEqual(strings.ltrim("//foo/", "/"), "foo/");
    assert.strictEqual(strings.ltrim("/", ""), "/");
    assert.strictEqual(strings.ltrim("/", "/"), "");
    assert.strictEqual(strings.ltrim("///", "/"), "");
    assert.strictEqual(strings.ltrim("", ""), "");
    assert.strictEqual(strings.ltrim("", "/"), "");
  });
  test("rtrim", () => {
    assert.strictEqual(strings.rtrim("foo", "o"), "f");
    assert.strictEqual(strings.rtrim("foo", "f"), "foo");
    assert.strictEqual(strings.rtrim("http://www.test.de", ".de"), "http://www.test");
    assert.strictEqual(strings.rtrim("/foo/", "/"), "/foo");
    assert.strictEqual(strings.rtrim("/foo//", "/"), "/foo");
    assert.strictEqual(strings.rtrim("/", ""), "/");
    assert.strictEqual(strings.rtrim("/", "/"), "");
    assert.strictEqual(strings.rtrim("///", "/"), "");
    assert.strictEqual(strings.rtrim("", ""), "");
    assert.strictEqual(strings.rtrim("", "/"), "");
  });
  test("trim", () => {
    assert.strictEqual(strings.trim(" foo "), "foo");
    assert.strictEqual(strings.trim("  foo"), "foo");
    assert.strictEqual(strings.trim("bar  "), "bar");
    assert.strictEqual(strings.trim("   "), "");
    assert.strictEqual(strings.trim("foo bar", "bar"), "foo ");
  });
  test("trimWhitespace", () => {
    assert.strictEqual(" foo ".trim(), "foo");
    assert.strictEqual("	 foo	".trim(), "foo");
    assert.strictEqual("  foo".trim(), "foo");
    assert.strictEqual("bar  ".trim(), "bar");
    assert.strictEqual("   ".trim(), "");
    assert.strictEqual(" 	  ".trim(), "");
  });
  test("lastNonWhitespaceIndex", () => {
    assert.strictEqual(strings.lastNonWhitespaceIndex("abc  	 	 "), 2);
    assert.strictEqual(strings.lastNonWhitespaceIndex("abc"), 2);
    assert.strictEqual(strings.lastNonWhitespaceIndex("abc	"), 2);
    assert.strictEqual(strings.lastNonWhitespaceIndex("abc "), 2);
    assert.strictEqual(strings.lastNonWhitespaceIndex("abc  	 	 "), 2);
    assert.strictEqual(strings.lastNonWhitespaceIndex("abc  	 	 abc 	 	 "), 11);
    assert.strictEqual(strings.lastNonWhitespaceIndex("abc  	 	 abc 	 	 ", 8), 2);
    assert.strictEqual(strings.lastNonWhitespaceIndex("  	 	 "), -1);
  });
  test("containsRTL", () => {
    assert.strictEqual(strings.containsRTL("a"), false);
    assert.strictEqual(strings.containsRTL(""), false);
    assert.strictEqual(strings.containsRTL(strings.UTF8_BOM_CHARACTER + "a"), false);
    assert.strictEqual(strings.containsRTL("hello world!"), false);
    assert.strictEqual(strings.containsRTL("a\u{1F4DA}\u{1F4DA}b"), false);
    assert.strictEqual(strings.containsRTL("\u0647\u0646\u0627\u0643 \u062D\u0642\u064A\u0642\u0629 \u0645\u062B\u0628\u062A\u0629 \u0645\u0646\u0630 \u0632\u0645\u0646 \u0637\u0648\u064A\u0644"), true);
    assert.strictEqual(strings.containsRTL("\u05D6\u05D5\u05D4\u05D9 \u05E2\u05D5\u05D1\u05D3\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E9\u05D3\u05E2\u05EA\u05D5"), true);
  });
  test("issue #115221: isEmojiImprecise misses \u2B50", () => {
    const codePoint = strings.getNextCodePoint("\u2B50", "\u2B50".length, 0);
    assert.strictEqual(strings.isEmojiImprecise(codePoint), true);
  });
  test("isBasicASCII", () => {
    function assertIsBasicASCII(str, expected) {
      assert.strictEqual(strings.isBasicASCII(str), expected, str + ` (${str.charCodeAt(0)})`);
    }
    __name(assertIsBasicASCII, "assertIsBasicASCII");
    assertIsBasicASCII("abcdefghijklmnopqrstuvwxyz", true);
    assertIsBasicASCII("ABCDEFGHIJKLMNOPQRSTUVWXYZ", true);
    assertIsBasicASCII("1234567890", true);
    assertIsBasicASCII("`~!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?", true);
    assertIsBasicASCII(" ", true);
    assertIsBasicASCII("	", true);
    assertIsBasicASCII("\n", true);
    assertIsBasicASCII("\r", true);
    let ALL = "\r	\n";
    for (let i = 32; i < 127; i++) {
      ALL += String.fromCharCode(i);
    }
    assertIsBasicASCII(ALL, true);
    assertIsBasicASCII(String.fromCharCode(31), false);
    assertIsBasicASCII(String.fromCharCode(127), false);
    assertIsBasicASCII("\xFC", false);
    assertIsBasicASCII("a\u{1F4DA}\u{1F4DA}b", false);
  });
  test("createRegExp", () => {
    assert.throws(() => strings.createRegExp("", false));
    assert.strictEqual(strings.createRegExp("abc", false).source, "abc");
    assert.strictEqual(strings.createRegExp("([^ ,.]*)", false).source, "\\(\\[\\^ ,\\.\\]\\*\\)");
    assert.strictEqual(strings.createRegExp("([^ ,.]*)", true).source, "([^ ,.]*)");
    assert.strictEqual(strings.createRegExp("abc", false, { wholeWord: true }).source, "\\babc\\b");
    assert.strictEqual(strings.createRegExp("abc", true, { wholeWord: true }).source, "\\babc\\b");
    assert.strictEqual(strings.createRegExp(" abc", true, { wholeWord: true }).source, " abc\\b");
    assert.strictEqual(strings.createRegExp("abc ", true, { wholeWord: true }).source, "\\babc ");
    assert.strictEqual(strings.createRegExp(" abc ", true, { wholeWord: true }).source, " abc ");
    const regExpWithoutFlags = strings.createRegExp("abc", true);
    assert(!regExpWithoutFlags.global);
    assert(regExpWithoutFlags.ignoreCase);
    assert(!regExpWithoutFlags.multiline);
    const regExpWithFlags = strings.createRegExp("abc", true, { global: true, matchCase: true, multiline: true });
    assert(regExpWithFlags.global);
    assert(!regExpWithFlags.ignoreCase);
    assert(regExpWithFlags.multiline);
  });
  test("getLeadingWhitespace", () => {
    assert.strictEqual(strings.getLeadingWhitespace("  foo"), "  ");
    assert.strictEqual(strings.getLeadingWhitespace("  foo", 2), "");
    assert.strictEqual(strings.getLeadingWhitespace("  foo", 1, 1), "");
    assert.strictEqual(strings.getLeadingWhitespace("  foo", 0, 1), " ");
    assert.strictEqual(strings.getLeadingWhitespace("  "), "  ");
    assert.strictEqual(strings.getLeadingWhitespace("  ", 1), " ");
    assert.strictEqual(strings.getLeadingWhitespace("  ", 0, 1), " ");
    assert.strictEqual(strings.getLeadingWhitespace("		function foo(){", 0, 1), "	");
    assert.strictEqual(strings.getLeadingWhitespace("		function foo(){", 0, 2), "		");
  });
  test("fuzzyContains", () => {
    assert.ok(!strings.fuzzyContains(void 0, null));
    assert.ok(strings.fuzzyContains("hello world", "h"));
    assert.ok(!strings.fuzzyContains("hello world", "q"));
    assert.ok(strings.fuzzyContains("hello world", "hw"));
    assert.ok(strings.fuzzyContains("hello world", "horl"));
    assert.ok(strings.fuzzyContains("hello world", "d"));
    assert.ok(!strings.fuzzyContains("hello world", "wh"));
    assert.ok(!strings.fuzzyContains("d", "dd"));
  });
  test("startsWithUTF8BOM", () => {
    assert(strings.startsWithUTF8BOM(strings.UTF8_BOM_CHARACTER));
    assert(strings.startsWithUTF8BOM(strings.UTF8_BOM_CHARACTER + "a"));
    assert(strings.startsWithUTF8BOM(strings.UTF8_BOM_CHARACTER + "aaaaaaaaaa"));
    assert(!strings.startsWithUTF8BOM(" " + strings.UTF8_BOM_CHARACTER));
    assert(!strings.startsWithUTF8BOM("foo"));
    assert(!strings.startsWithUTF8BOM(""));
  });
  test("stripUTF8BOM", () => {
    assert.strictEqual(strings.stripUTF8BOM(strings.UTF8_BOM_CHARACTER), "");
    assert.strictEqual(strings.stripUTF8BOM(strings.UTF8_BOM_CHARACTER + "foobar"), "foobar");
    assert.strictEqual(strings.stripUTF8BOM("foobar" + strings.UTF8_BOM_CHARACTER), "foobar" + strings.UTF8_BOM_CHARACTER);
    assert.strictEqual(strings.stripUTF8BOM("abc"), "abc");
    assert.strictEqual(strings.stripUTF8BOM(""), "");
  });
  test("containsUppercaseCharacter", () => {
    [
      [null, false],
      ["", false],
      ["foo", false],
      ["f\xF6\xF6", false],
      ["\u0646\u0627\u0643", false],
      ["\u05DE\u05D1\u05D5\u05E1\u05E1\u05EA", false],
      ["\u{1F600}", false],
      ["(#@()*&%()@*#&09827340982374}{:\">?></'\\~`", false],
      ["Foo", true],
      ["FOO", true],
      ["F\xF6\xD6", true],
      ["F\xF6\xD6", true],
      ["\\Foo", true]
    ].forEach(([str, result]) => {
      assert.strictEqual(strings.containsUppercaseCharacter(str), result, `Wrong result for ${str}`);
    });
  });
  test("containsUppercaseCharacter (ignoreEscapedChars)", () => {
    [
      ["\\Woo", false],
      ["f\\S\\S", false],
      ["foo", false],
      ["Foo", true]
    ].forEach(([str, result]) => {
      assert.strictEqual(strings.containsUppercaseCharacter(str, true), result, `Wrong result for ${str}`);
    });
  });
  test("uppercaseFirstLetter", () => {
    [
      ["", ""],
      ["foo", "Foo"],
      ["f", "F"],
      ["123", "123"],
      [".a", ".a"]
    ].forEach(([inStr, result]) => {
      assert.strictEqual(strings.uppercaseFirstLetter(inStr), result, `Wrong result for ${inStr}`);
    });
  });
  test("getNLines", () => {
    assert.strictEqual(strings.getNLines("", 5), "");
    assert.strictEqual(strings.getNLines("foo", 5), "foo");
    assert.strictEqual(strings.getNLines("foo\nbar", 5), "foo\nbar");
    assert.strictEqual(strings.getNLines("foo\nbar", 2), "foo\nbar");
    assert.strictEqual(strings.getNLines("foo\nbar", 1), "foo");
    assert.strictEqual(strings.getNLines("foo\nbar"), "foo");
    assert.strictEqual(strings.getNLines("foo\nbar\nsomething", 2), "foo\nbar");
    assert.strictEqual(strings.getNLines("foo", 0), "");
  });
  test("getGraphemeBreakType", () => {
    assert.strictEqual(strings.getGraphemeBreakType(3009), strings.GraphemeBreakType.SpacingMark);
  });
  test("truncate", () => {
    assert.strictEqual("hello world", strings.truncate("hello world", 100));
    assert.strictEqual("hello\u2026", strings.truncate("hello world", 5));
  });
  test("truncateMiddle", () => {
    assert.strictEqual("hello world", strings.truncateMiddle("hello world", 100));
    assert.strictEqual("he\u2026ld", strings.truncateMiddle("hello world", 5));
  });
  test("replaceAsync", async () => {
    let i = 0;
    assert.strictEqual(await strings.replaceAsync("abcabcabcabc", /b(.)/g, async (match, after) => {
      assert.strictEqual(match, "bc");
      assert.strictEqual(after, "c");
      return `${i++}${after}`;
    }), "a0ca1ca2ca3c");
  });
  test("removeAnsiEscapeCodes", () => {
    const CSI = "\x1B[";
    const sequences = [
      // Base cases from https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Functions-using-CSI-_-ordered-by-the-final-character_s_
      `${CSI}42@`,
      `${CSI}42 @`,
      `${CSI}42A`,
      `${CSI}42 A`,
      `${CSI}42B`,
      `${CSI}42C`,
      `${CSI}42D`,
      `${CSI}42E`,
      `${CSI}42F`,
      `${CSI}42G`,
      `${CSI}42;42H`,
      `${CSI}42I`,
      `${CSI}42J`,
      `${CSI}?42J`,
      `${CSI}42K`,
      `${CSI}?42K`,
      `${CSI}42L`,
      `${CSI}42M`,
      `${CSI}42P`,
      `${CSI}#P`,
      `${CSI}3#P`,
      `${CSI}#Q`,
      `${CSI}3#Q`,
      `${CSI}#R`,
      `${CSI}42S`,
      `${CSI}?1;2;3S`,
      `${CSI}42T`,
      `${CSI}42;42;42;42;42T`,
      `${CSI}>3T`,
      `${CSI}42X`,
      `${CSI}42Z`,
      `${CSI}42^`,
      `${CSI}42\``,
      `${CSI}42a`,
      `${CSI}42b`,
      `${CSI}42c`,
      `${CSI}=42c`,
      `${CSI}>42c`,
      `${CSI}42d`,
      `${CSI}42e`,
      `${CSI}42;42f`,
      `${CSI}42g`,
      `${CSI}3h`,
      `${CSI}?3h`,
      `${CSI}42i`,
      `${CSI}?42i`,
      `${CSI}3l`,
      `${CSI}?3l`,
      `${CSI}3m`,
      `${CSI}>0;0m`,
      `${CSI}>0m`,
      `${CSI}?0m`,
      `${CSI}42n`,
      `${CSI}>42n`,
      `${CSI}?42n`,
      `${CSI}>42p`,
      `${CSI}!p`,
      `${CSI}0;0"p`,
      `${CSI}42$p`,
      `${CSI}?42$p`,
      `${CSI}#p`,
      `${CSI}3#p`,
      `${CSI}>42q`,
      `${CSI}42q`,
      `${CSI}42 q`,
      `${CSI}42"q`,
      `${CSI}#q`,
      `${CSI}42;42r`,
      `${CSI}?3r`,
      `${CSI}0;0;0;0;3$r`,
      `${CSI}s`,
      `${CSI}0;0s`,
      `${CSI}>42s`,
      `${CSI}?3s`,
      `${CSI}42;42;42t`,
      `${CSI}>3t`,
      `${CSI}42 t`,
      `${CSI}0;0;0;0;3$t`,
      `${CSI}u`,
      `${CSI}42 u`,
      `${CSI}0;0;0;0;0;0;0;0$v`,
      `${CSI}42$w`,
      `${CSI}0;0;0;0'w`,
      `${CSI}42x`,
      `${CSI}42*x`,
      `${CSI}0;0;0;0;0$x`,
      `${CSI}42#y`,
      `${CSI}0;0;0;0;0;0*y`,
      `${CSI}42;0'z`,
      `${CSI}0;1;2;4$z`,
      `${CSI}3'{`,
      `${CSI}#{`,
      `${CSI}3#{`,
      `${CSI}0;0;0;0\${`,
      `${CSI}0;0;0;0#|`,
      `${CSI}42$|`,
      `${CSI}42'|`,
      `${CSI}42*|`,
      `${CSI}#}`,
      `${CSI}42'}`,
      `${CSI}42$}`,
      `${CSI}42'~`,
      `${CSI}42$~`,
      // Common SGR cases:
      `${CSI}1;31m`,
      // multiple attrs
      `${CSI}105m`,
      // bright background
      `${CSI}48:5:128m`,
      // 256 indexed color
      `${CSI}48;5;128m`,
      // 256 indexed color alt
      `${CSI}38:2:0:255:255:255m`,
      // truecolor
      `${CSI}38;2;255;255;255m`,
      // truecolor alt
      // Custom sequences:
      "\x1B]633;SetMark;\x07",
      "\x1B]633;P;Cwd=/foo\x07"
    ];
    for (const sequence of sequences) {
      assert.strictEqual(strings.removeAnsiEscapeCodes(`hello${sequence}world`), "helloworld", `expect to remove ${JSON.stringify(sequence)}`);
    }
    for (const sequence of sequences) {
      assert.deepStrictEqual(
        [...strings.forAnsiStringParts(`hello${sequence}world`)],
        [{ isCode: false, str: "hello" }, { isCode: true, str: sequence }, { isCode: false, str: "world" }],
        `expect to forAnsiStringParts ${JSON.stringify(sequence)}`
      );
    }
    assert.strictEqual(
      strings.removeAnsiEscapeCodes(`localhost:\x1B[31m1234`),
      "localhost:1234"
    );
  });
  test("removeAnsiEscapeCodesFromPrompt", () => {
    assert.strictEqual(strings.removeAnsiEscapeCodesFromPrompt("\x1B[31m$ \x1B[0m"), "$ ");
    assert.strictEqual(strings.removeAnsiEscapeCodesFromPrompt("\n\\[\x1B[01;34m\\]\\w\\[\x1B[00m\\]\n\\[\x1B[1;32m\\]> \\[\x1B[0m\\]"), "\n\\w\n> ");
  });
  test("count", () => {
    assert.strictEqual(strings.count("hello world", "o"), 2);
    assert.strictEqual(strings.count("hello world", "l"), 3);
    assert.strictEqual(strings.count("hello world", "z"), 0);
    assert.strictEqual(strings.count("hello world", "hello"), 1);
    assert.strictEqual(strings.count("hello world", "world"), 1);
    assert.strictEqual(strings.count("hello world", "hello world"), 1);
    assert.strictEqual(strings.count("hello world", "foo"), 0);
  });
  test("containsAmbiguousCharacter", () => {
    assert.strictEqual(strings.AmbiguousCharacters.getInstance(/* @__PURE__ */ new Set()).containsAmbiguousCharacter("abcd"), false);
    assert.strictEqual(strings.AmbiguousCharacters.getInstance(/* @__PURE__ */ new Set()).containsAmbiguousCharacter("\xFC\xE5"), false);
    assert.strictEqual(strings.AmbiguousCharacters.getInstance(/* @__PURE__ */ new Set()).containsAmbiguousCharacter("(*&^)"), false);
    assert.strictEqual(strings.AmbiguousCharacters.getInstance(/* @__PURE__ */ new Set()).containsAmbiguousCharacter("\u03BF"), true);
    assert.strictEqual(strings.AmbiguousCharacters.getInstance(/* @__PURE__ */ new Set()).containsAmbiguousCharacter("ab\u0261c"), true);
  });
  test("containsInvisibleCharacter", () => {
    assert.strictEqual(strings.InvisibleCharacters.containsInvisibleCharacter("abcd"), false);
    assert.strictEqual(strings.InvisibleCharacters.containsInvisibleCharacter(" "), true);
    assert.strictEqual(strings.InvisibleCharacters.containsInvisibleCharacter("a\u{E004E}b"), true);
    assert.strictEqual(strings.InvisibleCharacters.containsInvisibleCharacter("a\u{E015A}\vb"), true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
test("htmlAttributeEncodeValue", () => {
  assert.strictEqual(strings.htmlAttributeEncodeValue(""), "");
  assert.strictEqual(strings.htmlAttributeEncodeValue("abc"), "abc");
  assert.strictEqual(strings.htmlAttributeEncodeValue('<script>alert("Hello")</script>'), "&lt;script&gt;alert(&quot;Hello&quot;)&lt;/script&gt;");
  assert.strictEqual(strings.htmlAttributeEncodeValue("Hello & World"), "Hello &amp; World");
  assert.strictEqual(strings.htmlAttributeEncodeValue('"Hello"'), "&quot;Hello&quot;");
  assert.strictEqual(strings.htmlAttributeEncodeValue("'Hello'"), "&apos;Hello&apos;");
  assert.strictEqual(strings.htmlAttributeEncodeValue(`<>&'"`), "&lt;&gt;&amp;&apos;&quot;");
});
//# sourceMappingURL=strings.test.js.map
