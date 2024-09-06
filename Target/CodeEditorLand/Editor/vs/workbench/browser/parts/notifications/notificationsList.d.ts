import "vs/css!./media/notificationsList";
import { IListOptions } from "vs/base/browser/ui/list/listWidget";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationViewItem } from "vs/workbench/common/notifications";
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
