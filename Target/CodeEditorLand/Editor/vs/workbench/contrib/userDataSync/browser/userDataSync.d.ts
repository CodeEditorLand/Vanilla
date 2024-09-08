import { Disposable } from "../../../../base/common/lifecycle.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IUserDataAutoSyncService, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IActivityService } from "../../../services/activity/common/activity.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { IUserDataSyncWorkbenchService } from "../../../services/userDataSync/common/userDataSync.js";
import { IWorkbenchIssueService } from "../../issue/common/issue.js";
export declare class UserDataSyncWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly userDataSyncEnablementService;
    private readonly userDataSyncService;
    private readonly userDataSyncWorkbenchService;
    private readonly activityService;
    private readonly notificationService;
    private readonly editorService;
    private readonly userDataProfilesService;
    private readonly userDataProfileService;
    private readonly dialogService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly outputService;
    private readonly preferencesService;
    private readonly telemetryService;
    private readonly productService;
    private readonly openerService;
    private readonly authenticationService;
    private readonly userDataSyncStoreManagementService;
    private readonly hostService;
    private readonly commandService;
    private readonly workbenchIssueService;
    private readonly turningOnSyncContext;
    private readonly globalActivityBadgeDisposable;
    private readonly accountBadgeDisposable;
    constructor(userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncService: IUserDataSyncService, userDataSyncWorkbenchService: IUserDataSyncWorkbenchService, contextKeyService: IContextKeyService, activityService: IActivityService, notificationService: INotificationService, editorService: IEditorService, userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService, dialogService: IDialogService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, outputService: IOutputService, userDataAutoSyncService: IUserDataAutoSyncService, textModelResolverService: ITextModelService, preferencesService: IPreferencesService, telemetryService: ITelemetryService, productService: IProductService, openerService: IOpenerService, authenticationService: IAuthenticationService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, hostService: IHostService, commandService: ICommandService, workbenchIssueService: IWorkbenchIssueService);
    private get turningOnSync();
    private set turningOnSync(value);
    private toKey;
    private readonly conflictsDisposables;
    private onDidChangeConflicts;
    private acceptRemote;
    private acceptLocal;
    private onAutoSyncError;
    private handleTooLargeError;
    private readonly invalidContentErrorDisposables;
    private onSynchronizerErrors;
    private handleInvalidContentError;
    private getConflictsCount;
    private updateGlobalActivityBadge;
    private updateAccountBadge;
    private turnOn;
    private askToConfigure;
    private getConfigureSyncQuickPickItems;
    private updateConfiguration;
    private configureSyncOptions;
    private turnOff;
    private disableSync;
    private showSyncActivity;
    private selectSettingsSyncService;
    private registerActions;
    private registerTurnOnSyncAction;
    private registerTurningOnSyncAction;
    private registerCancelTurnOnSyncAction;
    private registerSignInAction;
    private getShowConflictsTitle;
    private readonly conflictsActionDisposable;
    private registerShowConflictsAction;
    private registerManageSyncAction;
    private registerEnableSyncViewsAction;
    private registerSyncNowAction;
    private registerTurnOffSyncAction;
    private registerConfigureSyncAction;
    private registerShowLogAction;
    private registerShowSettingsAction;
    private registerHelpAction;
    private registerAcceptMergesAction;
    private registerDownloadSyncActivityAction;
    private registerViews;
    private registerViewContainer;
    private registerResetSyncDataAction;
    private registerDataViews;
}
