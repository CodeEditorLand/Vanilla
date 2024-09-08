import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { InMemoryStorageService } from "../../../../../platform/storage/common/storage.js";
import { resolveWorkbenchCommonProperties } from "../../browser/workbenchCommonProperties.js";
suite("Browser Telemetry - common properties", () => {
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
  test("mixes in additional properties", async () => {
    const resolveCommonTelemetryProperties = () => {
      return {
        userId: "1"
      };
    };
    const props = resolveWorkbenchCommonProperties(
      testStorageService,
      commit,
      version,
      false,
      void 0,
      void 0,
      false,
      resolveCommonTelemetryProperties
    );
    assert.ok("commitHash" in props);
    assert.ok("sessionID" in props);
    assert.ok("timestamp" in props);
    assert.ok("common.platform" in props);
    assert.ok("common.timesincesessionstart" in props);
    assert.ok("common.sequence" in props);
    assert.ok("version" in props);
    assert.ok("common.firstSessionDate" in props, "firstSessionDate");
    assert.ok("common.lastSessionDate" in props, "lastSessionDate");
    assert.ok("common.isNewSession" in props, "isNewSession");
    assert.ok("common.machineId" in props, "machineId");
    assert.strictEqual(props["userId"], "1");
  });
  test("mixes in additional dyanmic properties", async () => {
    let i = 1;
    const resolveCommonTelemetryProperties = () => {
      return Object.defineProperties(
        {},
        {
          userId: {
            get: () => {
              return i++;
            },
            enumerable: true
          }
        }
      );
    };
    const props = resolveWorkbenchCommonProperties(
      testStorageService,
      commit,
      version,
      false,
      void 0,
      void 0,
      false,
      resolveCommonTelemetryProperties
    );
    assert.strictEqual(props["userId"], 1);
    const props2 = resolveWorkbenchCommonProperties(
      testStorageService,
      commit,
      version,
      false,
      void 0,
      void 0,
      false,
      resolveCommonTelemetryProperties
    );
    assert.strictEqual(props2["userId"], 2);
  });
});
