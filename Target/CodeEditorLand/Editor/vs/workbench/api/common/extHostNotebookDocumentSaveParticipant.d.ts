import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { UriComponents } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { ExtHostNotebookDocumentSaveParticipantShape, MainThreadBulkEditsShape } from "vs/workbench/api/common/extHost.protocol";
import { ExtHostNotebookController } from "vs/workbench/api/common/extHostNotebook";
import { SaveReason } from "vs/workbench/common/editor";
import { NotebookDocumentWillSaveEvent } from "vscode";
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
