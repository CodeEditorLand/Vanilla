import * as dom from "vs/base/browser/dom";
import { Event } from "vs/base/common/event";
import { ICodeEditor, IEditorMouseEvent } from "vs/editor/browser/editorBrowser";
import { IPosition } from "vs/editor/common/core/position";
import { IRange } from "vs/editor/common/core/range";
import * as languages from "vs/editor/common/languages";
import { ZoneWidget } from "vs/editor/contrib/zoneWidget/browser/zoneWidget";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ICommentService } from "vs/workbench/contrib/comments/browser/commentService";
import { ICommentThreadWidget } from "vs/workbench/contrib/comments/common/commentThreadWidget";
export declare enum CommentWidgetFocus {
    None = 0,
    Widget = 1,
    Editor = 2
}
export declare function parseMouseDownInfoFromEvent(e: IEditorMouseEvent): {
    lineNumber: any;
} | null;
export declare function isMouseUpEventDragFromMouseDown(mouseDownInfo: {
    lineNumber: number;
} | null, e: IEditorMouseEvent): number | null;
export declare function isMouseUpEventMatchMouseDown(mouseDownInfo: {
    lineNumber: number;
} | null, e: IEditorMouseEvent): number | null;
export declare class ReviewZoneWidget extends ZoneWidget implements ICommentThreadWidget {
    private _uniqueOwner;
    private _commentThread;
    private _pendingComment;
    private _pendingEdits;
    private themeService;
    private commentService;
    private readonly configurationService;
    private _commentThreadWidget;
    private readonly _onDidClose;
    private readonly _onDidCreateThread;
    private _isExpanded?;
    private _initialCollapsibleState?;
    private _commentGlyph?;
    private readonly _globalToDispose;
    private _commentThreadDisposables;
    private _contextKeyService;
    private _scopedInstantiationService;
    get uniqueOwner(): string;
    get commentThread(): languages.CommentThread;
    get expanded(): boolean | undefined;
    private _commentOptions;
    constructor(editor: ICodeEditor, _uniqueOwner: string, _commentThread: languages.CommentThread, _pendingComment: string | undefined, _pendingEdits: {
        [key: number]: string;
    } | undefined, instantiationService: IInstantiationService, themeService: IThemeService, commentService: ICommentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService);
    get onDidClose(): Event<ReviewZoneWidget | undefined>;
    get onDidCreateThread(): Event<ReviewZoneWidget>;
    getPosition(): IPosition | undefined;
    protected revealRange(): void;
    reveal(commentUniqueId?: number, focus?: CommentWidgetFocus): void;
    private _expandAndShowZoneWidget;
    private _setFocus;
    private _goToComment;
    private _goToThread;
    makeVisible(commentUniqueId?: number, focus?: CommentWidgetFocus): void;
    getPendingComments(): {
        newComment: string | undefined;
        edits: {
            [key: number]: string;
        };
    };
    setPendingComment(comment: string): void;
    protected _fillContainer(container: HTMLElement): void;
    private arrowPosition;
    private deleteCommentThread;
    collapse(): void;
    expand(setActive?: boolean): void;
    getGlyphPosition(): number;
    update(commentThread: languages.CommentThread<IRange>): Promise<void>;
    protected _onWidth(widthInPixel: number): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    display(range: IRange | undefined, shouldReveal: boolean): Promise<void>;
    private bindCommentThreadListeners;
    submitComment(): Promise<void>;
    _refresh(dimensions: dom.Dimension): void;
    private _applyTheme;
    show(rangeOrPos: IRange | IPosition | undefined, heightInLines: number): void;
    hide(): void;
    dispose(): void;
}
