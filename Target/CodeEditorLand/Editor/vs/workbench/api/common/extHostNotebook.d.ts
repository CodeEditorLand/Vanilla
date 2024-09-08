import type * as vscode from "vscode";
import { VSBuffer } from "../../../base/common/buffer.js";
import type { CancellationToken } from "../../../base/common/cancellation.js";
import { type Event } from "../../../base/common/event.js";
import { URI, type UriComponents } from "../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import * as files from "../../../platform/files/common/files.js";
import type { ILogService } from "../../../platform/log/common/log.js";
import type { NotebookPriorityInfo } from "../../contrib/search/common/search.js";
import { type IRawClosedNotebookFileMatch } from "../../contrib/search/common/searchNotebookHelpers.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { type ITextQuery } from "../../services/search/common/search.js";
import { type ExtHostNotebookShape, type IMainContext, type INotebookCellStatusBarListDto, type INotebookDocumentsAndEditorsDelta, type INotebookPartialFileStatsWithMetadata, type NotebookDataDto } from "./extHost.protocol.js";
import { type ExtHostCommands } from "./extHostCommands.js";
import type { ExtHostDocuments } from "./extHostDocuments.js";
import type { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import type { IExtHostConsumerFileSystem } from "./extHostFileSystemConsumer.js";
import { ExtHostNotebookDocument } from "./extHostNotebookDocument.js";
import { ExtHostNotebookEditor } from "./extHostNotebookEditor.js";
import type { IExtHostSearch } from "./extHostSearch.js";
import * as extHostTypes from "./extHostTypes.js";
export declare class ExtHostNotebookController implements ExtHostNotebookShape {
    private _textDocumentsAndEditors;
    private _textDocuments;
    private _extHostFileSystem;
    private _extHostSearch;
    private _logService;
    private static _notebookStatusBarItemProviderHandlePool;
    private readonly _notebookProxy;
    private readonly _notebookDocumentsProxy;
    private readonly _notebookEditorsProxy;
    private readonly _notebookStatusBarItemProviders;
    private readonly _documents;
    private readonly _editors;
    private readonly _commandsConverter;
    private readonly _onDidChangeActiveNotebookEditor;
    readonly onDidChangeActiveNotebookEditor: Event<vscode.NotebookEditor | undefined>;
    private _activeNotebookEditor;
    get activeNotebookEditor(): vscode.NotebookEditor | undefined;
    private _visibleNotebookEditors;
    get visibleNotebookEditors(): vscode.NotebookEditor[];
    private _onDidOpenNotebookDocument;
    onDidOpenNotebookDocument: Event<vscode.NotebookDocument>;
    private _onDidCloseNotebookDocument;
    onDidCloseNotebookDocument: Event<vscode.NotebookDocument>;
    private _onDidChangeVisibleNotebookEditors;
    onDidChangeVisibleNotebookEditors: Event<vscode.NotebookEditor[]>;
    private _statusBarCache;
    constructor(mainContext: IMainContext, commands: ExtHostCommands, _textDocumentsAndEditors: ExtHostDocumentsAndEditors, _textDocuments: ExtHostDocuments, _extHostFileSystem: IExtHostConsumerFileSystem, _extHostSearch: IExtHostSearch, _logService: ILogService);
    getEditorById(editorId: string): ExtHostNotebookEditor;
    getIdByEditor(editor: vscode.NotebookEditor): string | undefined;
    get notebookDocuments(): ExtHostNotebookDocument[];
    getNotebookDocument(uri: URI, relaxed: true): ExtHostNotebookDocument | undefined;
    getNotebookDocument(uri: URI): ExtHostNotebookDocument;
    private static _convertNotebookRegistrationData;
    registerNotebookCellStatusBarItemProvider(extension: IExtensionDescription, notebookType: string, provider: vscode.NotebookCellStatusBarItemProvider): extHostTypes.Disposable;
    createNotebookDocument(options: {
        viewType: string;
        content?: vscode.NotebookData;
    }): Promise<URI>;
    openNotebookDocument(uri: URI): Promise<vscode.NotebookDocument>;
    showNotebookDocument(notebook: vscode.NotebookDocument, options?: vscode.NotebookDocumentShowOptions): Promise<vscode.NotebookEditor>;
    $provideNotebookCellStatusBarItems(handle: number, uri: UriComponents, index: number, token: CancellationToken): Promise<INotebookCellStatusBarListDto | undefined>;
    $releaseNotebookCellStatusBarItems(cacheId: number): void;
    private _handlePool;
    private readonly _notebookSerializer;
    registerNotebookSerializer(extension: IExtensionDescription, viewType: string, serializer: vscode.NotebookSerializer, options?: vscode.NotebookDocumentContentOptions, registration?: vscode.NotebookRegistrationData): vscode.Disposable;
    $dataToNotebook(handle: number, bytes: VSBuffer, token: CancellationToken): Promise<SerializableObjectWithBuffers<NotebookDataDto>>;
    $notebookToData(handle: number, data: SerializableObjectWithBuffers<NotebookDataDto>, token: CancellationToken): Promise<VSBuffer>;
    $saveNotebook(handle: number, uriComponents: UriComponents, versionId: number, options: files.IWriteFileOptions, token: CancellationToken): Promise<INotebookPartialFileStatsWithMetadata>;
    /**
     * Search for query in all notebooks that can be deserialized by the serializer fetched by `handle`.
     *
     * @param handle used to get notebook serializer
     * @param textQuery the text query to search using
     * @param viewTypeFileTargets the globs (and associated ranks) that are targetting for opening this type of notebook
     * @param otherViewTypeFileTargets ranked globs for other editors that we should consider when deciding whether it will open as this notebook
     * @param token cancellation token
     * @returns `IRawClosedNotebookFileMatch` for every file. Files without matches will just have a `IRawClosedNotebookFileMatch`
     * 	with no `cellResults`. This allows the caller to know what was searched in already, even if it did not yield results.
     */
    $searchInNotebooks(handle: number, textQuery: ITextQuery, viewTypeFileTargets: NotebookPriorityInfo[], otherViewTypeFileTargets: NotebookPriorityInfo[], token: CancellationToken): Promise<{
        results: IRawClosedNotebookFileMatch[];
        limitHit: boolean;
    }>;
    private _validateWriteFile;
    private _resourceForError;
    private _createExtHostEditor;
    $acceptDocumentAndEditorsDelta(delta: SerializableObjectWithBuffers<INotebookDocumentsAndEditorsDelta>): void;
    private static _registerApiCommands;
    private trace;
}
