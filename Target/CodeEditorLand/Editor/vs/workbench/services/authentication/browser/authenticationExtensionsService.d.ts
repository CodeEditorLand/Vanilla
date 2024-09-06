import { Disposable } from "../../../../base/common/lifecycle.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IActivityService } from "../../activity/common/activity.js";
import { AuthenticationSession, IAuthenticationExtensionsService, IAuthenticationService } from "../common/authentication.js";
import { IAuthenticationAccessService } from "./authenticationAccessService.js";
import { IAuthenticationUsageService } from "./authenticationUsageService.js";
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
