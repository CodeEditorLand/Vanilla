import assert from "assert";
import { Emitter, Event } from "../../../../../base/common/event.js";
import * as resources from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { DecorationsService } from "../../browser/decorationsService.js";
suite("DecorationsService", () => {
  let service;
  setup(() => {
    service = new DecorationsService(
      new class extends mock() {
        extUri = resources.extUri;
      }(),
      new TestThemeService()
    );
  });
  teardown(() => {
    service.dispose();
  });
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("Async provider, async/evented result", () => runWithFakedTimers({}, async () => {
    const uri = URI.parse("foo:bar");
    let callCounter = 0;
    const reg = service.registerDecorationsProvider(
      new class {
        label = "Test";
        onDidChange = Event.None;
        provideDecorations(uri2) {
          callCounter += 1;
          return new Promise((resolve) => {
            setTimeout(
              () => resolve({
                color: "someBlue",
                tooltip: "T",
                strikethrough: true
              })
            );
          });
        }
      }()
    );
    assert.strictEqual(service.getDecoration(uri, false), void 0);
    assert.strictEqual(callCounter, 1);
    const e = await Event.toPromise(service.onDidChangeDecorations);
    assert.strictEqual(e.affectsResource(uri), true);
    assert.deepStrictEqual(
      service.getDecoration(uri, false).tooltip,
      "T"
    );
    assert.deepStrictEqual(
      service.getDecoration(uri, false).strikethrough,
      true
    );
    assert.strictEqual(callCounter, 1);
    reg.dispose();
  }));
  test("Sync provider, sync result", () => {
    const uri = URI.parse("foo:bar");
    let callCounter = 0;
    const reg = service.registerDecorationsProvider(
      new class {
        label = "Test";
        onDidChange = Event.None;
        provideDecorations(uri2) {
          callCounter += 1;
          return { color: "someBlue", tooltip: "Z" };
        }
      }()
    );
    assert.deepStrictEqual(service.getDecoration(uri, false).tooltip, "Z");
    assert.deepStrictEqual(
      service.getDecoration(uri, false).strikethrough,
      false
    );
    assert.strictEqual(callCounter, 1);
    reg.dispose();
  });
  test("Clear decorations on provider dispose", async () => runWithFakedTimers({}, async () => {
    const uri = URI.parse("foo:bar");
    let callCounter = 0;
    const reg = service.registerDecorationsProvider(
      new class {
        label = "Test";
        onDidChange = Event.None;
        provideDecorations(uri2) {
          callCounter += 1;
          return { color: "someBlue", tooltip: "J" };
        }
      }()
    );
    assert.deepStrictEqual(
      service.getDecoration(uri, false).tooltip,
      "J"
    );
    assert.strictEqual(callCounter, 1);
    let didSeeEvent = false;
    const p = new Promise((resolve) => {
      const l = service.onDidChangeDecorations((e) => {
        assert.strictEqual(e.affectsResource(uri), true);
        assert.deepStrictEqual(
          service.getDecoration(uri, false),
          void 0
        );
        assert.strictEqual(callCounter, 1);
        didSeeEvent = true;
        l.dispose();
        resolve();
      });
    });
    reg.dispose();
    await p;
    assert.strictEqual(didSeeEvent, true);
  }));
  test("No default bubbling", () => {
    let reg = service.registerDecorationsProvider({
      label: "Test",
      onDidChange: Event.None,
      provideDecorations(uri) {
        return uri.path.match(/\.txt/) ? { tooltip: ".txt", weight: 17 } : void 0;
      }
    });
    const childUri = URI.parse("file:///some/path/some/file.txt");
    let deco = service.getDecoration(childUri, false);
    assert.strictEqual(deco.tooltip, ".txt");
    deco = service.getDecoration(
      childUri.with({ path: "some/path/" }),
      true
    );
    assert.strictEqual(deco, void 0);
    reg.dispose();
    reg = service.registerDecorationsProvider({
      label: "Test",
      onDidChange: Event.None,
      provideDecorations(uri) {
        return uri.path.match(/\.txt/) ? { tooltip: ".txt.bubble", weight: 71, bubble: true } : void 0;
      }
    });
    deco = service.getDecoration(childUri, false);
    assert.strictEqual(deco.tooltip, ".txt.bubble");
    deco = service.getDecoration(
      childUri.with({ path: "some/path/" }),
      true
    );
    assert.strictEqual(typeof deco.tooltip, "string");
    reg.dispose();
  });
  test("Decorations not showing up for second root folder #48502", async function() {
    let cancelCount = 0;
    let callCount = 0;
    const provider = new class {
      _onDidChange = new Emitter();
      onDidChange = this._onDidChange.event;
      label = "foo";
      provideDecorations(uri2, token) {
        store.add(
          token.onCancellationRequested(() => {
            cancelCount += 1;
          })
        );
        return new Promise((resolve) => {
          callCount += 1;
          setTimeout(() => {
            resolve({ letter: "foo" });
          }, 10);
        });
      }
    }();
    const reg = service.registerDecorationsProvider(provider);
    const uri = URI.parse("foo://bar");
    const d1 = service.getDecoration(uri, false);
    provider._onDidChange.fire([uri]);
    const d2 = service.getDecoration(uri, false);
    assert.strictEqual(cancelCount, 1);
    assert.strictEqual(callCount, 2);
    d1?.dispose();
    d2?.dispose();
    reg.dispose();
  });
  test("Decorations not bubbling... #48745", () => {
    const reg = service.registerDecorationsProvider({
      label: "Test",
      onDidChange: Event.None,
      provideDecorations(uri) {
        if (uri.path.match(/hello$/)) {
          return { tooltip: "FOO", weight: 17, bubble: true };
        } else {
          return new Promise((_resolve) => {
          });
        }
      }
    });
    const data1 = service.getDecoration(URI.parse("a:b/"), true);
    assert.ok(!data1);
    const data2 = service.getDecoration(URI.parse("a:b/c.hello"), false);
    assert.ok(data2.tooltip);
    const data3 = service.getDecoration(URI.parse("a:b/"), true);
    assert.ok(data3);
    reg.dispose();
  });
  test("Folder decorations don't go away when file with problems is deleted #61919 (part1)", () => {
    const emitter = new Emitter();
    let gone = false;
    const reg = service.registerDecorationsProvider({
      label: "Test",
      onDidChange: emitter.event,
      provideDecorations(uri3) {
        if (!gone && uri3.path.match(/file.ts$/)) {
          return { tooltip: "FOO", weight: 17, bubble: true };
        }
        return void 0;
      }
    });
    const uri = URI.parse("foo:/folder/file.ts");
    const uri2 = URI.parse("foo:/folder/");
    let data = service.getDecoration(uri, true);
    assert.strictEqual(data.tooltip, "FOO");
    data = service.getDecoration(uri2, true);
    assert.ok(data.tooltip);
    gone = true;
    emitter.fire([uri]);
    data = service.getDecoration(uri, true);
    assert.strictEqual(data, void 0);
    data = service.getDecoration(uri2, true);
    assert.strictEqual(data, void 0);
    reg.dispose();
  });
  test("Folder decorations don't go away when file with problems is deleted #61919 (part2)", () => runWithFakedTimers({}, async () => {
    const emitter = new Emitter();
    let gone = false;
    const reg = service.registerDecorationsProvider({
      label: "Test",
      onDidChange: emitter.event,
      provideDecorations(uri3) {
        if (!gone && uri3.path.match(/file.ts$/)) {
          return { tooltip: "FOO", weight: 17, bubble: true };
        }
        return void 0;
      }
    });
    const uri = URI.parse("foo:/folder/file.ts");
    const uri2 = URI.parse("foo:/folder/");
    let data = service.getDecoration(uri, true);
    assert.strictEqual(data.tooltip, "FOO");
    data = service.getDecoration(uri2, true);
    assert.ok(data.tooltip);
    return new Promise((resolve, reject) => {
      const l = service.onDidChangeDecorations((e) => {
        l.dispose();
        try {
          assert.ok(e.affectsResource(uri));
          assert.ok(e.affectsResource(uri2));
          resolve();
          reg.dispose();
        } catch (err) {
          reject(err);
          reg.dispose();
        }
      });
      gone = true;
      emitter.fire([uri]);
    });
  }));
  test("FileDecorationProvider intermittently fails #133210", async () => {
    const invokeOrder = [];
    store.add(
      service.registerDecorationsProvider(
        new class {
          label = "Provider-1";
          onDidChange = Event.None;
          provideDecorations() {
            invokeOrder.push(this.label);
            return void 0;
          }
        }()
      )
    );
    store.add(
      service.registerDecorationsProvider(
        new class {
          label = "Provider-2";
          onDidChange = Event.None;
          provideDecorations() {
            invokeOrder.push(this.label);
            return void 0;
          }
        }()
      )
    );
    service.getDecoration(URI.parse("test://me/path"), false);
    assert.deepStrictEqual(invokeOrder, ["Provider-2", "Provider-1"]);
  });
});
