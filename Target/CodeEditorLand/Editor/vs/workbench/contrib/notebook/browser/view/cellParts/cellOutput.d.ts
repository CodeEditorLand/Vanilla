import { FastDomNode } from "vs/base/browser/fastDomNode";
import { Disposable } from "vs/base/common/lifecycle";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { ICellOutputViewModel, IInsetRenderOutput, INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { CellContentPart } from "vs/workbench/contrib/notebook/browser/view/cellPart";
import { CodeCellRenderTemplate } from "vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon";
import { CodeCellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
interface IRenderResult {
    initRenderIsSynchronous: false;
}
declare class CellOutputElement extends Disposable {
    private notebookEditor;
    private viewCell;
    private cellOutputContainer;
    private outputContainer;
    readonly output: ICellOutputViewModel;
    private readonly notebookService;
    private readonly quickInputService;
    private readonly menuService;
    private readonly paneCompositeService;
    private readonly instantiationService;
    private readonly toolbarDisposables;
    innerContainer?: HTMLElement;
    renderedOutputContainer: HTMLElement;
    renderResult?: IInsetRenderOutput;
    private readonly contextKeyService;
    private toolbarAttached;
    constructor(notebookEditor: INotebookEditorDelegate, viewCell: CodeCellViewModel, cellOutputContainer: CellOutputContainer, outputContainer: FastDomNode<HTMLElement>, output: ICellOutputViewModel, notebookService: INotebookService, quickInputService: IQuickInputService, parentContextKeyService: IContextKeyService, menuService: IMenuService, paneCompositeService: IPaneCompositePartService, instantiationService: IInstantiationService);
    detach(): void;
    updateDOMTop(top: number): void;
    rerender(): void;
    private _generateInnerOutputContainer;
    render(previousSibling: HTMLElement | undefined): IRenderResult | undefined;
    private _renderMissingRenderer;
    private _renderSearchForMimetype;
    private _renderMessage;
    private shouldEnableCopy;
    private _attachToolbar;
    private _pickActiveMimeTypeRenderer;
    private _showJupyterExtension;
    private _generateRendererInfo;
    private _outputHeightTimer;
    private _validateFinalOutputHeight;
    private _relayoutCell;
    dispose(): void;
}
declare class OutputEntryViewHandler {
    readonly model: ICellOutputViewModel;
    readonly element: CellOutputElement;
    constructor(model: ICellOutputViewModel, element: CellOutputElement);
}
export declare class CellOutputContainer extends CellContentPart {
    private notebookEditor;
    private viewCell;
    private readonly templateData;
    private options;
    private readonly openerService;
    private readonly _notebookExecutionStateService;
    private readonly instantiationService;
    private _outputEntries;
    private _hasStaleOutputs;
    hasHiddenOutputs: any;
    checkForHiddenOutputs(): void;
    get renderedOutputEntries(): OutputEntryViewHandler[];
    constructor(notebookEditor: INotebookEditorDelegate, viewCell: CodeCellViewModel, templateData: CodeCellRenderTemplate, options: {
        limit: number;
    }, openerService: IOpenerService, _notebookExecutionStateService: INotebookExecutionStateService, instantiationService: IInstantiationService);
    updateInternalLayoutNow(viewCell: CodeCellViewModel): void;
    render(): void;
    /**
     * Notify that an output may have been swapped out without the model getting rendered.
     */
    flagAsStale(): void;
    private _doRender;
    viewUpdateShowOutputs(initRendering: boolean): void;
    viewUpdateHideOuputs(): void;
    private _outputHeightTimer;
    private _validateFinalOutputHeight;
    private _updateOutputs;
    private _renderNow;
    private _generateShowMoreElement;
    private _relayoutCell;
    dispose(): void;
}
export {};
