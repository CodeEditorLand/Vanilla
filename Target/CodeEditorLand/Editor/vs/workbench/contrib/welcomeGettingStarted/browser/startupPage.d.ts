import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IWorkingCopyBackupService } from "vs/workbench/services/workingCopy/common/workingCopyBackup";
export declare const restoreWalkthroughsConfigurationKey = "workbench.welcomePage.restorableWalkthroughs";
export type RestoreWalkthroughsConfigurationValue = {
    folder: string;
    category?: string;
    step?: string;
};
export declare class StartupPageEditorResolverContribution implements IWorkbenchContribution {
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.startupPageEditorResolver";
    constructor(instantiationService: IInstantiationService, editorResolverService: IEditorResolverService);
}
export declare class StartupPageRunnerContribution implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly editorService;
    private readonly workingCopyBackupService;
    private readonly fileService;
    private readonly contextService;
    private readonly lifecycleService;
    private readonly layoutService;
    private readonly productService;
    private readonly commandService;
    private readonly environmentService;
    private readonly storageService;
    private readonly logService;
    private readonly notificationService;
    static readonly ID = "workbench.contrib.startupPageRunner";
    constructor(configurationService: IConfigurationService, editorService: IEditorService, workingCopyBackupService: IWorkingCopyBackupService, fileService: IFileService, contextService: IWorkspaceContextService, lifecycleService: ILifecycleService, layoutService: IWorkbenchLayoutService, productService: IProductService, commandService: ICommandService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService, logService: ILogService, notificationService: INotificationService);
    private run;
    private tryOpenWalkthroughForFolder;
    private openReadme;
    private openGettingStarted;
}
