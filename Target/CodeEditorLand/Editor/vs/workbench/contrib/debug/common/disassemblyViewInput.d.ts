import { ThemeIcon } from "vs/base/common/themables";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
export declare class DisassemblyViewInput extends EditorInput {
    static readonly ID = "debug.disassemblyView.input";
    get typeId(): string;
    static _instance: DisassemblyViewInput;
    static get instance(): DisassemblyViewInput;
    readonly resource: undefined;
    getName(): string;
    getIcon(): ThemeIcon;
    matches(other: unknown): boolean;
}
