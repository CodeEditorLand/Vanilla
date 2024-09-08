import "./media/notificationsList.css";
import type { IListOptions } from "../../../../base/browser/ui/list/listWidget.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { INotificationViewItem } from "../../../common/notifications.js";
export interface INotificationsListOptions extends IListOptions<INotificationViewItem> {
    readonly widgetAriaLabel?: string;
}
export declare class NotificationsList extends Disposable {
    private readonly container;
    private readonly options;
    private readonly instantiationService;
    private readonly contextMenuService;
    private listContainer;
    private list;
    private listDelegate;
    private viewModel;
    private isVisible;
    constructor(container: HTMLElement, options: INotificationsListOptions, instantiationService: IInstantiationService, contextMenuService: IContextMenuService);
    show(): void;
    private createNotificationsList;
    updateNotificationsList(start: number, deleteCount: number, items?: INotificationViewItem[]): void;
    updateNotificationHeight(item: INotificationViewItem): void;
    hide(): void;
    focusFirst(): void;
    hasFocus(): boolean;
    layout(width: number, maxHeight?: number): void;
    dispose(): void;
}
