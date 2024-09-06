import { WrappingIndent } from "vs/editor/common/config/editorOptions";
import { FontInfo } from "vs/editor/common/config/fontInfo";
import { ILineBreaksComputer, ILineBreaksComputerFactory } from "vs/editor/common/modelLineProjectionData";
export declare class DOMLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    private targetWindow;
    static create(targetWindow: Window): DOMLineBreaksComputerFactory;
    constructor(targetWindow: WeakRef<Window>);
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: "normal" | "keepAll"): ILineBreaksComputer;
}
