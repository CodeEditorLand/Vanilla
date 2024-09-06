import { ThemeIcon } from "vs/base/common/themables";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { EditorInputCapabilities, IUntypedEditorInput } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { ExtensionEditorTab, IExtension } from "vs/workbench/contrib/extensions/common/extensions";
export interface IExtensionEditorOptions extends IEditorOptions {
    showPreReleaseVersion?: boolean;
    tab?: ExtensionEditorTab;
    feature?: string;
    sideByside?: boolean;
}
export declare class ExtensionsInput extends EditorInput {
    private _extension;
    static readonly ID = "workbench.extensions.input2";
    get typeId(): string;
    get capabilities(): EditorInputCapabilities;
    get resource(): any;
    constructor(_extension: IExtension);
    get extension(): IExtension;
    getName(): string;
    getIcon(): ThemeIcon | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
