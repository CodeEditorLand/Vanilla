import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { Toggle } from "vs/base/browser/ui/toggle/toggle";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import type { IHoverService } from "vs/platform/hover/browser/hover";
import { ITreeItem } from "vs/workbench/common/views";
export declare class CheckboxStateHandler extends Disposable {
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<ITreeItem[]>;
    setCheckboxState(node: ITreeItem): void;
}
export declare class TreeItemCheckbox extends Disposable {
    private checkboxStateHandler;
    private readonly hoverDelegate;
    private readonly hoverService;
    toggle: Toggle | undefined;
    private checkboxContainer;
    isDisposed: boolean;
    private hover;
    static readonly checkboxClass = "custom-view-tree-node-item-checkbox";
    private readonly _onDidChangeState;
    readonly onDidChangeState: Event<boolean>;
    constructor(container: HTMLElement, checkboxStateHandler: CheckboxStateHandler, hoverDelegate: IHoverDelegate, hoverService: IHoverService);
    render(node: ITreeItem): void;
    private createCheckbox;
    private registerListener;
    private setHover;
    private setCheckbox;
    private checkboxHoverContent;
    private setAccessibilityInformation;
    private removeCheckbox;
}
