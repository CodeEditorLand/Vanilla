import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
import { INativeHostService } from "vs/platform/native/common/native";
export declare class NativeHostService implements INativeHostService {
    readonly windowId: number;
    readonly _serviceBrand: undefined;
    constructor(windowId: number, mainProcessService: IMainProcessService);
}
