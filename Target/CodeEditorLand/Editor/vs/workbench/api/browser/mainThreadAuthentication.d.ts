import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { UriComponents } from "vs/base/common/uri";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IAuthenticationAccessService } from "vs/workbench/services/authentication/browser/authenticationAccessService";
import { IAuthenticationUsageService } from "vs/workbench/services/authentication/browser/authenticationUsageService";
import { AuthenticationSession, AuthenticationSessionAccount, AuthenticationSessionsChangeEvent, IAuthenticationCreateSessionOptions, IAuthenticationExtensionsService, IAuthenticationProvider, IAuthenticationProviderSessionOptions, IAuthenticationService } from "vs/workbench/services/authentication/common/authentication";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { ExtHostAuthenticationShape, MainThreadAuthenticationShape } from "../common/extHost.protocol";
interface AuthenticationForceNewSessionOptions {
    detail?: string;
    learnMore?: UriComponents;
    sessionToRecreate?: AuthenticationSession;
}
interface AuthenticationGetSessionOptions {
    clearSessionPreference?: boolean;
    createIfNone?: boolean;
    forceNewSession?: boolean | AuthenticationForceNewSessionOptions;
    silent?: boolean;
    account?: AuthenticationSessionAccount;
}
export declare class MainThreadAuthenticationProvider extends Disposable implements IAuthenticationProvider {
    private readonly _proxy;
    readonly id: string;
    readonly label: string;
    readonly supportsMultipleAccounts: boolean;
    private readonly notificationService;
    readonly onDidChangeSessions: Event<AuthenticationSessionsChangeEvent>;
    constructor(_proxy: ExtHostAuthenticationShape, id: string, label: string, supportsMultipleAccounts: boolean, notificationService: INotificationService, onDidChangeSessionsEmitter: Emitter<AuthenticationSessionsChangeEvent>);
    getSessions(scopes: string[] | undefined, options: IAuthenticationProviderSessionOptions): Promise<readonly AuthenticationSession[]>;
    createSession(scopes: string[], options: IAuthenticationCreateSessionOptions): Promise<AuthenticationSession>;
    removeSession(sessionId: string): Promise<void>;
}
export declare class MainThreadAuthentication extends Disposable implements MainThreadAuthenticationShape {
    private readonly authenticationService;
    private readonly authenticationExtensionsService;
    private readonly authenticationAccessService;
    private readonly authenticationUsageService;
    private readonly dialogService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly telemetryService;
    private readonly openerService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(extHostContext: IExtHostContext, authenticationService: IAuthenticationService, authenticationExtensionsService: IAuthenticationExtensionsService, authenticationAccessService: IAuthenticationAccessService, authenticationUsageService: IAuthenticationUsageService, dialogService: IDialogService, notificationService: INotificationService, extensionService: IExtensionService, telemetryService: ITelemetryService, openerService: IOpenerService);
    $registerAuthenticationProvider(id: string, label: string, supportsMultipleAccounts: boolean): Promise<void>;
    $unregisterAuthenticationProvider(id: string): void;
    $ensureProvider(id: string): Promise<void>;
    $sendDidChangeSessions(providerId: string, event: AuthenticationSessionsChangeEvent): void;
    $removeSession(providerId: string, sessionId: string): Promise<void>;
    private loginPrompt;
    private continueWithIncorrectAccountPrompt;
    private doGetSession;
    $getSession(providerId: string, scopes: string[], extensionId: string, extensionName: string, options: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined>;
    $getAccounts(providerId: string): Promise<ReadonlyArray<AuthenticationSessionAccount>>;
    private sendProviderUsageTelemetry;
}
export {};
