import type { IAction } from "../../../../base/common/actions.js";
import { type IDisposable } from "../../../../base/common/lifecycle.js";
import type { IMenu } from "../../../../platform/actions/common/actions.js";
import type { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import type { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
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
