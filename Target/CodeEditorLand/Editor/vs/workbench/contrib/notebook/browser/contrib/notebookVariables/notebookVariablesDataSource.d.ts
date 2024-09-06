import { IAsyncDataSource } from "vs/base/browser/ui/tree/tree";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookKernelService } from "vs/workbench/contrib/notebook/common/notebookKernelService";
export interface INotebookScope {
    kind: "root";
    readonly notebook: NotebookTextModel;
}
export interface INotebookVariableElement {
    kind: "variable";
    readonly id: string;
    readonly extHostId: number;
    readonly name: string;
    readonly value: string;
    readonly type?: string;
    readonly interfaces?: string[];
    readonly expression?: string;
    readonly language?: string;
    readonly indexedChildrenCount: number;
    readonly indexStart?: number;
    readonly hasNamedChildren: boolean;
    readonly notebook: NotebookTextModel;
    readonly extensionId?: string;
}
export declare class NotebookVariableDataSource implements IAsyncDataSource<INotebookScope, INotebookVariableElement> {
    private readonly notebookKernelService;
    private cancellationTokenSource;
    constructor(notebookKernelService: INotebookKernelService);
    hasChildren(element: INotebookScope | INotebookVariableElement): boolean;
    cancel(): void;
    getChildren(element: INotebookScope | INotebookVariableElement): Promise<Array<INotebookVariableElement>>;
    private getVariables;
    private getIndexedChildren;
    private getRootVariables;
    private createVariableElement;
}
