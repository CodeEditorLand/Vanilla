import { IComputedEditorOptions, WrappingIndent } from "../config/editorOptions.js";
import { FontInfo } from "../config/fontInfo.js";
import { ILineBreaksComputer, ILineBreaksComputerFactory } from "../modelLineProjectionData.js";
export declare class MonospaceLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    static create(options: IComputedEditorOptions): MonospaceLineBreaksComputerFactory;
    private readonly classifier;
    constructor(breakBeforeChars: string, breakAfterChars: string);
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: "normal" | "keepAll"): ILineBreaksComputer;
}
