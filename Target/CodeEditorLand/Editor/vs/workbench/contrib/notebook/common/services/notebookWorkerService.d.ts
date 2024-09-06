import { URI } from "vs/base/common/uri";
import { INotebookDiffResult } from "vs/workbench/contrib/notebook/common/notebookCommon";
export declare const ID_NOTEBOOK_EDITOR_WORKER_SERVICE = "notebookEditorWorkerService";
export declare const INotebookEditorWorkerService: any;
export interface INotebookEditorWorkerService {
    readonly _serviceBrand: undefined;
    canComputeDiff(original: URI, modified: URI): boolean;
    computeDiff(original: URI, modified: URI): Promise<INotebookDiffResult>;
    canPromptRecommendation(model: URI): Promise<boolean>;
}
