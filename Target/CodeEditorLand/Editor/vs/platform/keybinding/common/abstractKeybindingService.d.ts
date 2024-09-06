import { Emitter, Event } from "vs/base/common/event";
import { Keybinding, ResolvedKeybinding } from "vs/base/common/keybindings";
import { Disposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService, IContextKeyServiceTarget } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService, IKeyboardEvent, KeybindingsSchemaContribution } from "vs/platform/keybinding/common/keybinding";
import { KeybindingResolver, ResolutionResult } from "vs/platform/keybinding/common/keybindingResolver";
import { ResolvedKeybindingItem } from "vs/platform/keybinding/common/resolvedKeybindingItem";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare abstract class AbstractKeybindingService extends Disposable implements IKeybindingService {
    private _contextKeyService;
    protected _commandService: ICommandService;
    protected _telemetryService: ITelemetryService;
    private _notificationService;
    protected _logService: ILogService;
    _serviceBrand: undefined;
    protected readonly _onDidUpdateKeybindings: Emitter<void>;
    get onDidUpdateKeybindings(): Event<void>;
    /** recently recorded keypresses that can trigger a keybinding;
     *
     * example: say, there's "cmd+k cmd+i" keybinding;
     * the user pressed "cmd+k" (before they press "cmd+i")
     * "cmd+k" would be stored in this array, when on pressing "cmd+i", the service
     * would invoke the command bound by the keybinding
     */
    private _currentChords;
    private _currentChordChecker;
    private _currentChordStatusMessage;
    private _ignoreSingleModifiers;
    private _currentSingleModifier;
    private _currentSingleModifierClearTimeout;
    protected _currentlyDispatchingCommandId: string | null;
    protected _logging: boolean;
    get inChordMode(): boolean;
    constructor(_contextKeyService: IContextKeyService, _commandService: ICommandService, _telemetryService: ITelemetryService, _notificationService: INotificationService, _logService: ILogService);
    dispose(): void;
    protected abstract _getResolver(): KeybindingResolver;
    protected abstract _documentHasFocus(): boolean;
    abstract resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    abstract resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    abstract resolveUserBinding(userBinding: string): ResolvedKeybinding[];
    abstract registerSchemaContribution(contribution: KeybindingsSchemaContribution): void;
    abstract _dumpDebugInfo(): string;
    abstract _dumpDebugInfoJSON(): string;
    getDefaultKeybindingsContent(): string;
    toggleLogging(): boolean;
    protected _log(str: string): void;
    getDefaultKeybindings(): readonly ResolvedKeybindingItem[];
    getKeybindings(): readonly ResolvedKeybindingItem[];
    customKeybindingsCount(): number;
    lookupKeybindings(commandId: string): ResolvedKeybinding[];
    lookupKeybinding(commandId: string, context?: IContextKeyService): ResolvedKeybinding | undefined;
    dispatchEvent(e: IKeyboardEvent, target: IContextKeyServiceTarget): boolean;
    softDispatch(e: IKeyboardEvent, target: IContextKeyServiceTarget): ResolutionResult;
    private _scheduleLeaveChordMode;
    private _expectAnotherChord;
    private _leaveChordMode;
    dispatchByUserSettingsLabel(userSettingsLabel: string, target: IContextKeyServiceTarget): void;
    protected _dispatch(e: IKeyboardEvent, target: IContextKeyServiceTarget): boolean;
    protected _singleModifierDispatch(e: IKeyboardEvent, target: IContextKeyServiceTarget): boolean;
    private _doDispatch;
    abstract enableKeybindingHoldMode(commandId: string): Promise<void> | undefined;
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
}
