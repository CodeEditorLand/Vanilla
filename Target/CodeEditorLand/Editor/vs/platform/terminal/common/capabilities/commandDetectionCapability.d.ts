import type { IBuffer, Terminal } from "@xterm/headless";
import { Disposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { ICommandDetectionCapability, IHandleCommandOptions, ISerializedCommandDetectionCapability, ITerminalCommand } from "vs/platform/terminal/common/capabilities/capabilities";
import { type IPromptInputModel } from "vs/platform/terminal/common/capabilities/commandDetection/promptInputModel";
import { ICurrentPartialCommand, TerminalCommand } from "vs/platform/terminal/common/capabilities/commandDetection/terminalCommand";
import { ITerminalOutputMatcher } from "vs/platform/terminal/common/terminal";
export declare class CommandDetectionCapability extends Disposable implements ICommandDetectionCapability {
    private readonly _terminal;
    private readonly _logService;
    readonly type: any;
    private readonly _promptInputModel;
    get promptInputModel(): IPromptInputModel;
    protected _commands: TerminalCommand[];
    private _cwd;
    private _promptTerminator;
    private _currentCommand;
    private _commandMarkers;
    private _dimensions;
    private __isCommandStorageDisabled;
    private _handleCommandStartOptions?;
    private _commitCommandFinished?;
    private _ptyHeuristicsHooks;
    private readonly _ptyHeuristics;
    get commands(): readonly TerminalCommand[];
    get executingCommand(): string | undefined;
    get executingCommandObject(): ITerminalCommand | undefined;
    get currentCommand(): ICurrentPartialCommand;
    get cwd(): string | undefined;
    get promptTerminator(): string | undefined;
    private readonly _onCommandStarted;
    readonly onCommandStarted: any;
    private readonly _onBeforeCommandFinished;
    readonly onBeforeCommandFinished: any;
    private readonly _onCommandFinished;
    readonly onCommandFinished: any;
    private readonly _onCommandExecuted;
    readonly onCommandExecuted: any;
    private readonly _onCommandInvalidated;
    readonly onCommandInvalidated: any;
    private readonly _onCurrentCommandInvalidated;
    readonly onCurrentCommandInvalidated: any;
    constructor(_terminal: Terminal, _logService: ILogService);
    private _handleResize;
    private _handleCursorMove;
    private _clearCommandsInViewport;
    setContinuationPrompt(value: string): void;
    setPromptTerminator(promptTerminator: string, lastPromptLine: string): void;
    setCwd(value: string): void;
    setIsWindowsPty(value: boolean): void;
    setIsCommandStorageDisabled(): void;
    getCommandForLine(line: number): ITerminalCommand | ICurrentPartialCommand | undefined;
    getCwdForLine(line: number): string | undefined;
    handlePromptStart(options?: IHandleCommandOptions): void;
    handleContinuationStart(): void;
    handleContinuationEnd(): void;
    handleRightPromptStart(): void;
    handleRightPromptEnd(): void;
    handleCommandStart(options?: IHandleCommandOptions): void;
    handleGenericCommand(options?: IHandleCommandOptions): void;
    handleCommandExecuted(options?: IHandleCommandOptions): void;
    handleCommandFinished(exitCode: number | undefined, options?: IHandleCommandOptions): void;
    setCommandLine(commandLine: string, isTrusted: boolean): void;
    serialize(): ISerializedCommandDetectionCapability;
    deserialize(serialized: ISerializedCommandDetectionCapability): void;
}
export declare function getLinesForCommand(buffer: IBuffer, command: ITerminalCommand, cols: number, outputMatcher?: ITerminalOutputMatcher): string[] | undefined;
