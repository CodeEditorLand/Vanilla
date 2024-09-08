import { Disposable } from "../../../base/common/lifecycle.js";
import { ILogService } from "../../log/common/log.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import type { ILocalExtension } from "../common/extensionManagement.js";
export declare class ExtensionsLifecycle extends Disposable {
    private userDataProfilesService;
    private readonly logService;
    private processesLimiter;
    constructor(userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    postUninstall(extension: ILocalExtension): Promise<void>;
    private parseScript;
    private runLifecycleHook;
    private start;
    private getExtensionStoragePath;
}
