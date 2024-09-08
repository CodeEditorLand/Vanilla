import type * as vscode from "vscode";
import { type Event } from "../../../base/common/event.js";
import { URI, type UriComponents } from "../../../base/common/uri.js";
import type { IModelChangedEvent } from "../../../editor/common/model/mirrorTextModel.js";
import { type ExtHostDocumentsShape, type IMainContext } from "./extHost.protocol.js";
import { type ExtHostDocumentData } from "./extHostDocumentData.js";
import type { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
export declare class ExtHostDocuments implements ExtHostDocumentsShape {
    private readonly _onDidAddDocument;
    private readonly _onDidRemoveDocument;
    private readonly _onDidChangeDocument;
    private readonly _onDidSaveDocument;
    readonly onDidAddDocument: Event<vscode.TextDocument>;
    readonly onDidRemoveDocument: Event<vscode.TextDocument>;
    readonly onDidChangeDocument: Event<vscode.TextDocumentChangeEvent>;
    readonly onDidSaveDocument: Event<vscode.TextDocument>;
    private readonly _toDispose;
    private _proxy;
    private _documentsAndEditors;
    private _documentLoader;
    constructor(mainContext: IMainContext, documentsAndEditors: ExtHostDocumentsAndEditors);
    dispose(): void;
    getAllDocumentData(): ExtHostDocumentData[];
    getDocumentData(resource: vscode.Uri): ExtHostDocumentData | undefined;
    getDocument(resource: vscode.Uri): vscode.TextDocument;
    ensureDocumentData(uri: URI): Promise<ExtHostDocumentData>;
    createDocumentData(options?: {
        language?: string;
        content?: string;
    }): Promise<URI>;
    $acceptModelLanguageChanged(uriComponents: UriComponents, newLanguageId: string): void;
    $acceptModelSaved(uriComponents: UriComponents): void;
    $acceptDirtyStateChanged(uriComponents: UriComponents, isDirty: boolean): void;
    $acceptModelChanged(uriComponents: UriComponents, events: IModelChangedEvent, isDirty: boolean): void;
    setWordDefinitionFor(languageId: string, wordDefinition: RegExp | undefined): void;
}
