import { Disposable } from "vs/base/common/lifecycle";
import { MainThreadAiRelatedInformationShape } from "vs/workbench/api/common/extHost.protocol";
import { RelatedInformationType } from "vs/workbench/api/common/extHostTypes";
import { IAiRelatedInformationService, RelatedInformationResult } from "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadAiRelatedInformation extends Disposable implements MainThreadAiRelatedInformationShape {
    private readonly _aiRelatedInformationService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(context: IExtHostContext, _aiRelatedInformationService: IAiRelatedInformationService);
    $getAiRelatedInformation(query: string, types: RelatedInformationType[]): Promise<RelatedInformationResult[]>;
    $registerAiRelatedInformationProvider(handle: number, type: RelatedInformationType): void;
    $unregisterAiRelatedInformationProvider(handle: number): void;
}
