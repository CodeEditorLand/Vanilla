import type { URI } from "../../../../../../base/common/uri.js";
import type { LanguageId } from "../../../../../../editor/common/encodedTokenAttributes.js";
import { MirrorTextModel, type IModelChangedEvent } from "../../../../../../editor/common/model/mirrorTextModel.js";
import type { ICreateGrammarResult } from "../../../common/TMGrammarFactory.js";
import type { StateDeltas } from "./textMateTokenizationWorker.worker.js";
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
