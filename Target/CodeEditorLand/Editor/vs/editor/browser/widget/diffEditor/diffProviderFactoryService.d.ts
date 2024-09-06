import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { IDocumentDiff, IDocumentDiffProvider, IDocumentDiffProviderOptions } from "vs/editor/common/diff/documentDiffProvider";
import { ITextModel } from "vs/editor/common/model";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare const IDiffProviderFactoryService: any;
export interface IDocumentDiffFactoryOptions {
    readonly diffAlgorithm?: "legacy" | "advanced";
}
export interface IDiffProviderFactoryService {
    readonly _serviceBrand: undefined;
    createDiffProvider(options: IDocumentDiffFactoryOptions): IDocumentDiffProvider;
}
export declare class WorkerBasedDiffProviderFactoryService implements IDiffProviderFactoryService {
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    constructor(instantiationService: IInstantiationService);
    createDiffProvider(options: IDocumentDiffFactoryOptions): IDocumentDiffProvider;
}
export declare class WorkerBasedDocumentDiffProvider implements IDocumentDiffProvider, IDisposable {
    private readonly editorWorkerService;
    private readonly telemetryService;
    private onDidChangeEventEmitter;
    readonly onDidChange: Event<void>;
    private diffAlgorithm;
    private diffAlgorithmOnDidChangeSubscription;
    private static readonly diffCache;
    constructor(options: IWorkerBasedDocumentDiffProviderOptions, editorWorkerService: IEditorWorkerService, telemetryService: ITelemetryService);
    dispose(): void;
    computeDiff(original: ITextModel, modified: ITextModel, options: IDocumentDiffProviderOptions, cancellationToken: CancellationToken): Promise<IDocumentDiff>;
    setOptions(newOptions: IWorkerBasedDocumentDiffProviderOptions): void;
}
interface IWorkerBasedDocumentDiffProviderOptions {
    readonly diffAlgorithm?: "legacy" | "advanced" | IDocumentDiffProvider;
}
export {};
