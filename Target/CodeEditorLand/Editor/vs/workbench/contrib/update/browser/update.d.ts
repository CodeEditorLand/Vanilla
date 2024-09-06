import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUpdateService } from "vs/platform/update/common/update";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
export declare const CONTEXT_UPDATE_STATE: any;
export declare const MAJOR_MINOR_UPDATE_AVAILABLE: any;
export declare const RELEASE_NOTES_URL: any;
export declare const DOWNLOAD_URL: any;
export declare function showReleaseNotesInEditor(instantiationService: IInstantiationService, version: string, useCurrentFile: boolean): any;
export declare class ProductContribution implements IWorkbenchContribution {
    private static readonly KEY;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, notificationService: INotificationService, environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, configurationService: IConfigurationService, hostService: IHostService, productService: IProductService, contextKeyService: IContextKeyService);
}
export declare class UpdateContribution extends Disposable implements IWorkbenchContribution {
    private readonly storageService;
    private readonly instantiationService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly updateService;
    private readonly activityService;
    private readonly contextKeyService;
    private readonly productService;
    private readonly openerService;
    private readonly configurationService;
    private readonly hostService;
    private state;
    private readonly badgeDisposable;
    private updateStateContextKey;
    private majorMinorUpdateAvailableContextKey;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, notificationService: INotificationService, dialogService: IDialogService, updateService: IUpdateService, activityService: IActivityService, contextKeyService: IContextKeyService, productService: IProductService, openerService: IOpenerService, configurationService: IConfigurationService, hostService: IHostService);
    private onUpdateStateChange;
    private onError;
    private onUpdateNotAvailable;
    private onUpdateAvailable;
    private onUpdateDownloaded;
    private onUpdateReady;
    private shouldShowNotification;
    private registerGlobalActivityActions;
}
export declare class SwitchProductQualityContribution extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    private readonly environmentService;
    constructor(productService: IProductService, environmentService: IBrowserWorkbenchEnvironmentService);
    private registerGlobalActivityActions;
}
