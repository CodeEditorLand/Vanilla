import { deepStrictEqual } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { OperatingSystem } from "../../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { writeP } from "../../../browser/terminalTestHelpers.js";
import { LineDataEventAddon } from "../../../browser/xterm/lineDataEventAddon.js";
suite("LineDataEventAddon", () => {
  let xterm;
  let lineDataEventAddon;
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  suite("onLineData", () => {
    let events;
    setup(async () => {
      const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
      xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 4 }));
      lineDataEventAddon = store.add(new LineDataEventAddon());
      xterm.loadAddon(lineDataEventAddon);
      events = [];
      store.add(lineDataEventAddon.onLineData((e) => events.push(e)));
    });
    test("should fire when a non-wrapped line ends with a line feed", async () => {
      await writeP(xterm, "foo");
      deepStrictEqual(events, []);
      await writeP(xterm, "\n\r");
      deepStrictEqual(events, ["foo"]);
      await writeP(xterm, "bar");
      deepStrictEqual(events, ["foo"]);
      await writeP(xterm, "\n");
      deepStrictEqual(events, ["foo", "bar"]);
    });
    test("should not fire soft wrapped lines", async () => {
      await writeP(xterm, "foo.");
      deepStrictEqual(events, []);
      await writeP(xterm, "bar.");
      deepStrictEqual(events, []);
      await writeP(xterm, "baz.");
      deepStrictEqual(events, []);
    });
    test("should fire when a wrapped line ends with a line feed", async () => {
      await writeP(xterm, "foo.bar.baz.");
      deepStrictEqual(events, []);
      await writeP(xterm, "\n\r");
      deepStrictEqual(events, ["foo.bar.baz."]);
    });
    test("should not fire on cursor move when the backing process is not on Windows", async () => {
      await writeP(xterm, "foo.\x1B[H");
      deepStrictEqual(events, []);
    });
    test("should fire on cursor move when the backing process is on Windows", async () => {
      lineDataEventAddon.setOperatingSystem(OperatingSystem.Windows);
      await writeP(xterm, "foo\x1B[H");
      deepStrictEqual(events, ["foo"]);
    });
  });
});
//# sourceMappingURL=lineDataEventAddon.test.js.map
