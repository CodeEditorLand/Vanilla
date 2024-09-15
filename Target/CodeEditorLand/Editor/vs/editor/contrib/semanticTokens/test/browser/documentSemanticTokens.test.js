var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Barrier, timeout } from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Range } from "../../../../common/core/range.js";
import { DocumentSemanticTokensProvider, SemanticTokens, SemanticTokensEdits, SemanticTokensLegend } from "../../../../common/languages.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { ITextModel } from "../../../../common/model.js";
import { LanguageFeatureDebounceService } from "../../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../../common/services/languageFeaturesService.js";
import { LanguageService } from "../../../../common/services/languageService.js";
import { IModelService } from "../../../../common/services/model.js";
import { ModelService } from "../../../../common/services/modelService.js";
import { SemanticTokensStylingService } from "../../../../common/services/semanticTokensStylingService.js";
import { DocumentSemanticTokensFeature } from "../../browser/documentSemanticTokens.js";
import { getDocumentSemanticTokens, isSemanticTokens } from "../../common/getSemanticTokens.js";
import { TestLanguageConfigurationService } from "../../../../test/common/modes/testLanguageConfigurationService.js";
import { TestTextResourcePropertiesService } from "../../../../test/common/services/testTextResourcePropertiesService.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestDialogService } from "../../../../../platform/dialogs/test/common/testDialogService.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { TestNotificationService } from "../../../../../platform/notification/test/common/testNotificationService.js";
import { ColorScheme } from "../../../../../platform/theme/common/theme.js";
import { TestColorTheme, TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { UndoRedoService } from "../../../../../platform/undoRedo/common/undoRedoService.js";
suite("ModelSemanticColoring", () => {
  const disposables = new DisposableStore();
  let modelService;
  let languageService;
  let languageFeaturesService;
  setup(() => {
    const configService = new TestConfigurationService({ editor: { semanticHighlighting: true } });
    const themeService = new TestThemeService();
    themeService.setTheme(new TestColorTheme({}, ColorScheme.DARK, true));
    const logService = new NullLogService();
    languageFeaturesService = new LanguageFeaturesService();
    languageService = disposables.add(new LanguageService(false));
    const semanticTokensStylingService = disposables.add(new SemanticTokensStylingService(themeService, logService, languageService));
    const instantiationService = new TestInstantiationService();
    instantiationService.set(ILanguageService, languageService);
    instantiationService.set(ILanguageConfigurationService, new TestLanguageConfigurationService());
    modelService = disposables.add(new ModelService(
      configService,
      new TestTextResourcePropertiesService(configService),
      new UndoRedoService(new TestDialogService(), new TestNotificationService()),
      instantiationService
    ));
    const envService = new class extends mock() {
      isBuilt = true;
      isExtensionDevelopment = false;
    }();
    disposables.add(new DocumentSemanticTokensFeature(semanticTokensStylingService, modelService, themeService, configService, new LanguageFeatureDebounceService(logService, envService), languageFeaturesService));
  });
  teardown(() => {
    disposables.clear();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("DocumentSemanticTokens should be fetched when the result is empty if there are pending changes", async () => {
    await runWithFakedTimers({}, async () => {
      disposables.add(languageService.registerLanguage({ id: "testMode" }));
      const inFirstCall = new Barrier();
      const delayFirstResult = new Barrier();
      const secondResultProvided = new Barrier();
      let callCount = 0;
      disposables.add(languageFeaturesService.documentSemanticTokensProvider.register("testMode", new class {
        getLegend() {
          return { tokenTypes: ["class"], tokenModifiers: [] };
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
          callCount++;
          if (callCount === 1) {
            assert.ok("called once");
            inFirstCall.open();
            await delayFirstResult.wait();
            await timeout(0);
            return null;
          }
          if (callCount === 2) {
            assert.ok("called twice");
            secondResultProvided.open();
            return null;
          }
          assert.fail("Unexpected call");
        }
        releaseDocumentSemanticTokens(resultId) {
        }
      }()));
      const textModel = disposables.add(modelService.createModel("Hello world", languageService.createById("testMode")));
      textModel.onBeforeAttached();
      await inFirstCall.wait();
      textModel.applyEdits([{ range: new Range(1, 1, 1, 1), text: "x" }]);
      delayFirstResult.open();
      await secondResultProvided.wait();
      assert.strictEqual(callCount, 2);
    });
  });
  test("issue #149412: VS Code hangs when bad semantic token data is received", async () => {
    await runWithFakedTimers({}, async () => {
      disposables.add(languageService.registerLanguage({ id: "testMode" }));
      let lastResult = null;
      disposables.add(languageFeaturesService.documentSemanticTokensProvider.register("testMode", new class {
        getLegend() {
          return { tokenTypes: ["class"], tokenModifiers: [] };
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
          if (!lastResultId) {
            lastResult = {
              resultId: "1",
              data: new Uint32Array([4294967293, 0, 7, 16, 0, 1, 4, 3, 11, 1])
            };
          } else {
            lastResult = {
              resultId: "2",
              edits: [{
                start: 4294967276,
                deleteCount: 0,
                data: new Uint32Array([2, 0, 3, 11, 0])
              }]
            };
          }
          return lastResult;
        }
        releaseDocumentSemanticTokens(resultId) {
        }
      }()));
      const textModel = disposables.add(modelService.createModel("", languageService.createById("testMode")));
      textModel.onBeforeAttached();
      await Event.toPromise(textModel.onDidChangeTokens);
      assert.strictEqual(lastResult.resultId, "1");
      textModel.applyEdits([{ range: new Range(1, 1, 1, 1), text: "foo" }]);
      await Event.toPromise(textModel.onDidChangeTokens);
      assert.strictEqual(lastResult.resultId, "2");
    });
  });
  test("issue #161573: onDidChangeSemanticTokens doesn't consistently trigger provideDocumentSemanticTokens", async () => {
    await runWithFakedTimers({}, async () => {
      disposables.add(languageService.registerLanguage({ id: "testMode" }));
      const emitter = new Emitter();
      let requestCount = 0;
      disposables.add(languageFeaturesService.documentSemanticTokensProvider.register("testMode", new class {
        onDidChange = emitter.event;
        getLegend() {
          return { tokenTypes: ["class"], tokenModifiers: [] };
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
          requestCount++;
          if (requestCount === 1) {
            await timeout(1e3);
            emitter.fire();
            await timeout(1e3);
            return null;
          }
          return null;
        }
        releaseDocumentSemanticTokens(resultId) {
        }
      }()));
      const textModel = disposables.add(modelService.createModel("", languageService.createById("testMode")));
      textModel.onBeforeAttached();
      await timeout(5e3);
      assert.deepStrictEqual(requestCount, 2);
    });
  });
  test("DocumentSemanticTokens should be pick the token provider with actual items", async () => {
    await runWithFakedTimers({}, async () => {
      let callCount = 0;
      disposables.add(languageService.registerLanguage({ id: "testMode2" }));
      disposables.add(languageFeaturesService.documentSemanticTokensProvider.register("testMode2", new class {
        getLegend() {
          return { tokenTypes: ["class1"], tokenModifiers: [] };
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
          callCount++;
          if (lastResultId) {
            return {
              data: new Uint32Array([2, 1, 1, 1, 1, 0, 2, 1, 1, 1])
            };
          }
          return {
            resultId: "1",
            data: new Uint32Array([0, 1, 1, 1, 1, 0, 2, 1, 1, 1])
          };
        }
        releaseDocumentSemanticTokens(resultId) {
        }
      }()));
      disposables.add(languageFeaturesService.documentSemanticTokensProvider.register("testMode2", new class {
        getLegend() {
          return { tokenTypes: ["class2"], tokenModifiers: [] };
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
          callCount++;
          return null;
        }
        releaseDocumentSemanticTokens(resultId) {
        }
      }()));
      function toArr(arr) {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
          result[i] = arr[i];
        }
        return result;
      }
      __name(toArr, "toArr");
      const textModel = modelService.createModel("Hello world 2", languageService.createById("testMode2"));
      try {
        let result = await getDocumentSemanticTokens(languageFeaturesService.documentSemanticTokensProvider, textModel, null, null, CancellationToken.None);
        assert.ok(result, `We should have tokens (1)`);
        assert.ok(result.tokens, `Tokens are found from multiple providers (1)`);
        assert.ok(isSemanticTokens(result.tokens), `Tokens are full (1)`);
        assert.ok(result.tokens.resultId, `Token result id found from multiple providers (1)`);
        assert.deepStrictEqual(toArr(result.tokens.data), [0, 1, 1, 1, 1, 0, 2, 1, 1, 1], `Token data returned for multiple providers (1)`);
        assert.deepStrictEqual(callCount, 2, `Called both token providers (1)`);
        assert.deepStrictEqual(result.provider.getLegend(), { tokenTypes: ["class1"], tokenModifiers: [] }, `Legend matches the tokens (1)`);
        result = await getDocumentSemanticTokens(languageFeaturesService.documentSemanticTokensProvider, textModel, result.provider, result.tokens.resultId, CancellationToken.None);
        assert.ok(result, `We should have tokens (2)`);
        assert.ok(result.tokens, `Tokens are found from multiple providers (2)`);
        assert.ok(isSemanticTokens(result.tokens), `Tokens are full (2)`);
        assert.ok(!result.tokens.resultId, `Token result id found from multiple providers (2)`);
        assert.deepStrictEqual(toArr(result.tokens.data), [2, 1, 1, 1, 1, 0, 2, 1, 1, 1], `Token data returned for multiple providers (2)`);
        assert.deepStrictEqual(callCount, 4, `Called both token providers (2)`);
        assert.deepStrictEqual(result.provider.getLegend(), { tokenTypes: ["class1"], tokenModifiers: [] }, `Legend matches the tokens (2)`);
      } finally {
        disposables.clear();
        await timeout(0);
        textModel.dispose();
      }
    });
  });
});
//# sourceMappingURL=documentSemanticTokens.test.js.map
