import { IAction } from "vs/base/common/actions";
import { Command } from "vs/editor/common/languages";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILabelService } from "vs/platform/label/common/label";
import { ILogService } from "vs/platform/log/common/log";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { IQuickInputService, IQuickPickItem, QuickPickInput } from "vs/platform/quickinput/common/quickInput";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { IActiveNotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookEditorWidget } from "vs/workbench/contrib/notebook/browser/notebookEditorWidget";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookTextModel } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookKernel, INotebookKernelHistoryService, INotebookKernelMatchResult, INotebookKernelService, ISourceAction } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
type KernelPick = IQuickPickItem & {
    kernel: INotebookKernel;
};
type GroupedKernelsPick = IQuickPickItem & {
    kernels: INotebookKernel[];
    source: string;
};
type SourcePick = IQuickPickItem & {
    action: ISourceAction;
};
type InstallExtensionPick = IQuickPickItem & {
    extensionIds: string[];
};
type SearchMarketplacePick = IQuickPickItem & {
    id: "install";
};
type KernelSourceQuickPickItem = IQuickPickItem & {
    command: Command;
    documentation?: string;
};
type KernelQuickPickItem = (IQuickPickItem & {
    autoRun?: boolean;
}) | SearchMarketplacePick | InstallExtensionPick | KernelPick | GroupedKernelsPick | SourcePick | KernelSourceQuickPickItem;
export type KernelQuickPickContext = {
    id: string;
    extension: string;
} | {
    notebookEditorId: string;
} | {
    id: string;
    extension: string;
    notebookEditorId: string;
} | {
    ui?: boolean;
    notebookEditor?: NotebookEditorWidget;
};
export interface IKernelPickerStrategy {
    showQuickPick(editor: IActiveNotebookEditor, wantedKernelId?: string): Promise<boolean>;
}
declare abstract class KernelPickerStrategyBase implements IKernelPickerStrategy {
    protected readonly _notebookKernelService: INotebookKernelService;
    protected readonly _productService: IProductService;
    protected readonly _quickInputService: IQuickInputService;
    protected readonly _labelService: ILabelService;
    protected readonly _logService: ILogService;
    protected readonly _paneCompositePartService: IPaneCompositePartService;
    protected readonly _extensionWorkbenchService: IExtensionsWorkbenchService;
    protected readonly _extensionService: IExtensionService;
    protected readonly _commandService: ICommandService;
    constructor(_notebookKernelService: INotebookKernelService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _paneCompositePartService: IPaneCompositePartService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService);
    showQuickPick(editor: IActiveNotebookEditor, wantedId?: string, skipAutoRun?: boolean): Promise<boolean>;
    protected _getMatchingResult(notebook: NotebookTextModel): any;
    protected abstract _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _handleQuickPick(editor: IActiveNotebookEditor, pick: KernelQuickPickItem, quickPickItems: KernelQuickPickItem[]): Promise<boolean>;
    protected _selecteKernel(notebook: NotebookTextModel, kernel: INotebookKernel): void;
    protected _showKernelExtension(paneCompositePartService: IPaneCompositePartService, extensionWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, viewType: string, extIds: string[], isInsiders?: boolean): Promise<void>;
    private _showInstallKernelExtensionRecommendation;
    protected _getKernelRecommendationsQuickPickItems(notebookTextModel: NotebookTextModel, extensionWorkbenchService: IExtensionsWorkbenchService): Promise<QuickPickInput<SearchMarketplacePick | InstallExtensionPick>[] | undefined>;
    /**
     * Examine the most common language in the notebook
     * @param notebookTextModel The notebook text model
     * @returns What the suggested language is for the notebook. Used for kernal installing
     */
    private getSuggestedLanguage;
    /**
     * Given a language and notebook view type suggest a kernel for installation
     * @param language The language to find a suggested kernel extension for
     * @returns A recommednation object for the recommended extension, else undefined
     */
    private getSuggestedKernelFromLanguage;
}
export declare class KernelPickerMRUStrategy extends KernelPickerStrategyBase {
    private readonly _notebookKernelHistoryService;
    private readonly _openerService;
    constructor(_notebookKernelService: INotebookKernelService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _paneCompositePartService: IPaneCompositePartService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService, _notebookKernelHistoryService: INotebookKernelHistoryService, _openerService: IOpenerService);
    protected _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _selecteKernel(notebook: NotebookTextModel, kernel: INotebookKernel): void;
    protected _getMatchingResult(notebook: NotebookTextModel): INotebookKernelMatchResult;
    protected _handleQuickPick(editor: IActiveNotebookEditor, pick: KernelQuickPickItem, items: KernelQuickPickItem[]): Promise<boolean>;
    private displaySelectAnotherQuickPick;
    private _calculdateKernelSources;
    private _selectOneKernel;
    private _executeCommand;
    static updateKernelStatusAction(notebook: NotebookTextModel, action: IAction, notebookKernelService: INotebookKernelService, notebookKernelHistoryService: INotebookKernelHistoryService): void;
    static resolveKernel(notebook: INotebookTextModel, notebookKernelService: INotebookKernelService, notebookKernelHistoryService: INotebookKernelHistoryService, commandService: ICommandService): Promise<INotebookKernel | undefined>;
}
export {};
