import { URI } from '../../../../../base/common/uri.js';
import { ITrustedDomainService } from '../../browser/trustedDomainService.js';
export declare class MockTrustedDomainService implements ITrustedDomainService {
    private readonly _trustedDomains;
    _serviceBrand: undefined;
    constructor(_trustedDomains?: string[]);
    isValid(resource: URI): boolean;
}
