import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { AllowedExtension } from "vs/workbench/services/authentication/common/authentication";
export declare const IAuthenticationAccessService: any;
export interface IAuthenticationAccessService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeExtensionSessionAccess: Event<{
        providerId: string;
        accountName: string;
    }>;
    /**
     * Check extension access to an account
     * @param providerId The id of the authentication provider
     * @param accountName The account name that access is checked for
     * @param extensionId The id of the extension requesting access
     * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
     * if they haven't made a choice yet
     */
    isAccessAllowed(providerId: string, accountName: string, extensionId: string): boolean | undefined;
    readAllowedExtensions(providerId: string, accountName: string): AllowedExtension[];
    updateAllowedExtensions(providerId: string, accountName: string, extensions: AllowedExtension[]): void;
    removeAllowedExtensions(providerId: string, accountName: string): void;
}
export declare class AuthenticationAccessService extends Disposable implements IAuthenticationAccessService {
    private readonly _storageService;
    private readonly _productService;
    _serviceBrand: undefined;
    private _onDidChangeExtensionSessionAccess;
    readonly onDidChangeExtensionSessionAccess: Event<{
        providerId: string;
        accountName: string;
    }>;
    constructor(_storageService: IStorageService, _productService: IProductService);
    isAccessAllowed(providerId: string, accountName: string, extensionId: string): boolean | undefined;
    readAllowedExtensions(providerId: string, accountName: string): AllowedExtension[];
    updateAllowedExtensions(providerId: string, accountName: string, extensions: AllowedExtension[]): void;
    removeAllowedExtensions(providerId: string, accountName: string): void;
}
