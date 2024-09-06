import { Disposable } from "vs/base/common/lifecycle";
import { IFileService } from "vs/platform/files/common/files";
import { INativeHostService } from "vs/platform/native/common/native";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class TerminalNativeContribution extends Disposable implements IWorkbenchContribution {
    private readonly _fileService;
    private readonly _terminalService;
    _serviceBrand: undefined;
    constructor(_fileService: IFileService, _terminalService: ITerminalService, remoteAgentService: IRemoteAgentService, nativeHostService: INativeHostService);
    private _onOsResume;
    private _onOpenFileRequest;
    private _whenFileDeleted;
}
