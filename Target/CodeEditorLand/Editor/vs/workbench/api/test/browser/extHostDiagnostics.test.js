var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { DiagnosticCollection, ExtHostDiagnostics } from "../../common/extHostDiagnostics.js";
import { Diagnostic, DiagnosticSeverity, Range, DiagnosticRelatedInformation, Location } from "../../common/extHostTypes.js";
import { MainThreadDiagnosticsShape, IMainContext } from "../../common/extHost.protocol.js";
import { IMarkerData, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { mock } from "../../../../base/test/common/mock.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { nullExtensionDescription } from "../../../services/extensions/common/extensions.js";
import { ExtUri, extUri } from "../../../../base/common/resources.js";
import { IExtHostFileSystemInfo } from "../../common/extHostFileSystemInfo.js";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { IExtHostDocumentsAndEditors } from "../../common/extHostDocumentsAndEditors.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
suite("ExtHostDiagnostics", () => {
  class DiagnosticsShape extends mock() {
    static {
      __name(this, "DiagnosticsShape");
    }
    $changeMany(owner, entries) {
    }
    $clear(owner) {
    }
  }
  const fileSystemInfoService = new class extends mock() {
    extUri = extUri;
  }();
  const versionProvider = /* @__PURE__ */ __name((uri) => {
    return void 0;
  }, "versionProvider");
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("disposeCheck", () => {
    const collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), new Emitter());
    collection.dispose();
    collection.dispose();
    assert.throws(() => collection.name);
    assert.throws(() => collection.clear());
    assert.throws(() => collection.delete(URI.parse("aa:bb")));
    assert.throws(() => collection.forEach(() => {
    }));
    assert.throws(() => collection.get(URI.parse("aa:bb")));
    assert.throws(() => collection.has(URI.parse("aa:bb")));
    assert.throws(() => collection.set(URI.parse("aa:bb"), []));
    assert.throws(() => collection.set(URI.parse("aa:bb"), void 0));
  });
  test("diagnostic collection, forEach, clear, has", function() {
    let collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), new Emitter());
    assert.strictEqual(collection.name, "test");
    collection.dispose();
    assert.throws(() => collection.name);
    let c = 0;
    collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), new Emitter());
    collection.forEach(() => c++);
    assert.strictEqual(c, 0);
    collection.set(URI.parse("foo:bar"), [
      new Diagnostic(new Range(0, 0, 1, 1), "message-1"),
      new Diagnostic(new Range(0, 0, 1, 1), "message-2")
    ]);
    collection.forEach(() => c++);
    assert.strictEqual(c, 1);
    c = 0;
    collection.clear();
    collection.forEach(() => c++);
    assert.strictEqual(c, 0);
    collection.set(URI.parse("foo:bar1"), [
      new Diagnostic(new Range(0, 0, 1, 1), "message-1"),
      new Diagnostic(new Range(0, 0, 1, 1), "message-2")
    ]);
    collection.set(URI.parse("foo:bar2"), [
      new Diagnostic(new Range(0, 0, 1, 1), "message-1"),
      new Diagnostic(new Range(0, 0, 1, 1), "message-2")
    ]);
    collection.forEach(() => c++);
    assert.strictEqual(c, 2);
    assert.ok(collection.has(URI.parse("foo:bar1")));
    assert.ok(collection.has(URI.parse("foo:bar2")));
    assert.ok(!collection.has(URI.parse("foo:bar3")));
    collection.delete(URI.parse("foo:bar1"));
    assert.ok(!collection.has(URI.parse("foo:bar1")));
    collection.dispose();
  });
  test("diagnostic collection, immutable read", function() {
    const collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), new Emitter());
    collection.set(URI.parse("foo:bar"), [
      new Diagnostic(new Range(0, 0, 1, 1), "message-1"),
      new Diagnostic(new Range(0, 0, 1, 1), "message-2")
    ]);
    let array = collection.get(URI.parse("foo:bar"));
    assert.throws(() => array.length = 0);
    assert.throws(() => array.pop());
    assert.throws(() => array[0] = new Diagnostic(new Range(0, 0, 0, 0), "evil"));
    collection.forEach((uri, array2) => {
      assert.throws(() => array2.length = 0);
      assert.throws(() => array2.pop());
      assert.throws(() => array2[0] = new Diagnostic(new Range(0, 0, 0, 0), "evil"));
    });
    array = collection.get(URI.parse("foo:bar"));
    assert.strictEqual(array.length, 2);
    collection.dispose();
  });
  test("diagnostics collection, set with dupliclated tuples", function() {
    const collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), new Emitter());
    const uri = URI.parse("sc:hightower");
    collection.set([
      [uri, [new Diagnostic(new Range(0, 0, 0, 1), "message-1")]],
      [URI.parse("some:thing"), [new Diagnostic(new Range(0, 0, 1, 1), "something")]],
      [uri, [new Diagnostic(new Range(0, 0, 0, 1), "message-2")]]
    ]);
    let array = collection.get(uri);
    assert.strictEqual(array.length, 2);
    let [first, second] = array;
    assert.strictEqual(first.message, "message-1");
    assert.strictEqual(second.message, "message-2");
    collection.delete(uri);
    assert.ok(!collection.has(uri));
    collection.set([
      [uri, [new Diagnostic(new Range(0, 0, 0, 1), "message-1")]],
      [URI.parse("some:thing"), [new Diagnostic(new Range(0, 0, 1, 1), "something")]],
      [uri, void 0]
    ]);
    assert.ok(!collection.has(uri));
    collection.delete(uri);
    assert.ok(!collection.has(uri));
    collection.set([
      [uri, [new Diagnostic(new Range(0, 0, 0, 1), "message-1")]],
      [URI.parse("some:thing"), [new Diagnostic(new Range(0, 0, 1, 1), "something")]],
      [uri, void 0],
      [uri, [new Diagnostic(new Range(0, 0, 0, 1), "message-2")]],
      [uri, [new Diagnostic(new Range(0, 0, 0, 1), "message-3")]]
    ]);
    array = collection.get(uri);
    assert.strictEqual(array.length, 2);
    [first, second] = array;
    assert.strictEqual(first.message, "message-2");
    assert.strictEqual(second.message, "message-3");
    collection.dispose();
  });
  test("diagnostics collection, set tuple overrides, #11547", function() {
    let lastEntries;
    const collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new class extends DiagnosticsShape {
      $changeMany(owner, entries) {
        lastEntries = entries;
        return super.$changeMany(owner, entries);
      }
    }(), new Emitter());
    const uri = URI.parse("sc:hightower");
    collection.set([[uri, [new Diagnostic(new Range(0, 0, 1, 1), "error")]]]);
    assert.strictEqual(collection.get(uri).length, 1);
    assert.strictEqual(collection.get(uri)[0].message, "error");
    assert.strictEqual(lastEntries.length, 1);
    const [[, data1]] = lastEntries;
    assert.strictEqual(data1.length, 1);
    assert.strictEqual(data1[0].message, "error");
    lastEntries = void 0;
    collection.set([[uri, [new Diagnostic(new Range(0, 0, 1, 1), "warning")]]]);
    assert.strictEqual(collection.get(uri).length, 1);
    assert.strictEqual(collection.get(uri)[0].message, "warning");
    assert.strictEqual(lastEntries.length, 1);
    const [[, data2]] = lastEntries;
    assert.strictEqual(data2.length, 1);
    assert.strictEqual(data2[0].message, "warning");
    lastEntries = void 0;
  });
  test("do send message when not making a change", function() {
    let changeCount = 0;
    let eventCount = 0;
    const emitter = new Emitter();
    store.add(emitter.event((_) => eventCount += 1));
    const collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new class extends DiagnosticsShape {
      $changeMany() {
        changeCount += 1;
      }
    }(), emitter);
    const uri = URI.parse("sc:hightower");
    const diag = new Diagnostic(new Range(0, 0, 0, 1), "ffff");
    collection.set(uri, [diag]);
    assert.strictEqual(changeCount, 1);
    assert.strictEqual(eventCount, 1);
    collection.set(uri, [diag]);
    assert.strictEqual(changeCount, 2);
    assert.strictEqual(eventCount, 2);
  });
  test("diagnostics collection, tuples and undefined (small array), #15585", function() {
    const collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), new Emitter());
    const uri = URI.parse("sc:hightower");
    const uri2 = URI.parse("sc:nomad");
    const diag = new Diagnostic(new Range(0, 0, 0, 1), "ffff");
    collection.set([
      [uri, [diag, diag, diag]],
      [uri, void 0],
      [uri, [diag]],
      [uri2, [diag, diag]],
      [uri2, void 0],
      [uri2, [diag]]
    ]);
    assert.strictEqual(collection.get(uri).length, 1);
    assert.strictEqual(collection.get(uri2).length, 1);
  });
  test("diagnostics collection, tuples and undefined (large array), #15585", function() {
    const collection = new DiagnosticCollection("test", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), new Emitter());
    const tuples = [];
    for (let i = 0; i < 500; i++) {
      const uri = URI.parse("sc:hightower#" + i);
      const diag = new Diagnostic(new Range(0, 0, 0, 1), i.toString());
      tuples.push([uri, [diag, diag, diag]]);
      tuples.push([uri, void 0]);
      tuples.push([uri, [diag]]);
    }
    collection.set(tuples);
    for (let i = 0; i < 500; i++) {
      const uri = URI.parse("sc:hightower#" + i);
      assert.strictEqual(collection.has(uri), true);
      assert.strictEqual(collection.get(uri).length, 1);
    }
  });
  test("diagnostic capping (max per file)", function() {
    let lastEntries;
    const collection = new DiagnosticCollection("test", "test", 100, 250, versionProvider, extUri, new class extends DiagnosticsShape {
      $changeMany(owner, entries) {
        lastEntries = entries;
        return super.$changeMany(owner, entries);
      }
    }(), new Emitter());
    const uri = URI.parse("aa:bb");
    const diagnostics = [];
    for (let i = 0; i < 500; i++) {
      diagnostics.push(new Diagnostic(new Range(i, 0, i + 1, 0), `error#${i}`, i < 300 ? DiagnosticSeverity.Warning : DiagnosticSeverity.Error));
    }
    collection.set(uri, diagnostics);
    assert.strictEqual(collection.get(uri).length, 500);
    assert.strictEqual(lastEntries.length, 1);
    assert.strictEqual(lastEntries[0][1].length, 251);
    assert.strictEqual(lastEntries[0][1][0].severity, MarkerSeverity.Error);
    assert.strictEqual(lastEntries[0][1][200].severity, MarkerSeverity.Warning);
    assert.strictEqual(lastEntries[0][1][250].severity, MarkerSeverity.Info);
  });
  test("diagnostic capping (max files)", function() {
    let lastEntries;
    const collection = new DiagnosticCollection("test", "test", 2, 1, versionProvider, extUri, new class extends DiagnosticsShape {
      $changeMany(owner, entries) {
        lastEntries = entries;
        return super.$changeMany(owner, entries);
      }
    }(), new Emitter());
    const diag = new Diagnostic(new Range(0, 0, 1, 1), "Hello");
    collection.set([
      [URI.parse("aa:bb1"), [diag]],
      [URI.parse("aa:bb2"), [diag]],
      [URI.parse("aa:bb3"), [diag]],
      [URI.parse("aa:bb4"), [diag]]
    ]);
    assert.strictEqual(lastEntries.length, 3);
  });
  test("diagnostic eventing", async function() {
    const emitter = new Emitter();
    const collection = new DiagnosticCollection("ddd", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), emitter);
    const diag1 = new Diagnostic(new Range(1, 1, 2, 3), "diag1");
    const diag2 = new Diagnostic(new Range(1, 1, 2, 3), "diag2");
    const diag3 = new Diagnostic(new Range(1, 1, 2, 3), "diag3");
    let p = Event.toPromise(emitter.event).then((a) => {
      assert.strictEqual(a.length, 1);
      assert.strictEqual(a[0].toString(), "aa:bb");
      assert.ok(URI.isUri(a[0]));
    });
    collection.set(URI.parse("aa:bb"), []);
    await p;
    p = Event.toPromise(emitter.event).then((e) => {
      assert.strictEqual(e.length, 2);
      assert.ok(URI.isUri(e[0]));
      assert.ok(URI.isUri(e[1]));
      assert.strictEqual(e[0].toString(), "aa:bb");
      assert.strictEqual(e[1].toString(), "aa:cc");
    });
    collection.set([
      [URI.parse("aa:bb"), [diag1]],
      [URI.parse("aa:cc"), [diag2, diag3]]
    ]);
    await p;
    p = Event.toPromise(emitter.event).then((e) => {
      assert.strictEqual(e.length, 2);
      assert.ok(URI.isUri(e[0]));
      assert.ok(URI.isUri(e[1]));
    });
    collection.clear();
    await p;
  });
  test("vscode.languages.onDidChangeDiagnostics Does Not Provide Document URI #49582", async function() {
    const emitter = new Emitter();
    const collection = new DiagnosticCollection("ddd", "test", 100, 100, versionProvider, extUri, new DiagnosticsShape(), emitter);
    const diag1 = new Diagnostic(new Range(1, 1, 2, 3), "diag1");
    collection.set(URI.parse("aa:bb"), [diag1]);
    let p = Event.toPromise(emitter.event).then((e) => {
      assert.strictEqual(e[0].toString(), "aa:bb");
    });
    collection.delete(URI.parse("aa:bb"));
    await p;
    collection.set(URI.parse("aa:bb"), [diag1]);
    p = Event.toPromise(emitter.event).then((e) => {
      assert.strictEqual(e[0].toString(), "aa:bb");
    });
    collection.set(URI.parse("aa:bb"), void 0);
    await p;
  });
  test("diagnostics with related information", function(done) {
    const collection = new DiagnosticCollection("ddd", "test", 100, 100, versionProvider, extUri, new class extends DiagnosticsShape {
      $changeMany(owner, entries) {
        const [[, data]] = entries;
        assert.strictEqual(entries.length, 1);
        assert.strictEqual(data.length, 1);
        const [diag2] = data;
        assert.strictEqual(diag2.relatedInformation.length, 2);
        assert.strictEqual(diag2.relatedInformation[0].message, "more1");
        assert.strictEqual(diag2.relatedInformation[1].message, "more2");
        done();
      }
    }(), new Emitter());
    const diag = new Diagnostic(new Range(0, 0, 1, 1), "Foo");
    diag.relatedInformation = [
      new DiagnosticRelatedInformation(new Location(URI.parse("cc:dd"), new Range(0, 0, 0, 0)), "more1"),
      new DiagnosticRelatedInformation(new Location(URI.parse("cc:ee"), new Range(0, 0, 0, 0)), "more2")
    ];
    collection.set(URI.parse("aa:bb"), [diag]);
  });
  test("vscode.languages.getDiagnostics appears to return old diagnostics in some circumstances #54359", function() {
    const ownerHistory = [];
    const diags = new ExtHostDiagnostics(new class {
      getProxy(id) {
        return new class DiagnosticsShape {
          static {
            __name(this, "DiagnosticsShape");
          }
          $clear(owner) {
            ownerHistory.push(owner);
          }
        }();
      }
      set() {
        return null;
      }
      dispose() {
      }
      assertRegistered() {
      }
      drain() {
        return void 0;
      }
    }(), new NullLogService(), fileSystemInfoService, new class extends mock() {
      getDocument() {
        return void 0;
      }
    }());
    const collection1 = diags.createDiagnosticCollection(nullExtensionDescription.identifier, "foo");
    const collection2 = diags.createDiagnosticCollection(nullExtensionDescription.identifier, "foo");
    collection1.clear();
    collection2.clear();
    assert.strictEqual(ownerHistory.length, 2);
    assert.strictEqual(ownerHistory[0], "foo");
    assert.strictEqual(ownerHistory[1], "foo0");
  });
  test("Error updating diagnostics from extension #60394", function() {
    let callCount = 0;
    const collection = new DiagnosticCollection("ddd", "test", 100, 100, versionProvider, extUri, new class extends DiagnosticsShape {
      $changeMany(owner, entries) {
        callCount += 1;
      }
    }(), new Emitter());
    const array = [];
    const diag1 = new Diagnostic(new Range(0, 0, 1, 1), "Foo");
    const diag2 = new Diagnostic(new Range(0, 0, 1, 1), "Bar");
    array.push(diag1, diag2);
    collection.set(URI.parse("test:me"), array);
    assert.strictEqual(callCount, 1);
    collection.set(URI.parse("test:me"), array);
    assert.strictEqual(callCount, 2);
    array.push(diag2);
    collection.set(URI.parse("test:me"), array);
    assert.strictEqual(callCount, 3);
  });
  test("Version id is set whenever possible", function() {
    const all = [];
    const collection = new DiagnosticCollection("ddd", "test", 100, 100, (uri) => {
      return 7;
    }, extUri, new class extends DiagnosticsShape {
      $changeMany(_owner, entries) {
        all.push(...entries);
      }
    }(), new Emitter());
    const array = [];
    const diag1 = new Diagnostic(new Range(0, 0, 1, 1), "Foo");
    const diag2 = new Diagnostic(new Range(0, 0, 1, 1), "Bar");
    array.push(diag1, diag2);
    collection.set(URI.parse("test:one"), array);
    collection.set(URI.parse("test:two"), [diag1]);
    collection.set(URI.parse("test:three"), [diag2]);
    const allVersions = all.map((tuple) => tuple[1].map((t) => t.modelVersionId)).flat();
    assert.deepStrictEqual(allVersions, [7, 7, 7, 7]);
  });
  test("Diagnostics created by tasks aren't accessible to extensions #47292", async function() {
    return runWithFakedTimers({}, async function() {
      const diags = new ExtHostDiagnostics(new class {
        getProxy(id) {
          return {};
        }
        set() {
          return null;
        }
        dispose() {
        }
        assertRegistered() {
        }
        drain() {
          return void 0;
        }
      }(), new NullLogService(), fileSystemInfoService, new class extends mock() {
        getDocument() {
          return void 0;
        }
      }());
      const uri = URI.parse("foo:bar");
      const data = [{
        message: "message",
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1,
        severity: MarkerSeverity.Info
      }];
      const p1 = Event.toPromise(diags.onDidChangeDiagnostics);
      diags.$acceptMarkersChange([[uri, data]]);
      await p1;
      assert.strictEqual(diags.getDiagnostics(uri).length, 1);
      const p2 = Event.toPromise(diags.onDidChangeDiagnostics);
      diags.$acceptMarkersChange([[uri, []]]);
      await p2;
      assert.strictEqual(diags.getDiagnostics(uri).length, 0);
    });
  });
  test("languages.getDiagnostics doesn't handle case insensitivity correctly #128198", function() {
    const diags = new ExtHostDiagnostics(new class {
      getProxy(id) {
        return new DiagnosticsShape();
      }
      set() {
        return null;
      }
      dispose() {
      }
      assertRegistered() {
      }
      drain() {
        return void 0;
      }
    }(), new NullLogService(), new class extends mock() {
      extUri = new ExtUri((uri) => uri.scheme === "insensitive");
    }(), new class extends mock() {
      getDocument() {
        return void 0;
      }
    }());
    const col = diags.createDiagnosticCollection(nullExtensionDescription.identifier);
    const uriSensitive = URI.from({ scheme: "foo", path: "/SOME/path" });
    const uriSensitiveCaseB = uriSensitive.with({ path: uriSensitive.path.toUpperCase() });
    const uriInSensitive = URI.from({ scheme: "insensitive", path: "/SOME/path" });
    const uriInSensitiveUpper = uriInSensitive.with({ path: uriInSensitive.path.toUpperCase() });
    col.set(uriSensitive, [new Diagnostic(new Range(0, 0, 0, 0), "sensitive")]);
    col.set(uriInSensitive, [new Diagnostic(new Range(0, 0, 0, 0), "insensitive")]);
    assert.strictEqual(col.get(uriSensitive)?.length, 1);
    assert.strictEqual(col.get(uriSensitiveCaseB)?.length, 0);
    assert.strictEqual(col.get(uriInSensitive)?.length, 1);
    assert.strictEqual(col.get(uriInSensitiveUpper)?.length, 1);
    assert.strictEqual(diags.getDiagnostics(uriSensitive)?.length, 1);
    assert.strictEqual(diags.getDiagnostics(uriSensitiveCaseB)?.length, 0);
    assert.strictEqual(diags.getDiagnostics(uriInSensitive)?.length, 1);
    assert.strictEqual(diags.getDiagnostics(uriInSensitiveUpper)?.length, 1);
    const fromForEach = [];
    col.forEach((uri) => fromForEach.push(uri));
    assert.strictEqual(fromForEach.length, 2);
    assert.strictEqual(fromForEach[0].toString(), uriSensitive.toString());
    assert.strictEqual(fromForEach[1].toString(), uriInSensitive.toString());
  });
});
//# sourceMappingURL=extHostDiagnostics.test.js.map
