import { IAnchor } from "vs/base/browser/ui/contextview/contextview";
import { IAction } from "vs/base/common/actions";
import "vs/css!./actionWidget";
import { IActionListDelegate, IActionListItem } from "vs/platform/actionWidget/browser/actionList";
export declare const IActionWidgetService: any;
export interface IActionWidgetService {
    readonly _serviceBrand: undefined;
    show<T>(user: string, supportsPreview: boolean, items: readonly IActionListItem<T>[], delegate: IActionListDelegate<T>, anchor: IAnchor, container: HTMLElement | undefined, actionBarActions?: readonly IAction[]): void;
    hide(didCancel?: boolean): void;
    readonly isVisible: boolean;
}
