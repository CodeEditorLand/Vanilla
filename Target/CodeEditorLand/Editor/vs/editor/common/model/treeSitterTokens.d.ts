import { StandardTokenType } from "../encodedTokenAttributes.js";
import { type ILanguageIdCodec } from "../languages.js";
import type { ITreeSitterParserService } from "../services/treeSitterParserService.js";
import type { IModelContentChangedEvent } from "../textModelEvents.js";
import type { ITokenizeLineWithEditResult, LineEditWithAdditionalLines } from "../tokenizationTextModelPart.js";
import { LineTokens } from "../tokens/lineTokens.js";
import type { TextModel } from "./textModel.js";
import { AbstractTokens } from "./tokens.js";
export declare class TreeSitterTokens extends AbstractTokens {
    private readonly _treeSitterService;
    private _tokenizationSupport;
    private _lastLanguageId;
    constructor(_treeSitterService: ITreeSitterParserService, languageIdCodec: ILanguageIdCodec, textModel: TextModel, languageId: () => string);
    private _initialize;
    getLineTokens(lineNumber: number): LineTokens;
    resetTokenization(fireTokenChangeEvent?: boolean): void;
    handleDidChangeAttached(): void;
    handleDidChangeContent(e: IModelContentChangedEvent): void;
    forceTokenization(lineNumber: number): void;
    hasAccurateTokensForLine(lineNumber: number): boolean;
    isCheapToTokenize(lineNumber: number): boolean;
    getTokenTypeIfInsertingCharacter(lineNumber: number, column: number, character: string): StandardTokenType;
    tokenizeLineWithEdit(lineNumber: number, edit: LineEditWithAdditionalLines): ITokenizeLineWithEditResult;
    get hasTokens(): boolean;
}
