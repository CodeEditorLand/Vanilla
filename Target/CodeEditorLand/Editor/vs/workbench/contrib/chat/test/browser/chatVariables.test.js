import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import {
  ILogService,
  NullLogService
} from "../../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { TestViewsService } from "../../../../test/browser/workbenchTestServices.js";
import {
  TestExtensionService,
  TestStorageService
} from "../../../../test/common/workbenchTestServices.js";
import { ChatVariablesService } from "../../browser/chatVariables.js";
import {
  ChatAgentService,
  IChatAgentService
} from "../../common/chatAgents.js";
import { ChatRequestParser } from "../../common/chatRequestParser.js";
import { IChatService } from "../../common/chatService.js";
import { IChatVariablesService } from "../../common/chatVariables.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { MockChatService } from "../common/mockChatService.js";
import { MockLanguageModelToolsService } from "../common/mockLanguageModelToolsService.js";
import { MockChatWidgetService } from "./mockChatWidget.js";
suite("ChatVariables", () => {
  let service;
  let instantiationService;
  const testDisposables = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    service = new ChatVariablesService(
      new MockChatWidgetService(),
      new TestViewsService(),
      new MockLanguageModelToolsService()
    );
    instantiationService = testDisposables.add(
      new TestInstantiationService()
    );
    instantiationService.stub(
      IStorageService,
      testDisposables.add(new TestStorageService())
    );
    instantiationService.stub(ILogService, new NullLogService());
    instantiationService.stub(
      IExtensionService,
      new TestExtensionService()
    );
    instantiationService.stub(IChatVariablesService, service);
    instantiationService.stub(IChatService, new MockChatService());
    instantiationService.stub(
      IContextKeyService,
      new MockContextKeyService()
    );
    instantiationService.stub(
      ILanguageModelToolsService,
      new MockLanguageModelToolsService()
    );
    instantiationService.stub(
      IChatAgentService,
      instantiationService.createInstance(ChatAgentService)
    );
  });
  test("ChatVariables - resolveVariables", async () => {
    const v1 = service.registerVariable(
      { id: "id", name: "foo", description: "bar" },
      async () => "farboo"
    );
    const v2 = service.registerVariable(
      { id: "id", name: "far", description: "boo" },
      async () => "farboo"
    );
    const parser = instantiationService.createInstance(ChatRequestParser);
    const resolveVariables = async (text) => {
      const result = parser.parseChatRequest("1", text);
      return await service.resolveVariables(
        result,
        void 0,
        null,
        () => {
        },
        CancellationToken.None
      );
    };
    {
      const data = await resolveVariables("Hello #foo and#far");
      assert.strictEqual(data.variables.length, 1);
      assert.deepEqual(
        data.variables.map((v) => v.name),
        ["foo"]
      );
    }
    {
      const data = await resolveVariables("#foo Hello");
      assert.strictEqual(data.variables.length, 1);
      assert.deepEqual(
        data.variables.map((v) => v.name),
        ["foo"]
      );
    }
    {
      const data = await resolveVariables("Hello #foo");
      assert.strictEqual(data.variables.length, 1);
      assert.deepEqual(
        data.variables.map((v) => v.name),
        ["foo"]
      );
    }
    {
      const data = await resolveVariables("Hello #foo?");
      assert.strictEqual(data.variables.length, 1);
      assert.deepEqual(
        data.variables.map((v) => v.name),
        ["foo"]
      );
    }
    {
      const data = await resolveVariables("Hello #foo and#far #foo");
      assert.strictEqual(data.variables.length, 2);
      assert.deepEqual(
        data.variables.map((v) => v.name),
        ["foo", "foo"]
      );
    }
    {
      const data = await resolveVariables("Hello #foo and #far #foo");
      assert.strictEqual(data.variables.length, 3);
      assert.deepEqual(
        data.variables.map((v) => v.name),
        ["foo", "far", "foo"]
      );
    }
    {
      const data = await resolveVariables(
        "Hello #foo and #far #foo #unknown"
      );
      assert.strictEqual(data.variables.length, 3);
      assert.deepEqual(
        data.variables.map((v) => v.name),
        ["foo", "far", "foo"]
      );
    }
    v1.dispose();
    v2.dispose();
  });
});
