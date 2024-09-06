import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
export declare class SaveParticipant {
    private readonly workingCopyFileService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, workingCopyFileService: IWorkingCopyFileService);
    dispose(): void;
}
