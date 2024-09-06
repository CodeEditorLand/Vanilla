import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IWorkerDescriptor, Proxied } from "vs/base/common/worker/simpleWorker";
import { IRange } from "vs/editor/common/core/range";
import { IDocumentDiff, IDocumentDiffProviderOptions } from "vs/editor/common/diff/documentDiffProvider";
import { IChange } from "vs/editor/common/diff/legacyLinesDiffComputer";
import * as languages from "vs/editor/common/languages";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { EditorSimpleWorker } from "vs/editor/common/services/editorSimpleWorker";
import { DiffAlgorithmName, IEditorWorkerService, IUnicodeHighlightsResult } from "vs/editor/common/services/editorWorker";
import { FindSectionHeaderOptions, SectionHeader } from "vs/editor/common/services/findSectionHeaders";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IModelService } from "vs/editor/common/services/model";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { UnicodeHighlighterOptions } from "vs/editor/common/services/unicodeTextModelHighlighter";
import { ILogService } from "vs/platform/log/common/log";
export declare abstract class EditorWorkerService extends Disposable implements IEditorWorkerService {
    private readonly _languageConfigurationService;
    readonly _serviceBrand: undefined;
    private readonly _modelService;
    private readonly _workerManager;
    private readonly _logService;
    constructor(workerDescriptor: IWorkerDescriptor, modelService: IModelService, configurationService: ITextResourceConfigurationService, logService: ILogService, _languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    canComputeUnicodeHighlights(uri: URI): boolean;
    computedUnicodeHighlights(uri: URI, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null>;
    canComputeDirtyDiff(original: URI, modified: URI): boolean;
    computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    computeMoreMinimalEdits(resource: URI, edits: languages.TextEdit[] | null | undefined, pretty?: boolean): Promise<languages.TextEdit[] | undefined>;
    computeHumanReadableDiff(resource: URI, edits: languages.TextEdit[] | null | undefined): Promise<languages.TextEdit[] | undefined>;
    canNavigateValueSet(resource: URI): boolean;
    navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<languages.IInplaceReplaceSupportResult | null>;
    canComputeWordRanges(resource: URI): boolean;
    computeWordRanges(resource: URI, range: IRange): Promise<{
        [word: string]: IRange[];
    } | null>;
    findSectionHeaders(uri: URI, options: FindSectionHeaderOptions): Promise<SectionHeader[]>;
    computeDefaultDocumentColors(uri: URI): Promise<languages.IColorInformation[] | null>;
    private _workerWithResources;
}
export interface IEditorWorkerClient {
    fhr(method: string, args: any[]): Promise<any>;
}
export declare class EditorWorkerClient extends Disposable implements IEditorWorkerClient {
    private readonly _workerDescriptor;
    private readonly _modelService;
    private readonly _keepIdleModels;
    private _worker;
    private _modelManager;
    private _disposed;
    constructor(_workerDescriptor: IWorkerDescriptor, keepIdleModels: boolean, modelService: IModelService);
    fhr(method: string, args: any[]): Promise<any>;
    private _getOrCreateWorker;
    protected _getProxy(): Promise<Proxied<EditorSimpleWorker>>;
    private _createFallbackLocalWorker;
    private _createEditorWorkerHost;
    private _getOrCreateModelManager;
    workerWithSyncedResources(resources: URI[], forceLargeModels?: boolean): Promise<Proxied<EditorSimpleWorker>>;
    textualSuggest(resources: URI[], leadingWord: string | undefined, wordDefRegExp: RegExp): Promise<{
        words: string[];
        duration: number;
    } | null>;
    dispose(): void;
}
