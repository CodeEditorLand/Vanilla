import { IStorageService } from '../../../../platform/storage/common/storage.js';
export interface IAccountUsage {
    extensionId: string;
    extensionName: string;
    lastUsed: number;
}
export declare const IAuthenticationUsageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationUsageService>;
export interface IAuthenticationUsageService {
    readonly _serviceBrand: undefined;
    readAccountUsages(providerId: string, accountName: string): IAccountUsage[];
    removeAccountUsage(providerId: string, accountName: string): void;
    addAccountUsage(providerId: string, accountName: string, extensionId: string, extensionName: string): void;
}
export declare class AuthenticationUsageService implements IAuthenticationUsageService {
    private readonly _storageService;
    _serviceBrand: undefined;
    constructor(_storageService: IStorageService);
    readAccountUsages(providerId: string, accountName: string): IAccountUsage[];
    removeAccountUsage(providerId: string, accountName: string): void;
    addAccountUsage(providerId: string, accountName: string, extensionId: string, extensionName: string): void;
}
