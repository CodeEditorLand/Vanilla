import { Action } from "vs/base/common/actions";
import { IFileService } from "vs/platform/files/common/files";
import { ILoggerService } from "vs/platform/log/common/log";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IDefaultLogLevelsService } from "vs/workbench/contrib/logs/common/defaultLogLevels";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IOutputChannelDescriptor, IOutputService } from "vs/workbench/services/output/common/output";
export declare class SetLogLevelAction extends Action {
    private readonly quickInputService;
    private readonly loggerService;
    private readonly outputService;
    private readonly defaultLogLevelsService;
    static readonly ID = "workbench.action.setLogLevel";
    static readonly TITLE: any;
    constructor(id: string, label: string, quickInputService: IQuickInputService, loggerService: ILoggerService, outputService: IOutputService, defaultLogLevelsService: IDefaultLogLevelsService);
    run(): Promise<void>;
    private selectLogLevelOrChannel;
    static isLevelSettable(channel: IOutputChannelDescriptor): boolean;
    private setLogLevelForChannel;
    private getLogLevelEntries;
    private getLabel;
    private getDescription;
}
export declare class OpenWindowSessionLogFileAction extends Action {
    private readonly environmentService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly editorService;
    static readonly ID = "workbench.action.openSessionLogFile";
    static readonly TITLE: any;
    constructor(id: string, label: string, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, quickInputService: IQuickInputService, editorService: IEditorService);
    run(): Promise<void>;
    private getSessions;
    private getLogFiles;
}
