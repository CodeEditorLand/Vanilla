import { CancellationToken } from "vs/base/common/cancellation";
import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { FastAndSlowPicks, IPickerQuickAccessItem, PickerQuickAccessProvider, Picks } from "vs/platform/quickinput/browser/pickerQuickAccess";
import { DefaultQuickAccessFilterValue, IQuickAccessProviderRunOptions } from "vs/platform/quickinput/common/quickAccess";
import { IQuickPick, IQuickPickItem } from "vs/platform/quickinput/common/quickInput";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { Match } from "vs/workbench/contrib/search/browser/searchModel";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare const TEXT_SEARCH_QUICK_ACCESS_PREFIX = "%";
interface ITextSearchQuickAccessItem extends IPickerQuickAccessItem {
    match?: Match;
}
export declare class TextSearchQuickAccess extends PickerQuickAccessProvider<ITextSearchQuickAccessItem> {
    private readonly _instantiationService;
    private readonly _contextService;
    private readonly _editorService;
    private readonly _labelService;
    private readonly _viewsService;
    private readonly _configurationService;
    private editorSequencer;
    private queryBuilder;
    private searchModel;
    private currentAsyncSearch;
    private readonly editorViewState;
    private _getTextQueryBuilderOptions;
    constructor(_instantiationService: IInstantiationService, _contextService: IWorkspaceContextService, _editorService: IEditorService, _labelService: ILabelService, _viewsService: IViewsService, _configurationService: IConfigurationService);
    dispose(): void;
    provide(picker: IQuickPick<ITextSearchQuickAccessItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    private get configuration();
    get defaultFilterValue(): DefaultQuickAccessFilterValue | undefined;
    private doSearch;
    private moveToSearchViewlet;
    private _getPicksFromMatches;
    private handleAccept;
    protected _getPicks(contentPattern: string, disposables: DisposableStore, token: CancellationToken): Picks<IQuickPickItem> | Promise<Picks<IQuickPickItem> | FastAndSlowPicks<IQuickPickItem>> | FastAndSlowPicks<IQuickPickItem> | null;
}
export {};
