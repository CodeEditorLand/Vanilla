import { Event } from "../../../base/common/event.js";
import { type IPosition } from "../core/position.js";
import type { Range } from "../core/range.js";
import { type IWordAtPosition } from "../core/wordHelper.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
import { ILanguageService } from "../languages/language.js";
import { ILanguageConfigurationService, type LanguageConfigurationServiceChangeEvent } from "../languages/languageConfigurationRegistry.js";
import { ITreeSitterParserService } from "../services/treeSitterParserService.js";
import type { IModelContentChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelTokensChangedEvent } from "../textModelEvents.js";
import { BackgroundTokenizationState, type ITokenizationTextModelPart, type ITokenizeLineWithEditResult, type LineEditWithAdditionalLines } from "../tokenizationTextModelPart.js";
import type { LineTokens } from "../tokens/lineTokens.js";
import type { SparseMultilineTokens } from "../tokens/sparseMultilineTokens.js";
import type { BracketPairsTextModelPart } from "./bracketPairsTextModelPart/bracketPairsImpl.js";
import type { TextModel } from "./textModel.js";
import { TextModelPart } from "./textModelPart.js";
import { type AttachedViews } from "./tokens.js";
export declare class TokenizationTextModelPart extends TextModelPart implements ITokenizationTextModelPart {
    private readonly _textModel;
    private readonly _bracketPairsTextModelPart;
    private _languageId;
    private readonly _attachedViews;
    private readonly _languageService;
    private readonly _languageConfigurationService;
    private readonly _treeSitterService;
    private readonly _semanticTokens;
    private readonly _onDidChangeLanguage;
    readonly onDidChangeLanguage: Event<IModelLanguageChangedEvent>;
    private readonly _onDidChangeLanguageConfiguration;
    readonly onDidChangeLanguageConfiguration: Event<IModelLanguageConfigurationChangedEvent>;
    private readonly _onDidChangeTokens;
    readonly onDidChangeTokens: Event<IModelTokensChangedEvent>;
    private _tokens;
    private readonly _tokensDisposables;
    constructor(_textModel: TextModel, _bracketPairsTextModelPart: BracketPairsTextModelPart, _languageId: string, _attachedViews: AttachedViews, _languageService: ILanguageService, _languageConfigurationService: ILanguageConfigurationService, _treeSitterService: ITreeSitterParserService);
    private createGrammarTokens;
    private createTreeSitterTokens;
    private createTokens;
    private createPreferredTokenProvider;
    _hasListeners(): boolean;
    handleLanguageConfigurationServiceChange(e: LanguageConfigurationServiceChangeEvent): void;
    handleDidChangeContent(e: IModelContentChangedEvent): void;
    handleDidChangeAttached(): void;
    /**
     * Includes grammar and semantic tokens.
     */
    getLineTokens(lineNumber: number): LineTokens;
    private _emitModelTokensChangedEvent;
    private validateLineNumber;
    get hasTokens(): boolean;
    resetTokenization(): void;
    get backgroundTokenizationState(): BackgroundTokenizationState;
    forceTokenization(lineNumber: number): void;
    hasAccurateTokensForLine(lineNumber: number): boolean;
    isCheapToTokenize(lineNumber: number): boolean;
    tokenizeIfCheap(lineNumber: number): void;
    getTokenTypeIfInsertingCharacter(lineNumber: number, column: number, character: string): StandardTokenType;
    tokenizeLineWithEdit(lineNumber: number, edit: LineEditWithAdditionalLines): ITokenizeLineWithEditResult;
    setSemanticTokens(tokens: SparseMultilineTokens[] | null, isComplete: boolean): void;
    hasCompleteSemanticTokens(): boolean;
    hasSomeSemanticTokens(): boolean;
    setPartialSemanticTokens(range: Range, tokens: SparseMultilineTokens[]): void;
    getWordAtPosition(_position: IPosition): IWordAtPosition | null;
    private getLanguageConfiguration;
    private static _findLanguageBoundaries;
    getWordUntilPosition(position: IPosition): IWordAtPosition;
    getLanguageId(): string;
    getLanguageIdAtPosition(lineNumber: number, column: number): string;
    setLanguageId(languageId: string, source?: string): void;
}