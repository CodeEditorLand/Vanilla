var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as path from "../../common/path.js";
import { isWeb, isWindows } from "../../common/platform.js";
import * as process from "../../common/process.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Paths (Node Implementation)", () => {
  const __filename = "path.test.js";
  ensureNoDisposablesAreLeakedInTestSuite();
  test("join", () => {
    const failures = [];
    const backslashRE = /\\/g;
    const joinTests = [
      [
        [path.posix.join, path.win32.join],
        // arguments                     result
        [
          [[".", "x/b", "..", "/b/c.js"], "x/b/c.js"],
          [[], "."],
          [["/.", "x/b", "..", "/b/c.js"], "/x/b/c.js"],
          [["/foo", "../../../bar"], "/bar"],
          [["foo", "../../../bar"], "../../bar"],
          [["foo/", "../../../bar"], "../../bar"],
          [["foo/x", "../../../bar"], "../bar"],
          [["foo/x", "./bar"], "foo/x/bar"],
          [["foo/x/", "./bar"], "foo/x/bar"],
          [["foo/x/", ".", "bar"], "foo/x/bar"],
          [["./"], "./"],
          [[".", "./"], "./"],
          [[".", ".", "."], "."],
          [[".", "./", "."], "."],
          [[".", "/./", "."], "."],
          [[".", "/////./", "."], "."],
          [["."], "."],
          [["", "."], "."],
          [["", "foo"], "foo"],
          [["foo", "/bar"], "foo/bar"],
          [["", "/foo"], "/foo"],
          [["", "", "/foo"], "/foo"],
          [["", "", "foo"], "foo"],
          [["foo", ""], "foo"],
          [["foo/", ""], "foo/"],
          [["foo", "", "/bar"], "foo/bar"],
          [["./", "..", "/foo"], "../foo"],
          [["./", "..", "..", "/foo"], "../../foo"],
          [[".", "..", "..", "/foo"], "../../foo"],
          [["", "..", "..", "/foo"], "../../foo"],
          [["/"], "/"],
          [["/", "."], "/"],
          [["/", ".."], "/"],
          [["/", "..", ".."], "/"],
          [[""], "."],
          [["", ""], "."],
          [[" /foo"], " /foo"],
          [[" ", "foo"], " /foo"],
          [[" ", "."], " "],
          [[" ", "/"], " /"],
          [[" ", ""], " "],
          [["/", "foo"], "/foo"],
          [["/", "/foo"], "/foo"],
          [["/", "//foo"], "/foo"],
          [["/", "", "/foo"], "/foo"],
          [["", "/", "foo"], "/foo"],
          [["", "/", "/foo"], "/foo"]
        ]
      ]
    ];
    joinTests.push([
      path.win32.join,
      joinTests[0][1].slice(0).concat(
        [
          // arguments                     result
          // UNC path expected
          [["//foo/bar"], "\\\\foo\\bar\\"],
          [["\\/foo/bar"], "\\\\foo\\bar\\"],
          [["\\\\foo/bar"], "\\\\foo\\bar\\"],
          // UNC path expected - server and share separate
          [["//foo", "bar"], "\\\\foo\\bar\\"],
          [["//foo/", "bar"], "\\\\foo\\bar\\"],
          [["//foo", "/bar"], "\\\\foo\\bar\\"],
          // UNC path expected - questionable
          [["//foo", "", "bar"], "\\\\foo\\bar\\"],
          [["//foo/", "", "bar"], "\\\\foo\\bar\\"],
          [["//foo/", "", "/bar"], "\\\\foo\\bar\\"],
          // UNC path expected - even more questionable
          [["", "//foo", "bar"], "\\\\foo\\bar\\"],
          [["", "//foo/", "bar"], "\\\\foo\\bar\\"],
          [["", "//foo/", "/bar"], "\\\\foo\\bar\\"],
          // No UNC path expected (no double slash in first component)
          [["\\", "foo/bar"], "\\foo\\bar"],
          [["\\", "/foo/bar"], "\\foo\\bar"],
          [["", "/", "/foo/bar"], "\\foo\\bar"],
          // No UNC path expected (no non-slashes in first component -
          // questionable)
          [["//", "foo/bar"], "\\foo\\bar"],
          [["//", "/foo/bar"], "\\foo\\bar"],
          [["\\\\", "/", "/foo/bar"], "\\foo\\bar"],
          [["//"], "\\"],
          // No UNC path expected (share name missing - questionable).
          [["//foo"], "\\foo"],
          [["//foo/"], "\\foo\\"],
          [["//foo", "/"], "\\foo\\"],
          [["//foo", "", "/"], "\\foo\\"],
          // No UNC path expected (too many leading slashes - questionable)
          [["///foo/bar"], "\\foo\\bar"],
          [["////foo", "bar"], "\\foo\\bar"],
          [["\\\\\\/foo/bar"], "\\foo\\bar"],
          // Drive-relative vs drive-absolute paths. This merely describes the
          // status quo, rather than being obviously right
          [["c:"], "c:."],
          [["c:."], "c:."],
          [["c:", ""], "c:."],
          [["", "c:"], "c:."],
          [["c:.", "/"], "c:.\\"],
          [["c:.", "file"], "c:file"],
          [["c:", "/"], "c:\\"],
          [["c:", "file"], "c:\\file"]
        ]
      )
    ]);
    joinTests.forEach((test2) => {
      if (!Array.isArray(test2[0])) {
        test2[0] = [test2[0]];
      }
      test2[0].forEach((join) => {
        test2[1].forEach((test3) => {
          const actual = join.apply(null, test3[0]);
          const expected = test3[1];
          let actualAlt;
          let os;
          if (join === path.win32.join) {
            actualAlt = actual.replace(backslashRE, "/");
            os = "win32";
          } else {
            os = "posix";
          }
          const message = `path.${os}.join(${test3[0].map(JSON.stringify).join(",")})
  expect=${JSON.stringify(expected)}
  actual=${JSON.stringify(actual)}`;
          if (actual !== expected && actualAlt !== expected) {
            failures.push(`
${message}`);
          }
        });
      });
    });
    assert.strictEqual(failures.length, 0, failures.join(""));
  });
  test("dirname", () => {
    assert.strictEqual(path.posix.dirname("/a/b/"), "/a");
    assert.strictEqual(path.posix.dirname("/a/b"), "/a");
    assert.strictEqual(path.posix.dirname("/a"), "/");
    assert.strictEqual(path.posix.dirname(""), ".");
    assert.strictEqual(path.posix.dirname("/"), "/");
    assert.strictEqual(path.posix.dirname("////"), "/");
    assert.strictEqual(path.posix.dirname("//a"), "//");
    assert.strictEqual(path.posix.dirname("foo"), ".");
    assert.strictEqual(path.win32.dirname("c:\\"), "c:\\");
    assert.strictEqual(path.win32.dirname("c:\\foo"), "c:\\");
    assert.strictEqual(path.win32.dirname("c:\\foo\\"), "c:\\");
    assert.strictEqual(path.win32.dirname("c:\\foo\\bar"), "c:\\foo");
    assert.strictEqual(path.win32.dirname("c:\\foo\\bar\\"), "c:\\foo");
    assert.strictEqual(path.win32.dirname("c:\\foo\\bar\\baz"), "c:\\foo\\bar");
    assert.strictEqual(path.win32.dirname("\\"), "\\");
    assert.strictEqual(path.win32.dirname("\\foo"), "\\");
    assert.strictEqual(path.win32.dirname("\\foo\\"), "\\");
    assert.strictEqual(path.win32.dirname("\\foo\\bar"), "\\foo");
    assert.strictEqual(path.win32.dirname("\\foo\\bar\\"), "\\foo");
    assert.strictEqual(path.win32.dirname("\\foo\\bar\\baz"), "\\foo\\bar");
    assert.strictEqual(path.win32.dirname("c:"), "c:");
    assert.strictEqual(path.win32.dirname("c:foo"), "c:");
    assert.strictEqual(path.win32.dirname("c:foo\\"), "c:");
    assert.strictEqual(path.win32.dirname("c:foo\\bar"), "c:foo");
    assert.strictEqual(path.win32.dirname("c:foo\\bar\\"), "c:foo");
    assert.strictEqual(path.win32.dirname("c:foo\\bar\\baz"), "c:foo\\bar");
    assert.strictEqual(path.win32.dirname("file:stream"), ".");
    assert.strictEqual(path.win32.dirname("dir\\file:stream"), "dir");
    assert.strictEqual(
      path.win32.dirname("\\\\unc\\share"),
      "\\\\unc\\share"
    );
    assert.strictEqual(
      path.win32.dirname("\\\\unc\\share\\foo"),
      "\\\\unc\\share\\"
    );
    assert.strictEqual(
      path.win32.dirname("\\\\unc\\share\\foo\\"),
      "\\\\unc\\share\\"
    );
    assert.strictEqual(
      path.win32.dirname("\\\\unc\\share\\foo\\bar"),
      "\\\\unc\\share\\foo"
    );
    assert.strictEqual(
      path.win32.dirname("\\\\unc\\share\\foo\\bar\\"),
      "\\\\unc\\share\\foo"
    );
    assert.strictEqual(
      path.win32.dirname("\\\\unc\\share\\foo\\bar\\baz"),
      "\\\\unc\\share\\foo\\bar"
    );
    assert.strictEqual(path.win32.dirname("/a/b/"), "/a");
    assert.strictEqual(path.win32.dirname("/a/b"), "/a");
    assert.strictEqual(path.win32.dirname("/a"), "/");
    assert.strictEqual(path.win32.dirname(""), ".");
    assert.strictEqual(path.win32.dirname("/"), "/");
    assert.strictEqual(path.win32.dirname("////"), "/");
    assert.strictEqual(path.win32.dirname("foo"), ".");
    function assertDirname(p, expected, win = false) {
      const actual = win ? path.win32.dirname(p) : path.posix.dirname(p);
      if (actual !== expected) {
        assert.fail(`${p}: expected: ${expected}, ours: ${actual}`);
      }
    }
    __name(assertDirname, "assertDirname");
    assertDirname("foo/bar", "foo");
    assertDirname("foo\\bar", "foo", true);
    assertDirname("/foo/bar", "/foo");
    assertDirname("\\foo\\bar", "\\foo", true);
    assertDirname("/foo", "/");
    assertDirname("\\foo", "\\", true);
    assertDirname("/", "/");
    assertDirname("\\", "\\", true);
    assertDirname("foo", ".");
    assertDirname("f", ".");
    assertDirname("f/", ".");
    assertDirname("/folder/", "/");
    assertDirname("c:\\some\\file.txt", "c:\\some", true);
    assertDirname("c:\\some", "c:\\", true);
    assertDirname("c:\\", "c:\\", true);
    assertDirname("c:", "c:", true);
    assertDirname("\\\\server\\share\\some\\path", "\\\\server\\share\\some", true);
    assertDirname("\\\\server\\share\\some", "\\\\server\\share\\", true);
    assertDirname("\\\\server\\share\\", "\\\\server\\share\\", true);
  });
  test("extname", () => {
    const failures = [];
    const slashRE = /\//g;
    [
      [__filename, ".js"],
      ["", ""],
      ["/path/to/file", ""],
      ["/path/to/file.ext", ".ext"],
      ["/path.to/file.ext", ".ext"],
      ["/path.to/file", ""],
      ["/path.to/.file", ""],
      ["/path.to/.file.ext", ".ext"],
      ["/path/to/f.ext", ".ext"],
      ["/path/to/..ext", ".ext"],
      ["/path/to/..", ""],
      ["file", ""],
      ["file.ext", ".ext"],
      [".file", ""],
      [".file.ext", ".ext"],
      ["/file", ""],
      ["/file.ext", ".ext"],
      ["/.file", ""],
      ["/.file.ext", ".ext"],
      [".path/file.ext", ".ext"],
      ["file.ext.ext", ".ext"],
      ["file.", "."],
      [".", ""],
      ["./", ""],
      [".file.ext", ".ext"],
      [".file", ""],
      [".file.", "."],
      [".file..", "."],
      ["..", ""],
      ["../", ""],
      ["..file.ext", ".ext"],
      ["..file", ".file"],
      ["..file.", "."],
      ["..file..", "."],
      ["...", "."],
      ["...ext", ".ext"],
      ["....", "."],
      ["file.ext/", ".ext"],
      ["file.ext//", ".ext"],
      ["file/", ""],
      ["file//", ""],
      ["file./", "."],
      ["file.//", "."]
    ].forEach((test2) => {
      const expected = test2[1];
      [path.posix.extname, path.win32.extname].forEach((extname) => {
        let input = test2[0];
        let os;
        if (extname === path.win32.extname) {
          input = input.replace(slashRE, "\\");
          os = "win32";
        } else {
          os = "posix";
        }
        const actual = extname(input);
        const message = `path.${os}.extname(${JSON.stringify(input)})
  expect=${JSON.stringify(expected)}
  actual=${JSON.stringify(actual)}`;
        if (actual !== expected) {
          failures.push(`
${message}`);
        }
      });
      {
        const input = `C:${test2[0].replace(slashRE, "\\")}`;
        const actual = path.win32.extname(input);
        const message = `path.win32.extname(${JSON.stringify(input)})
  expect=${JSON.stringify(expected)}
  actual=${JSON.stringify(actual)}`;
        if (actual !== expected) {
          failures.push(`
${message}`);
        }
      }
    });
    assert.strictEqual(failures.length, 0, failures.join(""));
    assert.strictEqual(path.win32.extname(".\\"), "");
    assert.strictEqual(path.win32.extname("..\\"), "");
    assert.strictEqual(path.win32.extname("file.ext\\"), ".ext");
    assert.strictEqual(path.win32.extname("file.ext\\\\"), ".ext");
    assert.strictEqual(path.win32.extname("file\\"), "");
    assert.strictEqual(path.win32.extname("file\\\\"), "");
    assert.strictEqual(path.win32.extname("file.\\"), ".");
    assert.strictEqual(path.win32.extname("file.\\\\"), ".");
    assert.strictEqual(path.posix.extname(".\\"), "");
    assert.strictEqual(path.posix.extname("..\\"), ".\\");
    assert.strictEqual(path.posix.extname("file.ext\\"), ".ext\\");
    assert.strictEqual(path.posix.extname("file.ext\\\\"), ".ext\\\\");
    assert.strictEqual(path.posix.extname("file\\"), "");
    assert.strictEqual(path.posix.extname("file\\\\"), "");
    assert.strictEqual(path.posix.extname("file.\\"), ".\\");
    assert.strictEqual(path.posix.extname("file.\\\\"), ".\\\\");
    assert.strictEqual(path.extname("far.boo"), ".boo");
    assert.strictEqual(path.extname("far.b"), ".b");
    assert.strictEqual(path.extname("far."), ".");
    assert.strictEqual(path.extname("far.boo/boo.far"), ".far");
    assert.strictEqual(path.extname("far.boo/boo"), "");
  });
  test("resolve", () => {
    const failures = [];
    const slashRE = /\//g;
    const backslashRE = /\\/g;
    const resolveTests = [
      [
        path.win32.resolve,
        // arguments                               result
        [
          [["c:/blah\\blah", "d:/games", "c:../a"], "c:\\blah\\a"],
          [["c:/ignore", "d:\\a/b\\c/d", "\\e.exe"], "d:\\e.exe"],
          [["c:/ignore", "c:/some/file"], "c:\\some\\file"],
          [["d:/ignore", "d:some/dir//"], "d:\\ignore\\some\\dir"],
          [["//server/share", "..", "relative\\"], "\\\\server\\share\\relative"],
          [["c:/", "//"], "c:\\"],
          [["c:/", "//dir"], "c:\\dir"],
          [["c:/", "//server/share"], "\\\\server\\share\\"],
          [["c:/", "//server//share"], "\\\\server\\share\\"],
          [["c:/", "///some//dir"], "c:\\some\\dir"],
          [
            ["C:\\foo\\tmp.3\\", "..\\tmp.3\\cycles\\root.js"],
            "C:\\foo\\tmp.3\\cycles\\root.js"
          ]
        ]
      ],
      [
        path.posix.resolve,
        // arguments                    result
        [
          [["/var/lib", "../", "file/"], "/var/file"],
          [["/var/lib", "/../", "file/"], "/file"],
          [["/some/dir", ".", "/absolute/"], "/absolute"],
          [["/foo/tmp.3/", "../tmp.3/cycles/root.js"], "/foo/tmp.3/cycles/root.js"]
        ]
      ],
      [
        isWeb ? path.posix.resolve : path.resolve,
        // arguments						result
        [
          [["."], process.cwd()],
          [["a/b/c", "../../.."], process.cwd()]
        ]
      ]
    ];
    resolveTests.forEach((test2) => {
      const resolve = test2[0];
      test2[1].forEach((test3) => {
        const actual = resolve.apply(null, test3[0]);
        let actualAlt;
        const os = resolve === path.win32.resolve ? "win32" : "posix";
        if (resolve === path.win32.resolve && !isWindows) {
          actualAlt = actual.replace(backslashRE, "/");
        } else if (resolve !== path.win32.resolve && isWindows) {
          actualAlt = actual.replace(slashRE, "\\");
        }
        const expected = test3[1];
        const message = `path.${os}.resolve(${test3[0].map(JSON.stringify).join(",")})
  expect=${JSON.stringify(expected)}
  actual=${JSON.stringify(actual)}`;
        if (actual !== expected && actualAlt !== expected) {
          failures.push(`
${message}`);
        }
      });
    });
    assert.strictEqual(failures.length, 0, failures.join(""));
  });
  test("basename", () => {
    assert.strictEqual(path.basename(__filename), "path.test.js");
    assert.strictEqual(path.basename(__filename, ".js"), "path.test");
    assert.strictEqual(path.basename(".js", ".js"), "");
    assert.strictEqual(path.basename(""), "");
    assert.strictEqual(path.basename("/dir/basename.ext"), "basename.ext");
    assert.strictEqual(path.basename("/basename.ext"), "basename.ext");
    assert.strictEqual(path.basename("basename.ext"), "basename.ext");
    assert.strictEqual(path.basename("basename.ext/"), "basename.ext");
    assert.strictEqual(path.basename("basename.ext//"), "basename.ext");
    assert.strictEqual(path.basename("aaa/bbb", "/bbb"), "bbb");
    assert.strictEqual(path.basename("aaa/bbb", "a/bbb"), "bbb");
    assert.strictEqual(path.basename("aaa/bbb", "bbb"), "bbb");
    assert.strictEqual(path.basename("aaa/bbb//", "bbb"), "bbb");
    assert.strictEqual(path.basename("aaa/bbb", "bb"), "b");
    assert.strictEqual(path.basename("aaa/bbb", "b"), "bb");
    assert.strictEqual(path.basename("/aaa/bbb", "/bbb"), "bbb");
    assert.strictEqual(path.basename("/aaa/bbb", "a/bbb"), "bbb");
    assert.strictEqual(path.basename("/aaa/bbb", "bbb"), "bbb");
    assert.strictEqual(path.basename("/aaa/bbb//", "bbb"), "bbb");
    assert.strictEqual(path.basename("/aaa/bbb", "bb"), "b");
    assert.strictEqual(path.basename("/aaa/bbb", "b"), "bb");
    assert.strictEqual(path.basename("/aaa/bbb"), "bbb");
    assert.strictEqual(path.basename("/aaa/"), "aaa");
    assert.strictEqual(path.basename("/aaa/b"), "b");
    assert.strictEqual(path.basename("/a/b"), "b");
    assert.strictEqual(path.basename("//a"), "a");
    assert.strictEqual(path.basename("a", "a"), "");
    assert.strictEqual(path.win32.basename("\\dir\\basename.ext"), "basename.ext");
    assert.strictEqual(path.win32.basename("\\basename.ext"), "basename.ext");
    assert.strictEqual(path.win32.basename("basename.ext"), "basename.ext");
    assert.strictEqual(path.win32.basename("basename.ext\\"), "basename.ext");
    assert.strictEqual(path.win32.basename("basename.ext\\\\"), "basename.ext");
    assert.strictEqual(path.win32.basename("foo"), "foo");
    assert.strictEqual(path.win32.basename("aaa\\bbb", "\\bbb"), "bbb");
    assert.strictEqual(path.win32.basename("aaa\\bbb", "a\\bbb"), "bbb");
    assert.strictEqual(path.win32.basename("aaa\\bbb", "bbb"), "bbb");
    assert.strictEqual(path.win32.basename("aaa\\bbb\\\\\\\\", "bbb"), "bbb");
    assert.strictEqual(path.win32.basename("aaa\\bbb", "bb"), "b");
    assert.strictEqual(path.win32.basename("aaa\\bbb", "b"), "bb");
    assert.strictEqual(path.win32.basename("C:"), "");
    assert.strictEqual(path.win32.basename("C:."), ".");
    assert.strictEqual(path.win32.basename("C:\\"), "");
    assert.strictEqual(path.win32.basename("C:\\dir\\base.ext"), "base.ext");
    assert.strictEqual(path.win32.basename("C:\\basename.ext"), "basename.ext");
    assert.strictEqual(path.win32.basename("C:basename.ext"), "basename.ext");
    assert.strictEqual(path.win32.basename("C:basename.ext\\"), "basename.ext");
    assert.strictEqual(path.win32.basename("C:basename.ext\\\\"), "basename.ext");
    assert.strictEqual(path.win32.basename("C:foo"), "foo");
    assert.strictEqual(path.win32.basename("file:stream"), "file:stream");
    assert.strictEqual(path.win32.basename("a", "a"), "");
    assert.strictEqual(
      path.posix.basename("\\dir\\basename.ext"),
      "\\dir\\basename.ext"
    );
    assert.strictEqual(path.posix.basename("\\basename.ext"), "\\basename.ext");
    assert.strictEqual(path.posix.basename("basename.ext"), "basename.ext");
    assert.strictEqual(path.posix.basename("basename.ext\\"), "basename.ext\\");
    assert.strictEqual(path.posix.basename("basename.ext\\\\"), "basename.ext\\\\");
    assert.strictEqual(path.posix.basename("foo"), "foo");
    const controlCharFilename = `Icon${String.fromCharCode(13)}`;
    assert.strictEqual(
      path.posix.basename(`/a/b/${controlCharFilename}`),
      controlCharFilename
    );
    assert.strictEqual(path.basename("foo/bar"), "bar");
    assert.strictEqual(path.posix.basename("foo\\bar"), "foo\\bar");
    assert.strictEqual(path.win32.basename("foo\\bar"), "bar");
    assert.strictEqual(path.basename("/foo/bar"), "bar");
    assert.strictEqual(path.posix.basename("\\foo\\bar"), "\\foo\\bar");
    assert.strictEqual(path.win32.basename("\\foo\\bar"), "bar");
    assert.strictEqual(path.basename("./bar"), "bar");
    assert.strictEqual(path.posix.basename(".\\bar"), ".\\bar");
    assert.strictEqual(path.win32.basename(".\\bar"), "bar");
    assert.strictEqual(path.basename("/bar"), "bar");
    assert.strictEqual(path.posix.basename("\\bar"), "\\bar");
    assert.strictEqual(path.win32.basename("\\bar"), "bar");
    assert.strictEqual(path.basename("bar/"), "bar");
    assert.strictEqual(path.posix.basename("bar\\"), "bar\\");
    assert.strictEqual(path.win32.basename("bar\\"), "bar");
    assert.strictEqual(path.basename("bar"), "bar");
    assert.strictEqual(path.basename("////////"), "");
    assert.strictEqual(path.posix.basename("\\\\\\\\"), "\\\\\\\\");
    assert.strictEqual(path.win32.basename("\\\\\\\\"), "");
  });
  test("relative", () => {
    const failures = [];
    const relativeTests = [
      [
        path.win32.relative,
        // arguments                     result
        [
          ["c:/blah\\blah", "d:/games", "d:\\games"],
          ["c:/aaaa/bbbb", "c:/aaaa", ".."],
          ["c:/aaaa/bbbb", "c:/cccc", "..\\..\\cccc"],
          ["c:/aaaa/bbbb", "c:/aaaa/bbbb", ""],
          ["c:/aaaa/bbbb", "c:/aaaa/cccc", "..\\cccc"],
          ["c:/aaaa/", "c:/aaaa/cccc", "cccc"],
          ["c:/", "c:\\aaaa\\bbbb", "aaaa\\bbbb"],
          ["c:/aaaa/bbbb", "d:\\", "d:\\"],
          ["c:/AaAa/bbbb", "c:/aaaa/bbbb", ""],
          ["c:/aaaaa/", "c:/aaaa/cccc", "..\\aaaa\\cccc"],
          ["C:\\foo\\bar\\baz\\quux", "C:\\", "..\\..\\..\\.."],
          ["C:\\foo\\test", "C:\\foo\\test\\bar\\package.json", "bar\\package.json"],
          ["C:\\foo\\bar\\baz-quux", "C:\\foo\\bar\\baz", "..\\baz"],
          ["C:\\foo\\bar\\baz", "C:\\foo\\bar\\baz-quux", "..\\baz-quux"],
          ["\\\\foo\\bar", "\\\\foo\\bar\\baz", "baz"],
          ["\\\\foo\\bar\\baz", "\\\\foo\\bar", ".."],
          ["\\\\foo\\bar\\baz-quux", "\\\\foo\\bar\\baz", "..\\baz"],
          ["\\\\foo\\bar\\baz", "\\\\foo\\bar\\baz-quux", "..\\baz-quux"],
          ["C:\\baz-quux", "C:\\baz", "..\\baz"],
          ["C:\\baz", "C:\\baz-quux", "..\\baz-quux"],
          ["\\\\foo\\baz-quux", "\\\\foo\\baz", "..\\baz"],
          ["\\\\foo\\baz", "\\\\foo\\baz-quux", "..\\baz-quux"],
          ["C:\\baz", "\\\\foo\\bar\\baz", "\\\\foo\\bar\\baz"],
          ["\\\\foo\\bar\\baz", "C:\\baz", "C:\\baz"]
        ]
      ],
      [
        path.posix.relative,
        // arguments          result
        [
          ["/var/lib", "/var", ".."],
          ["/var/lib", "/bin", "../../bin"],
          ["/var/lib", "/var/lib", ""],
          ["/var/lib", "/var/apache", "../apache"],
          ["/var/", "/var/lib", "lib"],
          ["/", "/var/lib", "var/lib"],
          ["/foo/test", "/foo/test/bar/package.json", "bar/package.json"],
          ["/Users/a/web/b/test/mails", "/Users/a/web/b", "../.."],
          ["/foo/bar/baz-quux", "/foo/bar/baz", "../baz"],
          ["/foo/bar/baz", "/foo/bar/baz-quux", "../baz-quux"],
          ["/baz-quux", "/baz", "../baz"],
          ["/baz", "/baz-quux", "../baz-quux"]
        ]
      ]
    ];
    relativeTests.forEach((test2) => {
      const relative = test2[0];
      test2[1].forEach((test3) => {
        const actual = relative(test3[0], test3[1]);
        const expected = test3[2];
        const os = relative === path.win32.relative ? "win32" : "posix";
        const message = `path.${os}.relative(${test3.slice(0, 2).map(JSON.stringify).join(",")})
  expect=${JSON.stringify(expected)}
  actual=${JSON.stringify(actual)}`;
        if (actual !== expected) {
          failures.push(`
${message}`);
        }
      });
    });
    assert.strictEqual(failures.length, 0, failures.join(""));
  });
  test("normalize", () => {
    assert.strictEqual(
      path.win32.normalize("./fixtures///b/../b/c.js"),
      "fixtures\\b\\c.js"
    );
    assert.strictEqual(path.win32.normalize("/foo/../../../bar"), "\\bar");
    assert.strictEqual(path.win32.normalize("a//b//../b"), "a\\b");
    assert.strictEqual(path.win32.normalize("a//b//./c"), "a\\b\\c");
    assert.strictEqual(path.win32.normalize("a//b//."), "a\\b");
    assert.strictEqual(
      path.win32.normalize("//server/share/dir/file.ext"),
      "\\\\server\\share\\dir\\file.ext"
    );
    assert.strictEqual(path.win32.normalize("/a/b/c/../../../x/y/z"), "\\x\\y\\z");
    assert.strictEqual(path.win32.normalize("C:"), "C:.");
    assert.strictEqual(path.win32.normalize("C:..\\abc"), "C:..\\abc");
    assert.strictEqual(
      path.win32.normalize("C:..\\..\\abc\\..\\def"),
      "C:..\\..\\def"
    );
    assert.strictEqual(path.win32.normalize("C:\\."), "C:\\");
    assert.strictEqual(path.win32.normalize("file:stream"), "file:stream");
    assert.strictEqual(path.win32.normalize("bar\\foo..\\..\\"), "bar\\");
    assert.strictEqual(path.win32.normalize("bar\\foo..\\.."), "bar");
    assert.strictEqual(path.win32.normalize("bar\\foo..\\..\\baz"), "bar\\baz");
    assert.strictEqual(path.win32.normalize("bar\\foo..\\"), "bar\\foo..\\");
    assert.strictEqual(path.win32.normalize("bar\\foo.."), "bar\\foo..");
    assert.strictEqual(
      path.win32.normalize("..\\foo..\\..\\..\\bar"),
      "..\\..\\bar"
    );
    assert.strictEqual(
      path.win32.normalize("..\\...\\..\\.\\...\\..\\..\\bar"),
      "..\\..\\bar"
    );
    assert.strictEqual(
      path.win32.normalize("../../../foo/../../../bar"),
      "..\\..\\..\\..\\..\\bar"
    );
    assert.strictEqual(
      path.win32.normalize("../../../foo/../../../bar/../../"),
      "..\\..\\..\\..\\..\\..\\"
    );
    assert.strictEqual(
      path.win32.normalize("../foobar/barfoo/foo/../../../bar/../../"),
      "..\\..\\"
    );
    assert.strictEqual(
      path.win32.normalize("../.../../foobar/../../../bar/../../baz"),
      "..\\..\\..\\..\\baz"
    );
    assert.strictEqual(path.win32.normalize("foo/bar\\baz"), "foo\\bar\\baz");
    assert.strictEqual(
      path.posix.normalize("./fixtures///b/../b/c.js"),
      "fixtures/b/c.js"
    );
    assert.strictEqual(path.posix.normalize("/foo/../../../bar"), "/bar");
    assert.strictEqual(path.posix.normalize("a//b//../b"), "a/b");
    assert.strictEqual(path.posix.normalize("a//b//./c"), "a/b/c");
    assert.strictEqual(path.posix.normalize("a//b//."), "a/b");
    assert.strictEqual(path.posix.normalize("/a/b/c/../../../x/y/z"), "/x/y/z");
    assert.strictEqual(path.posix.normalize("///..//./foo/.//bar"), "/foo/bar");
    assert.strictEqual(path.posix.normalize("bar/foo../../"), "bar/");
    assert.strictEqual(path.posix.normalize("bar/foo../.."), "bar");
    assert.strictEqual(path.posix.normalize("bar/foo../../baz"), "bar/baz");
    assert.strictEqual(path.posix.normalize("bar/foo../"), "bar/foo../");
    assert.strictEqual(path.posix.normalize("bar/foo.."), "bar/foo..");
    assert.strictEqual(path.posix.normalize("../foo../../../bar"), "../../bar");
    assert.strictEqual(
      path.posix.normalize("../.../.././.../../../bar"),
      "../../bar"
    );
    assert.strictEqual(
      path.posix.normalize("../../../foo/../../../bar"),
      "../../../../../bar"
    );
    assert.strictEqual(
      path.posix.normalize("../../../foo/../../../bar/../../"),
      "../../../../../../"
    );
    assert.strictEqual(
      path.posix.normalize("../foobar/barfoo/foo/../../../bar/../../"),
      "../../"
    );
    assert.strictEqual(
      path.posix.normalize("../.../../foobar/../../../bar/../../baz"),
      "../../../../baz"
    );
    assert.strictEqual(path.posix.normalize("foo/bar\\baz"), "foo/bar\\baz");
  });
  test("isAbsolute", () => {
    assert.strictEqual(path.win32.isAbsolute("/"), true);
    assert.strictEqual(path.win32.isAbsolute("//"), true);
    assert.strictEqual(path.win32.isAbsolute("//server"), true);
    assert.strictEqual(path.win32.isAbsolute("//server/file"), true);
    assert.strictEqual(path.win32.isAbsolute("\\\\server\\file"), true);
    assert.strictEqual(path.win32.isAbsolute("\\\\server"), true);
    assert.strictEqual(path.win32.isAbsolute("\\\\"), true);
    assert.strictEqual(path.win32.isAbsolute("c"), false);
    assert.strictEqual(path.win32.isAbsolute("c:"), false);
    assert.strictEqual(path.win32.isAbsolute("c:\\"), true);
    assert.strictEqual(path.win32.isAbsolute("c:/"), true);
    assert.strictEqual(path.win32.isAbsolute("c://"), true);
    assert.strictEqual(path.win32.isAbsolute("C:/Users/"), true);
    assert.strictEqual(path.win32.isAbsolute("C:\\Users\\"), true);
    assert.strictEqual(path.win32.isAbsolute("C:cwd/another"), false);
    assert.strictEqual(path.win32.isAbsolute("C:cwd\\another"), false);
    assert.strictEqual(path.win32.isAbsolute("directory/directory"), false);
    assert.strictEqual(path.win32.isAbsolute("directory\\directory"), false);
    assert.strictEqual(path.posix.isAbsolute("/home/foo"), true);
    assert.strictEqual(path.posix.isAbsolute("/home/foo/.."), true);
    assert.strictEqual(path.posix.isAbsolute("bar/"), false);
    assert.strictEqual(path.posix.isAbsolute("./baz"), false);
    [
      "C:/",
      "C:\\",
      "C:/foo",
      "C:\\foo",
      "z:/foo/bar.txt",
      "z:\\foo\\bar.txt",
      "\\\\localhost\\c$\\foo",
      "/",
      "/foo"
    ].forEach((absolutePath) => {
      assert.ok(path.win32.isAbsolute(absolutePath), absolutePath);
    });
    [
      "/",
      "/foo",
      "/foo/bar.txt"
    ].forEach((absolutePath) => {
      assert.ok(path.posix.isAbsolute(absolutePath), absolutePath);
    });
    [
      "",
      "foo",
      "foo/bar",
      "./foo",
      "http://foo.com/bar"
    ].forEach((nonAbsolutePath) => {
      assert.ok(!path.win32.isAbsolute(nonAbsolutePath), nonAbsolutePath);
    });
    [
      "",
      "foo",
      "foo/bar",
      "./foo",
      "http://foo.com/bar",
      "z:/foo/bar.txt"
    ].forEach((nonAbsolutePath) => {
      assert.ok(!path.posix.isAbsolute(nonAbsolutePath), nonAbsolutePath);
    });
  });
  test("path", () => {
    assert.strictEqual(path.win32.sep, "\\");
    assert.strictEqual(path.posix.sep, "/");
    assert.strictEqual(path.win32.delimiter, ";");
    assert.strictEqual(path.posix.delimiter, ":");
  });
});
//# sourceMappingURL=path.test.js.map
