import assert from "assert";
import { Emitter } from "../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TerminalDataBufferer } from "../../../../../platform/terminal/common/terminalDataBuffering.js";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
suite("Workbench - TerminalDataBufferer", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let bufferer;
  let counter;
  let data;
  setup(async () => {
    counter = {};
    data = {};
    bufferer = store.add(
      new TerminalDataBufferer((id, e) => {
        if (!(id in counter)) {
          counter[id] = 0;
        }
        counter[id]++;
        if (!(id in data)) {
          data[id] = "";
        }
        data[id] = e;
      })
    );
  });
  test("start", async () => {
    const terminalOnData = new Emitter();
    store.add(bufferer.startBuffering(1, terminalOnData.event, 0));
    terminalOnData.fire("1");
    terminalOnData.fire("2");
    terminalOnData.fire("3");
    await wait(0);
    terminalOnData.fire("4");
    assert.strictEqual(counter[1], 1);
    assert.strictEqual(data[1], "123");
    await wait(0);
    assert.strictEqual(counter[1], 2);
    assert.strictEqual(data[1], "4");
  });
  test("start 2", async () => {
    const terminal1OnData = new Emitter();
    const terminal2OnData = new Emitter();
    store.add(bufferer.startBuffering(1, terminal1OnData.event, 0));
    store.add(bufferer.startBuffering(2, terminal2OnData.event, 0));
    terminal1OnData.fire("1");
    terminal2OnData.fire("4");
    terminal1OnData.fire("2");
    terminal2OnData.fire("5");
    terminal1OnData.fire("3");
    terminal2OnData.fire("6");
    terminal2OnData.fire("7");
    assert.strictEqual(counter[1], void 0);
    assert.strictEqual(data[1], void 0);
    assert.strictEqual(counter[2], void 0);
    assert.strictEqual(data[2], void 0);
    await wait(0);
    assert.strictEqual(counter[1], 1);
    assert.strictEqual(data[1], "123");
    assert.strictEqual(counter[2], 1);
    assert.strictEqual(data[2], "4567");
  });
  test("stop", async () => {
    const terminalOnData = new Emitter();
    bufferer.startBuffering(1, terminalOnData.event, 0);
    terminalOnData.fire("1");
    terminalOnData.fire("2");
    terminalOnData.fire("3");
    bufferer.stopBuffering(1);
    await wait(0);
    assert.strictEqual(counter[1], 1);
    assert.strictEqual(data[1], "123");
  });
  test("start 2 stop 1", async () => {
    const terminal1OnData = new Emitter();
    const terminal2OnData = new Emitter();
    bufferer.startBuffering(1, terminal1OnData.event, 0);
    store.add(bufferer.startBuffering(2, terminal2OnData.event, 0));
    terminal1OnData.fire("1");
    terminal2OnData.fire("4");
    terminal1OnData.fire("2");
    terminal2OnData.fire("5");
    terminal1OnData.fire("3");
    terminal2OnData.fire("6");
    terminal2OnData.fire("7");
    assert.strictEqual(counter[1], void 0);
    assert.strictEqual(data[1], void 0);
    assert.strictEqual(counter[2], void 0);
    assert.strictEqual(data[2], void 0);
    bufferer.stopBuffering(1);
    await wait(0);
    assert.strictEqual(counter[1], 1);
    assert.strictEqual(data[1], "123");
    assert.strictEqual(counter[2], 1);
    assert.strictEqual(data[2], "4567");
  });
  test("dispose should flush remaining data events", async () => {
    const terminal1OnData = new Emitter();
    const terminal2OnData = new Emitter();
    store.add(bufferer.startBuffering(1, terminal1OnData.event, 0));
    store.add(bufferer.startBuffering(2, terminal2OnData.event, 0));
    terminal1OnData.fire("1");
    terminal2OnData.fire("4");
    terminal1OnData.fire("2");
    terminal2OnData.fire("5");
    terminal1OnData.fire("3");
    terminal2OnData.fire("6");
    terminal2OnData.fire("7");
    assert.strictEqual(counter[1], void 0);
    assert.strictEqual(data[1], void 0);
    assert.strictEqual(counter[2], void 0);
    assert.strictEqual(data[2], void 0);
    bufferer.dispose();
    await wait(0);
    assert.strictEqual(counter[1], 1);
    assert.strictEqual(data[1], "123");
    assert.strictEqual(counter[2], 1);
    assert.strictEqual(data[2], "4567");
  });
});
