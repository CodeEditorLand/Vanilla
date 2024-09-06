import { Disposable } from "vs/base/common/lifecycle";
import { IRange } from "vs/editor/common/core/range";
import * as languages from "vs/editor/common/languages";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { CommentMenus } from "vs/workbench/contrib/comments/browser/commentMenus";
import { ICellRange } from "vs/workbench/contrib/notebook/common/notebookRange";
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
