import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IWorkspacesService } from "../../../../platform/workspaces/common/workspaces.js";
export declare class NativeWorkspacesService implements IWorkspacesService {
    readonly _serviceBrand: undefined;
    constructor(mainProcessService: IMainProcessService, nativeHostService: INativeHostService);
}
