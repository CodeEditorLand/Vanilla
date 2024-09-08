import assert from "assert";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { TestDialogService } from "../../../../platform/dialogs/test/common/testDialogService.js";
import { TestInstantiationService } from "../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { TestNotificationService } from "../../../../platform/notification/test/common/testNotificationService.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { IActivityService } from "../../../services/activity/common/activity.js";
import {
  AuthenticationAccessService,
  IAuthenticationAccessService
} from "../../../services/authentication/browser/authenticationAccessService.js";
import { AuthenticationExtensionsService } from "../../../services/authentication/browser/authenticationExtensionsService.js";
import { AuthenticationService } from "../../../services/authentication/browser/authenticationService.js";
import {
  AuthenticationUsageService,
  IAuthenticationUsageService
} from "../../../services/authentication/browser/authenticationUsageService.js";
import {
  IAuthenticationExtensionsService,
  IAuthenticationService
} from "../../../services/authentication/common/authentication.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import {
  IExtensionService,
  nullExtensionDescription as extensionDescription
} from "../../../services/extensions/common/extensions.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import {
  TestEnvironmentService,
  TestQuickInputService,
  TestRemoteAgentService
} from "../../../test/browser/workbenchTestServices.js";
import {
  TestActivityService,
  TestExtensionService,
  TestProductService,
  TestStorageService
} from "../../../test/common/workbenchTestServices.js";
import { MainThreadAuthentication } from "../../browser/mainThreadAuthentication.js";
import { ExtHostContext, MainContext } from "../../common/extHost.protocol.js";
import { ExtHostAuthentication } from "../../common/extHostAuthentication.js";
import { TestRPCProtocol } from "../common/testRPCProtocol.js";
class AuthQuickPick {
  listener;
  items = [];
  get selectedItems() {
    return this.items;
  }
  onDidAccept(listener) {
    this.listener = listener;
  }
  onDidHide(listener) {
  }
  dispose() {
  }
  show() {
    this.listener({
      inBackground: false
    });
  }
}
class AuthTestQuickInputService extends TestQuickInputService {
  createQuickPick() {
    return new AuthQuickPick();
  }
}
class TestAuthProvider {
  constructor(authProviderName) {
    this.authProviderName = authProviderName;
  }
  id = 1;
  sessions = /* @__PURE__ */ new Map();
  onDidChangeSessions = () => {
    return { dispose() {
    } };
  };
  async getSessions(scopes) {
    if (!scopes) {
      return [...this.sessions.values()];
    }
    if (scopes[0] === "return multiple") {
      return [...this.sessions.values()];
    }
    const sessions = this.sessions.get(scopes.join(" "));
    return sessions ? [sessions] : [];
  }
  async createSession(scopes) {
    const scopesStr = scopes.join(" ");
    const session = {
      scopes,
      id: `${this.id}`,
      account: {
        label: this.authProviderName,
        id: `${this.id}`
      },
      accessToken: Math.random() + ""
    };
    this.sessions.set(scopesStr, session);
    this.id++;
    return session;
  }
  async removeSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}
