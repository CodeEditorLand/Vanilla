import { Disposable } from "vs/base/common/lifecycle";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookOptions } from "vs/workbench/contrib/notebook/browser/notebookOptions";
export declare class ListTopCellToolbar extends Disposable {
    protected readonly notebookEditor: INotebookEditorDelegate;
    private readonly notebookOptions;
    protected readonly instantiationService: IInstantiationService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly menuService: IMenuService;
    private readonly topCellToolbarContainer;
    private topCellToolbar;
    private readonly viewZone;
    private readonly _modelDisposables;
    constructor(notebookEditor: INotebookEditorDelegate, notebookOptions: NotebookOptions, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, menuService: IMenuService);
    private updateTopToolbar;
    private updateClass;
}
