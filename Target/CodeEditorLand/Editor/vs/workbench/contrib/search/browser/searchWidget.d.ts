import * as dom from "../../../../base/browser/dom.js";
import type { ReplaceInput } from "../../../../base/browser/ui/findinput/replaceInput.js";
import { InputBox, type IInputBoxStyles } from "../../../../base/browser/ui/inputbox/inputBox.js";
import { type IToggleStyles } from "../../../../base/browser/ui/toggle/toggle.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { type Event } from "../../../../base/common/event.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService, IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { NotebookFindFilters } from "../../notebook/browser/contrib/find/findFilters.js";
import { SearchFindInput } from "./searchFindInput.js";
export interface ISearchWidgetOptions {
    value?: string;
    replaceValue?: string;
    isRegex?: boolean;
    isCaseSensitive?: boolean;
    isWholeWords?: boolean;
    searchHistory?: string[];
    replaceHistory?: string[];
    preserveCase?: boolean;
    _hideReplaceToggle?: boolean;
    showContextToggle?: boolean;
    inputBoxStyles: IInputBoxStyles;
    toggleStyles: IToggleStyles;
    notebookOptions?: NotebookToggleState;
    initialAIButtonVisibility?: boolean;
}
interface NotebookToggleState {
    isInNotebookMarkdownInput: boolean;
    isInNotebookMarkdownPreview: boolean;
    isInNotebookCellInput: boolean;
    isInNotebookCellOutput: boolean;
}
export declare class SearchWidget extends Widget {
    private readonly contextViewService;
    private readonly contextKeyService;
    private readonly keybindingService;
    private readonly clipboardServce;
    private readonly configurationService;
    private readonly accessibilityService;
    private readonly contextMenuService;
    private readonly instantiationService;
    private readonly editorService;
    private static readonly INPUT_MAX_HEIGHT;
    private static readonly REPLACE_ALL_DISABLED_LABEL;
    private static readonly REPLACE_ALL_ENABLED_LABEL;
    domNode: HTMLElement | undefined;
    searchInput: SearchFindInput | undefined;
    searchInputFocusTracker: dom.IFocusTracker | undefined;
    private searchInputBoxFocused;
    private replaceContainer;
    replaceInput: ReplaceInput | undefined;
    replaceInputFocusTracker: dom.IFocusTracker | undefined;
    private replaceInputBoxFocused;
    private toggleReplaceButton;
    private replaceAllAction;
    private replaceActive;
    private replaceActionBar;
    private _replaceHistoryDelayer;
    private ignoreGlobalFindBufferOnNextFocus;
    private previousGlobalFindBufferValue;
    private _onSearchSubmit;
    readonly onSearchSubmit: Event<{
        triggeredOnType: boolean;
        delay: number;
    }>;
    private _onSearchCancel;
    readonly onSearchCancel: Event<{
        focus: boolean;
    }>;
    private _onReplaceToggled;
    readonly onReplaceToggled: Event<void>;
    private _onReplaceStateChange;
    readonly onReplaceStateChange: Event<boolean>;
    private _onPreserveCaseChange;
    readonly onPreserveCaseChange: Event<boolean>;
    private _onReplaceValueChanged;
    readonly onReplaceValueChanged: Event<void>;
    private _onReplaceAll;
    readonly onReplaceAll: Event<void>;
    private _onBlur;
    readonly onBlur: Event<void>;
    private _onDidHeightChange;
    readonly onDidHeightChange: Event<void>;
    private readonly _onDidToggleContext;
    readonly onDidToggleContext: Event<void>;
    private showContextToggle;
    contextLinesInput: InputBox;
    private _notebookFilters;
    private readonly _toggleReplaceButtonListener;
    constructor(container: HTMLElement, options: ISearchWidgetOptions, contextViewService: IContextViewService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, clipboardServce: IClipboardService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, editorService: IEditorService);
    private _hasNotebookOpen;
    getNotebookFilters(): NotebookFindFilters;
    focus(select?: boolean, focusReplace?: boolean, suppressGlobalSearchBuffer?: boolean): void;
    setWidth(width: number): void;
    clear(): void;
    isReplaceShown(): boolean;
    isReplaceActive(): boolean;
    getReplaceValue(): string;
    toggleReplace(show?: boolean): void;
    getSearchHistory(): string[];
    getReplaceHistory(): string[];
    prependSearchHistory(history: string[]): void;
    prependReplaceHistory(history: string[]): void;
    clearHistory(): void;
    showNextSearchTerm(): void;
    showPreviousSearchTerm(): void;
    showNextReplaceTerm(): void;
    showPreviousReplaceTerm(): void;
    searchInputHasFocus(): boolean;
    replaceInputHasFocus(): boolean;
    focusReplaceAllAction(): void;
    focusRegexAction(): void;
    set replaceButtonVisibility(val: boolean);
    private render;
    private updateAccessibilitySupport;
    private renderToggleReplaceButton;
    private renderSearchInput;
    private onContextLinesChanged;
    setContextLines(lines: number): void;
    private renderReplaceInput;
    triggerReplaceAll(): Promise<any>;
    private onToggleReplaceButton;
    setValue(value: string): void;
    setReplaceAllActionState(enabled: boolean): void;
    private updateReplaceActiveState;
    private validateSearchInput;
    private onSearchInputChanged;
    private onSearchInputKeyDown;
    private onCaseSensitiveKeyDown;
    private onRegexKeyDown;
    private onPreserveCaseKeyDown;
    private onReplaceInputKeyDown;
    private onReplaceActionbarKeyDown;
    private submitSearch;
    getContextLines(): number;
    modifyContextLines(increase: boolean): void;
    toggleContextLines(): void;
    dispose(): void;
    private get searchConfiguration();
}
export declare function registerContributions(): void;
export {};