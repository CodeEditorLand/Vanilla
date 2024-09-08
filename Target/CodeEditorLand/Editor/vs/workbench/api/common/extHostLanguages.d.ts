import type * as vscode from "vscode";
import type { IURITransformer } from "../../../base/common/uriIpc.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostLanguagesShape, type IMainContext } from "./extHost.protocol.js";
import type { CommandsConverter } from "./extHostCommands.js";
import type { ExtHostDocuments } from "./extHostDocuments.js";
export declare class ExtHostLanguages implements ExtHostLanguagesShape {
    private readonly _documents;
    private readonly _commands;
    private readonly _uriTransformer;
    private readonly _proxy;
    private _languageIds;
    constructor(mainContext: IMainContext, _documents: ExtHostDocuments, _commands: CommandsConverter, _uriTransformer: IURITransformer | undefined);
    $acceptLanguageIds(ids: string[]): void;
    getLanguages(): Promise<string[]>;
    changeLanguage(uri: vscode.Uri, languageId: string): Promise<vscode.TextDocument>;
    tokenAtPosition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.TokenInformation>;
    private _handlePool;
    private _ids;
    createLanguageStatusItem(extension: IExtensionDescription, id: string, selector: vscode.DocumentSelector): vscode.LanguageStatusItem;
}