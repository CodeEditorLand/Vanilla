import { HoverAction } from "vs/base/browser/ui/hover/hoverWidget";
import { Disposable } from "vs/base/common/lifecycle";
import { IEditorHoverAction, IEditorHoverStatusBar } from "vs/editor/contrib/hover/browser/hoverTypes";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class EditorHoverStatusBar extends Disposable implements IEditorHoverStatusBar {
    private readonly _keybindingService;
    readonly hoverElement: HTMLElement;
    readonly actions: HoverAction[];
    private readonly actionsElement;
    private _hasContent;
    get hasContent(): boolean;
    constructor(_keybindingService: IKeybindingService);
    addAction(actionOptions: {
        label: string;
        iconClass?: string;
        run: (target: HTMLElement) => void;
        commandId: string;
    }): IEditorHoverAction;
    append(element: HTMLElement): HTMLElement;
}
