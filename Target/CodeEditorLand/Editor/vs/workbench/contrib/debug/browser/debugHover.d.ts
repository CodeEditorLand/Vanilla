import { IMouseEvent } from "vs/base/browser/mouseEvent";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IDimension } from "vs/editor/common/core/dimension";
import { Position } from "vs/editor/common/core/position";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IDebugService, IExpression, IStackFrame } from "vs/workbench/contrib/debug/common/debug";
export declare const enum ShowDebugHoverResult {
    NOT_CHANGED = 0,
    NOT_AVAILABLE = 1,
    CANCELLED = 2
}
export declare function findExpressionInStackFrame(stackFrame: IStackFrame, namesToFind: string[]): Promise<IExpression | undefined>;
export declare class DebugHoverWidget implements IContentWidget {
    private editor;
    private readonly debugService;
    private readonly instantiationService;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly contextMenuService;
    private readonly hoverService;
    static readonly ID = "debug.hoverWidget";
    readonly allowEditorOverflow = true;
    private _isVisible?;
    private safeTriangle?;
    private showCancellationSource?;
    private domNode;
    private tree;
    private showAtPosition;
    private positionPreference;
    private readonly highlightDecorations;
    private complexValueContainer;
    private complexValueTitle;
    private valueContainer;
    private treeContainer;
    private toDispose;
    private scrollbar;
    private debugHoverComputer;
    private expressionToRender;
    private isUpdatingTree;
    get isShowingComplexValue(): boolean;
    constructor(editor: ICodeEditor, debugService: IDebugService, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, hoverService: IHoverService);
    private create;
    private onContextMenu;
    private registerListeners;
    isHovered(): boolean;
    isVisible(): boolean;
    willBeVisible(): boolean;
    getId(): string;
    getDomNode(): HTMLElement;
    /**
     * Gets whether the given coordinates are in the safe triangle formed from
     * the position at which the hover was initiated.
     */
    isInSafeTriangle(x: number, y: number): boolean | undefined;
    showAt(position: Position, focus: boolean, mouseEvent?: IMouseEvent): Promise<void | ShowDebugHoverResult>;
    private static readonly _HOVER_HIGHLIGHT_DECORATION_OPTIONS;
    private doShow;
    private layoutTreeAndContainer;
    private layoutTree;
    beforeRender(): IDimension | null;
    afterRender(positionPreference: ContentWidgetPositionPreference | null): void;
    hide(): void;
    getPosition(): IContentWidgetPosition | null;
    dispose(): void;
}
