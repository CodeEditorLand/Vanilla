import { Disposable } from "vs/base/common/lifecycle";
import * as performance from "vs/base/common/performance";
import { IProcessEnvironment, OperatingSystem } from "vs/base/common/platform";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { IProcessPropertyMap, IPtyHostLatencyMeasurement, IPtyHostService, ISerializedTerminalState, IShellLaunchConfig, ITerminalLaunchError, ITerminalProcessOptions, ITerminalProfile, ITerminalsLayoutInfo, ProcessPropertyType, TerminalIcon, TitleEventSource } from "vs/platform/terminal/common/terminal";
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from "vs/platform/terminal/common/terminalProcess";
import { IPtyHostStarter } from "vs/platform/terminal/node/ptyHost";
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
    readonly onPtyHostExit: any;
    private readonly _onPtyHostStart;
    readonly onPtyHostStart: any;
    private readonly _onPtyHostUnresponsive;
    readonly onPtyHostUnresponsive: any;
    private readonly _onPtyHostResponsive;
    readonly onPtyHostResponsive: any;
    private readonly _onPtyHostRequestResolveVariables;
    readonly onPtyHostRequestResolveVariables: any;
    private readonly _onProcessData;
    readonly onProcessData: any;
    private readonly _onProcessReady;
    readonly onProcessReady: any;
    private readonly _onProcessReplay;
    readonly onProcessReplay: any;
    private readonly _onProcessOrphanQuestion;
    readonly onProcessOrphanQuestion: any;
    private readonly _onDidRequestDetach;
    readonly onDidRequestDetach: any;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: any;
    private readonly _onProcessExit;
    readonly onProcessExit: any;
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
    reviveTerminalProcesses(workspaceId: string, state: ISerializedTerminalState[], dateTimeFormatLocate: string): Promise<any>;
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