suite("ExtHostAuthentication", () => {
  let disposables;
  let extHostAuthentication;
  let instantiationService;
  suiteSetup(async () => {
    instantiationService = new TestInstantiationService();
    instantiationService.stub(
      IDialogService,
      new TestDialogService({ confirmed: true })
    );
    instantiationService.stub(IStorageService, new TestStorageService());
    instantiationService.stub(
      IQuickInputService,
      new AuthTestQuickInputService()
    );
    instantiationService.stub(
      IExtensionService,
      new TestExtensionService()
    );
    instantiationService.stub(IActivityService, new TestActivityService());
    instantiationService.stub(
      IRemoteAgentService,
      new TestRemoteAgentService()
    );
    instantiationService.stub(
      INotificationService,
      new TestNotificationService()
    );
    instantiationService.stub(ITelemetryService, NullTelemetryService);
    instantiationService.stub(
      IBrowserWorkbenchEnvironmentService,
      TestEnvironmentService
    );
    instantiationService.stub(IProductService, TestProductService);
    instantiationService.stub(
      IAuthenticationAccessService,
      instantiationService.createInstance(AuthenticationAccessService)
    );
    instantiationService.stub(
      IAuthenticationUsageService,
      instantiationService.createInstance(AuthenticationUsageService)
    );
    const rpcProtocol = new TestRPCProtocol();
    instantiationService.stub(
      IAuthenticationService,
      instantiationService.createInstance(AuthenticationService)
    );
    instantiationService.stub(
      IAuthenticationExtensionsService,
      instantiationService.createInstance(
        AuthenticationExtensionsService
      )
    );
    rpcProtocol.set(
      MainContext.MainThreadAuthentication,
      instantiationService.createInstance(
        MainThreadAuthentication,
        rpcProtocol
      )
    );
    extHostAuthentication = new ExtHostAuthentication(rpcProtocol);
    rpcProtocol.set(
      ExtHostContext.ExtHostAuthentication,
      extHostAuthentication
    );
  });
  setup(async () => {
    disposables = new DisposableStore();
    disposables.add(
      extHostAuthentication.registerAuthenticationProvider(
        "test",
        "test provider",
        new TestAuthProvider("test")
      )
    );
    disposables.add(
      extHostAuthentication.registerAuthenticationProvider(
        "test-multiple",
        "test multiple provider",
        new TestAuthProvider("test-multiple"),
        { supportsMultipleAccounts: true }
      )
    );
  });
  suiteTeardown(() => {
    instantiationService.dispose();
  });
  teardown(() => {
    disposables.dispose();
  });
  test("createIfNone - true", async () => {
    const scopes = ["foo"];
    const session = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], "foo");
  });
  test("createIfNone - false", async () => {
    const scopes = ["foo"];
    const nosession = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {}
    );
    assert.strictEqual(nosession, void 0);
    const session = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], "foo");
    const session2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {}
    );
    assert.strictEqual(session2?.id, session.id);
    assert.strictEqual(session2?.scopes[0], session.scopes[0]);
    assert.strictEqual(session2?.accessToken, session.accessToken);
  });
  test("silent - true", async () => {
    const scopes = ["foo"];
    const nosession = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        silent: true
      }
    );
    assert.strictEqual(nosession, void 0);
    const session = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], "foo");
    const session2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        silent: true
      }
    );
    assert.strictEqual(session.id, session2?.id);
    assert.strictEqual(session.scopes[0], session2?.scopes[0]);
  });
  test("forceNewSession - true - existing session", async () => {
    const scopes = ["foo"];
    const session1 = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        createIfNone: true
      }
    );
    const session2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        forceNewSession: true
      }
    );
    assert.strictEqual(session2?.id, "2");
    assert.strictEqual(session2?.scopes[0], "foo");
    assert.notStrictEqual(session1.accessToken, session2?.accessToken);
  });
  test("forceNewSession - true - no existing session", async () => {
    const scopes = ["foo"];
    const session = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        forceNewSession: true
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], "foo");
  });
  test("forceNewSession - detail", async () => {
    const scopes = ["foo"];
    const session1 = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        createIfNone: true
      }
    );
    const session2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      scopes,
      {
        forceNewSession: { detail: "bar" }
      }
    );
    assert.strictEqual(session2?.id, "2");
    assert.strictEqual(session2?.scopes[0], "foo");
    assert.notStrictEqual(session1.accessToken, session2?.accessToken);
  });
  test("clearSessionPreference - true", async () => {
    const scopes = ["foo"];
    const session = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      scopes,
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], scopes[0]);
    const scopes2 = ["bar"];
    const session2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      scopes2,
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session2?.id, "2");
    assert.strictEqual(session2?.scopes[0], scopes2[0]);
    const session3 = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      ["return multiple"],
      {
        clearSessionPreference: true,
        createIfNone: true
      }
    );
    assert.strictEqual(session3?.id, session.id);
    assert.strictEqual(session3?.scopes[0], session.scopes[0]);
    assert.strictEqual(session3?.accessToken, session.accessToken);
  });
  test("silently getting session should return a session (if any) regardless of preference - fixes #137819", async () => {
    const scopes = ["foo"];
    const session = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      scopes,
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], scopes[0]);
    const scopes2 = ["bar"];
    const session2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      scopes2,
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session2?.id, "2");
    assert.strictEqual(session2?.scopes[0], scopes2[0]);
    const shouldBeSession1 = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      scopes,
      {}
    );
    assert.strictEqual(shouldBeSession1?.id, session.id);
    assert.strictEqual(shouldBeSession1?.scopes[0], session.scopes[0]);
    assert.strictEqual(shouldBeSession1?.accessToken, session.accessToken);
    const shouldBeSession2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      scopes2,
      {}
    );
    assert.strictEqual(shouldBeSession2?.id, session2.id);
    assert.strictEqual(shouldBeSession2?.scopes[0], session2.scopes[0]);
    assert.strictEqual(shouldBeSession2?.accessToken, session2.accessToken);
  });
  test("createIfNone and forceNewSession", async () => {
    try {
      await extHostAuthentication.getSession(
        extensionDescription,
        "test",
        ["foo"],
        {
          createIfNone: true,
          forceNewSession: true
        }
      );
      assert.fail("should have thrown an Error.");
    } catch (e) {
      assert.ok(e);
    }
  });
  test("forceNewSession and silent", async () => {
    try {
      await extHostAuthentication.getSession(
        extensionDescription,
        "test",
        ["foo"],
        {
          forceNewSession: true,
          silent: true
        }
      );
      assert.fail("should have thrown an Error.");
    } catch (e) {
      assert.ok(e);
    }
  });
  test("createIfNone and silent", async () => {
    try {
      await extHostAuthentication.getSession(
        extensionDescription,
        "test",
        ["foo"],
        {
          createIfNone: true,
          silent: true
        }
      );
      assert.fail("should have thrown an Error.");
    } catch (e) {
      assert.ok(e);
    }
  });
  test("Can get multiple sessions (with different scopes) in one extension", async () => {
    let session = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      ["foo"],
      {
        createIfNone: true
      }
    );
    session = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      ["bar"],
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session?.id, "2");
    assert.strictEqual(session?.scopes[0], "bar");
    session = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      ["foo"],
      {
        createIfNone: false
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], "foo");
  });
  test("Can get multiple sessions (from different providers) in one extension", async () => {
    let session = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      ["foo"],
      {
        createIfNone: true
      }
    );
    session = await extHostAuthentication.getSession(
      extensionDescription,
      "test",
      ["foo"],
      {
        createIfNone: true
      }
    );
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], "foo");
    assert.strictEqual(session?.account.label, "test");
    const session2 = await extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      ["foo"],
      {
        createIfNone: false
      }
    );
    assert.strictEqual(session2?.id, "1");
    assert.strictEqual(session2?.scopes[0], "foo");
    assert.strictEqual(session2?.account.label, "test-multiple");
  });
  test("Can get multiple sessions (from different providers) in one extension at the same time", async () => {
    const sessionP = extHostAuthentication.getSession(
      extensionDescription,
      "test",
      ["foo"],
      {
        createIfNone: true
      }
    );
    const session2P = extHostAuthentication.getSession(
      extensionDescription,
      "test-multiple",
      ["foo"],
      {
        createIfNone: true
      }
    );
    const session = await sessionP;
    assert.strictEqual(session?.id, "1");
    assert.strictEqual(session?.scopes[0], "foo");
    assert.strictEqual(session?.account.label, "test");
    const session2 = await session2P;
    assert.strictEqual(session2?.id, "1");
    assert.strictEqual(session2?.scopes[0], "foo");
    assert.strictEqual(session2?.account.label, "test-multiple");
  });
});
