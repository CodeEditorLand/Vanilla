import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  computeLinks
} from "../../../common/languages/linkComputer.js";
class SimpleLinkComputerTarget {
  constructor(_lines) {
    this._lines = _lines;
  }
  getLineCount() {
    return this._lines.length;
  }
  getLineContent(lineNumber) {
    return this._lines[lineNumber - 1];
  }
}
function myComputeLinks(lines) {
  const target = new SimpleLinkComputerTarget(lines);
  return computeLinks(target);
}
function assertLink(text, extractedLink) {
  let startColumn = 0, endColumn = 0, chr, i = 0;
  for (i = 0; i < extractedLink.length; i++) {
    chr = extractedLink.charAt(i);
    if (chr !== " " && chr !== "	") {
      startColumn = i + 1;
      break;
    }
  }
  for (i = extractedLink.length - 1; i >= 0; i--) {
    chr = extractedLink.charAt(i);
    if (chr !== " " && chr !== "	") {
      endColumn = i + 2;
      break;
    }
  }
  const r = myComputeLinks([text]);
  assert.deepStrictEqual(r, [
    {
      range: {
        startLineNumber: 1,
        startColumn,
        endLineNumber: 1,
        endColumn
      },
      url: extractedLink.substring(startColumn - 1, endColumn - 1)
    }
  ]);
}
suite("Editor Modes - Link Computer", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Null model", () => {
    const r = computeLinks(null);
    assert.deepStrictEqual(r, []);
  });
  test("Parsing", () => {
    assertLink('x = "http://foo.bar";', "     http://foo.bar  ");
    assertLink("x = (http://foo.bar);", "     http://foo.bar  ");
    assertLink("x = [http://foo.bar];", "     http://foo.bar  ");
    assertLink("x = 'http://foo.bar';", "     http://foo.bar  ");
    assertLink("x =  http://foo.bar ;", "     http://foo.bar  ");
    assertLink("x = <http://foo.bar>;", "     http://foo.bar  ");
    assertLink("x = {http://foo.bar};", "     http://foo.bar  ");
    assertLink("(see http://foo.bar)", "     http://foo.bar  ");
    assertLink("[see http://foo.bar]", "     http://foo.bar  ");
    assertLink("{see http://foo.bar}", "     http://foo.bar  ");
    assertLink("<see http://foo.bar>", "     http://foo.bar  ");
    assertLink(
      "<url>http://mylink.com</url>",
      "     http://mylink.com      "
    );
    assertLink(
      "// Click here to learn more. https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409",
      "                             https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409"
    );
    assertLink(
      "// Click here to learn more. https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx",
      "                             https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx"
    );
    assertLink(
      "// https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js",
      "   https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js"
    );
    assertLink(
      "<!-- !!! Do not remove !!!   WebContentRef(link:https://go.microsoft.com/fwlink/?LinkId=166007, area:Admin, updated:2015, nextUpdate:2016, tags:SqlServer)   !!! Do not remove !!! -->",
      "                                                https://go.microsoft.com/fwlink/?LinkId=166007                                                                                        "
    );
    assertLink(
      "For instructions, see https://go.microsoft.com/fwlink/?LinkId=166007.</value>",
      "                      https://go.microsoft.com/fwlink/?LinkId=166007         "
    );
    assertLink(
      "For instructions, see https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx.</value>",
      "                      https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx         "
    );
    assertLink(
      'x = "https://en.wikipedia.org/wiki/Z\xFCrich";',
      "     https://en.wikipedia.org/wiki/Z\xFCrich  "
    );
    assertLink(
      "\u8ACB\u53C3\u95B1 http://go.microsoft.com/fwlink/?LinkId=761051\u3002",
      "    http://go.microsoft.com/fwlink/?LinkId=761051 "
    );
    assertLink(
      "\uFF08\u8ACB\u53C3\u95B1 http://go.microsoft.com/fwlink/?LinkId=761051\uFF09",
      "     http://go.microsoft.com/fwlink/?LinkId=761051 "
    );
    assertLink('x = "file:///foo.bar";', "     file:///foo.bar  ");
    assertLink('x = "file://c:/foo.bar";', "     file://c:/foo.bar  ");
    assertLink(
      'x = "file://shares/foo.bar";',
      "     file://shares/foo.bar  "
    );
    assertLink(
      'x = "file://sh\xE4res/foo.bar";',
      "     file://sh\xE4res/foo.bar  "
    );
    assertLink(
      "Some text, then http://www.bing.com.",
      "                http://www.bing.com "
    );
    assertLink(
      "let url = `http://***/_api/web/lists/GetByTitle('Teambuildingaanvragen')/items`;",
      "           http://***/_api/web/lists/GetByTitle('Teambuildingaanvragen')/items  "
    );
  });
  test("issue #7855", () => {
    assertLink(
      "7. At this point, ServiceMain has been called.  There is no functionality presently in ServiceMain, but you can consult the [MSDN documentation](https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx) to add functionality as desired!",
      "                                                                                                                                                 https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx                                  "
    );
  });
  test('issue #62278: "Ctrl + click to follow link" for IPv6 URLs', () => {
    assertLink(
      'let x = "http://[::1]:5000/connect/token"',
      "         http://[::1]:5000/connect/token  "
    );
  });
  test("issue #70254: bold links dont open in markdown file using editor mode with ctrl + click", () => {
    assertLink(
      "2. Navigate to **https://portal.azure.com**",
      "                 https://portal.azure.com  "
    );
  });
  test("issue #86358: URL wrong recognition pattern", () => {
    assertLink(
      "POST|https://portal.azure.com|2019-12-05|",
      "     https://portal.azure.com            "
    );
  });
  test("issue #67022: Space as end of hyperlink isn't always good idea", () => {
    assertLink(
      "aa  https://foo.bar/[this is foo site]  aa",
      "    https://foo.bar/[this is foo site]    "
    );
  });
  test("issue #100353: Link detection stops at \uFF06(double-byte)", () => {
    assertLink(
      "aa  http://tree-mark.chips.jp/\u30EC\u30FC\u30BA\u30F3\uFF06\u30D9\u30EA\u30FC\u30DF\u30C3\u30AF\u30B9  aa",
      "    http://tree-mark.chips.jp/\u30EC\u30FC\u30BA\u30F3\uFF06\u30D9\u30EA\u30FC\u30DF\u30C3\u30AF\u30B9    "
    );
  });
  test("issue #121438: Link detection stops at\u3010...\u3011", () => {
    assertLink(
      "aa  https://zh.wikipedia.org/wiki/\u3010\u6211\u63A8\u7684\u5B69\u5B50\u3011 aa",
      "    https://zh.wikipedia.org/wiki/\u3010\u6211\u63A8\u7684\u5B69\u5B50\u3011   "
    );
  });
  test("issue #121438: Link detection stops at\u300A...\u300B", () => {
    assertLink(
      "aa  https://zh.wikipedia.org/wiki/\u300A\u65B0\u9752\u5E74\u300B\u7F16\u8F91\u90E8\u65E7\u5740 aa",
      "    https://zh.wikipedia.org/wiki/\u300A\u65B0\u9752\u5E74\u300B\u7F16\u8F91\u90E8\u65E7\u5740   "
    );
  });
  test("issue #121438: Link detection stops at \u201C...\u201D", () => {
    assertLink(
      "aa  https://zh.wikipedia.org/wiki/\u201C\u5E38\u51EF\u7533\u201D\u8BEF\u8BD1\u4E8B\u4EF6 aa",
      "    https://zh.wikipedia.org/wiki/\u201C\u5E38\u51EF\u7533\u201D\u8BEF\u8BD1\u4E8B\u4EF6   "
    );
  });
  test("issue #150905: Colon after bare hyperlink is treated as its part", () => {
    assertLink(
      "https://site.web/page.html: blah blah blah",
      "https://site.web/page.html                "
    );
  });
  test("issue #156875: Links include quotes ", () => {
    assertLink(
      `"This file has been converted from https://github.com/jeff-hykin/better-c-syntax/blob/master/autogenerated/c.tmLanguage.json",`,
      `                                   https://github.com/jeff-hykin/better-c-syntax/blob/master/autogenerated/c.tmLanguage.json  `
    );
  });
});
