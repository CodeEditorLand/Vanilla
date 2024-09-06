import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
export declare const ITrustedDomainService: any;
export interface ITrustedDomainService {
    _serviceBrand: undefined;
    isValid(resource: URI): boolean;
}
export declare class TrustedDomainService extends Disposable implements ITrustedDomainService {
    private readonly _instantiationService;
    private readonly _storageService;
    _serviceBrand: undefined;
    private _staticTrustedDomainsResult;
    constructor(_instantiationService: IInstantiationService, _storageService: IStorageService);
    isValid(resource: URI): boolean;
}
/**
 * Check whether a domain like https://www.microsoft.com matches
 * the list of trusted domains.
 *
 * - Schemes must match
 * - There's no subdomain matching. For example https://microsoft.com doesn't match https://www.microsoft.com
 * - Star matches all subdomains. For example https://*.microsoft.com matches https://www.microsoft.com and https://foo.bar.microsoft.com
 */
export declare function isURLDomainTrusted(url: URI, trustedDomains: string[]): boolean;
