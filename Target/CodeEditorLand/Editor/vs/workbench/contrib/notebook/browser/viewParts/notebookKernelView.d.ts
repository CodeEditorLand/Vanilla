import { ActionViewItem, IActionViewItemOptions } from "vs/base/browser/ui/actionbar/actionViewItems";
import { IAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookKernelHistoryService, INotebookKernelService } from "vs/workbench/contrib/notebook/common/notebookKernelService";
export declare class NotebooKernelActionViewItem extends ActionViewItem {
    private readonly _editor;
    private readonly _notebookKernelService;
    private readonly _notebookKernelHistoryService;
    private _kernelLabel?;
    constructor(actualAction: IAction, _editor: {
        onDidChangeModel: Event<void>;
        textModel: NotebookTextModel | undefined;
        scopedContextKeyService?: IContextKeyService;
    } | INotebookEditor, options: IActionViewItemOptions, _notebookKernelService: INotebookKernelService, _notebookKernelHistoryService: INotebookKernelHistoryService);
    render(container: HTMLElement): void;
    protected updateLabel(): void;
    protected _update(): void;
    private _resetAction;
}
