import { Action } from "vs/base/common/actions";
import { IFileService } from "vs/platform/files/common/files";
import { INativeHostService } from "vs/platform/native/common/native";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
export declare class OpenLogsFolderAction extends Action {
    private readonly environmentService;
    private readonly nativeHostService;
    static readonly ID = "workbench.action.openLogsFolder";
    static readonly TITLE: any;
    constructor(id: string, label: string, environmentService: INativeWorkbenchEnvironmentService, nativeHostService: INativeHostService);
    run(): Promise<void>;
}
export declare class OpenExtensionLogsFolderAction extends Action {
    private readonly environmentSerice;
    private readonly fileService;
    private readonly nativeHostService;
    static readonly ID = "workbench.action.openExtensionLogsFolder";
    static readonly TITLE: any;
    constructor(id: string, label: string, environmentSerice: INativeWorkbenchEnvironmentService, fileService: IFileService, nativeHostService: INativeHostService);
    run(): Promise<void>;
}
