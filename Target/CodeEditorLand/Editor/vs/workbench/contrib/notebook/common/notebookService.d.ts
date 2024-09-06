import { VSBuffer, VSBufferReadableStream } from "vs/base/common/buffer";
import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ConfigurationTarget } from "vs/platform/configuration/common/configuration";
import { IFileStatWithMetadata, IWriteFileOptions } from "vs/platform/files/common/files";
import { NotebookCellTextModel } from "vs/workbench/contrib/notebook/common/model/notebookCellTextModel";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookContributionData, INotebookRendererInfo, INotebookStaticPreloadInfo, IOrderedMimeType, IOutputDto, NotebookData, NotebookExtensionDescription, TransientOptions } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { NotebookProviderInfo } from "vs/workbench/contrib/notebook/common/notebookProvider";
import { NotebookPriorityInfo } from "vs/workbench/contrib/search/common/search";
import { INotebookFileMatchNoModel } from "vs/workbench/contrib/search/common/searchNotebookHelpers";
import { ITextQuery } from "vs/workbench/services/search/common/search";
export declare const INotebookService: any;
export interface INotebookContentProvider {
    options: TransientOptions;
    open(uri: URI, backupId: string | VSBuffer | undefined, untitledDocumentData: VSBuffer | undefined, token: CancellationToken): Promise<{
        data: NotebookData;
        transientOptions: TransientOptions;
    }>;
    backup(uri: URI, token: CancellationToken): Promise<string | VSBuffer>;
}
export interface INotebookSerializer {
    options: TransientOptions;
    dataToNotebook(data: VSBuffer): Promise<NotebookData>;
    notebookToData(data: NotebookData): Promise<VSBuffer>;
    save(uri: URI, versionId: number, options: IWriteFileOptions, token: CancellationToken): Promise<IFileStatWithMetadata>;
    searchInNotebooks(textQuery: ITextQuery, token: CancellationToken, allPriorityInfo: Map<string, NotebookPriorityInfo[]>): Promise<{
        results: INotebookFileMatchNoModel<URI>[];
        limitHit: boolean;
    }>;
}
export interface INotebookRawData {
    data: NotebookData;
    transientOptions: TransientOptions;
}
export declare class SimpleNotebookProviderInfo {
    readonly viewType: string;
    readonly serializer: INotebookSerializer;
    readonly extensionData: NotebookExtensionDescription;
    constructor(viewType: string, serializer: INotebookSerializer, extensionData: NotebookExtensionDescription);
}
export interface INotebookService {
    readonly _serviceBrand: undefined;
    canResolve(viewType: string): Promise<boolean>;
    readonly onAddViewType: Event<string>;
    readonly onWillRemoveViewType: Event<string>;
    readonly onDidChangeOutputRenderers: Event<void>;
    readonly onWillAddNotebookDocument: Event<NotebookTextModel>;
    readonly onDidAddNotebookDocument: Event<NotebookTextModel>;
    readonly onWillRemoveNotebookDocument: Event<NotebookTextModel>;
    readonly onDidRemoveNotebookDocument: Event<NotebookTextModel>;
    registerNotebookSerializer(viewType: string, extensionData: NotebookExtensionDescription, serializer: INotebookSerializer): IDisposable;
    withNotebookDataProvider(viewType: string): Promise<SimpleNotebookProviderInfo>;
    tryGetDataProviderSync(viewType: string): SimpleNotebookProviderInfo | undefined;
    getOutputMimeTypeInfo(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined, output: IOutputDto): readonly IOrderedMimeType[];
    getViewTypeProvider(viewType: string): string | undefined;
    getRendererInfo(id: string): INotebookRendererInfo | undefined;
    getRenderers(): INotebookRendererInfo[];
    getStaticPreloads(viewType: string): Iterable<INotebookStaticPreloadInfo>;
    /** Updates the preferred renderer for the given mimetype in the workspace. */
    updateMimePreferredRenderer(viewType: string, mimeType: string, rendererId: string, otherMimetypes: readonly string[]): void;
    saveMimeDisplayOrder(target: ConfigurationTarget): void;
    createNotebookTextModel(viewType: string, uri: URI, stream?: VSBufferReadableStream): Promise<NotebookTextModel>;
    getNotebookTextModel(uri: URI): NotebookTextModel | undefined;
    getNotebookTextModels(): Iterable<NotebookTextModel>;
    listNotebookDocuments(): readonly NotebookTextModel[];
    /**	Register a notebook type that we will handle. The notebook editor will be registered for notebook types contributed by extensions */
    registerContributedNotebookType(viewType: string, data: INotebookContributionData): IDisposable;
    getContributedNotebookType(viewType: string): NotebookProviderInfo | undefined;
    getContributedNotebookTypes(resource?: URI): readonly NotebookProviderInfo[];
    getNotebookProviderResourceRoots(): URI[];
    setToCopy(items: NotebookCellTextModel[], isCopy: boolean): void;
    getToCopy(): {
        items: NotebookCellTextModel[];
        isCopy: boolean;
    } | undefined;
    clearEditorCache(): void;
}
