import { CancellationToken } from "vs/base/common/cancellation";
import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import "vs/css!./actionWidget";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare const acceptSelectedActionCommand = "acceptSelectedCodeAction";
export declare const previewSelectedActionCommand = "previewSelectedCodeAction";
export interface IActionListDelegate<T> {
    onHide(didCancel?: boolean): void;
    onSelect(action: T, preview?: boolean): void;
    onHover?(action: T, cancellationToken: CancellationToken): Promise<{
        canPreview: boolean;
    } | void>;
    onFocus?(action: T | undefined): void;
}
export interface IActionListItem<T> {
    readonly item?: T;
    readonly kind: ActionListItemKind;
    readonly group?: {
        kind?: any;
        icon?: ThemeIcon;
        title: string;
    };
    readonly disabled?: boolean;
    readonly label?: string;
    readonly keybinding?: ResolvedKeybinding;
    canPreview?: boolean | undefined;
}
export declare const enum ActionListItemKind {
    Action = "action",
    Header = "header"
}
export declare class ActionList<T> extends Disposable {
    private readonly _delegate;
    private readonly _contextViewService;
    private readonly _keybindingService;
    readonly domNode: HTMLElement;
    private readonly _list;
    private readonly _actionLineHeight;
    private readonly _headerLineHeight;
    private readonly _allMenuItems;
    private readonly cts;
    constructor(user: string, preview: boolean, items: readonly IActionListItem<T>[], _delegate: IActionListDelegate<T>, _contextViewService: IContextViewService, _keybindingService: IKeybindingService);
    private focusCondition;
    hide(didCancel?: boolean): void;
    layout(minWidth: number): number;
    focusPrevious(): void;
    focusNext(): void;
    acceptSelected(preview?: boolean): void;
    private onListSelection;
    private onFocus;
    private onListHover;
    private onListClick;
}
