import { UriComponents } from "vs/base/common/uri";
import { IBulkEditService } from "vs/editor/browser/services/bulkEditService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService, IWatchOptions } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
import { MainThreadFileSystemEventServiceShape } from "../common/extHost.protocol";
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
