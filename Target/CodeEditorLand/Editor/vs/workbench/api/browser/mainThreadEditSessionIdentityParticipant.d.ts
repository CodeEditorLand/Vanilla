import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IEditSessionIdentityService } from "vs/platform/workspace/common/editSessions";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class EditSessionIdentityCreateParticipant {
    private readonly _editSessionIdentityService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _editSessionIdentityService: IEditSessionIdentityService);
    dispose(): void;
}
