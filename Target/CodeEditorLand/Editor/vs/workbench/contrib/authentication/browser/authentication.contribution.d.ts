import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IAuthenticationService } from "vs/workbench/services/authentication/common/authentication";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
export declare class AuthenticationContribution extends Disposable implements IWorkbenchContribution {
    private readonly _authenticationService;
    private readonly _environmentService;
    static ID: string;
    private _placeholderMenuItem;
    constructor(_authenticationService: IAuthenticationService, _environmentService: IBrowserWorkbenchEnvironmentService);
    private _registerAuthenticationExtentionPointHandler;
    private _registerEnvContributedAuthenticationProviders;
    private _registerHandlers;
    private _registerActions;
    private _clearPlaceholderMenuItem;
}
