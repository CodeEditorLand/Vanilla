import { ThemeIcon } from "vs/base/common/themables";
import { EditorInputCapabilities, IUntypedEditorInput } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
export declare class RuntimeExtensionsInput extends EditorInput {
    static readonly ID = "workbench.runtimeExtensions.input";
    get typeId(): string;
    get capabilities(): EditorInputCapabilities;
    static _instance: RuntimeExtensionsInput;
    static get instance(): RuntimeExtensionsInput;
    readonly resource: any;
    getName(): string;
    getIcon(): ThemeIcon;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
