import assert from "assert";
import {
  CancellationToken,
  CancellationTokenSource
} from "../../common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("CancellationToken", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("None", () => {
    assert.strictEqual(
      CancellationToken.None.isCancellationRequested,
      false
    );
    assert.strictEqual(
      typeof CancellationToken.None.onCancellationRequested,
      "function"
    );
  });
  test("cancel before token", () => {
    const source = new CancellationTokenSource();
    assert.strictEqual(source.token.isCancellationRequested, false);
    source.cancel();
    assert.strictEqual(source.token.isCancellationRequested, true);
    return new Promise((resolve) => {
      source.token.onCancellationRequested(() => resolve());
    });
  });
  test("cancel happens only once", () => {
    const source = new CancellationTokenSource();
    assert.strictEqual(source.token.isCancellationRequested, false);
    let cancelCount = 0;
    function onCancel() {
      cancelCount += 1;
    }
    store.add(source.token.onCancellationRequested(onCancel));
    source.cancel();
    source.cancel();
    assert.strictEqual(cancelCount, 1);
  });
  test("cancel calls all listeners", () => {
    let count = 0;
    const source = new CancellationTokenSource();
    store.add(source.token.onCancellationRequested(() => count++));
    store.add(source.token.onCancellationRequested(() => count++));
    store.add(source.token.onCancellationRequested(() => count++));
    source.cancel();
    assert.strictEqual(count, 3);
  });
  test("token stays the same", () => {
    let source = new CancellationTokenSource();
    let token = source.token;
    assert.ok(token === source.token);
    source.cancel();
    assert.ok(token === source.token);
    source.cancel();
    assert.ok(token === source.token);
    source = new CancellationTokenSource();
    source.cancel();
    token = source.token;
    assert.ok(token === source.token);
  });
  test("dispose calls no listeners", () => {
    let count = 0;
    const source = new CancellationTokenSource();
    store.add(source.token.onCancellationRequested(() => count++));
    source.dispose();
    source.cancel();
    assert.strictEqual(count, 0);
  });
  test("dispose calls no listeners (unless told to cancel)", () => {
    let count = 0;
    const source = new CancellationTokenSource();
    store.add(source.token.onCancellationRequested(() => count++));
    source.dispose(true);
    assert.strictEqual(count, 1);
  });
  test("dispose does not cancel", () => {
    const source = new CancellationTokenSource();
    source.dispose();
    assert.strictEqual(source.token.isCancellationRequested, false);
  });
  test("parent cancels child", () => {
    const parent = new CancellationTokenSource();
    const child = new CancellationTokenSource(parent.token);
    let count = 0;
    store.add(child.token.onCancellationRequested(() => count++));
    parent.cancel();
    assert.strictEqual(count, 1);
    assert.strictEqual(child.token.isCancellationRequested, true);
    assert.strictEqual(parent.token.isCancellationRequested, true);
    child.dispose();
    parent.dispose();
  });
});
