import { type ColorScheme } from "../../../../platform/theme/common/theme.js";
import type { IEditorConfiguration } from "../../../common/config/editorConfiguration.js";
import type { StringBuilder } from "../../../common/core/stringBuilder.js";
import { type CharacterMapping } from "../../../common/viewLayout/viewLineRenderer.js";
import type { ViewportData } from "../../../common/viewLayout/viewLinesViewportData.js";
import { VisibleRanges } from "../../view/renderingContext.js";
import type { IVisibleLine } from "../../view/viewLayer.js";
import type { DomReadingContext } from "./domReadingContext.js";
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
