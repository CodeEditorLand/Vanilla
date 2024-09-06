import { IComputedEditorOptions, WrappingIndent } from "vs/editor/common/config/editorOptions";
import { FontInfo } from "vs/editor/common/config/fontInfo";
import { ILineBreaksComputer, ILineBreaksComputerFactory } from "vs/editor/common/modelLineProjectionData";
export declare class MonospaceLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    static create(options: IComputedEditorOptions): MonospaceLineBreaksComputerFactory;
    private readonly classifier;
    constructor(breakBeforeChars: string, breakAfterChars: string);
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: "normal" | "keepAll"): ILineBreaksComputer;
}
