import { IPosition } from "vs/editor/common/core/position";
import { StandardTokenType } from "vs/editor/common/encodedTokenAttributes";
import { ILanguageIdCodec } from "vs/editor/common/languages";
import { TextModel } from "vs/editor/common/model/textModel";
import { AbstractTokens } from "vs/editor/common/model/tokens";
import { ITreeSitterParserService } from "vs/editor/common/services/treeSitterParserService";
import { IModelContentChangedEvent } from "vs/editor/common/textModelEvents";
import { LineTokens } from "vs/editor/common/tokens/lineTokens";
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
    tokenizeLineWithEdit(position: IPosition, length: number, newText: string): LineTokens | null;
    get hasTokens(): boolean;
}
