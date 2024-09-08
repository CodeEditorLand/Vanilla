import { Disposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { type IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import type { ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelService, type ITextModelContentProvider } from "../../../../editor/common/services/resolverService.js";
export declare class CommentsInputContentProvider extends Disposable implements ITextModelContentProvider, IEditorContribution {
    private readonly _modelService;
    private readonly _languageService;
    static readonly ID = "comments.input.contentProvider";
    constructor(textModelService: ITextModelService, codeEditorService: ICodeEditorService, _modelService: IModelService, _languageService: ILanguageService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
