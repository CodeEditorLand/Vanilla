import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { IAiRelatedInformationProvider, IAiRelatedInformationService, RelatedInformationResult, RelatedInformationType } from "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation";
export declare class AiRelatedInformationService implements IAiRelatedInformationService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    static readonly DEFAULT_TIMEOUT: number;
    private readonly _providers;
    constructor(logService: ILogService);
    isEnabled(): boolean;
    registerAiRelatedInformationProvider(type: RelatedInformationType, provider: IAiRelatedInformationProvider): IDisposable;
    getRelatedInformation(query: string, types: RelatedInformationType[], token: CancellationToken): Promise<RelatedInformationResult[]>;
}
