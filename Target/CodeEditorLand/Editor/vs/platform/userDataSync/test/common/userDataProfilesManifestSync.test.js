import assert from "assert";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { IUserDataProfilesService } from "../../../userDataProfile/common/userDataProfile.js";
import {
  IUserDataSyncStoreService,
  SyncResource,
  SyncStatus
} from "../../common/userDataSync.js";
import {
  UserDataSyncClient,
  UserDataSyncTestServer
} from "./userDataSyncClient.js";
suite("UserDataProfilesManifestSync", () => {
  const server = new UserDataSyncTestServer();
  let testClient;
  let client2;
  let testObject;
  teardown(async () => {
    await testClient.instantiationService.get(IUserDataSyncStoreService).clear();
  });
  const disposableStore = ensureNoDisposablesAreLeakedInTestSuite();
  setup(async () => {
    testClient = disposableStore.add(new UserDataSyncClient(server));
    await testClient.setUp(true);
    testObject = testClient.getSynchronizer(
      SyncResource.Profiles
    );
    client2 = disposableStore.add(new UserDataSyncClient(server));
    await client2.setUp(true);
  });
  test("when profiles does not exist", async () => {
    await runWithFakedTimers({}, async () => {
      assert.deepStrictEqual(
        await testObject.getLastSyncUserData(),
        null
      );
      let manifest = await testClient.getResourceManifest();
      server.reset();
      await testObject.sync(manifest);
      assert.deepStrictEqual(server.requests, [
        {
          type: "GET",
          url: `${server.url}/v1/resource/${testObject.resource}/latest`,
          headers: {}
        }
      ]);
      const lastSyncUserData = await testObject.getLastSyncUserData();
      const remoteUserData = await testObject.getRemoteUserData(null);
      assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
      assert.deepStrictEqual(
        lastSyncUserData.syncData,
        remoteUserData.syncData
      );
      assert.strictEqual(lastSyncUserData.syncData, null);
      manifest = await testClient.getResourceManifest();
      server.reset();
      await testObject.sync(manifest);
      assert.deepStrictEqual(server.requests, []);
      manifest = await testClient.getResourceManifest();
      server.reset();
      await testObject.sync(manifest);
      assert.deepStrictEqual(server.requests, []);
    });
  });
  test("when profile is created after first sync", async () => {
    await runWithFakedTimers({}, async () => {
      await testObject.sync(await testClient.getResourceManifest());
      await testClient.instantiationService.get(IUserDataProfilesService).createProfile("1", "1");
      let lastSyncUserData = await testObject.getLastSyncUserData();
      const manifest = await testClient.getResourceManifest();
      server.reset();
      await testObject.sync(manifest);
      assert.deepStrictEqual(server.requests, [
        {
          type: "POST",
          url: `${server.url}/v1/collection`,
          headers: {}
        },
        {
          type: "POST",
          url: `${server.url}/v1/resource/${testObject.resource}`,
          headers: { "If-Match": lastSyncUserData?.ref }
        }
      ]);
      lastSyncUserData = await testObject.getLastSyncUserData();
      const remoteUserData = await testObject.getRemoteUserData(null);
      assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
      assert.deepStrictEqual(
        lastSyncUserData.syncData,
        remoteUserData.syncData
      );
      assert.deepStrictEqual(
        JSON.parse(lastSyncUserData.syncData.content),
        [{ name: "1", id: "1", collection: "1" }]
      );
    });
  });
  test("first time sync - outgoing to server (no state)", async () => {
    await runWithFakedTimers({}, async () => {
      await testClient.instantiationService.get(IUserDataProfilesService).createProfile("1", "1");
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      assert.deepStrictEqual(JSON.parse(JSON.parse(content).content), [
        { name: "1", id: "1", collection: "1" }
      ]);
    });
  });
  test("first time sync - incoming from server (no state)", async () => {
    await runWithFakedTimers({}, async () => {
      await client2.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1");
      await client2.sync();
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      const profiles = getLocalProfiles(testClient);
      assert.deepStrictEqual(profiles, [
        {
          id: "1",
          name: "name 1",
          shortName: void 0,
          useDefaultFlags: void 0
        }
      ]);
    });
  });
  test("first time sync when profiles exists", async () => {
    await runWithFakedTimers({}, async () => {
      await client2.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1");
      await client2.sync();
      await testClient.instantiationService.get(IUserDataProfilesService).createProfile("2", "name 2");
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      const profiles = getLocalProfiles(testClient);
      assert.deepStrictEqual(profiles, [
        {
          id: "1",
          name: "name 1",
          shortName: void 0,
          useDefaultFlags: void 0
        },
        {
          id: "2",
          name: "name 2",
          shortName: void 0,
          useDefaultFlags: void 0
        }
      ]);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        { id: "1", name: "name 1", collection: "1" },
        { id: "2", name: "name 2", collection: "2" }
      ]);
    });
  });
  test("first time sync when storage exists - has conflicts", async () => {
    await runWithFakedTimers({}, async () => {
      await client2.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1");
      await client2.sync();
      await testClient.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 2");
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      const profiles = getLocalProfiles(testClient);
      assert.deepStrictEqual(profiles, [
        {
          id: "1",
          name: "name 1",
          shortName: void 0,
          useDefaultFlags: void 0
        }
      ]);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        { id: "1", name: "name 1", collection: "1" }
      ]);
    });
  });
  test("sync adding a profile", async () => {
    await runWithFakedTimers({}, async () => {
      await testClient.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1", { shortName: "short 1" });
      await testObject.sync(await testClient.getResourceManifest());
      await client2.sync();
      await testClient.instantiationService.get(IUserDataProfilesService).createProfile("2", "name 2");
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      assert.deepStrictEqual(getLocalProfiles(testClient), [
        {
          id: "1",
          name: "name 1",
          shortName: "short 1",
          useDefaultFlags: void 0
        },
        {
          id: "2",
          name: "name 2",
          shortName: void 0,
          useDefaultFlags: void 0
        }
      ]);
      await client2.sync();
      assert.deepStrictEqual(getLocalProfiles(client2), [
        {
          id: "1",
          name: "name 1",
          shortName: "short 1",
          useDefaultFlags: void 0
        },
        {
          id: "2",
          name: "name 2",
          shortName: void 0,
          useDefaultFlags: void 0
        }
      ]);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        {
          id: "1",
          name: "name 1",
          collection: "1",
          shortName: "short 1"
        },
        { id: "2", name: "name 2", collection: "2" }
      ]);
    });
  });
  test("sync updating a profile", async () => {
    await runWithFakedTimers({}, async () => {
      const profile = await testClient.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1");
      await testObject.sync(await testClient.getResourceManifest());
      await client2.sync();
      await testClient.instantiationService.get(IUserDataProfilesService).updateProfile(profile, { name: "name 2", shortName: "2" });
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      assert.deepStrictEqual(getLocalProfiles(testClient), [
        {
          id: "1",
          name: "name 2",
          shortName: "2",
          useDefaultFlags: void 0
        }
      ]);
      await client2.sync();
      assert.deepStrictEqual(getLocalProfiles(client2), [
        {
          id: "1",
          name: "name 2",
          shortName: "2",
          useDefaultFlags: void 0
        }
      ]);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        { id: "1", name: "name 2", collection: "1", shortName: "2" }
      ]);
    });
  });
  test("sync removing a profile", async () => {
    await runWithFakedTimers({}, async () => {
      const profile = await testClient.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1");
      await testClient.instantiationService.get(IUserDataProfilesService).createProfile("2", "name 2");
      await testObject.sync(await testClient.getResourceManifest());
      await client2.sync();
      testClient.instantiationService.get(IUserDataProfilesService).removeProfile(profile);
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      assert.deepStrictEqual(getLocalProfiles(testClient), [
        {
          id: "2",
          name: "name 2",
          shortName: void 0,
          useDefaultFlags: void 0
        }
      ]);
      await client2.sync();
      assert.deepStrictEqual(getLocalProfiles(client2), [
        {
          id: "2",
          name: "name 2",
          shortName: void 0,
          useDefaultFlags: void 0
        }
      ]);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        { id: "2", name: "name 2", collection: "2" }
      ]);
    });
  });
  test("sync profile that uses default profile", async () => {
    await runWithFakedTimers({}, async () => {
      await client2.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1", {
        useDefaultFlags: { keybindings: true }
      });
      await client2.sync();
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        {
          id: "1",
          name: "name 1",
          collection: "1",
          useDefaultFlags: { keybindings: true }
        }
      ]);
      assert.deepStrictEqual(getLocalProfiles(testClient), [
        {
          id: "1",
          name: "name 1",
          shortName: void 0,
          useDefaultFlags: { keybindings: true }
        }
      ]);
    });
  });
  test("sync profile when the profile is updated to use default profile locally", async () => {
    await runWithFakedTimers({}, async () => {
      await client2.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1");
      await client2.sync();
      await testObject.sync(await testClient.getResourceManifest());
      const profile = testClient.instantiationService.get(IUserDataProfilesService).profiles.find((p) => p.id === "1");
      testClient.instantiationService.get(IUserDataProfilesService).updateProfile(profile, {
        useDefaultFlags: { keybindings: true }
      });
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        {
          id: "1",
          name: "name 1",
          collection: "1",
          useDefaultFlags: { keybindings: true }
        }
      ]);
      assert.deepStrictEqual(getLocalProfiles(testClient), [
        {
          id: "1",
          name: "name 1",
          shortName: void 0,
          useDefaultFlags: { keybindings: true }
        }
      ]);
    });
  });
  test("sync profile when the profile is updated to use default profile remotely", async () => {
    await runWithFakedTimers({}, async () => {
      const profile = await client2.instantiationService.get(IUserDataProfilesService).createProfile("1", "name 1");
      await client2.sync();
      await testObject.sync(await testClient.getResourceManifest());
      client2.instantiationService.get(IUserDataProfilesService).updateProfile(profile, {
        useDefaultFlags: { keybindings: true }
      });
      await client2.sync();
      await testObject.sync(await testClient.getResourceManifest());
      assert.strictEqual(testObject.status, SyncStatus.Idle);
      assert.deepStrictEqual(testObject.conflicts.conflicts, []);
      const { content } = await testClient.read(testObject.resource);
      assert.ok(content !== null);
      const actual = parseRemoteProfiles(content);
      assert.deepStrictEqual(actual, [
        {
          id: "1",
          name: "name 1",
          collection: "1",
          useDefaultFlags: { keybindings: true }
        }
      ]);
      assert.deepStrictEqual(getLocalProfiles(testClient), [
        {
          id: "1",
          name: "name 1",
          shortName: void 0,
          useDefaultFlags: { keybindings: true }
        }
      ]);
    });
  });
  function parseRemoteProfiles(content) {
    const syncData = JSON.parse(content);
    return JSON.parse(syncData.content);
  }
  function getLocalProfiles(client) {
    return client.instantiationService.get(IUserDataProfilesService).profiles.slice(1).sort((a, b) => a.name.localeCompare(b.name)).map((profile) => ({
      id: profile.id,
      name: profile.name,
      shortName: profile.shortName,
      useDefaultFlags: profile.useDefaultFlags
    }));
  }
});
