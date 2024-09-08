import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import type * as performance from "../../../base/common/performance.js";
import { type IProcessEnvironment, type OperatingSystem } from "../../../base/common/platform.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { ILogService, ILoggerService } from "../../log/common/log.js";
import type { IPtyHostProcessReplayEvent } from "../common/capabilities/capabilities.js";
import { type IProcessDataEvent, type IProcessProperty, type IProcessPropertyMap, type IProcessReadyEvent, type IPtyHostLatencyMeasurement, type IPtyHostService, type IRequestResolveVariablesEvent, type ISerializedTerminalState, type IShellLaunchConfig, type ITerminalLaunchError, type ITerminalProcessOptions, type ITerminalProfile, type ITerminalsLayoutInfo, type ProcessPropertyType, type TerminalIcon, type TitleEventSource } from "../common/terminal.js";
import type { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from "../common/terminalProcess.js";
import type { IPtyHostStarter } from "./ptyHost.js";
/**
 * This service implements IPtyService by launching a pty host process, forwarding messages to and
 * from the pty host process and manages the connection.
 */
export declare class PtyHostService extends Disposable implements IPtyHostService {
    private readonly _ptyHostStarter;
    private readonly _configurationService;
    private readonly _logService;
    private readonly _loggerService;
    readonly _serviceBrand: undefined;
    private __connection?;
    private __proxy?;
    private get _connection();
    private get _proxy();
    /**
     * Get the proxy if it exists, otherwise undefined. This is used when calls are not needed to be
     * passed through to the pty host if it has not yet been spawned.
     */
    private get _optionalProxy();
    private _ensurePtyHost;
    private readonly _resolveVariablesRequestStore;
    private _wasQuitRequested;
    private _restartCount;
    private _isResponsive;
    private _heartbeatFirstTimeout?;
    private _heartbeatSecondTimeout?;
    private readonly _onPtyHostExit;
    readonly onPtyHostExit: Event<number>;
    private readonly _onPtyHostStart;
    readonly onPtyHostStart: Event<void>;
    private readonly _onPtyHostUnresponsive;
    readonly onPtyHostUnresponsive: Event<void>;
    private readonly _onPtyHostResponsive;
    readonly onPtyHostResponsive: Event<void>;
    private readonly _onPtyHostRequestResolveVariables;
    readonly onPtyHostRequestResolveVariables: Event<IRequestResolveVariablesEvent>;
    private readonly _onProcessData;
    readonly onProcessData: Event<{
        id: number;
        event: IProcessDataEvent | string;
    }>;
    private readonly _onProcessReady;
    readonly onProcessReady: Event<{
        id: number;
        event: IProcessReadyEvent;
    }>;
    private readonly _onProcessReplay;
    readonly onProcessReplay: Event<{
        id: number;
        event: IPtyHostProcessReplayEvent;
    }>;
    private readonly _onProcessOrphanQuestion;
    readonly onProcessOrphanQuestion: Event<{
        id: number;
    }>;
    private readonly _onDidRequestDetach;
    readonly onDidRequestDetach: Event<{
        requestId: number;
        workspaceId: string;
        instanceId: number;
    }>;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: Event<{
        id: number;
        property: IProcessProperty<any>;
    }>;
    private readonly _onProcessExit;
    readonly onProcessExit: Event<{
        id: number;
        event: number | undefined;
    }>;
    constructor(_ptyHostStarter: IPtyHostStarter, _configurationService: IConfigurationService, _logService: ILogService, _loggerService: ILoggerService);
    private get _ignoreProcessNames();
    private _refreshIgnoreProcessNames;
    private _resolveShellEnv;
    private _startPtyHost;
    createProcess(shellLaunchConfig: IShellLaunchConfig, cwd: string, cols: number, rows: number, unicodeVersion: "6" | "11", env: IProcessEnvironment, executableEnv: IProcessEnvironment, options: ITerminalProcessOptions, shouldPersist: boolean, workspaceId: string, workspaceName: string): Promise<number>;
    updateTitle(id: number, title: string, titleSource: TitleEventSource): Promise<void>;
    updateIcon(id: number, userInitiated: boolean, icon: TerminalIcon, color?: string): Promise<void>;
    attachToProcess(id: number): Promise<void>;
    detachFromProcess(id: number, forcePersist?: boolean): Promise<void>;
    shutdownAll(): Promise<void>;
    listProcesses(): Promise<IProcessDetails[]>;
    getPerformanceMarks(): Promise<performance.PerformanceMark[]>;
    reduceConnectionGraceTime(): Promise<void>;
    start(id: number): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    shutdown(id: number, immediate: boolean): Promise<void>;
    input(id: number, data: string): Promise<void>;
    processBinary(id: number, data: string): Promise<void>;
    resize(id: number, cols: number, rows: number): Promise<void>;
    clearBuffer(id: number): Promise<void>;
    acknowledgeDataEvent(id: number, charCount: number): Promise<void>;
    setUnicodeVersion(id: number, version: "6" | "11"): Promise<void>;
    getInitialCwd(id: number): Promise<string>;
    getCwd(id: number): Promise<string>;
    getLatency(): Promise<IPtyHostLatencyMeasurement[]>;
    orphanQuestionReply(id: number): Promise<void>;
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
    uninstallAutoReply(match: string): Promise<void>;
    getDefaultSystemShell(osOverride?: OperatingSystem): Promise<string>;
    getProfiles(workspaceId: string, profiles: unknown, defaultProfile: unknown, includeDetectedProfiles?: boolean): Promise<ITerminalProfile[]>;
    getEnvironment(): Promise<IProcessEnvironment>;
    getWslPath(original: string, direction: "unix-to-win" | "win-to-unix"): Promise<string>;
    getRevivedPtyNewId(workspaceId: string, id: number): Promise<number | undefined>;
    setTerminalLayoutInfo(args: ISetTerminalLayoutInfoArgs): Promise<void>;
    getTerminalLayoutInfo(args: IGetTerminalLayoutInfoArgs): Promise<ITerminalsLayoutInfo | undefined>;
    requestDetachInstance(workspaceId: string, instanceId: number): Promise<IProcessDetails | undefined>;
    acceptDetachInstanceReply(requestId: number, persistentProcessId: number): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    serializeTerminalState(ids: number[]): Promise<string>;
    reviveTerminalProcesses(workspaceId: string, state: ISerializedTerminalState[], dateTimeFormatLocate: string): Promise<void>;
    refreshProperty<T extends ProcessPropertyType>(id: number, property: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(id: number, property: T, value: IProcessPropertyMap[T]): Promise<void>;
    restartPtyHost(): Promise<void>;
    private _disposePtyHost;
    private _handleHeartbeat;
    private _handleHeartbeatFirstTimeout;
    private _handleHeartbeatSecondTimeout;
    private _handleUnresponsiveCreateProcess;
    private _clearHeartbeatTimeouts;
    private _resolveVariables;
    acceptPtyHostResolvedVariables(requestId: number, resolved: string[]): Promise<void>;
}
