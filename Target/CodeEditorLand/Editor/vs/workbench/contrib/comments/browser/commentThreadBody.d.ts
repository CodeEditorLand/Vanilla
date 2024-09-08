import * as dom from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { type IMarkdownRendererOptions } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import type { IRange } from "../../../../editor/common/core/range.js";
import * as languages from "../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import type { ICellRange } from "../../notebook/common/notebookRange.js";
import type { ICommentThreadWidget } from "../common/commentThreadWidget.js";
import { CommentNode } from "./commentNode.js";
import { ICommentService } from "./commentService.js";
import type { LayoutableEditor } from "./simpleCommentEditor.js";
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
    onDidResize: import("../../../../base/common/event.js").Event<dom.Dimension>;
    private _commentDisposable;
    private _markdownRenderer;
    get length(): number;
    get activeComment(): CommentNode<T> | undefined;
    constructor(_parentEditor: LayoutableEditor, owner: string, parentResourceUri: URI, container: HTMLElement, _options: IMarkdownRendererOptions, _commentThread: languages.CommentThread<T>, _pendingEdits: {
        [key: number]: string;
    } | undefined, _scopedInstatiationService: IInstantiationService, _parentCommentThreadWidget: ICommentThreadWidget, commentService: ICommentService, openerService: IOpenerService, languageService: ILanguageService);
    focus(): void;
    ensureFocusIntoNewEditingComment(): void;
    display(): Promise<void>;
    private _refresh;
    getDimensions(): dom.Dimension;
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
