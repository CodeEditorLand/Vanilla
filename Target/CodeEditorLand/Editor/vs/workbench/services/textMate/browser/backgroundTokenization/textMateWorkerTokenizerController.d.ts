import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { Proxied } from "vs/base/common/worker/simpleWorker";
import { IBackgroundTokenizationStore, ILanguageIdCodec } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import type { StateDeltas, TextMateTokenizationWorker } from "vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker";
export declare class TextMateWorkerTokenizerController extends Disposable {
    private readonly _model;
    private readonly _worker;
    private readonly _languageIdCodec;
    private readonly _backgroundTokenizationStore;
    private readonly _configurationService;
    private readonly _maxTokenizationLineLength;
    private static _id;
    readonly controllerId: number;
    private readonly _pendingChanges;
    /**
     * These states will eventually equal the worker states.
     * _states[i] stores the state at the end of line number i+1.
     */
    private readonly _states;
    private readonly _loggingEnabled;
    private _applyStateStackDiffFn?;
    private _initialState?;
    constructor(_model: ITextModel, _worker: Proxied<TextMateTokenizationWorker>, _languageIdCodec: ILanguageIdCodec, _backgroundTokenizationStore: IBackgroundTokenizationStore, _configurationService: IConfigurationService, _maxTokenizationLineLength: IObservable<number>);
    dispose(): void;
    requestTokens(startLineNumber: number, endLineNumberExclusive: number): void;
    /**
     * This method is called from the worker through the worker host.
     */
    setTokensAndStates(controllerId: number, versionId: number, rawTokens: ArrayBuffer, stateDeltas: StateDeltas[]): Promise<void>;
    private get _shouldLog();
}
