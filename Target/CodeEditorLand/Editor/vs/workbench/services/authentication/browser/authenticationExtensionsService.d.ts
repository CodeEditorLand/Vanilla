import { Disposable } from "vs/base/common/lifecycle";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IAuthenticationAccessService } from "vs/workbench/services/authentication/browser/authenticationAccessService";
import { IAuthenticationUsageService } from "vs/workbench/services/authentication/browser/authenticationUsageService";
import { AuthenticationSession, IAuthenticationExtensionsService, IAuthenticationService } from "vs/workbench/services/authentication/common/authentication";
export declare class AuthenticationExtensionsService extends Disposable implements IAuthenticationExtensionsService {
    private readonly activityService;
    private readonly storageService;
    private readonly dialogService;
    private readonly quickInputService;
    private readonly _authenticationService;
    private readonly _authenticationUsageService;
    private readonly _authenticationAccessService;
    readonly _serviceBrand: undefined;
    private _signInRequestItems;
    private _sessionAccessRequestItems;
    private readonly _accountBadgeDisposable;
    constructor(activityService: IActivityService, storageService: IStorageService, dialogService: IDialogService, quickInputService: IQuickInputService, _authenticationService: IAuthenticationService, _authenticationUsageService: IAuthenticationUsageService, _authenticationAccessService: IAuthenticationAccessService);
    private registerListeners;
    private updateNewSessionRequests;
    private updateAccessRequests;
    private updateBadgeCount;
    private removeAccessRequest;
    updateSessionPreference(providerId: string, extensionId: string, session: AuthenticationSession): void;
    getSessionPreference(providerId: string, extensionId: string, scopes: string[]): string | undefined;
    removeSessionPreference(providerId: string, extensionId: string, scopes: string[]): void;
    private showGetSessionPrompt;
    /**
     * This function should be used only when there are sessions to disambiguate.
     */
    selectSession(providerId: string, extensionId: string, extensionName: string, scopes: string[], availableSessions: AuthenticationSession[]): Promise<AuthenticationSession>;
    private completeSessionAccessRequest;
    requestSessionAccess(providerId: string, extensionId: string, extensionName: string, scopes: string[], possibleSessions: AuthenticationSession[]): void;
    requestNewSession(providerId: string, scopes: string[], extensionId: string, extensionName: string): Promise<void>;
}
