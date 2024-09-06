import { IStorageService } from "vs/platform/storage/common/storage";
import { ICommonProperties } from "vs/platform/telemetry/common/telemetry";
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, commit: string | undefined, version: string | undefined, isInternalTelemetry: boolean, remoteAuthority?: string, productIdentifier?: string, removeMachineId?: boolean, resolveAdditionalProperties?: () => {
    [key: string]: any;
}): ICommonProperties;
