import { URI } from '../../../../../base/common/uri.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { DiffAlgorithmName, IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { IDocumentDiff, IDocumentDiffProviderOptions } from '../../../../../editor/common/diff/documentDiffProvider.js';
import { TextEdit } from '../../../../../editor/common/languages.js';
declare const TestWorkerService_base: import("../../../../../base/test/common/mock.js").Ctor<IEditorWorkerService>;
export declare class TestWorkerService extends TestWorkerService_base {
    private readonly _modelService;
    private readonly _worker;
    constructor(_modelService: IModelService);
    computeMoreMinimalEdits(resource: URI, edits: TextEdit[] | null | undefined, pretty?: boolean | undefined): Promise<TextEdit[] | undefined>;
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null>;
}
export {};
