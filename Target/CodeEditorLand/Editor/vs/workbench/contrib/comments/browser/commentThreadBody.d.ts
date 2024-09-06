import * as dom from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IMarkdownRendererOptions } from "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer";
import { IRange } from "vs/editor/common/core/range";
import * as languages from "vs/editor/common/languages";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ICommentService } from "vs/workbench/contrib/comments/browser/commentService";
import { LayoutableEditor } from "vs/workbench/contrib/comments/browser/simpleCommentEditor";
import { ICommentThreadWidget } from "vs/workbench/contrib/comments/common/commentThreadWidget";
import { ICellRange } from "vs/workbench/contrib/notebook/common/notebookRange";
export declare class CommentThreadBody<T extends IRange | ICellRange = IRange> extends Disposable {
    private readonly _parentEditor;
    readonly owner: string;
    readonly parentResourceUri: URI;
    readonly container: HTMLElement;
    private _options;
    private _commentThread;
    private _pendingEdits;
    private _scopedInstatiationService;
    private _parentCommentThreadWidget;
    private commentService;
    private openerService;
    private languageService;
    private _commentsElement;
    private _commentElements;
    private _resizeObserver;
    private _focusedComment;
    private _onDidResize;
    onDidResize: any;
    private _commentDisposable;
    private _markdownRenderer;
    get length(): any;
    get activeComment(): any;
    constructor(_parentEditor: LayoutableEditor, owner: string, parentResourceUri: URI, container: HTMLElement, _options: IMarkdownRendererOptions, _commentThread: languages.CommentThread<T>, _pendingEdits: {
        [key: number]: string;
    } | undefined, _scopedInstatiationService: IInstantiationService, _parentCommentThreadWidget: ICommentThreadWidget, commentService: ICommentService, openerService: IOpenerService, languageService: ILanguageService);
    focus(): void;
    ensureFocusIntoNewEditingComment(): void;
    display(): Promise<void>;
    private _refresh;
    getDimensions(): any;
    layout(widthInPixel?: number): void;
    getPendingEdits(): {
        [key: number]: string;
    };
    getCommentCoords(commentUniqueId: number): {
        thread: dom.IDomNodePagePosition;
        comment: dom.IDomNodePagePosition;
    } | undefined;
    updateCommentThread(commentThread: languages.CommentThread<T>, preserveFocus: boolean): Promise<void>;
    private _updateAriaLabel;
    private _setFocusedComment;
    private createNewCommentNode;
    dispose(): void;
}
