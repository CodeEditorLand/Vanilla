import { Emitter, Event } from '../../../base/common/event.js';
import { Keybinding, ResolvedKeybinding } from '../../../base/common/keybindings.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ICommandService } from '../../commands/common/commands.js';
import { IContextKeyService, IContextKeyServiceTarget } from '../../contextkey/common/contextkey.js';
import { IKeybindingService, IKeyboardEvent, KeybindingsSchemaContribution } from './keybinding.js';
import { ResolutionResult, KeybindingResolver } from './keybindingResolver.js';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem.js';
import { ILogService } from '../../log/common/log.js';
import { INotificationService } from '../../notification/common/notification.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
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
