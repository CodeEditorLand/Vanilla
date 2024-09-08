import { type UriComponents } from "../../../base/common/uri.js";
import type { ILogService } from "../../../platform/log/common/log.js";
import type { ExtHostInteractiveShape, IMainContext } from "./extHost.protocol.js";
import { type ExtHostCommands } from "./extHostCommands.js";
import type { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import type { ExtHostNotebookController } from "./extHostNotebook.js";
export declare class ExtHostInteractive implements ExtHostInteractiveShape {
    private _extHostNotebooks;
    private _textDocumentsAndEditors;
    private _commands;
    constructor(mainContext: IMainContext, _extHostNotebooks: ExtHostNotebookController, _textDocumentsAndEditors: ExtHostDocumentsAndEditors, _commands: ExtHostCommands, _logService: ILogService);
    $willAddInteractiveDocument(uri: UriComponents, eol: string, languageId: string, notebookUri: UriComponents): void;
    $willRemoveInteractiveDocument(uri: UriComponents, notebookUri: UriComponents): void;
}
