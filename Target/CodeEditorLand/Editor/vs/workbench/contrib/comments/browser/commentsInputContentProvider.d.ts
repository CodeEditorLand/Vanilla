import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextModel } from "vs/editor/common/model";
import { IModelService } from "vs/editor/common/services/model";
import { ITextModelContentProvider, ITextModelService } from "vs/editor/common/services/resolverService";
export declare class CommentsInputContentProvider extends Disposable implements ITextModelContentProvider, IEditorContribution {
    private readonly _modelService;
    private readonly _languageService;
    static readonly ID = "comments.input.contentProvider";
    constructor(textModelService: ITextModelService, codeEditorService: ICodeEditorService, _modelService: IModelService, _languageService: ILanguageService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
