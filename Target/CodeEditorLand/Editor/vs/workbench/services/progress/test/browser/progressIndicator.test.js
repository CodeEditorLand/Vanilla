import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  AbstractProgressScope,
  ScopedProgressIndicator
} from "../../browser/progressIndicator.js";
class TestProgressBar {
  fTotal = 0;
  fWorked = 0;
  fInfinite = false;
  fDone = false;
  infinite() {
    this.fDone = null;
    this.fInfinite = true;
    return this;
  }
  total(total) {
    this.fDone = null;
    this.fTotal = total;
    return this;
  }
  hasTotal() {
    return !!this.fTotal;
  }
  worked(worked) {
    this.fDone = null;
    if (this.fWorked) {
      this.fWorked += worked;
    } else {
      this.fWorked = worked;
    }
    return this;
  }
  done() {
    this.fDone = true;
    this.fInfinite = null;
    this.fWorked = null;
    this.fTotal = null;
    return this;
  }
  stop() {
    return this.done();
  }
  show() {
  }
  hide() {
  }
}
suite("Progress Indicator", () => {
  const disposables = new DisposableStore();
  teardown(() => {
    disposables.clear();
  });
  test("ScopedProgressIndicator", async () => {
    const testProgressBar = new TestProgressBar();
    const progressScope = disposables.add(
      new class extends AbstractProgressScope {
        constructor() {
          super("test.scopeId", true);
        }
        testOnScopeOpened(scopeId) {
          super.onScopeOpened(scopeId);
        }
        testOnScopeClosed(scopeId) {
          super.onScopeClosed(scopeId);
        }
      }()
    );
    const testObject = disposables.add(
      new ScopedProgressIndicator(testProgressBar, progressScope)
    );
    let fn = testObject.show(true);
    assert.strictEqual(true, testProgressBar.fInfinite);
    fn.done();
    assert.strictEqual(true, testProgressBar.fDone);
    fn = testObject.show(100);
    assert.strictEqual(false, !!testProgressBar.fInfinite);
    assert.strictEqual(100, testProgressBar.fTotal);
    fn.worked(20);
    assert.strictEqual(20, testProgressBar.fWorked);
    fn.total(80);
    assert.strictEqual(80, testProgressBar.fTotal);
    fn.done();
    assert.strictEqual(true, testProgressBar.fDone);
    progressScope.testOnScopeClosed("test.scopeId");
    testObject.show(true);
    assert.strictEqual(false, !!testProgressBar.fInfinite);
    progressScope.testOnScopeOpened("test.scopeId");
    assert.strictEqual(true, testProgressBar.fInfinite);
    progressScope.testOnScopeClosed("test.scopeId");
    fn = testObject.show(100);
    fn.total(80);
    fn.worked(20);
    assert.strictEqual(false, !!testProgressBar.fTotal);
    progressScope.testOnScopeOpened("test.scopeId");
    assert.strictEqual(20, testProgressBar.fWorked);
    assert.strictEqual(80, testProgressBar.fTotal);
    let p = Promise.resolve(null);
    await testObject.showWhile(p);
    assert.strictEqual(true, testProgressBar.fDone);
    progressScope.testOnScopeClosed("test.scopeId");
    p = Promise.resolve(null);
    await testObject.showWhile(p);
    assert.strictEqual(true, testProgressBar.fDone);
    progressScope.testOnScopeOpened("test.scopeId");
    assert.strictEqual(true, testProgressBar.fDone);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
