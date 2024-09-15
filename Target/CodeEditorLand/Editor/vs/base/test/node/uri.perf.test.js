var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { readFileSync } from "fs";
import { FileAccess } from "../../common/network.js";
import { URI } from "../../common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
suite("URI - perf", function() {
  if (1) {
    return;
  }
  ensureNoDisposablesAreLeakedInTestSuite();
  let manyFileUris;
  setup(function() {
    manyFileUris = [];
    const data = readFileSync(FileAccess.asFileUri("vs/base/test/node/uri.perf.data.txt").fsPath).toString();
    const lines = data.split("\n");
    for (const line of lines) {
      manyFileUris.push(URI.file(line));
    }
  });
  function perfTest(name, callback) {
    test(name, (_done) => {
      const t1 = Date.now();
      callback();
      const d = Date.now() - t1;
      console.log(`${name} took ${d}ms (${(d / manyFileUris.length).toPrecision(3)} ms/uri) (${manyFileUris.length} uris)`);
      _done();
    });
  }
  __name(perfTest, "perfTest");
  perfTest("toString", function() {
    for (const uri of manyFileUris) {
      const data = uri.toString();
      assert.ok(data);
    }
  });
  perfTest("toString(skipEncoding)", function() {
    for (const uri of manyFileUris) {
      const data = uri.toString(true);
      assert.ok(data);
    }
  });
  perfTest("fsPath", function() {
    for (const uri of manyFileUris) {
      const data = uri.fsPath;
      assert.ok(data);
    }
  });
  perfTest("toJSON", function() {
    for (const uri of manyFileUris) {
      const data = uri.toJSON();
      assert.ok(data);
    }
  });
});
//# sourceMappingURL=uri.perf.test.js.map
