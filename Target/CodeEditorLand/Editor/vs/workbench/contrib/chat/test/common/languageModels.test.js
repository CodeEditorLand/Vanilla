var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { AsyncIterableSource, DeferredPromise, timeout } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { ChatMessageRole, IChatResponseFragment, languageModelExtensionPoint, LanguageModelsService } from "../../common/languageModels.js";
import { IExtensionService, nullExtensionDescription } from "../../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../../services/extensions/common/extensionsRegistry.js";
suite("LanguageModels", function() {
  let languageModels;
  const store = new DisposableStore();
  const activationEvents = /* @__PURE__ */ new Set();
  setup(function() {
    languageModels = new LanguageModelsService(
      new class extends mock() {
        activateByEvent(name) {
          activationEvents.add(name);
          return Promise.resolve();
        }
      }(),
      new NullLogService()
    );
    const ext = ExtensionsRegistry.getExtensionPoints().find((e) => e.name === languageModelExtensionPoint.name);
    ext.acceptUsers([{
      description: { ...nullExtensionDescription, enabledApiProposals: ["chatProvider"] },
      value: { vendor: "test-vendor" },
      collector: null
    }]);
    store.add(languageModels.registerLanguageModelChat("1", {
      metadata: {
        extension: nullExtensionDescription.identifier,
        name: "Pretty Name",
        vendor: "test-vendor",
        family: "test-family",
        version: "test-version",
        id: "test-id",
        maxInputTokens: 100,
        maxOutputTokens: 100
      },
      sendChatRequest: /* @__PURE__ */ __name(async () => {
        throw new Error();
      }, "sendChatRequest"),
      provideTokenCount: /* @__PURE__ */ __name(async () => {
        throw new Error();
      }, "provideTokenCount")
    }));
    store.add(languageModels.registerLanguageModelChat("12", {
      metadata: {
        extension: nullExtensionDescription.identifier,
        name: "Pretty Name",
        vendor: "test-vendor",
        family: "test2-family",
        version: "test2-version",
        id: "test-id",
        maxInputTokens: 100,
        maxOutputTokens: 100
      },
      sendChatRequest: /* @__PURE__ */ __name(async () => {
        throw new Error();
      }, "sendChatRequest"),
      provideTokenCount: /* @__PURE__ */ __name(async () => {
        throw new Error();
      }, "provideTokenCount")
    }));
  });
  teardown(function() {
    languageModels.dispose();
    activationEvents.clear();
    store.clear();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("empty selector returns all", async function() {
    const result1 = await languageModels.selectLanguageModels({});
    assert.deepStrictEqual(result1.length, 2);
    assert.deepStrictEqual(result1[0], "1");
    assert.deepStrictEqual(result1[1], "12");
  });
  test("no warning that a matching model was not found #213716", async function() {
    const result1 = await languageModels.selectLanguageModels({ vendor: "test-vendor" });
    assert.deepStrictEqual(result1.length, 2);
    const result2 = await languageModels.selectLanguageModels({ vendor: "test-vendor", family: "FAKE" });
    assert.deepStrictEqual(result2.length, 0);
  });
  test("sendChatRequest returns a response-stream", async function() {
    store.add(languageModels.registerLanguageModelChat("actual", {
      metadata: {
        extension: nullExtensionDescription.identifier,
        name: "Pretty Name",
        vendor: "test-vendor",
        family: "actual-family",
        version: "actual-version",
        id: "actual-lm",
        maxInputTokens: 100,
        maxOutputTokens: 100
      },
      sendChatRequest: /* @__PURE__ */ __name(async (messages, _from, _options, token) => {
        const defer = new DeferredPromise();
        const stream = new AsyncIterableSource();
        (async () => {
          while (!token.isCancellationRequested) {
            stream.emitOne({ index: 0, part: { type: "text", value: Date.now().toString() } });
            await timeout(10);
          }
          defer.complete(void 0);
        })();
        return {
          stream: stream.asyncIterable,
          result: defer.p
        };
      }, "sendChatRequest"),
      provideTokenCount: /* @__PURE__ */ __name(async () => {
        throw new Error();
      }, "provideTokenCount")
    }));
    const models = await languageModels.selectLanguageModels({ identifier: "actual-lm" });
    assert.ok(models.length === 1);
    const first = models[0];
    const cts = new CancellationTokenSource();
    const request = await languageModels.sendChatRequest(first, nullExtensionDescription.identifier, [{ role: ChatMessageRole.User, content: [{ type: "text", value: "hello" }] }], {}, cts.token);
    assert.ok(request);
    cts.dispose(true);
    await request.result;
  });
});
//# sourceMappingURL=languageModels.test.js.map
