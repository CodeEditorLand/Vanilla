import type { NotebookDocumentWillSaveEvent } from "vscode";
import type { CancellationToken } from "../../../base/common/cancellation.js";
import { type Event } from "../../../base/common/event.js";
import { type UriComponents } from "../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import type { ILogService } from "../../../platform/log/common/log.js";
import type { SaveReason } from "../../common/editor.js";
import type { ExtHostNotebookDocumentSaveParticipantShape, MainThreadBulkEditsShape } from "./extHost.protocol.js";
import type { ExtHostNotebookController } from "./extHostNotebook.js";
export declare class ExtHostNotebookDocumentSaveParticipant implements ExtHostNotebookDocumentSaveParticipantShape {
    private readonly _logService;
    private readonly _notebooksAndEditors;
    private readonly _mainThreadBulkEdits;
    private readonly _thresholds;
    private readonly _onWillSaveNotebookDocumentEvent;
    constructor(_logService: ILogService, _notebooksAndEditors: ExtHostNotebookController, _mainThreadBulkEdits: MainThreadBulkEditsShape, _thresholds?: {
        timeout: number;
        errors: number;
    });
    dispose(): void;
    getOnWillSaveNotebookDocumentEvent(extension: IExtensionDescription): Event<NotebookDocumentWillSaveEvent>;
    $participateInSave(resource: UriComponents, reason: SaveReason, token: CancellationToken): Promise<boolean>;
}
