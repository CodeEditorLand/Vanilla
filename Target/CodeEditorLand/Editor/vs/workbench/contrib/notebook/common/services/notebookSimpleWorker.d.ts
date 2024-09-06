import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IRequestHandler, IWorkerServer } from "vs/base/common/worker/simpleWorker";
import { CellKind, IMainCellDto, INotebookDiffResult, IOutputDto, NotebookCellsChangedEventDto, NotebookCellTextModelSplice, NotebookData, NotebookDocumentMetadata } from "vs/workbench/contrib/notebook/common/notebookCommon";
declare class MirrorCell {
    readonly handle: number;
    private _source;
    language: string;
    cellKind: CellKind;
    outputs: IOutputDto[];
    metadata?: any;
    internalMetadata?: any;
    private _textBuffer;
    get textBuffer(): any;
    private _primaryKey?;
    primaryKey(): number | null;
    private _hash;
    constructor(handle: number, _source: string | string[], language: string, cellKind: CellKind, outputs: IOutputDto[], metadata?: any, internalMetadata?: any);
    getFullModelRange(): any;
    getValue(): string;
    getComparisonValue(): number;
    getHashValue(): number | null;
}
declare class MirrorNotebookDocument {
    readonly uri: URI;
    cells: MirrorCell[];
    metadata: NotebookDocumentMetadata;
    constructor(uri: URI, cells: MirrorCell[], metadata: NotebookDocumentMetadata);
    acceptModelChanged(event: NotebookCellsChangedEventDto): void;
    private _assertIndex;
    _spliceNotebookCells(splices: NotebookCellTextModelSplice<IMainCellDto>[]): void;
}
export declare class NotebookEditorSimpleWorker implements IRequestHandler, IDisposable {
    _requestHandlerBrand: any;
    private _models;
    constructor();
    dispose(): void;
    $acceptNewModel(uri: string, data: NotebookData): void;
    $acceptModelChanged(strURL: string, event: NotebookCellsChangedEventDto): void;
    $acceptRemovedModel(strURL: string): void;
    $computeDiff(originalUrl: string, modifiedUrl: string): INotebookDiffResult;
    $canPromptRecommendation(modelUrl: string): boolean;
    protected _getModel(uri: string): MirrorNotebookDocument;
}
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
export {};
