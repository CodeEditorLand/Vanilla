import "vs/css!./media/gettingStarted";
import { URI } from "vs/base/common/uri";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IUntypedEditorInput } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
export declare const gettingStartedInputTypeId = "workbench.editors.gettingStartedInput";
export interface GettingStartedEditorOptions extends IEditorOptions {
    selectedCategory?: string;
    selectedStep?: string;
    showTelemetryNotice?: boolean;
}
export declare class GettingStartedInput extends EditorInput {
    static readonly ID = "workbench.editors.gettingStartedInput";
    static readonly RESOURCE: any;
    get typeId(): string;
    get editorId(): string | undefined;
    toUntyped(): IUntypedEditorInput;
    get resource(): URI | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    constructor(options: GettingStartedEditorOptions);
    getName(): any;
    selectedCategory: string | undefined;
    selectedStep: string | undefined;
    showTelemetryNotice: boolean;
}
