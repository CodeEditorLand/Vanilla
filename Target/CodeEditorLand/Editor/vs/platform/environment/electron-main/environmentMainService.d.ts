import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { NativeEnvironmentService } from "vs/platform/environment/node/environmentService";
export declare const IEnvironmentMainService: any;
/**
 * A subclass of the `INativeEnvironmentService` to be used only in electron-main
 * environments.
 */
export interface IEnvironmentMainService extends INativeEnvironmentService {
    readonly backupHome: string;
    readonly codeCachePath: string | undefined;
    readonly useCodeCache: boolean;
    readonly mainIPCHandle: string;
    readonly mainLockfile: string;
    readonly disableUpdates: boolean;
    unsetSnapExportedVariables(): void;
    restoreSnapExportedVariables(): void;
}
export declare class EnvironmentMainService extends NativeEnvironmentService implements IEnvironmentMainService {
    private _snapEnv;
    get backupHome(): string;
    get mainIPCHandle(): string;
    get mainLockfile(): string;
    get disableUpdates(): boolean;
    get crossOriginIsolated(): boolean;
    get codeCachePath(): string | undefined;
    get useCodeCache(): boolean;
    unsetSnapExportedVariables(): void;
    restoreSnapExportedVariables(): void;
}
