import { Disposable } from "../../../base/common/lifecycle.js";
import { IAiRelatedInformationService, type RelatedInformationResult } from "../../services/aiRelatedInformation/common/aiRelatedInformation.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadAiRelatedInformationShape } from "../common/extHost.protocol.js";
import type { RelatedInformationType } from "../common/extHostTypes.js";
export declare class MainThreadAiRelatedInformation extends Disposable implements MainThreadAiRelatedInformationShape {
    private readonly _aiRelatedInformationService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(context: IExtHostContext, _aiRelatedInformationService: IAiRelatedInformationService);
    $getAiRelatedInformation(query: string, types: RelatedInformationType[]): Promise<RelatedInformationResult[]>;
    $registerAiRelatedInformationProvider(handle: number, type: RelatedInformationType): void;
    $unregisterAiRelatedInformationProvider(handle: number): void;
}
