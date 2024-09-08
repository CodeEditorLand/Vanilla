import { deepStrictEqual } from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  shrinkWorkspaceFolderCwdPairs
} from "../../browser/terminalActions.js";
function makeFakeFolder(name, uri) {
  return {
    name,
    uri,
    index: 0,
    toResource: () => uri
  };
}
function makePair(folder, cwd, isAbsolute) {
  return {
    folder,
    cwd: cwd ? cwd instanceof URI ? cwd : cwd.uri : folder.uri,
    isAbsolute: !!isAbsolute,
    isOverridden: !!cwd && cwd.toString() !== folder.uri.toString()
  };
}
suite("terminalActions", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const root = URI.file("/some-root");
  const a = makeFakeFolder("a", URI.joinPath(root, "a"));
  const b = makeFakeFolder("b", URI.joinPath(root, "b"));
  const c = makeFakeFolder("c", URI.joinPath(root, "c"));
  const d = makeFakeFolder("d", URI.joinPath(root, "d"));
  suite("shrinkWorkspaceFolderCwdPairs", () => {
    test("should return empty when given array is empty", () => {
      deepStrictEqual(shrinkWorkspaceFolderCwdPairs([]), []);
    });
    test("should return the only single pair when given argument is a single element array", () => {
      const pairs = [makePair(a)];
      deepStrictEqual(shrinkWorkspaceFolderCwdPairs(pairs), pairs);
    });
    test("should return all pairs when no repeated cwds", () => {
      const pairs = [makePair(a), makePair(b), makePair(c)];
      deepStrictEqual(shrinkWorkspaceFolderCwdPairs(pairs), pairs);
    });
    suite(
      "should select the pair that has the same URI when repeated cwds exist",
      () => {
        test("all repeated", () => {
          const pairA = makePair(a);
          const pairB = makePair(b, a);
          const pairC = makePair(c, a);
          deepStrictEqual(
            shrinkWorkspaceFolderCwdPairs([pairA, pairB, pairC]),
            [pairA]
          );
        });
        test("two repeated + one different", () => {
          const pairA = makePair(a);
          const pairB = makePair(b, a);
          const pairC = makePair(c);
          deepStrictEqual(
            shrinkWorkspaceFolderCwdPairs([pairA, pairB, pairC]),
            [pairA, pairC]
          );
        });
        test("two repeated + two repeated", () => {
          const pairA = makePair(a);
          const pairB = makePair(b, a);
          const pairC = makePair(c);
          const pairD = makePair(d, c);
          deepStrictEqual(
            shrinkWorkspaceFolderCwdPairs([
              pairA,
              pairB,
              pairC,
              pairD
            ]),
            [pairA, pairC]
          );
        });
        test("two repeated + two repeated (reverse order)", () => {
          const pairB = makePair(b, a);
          const pairA = makePair(a);
          const pairD = makePair(d, c);
          const pairC = makePair(c);
          deepStrictEqual(
            shrinkWorkspaceFolderCwdPairs([
              pairA,
              pairB,
              pairC,
              pairD
            ]),
            [pairA, pairC]
          );
        });
      }
    );
  });
});
