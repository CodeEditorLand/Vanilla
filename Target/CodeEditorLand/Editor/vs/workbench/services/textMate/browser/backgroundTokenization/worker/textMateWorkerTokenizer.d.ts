import { URI } from "vs/base/common/uri";
import { LanguageId } from "vs/editor/common/encodedTokenAttributes";
import { IModelChangedEvent, MirrorTextModel } from "vs/editor/common/model/mirrorTextModel";
import { StateDeltas } from "vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker";
import { ICreateGrammarResult } from "vs/workbench/services/textMate/common/TMGrammarFactory";
export interface TextMateModelTokenizerHost {
    getOrCreateGrammar(languageId: string, encodedLanguageId: LanguageId): Promise<ICreateGrammarResult | null>;
    setTokensAndStates(versionId: number, tokens: Uint8Array, stateDeltas: StateDeltas[]): void;
    reportTokenizationTime(timeMs: number, languageId: string, sourceExtensionId: string | undefined, lineLength: number, isRandomSample: boolean): void;
}
export declare class TextMateWorkerTokenizer extends MirrorTextModel {
    private readonly _host;
    private _languageId;
    private _encodedLanguageId;
    private _tokenizerWithStateStore;
    private _isDisposed;
    private readonly _maxTokenizationLineLength;
    private _diffStateStacksRefEqFn?;
    private readonly _tokenizeDebouncer;
    constructor(uri: URI, lines: string[], eol: string, versionId: number, _host: TextMateModelTokenizerHost, _languageId: string, _encodedLanguageId: LanguageId, maxTokenizationLineLength: number);
    dispose(): void;
    onLanguageId(languageId: string, encodedLanguageId: LanguageId): void;
    onEvents(e: IModelChangedEvent): void;
    acceptMaxTokenizationLineLength(maxTokenizationLineLength: number): void;
    retokenize(startLineNumber: number, endLineNumberExclusive: number): void;
    private _resetTokenization;
    private _tokenize;
}
