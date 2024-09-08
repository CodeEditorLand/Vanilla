import { isMacintosh } from "../../../base/common/platform.js";
import {
  getMachineId,
  getSqmMachineId,
  getdevDeviceId
} from "../../../base/node/id.js";
import { devDeviceIdKey, machineIdKey, sqmIdKey } from "../common/telemetry.js";
async function resolveMachineId(stateService, logService) {
  let machineId = stateService.getItem(machineIdKey);
  if (typeof machineId !== "string" || isMacintosh && machineId === "6c9d2bc8f91b89624add29c0abeae7fb42bf539fa1cdb2e3e57cd668fa9bcead") {
    machineId = await getMachineId(logService.error.bind(logService));
  }
  return machineId;
}
async function resolveSqmId(stateService, logService) {
  let sqmId = stateService.getItem(sqmIdKey);
  if (typeof sqmId !== "string") {
    sqmId = await getSqmMachineId(logService.error.bind(logService));
  }
  return sqmId;
}
async function resolvedevDeviceId(stateService, logService) {
  let devDeviceId = stateService.getItem(devDeviceIdKey);
  if (typeof devDeviceId !== "string") {
    devDeviceId = await getdevDeviceId(logService.error.bind(logService));
  }
  return devDeviceId;
}
export {
  resolveMachineId,
  resolveSqmId,
  resolvedevDeviceId
};
