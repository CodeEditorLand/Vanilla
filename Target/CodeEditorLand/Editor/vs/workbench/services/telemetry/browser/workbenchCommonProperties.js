var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Gesture } from "../../../../base/browser/touch.js";
import { mixin } from "../../../../base/common/objects.js";
import * as Platform from "../../../../base/common/platform.js";
import * as uuid from "../../../../base/common/uuid.js";
import {
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  firstSessionDateStorageKey,
  lastSessionDateStorageKey,
  machineIdKey
} from "../../../../platform/telemetry/common/telemetry.js";
import { cleanRemoteAuthority } from "../../../../platform/telemetry/common/telemetryUtils.js";
function cleanUserAgent(userAgent) {
  return userAgent.replace(/(\d+\.\d+)(\.\d+)+/g, "$1");
}
__name(cleanUserAgent, "cleanUserAgent");
function resolveWorkbenchCommonProperties(storageService, commit, version, isInternalTelemetry, remoteAuthority, productIdentifier, removeMachineId, resolveAdditionalProperties) {
  const result = /* @__PURE__ */ Object.create(null);
  const firstSessionDate = storageService.get(
    firstSessionDateStorageKey,
    StorageScope.APPLICATION
  );
  const lastSessionDate = storageService.get(
    lastSessionDateStorageKey,
    StorageScope.APPLICATION
  );
  let machineId;
  if (removeMachineId) {
    machineId = `Redacted-${productIdentifier ?? "web"}`;
  } else {
    machineId = storageService.get(machineIdKey, StorageScope.APPLICATION);
    if (!machineId) {
      machineId = uuid.generateUuid();
      storageService.store(
        machineIdKey,
        machineId,
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    }
  }
  result["common.firstSessionDate"] = firstSessionDate;
  result["common.lastSessionDate"] = lastSessionDate || "";
  result["common.isNewSession"] = lastSessionDate ? "0" : "1";
  result["common.remoteAuthority"] = cleanRemoteAuthority(remoteAuthority);
  result["common.machineId"] = machineId;
  result["sessionID"] = uuid.generateUuid() + Date.now();
  result["commitHash"] = commit;
  result["version"] = version;
  result["common.platform"] = Platform.PlatformToString(Platform.platform);
  result["common.product"] = productIdentifier ?? "web";
  result["common.userAgent"] = Platform.userAgent ? cleanUserAgent(Platform.userAgent) : void 0;
  result["common.isTouchDevice"] = String(Gesture.isTouchDevice());
  if (isInternalTelemetry) {
    result["common.msftInternal"] = isInternalTelemetry;
  }
  let seq = 0;
  const startTime = Date.now();
  Object.defineProperties(result, {
    // __GDPR__COMMON__ "timestamp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    timestamp: {
      get: /* @__PURE__ */ __name(() => /* @__PURE__ */ new Date(), "get"),
      enumerable: true
    },
    // __GDPR__COMMON__ "common.timesincesessionstart" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
    "common.timesincesessionstart": {
      get: /* @__PURE__ */ __name(() => Date.now() - startTime, "get"),
      enumerable: true
    },
    // __GDPR__COMMON__ "common.sequence" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
    "common.sequence": {
      get: /* @__PURE__ */ __name(() => seq++, "get"),
      enumerable: true
    }
  });
  if (resolveAdditionalProperties) {
    mixin(result, resolveAdditionalProperties());
  }
  return result;
}
__name(resolveWorkbenchCommonProperties, "resolveWorkbenchCommonProperties");
export {
  resolveWorkbenchCommonProperties
};
//# sourceMappingURL=workbenchCommonProperties.js.map
