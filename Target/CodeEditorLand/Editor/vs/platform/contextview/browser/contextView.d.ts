import { IContextMenuDelegate } from "vs/base/browser/contextmenu";
import { StandardMouseEvent } from "vs/base/browser/mouseEvent";
import { AnchorAlignment, AnchorAxisAlignment, IAnchor, IContextViewProvider } from "vs/base/browser/ui/contextview/contextview";
import { IAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { IMenuActionOptions, MenuId } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
export declare const IContextViewService: any;
export interface IContextViewService extends IContextViewProvider {
    readonly _serviceBrand: undefined;
    showContextView(delegate: IContextViewDelegate, container?: HTMLElement, shadowRoot?: boolean): IOpenContextView;
    hideContextView(data?: any): void;
    getContextViewElement(): HTMLElement;
    layout(): void;
    anchorAlignment?: AnchorAlignment;
}
export interface IContextViewDelegate {
    canRelayout?: boolean;
    /**
     * The anchor where to position the context view.
     * Use a `HTMLElement` to position the view at the element,
     * a `StandardMouseEvent` to position it at the mouse position
     * or an `IAnchor` to position it at a specific location.
     */
    getAnchor(): HTMLElement | StandardMouseEvent | IAnchor;
    render(container: HTMLElement): IDisposable;
    onDOMEvent?(e: any, activeElement: HTMLElement): void;
    onHide?(data?: any): void;
    focus?(): void;
    anchorAlignment?: AnchorAlignment;
    anchorAxisAlignment?: AnchorAxisAlignment;
    layer?: number;
}
export interface IOpenContextView {
    close: () => void;
}
export declare const IContextMenuService: any;
export interface IContextMenuService {
    readonly _serviceBrand: undefined;
    readonly onDidShowContextMenu: Event<void>;
    readonly onDidHideContextMenu: Event<void>;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
export type IContextMenuMenuDelegate = {
    /**
     * The MenuId that should be used to populate the context menu.
     */
    menuId?: MenuId;
    /**
     * Optional options how menu actions are invoked
     */
    menuActionOptions?: IMenuActionOptions;
    /**
     * Optional context key service which drives the given menu
     */
    contextKeyService?: IContextKeyService;
    /**
     * Optional getter for extra actions. They will be prepended to the menu actions.
     */
    getActions?(): IAction[];
} & Omit<IContextMenuDelegate, "getActions">;