import type { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import type { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { EditorInputCapabilities, type IUntypedEditorInput } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import type { ExtensionEditorTab, IExtension } from "./extensions.js";
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
    get resource(): URI;
    constructor(_extension: IExtension);
    get extension(): IExtension;
    getName(): string;
    getIcon(): ThemeIcon | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
