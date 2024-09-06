import { IHorizontalSashLayoutProvider } from "vs/base/browser/ui/sash/sash";
import { Color } from "vs/base/common/color";
import "vs/css!./zoneWidget";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, IViewZone } from "vs/editor/browser/editorBrowser";
import { EditorLayoutInfo } from "vs/editor/common/config/editorOptions";
import { IPosition, Position } from "vs/editor/common/core/position";
import { IRange, Range } from "vs/editor/common/core/range";
export interface IOptions {
    showFrame?: boolean;
    showArrow?: boolean;
    frameWidth?: number;
    className?: string;
    isAccessible?: boolean;
    isResizeable?: boolean;
    frameColor?: Color | string;
    arrowColor?: Color;
    keepEditorSelection?: boolean;
    allowUnlimitedHeight?: boolean;
    ordinal?: number;
    showInHiddenAreas?: boolean;
}
export interface IStyles {
    frameColor?: Color | string | null;
    arrowColor?: Color | null;
}
declare class ViewZoneDelegate implements IViewZone {
    domNode: HTMLElement;
    id: string;
    afterLineNumber: number;
    afterColumn: number;
    heightInLines: number;
    readonly showInHiddenAreas: boolean | undefined;
    readonly ordinal: number | undefined;
    private readonly _onDomNodeTop;
    private readonly _onComputedHeight;
    constructor(domNode: HTMLElement, afterLineNumber: number, afterColumn: number, heightInLines: number, onDomNodeTop: (top: number) => void, onComputedHeight: (height: number) => void, showInHiddenAreas: boolean | undefined, ordinal: number | undefined);
    onDomNodeTop(top: number): void;
    onComputedHeight(height: number): void;
}
export declare class OverlayWidgetDelegate implements IOverlayWidget {
    private readonly _id;
    private readonly _domNode;
    constructor(id: string, domNode: HTMLElement);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
}
export declare abstract class ZoneWidget implements IHorizontalSashLayoutProvider {
    private _arrow;
    private _overlayWidget;
    private _resizeSash;
    private readonly _positionMarkerId;
    protected _viewZone: ViewZoneDelegate | null;
    protected readonly _disposables: any;
    container: HTMLElement | null;
    domNode: HTMLElement;
    editor: ICodeEditor;
    options: IOptions;
    constructor(editor: ICodeEditor, options?: IOptions);
    dispose(): void;
    create(): void;
    style(styles: IStyles): void;
    protected _applyStyles(): void;
    protected _getWidth(info: EditorLayoutInfo): number;
    private _getLeft;
    private _onViewZoneTop;
    private _onViewZoneHeight;
    get position(): Position | undefined;
    hasFocus(): any;
    protected _isShowing: boolean;
    show(rangeOrPos: IRange | IPosition, heightInLines: number): void;
    updatePositionAndHeight(rangeOrPos: IRange | IPosition, heightInLines?: number): void;
    hide(): void;
    private _decoratingElementsHeight;
    private _showImpl;
    protected revealRange(range: Range, isLastLine: boolean): void;
    protected setCssClass(className: string, classToReplace?: string): void;
    protected abstract _fillContainer(container: HTMLElement): void;
    protected _onWidth(widthInPixel: number): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    protected _relayout(newHeightInLines: number): void;
    private _initSash;
    getHorizontalSashLeft(): number;
    getHorizontalSashTop(): number;
    getHorizontalSashWidth(): number;
}
export {};
