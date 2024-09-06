import { type IReference } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import type { INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookCellOutlineDataSource } from "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSource";
export declare const INotebookCellOutlineDataSourceFactory: any;
export interface INotebookCellOutlineDataSourceFactory {
    getOrCreate(editor: INotebookEditor): IReference<NotebookCellOutlineDataSource>;
}
export declare class NotebookCellOutlineDataSourceFactory implements INotebookCellOutlineDataSourceFactory {
    private readonly _data;
    constructor(instantiationService: IInstantiationService);
    getOrCreate(editor: INotebookEditor): IReference<NotebookCellOutlineDataSource>;
}
