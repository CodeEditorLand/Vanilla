import { IMarkdownString } from "vs/base/common/htmlContent";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { GlyphMarginLane } from "vs/editor/common/model";
import { IHoverComputer } from "vs/editor/contrib/hover/browser/hoverOperation";
export type LaneOrLineNumber = GlyphMarginLane | "lineNo";
export interface IHoverMessage {
    value: IMarkdownString;
}
export declare class MarginHoverComputer implements IHoverComputer<IHoverMessage> {
    private readonly _editor;
    private _lineNumber;
    private _laneOrLine;
    get lineNumber(): number;
    set lineNumber(value: number);
    get lane(): LaneOrLineNumber;
    set lane(value: LaneOrLineNumber);
    constructor(_editor: ICodeEditor);
    computeSync(): IHoverMessage[];
}
