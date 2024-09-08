import assert from "assert";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestEnvironmentService } from "../../../../test/browser/workbenchTestServices.js";
import {
  TestExtensionService,
  TestProductService,
  TestStorageService
} from "../../../../test/common/workbenchTestServices.js";
import { AuthenticationAccessService } from "../../browser/authenticationAccessService.js";
import { AuthenticationService } from "../../browser/authenticationService.js";
function createSession() {
  return {
    id: "session1",
    accessToken: "token1",
    account: { id: "account", label: "Account" },
    scopes: ["test"]
  };
}
function createProvider(overrides = {}) {
  return {
    supportsMultipleAccounts: false,
    onDidChangeSessions: new Emitter().event,
    id: "test",
    label: "Test",
    getSessions: async () => [],
    createSession: async () => createSession(),
    removeSession: async () => {
    },
    ...overrides
  };
}
suite("AuthenticationService", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  let authenticationService;
  setup(() => {
    const storageService = disposables.add(new TestStorageService());
    const authenticationAccessService = disposables.add(
      new AuthenticationAccessService(storageService, TestProductService)
    );
    authenticationService = disposables.add(
      new AuthenticationService(
        new TestExtensionService(),
        authenticationAccessService,
        TestEnvironmentService
      )
    );
  });
  teardown(() => {
    authenticationService.dispose();
  });
  suite("declaredAuthenticationProviders", () => {
    test("registerDeclaredAuthenticationProvider", async () => {
      const changed = Event.toPromise(
        authenticationService.onDidChangeDeclaredProviders
      );
      const provider = {
        id: "github",
        label: "GitHub"
      };
      authenticationService.registerDeclaredAuthenticationProvider(
        provider
      );
      assert.equal(authenticationService.declaredProviders.length, 1);
      assert.deepEqual(
        authenticationService.declaredProviders[0],
        provider
      );
      await changed;
    });
    test("unregisterDeclaredAuthenticationProvider", async () => {
      const provider = {
        id: "github",
        label: "GitHub"
      };
      authenticationService.registerDeclaredAuthenticationProvider(
        provider
      );
      const changed = Event.toPromise(
        authenticationService.onDidChangeDeclaredProviders
      );
      authenticationService.unregisterDeclaredAuthenticationProvider(
        provider.id
      );
      assert.equal(authenticationService.declaredProviders.length, 0);
      await changed;
    });
  });
  suite("authenticationProviders", () => {
    test("isAuthenticationProviderRegistered", async () => {
      const registered = Event.toPromise(
        authenticationService.onDidRegisterAuthenticationProvider
      );
      const provider = createProvider();
      assert.equal(
        authenticationService.isAuthenticationProviderRegistered(
          provider.id
        ),
        false
      );
      authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
      assert.equal(
        authenticationService.isAuthenticationProviderRegistered(
          provider.id
        ),
        true
      );
      const result = await registered;
      assert.deepEqual(result, {
        id: provider.id,
        label: provider.label
      });
    });
    test("unregisterAuthenticationProvider", async () => {
      const unregistered = Event.toPromise(
        authenticationService.onDidUnregisterAuthenticationProvider
      );
      const provider = createProvider();
      authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
      assert.equal(
        authenticationService.isAuthenticationProviderRegistered(
          provider.id
        ),
        true
      );
      authenticationService.unregisterAuthenticationProvider(provider.id);
      assert.equal(
        authenticationService.isAuthenticationProviderRegistered(
          provider.id
        ),
        false
      );
      const result = await unregistered;
      assert.deepEqual(result, {
        id: provider.id,
        label: provider.label
      });
    });
    test("getProviderIds", () => {
      const provider1 = createProvider({
        id: "provider1",
        label: "Provider 1"
      });
      const provider2 = createProvider({
        id: "provider2",
        label: "Provider 2"
      });
      authenticationService.registerAuthenticationProvider(
        provider1.id,
        provider1
      );
      authenticationService.registerAuthenticationProvider(
        provider2.id,
        provider2
      );
      const providerIds = authenticationService.getProviderIds();
      assert.deepEqual(providerIds, [provider1.id, provider2.id]);
    });
    test("getProvider", () => {
      const provider = createProvider();
      authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
      const retrievedProvider = authenticationService.getProvider(
        provider.id
      );
      assert.deepEqual(retrievedProvider, provider);
    });
  });
  suite("authenticationSessions", () => {
    test("getSessions", async () => {
      let isCalled = false;
      const provider = createProvider({
        getSessions: async () => {
          isCalled = true;
          return [createSession()];
        }
      });
      authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
      const sessions = await authenticationService.getSessions(
        provider.id
      );
      assert.equal(sessions.length, 1);
      assert.ok(isCalled);
    });
    test("createSession", async () => {
      const emitter = new Emitter();
      const provider = createProvider({
        onDidChangeSessions: emitter.event,
        createSession: async () => {
          const session2 = createSession();
          emitter.fire({
            added: [session2],
            removed: [],
            changed: []
          });
          return session2;
        }
      });
      const changed = Event.toPromise(
        authenticationService.onDidChangeSessions
      );
      authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
      const session = await authenticationService.createSession(
        provider.id,
        ["repo"]
      );
      assert.ok(session);
      const result = await changed;
      assert.deepEqual(result, {
        providerId: provider.id,
        label: provider.label,
        event: { added: [session], removed: [], changed: [] }
      });
    });
    test("removeSession", async () => {
      const emitter = new Emitter();
      const session = createSession();
      const provider = createProvider({
        onDidChangeSessions: emitter.event,
        removeSession: async () => emitter.fire({
          added: [],
          removed: [session],
          changed: []
        })
      });
      const changed = Event.toPromise(
        authenticationService.onDidChangeSessions
      );
      authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
      await authenticationService.removeSession(provider.id, session.id);
      const result = await changed;
      assert.deepEqual(result, {
        providerId: provider.id,
        label: provider.label,
        event: { added: [], removed: [session], changed: [] }
      });
    });
    test("onDidChangeSessions", async () => {
      const emitter = new Emitter();
      const provider = createProvider({
        onDidChangeSessions: emitter.event,
        getSessions: async () => []
      });
      authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
      const changed = Event.toPromise(
        authenticationService.onDidChangeSessions
      );
      const session = createSession();
      emitter.fire({ added: [], removed: [], changed: [session] });
      const result = await changed;
      assert.deepEqual(result, {
        providerId: provider.id,
        label: provider.label,
        event: { added: [], removed: [], changed: [session] }
      });
    });
  });
});
