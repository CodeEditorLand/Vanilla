var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ContextKeyService } from "../../../../../platform/contextkey/browser/contextKeyService.js";
import { ContextKeyEqualsExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { TestExtensionService } from "../../../../test/common/workbenchTestServices.js";
import { IToolData, IToolImpl, IToolInvocation, LanguageModelToolsService } from "../../common/languageModelToolsService.js";
suite("LanguageModelToolsService", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let contextKeyService;
  let service;
  setup(() => {
    const extensionService = new TestExtensionService();
    contextKeyService = store.add(new ContextKeyService(new TestConfigurationService()));
    service = store.add(new LanguageModelToolsService(extensionService, contextKeyService));
  });
  test("registerToolData", () => {
    const toolData = {
      id: "testTool",
      modelDescription: "Test Tool"
    };
    const disposable = service.registerToolData(toolData);
    assert.strictEqual(service.getTool("testTool")?.id, "testTool");
    disposable.dispose();
    assert.strictEqual(service.getTool("testTool"), void 0);
  });
  test("registerToolImplementation", () => {
    const toolData = {
      id: "testTool",
      modelDescription: "Test Tool"
    };
    store.add(service.registerToolData(toolData));
    const toolImpl = {
      invoke: /* @__PURE__ */ __name(async () => ({ string: "result" }), "invoke")
    };
    store.add(service.registerToolImplementation("testTool", toolImpl));
    assert.strictEqual(service.getTool("testTool")?.id, "testTool");
  });
  test("getTools", () => {
    contextKeyService.createKey("testKey", true);
    const toolData1 = {
      id: "testTool1",
      modelDescription: "Test Tool 1",
      when: ContextKeyEqualsExpr.create("testKey", false)
    };
    const toolData2 = {
      id: "testTool2",
      modelDescription: "Test Tool 2",
      when: ContextKeyEqualsExpr.create("testKey", true)
    };
    const toolData3 = {
      id: "testTool3",
      modelDescription: "Test Tool 3"
    };
    store.add(service.registerToolData(toolData1));
    store.add(service.registerToolData(toolData2));
    store.add(service.registerToolData(toolData3));
    const tools = Array.from(service.getTools());
    assert.strictEqual(tools.length, 2);
    assert.strictEqual(tools[0].id, "testTool2");
    assert.strictEqual(tools[1].id, "testTool3");
  });
  test("invokeTool", async () => {
    const toolData = {
      id: "testTool",
      modelDescription: "Test Tool"
    };
    store.add(service.registerToolData(toolData));
    const toolImpl = {
      invoke: /* @__PURE__ */ __name(async (invocation) => {
        assert.strictEqual(invocation.callId, "1");
        assert.strictEqual(invocation.toolId, "testTool");
        assert.deepStrictEqual(invocation.parameters, { a: 1 });
        return { string: "result" };
      }, "invoke")
    };
    store.add(service.registerToolImplementation("testTool", toolImpl));
    const dto = {
      callId: "1",
      toolId: "testTool",
      tokenBudget: 100,
      parameters: {
        a: 1
      },
      context: { sessionId: "a" }
    };
    const result = await service.invokeTool(dto, async () => 0, CancellationToken.None);
    assert.strictEqual(result.string, "result");
  });
});
//# sourceMappingURL=languageModelToolsService.test.js.map
