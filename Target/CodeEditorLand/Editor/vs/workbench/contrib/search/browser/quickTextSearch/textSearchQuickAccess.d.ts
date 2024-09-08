import { type CancellationToken } from "../../../../../base/common/cancellation.js";
import { DisposableStore, type IDisposable } from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { PickerQuickAccessProvider, type FastAndSlowPicks, type IPickerQuickAccessItem, type Picks } from "../../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { DefaultQuickAccessFilterValue, type IQuickAccessProviderRunOptions } from "../../../../../platform/quickinput/common/quickAccess.js";
import { type IQuickPick, type IQuickPickItem } from "../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { type Match } from "../searchModel.js";
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
