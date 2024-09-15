var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { OpenerService } from "../../../browser/services/openerService.js";
import { TestCodeEditorService } from "../editorTestServices.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { NullCommandService } from "../../../../platform/commands/test/common/nullCommandService.js";
import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { matchesScheme, matchesSomeScheme } from "../../../../base/common/network.js";
import { TestThemeService } from "../../../../platform/theme/test/common/testThemeService.js";
suite("OpenerService", function() {
  const themeService = new TestThemeService();
  const editorService = new TestCodeEditorService(themeService);
  let lastCommand;
  const commandService = new class {
    onWillExecuteCommand = /* @__PURE__ */ __name(() => Disposable.None, "onWillExecuteCommand");
    onDidExecuteCommand = /* @__PURE__ */ __name(() => Disposable.None, "onDidExecuteCommand");
    executeCommand(id, ...args) {
      lastCommand = { id, args };
      return Promise.resolve(void 0);
    }
  }();
  setup(function() {
    lastCommand = void 0;
  });
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("delegate to editorService, scheme:///fff", async function() {
    const openerService = new OpenerService(editorService, NullCommandService);
    await openerService.open(URI.parse("another:///somepath"));
    assert.strictEqual(editorService.lastInput.options.selection, void 0);
  });
  test("delegate to editorService, scheme:///fff#L123", async function() {
    const openerService = new OpenerService(editorService, NullCommandService);
    await openerService.open(URI.parse("file:///somepath#L23"));
    assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
    assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
    assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, void 0);
    assert.strictEqual(editorService.lastInput.options.selection.endColumn, void 0);
    assert.strictEqual(editorService.lastInput.resource.fragment, "");
    await openerService.open(URI.parse("another:///somepath#L23"));
    assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
    assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
    await openerService.open(URI.parse("another:///somepath#L23,45"));
    assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
    assert.strictEqual(editorService.lastInput.options.selection.startColumn, 45);
    assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, void 0);
    assert.strictEqual(editorService.lastInput.options.selection.endColumn, void 0);
    assert.strictEqual(editorService.lastInput.resource.fragment, "");
  });
  test("delegate to editorService, scheme:///fff#123,123", async function() {
    const openerService = new OpenerService(editorService, NullCommandService);
    await openerService.open(URI.parse("file:///somepath#23"));
    assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
    assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
    assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, void 0);
    assert.strictEqual(editorService.lastInput.options.selection.endColumn, void 0);
    assert.strictEqual(editorService.lastInput.resource.fragment, "");
    await openerService.open(URI.parse("file:///somepath#23,45"));
    assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
    assert.strictEqual(editorService.lastInput.options.selection.startColumn, 45);
    assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, void 0);
    assert.strictEqual(editorService.lastInput.options.selection.endColumn, void 0);
    assert.strictEqual(editorService.lastInput.resource.fragment, "");
  });
  test("delegate to commandsService, command:someid", async function() {
    const openerService = new OpenerService(editorService, commandService);
    const id = `aCommand${Math.random()}`;
    store.add(CommandsRegistry.registerCommand(id, function() {
    }));
    assert.strictEqual(lastCommand, void 0);
    await openerService.open(URI.parse("command:" + id));
    assert.strictEqual(lastCommand, void 0);
  });
  test("delegate to commandsService, command:someid, 2", async function() {
    const openerService = new OpenerService(editorService, commandService);
    const id = `aCommand${Math.random()}`;
    store.add(CommandsRegistry.registerCommand(id, function() {
    }));
    await openerService.open(URI.parse("command:" + id).with({ query: '"123"' }), { allowCommands: true });
    assert.strictEqual(lastCommand.id, id);
    assert.strictEqual(lastCommand.args.length, 1);
    assert.strictEqual(lastCommand.args[0], "123");
    await openerService.open(URI.parse("command:" + id), { allowCommands: true });
    assert.strictEqual(lastCommand.id, id);
    assert.strictEqual(lastCommand.args.length, 0);
    await openerService.open(URI.parse("command:" + id).with({ query: "123" }), { allowCommands: true });
    assert.strictEqual(lastCommand.id, id);
    assert.strictEqual(lastCommand.args.length, 1);
    assert.strictEqual(lastCommand.args[0], 123);
    await openerService.open(URI.parse("command:" + id).with({ query: JSON.stringify([12, true]) }), { allowCommands: true });
    assert.strictEqual(lastCommand.id, id);
    assert.strictEqual(lastCommand.args.length, 2);
    assert.strictEqual(lastCommand.args[0], 12);
    assert.strictEqual(lastCommand.args[1], true);
  });
  test("links are protected by validators", async function() {
    const openerService = new OpenerService(editorService, commandService);
    store.add(openerService.registerValidator({ shouldOpen: /* @__PURE__ */ __name(() => Promise.resolve(false), "shouldOpen") }));
    const httpResult = await openerService.open(URI.parse("https://www.microsoft.com"));
    const httpsResult = await openerService.open(URI.parse("https://www.microsoft.com"));
    assert.strictEqual(httpResult, false);
    assert.strictEqual(httpsResult, false);
  });
  test("links validated by validators go to openers", async function() {
    const openerService = new OpenerService(editorService, commandService);
    store.add(openerService.registerValidator({ shouldOpen: /* @__PURE__ */ __name(() => Promise.resolve(true), "shouldOpen") }));
    let openCount = 0;
    store.add(openerService.registerOpener({
      open: /* @__PURE__ */ __name((resource) => {
        openCount++;
        return Promise.resolve(true);
      }, "open")
    }));
    await openerService.open(URI.parse("http://microsoft.com"));
    assert.strictEqual(openCount, 1);
    await openerService.open(URI.parse("https://microsoft.com"));
    assert.strictEqual(openCount, 2);
  });
  test("links aren't manipulated before being passed to validator: PR #118226", async function() {
    const openerService = new OpenerService(editorService, commandService);
    store.add(openerService.registerValidator({
      shouldOpen: /* @__PURE__ */ __name((resource) => {
        assert.strictEqual(resource instanceof URI, false);
        return Promise.resolve(false);
      }, "shouldOpen")
    }));
    await openerService.open("https://wwww.microsoft.com");
    await openerService.open('https://www.microsoft.com??params=CountryCode%3DUSA%26Name%3Dvscode"');
  });
  test("links validated by multiple validators", async function() {
    const openerService = new OpenerService(editorService, commandService);
    let v1 = 0;
    openerService.registerValidator({
      shouldOpen: /* @__PURE__ */ __name(() => {
        v1++;
        return Promise.resolve(true);
      }, "shouldOpen")
    });
    let v2 = 0;
    openerService.registerValidator({
      shouldOpen: /* @__PURE__ */ __name(() => {
        v2++;
        return Promise.resolve(true);
      }, "shouldOpen")
    });
    let openCount = 0;
    openerService.registerOpener({
      open: /* @__PURE__ */ __name((resource) => {
        openCount++;
        return Promise.resolve(true);
      }, "open")
    });
    await openerService.open(URI.parse("http://microsoft.com"));
    assert.strictEqual(openCount, 1);
    assert.strictEqual(v1, 1);
    assert.strictEqual(v2, 1);
    await openerService.open(URI.parse("https://microsoft.com"));
    assert.strictEqual(openCount, 2);
    assert.strictEqual(v1, 2);
    assert.strictEqual(v2, 2);
  });
  test("links invalidated by first validator do not continue validating", async function() {
    const openerService = new OpenerService(editorService, commandService);
    let v1 = 0;
    openerService.registerValidator({
      shouldOpen: /* @__PURE__ */ __name(() => {
        v1++;
        return Promise.resolve(false);
      }, "shouldOpen")
    });
    let v2 = 0;
    openerService.registerValidator({
      shouldOpen: /* @__PURE__ */ __name(() => {
        v2++;
        return Promise.resolve(true);
      }, "shouldOpen")
    });
    let openCount = 0;
    openerService.registerOpener({
      open: /* @__PURE__ */ __name((resource) => {
        openCount++;
        return Promise.resolve(true);
      }, "open")
    });
    await openerService.open(URI.parse("http://microsoft.com"));
    assert.strictEqual(openCount, 0);
    assert.strictEqual(v1, 1);
    assert.strictEqual(v2, 0);
    await openerService.open(URI.parse("https://microsoft.com"));
    assert.strictEqual(openCount, 0);
    assert.strictEqual(v1, 2);
    assert.strictEqual(v2, 0);
  });
  test("matchesScheme", function() {
    assert.ok(matchesScheme("https://microsoft.com", "https"));
    assert.ok(matchesScheme("http://microsoft.com", "http"));
    assert.ok(matchesScheme("hTTPs://microsoft.com", "https"));
    assert.ok(matchesScheme("httP://microsoft.com", "http"));
    assert.ok(matchesScheme(URI.parse("https://microsoft.com"), "https"));
    assert.ok(matchesScheme(URI.parse("http://microsoft.com"), "http"));
    assert.ok(matchesScheme(URI.parse("hTTPs://microsoft.com"), "https"));
    assert.ok(matchesScheme(URI.parse("httP://microsoft.com"), "http"));
    assert.ok(!matchesScheme(URI.parse("https://microsoft.com"), "http"));
    assert.ok(!matchesScheme(URI.parse("htt://microsoft.com"), "http"));
    assert.ok(!matchesScheme(URI.parse("z://microsoft.com"), "http"));
  });
  test("matchesSomeScheme", function() {
    assert.ok(matchesSomeScheme("https://microsoft.com", "http", "https"));
    assert.ok(matchesSomeScheme("http://microsoft.com", "http", "https"));
    assert.ok(!matchesSomeScheme("x://microsoft.com", "http", "https"));
  });
  test("resolveExternalUri", async function() {
    const openerService = new OpenerService(editorService, NullCommandService);
    try {
      await openerService.resolveExternalUri(URI.parse("file:///Users/user/folder"));
      assert.fail("Should not reach here");
    } catch {
    }
    const disposable = openerService.registerExternalUriResolver({
      async resolveExternalUri(uri) {
        return { resolved: uri, dispose() {
        } };
      }
    });
    const result = await openerService.resolveExternalUri(URI.parse("file:///Users/user/folder"));
    assert.deepStrictEqual(result.resolved.toString(), "file:///Users/user/folder");
    disposable.dispose();
  });
  test("vscode.open command can't open HTTP URL with hash (#) in it [extension development] #140907", async function() {
    const openerService = new OpenerService(editorService, NullCommandService);
    const actual = [];
    openerService.setDefaultExternalOpener({
      async openExternal(href2) {
        actual.push(href2);
        return true;
      }
    });
    const href = "https://gitlab.com/viktomas/test-project/merge_requests/new?merge_request%5Bsource_branch%5D=test-%23-hash";
    const uri = URI.parse(href);
    assert.ok(await openerService.open(uri));
    assert.ok(await openerService.open(href));
    assert.deepStrictEqual(actual, [
      encodeURI(uri.toString(true)),
      // BAD, the encoded # (%23) is double encoded to %2523 (% is double encoded)
      href
      // good
    ]);
  });
});
//# sourceMappingURL=openerService.test.js.map
