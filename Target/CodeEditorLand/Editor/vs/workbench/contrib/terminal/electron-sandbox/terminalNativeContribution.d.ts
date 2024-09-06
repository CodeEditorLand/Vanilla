import { Disposable } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { ITerminalService } from "../browser/terminal.js";
export declare class TerminalNativeContribution extends Disposable implements IWorkbenchContribution {
    private readonly _fileService;
    private readonly _terminalService;
    _serviceBrand: undefined;
    constructor(_fileService: IFileService, _terminalService: ITerminalService, remoteAgentService: IRemoteAgentService, nativeHostService: INativeHostService);
    private _onOsResume;
    private _onOpenFileRequest;
    private _whenFileDeleted;
}
