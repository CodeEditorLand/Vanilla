var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { DisposableStore, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ProviderResult } from "../../../../../editor/common/languages.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { ChatAgentLocation, IChatAgent, IChatAgentCommand, IChatAgentCompletionItem, IChatAgentData, IChatAgentHistoryEntry, IChatAgentImplementation, IChatAgentMetadata, IChatAgentRequest, IChatAgentResult, IChatAgentService, IChatParticipantDetectionProvider } from "../../common/chatAgents.js";
import { IChatModel } from "../../common/chatModel.js";
import { IChatProgress, IChatFollowup } from "../../common/chatService.js";
import { IVoiceChatSessionOptions, IVoiceChatTextEvent, VoiceChatService } from "../../common/voiceChatService.js";
import { ISpeechProvider, ISpeechService, ISpeechToTextEvent, ISpeechToTextSession, ITextToSpeechSession, KeywordRecognitionStatus, SpeechToTextStatus } from "../../../speech/common/speechService.js";
import { nullExtensionDescription } from "../../../../services/extensions/common/extensions.js";
suite("VoiceChat", () => {
  class TestChatAgentCommand {
    constructor(name, description) {
      this.name = name;
      this.description = description;
    }
    static {
      __name(this, "TestChatAgentCommand");
    }
  }
  class TestChatAgent {
    constructor(id, slashCommands) {
      this.id = id;
      this.slashCommands = slashCommands;
      this.name = id;
    }
    static {
      __name(this, "TestChatAgent");
    }
    extensionId = nullExtensionDescription.identifier;
    extensionPublisher = "";
    extensionDisplayName = "";
    extensionPublisherId = "";
    locations = [ChatAgentLocation.Panel];
    name;
    fullName;
    description;
    when;
    publisherDisplayName;
    isDefault;
    isDynamic;
    disambiguation = [];
    provideFollowups(request, result, history, token) {
      throw new Error("Method not implemented.");
    }
    provideSampleQuestions(location, token) {
      throw new Error("Method not implemented.");
    }
    invoke(request, progress, history, token) {
      throw new Error("Method not implemented.");
    }
    provideWelcomeMessage(location, token) {
      throw new Error("Method not implemented.");
    }
    metadata = {};
  }
  const agents = [
    new TestChatAgent("workspace", [
      new TestChatAgentCommand("fix", "fix"),
      new TestChatAgentCommand("explain", "explain")
    ]),
    new TestChatAgent("vscode", [
      new TestChatAgentCommand("search", "search")
    ])
  ];
  class TestChatAgentService {
    static {
      __name(this, "TestChatAgentService");
    }
    hasChatParticipantDetectionProviders() {
      throw new Error("Method not implemented.");
    }
    registerChatParticipantDetectionProvider(handle, provider) {
      throw new Error("Method not implemented.");
    }
    detectAgentOrCommand(request, history, options, token) {
      throw new Error("Method not implemented.");
    }
    _serviceBrand;
    onDidChangeAgents = Event.None;
    registerAgentImplementation(id, agent) {
      throw new Error();
    }
    registerDynamicAgent(data, agentImpl) {
      throw new Error("Method not implemented.");
    }
    invokeAgent(id, request, progress, history, token) {
      throw new Error();
    }
    getFollowups(id, request, result, history, token) {
      throw new Error();
    }
    getActivatedAgents() {
      return agents;
    }
    getAgents() {
      return agents;
    }
    getDefaultAgent() {
      throw new Error();
    }
    getContributedDefaultAgent() {
      throw new Error();
    }
    getSecondaryAgent() {
      throw new Error();
    }
    registerAgent(id, data) {
      throw new Error("Method not implemented.");
    }
    getAgent(id) {
      throw new Error("Method not implemented.");
    }
    getAgentsByName(name) {
      throw new Error("Method not implemented.");
    }
    updateAgent(id, updateMetadata) {
      throw new Error("Method not implemented.");
    }
    getAgentByFullyQualifiedId(id) {
      throw new Error("Method not implemented.");
    }
    registerAgentCompletionProvider(id, provider) {
      throw new Error("Method not implemented.");
    }
    getAgentCompletionItems(id, query, token) {
      throw new Error("Method not implemented.");
    }
    agentHasDupeName(id) {
      throw new Error("Method not implemented.");
    }
    getChatTitle(id, history, token) {
      throw new Error("Method not implemented.");
    }
  }
  class TestSpeechService {
    static {
      __name(this, "TestSpeechService");
    }
    _serviceBrand;
    onDidChangeHasSpeechProvider = Event.None;
    hasSpeechProvider = true;
    hasActiveSpeechToTextSession = false;
    hasActiveTextToSpeechSession = false;
    hasActiveKeywordRecognition = false;
    registerSpeechProvider(identifier, provider) {
      throw new Error("Method not implemented.");
    }
    onDidStartSpeechToTextSession = Event.None;
    onDidEndSpeechToTextSession = Event.None;
    async createSpeechToTextSession(token) {
      return {
        onDidChange: emitter.event
      };
    }
    onDidStartTextToSpeechSession = Event.None;
    onDidEndTextToSpeechSession = Event.None;
    async createTextToSpeechSession(token) {
      return {
        onDidChange: Event.None,
        synthesize: /* @__PURE__ */ __name(async () => {
        }, "synthesize")
      };
    }
    onDidStartKeywordRecognition = Event.None;
    onDidEndKeywordRecognition = Event.None;
    recognizeKeyword(token) {
      throw new Error("Method not implemented.");
    }
  }
  const disposables = new DisposableStore();
  let emitter;
  let service;
  let event;
  async function createSession(options) {
    const cts = new CancellationTokenSource();
    disposables.add(toDisposable(() => cts.dispose(true)));
    const session = await service.createVoiceChatSession(cts.token, options);
    disposables.add(session.onDidChange((e) => {
      event = e;
    }));
  }
  __name(createSession, "createSession");
  setup(() => {
    emitter = disposables.add(new Emitter());
    service = disposables.add(new VoiceChatService(new TestSpeechService(), new TestChatAgentService(), new MockContextKeyService()));
  });
  teardown(() => {
    disposables.clear();
  });
  test("Agent and slash command detection (useAgents: false)", async () => {
    await testAgentsAndSlashCommandsDetection({ usesAgents: false, model: {} });
  });
  test("Agent and slash command detection (useAgents: true)", async () => {
    await testAgentsAndSlashCommandsDetection({ usesAgents: true, model: {} });
  });
  async function testAgentsAndSlashCommandsDetection(options) {
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Started });
    assert.strictEqual(event?.status, SpeechToTextStatus.Started);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "Hello" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, "Hello");
    assert.strictEqual(event?.waitingForInput, void 0);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "Hello World" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, "Hello World");
    assert.strictEqual(event?.waitingForInput, void 0);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "Hello World" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, "Hello World");
    assert.strictEqual(event?.waitingForInput, void 0);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, "At");
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At workspace" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace" : "At workspace");
    assert.strictEqual(event?.waitingForInput, options.usesAgents);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "at workspace" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace" : "at workspace");
    assert.strictEqual(event?.waitingForInput, options.usesAgents);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At workspace help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace help" : "At workspace help");
    assert.strictEqual(event?.waitingForInput, false);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At workspace help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace help" : "At workspace help");
    assert.strictEqual(event?.waitingForInput, false);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At workspace, help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace help" : "At workspace, help");
    assert.strictEqual(event?.waitingForInput, false);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At workspace, help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace help" : "At workspace, help");
    assert.strictEqual(event?.waitingForInput, false);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At Workspace. help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace help" : "At Workspace. help");
    assert.strictEqual(event?.waitingForInput, false);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At Workspace. help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace help" : "At Workspace. help");
    assert.strictEqual(event?.waitingForInput, false);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "Slash fix" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace /fix" : "/fix");
    assert.strictEqual(event?.waitingForInput, true);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "Slash fix" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace /fix" : "/fix");
    assert.strictEqual(event?.waitingForInput, true);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At code slash search help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@vscode /search help" : "At code slash search help");
    assert.strictEqual(event?.waitingForInput, false);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At code slash search help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@vscode /search help" : "At code slash search help");
    assert.strictEqual(event?.waitingForInput, false);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At code, slash search, help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@vscode /search help" : "At code, slash search, help");
    assert.strictEqual(event?.waitingForInput, false);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At code, slash search, help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@vscode /search help" : "At code, slash search, help");
    assert.strictEqual(event?.waitingForInput, false);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At code. slash, search help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@vscode /search help" : "At code. slash, search help");
    assert.strictEqual(event?.waitingForInput, false);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At code. slash search, help" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@vscode /search help" : "At code. slash search, help");
    assert.strictEqual(event?.waitingForInput, false);
    await createSession(options);
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At workspace, for at workspace" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace for at workspace" : "At workspace, for at workspace");
    assert.strictEqual(event?.waitingForInput, false);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At workspace, for at workspace" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, options.usesAgents ? "@workspace for at workspace" : "At workspace, for at workspace");
    assert.strictEqual(event?.waitingForInput, false);
    if (options.usesAgents) {
      await createSession(options);
      emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At workspace" });
      assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
      assert.strictEqual(event?.text, "@workspace");
      assert.strictEqual(event?.waitingForInput, true);
      emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "slash" });
      assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
      assert.strictEqual(event?.text, "slash");
      assert.strictEqual(event?.waitingForInput, false);
      emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "slash fix" });
      assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
      assert.strictEqual(event?.text, "/fix");
      assert.strictEqual(event?.waitingForInput, true);
      emitter.fire({ status: SpeechToTextStatus.Recognized, text: "slash fix" });
      assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
      assert.strictEqual(event?.text, "/fix");
      assert.strictEqual(event?.waitingForInput, true);
      await createSession(options);
      emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At workspace" });
      assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
      assert.strictEqual(event?.text, "@workspace");
      assert.strictEqual(event?.waitingForInput, true);
      emitter.fire({ status: SpeechToTextStatus.Recognized, text: "slash fix" });
      assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
      assert.strictEqual(event?.text, "/fix");
      assert.strictEqual(event?.waitingForInput, true);
    }
  }
  __name(testAgentsAndSlashCommandsDetection, "testAgentsAndSlashCommandsDetection");
  test("waiting for input", async () => {
    await createSession({ usesAgents: true, model: {} });
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At workspace" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, "@workspace");
    assert.strictEqual(event.waitingForInput, true);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At workspace" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, "@workspace");
    assert.strictEqual(event.waitingForInput, true);
    await createSession({ usesAgents: true, model: {} });
    emitter.fire({ status: SpeechToTextStatus.Recognizing, text: "At workspace slash explain" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognizing);
    assert.strictEqual(event?.text, "@workspace /explain");
    assert.strictEqual(event.waitingForInput, true);
    emitter.fire({ status: SpeechToTextStatus.Recognized, text: "At workspace slash explain" });
    assert.strictEqual(event?.status, SpeechToTextStatus.Recognized);
    assert.strictEqual(event?.text, "@workspace /explain");
    assert.strictEqual(event.waitingForInput, true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=voiceChatService.test.js.map
