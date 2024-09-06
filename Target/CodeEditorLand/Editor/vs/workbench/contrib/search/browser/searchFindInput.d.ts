import { IContextViewProvider } from "vs/base/browser/ui/contextview/contextview";
import { IFindInputOptions } from "vs/base/browser/ui/findinput/findInput";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { ContextScopedFindInput } from "vs/platform/history/browser/contextScopedHistoryWidget";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { NotebookFindFilters } from "vs/workbench/contrib/notebook/browser/contrib/find/findFilters";
export declare class SearchFindInput extends ContextScopedFindInput {
    readonly contextMenuService: IContextMenuService;
    readonly instantiationService: IInstantiationService;
    readonly filters: NotebookFindFilters;
    private _findFilter;
    private _aiButton;
    private _filterChecked;
    private readonly _onDidChangeAIToggle;
    readonly onDidChangeAIToggle: any;
    private shouldNotebookFilterBeVisible;
    constructor(container: HTMLElement | null, contextViewProvider: IContextViewProvider, options: IFindInputOptions, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, filters: NotebookFindFilters, shouldShowAIButton: boolean, // caller responsible for updating this when it changes,
    filterStartVisiblitity: boolean);
    private _updatePadding;
    set sparkleVisible(visible: boolean);
    set filterVisible(visible: boolean);
    setEnabled(enabled: boolean): void;
    updateFilterStyles(): void;
    get isAIEnabled(): any;
}
