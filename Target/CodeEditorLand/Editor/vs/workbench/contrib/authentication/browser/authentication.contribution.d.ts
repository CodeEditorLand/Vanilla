import { Disposable } from "../../../../base/common/lifecycle.js";
import { type IWorkbenchContribution } from "../../../common/contributions.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
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
