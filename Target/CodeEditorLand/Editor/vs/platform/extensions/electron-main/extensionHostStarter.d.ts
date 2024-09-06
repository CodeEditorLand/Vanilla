import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IExtensionHostProcessOptions, IExtensionHostStarter } from "vs/platform/extensions/common/extensionHostStarter";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
export declare class ExtensionHostStarter extends Disposable implements IDisposable, IExtensionHostStarter {
    private readonly _logService;
    private readonly _lifecycleMainService;
    private readonly _windowsMainService;
    private readonly _telemetryService;
    readonly _serviceBrand: undefined;
    private static _lastId;
    private readonly _extHosts;
    private _shutdown;
    constructor(_logService: ILogService, _lifecycleMainService: ILifecycleMainService, _windowsMainService: IWindowsMainService, _telemetryService: ITelemetryService);
    dispose(): void;
    private _getExtHost;
    onDynamicStdout(id: string): Event<string>;
    onDynamicStderr(id: string): Event<string>;
    onDynamicMessage(id: string): Event<any>;
    onDynamicExit(id: string): Event<{
        code: number;
        signal: string;
    }>;
    createExtensionHost(): Promise<{
        id: string;
    }>;
    start(id: string, opts: IExtensionHostProcessOptions): Promise<{
        pid: number | undefined;
    }>;
    enableInspectPort(id: string): Promise<boolean>;
    kill(id: string): Promise<void>;
    _killAllNow(): Promise<void>;
    _waitForAllExit(maxWaitTimeMs: number): Promise<void>;
}
