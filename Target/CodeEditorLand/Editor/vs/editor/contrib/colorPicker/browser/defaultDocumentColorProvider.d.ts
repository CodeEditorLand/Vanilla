import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { DocumentColorProvider, IColorInformation, IColorPresentation } from "../../../common/languages.js";
import type { ITextModel } from "../../../common/model.js";
import { IEditorWorkerService } from "../../../common/services/editorWorker.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
export declare class DefaultDocumentColorProvider implements DocumentColorProvider {
    private readonly _editorWorkerService;
    constructor(_editorWorkerService: IEditorWorkerService);
    provideDocumentColors(model: ITextModel, _token: CancellationToken): Promise<IColorInformation[] | null>;
    provideColorPresentations(_model: ITextModel, colorInfo: IColorInformation, _token: CancellationToken): IColorPresentation[];
}
export declare class DefaultDocumentColorProviderFeature extends Disposable {
    constructor(_languageFeaturesService: ILanguageFeaturesService, editorWorkerService: IEditorWorkerService);
}