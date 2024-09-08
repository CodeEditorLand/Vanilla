import type { IAction, IActionRunner } from "../common/actions.js";
import type { ResolvedKeybinding } from "../common/keybindings.js";
import type { OmitOptional } from "../common/types.js";
import type { StandardMouseEvent } from "./mouseEvent.js";
import type { IActionViewItemOptions } from "./ui/actionbar/actionViewItems.js";
import type { IActionViewItem } from "./ui/actionbar/actionbar.js";
import type { AnchorAlignment, AnchorAxisAlignment, IAnchor } from "./ui/contextview/contextview.js";
export interface IContextMenuEvent {
    readonly shiftKey?: boolean;
    readonly ctrlKey?: boolean;
    readonly altKey?: boolean;
    readonly metaKey?: boolean;
}
/**
 * A specific context menu location to position the menu at.
 * Uses some TypeScript type tricks to prevent allowing to
 * pass in a `MouseEvent` and force people to use `StandardMouseEvent`.
 */
type ContextMenuLocation = OmitOptional<IAnchor> & {
    getModifierState?: never;
};
export interface IContextMenuDelegate {
    /**
     * The anchor where to position the context view.
     * Use a `HTMLElement` to position the view at the element,
     * a `StandardMouseEvent` to position it at the mouse position
     * or an `ContextMenuLocation` to position it at a specific location.
     */
    getAnchor(): HTMLElement | StandardMouseEvent | ContextMenuLocation;
    getActions(): readonly IAction[];
    getCheckedActionsRepresentation?(action: IAction): "radio" | "checkbox";
    getActionViewItem?(action: IAction, options: IActionViewItemOptions): IActionViewItem | undefined;
    getActionsContext?(event?: IContextMenuEvent): unknown;
    getKeyBinding?(action: IAction): ResolvedKeybinding | undefined;
    getMenuClassName?(): string;
    onHide?(didCancel: boolean): void;
    actionRunner?: IActionRunner;
    skipTelemetry?: boolean;
    autoSelectFirstItem?: boolean;
    anchorAlignment?: AnchorAlignment;
    anchorAxisAlignment?: AnchorAxisAlignment;
    domForShadowRoot?: HTMLElement;
}
export interface IContextMenuProvider {
    showContextMenu(delegate: IContextMenuDelegate): void;
}
export {};