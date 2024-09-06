import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IRequestHandler, IWorkerServer } from "vs/base/common/worker/simpleWorker";
import { IRange } from "vs/editor/common/core/range";
import { IDocumentDiffProviderOptions } from "vs/editor/common/diff/documentDiffProvider";
import { IChange } from "vs/editor/common/diff/legacyLinesDiffComputer";
import { ILinesDiffComputerOptions } from "vs/editor/common/diff/linesDiffComputer";
import { IColorInformation, IInplaceReplaceSupportResult, ILink, TextEdit } from "vs/editor/common/languages";
import { IMirrorTextModel, IModelChangedEvent } from "vs/editor/common/model/mirrorTextModel";
import { DiffAlgorithmName, IDiffComputationResult, IUnicodeHighlightsResult } from "vs/editor/common/services/editorWorker";
import { FindSectionHeaderOptions, SectionHeader } from "vs/editor/common/services/findSectionHeaders";
import { ICommonModel } from "vs/editor/common/services/textModelSync/textModelSync.impl";
import { UnicodeHighlighterOptions } from "vs/editor/common/services/unicodeTextModelHighlighter";
import { EditorWorkerHost } from "./editorWorkerHost";
import { IRawModelData, IWorkerTextModelSyncChannelServer } from "./textModelSync/textModelSync.protocol";
export interface IMirrorModel extends IMirrorTextModel {
    readonly uri: URI;
    readonly version: number;
    getValue(): string;
}
export interface IWorkerContext<H = undefined> {
    /**
     * A proxy to the main thread host object.
     */
    host: H;
    /**
     * Get all available mirror models in this worker.
     */
    getMirrorModels(): IMirrorModel[];
}
/**
 * Range of a word inside a model.
 * @internal
 */
export interface IWordRange {
    /**
     * The index where the word starts.
     */
    readonly start: number;
    /**
     * The index where the word ends.
     */
    readonly end: number;
}
/**
 * @internal
 */
export interface IForeignModuleFactory {
    (ctx: IWorkerContext, createData: any): any;
}
/**
 * @internal
 */
export declare class BaseEditorSimpleWorker implements IDisposable, IWorkerTextModelSyncChannelServer, IRequestHandler {
    _requestHandlerBrand: any;
    private readonly _workerTextModelSyncServer;
    constructor();
    dispose(): void;
    protected _getModel(uri: string): ICommonModel | undefined;
    protected _getModels(): ICommonModel[];
    $acceptNewModel(data: IRawModelData): void;
    $acceptModelChanged(uri: string, e: IModelChangedEvent): void;
    $acceptRemovedModel(uri: string): void;
    $computeUnicodeHighlights(url: string, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    $findSectionHeaders(url: string, options: FindSectionHeaderOptions): Promise<SectionHeader[]>;
    $computeDiff(originalUrl: string, modifiedUrl: string, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDiffComputationResult | null>;
    private static computeDiff;
    private static _modelsAreIdentical;
    $computeDirtyDiff(originalUrl: string, modifiedUrl: string, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    private static readonly _diffLimit;
    $computeMoreMinimalEdits(modelUrl: string, edits: TextEdit[], pretty: boolean): Promise<TextEdit[]>;
    $computeHumanReadableDiff(modelUrl: string, edits: TextEdit[], options: ILinesDiffComputerOptions): TextEdit[];
    $computeLinks(modelUrl: string): Promise<ILink[] | null>;
    $computeDefaultDocumentColors(modelUrl: string): Promise<IColorInformation[] | null>;
    private static readonly _suggestionsLimit;
    $textualSuggest(modelUrls: string[], leadingWord: string | undefined, wordDef: string, wordDefFlags: string): Promise<{
        words: string[];
        duration: number;
    } | null>;
    $computeWordRanges(modelUrl: string, range: IRange, wordDef: string, wordDefFlags: string): Promise<{
        [word: string]: IRange[];
    }>;
    $navigateValueSet(modelUrl: string, range: IRange, up: boolean, wordDef: string, wordDefFlags: string): Promise<IInplaceReplaceSupportResult | null>;
}
/**
 * @internal
 */
export declare class EditorSimpleWorker extends BaseEditorSimpleWorker {
    private readonly _host;
    private readonly _foreignModuleFactory;
    private _foreignModule;
    constructor(_host: EditorWorkerHost, _foreignModuleFactory: IForeignModuleFactory | null);
    $ping(): Promise<string>;
    $loadForeignModule(moduleId: string, createData: any, foreignHostMethods: string[]): Promise<string[]>;
    $fmr(method: string, args: any[]): Promise<any>;
}
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 * @internal
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
