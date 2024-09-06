import { UriComponents } from "../../../base/common/uri.js";
import { IBulkEditService } from "../../../editor/browser/services/bulkEditService.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.js";
import { IFileService, IWatchOptions } from "../../../platform/files/common/files.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IProgressService } from "../../../platform/progress/common/progress.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../platform/workspace/common/workspace.js";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IWorkingCopyFileService } from "../../services/workingCopy/common/workingCopyFileService.js";
import { MainThreadFileSystemEventServiceShape } from "../common/extHost.protocol.js";
export declare class MainThreadFileSystemEventService implements MainThreadFileSystemEventServiceShape {
    private readonly _fileService;
    private readonly _contextService;
    private readonly _logService;
    private readonly _configurationService;
    static readonly MementoKeyAdditionalEdits = "file.particpants.additionalEdits";
    private readonly _proxy;
    private readonly _listener;
    private readonly _watches;
    constructor(extHostContext: IExtHostContext, _fileService: IFileService, workingCopyFileService: IWorkingCopyFileService, bulkEditService: IBulkEditService, progressService: IProgressService, dialogService: IDialogService, storageService: IStorageService, logService: ILogService, envService: IEnvironmentService, uriIdentService: IUriIdentityService, _contextService: IWorkspaceContextService, _logService: ILogService, _configurationService: IConfigurationService);
    $watch(extensionId: string, session: number, resource: UriComponents, unvalidatedOpts: IWatchOptions, correlate: boolean): Promise<void>;
    $unwatch(session: number): void;
    dispose(): void;
}
