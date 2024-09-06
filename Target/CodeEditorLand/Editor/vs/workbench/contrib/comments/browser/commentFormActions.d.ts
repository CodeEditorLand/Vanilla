import { IAction } from "vs/base/common/actions";
import { IDisposable } from "vs/base/common/lifecycle";
import { IMenu } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class CommentFormActions implements IDisposable {
    private readonly keybindingService;
    private readonly contextKeyService;
    private container;
    private actionHandler;
    private readonly maxActions?;
    private _buttonElements;
    private readonly _toDispose;
    private _actions;
    constructor(keybindingService: IKeybindingService, contextKeyService: IContextKeyService, container: HTMLElement, actionHandler: (action: IAction) => void, maxActions?: number | undefined);
    setActions(menu: IMenu, hasOnlySecondaryActions?: boolean): void;
    triggerDefaultAction(): void;
    dispose(): void;
}
