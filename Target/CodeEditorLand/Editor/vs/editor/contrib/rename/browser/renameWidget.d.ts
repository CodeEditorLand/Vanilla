import { CancellationToken, CancellationTokenSource } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import "vs/css!./renameWidget";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IDimension } from "vs/editor/common/core/dimension";
import { IRange } from "vs/editor/common/core/range";
import { NewSymbolName, NewSymbolNameTriggerKind, ProviderResult } from "vs/editor/common/languages";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILogService } from "vs/platform/log/common/log";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare const CONTEXT_RENAME_INPUT_VISIBLE: any;
export declare const CONTEXT_RENAME_INPUT_FOCUSED: any;
/**
 * "Source" of the new name:
 * - 'inputField' - user entered the new name
 * - 'renameSuggestion' - user picked from rename suggestions
 * - 'userEditedRenameSuggestion' - user _likely_ edited a rename suggestion ("likely" because when input started being edited, a rename suggestion had focus)
 */
export type NewNameSource = {
    k: "inputField";
} | {
    k: "renameSuggestion";
} | {
    k: "userEditedRenameSuggestion";
};
/**
 * Various statistics regarding rename input field
 */
export type RenameWidgetStats = {
    nRenameSuggestions: number;
    source: NewNameSource;
    timeBeforeFirstInputFieldEdit: number | undefined;
    nRenameSuggestionsInvocations: number;
    hadAutomaticRenameSuggestionsInvocation: boolean;
};
export type RenameWidgetResult = {
    /**
     * The new name to be used
     */
    newName: string;
    wantsPreview?: boolean;
    stats: RenameWidgetStats;
};
interface IRenameWidget {
    /**
     * @returns a `boolean` standing for `shouldFocusEditor`, if user didn't pick a new name, or a {@link RenameWidgetResult}
     */
    getInput(where: IRange, currentName: string, supportPreview: boolean, requestRenameSuggestions: (triggerKind: NewSymbolNameTriggerKind, cts: CancellationToken) => ProviderResult<NewSymbolName[]>[], cts: CancellationTokenSource): Promise<RenameWidgetResult | boolean>;
    acceptInput(wantsPreview: boolean): void;
    cancelInput(focusEditor: boolean, caller: string): void;
    focusNextRenameSuggestion(): void;
    focusPreviousRenameSuggestion(): void;
}
export declare class RenameWidget implements IRenameWidget, IContentWidget, IDisposable {
    private readonly _editor;
    private readonly _acceptKeybindings;
    private readonly _themeService;
    private readonly _keybindingService;
    private readonly _logService;
    readonly allowEditorOverflow: boolean;
    private _domNode?;
    private _inputWithButton;
    private _renameCandidateListView?;
    private _label?;
    private _nPxAvailableAbove?;
    private _nPxAvailableBelow?;
    private _position?;
    private _currentName?;
    /** Is true if input field got changes when a rename candidate was focused; otherwise, false */
    private _isEditingRenameCandidate;
    private readonly _candidates;
    private _visible?;
    /** must be reset at session start */
    private _beforeFirstInputFieldEditSW;
    /**
     * Milliseconds before user edits the input field for the first time
     * @remarks must be set once per session
     */
    private _timeBeforeFirstInputFieldEdit;
    private _nRenameSuggestionsInvocations;
    private _hadAutomaticRenameSuggestionsInvocation;
    private _renameCandidateProvidersCts;
    private _renameCts;
    private readonly _visibleContextKey;
    private readonly _disposables;
    constructor(_editor: ICodeEditor, _acceptKeybindings: [string, string], _themeService: IThemeService, _keybindingService: IKeybindingService, contextKeyService: IContextKeyService, _logService: ILogService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    private _updateStyles;
    private _updateFont;
    private _computeLabelFontSize;
    getPosition(): IContentWidgetPosition | null;
    beforeRender(): IDimension | null;
    afterRender(position: ContentWidgetPositionPreference | null): void;
    private _currentAcceptInput?;
    private _currentCancelInput?;
    private _requestRenameCandidatesOnce?;
    acceptInput(wantsPreview: boolean): void;
    cancelInput(focusEditor: boolean, caller: string): void;
    focusNextRenameSuggestion(): void;
    focusPreviousRenameSuggestion(): void;
    /**
     * @param requestRenameCandidates is `undefined` when there are no rename suggestion providers
     */
    getInput(where: IRange, currentName: string, supportPreview: boolean, requestRenameCandidates: undefined | ((triggerKind: NewSymbolNameTriggerKind, cts: CancellationToken) => ProviderResult<NewSymbolName[]>[]), cts: CancellationTokenSource): Promise<RenameWidgetResult | boolean>;
    private _requestRenameCandidates;
    /**
     * This allows selecting only part of the symbol name in the input field based on the selection in the editor
     */
    private _getSelection;
    private _show;
    private _updateRenameCandidates;
    private _hide;
    private _getTopForPosition;
    private _trace;
}
export {};
