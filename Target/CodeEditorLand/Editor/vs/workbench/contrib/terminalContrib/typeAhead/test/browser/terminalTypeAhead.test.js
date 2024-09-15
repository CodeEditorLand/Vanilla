var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { SinonStub, stub, useFakeTimers } from "sinon";
import { Emitter } from "../../../../../../base/common/event.js";
import { CharPredictState, IPrediction, PredictionStats, TypeAheadAddon } from "../../browser/terminalTypeAheadAddon.js";
import { IBeforeProcessDataEvent, ITerminalProcessManager } from "../../../../terminal/common/terminal.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { DEFAULT_LOCAL_ECHO_EXCLUDE } from "../../common/terminalTypeAheadConfiguration.js";
const CSI = `\x1B[`;
var CursorMoveDirection = /* @__PURE__ */ ((CursorMoveDirection2) => {
  CursorMoveDirection2["Back"] = "D";
  CursorMoveDirection2["Forwards"] = "C";
  return CursorMoveDirection2;
})(CursorMoveDirection || {});
suite("Workbench - Terminal Typeahead", () => {
  const ds = ensureNoDisposablesAreLeakedInTestSuite();
  suite("PredictionStats", () => {
    let stats;
    let add;
    let succeed;
    let fail;
    setup(() => {
      add = ds.add(new Emitter());
      succeed = ds.add(new Emitter());
      fail = ds.add(new Emitter());
      stats = ds.add(new PredictionStats({
        onPredictionAdded: add.event,
        onPredictionSucceeded: succeed.event,
        onPredictionFailed: fail.event
      }));
    });
    test("creates sane data", () => {
      const stubs = createPredictionStubs(5);
      const clock = useFakeTimers();
      try {
        for (const s of stubs) {
          add.fire(s);
        }
        for (let i = 0; i < stubs.length; i++) {
          clock.tick(100);
          (i % 2 ? fail : succeed).fire(stubs[i]);
        }
        assert.strictEqual(stats.accuracy, 3 / 5);
        assert.strictEqual(stats.sampleSize, 5);
        assert.deepStrictEqual(stats.latency, {
          count: 3,
          min: 100,
          max: 500,
          median: 300
        });
      } finally {
        clock.restore();
      }
    });
    test("circular buffer", () => {
      const bufferSize = 24;
      const stubs = createPredictionStubs(bufferSize * 2);
      for (const s of stubs.slice(0, bufferSize)) {
        add.fire(s);
        succeed.fire(s);
      }
      assert.strictEqual(stats.accuracy, 1);
      for (const s of stubs.slice(bufferSize, bufferSize * 3 / 2)) {
        add.fire(s);
        fail.fire(s);
      }
      assert.strictEqual(stats.accuracy, 0.5);
      for (const s of stubs.slice(bufferSize * 3 / 2)) {
        add.fire(s);
        fail.fire(s);
      }
      assert.strictEqual(stats.accuracy, 0);
    });
  });
  suite("timeline", () => {
    let onBeforeProcessData;
    let publicLog;
    let config;
    let addon;
    const predictedHelloo = [
      `${CSI}?25l`,
      // hide cursor
      `${CSI}2;7H`,
      // move cursor
      "o",
      // new character
      `${CSI}2;8H`,
      // place cursor back at end of line
      `${CSI}?25h`
      // show cursor
    ].join("");
    const expectProcessed = /* @__PURE__ */ __name((input, output) => {
      const evt = { data: input };
      onBeforeProcessData.fire(evt);
      assert.strictEqual(JSON.stringify(evt.data), JSON.stringify(output));
    }, "expectProcessed");
    setup(() => {
      onBeforeProcessData = ds.add(new Emitter());
      config = upcastPartial({
        localEchoStyle: "italic",
        localEchoLatencyThreshold: 0,
        localEchoExcludePrograms: DEFAULT_LOCAL_ECHO_EXCLUDE
      });
      publicLog = stub();
      addon = new TestTypeAheadAddon(
        upcastPartial({ onBeforeProcessData: onBeforeProcessData.event }),
        new TestConfigurationService({ terminal: { integrated: { ...config } } }),
        upcastPartial({ publicLog })
      );
      addon.unlockMakingPredictions();
    });
    teardown(() => {
      addon.dispose();
    });
    test("predicts a single character", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("o");
      t.expectWritten(`${CSI}3mo${CSI}23m`);
    });
    test("validates character prediction", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("o");
      expectProcessed("o", predictedHelloo);
      assert.strictEqual(addon.stats?.accuracy, 1);
    });
    test("validates zsh prediction (#112842)", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("o");
      expectProcessed("o", predictedHelloo);
      t.onData("x");
      expectProcessed("\box", [
        `${CSI}?25l`,
        // hide cursor
        `${CSI}2;8H`,
        // move cursor
        "\box",
        // new data
        `${CSI}2;9H`,
        // place cursor back at end of line
        `${CSI}?25h`
        // show cursor
      ].join(""));
      assert.strictEqual(addon.stats?.accuracy, 1);
    });
    test("does not validate zsh prediction on differing lookbehindn (#112842)", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("o");
      expectProcessed("o", predictedHelloo);
      t.onData("x");
      expectProcessed("\bqx", [
        `${CSI}?25l`,
        // hide cursor
        `${CSI}2;8H`,
        // move cursor cursor
        `${CSI}X`,
        // delete character
        `${CSI}0m`,
        // reset style
        "\bqx",
        // new data
        `${CSI}?25h`
        // show cursor
      ].join(""));
      assert.strictEqual(addon.stats?.accuracy, 0.5);
    });
    test("rolls back character prediction", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("o");
      expectProcessed("q", [
        `${CSI}?25l`,
        // hide cursor
        `${CSI}2;7H`,
        // move cursor cursor
        `${CSI}X`,
        // delete character
        `${CSI}0m`,
        // reset style
        "q",
        // new character
        `${CSI}?25h`
        // show cursor
      ].join(""));
      assert.strictEqual(addon.stats?.accuracy, 0);
    });
    test("handles left arrow when we hit the boundary", () => {
      const t = ds.add(createMockTerminal({ lines: ["|"] }));
      addon.activate(t.terminal);
      addon.unlockNavigating();
      const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
      t.onData(`${CSI}${"D" /* Back */}`);
      t.expectWritten("");
      onBeforeProcessData.fire({ data: "xy" });
      assert.strictEqual(
        addon.physicalCursor(t.terminal.buffer.active)?.x,
        // The cursor should not have changed because we've hit the
        // boundary (start of prompt)
        cursorXBefore
      );
    });
    test("handles right arrow when we hit the boundary", () => {
      const t = ds.add(createMockTerminal({ lines: ["|"] }));
      addon.activate(t.terminal);
      addon.unlockNavigating();
      const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
      t.onData(`${CSI}${"C" /* Forwards */}`);
      t.expectWritten("");
      onBeforeProcessData.fire({ data: "xy" });
      assert.strictEqual(
        addon.physicalCursor(t.terminal.buffer.active)?.x,
        // The cursor should not have changed because we've hit the
        // boundary (end of prompt)
        cursorXBefore
      );
    });
    test("internal cursor state is reset when all predictions are undone", () => {
      const t = ds.add(createMockTerminal({ lines: ["|"] }));
      addon.activate(t.terminal);
      addon.unlockNavigating();
      const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
      t.onData(`${CSI}${"D" /* Back */}`);
      t.expectWritten("");
      addon.undoAllPredictions();
      assert.strictEqual(
        addon.physicalCursor(t.terminal.buffer.active)?.x,
        // The cursor should not have changed because we've hit the
        // boundary (start of prompt)
        cursorXBefore
      );
    });
    test("restores cursor graphics mode", () => {
      const t = ds.add(createMockTerminal({
        lines: ["hello|"],
        cursorAttrs: { isAttributeDefault: false, isBold: true, isFgPalette: true, getFgColor: 1 }
      }));
      addon.activate(t.terminal);
      t.onData("o");
      expectProcessed("q", [
        `${CSI}?25l`,
        // hide cursor
        `${CSI}2;7H`,
        // move cursor cursor
        `${CSI}X`,
        // delete character
        `${CSI}1;38;5;1m`,
        // reset style
        "q",
        // new character
        `${CSI}?25h`
        // show cursor
      ].join(""));
      assert.strictEqual(addon.stats?.accuracy, 0);
    });
    test("validates against and applies graphics mode on predicted", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("o");
      expectProcessed(`${CSI}4mo`, [
        `${CSI}?25l`,
        // hide cursor
        `${CSI}2;7H`,
        // move cursor
        `${CSI}4m`,
        // new PTY's style
        "o",
        // new character
        `${CSI}2;8H`,
        // place cursor back at end of line
        `${CSI}?25h`
        // show cursor
      ].join(""));
      assert.strictEqual(addon.stats?.accuracy, 1);
    });
    test("ignores cursor hides or shows", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("o");
      expectProcessed(`${CSI}?25lo${CSI}?25h`, [
        `${CSI}?25l`,
        // hide cursor from PTY
        `${CSI}?25l`,
        // hide cursor
        `${CSI}2;7H`,
        // move cursor
        "o",
        // new character
        `${CSI}?25h`,
        // show cursor from PTY
        `${CSI}2;8H`,
        // place cursor back at end of line
        `${CSI}?25h`
        // show cursor
      ].join(""));
      assert.strictEqual(addon.stats?.accuracy, 1);
    });
    test("matches backspace at EOL (bash style)", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("\x7F");
      expectProcessed(`\b${CSI}K`, `\b${CSI}K`);
      assert.strictEqual(addon.stats?.accuracy, 1);
    });
    test("matches backspace at EOL (zsh style)", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("\x7F");
      expectProcessed("\b \b", "\b \b");
      assert.strictEqual(addon.stats?.accuracy, 1);
    });
    test("gradually matches backspace", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("\x7F");
      expectProcessed("\b", "");
      expectProcessed(" \b", "\b \b");
      assert.strictEqual(addon.stats?.accuracy, 1);
    });
    test("restores old character after invalid backspace", () => {
      const t = ds.add(createMockTerminal({ lines: ["hel|lo"] }));
      addon.activate(t.terminal);
      addon.unlockNavigating();
      t.onData("\x7F");
      t.expectWritten(`${CSI}2;4H${CSI}X`);
      expectProcessed("x", `${CSI}?25l${CSI}0ml${CSI}2;5H${CSI}0mx${CSI}?25h`);
      assert.strictEqual(addon.stats?.accuracy, 0);
    });
    test("waits for validation before deleting to left of cursor", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      t.onData("\x7F");
      t.expectWritten("");
      expectProcessed("\b \b", "\b \b");
      t.cursor.x--;
      t.onData("o");
      onBeforeProcessData.fire({ data: "o" });
      t.cursor.x++;
      t.clearWritten();
      t.onData("\x7F");
      t.expectWritten(`${CSI}2;6H${CSI}X`);
    });
    test("waits for first valid prediction on a line", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.lockMakingPredictions();
      addon.activate(t.terminal);
      t.onData("o");
      t.expectWritten("");
      expectProcessed("o", "o");
      t.onData("o");
      t.expectWritten(`${CSI}3mo${CSI}23m`);
    });
    test("disables on title change", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.activate(t.terminal);
      addon.reevaluateNow();
      assert.strictEqual(addon.isShowing, true, "expected to show initially");
      t.onTitleChange.fire("foo - VIM.exe");
      addon.reevaluateNow();
      assert.strictEqual(addon.isShowing, false, "expected to hide when vim is open");
      t.onTitleChange.fire("foo - git.exe");
      addon.reevaluateNow();
      assert.strictEqual(addon.isShowing, true, "expected to show again after vim closed");
    });
    test("adds line wrap prediction even if behind a boundary", () => {
      const t = ds.add(createMockTerminal({ lines: ["hello|"] }));
      addon.lockMakingPredictions();
      addon.activate(t.terminal);
      t.onData("hi".repeat(50));
      t.expectWritten("");
      expectProcessed("hi", [
        `${CSI}?25l`,
        // hide cursor
        "hi",
        // this greeting characters
        ...new Array(36).fill(`${CSI}3mh${CSI}23m${CSI}3mi${CSI}23m`),
        // rest of the greetings that fit on this line
        `${CSI}2;81H`,
        // move to end of line
        `${CSI}?25h`
      ].join(""));
    });
  });
});
class TestTypeAheadAddon extends TypeAheadAddon {
  static {
    __name(this, "TestTypeAheadAddon");
  }
  unlockMakingPredictions() {
    this._lastRow = { y: 1, startingX: 100, endingX: 100, charState: CharPredictState.Validated };
  }
  lockMakingPredictions() {
    this._lastRow = void 0;
  }
  unlockNavigating() {
    this._lastRow = { y: 1, startingX: 1, endingX: 1, charState: CharPredictState.Validated };
  }
  reevaluateNow() {
    this._reevaluatePredictorStateNow(this.stats, this._timeline);
  }
  get isShowing() {
    return !!this._timeline?.isShowingPredictions;
  }
  undoAllPredictions() {
    this._timeline?.undoAllPredictions();
  }
  physicalCursor(buffer) {
    return this._timeline?.physicalCursor(buffer);
  }
  tentativeCursor(buffer) {
    return this._timeline?.tentativeCursor(buffer);
  }
}
function upcastPartial(v) {
  return v;
}
__name(upcastPartial, "upcastPartial");
function createPredictionStubs(n) {
  return new Array(n).fill(0).map(stubPrediction);
}
__name(createPredictionStubs, "createPredictionStubs");
function stubPrediction() {
  return {
    apply: /* @__PURE__ */ __name(() => "", "apply"),
    rollback: /* @__PURE__ */ __name(() => "", "rollback"),
    matches: /* @__PURE__ */ __name(() => 0, "matches"),
    rollForwards: /* @__PURE__ */ __name(() => "", "rollForwards")
  };
}
__name(stubPrediction, "stubPrediction");
function createMockTerminal({ lines, cursorAttrs }) {
  const ds = new DisposableStore();
  const written = [];
  const cursor = { y: 1, x: 1 };
  const onTitleChange = ds.add(new Emitter());
  const onData = ds.add(new Emitter());
  const csiEmitter = ds.add(new Emitter());
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    if (line.includes("|")) {
      cursor.y = y + 1;
      cursor.x = line.indexOf("|") + 1;
      lines[y] = line.replace("|", "");
      break;
    }
  }
  return {
    written,
    cursor,
    expectWritten: /* @__PURE__ */ __name((s) => {
      assert.strictEqual(JSON.stringify(written.join("")), JSON.stringify(s));
      written.splice(0, written.length);
    }, "expectWritten"),
    clearWritten: /* @__PURE__ */ __name(() => written.splice(0, written.length), "clearWritten"),
    onData: /* @__PURE__ */ __name((s) => onData.fire(s), "onData"),
    csiEmitter,
    onTitleChange,
    dispose: /* @__PURE__ */ __name(() => ds.dispose(), "dispose"),
    terminal: {
      cols: 80,
      rows: 5,
      onResize: new Emitter().event,
      onData: onData.event,
      onTitleChange: onTitleChange.event,
      parser: {
        registerCsiHandler(_, callback) {
          ds.add(csiEmitter.event(callback));
        }
      },
      write(line) {
        written.push(line);
      },
      _core: {
        _inputHandler: {
          _curAttrData: mockCell("", cursorAttrs)
        },
        writeSync() {
        }
      },
      buffer: {
        active: {
          type: "normal",
          baseY: 0,
          get cursorY() {
            return cursor.y;
          },
          get cursorX() {
            return cursor.x;
          },
          getLine(y) {
            const s = lines[y - 1] || "";
            return {
              length: s.length,
              getCell: /* @__PURE__ */ __name((x) => mockCell(s[x - 1] || ""), "getCell"),
              translateToString: /* @__PURE__ */ __name((trim, start = 0, end = s.length) => {
                const out = s.slice(start, end);
                return trim ? out.trimRight() : out;
              }, "translateToString")
            };
          }
        }
      }
    }
  };
}
__name(createMockTerminal, "createMockTerminal");
function mockCell(char, attrs = {}) {
  return new Proxy({}, {
    get(_, prop) {
      if (typeof prop === "string" && attrs.hasOwnProperty(prop)) {
        return () => attrs[prop];
      }
      switch (prop) {
        case "getWidth":
          return () => 1;
        case "getChars":
          return () => char;
        case "getCode":
          return () => char.charCodeAt(0) || 0;
        case "isAttributeDefault":
          return () => true;
        default:
          return String(prop).startsWith("is") ? () => false : () => 0;
      }
    }
  });
}
__name(mockCell, "mockCell");
//# sourceMappingURL=terminalTypeAhead.test.js.map
