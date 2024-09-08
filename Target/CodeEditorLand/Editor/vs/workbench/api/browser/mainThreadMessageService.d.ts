import type Severity from "../../../base/common/severity.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadMessageOptions, type MainThreadMessageServiceShape } from "../common/extHost.protocol.js";
export declare class MainThreadMessageService implements MainThreadMessageServiceShape {
    private readonly _notificationService;
    private readonly _commandService;
    private readonly _dialogService;
    private extensionsListener;
    constructor(extHostContext: IExtHostContext, _notificationService: INotificationService, _commandService: ICommandService, _dialogService: IDialogService, extensionService: IExtensionService);
    dispose(): void;
    $showMessage(severity: Severity, message: string, options: MainThreadMessageOptions, commands: {
        title: string;
        isCloseAffordance: boolean;
        handle: number;
    }[]): Promise<number | undefined>;
    private _showMessage;
    private _showModalMessage;
}
