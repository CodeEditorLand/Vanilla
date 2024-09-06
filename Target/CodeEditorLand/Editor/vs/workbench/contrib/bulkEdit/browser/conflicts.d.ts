import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { ResourceEdit } from "vs/editor/browser/services/bulkEditService";
import { IModelService } from "vs/editor/common/services/model";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
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
