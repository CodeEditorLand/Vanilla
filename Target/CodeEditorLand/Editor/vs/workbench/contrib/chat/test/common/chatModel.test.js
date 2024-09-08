import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { URI } from "../../../../../base/common/uri.js";
import { assertSnapshot } from "../../../../../base/test/common/snapshot.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { OffsetRange } from "../../../../../editor/common/core/offsetRange.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import {
  ILogService,
  NullLogService
} from "../../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import {
  TestExtensionService,
  TestStorageService
} from "../../../../test/common/workbenchTestServices.js";
import {
  ChatAgentLocation,
  ChatAgentService,
  IChatAgentService
} from "../../common/chatAgents.js";
import {
  ChatModel,
  Response,
  normalizeSerializableChatData
} from "../../common/chatModel.js";
import { ChatRequestTextPart } from "../../common/chatParserTypes.js";
suite("ChatModel", () => {
  const testDisposables = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  setup(async () => {
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
    instantiationService.stub(
      IContextKeyService,
      new MockContextKeyService()
    );
    instantiationService.stub(
      IChatAgentService,
      instantiationService.createInstance(ChatAgentService)
    );
  });
  test("Waits for initialization", async () => {
    const model = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Panel
      )
    );
    let hasInitialized = false;
    model.waitForInitialization().then(() => {
      hasInitialized = true;
    });
    await timeout(0);
    assert.strictEqual(hasInitialized, false);
    model.startInitialize();
    model.initialize(void 0);
    await timeout(0);
    assert.strictEqual(hasInitialized, true);
  });
  test("must call startInitialize before initialize", async () => {
    const model = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Panel
      )
    );
    let hasInitialized = false;
    model.waitForInitialization().then(() => {
      hasInitialized = true;
    });
    await timeout(0);
    assert.strictEqual(hasInitialized, false);
    assert.throws(() => model.initialize(void 0));
    assert.strictEqual(hasInitialized, false);
  });
  test("deinitialize/reinitialize", async () => {
    const model = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Panel
      )
    );
    let hasInitialized = false;
    model.waitForInitialization().then(() => {
      hasInitialized = true;
    });
    model.startInitialize();
    model.initialize(void 0);
    await timeout(0);
    assert.strictEqual(hasInitialized, true);
    model.deinitialize();
    let hasInitialized2 = false;
    model.waitForInitialization().then(() => {
      hasInitialized2 = true;
    });
    model.startInitialize();
    model.initialize(void 0);
    await timeout(0);
    assert.strictEqual(hasInitialized2, true);
  });
  test("cannot initialize twice", async () => {
    const model = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Panel
      )
    );
    model.startInitialize();
    model.initialize(void 0);
    assert.throws(() => model.initialize(void 0));
  });
  test("Initialization fails when model is disposed", async () => {
    const model = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Panel
      )
    );
    model.dispose();
    assert.throws(() => model.initialize(void 0));
  });
  test("removeRequest", async () => {
    const model = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Panel
      )
    );
    model.startInitialize();
    model.initialize(void 0);
    const text = "hello";
    model.addRequest(
      {
        text,
        parts: [
          new ChatRequestTextPart(
            new OffsetRange(0, text.length),
            new Range(1, text.length, 1, text.length),
            text
          )
        ]
      },
      { variables: [] },
      0
    );
    const requests = model.getRequests();
    assert.strictEqual(requests.length, 1);
    model.removeRequest(requests[0].id);
    assert.strictEqual(model.getRequests().length, 0);
  });
  test("adoptRequest", async () => {
    const model1 = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Editor
      )
    );
    const model2 = testDisposables.add(
      instantiationService.createInstance(
        ChatModel,
        void 0,
        ChatAgentLocation.Panel
      )
    );
    model1.startInitialize();
    model1.initialize(void 0);
    model2.startInitialize();
    model2.initialize(void 0);
    const text = "hello";
    const request1 = model1.addRequest(
      {
        text,
        parts: [
          new ChatRequestTextPart(
            new OffsetRange(0, text.length),
            new Range(1, text.length, 1, text.length),
            text
          )
        ]
      },
      { variables: [] },
      0
    );
    assert.strictEqual(model1.getRequests().length, 1);
    assert.strictEqual(model2.getRequests().length, 0);
    assert.ok(request1.session === model1);
    assert.ok(request1.response?.session === model1);
    model2.adoptRequest(request1);
    assert.strictEqual(model1.getRequests().length, 0);
    assert.strictEqual(model2.getRequests().length, 1);
    assert.ok(request1.session === model2);
    assert.ok(request1.response?.session === model2);
    model2.acceptResponseProgress(request1, {
      content: new MarkdownString("Hello"),
      kind: "markdownContent"
    });
    assert.strictEqual(request1.response.response.toString(), "Hello");
  });
});
suite("Response", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("mergeable markdown", async () => {
    const response = store.add(new Response([]));
    response.updateContent({
      content: new MarkdownString("markdown1"),
      kind: "markdownContent"
    });
    response.updateContent({
      content: new MarkdownString("markdown2"),
      kind: "markdownContent"
    });
    await assertSnapshot(response.value);
    assert.strictEqual(response.toString(), "markdown1markdown2");
  });
  test("not mergeable markdown", async () => {
    const response = store.add(new Response([]));
    const md1 = new MarkdownString("markdown1");
    md1.supportHtml = true;
    response.updateContent({ content: md1, kind: "markdownContent" });
    response.updateContent({
      content: new MarkdownString("markdown2"),
      kind: "markdownContent"
    });
    await assertSnapshot(response.value);
  });
  test("inline reference", async () => {
    const response = store.add(new Response([]));
    response.updateContent({
      content: new MarkdownString("text before"),
      kind: "markdownContent"
    });
    response.updateContent({
      inlineReference: URI.parse("https://microsoft.com"),
      kind: "inlineReference"
    });
    response.updateContent({
      content: new MarkdownString("text after"),
      kind: "markdownContent"
    });
    await assertSnapshot(response.value);
  });
});
suite("normalizeSerializableChatData", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("v1", () => {
    const v1Data = {
      creationDate: Date.now(),
      initialLocation: void 0,
      isImported: false,
      requesterAvatarIconUri: void 0,
      requesterUsername: "me",
      requests: [],
      responderAvatarIconUri: void 0,
      responderUsername: "bot",
      sessionId: "session1",
      welcomeMessage: []
    };
    const newData = normalizeSerializableChatData(v1Data);
    assert.strictEqual(newData.creationDate, v1Data.creationDate);
    assert.strictEqual(newData.lastMessageDate, v1Data.creationDate);
    assert.strictEqual(newData.version, 3);
    assert.ok("customTitle" in newData);
  });
  test("v2", () => {
    const v2Data = {
      version: 2,
      creationDate: 100,
      lastMessageDate: Date.now(),
      initialLocation: void 0,
      isImported: false,
      requesterAvatarIconUri: void 0,
      requesterUsername: "me",
      requests: [],
      responderAvatarIconUri: void 0,
      responderUsername: "bot",
      sessionId: "session1",
      welcomeMessage: [],
      computedTitle: "computed title"
    };
    const newData = normalizeSerializableChatData(v2Data);
    assert.strictEqual(newData.version, 3);
    assert.strictEqual(newData.creationDate, v2Data.creationDate);
    assert.strictEqual(newData.lastMessageDate, v2Data.lastMessageDate);
    assert.strictEqual(newData.customTitle, v2Data.computedTitle);
  });
  test("old bad data", () => {
    const v1Data = {
      // Testing the scenario where these are missing
      sessionId: void 0,
      creationDate: void 0,
      initialLocation: void 0,
      isImported: false,
      requesterAvatarIconUri: void 0,
      requesterUsername: "me",
      requests: [],
      responderAvatarIconUri: void 0,
      responderUsername: "bot",
      welcomeMessage: []
    };
    const newData = normalizeSerializableChatData(v1Data);
    assert.strictEqual(newData.version, 3);
    assert.ok(newData.creationDate > 0);
    assert.ok(newData.lastMessageDate > 0);
    assert.ok(newData.sessionId);
  });
  test("v3 with bug", () => {
    const v3Data = {
      // Test case where old data was wrongly normalized and these fields were missing
      creationDate: void 0,
      lastMessageDate: void 0,
      version: 3,
      initialLocation: void 0,
      isImported: false,
      requesterAvatarIconUri: void 0,
      requesterUsername: "me",
      requests: [],
      responderAvatarIconUri: void 0,
      responderUsername: "bot",
      sessionId: "session1",
      welcomeMessage: [],
      customTitle: "computed title"
    };
    const newData = normalizeSerializableChatData(v3Data);
    assert.strictEqual(newData.version, 3);
    assert.ok(newData.creationDate > 0);
    assert.ok(newData.lastMessageDate > 0);
    assert.ok(newData.sessionId);
  });
});
