import type { INodeProcess } from "../../../../base/common/platform.js";
import { type IStorageService } from "../../../../platform/storage/common/storage.js";
import { type ICommonProperties } from "../../../../platform/telemetry/common/telemetry.js";
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, release: string, hostname: string, commit: string | undefined, version: string | undefined, machineId: string, sqmId: string, devDeviceId: string, isInternalTelemetry: boolean, process: INodeProcess, remoteAuthority?: string): ICommonProperties;
