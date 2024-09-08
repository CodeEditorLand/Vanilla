import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IAiRelatedInformationService, type IAiRelatedInformationProvider, type RelatedInformationResult, type RelatedInformationType } from "./aiRelatedInformation.js";
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
