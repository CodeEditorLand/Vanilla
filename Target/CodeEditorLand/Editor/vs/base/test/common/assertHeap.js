var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
let currentTest;
const snapshotsToAssert = [];
setup(function() {
  currentTest = this.currentTest;
});
suiteTeardown(async () => {
  await Promise.all(snapshotsToAssert.map(async (snap) => {
    const counts = await snap.counts;
    const asserts = Object.entries(snap.opts.classes);
    if (asserts.length !== counts.length) {
      throw new Error(`expected class counts to equal assertions length for ${snap.test}`);
    }
    for (const [i, [name, doAssert]] of asserts.entries()) {
      try {
        doAssert(counts[i]);
      } catch (e) {
        throw new Error(`Unexpected number of ${name} instances (${counts[i]}) after "${snap.test}":

${e.message}

Snapshot saved at: ${snap.file}`);
      }
    }
  }));
  snapshotsToAssert.length = 0;
});
const snapshotMinTime = 2e4;
async function assertHeap(opts) {
  if (!currentTest) {
    throw new Error("assertSnapshot can only be used when a test is running");
  }
  if (currentTest.timeout() < snapshotMinTime) {
    currentTest.timeout(snapshotMinTime);
  }
  if (typeof __analyzeSnapshotInTests === "undefined") {
    return;
  }
  const { done, file } = await __analyzeSnapshotInTests(currentTest.fullTitle(), Object.keys(opts.classes));
  snapshotsToAssert.push({ counts: done, file, test: currentTest.fullTitle(), opts });
}
__name(assertHeap, "assertHeap");
export {
  assertHeap
};
//# sourceMappingURL=assertHeap.js.map
