import { VSBuffer } from "vs/base/common/buffer";
import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { URI, UriComponents } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import * as files from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { ExtHostNotebookShape, IMainContext, INotebookCellStatusBarListDto, INotebookDocumentsAndEditorsDelta, INotebookPartialFileStatsWithMetadata, NotebookDataDto } from "vs/workbench/api/common/extHost.protocol";
import { ExtHostCommands } from "vs/workbench/api/common/extHostCommands";
import { ExtHostDocuments } from "vs/workbench/api/common/extHostDocuments";
import { ExtHostDocumentsAndEditors } from "vs/workbench/api/common/extHostDocumentsAndEditors";
import { IExtHostConsumerFileSystem } from "vs/workbench/api/common/extHostFileSystemConsumer";
import { IExtHostSearch } from "vs/workbench/api/common/extHostSearch";
import { NotebookPriorityInfo } from "vs/workbench/contrib/search/common/search";
import { IRawClosedNotebookFileMatch } from "vs/workbench/contrib/search/common/searchNotebookHelpers";
import { SerializableObjectWithBuffers } from "vs/workbench/services/extensions/common/proxyIdentifier";
import { ITextQuery } from "vs/workbench/services/search/common/search";
import type * as vscode from "vscode";
import { ExtHostNotebookDocument } from "./extHostNotebookDocument";
import { ExtHostNotebookEditor } from "./extHostNotebookEditor";
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
    readonly onDidChangeActiveNotebookEditor: any;
    private _activeNotebookEditor;
    get activeNotebookEditor(): vscode.NotebookEditor | undefined;
    private _visibleNotebookEditors;
    get visibleNotebookEditors(): vscode.NotebookEditor[];
    private _onDidOpenNotebookDocument;
    onDidOpenNotebookDocument: Event<vscode.NotebookDocument>;
    private _onDidCloseNotebookDocument;
    onDidCloseNotebookDocument: Event<vscode.NotebookDocument>;
    private _onDidChangeVisibleNotebookEditors;
    onDidChangeVisibleNotebookEditors: any;
    private _statusBarCache;
    constructor(mainContext: IMainContext, commands: ExtHostCommands, _textDocumentsAndEditors: ExtHostDocumentsAndEditors, _textDocuments: ExtHostDocuments, _extHostFileSystem: IExtHostConsumerFileSystem, _extHostSearch: IExtHostSearch, _logService: ILogService);
    getEditorById(editorId: string): ExtHostNotebookEditor;
    getIdByEditor(editor: vscode.NotebookEditor): string | undefined;
    get notebookDocuments(): any[];
    getNotebookDocument(uri: URI, relaxed: true): ExtHostNotebookDocument | undefined;
    getNotebookDocument(uri: URI): ExtHostNotebookDocument;
    private static _convertNotebookRegistrationData;
    registerNotebookCellStatusBarItemProvider(extension: IExtensionDescription, notebookType: string, provider: vscode.NotebookCellStatusBarItemProvider): any;
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
