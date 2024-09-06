import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IResolvedTextEditorModel, ITextModelService } from "vs/editor/common/services/resolverService";
import { IChatRequestViewModel, IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
import { IMarkdownVulnerability } from "./annotations";
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
