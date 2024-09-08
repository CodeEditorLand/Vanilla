import assert from "assert";
import { hostname, release } from "os";
import { timeout } from "../../../../../base/common/async.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  InMemoryStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import { resolveWorkbenchCommonProperties } from "../../common/workbenchCommonProperties.js";
suite("Telemetry - common properties", () => {
  const commit = void 0;
  const version = void 0;
  let testStorageService;
  teardown(() => {
    testStorageService.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    testStorageService = new InMemoryStorageService();
  });
  test("default", () => {
    const props = resolveWorkbenchCommonProperties(
      testStorageService,
      release(),
      hostname(),
      commit,
      version,
      "someMachineId",
      "someSqmId",
      "somedevDeviceId",
      false,
      process
    );
    assert.ok("commitHash" in props);
    assert.ok("sessionID" in props);
    assert.ok("timestamp" in props);
    assert.ok("common.platform" in props);
    assert.ok("common.nodePlatform" in props);
    assert.ok("common.nodeArch" in props);
    assert.ok("common.timesincesessionstart" in props);
    assert.ok("common.sequence" in props);
    assert.ok("common.platformVersion" in props, "platformVersion");
    assert.ok("version" in props);
    assert.ok("common.firstSessionDate" in props, "firstSessionDate");
    assert.ok("common.lastSessionDate" in props, "lastSessionDate");
    assert.ok("common.isNewSession" in props, "isNewSession");
    assert.ok("common.machineId" in props, "machineId");
  });
  test("lastSessionDate when available", () => {
    testStorageService.store(
      "telemetry.lastSessionDate",
      (/* @__PURE__ */ new Date()).toUTCString(),
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
    const props = resolveWorkbenchCommonProperties(
      testStorageService,
      release(),
      hostname(),
      commit,
      version,
      "someMachineId",
      "someSqmId",
      "somedevDeviceId",
      false,
      process
    );
    assert.ok("common.lastSessionDate" in props);
    assert.ok("common.isNewSession" in props);
    assert.strictEqual(props["common.isNewSession"], "0");
  });
  test("values chance on ask", async () => {
    const props = resolveWorkbenchCommonProperties(
      testStorageService,
      release(),
      hostname(),
      commit,
      version,
      "someMachineId",
      "someSqmId",
      "somedevDeviceId",
      false,
      process
    );
    let value1 = props["common.sequence"];
    let value2 = props["common.sequence"];
    assert.ok(value1 !== value2, "seq");
    value1 = props["timestamp"];
    value2 = props["timestamp"];
    assert.ok(value1 !== value2, "timestamp");
    value1 = props["common.timesincesessionstart"];
    await timeout(10);
    value2 = props["common.timesincesessionstart"];
    assert.ok(value1 !== value2, "timesincesessionstart");
  });
});
