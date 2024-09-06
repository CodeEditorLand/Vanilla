import Severity from "vs/base/common/severity";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadMessageOptions, MainThreadMessageServiceShape } from "../common/extHost.protocol";
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
