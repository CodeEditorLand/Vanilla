var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MockObject, mockObject } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { ChatAgentService, IChatAgentData, IChatAgentImplementation, IChatAgentService } from "../../common/chatAgents.js";
import assert from "assert";
const testAgentId = "testAgent";
const testAgentData = {
  id: testAgentId,
  name: "Test Agent",
  extensionDisplayName: "",
  extensionId: new ExtensionIdentifier(""),
  extensionPublisherId: "",
  locations: [],
  metadata: {},
  slashCommands: [],
  disambiguation: []
};
suite("ChatAgents", function() {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let chatAgentService;
  let contextKeyService;
  setup(() => {
    contextKeyService = mockObject()();
    chatAgentService = new ChatAgentService(contextKeyService);
  });
  test("registerAgent", async () => {
    assert.strictEqual(chatAgentService.getAgents().length, 0);
    const agentRegistration = chatAgentService.registerAgent(testAgentId, testAgentData);
    assert.strictEqual(chatAgentService.getAgents().length, 1);
    assert.strictEqual(chatAgentService.getAgents()[0].id, testAgentId);
    assert.throws(() => chatAgentService.registerAgent(testAgentId, testAgentData));
    agentRegistration.dispose();
    assert.strictEqual(chatAgentService.getAgents().length, 0);
  });
  test("agent when clause", async () => {
    assert.strictEqual(chatAgentService.getAgents().length, 0);
    store.add(chatAgentService.registerAgent(testAgentId, {
      ...testAgentData,
      when: "myKey"
    }));
    assert.strictEqual(chatAgentService.getAgents().length, 0);
    contextKeyService.contextMatchesRules.returns(true);
    assert.strictEqual(chatAgentService.getAgents().length, 1);
  });
  suite("registerAgentImplementation", function() {
    const agentImpl = {
      invoke: /* @__PURE__ */ __name(async () => {
        return {};
      }, "invoke"),
      provideFollowups: /* @__PURE__ */ __name(async () => {
        return [];
      }, "provideFollowups")
    };
    test("should register an agent implementation", () => {
      store.add(chatAgentService.registerAgent(testAgentId, testAgentData));
      store.add(chatAgentService.registerAgentImplementation(testAgentId, agentImpl));
      const agents = chatAgentService.getActivatedAgents();
      assert.strictEqual(agents.length, 1);
      assert.strictEqual(agents[0].id, testAgentId);
    });
    test("can dispose an agent implementation", () => {
      store.add(chatAgentService.registerAgent(testAgentId, testAgentData));
      const implRegistration = chatAgentService.registerAgentImplementation(testAgentId, agentImpl);
      implRegistration.dispose();
      const agents = chatAgentService.getActivatedAgents();
      assert.strictEqual(agents.length, 0);
    });
    test("should throw error if agent does not exist", () => {
      assert.throws(() => chatAgentService.registerAgentImplementation("nonexistentAgent", agentImpl));
    });
    test("should throw error if agent already has an implementation", () => {
      store.add(chatAgentService.registerAgent(testAgentId, testAgentData));
      store.add(chatAgentService.registerAgentImplementation(testAgentId, agentImpl));
      assert.throws(() => chatAgentService.registerAgentImplementation(testAgentId, agentImpl));
    });
  });
});
//# sourceMappingURL=chatAgents.test.js.map
