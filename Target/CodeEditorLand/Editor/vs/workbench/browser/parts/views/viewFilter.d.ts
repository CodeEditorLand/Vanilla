import { Widget } from "vs/base/browser/ui/widget";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare const viewFilterSubmenu: any;
export interface IFilterWidgetOptions {
    readonly text?: string;
    readonly placeholder?: string;
    readonly ariaLabel?: string;
    readonly history?: string[];
    readonly focusContextKey?: string;
}
export declare class FilterWidget extends Widget {
    private readonly options;
    private readonly instantiationService;
    private readonly contextViewService;
    private readonly keybindingService;
    readonly element: HTMLElement;
    private readonly delayedFilterUpdate;
    private readonly filterInputBox;
    private readonly filterBadge;
    private readonly toolbar;
    private readonly focusContextKey;
    private readonly _onDidChangeFilterText;
    readonly onDidChangeFilterText: any;
    private moreFiltersActionViewItem;
    private isMoreFiltersChecked;
    private lastWidth?;
    private focusTracker;
    get onDidFocus(): any;
    get onDidBlur(): any;
    constructor(options: IFilterWidgetOptions, instantiationService: IInstantiationService, contextViewService: IContextViewService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    hasFocus(): boolean;
    focus(): void;
    blur(): void;
    updateBadge(message: string | undefined): void;
    setFilterText(filterText: string): void;
    getFilterText(): string;
    getHistory(): string[];
    layout(width: number): void;
    relayout(): void;
    checkMoreFilters(checked: boolean): void;
    private createInput;
    private createBadge;
    private createToolBar;
    private onDidInputChange;
    private adjustInputBox;
    private handleKeyboardEvent;
    private onInputKeyDown;
}