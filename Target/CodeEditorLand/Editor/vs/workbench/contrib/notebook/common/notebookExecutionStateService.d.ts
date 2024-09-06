import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI, UriComponents } from "vs/base/common/uri";
import { IRange } from "vs/editor/common/core/range";
import { NotebookCellExecutionState, NotebookExecutionState } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { CellExecutionUpdateType, ICellExecuteOutputEdit, ICellExecuteOutputItemEdit } from "vs/workbench/contrib/notebook/common/notebookExecutionService";
export type ICellExecuteUpdate = ICellExecuteOutputEdit | ICellExecuteOutputItemEdit | ICellExecutionStateUpdate;
export interface ICellExecutionStateUpdate {
    editType: CellExecutionUpdateType.ExecutionState;
    executionOrder?: number;
    runStartTime?: number;
    didPause?: boolean;
    isPaused?: boolean;
}
export interface ICellExecutionError {
    message: string;
    stack: string | undefined;
    uri: UriComponents;
    location: IRange | undefined;
}
export interface ICellExecutionComplete {
    runEndTime?: number;
    lastRunSuccess?: boolean;
    error?: ICellExecutionError;
}
export declare enum NotebookExecutionType {
    cell = 0,
    notebook = 1
}
export interface ICellExecutionStateChangedEvent {
    type: NotebookExecutionType.cell;
    notebook: URI;
    cellHandle: number;
    changed?: INotebookCellExecution;
    affectsCell(cell: URI): boolean;
    affectsNotebook(notebook: URI): boolean;
}
export interface IExecutionStateChangedEvent {
    type: NotebookExecutionType.notebook;
    notebook: URI;
    changed?: INotebookExecution;
    affectsNotebook(notebook: URI): boolean;
}
export interface INotebookFailStateChangedEvent {
    visible: boolean;
    notebook: URI;
}
export interface IFailedCellInfo {
    cellHandle: number;
    disposable: IDisposable;
    visible: boolean;
}
export declare const INotebookExecutionStateService: any;
export interface INotebookExecutionStateService {
    _serviceBrand: undefined;
    onDidChangeExecution: Event<ICellExecutionStateChangedEvent | IExecutionStateChangedEvent>;
    onDidChangeLastRunFailState: Event<INotebookFailStateChangedEvent>;
    forceCancelNotebookExecutions(notebookUri: URI): void;
    getCellExecutionsForNotebook(notebook: URI): INotebookCellExecution[];
    getCellExecutionsByHandleForNotebook(notebook: URI): Map<number, INotebookCellExecution> | undefined;
    getCellExecution(cellUri: URI): INotebookCellExecution | undefined;
    createCellExecution(notebook: URI, cellHandle: number): INotebookCellExecution;
    getExecution(notebook: URI): INotebookExecution | undefined;
    createExecution(notebook: URI): INotebookExecution;
    getLastFailedCellForNotebook(notebook: URI): number | undefined;
}
export interface INotebookCellExecution {
    readonly notebook: URI;
    readonly cellHandle: number;
    readonly state: NotebookCellExecutionState;
    readonly didPause: boolean;
    readonly isPaused: boolean;
    confirm(): void;
    update(updates: ICellExecuteUpdate[]): void;
    complete(complete: ICellExecutionComplete): void;
}
export interface INotebookExecution {
    readonly notebook: URI;
    readonly state: NotebookExecutionState;
    confirm(): void;
    begin(): void;
    complete(): void;
}
