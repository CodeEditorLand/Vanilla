import * as dom from "../../../../../../base/browser/dom.js";
import "./notebookFindReplaceWidget.css";
import { IContextViewProvider } from "../../../../../../base/browser/ui/contextview/contextview.js";
import { FindInput, IFindInputOptions } from "../../../../../../base/browser/ui/findinput/findInput.js";
import { ReplaceInput } from "../../../../../../base/browser/ui/findinput/replaceInput.js";
import { ProgressBar } from "../../../../../../base/browser/ui/progressbar/progressbar.js";
import { Widget } from "../../../../../../base/browser/ui/widget.js";
import { IAction } from "../../../../../../base/common/actions.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { FindReplaceState } from "../../../../../../editor/contrib/find/browser/findState.js";
import { SimpleButton } from "../../../../../../editor/contrib/find/browser/findWidget.js";
import { ReplacePattern } from "../../../../../../editor/contrib/find/browser/replacePattern.js";
import { IMenu } from "../../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService, IContextViewService } from "../../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { INotebookEditor } from "../../notebookBrowser.js";
import { NotebookFindFilters } from "./findFilters.js";
import { IShowNotebookFindWidgetOptions } from "./notebookFindWidget.js";
export declare const findFilterButton: ThemeIcon;
export declare class NotebookFindInputFilterButton extends Disposable {
    readonly filters: NotebookFindFilters;
    readonly contextMenuService: IContextMenuService;
    readonly instantiationService: IInstantiationService;
    private _filterButtonContainer;
    private _actionbar;
    private _filtersAction;
    private _toggleStyles;
    constructor(filters: NotebookFindFilters, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, options: IFindInputOptions, tooltip?: string);
    get container(): HTMLElement;
    width(): number;
    enable(): void;
    disable(): void;
    set visible(visible: boolean);
    get visible(): boolean;
    applyStyles(filterChecked: boolean): void;
    private createFilters;
}
export declare class NotebookFindInput extends FindInput {
    readonly filters: NotebookFindFilters;
    readonly contextMenuService: IContextMenuService;
    readonly instantiationService: IInstantiationService;
    private _findFilter;
    private _filterChecked;
    constructor(filters: NotebookFindFilters, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, parent: HTMLElement | null, contextViewProvider: IContextViewProvider, options: IFindInputOptions);
    setEnabled(enabled: boolean): void;
    updateFilterState(changed: boolean): void;
    getCellToolbarActions(menu: IMenu): {
        primary: IAction[];
        secondary: IAction[];
    };
}
export declare abstract class SimpleFindReplaceWidget extends Widget {
    private readonly _contextViewService;
    protected readonly _configurationService: IConfigurationService;
    private readonly contextMenuService;
    private readonly instantiationService;
    protected readonly _state: FindReplaceState<NotebookFindFilters>;
    protected readonly _notebookEditor: INotebookEditor;
    protected readonly _findInput: NotebookFindInput;
    private readonly _domNode;
    private readonly _innerFindDomNode;
    private readonly _focusTracker;
    private readonly _findInputFocusTracker;
    private readonly _updateHistoryDelayer;
    protected readonly _matchesCount: HTMLElement;
    private readonly prevBtn;
    private readonly nextBtn;
    protected readonly _replaceInput: ReplaceInput;
    private readonly _innerReplaceDomNode;
    private _toggleReplaceBtn;
    private readonly _replaceInputFocusTracker;
    protected _replaceBtn: SimpleButton;
    protected _replaceAllBtn: SimpleButton;
    private readonly _resizeSash;
    private _resizeOriginalWidth;
    private _isVisible;
    private _isReplaceVisible;
    private foundMatch;
    protected _progressBar: ProgressBar;
    protected _scopedContextKeyService: IContextKeyService;
    private _filters;
    private readonly inSelectionToggle;
    private cellSelectionDecorationIds;
    private textSelectionDecorationIds;
    constructor(_contextViewService: IContextViewService, contextKeyService: IContextKeyService, _configurationService: IConfigurationService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, hoverService: IHoverService, _state: FindReplaceState<NotebookFindFilters>, _notebookEditor: INotebookEditor);
    private _getMaxWidth;
    private _getDomWidth;
    getCellToolbarActions(menu: IMenu): {
        primary: IAction[];
        secondary: IAction[];
    };
    protected abstract onInputChanged(): boolean;
    protected abstract find(previous: boolean): void;
    protected abstract replaceOne(): void;
    protected abstract replaceAll(): void;
    protected abstract onFocusTrackerFocus(): void;
    protected abstract onFocusTrackerBlur(): void;
    protected abstract onFindInputFocusTrackerFocus(): void;
    protected abstract onFindInputFocusTrackerBlur(): void;
    protected abstract onReplaceInputFocusTrackerFocus(): void;
    protected abstract onReplaceInputFocusTrackerBlur(): void;
    protected get inputValue(): string;
    protected get replaceValue(): string;
    protected get replacePattern(): ReplacePattern;
    get focusTracker(): dom.IFocusTracker;
    private _onStateChanged;
    private _updateButtons;
    private setCellSelectionDecorations;
    private clearCellSelectionDecorations;
    private setTextSelectionDecorations;
    private clearTextSelectionDecorations;
    protected _updateMatchesCount(): void;
    dispose(): void;
    getDomNode(): HTMLElement;
    reveal(initialInput?: string): void;
    focus(): void;
    show(initialInput?: string, options?: IShowNotebookFindWidgetOptions): void;
    showWithReplace(initialInput?: string, replaceInput?: string): void;
    private _updateReplaceViewDisplay;
    hide(): void;
    protected _delayedUpdateHistory(): void;
    protected _updateHistory(): void;
    protected _getRegexValue(): boolean;
    protected _getWholeWordValue(): boolean;
    protected _getCaseSensitiveValue(): boolean;
    protected updateButtons(foundMatch: boolean): void;
}
