import { INodeProcess } from "vs/base/common/platform";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ICommonProperties } from "vs/platform/telemetry/common/telemetry";
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, release: string, hostname: string, commit: string | undefined, version: string | undefined, machineId: string, sqmId: string, devDeviceId: string, isInternalTelemetry: boolean, process: INodeProcess, remoteAuthority?: string): ICommonProperties;
