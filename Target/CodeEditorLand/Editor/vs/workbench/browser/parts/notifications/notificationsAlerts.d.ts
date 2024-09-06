import { Disposable } from "vs/base/common/lifecycle";
import { INotificationsModel } from "vs/workbench/common/notifications";
export declare class NotificationsAlerts extends Disposable {
    private readonly model;
    constructor(model: INotificationsModel);
    private registerListeners;
    private onDidChangeNotification;
    private triggerAriaAlert;
    private doTriggerAriaAlert;
}
