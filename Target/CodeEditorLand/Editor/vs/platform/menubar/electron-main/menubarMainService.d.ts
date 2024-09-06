import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { ILogService } from "vs/platform/log/common/log";
import { ICommonMenubarService, IMenubarData } from "vs/platform/menubar/common/menubar";
export declare const IMenubarMainService: any;
export interface IMenubarMainService extends ICommonMenubarService {
    readonly _serviceBrand: undefined;
}
export declare class MenubarMainService extends Disposable implements IMenubarMainService {
    private readonly instantiationService;
    private readonly lifecycleMainService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly menubar;
    constructor(instantiationService: IInstantiationService, lifecycleMainService: ILifecycleMainService, logService: ILogService);
    private installMenuBarAfterWindowOpen;
    updateMenubar(windowId: number, menus: IMenubarData): Promise<void>;
}
