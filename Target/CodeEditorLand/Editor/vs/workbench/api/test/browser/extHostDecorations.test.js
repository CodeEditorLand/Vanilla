import assert from "assert";
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { nullExtensionDescription } from "../../../services/extensions/common/extensions.js";
import { ExtHostDecorations } from "../../common/extHostDecorations.js";
suite("ExtHostDecorations", () => {
  let mainThreadShape;
  let extHostDecorations;
  const providers = /* @__PURE__ */ new Set();
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    providers.clear();
    mainThreadShape = new class extends mock() {
      $registerDecorationProvider(handle) {
        providers.add(handle);
      }
    }();
    extHostDecorations = new ExtHostDecorations(
      new class extends mock() {
        getProxy() {
          return mainThreadShape;
        }
      }(),
      new NullLogService()
    );
  });
  test("SCM Decorations missing #100524", async () => {
    let calledA = false;
    let calledB = false;
    extHostDecorations.registerFileDecorationProvider(
      {
        provideFileDecoration() {
          calledA = true;
          return new Promise(() => {
          });
        }
      },
      nullExtensionDescription
    );
    extHostDecorations.registerFileDecorationProvider(
      {
        provideFileDecoration() {
          calledB = true;
          return new Promise(
            (resolve) => resolve({ badge: "H", tooltip: "Hello" })
          );
        }
      },
      nullExtensionDescription
    );
    const requests = [...providers.values()].map((handle, idx) => {
      return extHostDecorations.$provideDecorations(
        handle,
        [{ id: idx, uri: URI.parse("test:///file") }],
        CancellationToken.None
      );
    });
    assert.strictEqual(calledA, true);
    assert.strictEqual(calledB, true);
    assert.strictEqual(requests.length, 2);
    const [first, second] = requests;
    const firstResult = await Promise.race([
      first,
      timeout(30).then(() => false)
    ]);
    assert.strictEqual(typeof firstResult, "boolean");
    const secondResult = await Promise.race([
      second,
      timeout(30).then(() => false)
    ]);
    assert.strictEqual(typeof secondResult, "object");
    await timeout(30);
  });
});
