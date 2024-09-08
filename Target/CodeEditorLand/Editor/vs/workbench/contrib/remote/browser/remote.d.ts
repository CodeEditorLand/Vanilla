import "./media/remoteViewlet.css";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { ITimerService } from "../../../services/timer/browser/timerService.js";
export declare class RemoteMarkers implements IWorkbenchContribution {
    constructor(remoteAgentService: IRemoteAgentService, timerService: ITimerService);
}
export declare class RemoteAgentConnectionStatusListener extends Disposable implements IWorkbenchContribution {
    private _reloadWindowShown;
    constructor(remoteAgentService: IRemoteAgentService, progressService: IProgressService, dialogService: IDialogService, commandService: ICommandService, quickInputService: IQuickInputService, logService: ILogService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService);
}
