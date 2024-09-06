import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
import { INativeHostService } from "vs/platform/native/common/native";
import { IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
export declare class NativeWorkspacesService implements IWorkspacesService {
    readonly _serviceBrand: undefined;
    constructor(mainProcessService: IMainProcessService, nativeHostService: INativeHostService);
}
