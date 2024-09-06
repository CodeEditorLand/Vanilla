import "vs/css!./media/editorHoverWrapper";
import { IHoverAction } from "vs/base/browser/ui/hover/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
/**
 * This borrows some of HoverWidget so that a chat editor hover can be rendered in the same way as a workbench hover.
 * Maybe it can be reusable in a generic way.
 */
export declare class ChatEditorHoverWrapper {
    private readonly keybindingService;
    readonly domNode: HTMLElement;
    constructor(hoverContentElement: HTMLElement, actions: IHoverAction[] | undefined, keybindingService: IKeybindingService);
}
