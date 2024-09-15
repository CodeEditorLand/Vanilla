import { deepStrictEqual } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { chunkInput } from "../../common/terminalProcess.js";
suite("platform - terminalProcess", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("chunkInput", () => {
    test("single chunk", () => {
      deepStrictEqual(chunkInput("foo bar"), ["foo bar"]);
    });
    test("multi chunk", () => {
      deepStrictEqual(chunkInput("foo".repeat(50)), [
        "foofoofoofoofoofoofoofoofoofoofoofoofoofoofoofoofo",
        "ofoofoofoofoofoofoofoofoofoofoofoofoofoofoofoofoof",
        "oofoofoofoofoofoofoofoofoofoofoofoofoofoofoofoofoo"
      ]);
    });
    test("small data with escapes", () => {
      deepStrictEqual(chunkInput("foo \x1B[30mbar"), [
        "foo ",
        "\x1B[30mbar"
      ]);
    });
    test("large data with escapes", () => {
      deepStrictEqual(chunkInput("foofoofoofoo\x1B[30mbarbarbarbarbar\x1B[0m".repeat(3)), [
        "foofoofoofoo",
        "\x1B[30mbarbarbarbarbar",
        "\x1B[0mfoofoofoofoo",
        "\x1B[30mbarbarbarbarbar",
        "\x1B[0mfoofoofoofoo",
        "\x1B[30mbarbarbarbarbar",
        "\x1B[0m"
      ]);
    });
  });
});
//# sourceMappingURL=terminalProcess.test.js.map
