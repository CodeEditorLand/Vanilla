import { Action2 } from "vs/platform/actions/common/actions";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IEditorSerializer } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { WalkThroughInput } from "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput";
export declare class EditorWalkThroughAction extends Action2 {
    static readonly ID = "workbench.action.showInteractivePlayground";
    static readonly LABEL: any;
    constructor();
    run(serviceAccessor: ServicesAccessor): Promise<void>;
}
export declare class EditorWalkThroughInputSerializer implements IEditorSerializer {
    static readonly ID = "workbench.editors.walkThroughInput";
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string;
    deserialize(instantiationService: IInstantiationService): WalkThroughInput;
}
