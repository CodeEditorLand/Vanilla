var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../../log/common/log.js";
import { PromptInputModel } from "../../../../common/capabilities/commandDetection/promptInputModel.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { notDeepStrictEqual, strictEqual } from "assert";
import { timeout } from "../../../../../../base/common/async.js";
import { importAMDNodeModule } from "../../../../../../amdX.js";
suite("PromptInputModel", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let promptInputModel;
  let xterm;
  let onCommandStart;
  let onCommandExecuted;
  async function writePromise(data) {
    await new Promise((r) => xterm.write(data, r));
  }
  __name(writePromise, "writePromise");
  function fireCommandStart() {
    onCommandStart.fire({ marker: xterm.registerMarker() });
  }
  __name(fireCommandStart, "fireCommandStart");
  function fireCommandExecuted() {
    onCommandExecuted.fire(null);
  }
  __name(fireCommandExecuted, "fireCommandExecuted");
  function setContinuationPrompt(prompt) {
    promptInputModel.setContinuationPrompt(prompt);
  }
  __name(setContinuationPrompt, "setContinuationPrompt");
  async function assertPromptInput(valueWithCursor) {
    await timeout(0);
    if (promptInputModel.cursorIndex !== -1 && !valueWithCursor.includes("|")) {
      throw new Error("assertPromptInput must contain | character");
    }
    const actualValueWithCursor = promptInputModel.getCombinedString();
    strictEqual(
      actualValueWithCursor,
      valueWithCursor.replaceAll("\n", "\u23CE")
    );
    const value = valueWithCursor.replace(/[\|\[\]]/g, "");
    const cursorIndex = valueWithCursor.indexOf("|");
    strictEqual(promptInputModel.value, value);
    strictEqual(promptInputModel.cursorIndex, cursorIndex, `value=${promptInputModel.value}`);
  }
  __name(assertPromptInput, "assertPromptInput");
  setup(async () => {
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(new TerminalCtor({ allowProposedApi: true }));
    onCommandStart = store.add(new Emitter());
    onCommandExecuted = store.add(new Emitter());
    promptInputModel = store.add(new PromptInputModel(xterm, onCommandStart.event, onCommandExecuted.event, new NullLogService()));
  });
  test("basic input and execute", async () => {
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("foo bar");
    await assertPromptInput("foo bar|");
    await writePromise("\r\n");
    fireCommandExecuted();
    await assertPromptInput("foo bar");
    await writePromise("(command output)\r\n$ ");
    fireCommandStart();
    await assertPromptInput("|");
  });
  test("should not fire onDidChangeInput events when nothing changes", async () => {
    const events = [];
    store.add(promptInputModel.onDidChangeInput((e) => events.push(e)));
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("foo");
    await assertPromptInput("foo|");
    await writePromise(" bar");
    await assertPromptInput("foo bar|");
    await writePromise("\r\n");
    fireCommandExecuted();
    await assertPromptInput("foo bar");
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("foo bar");
    await assertPromptInput("foo bar|");
    for (let i = 0; i < events.length - 1; i++) {
      notDeepStrictEqual(events[i], events[i + 1], "not adjacent events should fire with the same value");
    }
  });
  test("should fire onDidInterrupt followed by onDidFinish when ctrl+c is pressed", async () => {
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("foo");
    await assertPromptInput("foo|");
    await new Promise((r) => {
      store.add(promptInputModel.onDidInterrupt(() => {
        store.add(promptInputModel.onDidFinishInput(() => {
          r();
        }));
      }));
      xterm.input("");
      writePromise("^C").then(() => fireCommandExecuted());
    });
  });
  test("cursor navigation", async () => {
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("foo bar");
    await assertPromptInput("foo bar|");
    await writePromise("\x1B[3D");
    await assertPromptInput("foo |bar");
    await writePromise("\x1B[4D");
    await assertPromptInput("|foo bar");
    await writePromise("\x1B[3C");
    await assertPromptInput("foo| bar");
    await writePromise("\x1B[4C");
    await assertPromptInput("foo bar|");
    await writePromise("\x1B[D");
    await assertPromptInput("foo ba|r");
    await writePromise("\x1B[C");
    await assertPromptInput("foo bar|");
  });
  test("ghost text", async () => {
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("foo\x1B[2m bar\x1B[0m\x1B[4D");
    await assertPromptInput("foo|[ bar]");
    await writePromise("\x1B[2D");
    await assertPromptInput("f|oo[ bar]");
  });
  test("wide input (Korean)", async () => {
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("\uC548\uC601");
    await assertPromptInput("\uC548\uC601|");
    await writePromise("\r\n\uCEF4\uD4E8\uD130");
    await assertPromptInput("\uC548\uC601\n\uCEF4\uD4E8\uD130|");
    await writePromise("\r\n\uC0AC\uB78C");
    await assertPromptInput("\uC548\uC601\n\uCEF4\uD4E8\uD130\n\uC0AC\uB78C|");
    await writePromise("\x1B[G");
    await assertPromptInput("\uC548\uC601\n\uCEF4\uD4E8\uD130\n|\uC0AC\uB78C");
    await writePromise("\x1B[A");
    await assertPromptInput("\uC548\uC601\n|\uCEF4\uD4E8\uD130\n\uC0AC\uB78C");
    await writePromise("\x1B[4C");
    await assertPromptInput("\uC548\uC601\n\uCEF4\uD4E8|\uD130\n\uC0AC\uB78C");
    await writePromise("\x1B[1;4H");
    await assertPromptInput("\uC548|\uC601\n\uCEF4\uD4E8\uD130\n\uC0AC\uB78C");
    await writePromise("\x1B[D");
    await assertPromptInput("|\uC548\uC601\n\uCEF4\uD4E8\uD130\n\uC0AC\uB78C");
  });
  test("emoji input", async () => {
    await writePromise("$ ");
    fireCommandStart();
    await assertPromptInput("|");
    await writePromise("\u270C\uFE0F\u{1F44D}");
    await assertPromptInput("\u270C\uFE0F\u{1F44D}|");
    await writePromise("\r\n\u{1F60E}\u{1F615}\u{1F605}");
    await assertPromptInput("\u270C\uFE0F\u{1F44D}\n\u{1F60E}\u{1F615}\u{1F605}|");
    await writePromise("\r\n\u{1F914}\u{1F937}\u{1F629}");
    await assertPromptInput("\u270C\uFE0F\u{1F44D}\n\u{1F60E}\u{1F615}\u{1F605}\n\u{1F914}\u{1F937}\u{1F629}|");
    await writePromise("\x1B[G");
    await assertPromptInput("\u270C\uFE0F\u{1F44D}\n\u{1F60E}\u{1F615}\u{1F605}\n|\u{1F914}\u{1F937}\u{1F629}");
    await writePromise("\x1B[A");
    await assertPromptInput("\u270C\uFE0F\u{1F44D}\n|\u{1F60E}\u{1F615}\u{1F605}\n\u{1F914}\u{1F937}\u{1F629}");
    await writePromise("\x1B[2C");
    await assertPromptInput("\u270C\uFE0F\u{1F44D}\n\u{1F60E}\u{1F615}|\u{1F605}\n\u{1F914}\u{1F937}\u{1F629}");
    await writePromise("\x1B[1;4H");
    await assertPromptInput("\u270C\uFE0F|\u{1F44D}\n\u{1F60E}\u{1F615}\u{1F605}\n\u{1F914}\u{1F937}\u{1F629}");
    await writePromise("\x1B[D");
    await assertPromptInput("|\u270C\uFE0F\u{1F44D}\n\u{1F60E}\u{1F615}\u{1F605}\n\u{1F914}\u{1F937}\u{1F629}");
  });
  suite("trailing whitespace", () => {
    test("delete whitespace with backspace", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise(" ");
      await assertPromptInput(` |`);
      xterm.input("\x7F", true);
      await writePromise("\x1B[D");
      await assertPromptInput("|");
      xterm.input(" ".repeat(4), true);
      await writePromise(" ".repeat(4));
      await assertPromptInput(`    |`);
      xterm.input("\x1B[D".repeat(2), true);
      await writePromise("\x1B[2D");
      await assertPromptInput(`  |  `);
      xterm.input("\x7F", true);
      await writePromise("\x1B[D");
      await assertPromptInput(` |  `);
      xterm.input("\x7F", true);
      await writePromise("\x1B[D");
      await assertPromptInput(`|  `);
      xterm.input(" ", true);
      await writePromise(" ");
      await assertPromptInput(` |  `);
      xterm.input(" ", true);
      await writePromise(" ");
      await assertPromptInput(`  |  `);
      xterm.input("\x1B[C", true);
      await writePromise("\x1B[C");
      await assertPromptInput(`   | `);
      xterm.input("a", true);
      await writePromise("a");
      await assertPromptInput(`   a| `);
      xterm.input("\x7F", true);
      await writePromise("\x1B[D\x1B[K");
      await assertPromptInput(`   | `);
      xterm.input("\x1B[D".repeat(2), true);
      await writePromise("\x1B[2D");
      await assertPromptInput(` |   `);
      xterm.input("\x1B[3~", true);
      await writePromise("");
      await assertPromptInput(` |  `);
    });
    test.skip("track whitespace when ConPTY deletes whitespace unexpectedly", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      xterm.input("ls", true);
      await writePromise("ls");
      await assertPromptInput(`ls|`);
      xterm.input(" ".repeat(4), true);
      await writePromise(" ".repeat(4));
      await assertPromptInput(`ls    |`);
      xterm.input(" ", true);
      await writePromise("\x1B[4D\x1B[5X\x1B[5C");
      await assertPromptInput(`ls     |`);
    });
    test("track whitespace beyond cursor", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise(" ".repeat(8));
      await assertPromptInput(`${" ".repeat(8)}|`);
      await writePromise("\x1B[4D");
      await assertPromptInput(`${" ".repeat(4)}|${" ".repeat(4)}`);
    });
  });
  suite("multi-line", () => {
    test("basic 2 line", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise('echo "a');
      await assertPromptInput(`echo "a|`);
      await writePromise("\n\r\u2219 ");
      setContinuationPrompt("\u2219 ");
      await assertPromptInput(`echo "a
|`);
      await writePromise("b");
      await assertPromptInput(`echo "a
b|`);
    });
    test("basic 3 line", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise('echo "a');
      await assertPromptInput(`echo "a|`);
      await writePromise("\n\r\u2219 ");
      setContinuationPrompt("\u2219 ");
      await assertPromptInput(`echo "a
|`);
      await writePromise("b");
      await assertPromptInput(`echo "a
b|`);
      await writePromise("\n\r\u2219 ");
      setContinuationPrompt("\u2219 ");
      await assertPromptInput(`echo "a
b
|`);
      await writePromise("c");
      await assertPromptInput(`echo "a
b
c|`);
    });
    test("navigate left in multi-line", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise('echo "a');
      await assertPromptInput(`echo "a|`);
      await writePromise("\n\r\u2219 ");
      setContinuationPrompt("\u2219 ");
      await assertPromptInput(`echo "a
|`);
      await writePromise("b");
      await assertPromptInput(`echo "a
b|`);
      await writePromise("\x1B[D");
      await assertPromptInput(`echo "a
|b`);
      await writePromise("\x1B[@c");
      await assertPromptInput(`echo "a
c|b`);
      await writePromise("\x1B[K\n\r\u2219 ");
      await assertPromptInput(`echo "a
c
|`);
      await writePromise("b");
      await assertPromptInput(`echo "a
c
b|`);
      await writePromise(" foo");
      await assertPromptInput(`echo "a
c
b foo|`);
      await writePromise("\x1B[3D");
      await assertPromptInput(`echo "a
c
b |foo`);
    });
    test("navigate up in multi-line", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise('echo "foo');
      await assertPromptInput(`echo "foo|`);
      await writePromise("\n\r\u2219 ");
      setContinuationPrompt("\u2219 ");
      await assertPromptInput(`echo "foo
|`);
      await writePromise("bar");
      await assertPromptInput(`echo "foo
bar|`);
      await writePromise("\n\r\u2219 ");
      setContinuationPrompt("\u2219 ");
      await assertPromptInput(`echo "foo
bar
|`);
      await writePromise("baz");
      await assertPromptInput(`echo "foo
bar
baz|`);
      await writePromise("\x1B[A");
      await assertPromptInput(`echo "foo
bar|
baz`);
      await writePromise("\x1B[D");
      await assertPromptInput(`echo "foo
ba|r
baz`);
      await writePromise("\x1B[D");
      await assertPromptInput(`echo "foo
b|ar
baz`);
      await writePromise("\x1B[D");
      await assertPromptInput(`echo "foo
|bar
baz`);
      await writePromise("\x1B[1;9H");
      await assertPromptInput(`echo "|foo
bar
baz`);
      await writePromise("\x1B[C");
      await assertPromptInput(`echo "f|oo
bar
baz`);
      await writePromise("\x1B[C");
      await assertPromptInput(`echo "fo|o
bar
baz`);
      await writePromise("\x1B[C");
      await assertPromptInput(`echo "foo|
bar
baz`);
    });
    test("navigating up when first line contains invalid/stale trailing whitespace", async () => {
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise('echo "foo      \x1B[6D');
      await assertPromptInput(`echo "foo|`);
      await writePromise("\n\r\u2219 ");
      setContinuationPrompt("\u2219 ");
      await assertPromptInput(`echo "foo
|`);
      await writePromise("bar");
      await assertPromptInput(`echo "foo
bar|`);
      await writePromise("\x1B[D");
      await assertPromptInput(`echo "foo
ba|r`);
      await writePromise("\x1B[D");
      await assertPromptInput(`echo "foo
b|ar`);
      await writePromise("\x1B[D");
      await assertPromptInput(`echo "foo
|bar`);
    });
  });
  suite("wrapped line (non-continuation)", () => {
    test("basic wrapped line", async () => {
      xterm.resize(5, 10);
      await writePromise("$ ");
      fireCommandStart();
      await assertPromptInput("|");
      await writePromise("ech");
      await assertPromptInput(`ech|`);
      await writePromise("o ");
      await assertPromptInput(`echo |`);
      await writePromise('"a"');
      await assertPromptInput(`echo "a"| `);
    });
  });
  suite("recorded sessions", () => {
    async function replayEvents(events) {
      for (const data of events) {
        await writePromise(data);
      }
    }
    __name(replayEvents, "replayEvents");
    suite("Windows 11 (10.0.22621.3447), pwsh 7.4.2, starship prompt 1.10.2", () => {
      test("input with ignored ghost text", async () => {
        await replayEvents([
          "\x1B[?25l\x1B[2J\x1B[m\x1B[H\x1B]0;C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.4.2.0_x64__8wekyb3d8bbwe\\pwsh.exe\x07\x1B[?25h",
          "\x1B[?25l\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\x1B[H\x1B[?25h",
          "\x1B]633;P;IsWindows=True\x07",
          "\x1B]633;P;ContinuationPrompt=\x1B[38;5;8m\u2219\x1B[0m \x07",
          "\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",
          "\x1B[34m\r\n\uE0B6\x1B[38;2;17;17;17m\x1B[44m03:13:47 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/prompt_input_model \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$\u21E1 \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r\n\u276F\x1B[m "
        ]);
        fireCommandStart();
        await assertPromptInput("|");
        await replayEvents([
          "\x1B[?25l\x1B[93mf\x1B[97m\x1B[2m\x1B[3makecommand\x1B[3;4H\x1B[?25h",
          "\x1B[m",
          "\x1B[93m\bfo\x1B[9X",
          "\x1B[m",
          "\x1B[?25l\x1B[93m\x1B[3;3Hfoo\x1B[?25h",
          "\x1B[m"
        ]);
        await assertPromptInput("foo|");
      });
      test("input with accepted and run ghost text", async () => {
        await replayEvents([
          "\x1B[?25l\x1B[2J\x1B[m\x1B[H\x1B]0;C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.4.2.0_x64__8wekyb3d8bbwe\\pwsh.exe\x07\x1B[?25h",
          "\x1B[?25l\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\x1B[H\x1B[?25h",
          "\x1B]633;P;IsWindows=True\x07",
          "\x1B]633;P;ContinuationPrompt=\x1B[38;5;8m\u2219\x1B[0m \x07",
          "\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",
          "\x1B[34m\r\n\uE0B6\x1B[38;2;17;17;17m\x1B[44m03:41:36 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/prompt_input_model \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$ \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r\n\u276F\x1B[m "
        ]);
        promptInputModel.setContinuationPrompt("\u2219 ");
        fireCommandStart();
        await assertPromptInput("|");
        await replayEvents([
          '\x1B[?25l\x1B[93me\x1B[97m\x1B[2m\x1B[3mcho "hello world"\x1B[3;4H\x1B[?25h',
          "\x1B[m"
        ]);
        await assertPromptInput('e|[cho "hello world"]');
        await replayEvents([
          '\x1B[?25l\x1B[93m\bec\x1B[97m\x1B[2m\x1B[3mho "hello world"\x1B[3;5H\x1B[?25h',
          "\x1B[m"
        ]);
        await assertPromptInput('ec|[ho "hello world"]');
        await replayEvents([
          '\x1B[?25l\x1B[93m\x1B[3;3Hech\x1B[97m\x1B[2m\x1B[3mo "hello world"\x1B[3;6H\x1B[?25h',
          "\x1B[m"
        ]);
        await assertPromptInput('ech|[o "hello world"]');
        await replayEvents([
          '\x1B[?25l\x1B[93m\x1B[3;3Hecho\x1B[97m\x1B[2m\x1B[3m "hello world"\x1B[3;7H\x1B[?25h',
          "\x1B[m"
        ]);
        await assertPromptInput('echo|[ "hello world"]');
        await replayEvents([
          '\x1B[?25l\x1B[93m\x1B[3;3Hecho \x1B[97m\x1B[2m\x1B[3m"hello world"\x1B[3;8H\x1B[?25h',
          "\x1B[m"
        ]);
        await assertPromptInput('echo |["hello world"]');
        await replayEvents([
          '\x1B[?25l\x1B[93m\x1B[3;3Hecho \x1B[36m"hello world"\x1B[?25h',
          "\x1B[m"
        ]);
        await assertPromptInput('echo "hello world"|');
        await replayEvents([
          '\x1B]633;E;echo "hello world";ff464d39-bc80-4bae-9ead-b1cafc4adf6f\x07\x1B]633;C\x07'
        ]);
        fireCommandExecuted();
        await assertPromptInput('echo "hello world"');
        await replayEvents([
          "\r\n",
          "hello world\r\n"
        ]);
        await assertPromptInput('echo "hello world"');
        await replayEvents([
          "\x1B]633;D;0\x07\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",
          "\x1B[34m\r\n\uE0B6\x1B[38;2;17;17;17m\x1B[44m03:41:42 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/prompt_input_model \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$ \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r\n\u276F\x1B[m "
        ]);
        fireCommandStart();
        await assertPromptInput("|");
      });
      test("input, go to start (ctrl+home), delete word in front (ctrl+delete)", async () => {
        await replayEvents([
          "\x1B[?25l\x1B[2J\x1B[m\x1B[H\x1B]0;C:Program FilesWindowsAppsMicrosoft.PowerShell_7.4.2.0_x64__8wekyb3d8bbwepwsh.exe\x07\x1B[?25h",
          "\x1B[?25l\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\r\n\x1B[K\x1B[H\x1B[?25h",
          "\x1B]633;P;IsWindows=True\x07",
          "\x1B]633;P;ContinuationPrompt=\x1B[38;5;8m\u2219\x1B[0m \x07",
          "\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",
          "\x1B[34m\r\n\uE0B6\x1B[38;2;17;17;17m\x1B[44m16:07:06 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/210662 \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$! \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r\n\u276F\x1B[m "
        ]);
        fireCommandStart();
        await assertPromptInput("|");
        await replayEvents([
          "\x1B[?25l\x1B[93mG\x1B[97m\x1B[2m\x1B[3mit push\x1B[3;4H\x1B[?25h",
          "\x1B[m",
          "\x1B[?25l\x1B[93m\bGe\x1B[97m\x1B[2m\x1B[3mt-ChildItem -Path a\x1B[3;5H\x1B[?25h",
          "\x1B[m",
          "\x1B[?25l\x1B[93m\x1B[3;3HGet\x1B[97m\x1B[2m\x1B[3m-ChildItem -Path a\x1B[3;6H\x1B[?25h"
        ]);
        await assertPromptInput("Get|[-ChildItem -Path a]");
        await replayEvents([
          "\x1B[m",
          "\x1B[?25l\x1B[3;3H\x1B[?25h",
          "\x1B[21X"
        ]);
        await timeout(0);
        const actualValueWithCursor = promptInputModel.getCombinedString();
        strictEqual(
          actualValueWithCursor,
          "|".replaceAll("\n", "\u23CE")
        );
      });
    });
  });
});
//# sourceMappingURL=promptInputModel.test.js.map
