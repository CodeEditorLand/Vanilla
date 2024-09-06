import type { ITerminalAddon, Terminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKey } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { type ITerminalCapabilityStore } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalConfigurationService } from "vs/workbench/contrib/terminal/browser/terminal";
import { SimpleCompletionItem } from "vs/workbench/services/suggest/browser/simpleCompletionItem";
import { ISimpleSelectedSuggestion } from "vs/workbench/services/suggest/browser/simpleSuggestWidget";
export declare const enum VSCodeSuggestOscPt {
    Completions = "Completions",
    CompletionsPwshCommands = "CompletionsPwshCommands",
    CompletionsBash = "CompletionsBash",
    CompletionsBashFirstWord = "CompletionsBashFirstWord"
}
export type CompressedPwshCompletion = [
    completionText: string,
    resultType: number,
    toolTip?: string,
    customIcon?: string
];
export type PwshCompletion = {
    CompletionText: string;
    ResultType: number;
    ToolTip?: string;
    CustomIcon?: string;
};
export interface ISuggestController {
    selectPreviousSuggestion(): void;
    selectPreviousPageSuggestion(): void;
    selectNextSuggestion(): void;
    selectNextPageSuggestion(): void;
    acceptSelectedSuggestion(suggestion?: Pick<ISimpleSelectedSuggestion, "item" | "model">): void;
    hideSuggestWidget(): void;
}
export declare class SuggestAddon extends Disposable implements ITerminalAddon, ISuggestController {
    private readonly _cachedPwshCommands;
    private readonly _capabilities;
    private readonly _terminalSuggestWidgetVisibleContextKey;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _terminalConfigurationService;
    private _terminal?;
    private _promptInputModel?;
    private readonly _promptInputModelSubscriptions;
    private _mostRecentPromptInputState?;
    private _currentPromptInputState?;
    private _model?;
    private _panel?;
    private _screen?;
    private _suggestWidget?;
    private _enableWidget;
    private _pathSeparator;
    private _isFilteringDirectories;
    private _mostRecentCompletion?;
    private _codeCompletionsRequested;
    private _gitCompletionsRequested;
    private _leadingLineContent?;
    private _cursorIndexDelta;
    private _lastUserDataTimestamp;
    private _lastAcceptedCompletionTimestamp;
    private _lastUserData?;
    static requestCompletionsSequence: string;
    static requestGlobalCompletionsSequence: string;
    static requestEnableGitCompletionsSequence: string;
    static requestEnableCodeCompletionsSequence: string;
    private readonly _onBell;
    readonly onBell: any;
    private readonly _onAcceptedCompletion;
    readonly onAcceptedCompletion: any;
    private readonly _onDidRequestCompletions;
    readonly onDidRequestCompletions: any;
    private readonly _onDidReceiveCompletions;
    readonly onDidReceiveCompletions: any;
    constructor(_cachedPwshCommands: Set<SimpleCompletionItem>, _capabilities: ITerminalCapabilityStore, _terminalSuggestWidgetVisibleContextKey: IContextKey<boolean>, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _terminalConfigurationService: ITerminalConfigurationService);
    activate(xterm: Terminal): void;
    setPanel(panel: HTMLElement): void;
    setScreen(screen: HTMLElement): void;
    private _requestCompletions;
    private _requestGlobalCompletions;
    private _sync;
    private _handleVSCodeSequence;
    private _replacementIndex;
    private _replacementLength;
    private _handleCompletionsSequence;
    private _cachedBashAliases;
    private _cachedBashBuiltins;
    private _cachedBashCommands;
    private _cachedBashKeywords;
    private _cachedFirstWord?;
    private _handleCompletionsBashFirstWordSequence;
    private _handleCompletionsBashSequence;
    private _getTerminalDimensions;
    private _handleCompletionModel;
    private _ensureSuggestWidget;
    selectPreviousSuggestion(): void;
    selectPreviousPageSuggestion(): void;
    selectNextSuggestion(): void;
    selectNextPageSuggestion(): void;
    acceptSelectedSuggestion(suggestion?: Pick<ISimpleSelectedSuggestion, "item" | "model">, respectRunOnEnter?: boolean): void;
    hideSuggestWidget(): void;
}
export declare function parseCompletionsFromShell(rawCompletions: PwshCompletion | PwshCompletion[] | CompressedPwshCompletion[] | CompressedPwshCompletion): SimpleCompletionItem[];
