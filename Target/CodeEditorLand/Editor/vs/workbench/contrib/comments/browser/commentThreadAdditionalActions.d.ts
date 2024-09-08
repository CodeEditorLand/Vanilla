import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IRange } from "../../../../editor/common/core/range.js";
import type * as languages from "../../../../editor/common/languages.js";
import type { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import type { ICellRange } from "../../notebook/common/notebookRange.js";
import type { CommentMenus } from "./commentMenus.js";
export declare class CommentThreadAdditionalActions<T extends IRange | ICellRange> extends Disposable {
    private _commentThread;
    private _contextKeyService;
    private _commentMenus;
    private _actionRunDelegate;
    private _keybindingService;
    private _container;
    private _buttonBar;
    private _commentFormActions;
    constructor(container: HTMLElement, _commentThread: languages.CommentThread<T>, _contextKeyService: IContextKeyService, _commentMenus: CommentMenus, _actionRunDelegate: (() => void) | null, _keybindingService: IKeybindingService);
    private _showMenu;
    private _hideMenu;
    private _enableDisableMenu;
    private _createAdditionalActions;
}
