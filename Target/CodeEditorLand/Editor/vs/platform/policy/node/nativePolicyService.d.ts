import { IStringDictionary } from "vs/base/common/collections";
import { ILogService } from "vs/platform/log/common/log";
import { AbstractPolicyService, IPolicyService, PolicyDefinition } from "vs/platform/policy/common/policy";
export declare class NativePolicyService extends AbstractPolicyService implements IPolicyService {
    private readonly logService;
    private readonly productName;
    private throttler;
    private readonly watcher;
    constructor(logService: ILogService, productName: string);
    protected _updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void>;
    private _onDidPolicyChange;
}
