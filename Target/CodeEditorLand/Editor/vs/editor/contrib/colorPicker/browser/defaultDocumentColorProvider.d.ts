import { CancellationToken } from "vs/base/common/cancellation";
import { DocumentColorProvider, IColorInformation, IColorPresentation } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
export declare class DefaultDocumentColorProvider implements DocumentColorProvider {
    private readonly _editorWorkerService;
    constructor(_editorWorkerService: IEditorWorkerService);
    provideDocumentColors(model: ITextModel, _token: CancellationToken): Promise<IColorInformation[] | null>;
    provideColorPresentations(_model: ITextModel, colorInfo: IColorInformation, _token: CancellationToken): IColorPresentation[];
}
