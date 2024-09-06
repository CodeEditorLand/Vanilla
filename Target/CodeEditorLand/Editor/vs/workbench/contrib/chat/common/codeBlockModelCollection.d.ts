import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IResolvedTextEditorModel, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { IMarkdownVulnerability } from "./annotations.js";
import { IChatRequestViewModel, IChatResponseViewModel } from "./chatViewModel.js";
export declare class CodeBlockModelCollection extends Disposable {
    private readonly languageService;
    private readonly textModelService;
    private readonly _models;
    /**
     * Max number of models to keep in memory.
     *
     * Currently always maintains the most recently created models.
     */
    private readonly maxModelCount;
    constructor(languageService: ILanguageService, textModelService: ITextModelService);
    dispose(): void;
    get(sessionId: string, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number): {
        model: Promise<IResolvedTextEditorModel>;
        readonly vulns: readonly IMarkdownVulnerability[];
    } | undefined;
    getOrCreate(sessionId: string, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number): {
        model: Promise<IResolvedTextEditorModel>;
        readonly vulns: readonly IMarkdownVulnerability[];
    };
    private delete;
    clear(): void;
    update(sessionId: string, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number, content: {
        text: string;
        languageId?: string;
    }): Promise<void>;
    private setVulns;
    private getUri;
    private getUriMetaData;
}
