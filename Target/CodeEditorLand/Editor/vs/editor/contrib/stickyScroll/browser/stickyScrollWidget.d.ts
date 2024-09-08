import { Disposable } from "../../../../base/common/lifecycle.js";
import "./stickyScroll.css";
import { type ICodeEditor, type IOverlayWidget, type IOverlayWidgetPosition } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { type CharacterMapping } from "../../../common/viewLayout/viewLineRenderer.js";
import type { FoldingModel } from "../../folding/browser/foldingModel.js";
export declare class StickyScrollWidgetState {
    readonly startLineNumbers: number[];
    readonly endLineNumbers: number[];
    readonly lastLineRelativePosition: number;
    readonly showEndForLine: number | null;
    constructor(startLineNumbers: number[], endLineNumbers: number[], lastLineRelativePosition: number, showEndForLine?: number | null);
    equals(other: StickyScrollWidgetState | undefined): boolean;
    static get Empty(): StickyScrollWidgetState;
}
export declare class StickyScrollWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private readonly _foldingIconStore;
    private readonly _rootDomNode;
    private readonly _lineNumbersDomNode;
    private readonly _linesDomNodeScrollable;
    private readonly _linesDomNode;
    private _previousState;
    private _lineHeight;
    private _renderedStickyLines;
    private _lineNumbers;
    private _lastLineRelativePosition;
    private _minContentWidthInPx;
    private _isOnGlyphMargin;
    constructor(_editor: ICodeEditor);
    get lineNumbers(): number[];
    get lineNumberCount(): number;
    getRenderedStickyLine(lineNumber: number): RenderedStickyLine | undefined;
    getCurrentLines(): readonly number[];
    setState(_state: StickyScrollWidgetState | undefined, foldingModel: FoldingModel | undefined, _rebuildFromLine?: number): void;
    private _isWidgetHeightZero;
    private _findLineToRebuildWidgetFrom;
    private _updateWidgetWidth;
    private _clearStickyLinesFromLine;
    private _useFoldingOpacityTransition;
    private _setFoldingIconsVisibility;
    private _renderRootNode;
    private _setFoldingHoverListeners;
    private _renderChildNode;
    private _updateTopAndZIndexOfStickyLine;
    private _renderFoldingIconForLine;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    getMinContentWidthInPx(): number;
    focusLineWithIndex(index: number): void;
    /**
     * Given a leaf dom node, tries to find the editor position.
     */
    getEditorPositionFromNode(spanDomNode: HTMLElement | null): Position | null;
    getLineNumberFromChildDomNode(domNode: HTMLElement | null): number | null;
    private _getRenderedStickyLineFromChildDomNode;
    /**
     * Given a child dom node, tries to find the line number attribute that was stored in the node.
     * @returns the attribute value or null if none is found.
     */
    getLineIndexFromChildDomNode(domNode: HTMLElement | null): number | null;
    /**
     * Given a child dom node, tries to find if it is (contained in) a sticky line.
     * @returns a boolean.
     */
    isInStickyLine(domNode: HTMLElement | null): boolean;
    /**
     * Given a child dom node, tries to find if this dom node is (contained in) a sticky folding icon.
     * @returns a boolean.
     */
    isInFoldingIconDomNode(domNode: HTMLElement | null): boolean;
    /**
     * Given the dom node, finds if it or its parent sequence contains the given attribute.
     * @returns the attribute value or undefined.
     */
    private _getAttributeValue;
}
declare class RenderedStickyLine {
    readonly index: number;
    readonly lineNumber: number;
    readonly lineDomNode: HTMLElement;
    readonly lineNumberDomNode: HTMLElement;
    readonly foldingIcon: StickyFoldingIcon | undefined;
    readonly characterMapping: CharacterMapping;
    readonly scrollWidth: number;
    constructor(index: number, lineNumber: number, lineDomNode: HTMLElement, lineNumberDomNode: HTMLElement, foldingIcon: StickyFoldingIcon | undefined, characterMapping: CharacterMapping, scrollWidth: number);
}
declare class StickyFoldingIcon {
    isCollapsed: boolean;
    foldingStartLine: number;
    foldingEndLine: number;
    dimension: number;
    domNode: HTMLElement;
    constructor(isCollapsed: boolean, foldingStartLine: number, foldingEndLine: number, dimension: number);
    setVisible(visible: boolean): void;
}
export {};
