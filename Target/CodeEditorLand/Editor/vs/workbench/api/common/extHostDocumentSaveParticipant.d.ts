import type * as vscode from "vscode";
import type { Event } from "../../../base/common/event.js";
import { type UriComponents } from "../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import type { ILogService } from "../../../platform/log/common/log.js";
import type { SaveReason } from "../../common/editor.js";
import type { ExtHostDocumentSaveParticipantShape, MainThreadBulkEditsShape } from "./extHost.protocol.js";
import type { ExtHostDocuments } from "./extHostDocuments.js";
export declare class ExtHostDocumentSaveParticipant implements ExtHostDocumentSaveParticipantShape {
    private readonly _logService;
    private readonly _documents;
    private readonly _mainThreadBulkEdits;
    private readonly _thresholds;
    private readonly _callbacks;
    private readonly _badListeners;
    constructor(_logService: ILogService, _documents: ExtHostDocuments, _mainThreadBulkEdits: MainThreadBulkEditsShape, _thresholds?: {
        timeout: number;
        errors: number;
    });
    dispose(): void;
    getOnWillSaveTextDocumentEvent(extension: IExtensionDescription): Event<vscode.TextDocumentWillSaveEvent>;
    $participateInSave(data: UriComponents, reason: SaveReason): Promise<boolean[]>;
    private _deliverEventAsyncAndBlameBadListeners;
    private _deliverEventAsync;
}
