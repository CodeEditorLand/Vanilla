import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { INotification, INotificationHandle, INotificationService, INotificationSource, INotificationSourceFilter, IPromptChoice, IPromptOptions, IStatusMessageOptions, NotificationsFilter, Severity } from '../../common/notification.js';
export declare class TestNotificationService implements INotificationService {
    readonly onDidAddNotification: Event<INotification>;
    readonly onDidRemoveNotification: Event<INotification>;
    readonly onDidChangeFilter: Event<void>;
    readonly _serviceBrand: undefined;
    private static readonly NO_OP;
    info(message: string): INotificationHandle;
    warn(message: string): INotificationHandle;
    error(error: string | Error): INotificationHandle;
    notify(notification: INotification): INotificationHandle;
    prompt(severity: Severity, message: string, choices: IPromptChoice[], options?: IPromptOptions): INotificationHandle;
    status(message: string | Error, options?: IStatusMessageOptions): IDisposable;
    setFilter(): void;
    getFilter(source?: INotificationSource | undefined): NotificationsFilter;
    getFilters(): INotificationSourceFilter[];
    removeFilter(sourceId: string): void;
}
