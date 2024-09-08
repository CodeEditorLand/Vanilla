import "./media/review.css";
import * as dom from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { IMarkdownRendererOptions } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import type { FontInfo } from "../../../../editor/common/config/fontInfo.js";
import { type IRange } from "../../../../editor/common/core/range.js";
import * as languages from "../../../../editor/common/languages.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import type { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import type { IColorTheme } from "../../../../platform/theme/common/themeService.js";
import type { ICellRange } from "../../notebook/common/notebookRange.js";
import type { ICommentThreadWidget } from "../common/commentThreadWidget.js";
import { ICommentService } from "./commentService.js";
import type { LayoutableEditor } from "./simpleCommentEditor.js";
export declare const COMMENTEDITOR_DECORATION_KEY = "commenteditordecoration";
export declare class CommentThreadWidget<T extends IRange | ICellRange = IRange> extends Disposable implements ICommentThreadWidget {
    readonly container: HTMLElement;
    readonly _parentEditor: LayoutableEditor;
    private _owner;
    private _parentResourceUri;
    private _contextKeyService;
    private _scopedInstantiationService;
    private _commentThread;
    private _pendingComment;
    private _pendingEdits;
    private _markdownOptions;
    private _commentOptions;
    private _containerDelegate;
    private commentService;
    private configurationService;
    private _keybindingService;
    private _header;
    private _body;
    private _commentReply?;
    private _additionalActions?;
    private _commentMenus;
    private _commentThreadDisposables;
    private _threadIsEmpty;
    private _styleElement;
    private _commentThreadContextValue;
    private _focusedContextKey;
    private _onDidResize;
    onDidResize: import("../../../../base/common/event.js").Event<dom.Dimension>;
    private _commentThreadState;
    get commentThread(): languages.CommentThread<T>;
    constructor(container: HTMLElement, _parentEditor: LayoutableEditor, _owner: string, _parentResourceUri: URI, _contextKeyService: IContextKeyService, _scopedInstantiationService: IInstantiationService, _commentThread: languages.CommentThread<T>, _pendingComment: string | undefined, _pendingEdits: {
        [key: number]: string;
    } | undefined, _markdownOptions: IMarkdownRendererOptions, _commentOptions: languages.CommentOptions | undefined, _containerDelegate: {
        actionRunner: (() => void) | null;
        collapse: () => void;
    }, commentService: ICommentService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, _keybindingService: IKeybindingService);
    private _setAriaLabel;
    private updateCurrentThread;
    private currentThreadListeners;
    updateCommentThread(commentThread: languages.CommentThread<T>): Promise<void>;
    display(lineHeight: number, focus: boolean): Promise<void>;
    private _refresh;
    dispose(): void;
    private _bindCommentThreadListeners;
    private _createCommentForm;
    private _createAdditionalActions;
    getCommentCoords(commentUniqueId: number): {
        thread: dom.IDomNodePagePosition;
        comment: dom.IDomNodePagePosition;
    } | undefined;
    getPendingEdits(): {
        [key: number]: string;
    };
    getPendingComment(): string | undefined;
    setPendingComment(comment: string): void;
    getDimensions(): dom.Dimension;
    layout(widthInPixel?: number): void;
    ensureFocusIntoNewEditingComment(): void;
    focusCommentEditor(): void;
    focus(): void;
    submitComment(): Promise<void>;
    collapse(): void;
    applyTheme(theme: IColorTheme, fontInfo: FontInfo): void;
}