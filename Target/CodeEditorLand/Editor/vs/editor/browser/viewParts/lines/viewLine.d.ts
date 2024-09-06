import { VisibleRanges } from "vs/editor/browser/view/renderingContext";
import { IVisibleLine } from "vs/editor/browser/view/viewLayer";
import { DomReadingContext } from "vs/editor/browser/viewParts/lines/domReadingContext";
import { IEditorConfiguration } from "vs/editor/common/config/editorConfiguration";
import { StringBuilder } from "vs/editor/common/core/stringBuilder";
import { CharacterMapping } from "vs/editor/common/viewLayout/viewLineRenderer";
import { ViewportData } from "vs/editor/common/viewLayout/viewLinesViewportData";
import { ColorScheme } from "vs/platform/theme/common/theme";
export declare class ViewLineOptions {
    readonly themeType: ColorScheme;
    readonly renderWhitespace: "none" | "boundary" | "selection" | "trailing" | "all";
    readonly renderControlCharacters: boolean;
    readonly spaceWidth: number;
    readonly middotWidth: number;
    readonly wsmiddotWidth: number;
    readonly useMonospaceOptimizations: boolean;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly lineHeight: number;
    readonly stopRenderingLineAfter: number;
    readonly fontLigatures: string;
    constructor(config: IEditorConfiguration, themeType: ColorScheme);
    equals(other: ViewLineOptions): boolean;
}
export declare class ViewLine implements IVisibleLine {
    static readonly CLASS_NAME = "view-line";
    private _options;
    private _isMaybeInvalid;
    private _renderedViewLine;
    constructor(options: ViewLineOptions);
    getDomNode(): HTMLElement | null;
    setDomNode(domNode: HTMLElement): void;
    onContentChanged(): void;
    onTokensChanged(): void;
    onDecorationsChanged(): void;
    onOptionsChanged(newOptions: ViewLineOptions): void;
    onSelectionChanged(): boolean;
    renderLine(lineNumber: number, deltaTop: number, lineHeight: number, viewportData: ViewportData, sb: StringBuilder): boolean;
    layoutLine(lineNumber: number, deltaTop: number, lineHeight: number): void;
    getWidth(context: DomReadingContext | null): number;
    getWidthIsFast(): boolean;
    needsMonospaceFontCheck(): boolean;
    monospaceAssumptionsAreValid(): boolean;
    onMonospaceAssumptionsInvalidated(): void;
    getVisibleRangesForRange(lineNumber: number, startColumn: number, endColumn: number, context: DomReadingContext): VisibleRanges | null;
    getColumnOfNodeOffset(spanNode: HTMLElement, offset: number): number;
}
export declare function getColumnOfNodeOffset(characterMapping: CharacterMapping, spanNode: HTMLElement, offset: number): number;
