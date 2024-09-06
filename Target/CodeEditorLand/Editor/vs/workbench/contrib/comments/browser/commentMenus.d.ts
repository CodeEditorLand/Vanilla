import { IDisposable } from "vs/base/common/lifecycle";
import { Comment } from "vs/editor/common/languages";
import { IMenu, IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
export declare class CommentMenus implements IDisposable {
    private readonly menuService;
    constructor(menuService: IMenuService);
    getCommentThreadTitleActions(contextKeyService: IContextKeyService): IMenu;
    getCommentThreadActions(contextKeyService: IContextKeyService): IMenu;
    getCommentEditorActions(contextKeyService: IContextKeyService): IMenu;
    getCommentThreadAdditionalActions(contextKeyService: IContextKeyService): IMenu;
    getCommentTitleActions(comment: Comment, contextKeyService: IContextKeyService): IMenu;
    getCommentActions(comment: Comment, contextKeyService: IContextKeyService): IMenu;
    getCommentThreadTitleContextActions(contextKeyService: IContextKeyService): IMenu;
    private getMenu;
    dispose(): void;
}
