import { type Event } from "../../../../base/common/event.js";
import type { URI } from "../../../../base/common/uri.js";
import { type ResourceEdit } from "../../../../editor/browser/services/bulkEditService.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
export declare class ConflictDetector {
    private readonly _conflicts;
    private readonly _disposables;
    private readonly _onDidConflict;
    readonly onDidConflict: Event<this>;
    constructor(edits: ResourceEdit[], fileService: IFileService, modelService: IModelService, logService: ILogService);
    dispose(): void;
    list(): URI[];
    hasConflicts(): boolean;
}
