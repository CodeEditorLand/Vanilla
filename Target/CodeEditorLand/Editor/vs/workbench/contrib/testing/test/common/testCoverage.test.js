import assert from "assert";
import { createSandbox } from "sinon";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { onObservableChange } from "../../common/observableUtils.js";
import {
  TestCoverage
} from "../../common/testCoverage.js";
suite("TestCoverage", () => {
  let sandbox;
  let coverageAccessor;
  let testCoverage;
  const ds = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    sandbox = createSandbox();
    coverageAccessor = {
      getCoverageDetails: sandbox.stub().resolves([])
    };
    testCoverage = new TestCoverage(
      {},
      "taskId",
      { extUri: { ignorePathCasing: () => true } },
      coverageAccessor
    );
  });
  teardown(() => {
    sandbox.restore();
  });
  function addTests() {
    const raw1 = {
      id: "1",
      uri: URI.file("/path/to/file"),
      statement: { covered: 10, total: 20 },
      branch: { covered: 5, total: 10 },
      declaration: { covered: 2, total: 5 }
    };
    testCoverage.append(raw1, void 0);
    const raw2 = {
      id: "1",
      uri: URI.file("/path/to/file2"),
      statement: { covered: 5, total: 10 },
      branch: { covered: 1, total: 5 }
    };
    testCoverage.append(raw2, void 0);
    return { raw1, raw2 };
  }
  test("should look up file coverage", async () => {
    const { raw1 } = addTests();
    const fileCoverage = testCoverage.getUri(raw1.uri);
    assert.equal(fileCoverage?.id, raw1.id);
    assert.deepEqual(fileCoverage?.statement, raw1.statement);
    assert.deepEqual(fileCoverage?.branch, raw1.branch);
    assert.deepEqual(fileCoverage?.declaration, raw1.declaration);
    assert.strictEqual(
      testCoverage.getComputedForUri(raw1.uri),
      testCoverage.getUri(raw1.uri)
    );
    assert.strictEqual(
      testCoverage.getComputedForUri(URI.file("/path/to/x")),
      void 0
    );
    assert.strictEqual(
      testCoverage.getUri(URI.file("/path/to/x")),
      void 0
    );
  });
  test("should compute coverage for directories", async () => {
    const { raw1 } = addTests();
    const dirCoverage = testCoverage.getComputedForUri(
      URI.file("/path/to")
    );
    assert.deepEqual(dirCoverage?.statement, { covered: 15, total: 30 });
    assert.deepEqual(dirCoverage?.branch, { covered: 6, total: 15 });
    assert.deepEqual(dirCoverage?.declaration, raw1.declaration);
  });
  test("should incrementally diff updates to existing files", async () => {
    addTests();
    const raw3 = {
      id: "1",
      uri: URI.file("/path/to/file"),
      statement: { covered: 12, total: 24 },
      branch: { covered: 7, total: 10 },
      declaration: { covered: 2, total: 5 }
    };
    testCoverage.append(raw3, void 0);
    const fileCoverage = testCoverage.getUri(raw3.uri);
    assert.deepEqual(fileCoverage?.statement, raw3.statement);
    assert.deepEqual(fileCoverage?.branch, raw3.branch);
    assert.deepEqual(fileCoverage?.declaration, raw3.declaration);
    const dirCoverage = testCoverage.getComputedForUri(
      URI.file("/path/to")
    );
    assert.deepEqual(dirCoverage?.statement, { covered: 17, total: 34 });
    assert.deepEqual(dirCoverage?.branch, { covered: 8, total: 15 });
    assert.deepEqual(dirCoverage?.declaration, raw3.declaration);
  });
  test("should emit changes", async () => {
    const changes = [];
    ds.add(
      onObservableChange(
        testCoverage.didAddCoverage,
        (value) => changes.push(value.map((v) => v.value.uri.toString()))
      )
    );
    addTests();
    assert.deepStrictEqual(changes, [
      [
        "file:///",
        "file:///",
        "file:///",
        "file:///path",
        "file:///path/to",
        "file:///path/to/file"
      ],
      [
        "file:///",
        "file:///",
        "file:///",
        "file:///path",
        "file:///path/to",
        "file:///path/to/file2"
      ]
    ]);
  });
});
