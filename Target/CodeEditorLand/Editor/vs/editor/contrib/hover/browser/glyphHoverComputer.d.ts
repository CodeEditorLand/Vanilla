import { type IMarkdownString } from "../../../../base/common/htmlContent.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { GlyphMarginLane } from "../../../common/model.js";
import type { IHoverComputer } from "./hoverOperation.js";
export type LaneOrLineNumber = GlyphMarginLane | "lineNo";
export interface IHoverMessage {
    value: IMarkdownString;
}
export interface GlyphHoverComputerOptions {
    lineNumber: number;
    laneOrLine: LaneOrLineNumber;
}
export declare class GlyphHoverComputer implements IHoverComputer<GlyphHoverComputerOptions, IHoverMessage> {
    private readonly _editor;
    constructor(_editor: ICodeEditor);
    computeSync(opts: GlyphHoverComputerOptions): IHoverMessage[];
}
