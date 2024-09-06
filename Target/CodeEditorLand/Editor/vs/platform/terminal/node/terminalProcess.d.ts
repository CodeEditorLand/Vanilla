import { Disposable } from "vs/base/common/lifecycle";
import { IProcessEnvironment } from "vs/base/common/platform";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IProcessPropertyMap, IProcessReadyWindowsPty, IShellLaunchConfig, ITerminalChildProcess, ITerminalLaunchError, ITerminalProcessOptions, ProcessPropertyType, TerminalShellType } from "vs/platform/terminal/common/terminal";
export declare class TerminalProcess extends Disposable implements ITerminalChildProcess {
    readonly shellLaunchConfig: IShellLaunchConfig;
    /**
     * environment used for `findExecutable`
     */
    private readonly _executableEnv;
    private readonly _options;
    private readonly _logService;
    private readonly _productService;
    readonly id = 0;
    readonly shouldPersist = false;
    private _properties;
    private static _lastKillOrStart;
    private _exitCode;
    private _exitMessage;
    private _closeTimeout;
    private _ptyProcess;
    private _currentTitle;
    private _processStartupComplete;
    private _windowsShellHelper;
    private _childProcessMonitor;
    private _titleInterval;
    private _writeQueue;
    private _writeTimeout;
    private _delayedResizer;
    private readonly _initialCwd;
    private readonly _ptyOptions;
    private _isPtyPaused;
    private _unacknowledgedCharCount;
    get exitMessage(): string | undefined;
    get currentTitle(): string;
    get shellType(): TerminalShellType | undefined;
    get hasChildProcesses(): boolean;
    private readonly _onProcessData;
    readonly onProcessData: any;
    private readonly _onProcessReady;
    readonly onProcessReady: any;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: any;
    private readonly _onProcessExit;
    readonly onProcessExit: any;
    constructor(shellLaunchConfig: IShellLaunchConfig, cwd: string, cols: number, rows: number, env: IProcessEnvironment, 
    /**
     * environment used for `findExecutable`
     */
    _executableEnv: IProcessEnvironment, _options: ITerminalProcessOptions, _logService: ILogService, _productService: IProductService);
    start(): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    private _validateCwd;
    private _validateExecutable;
    private setupPtyProcess;
    private _setupTitlePolling;
    private _queueProcessExit;
    private _kill;
    private _throttleKillSpawn;
    private _sendProcessId;
    private _sendProcessTitle;
    shutdown(immediate: boolean): void;
    input(data: string, isBinary?: boolean): void;
    processBinary(data: string): Promise<void>;
    refreshProperty<T extends ProcessPropertyType>(type: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(type: T, value: IProcessPropertyMap[T]): Promise<void>;
    private _startWrite;
    private _doWrite;
    resize(cols: number, rows: number): void;
    clearBuffer(): void;
    acknowledgeDataEvent(charCount: number): void;
    clearUnacknowledgedChars(): void;
    setUnicodeVersion(version: "6" | "11"): Promise<void>;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    getWindowsPty(): IProcessReadyWindowsPty | undefined;
}
