import { WrappingIndent } from "../../common/config/editorOptions.js";
import type { FontInfo } from "../../common/config/fontInfo.js";
import { type ILineBreaksComputer, type ILineBreaksComputerFactory } from "../../common/modelLineProjectionData.js";
export declare class DOMLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    private targetWindow;
    static create(targetWindow: Window): DOMLineBreaksComputerFactory;
    constructor(targetWindow: WeakRef<Window>);
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: "normal" | "keepAll"): ILineBreaksComputer;
}
