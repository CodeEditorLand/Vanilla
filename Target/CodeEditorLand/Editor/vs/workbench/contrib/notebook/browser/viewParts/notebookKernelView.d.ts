import { ActionViewItem, type IActionViewItemOptions } from "../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { type IAction } from "../../../../../base/common/actions.js";
import type { Event } from "../../../../../base/common/event.js";
import { type IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import type { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import { INotebookKernelHistoryService, INotebookKernelService } from "../../common/notebookKernelService.js";
import { type INotebookEditor } from "../notebookBrowser.js";
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
