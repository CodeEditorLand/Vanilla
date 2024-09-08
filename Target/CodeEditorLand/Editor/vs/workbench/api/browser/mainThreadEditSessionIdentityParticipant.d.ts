import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { IEditSessionIdentityService } from "../../../platform/workspace/common/editSessions.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class EditSessionIdentityCreateParticipant {
    private readonly _editSessionIdentityService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _editSessionIdentityService: IEditSessionIdentityService);
    dispose(): void;
}
