import { IEditorPaneService } from "vs/workbench/services/editor/common/editorPaneService";
export declare class EditorPaneService implements IEditorPaneService {
    readonly _serviceBrand: undefined;
    readonly onWillInstantiateEditorPane: any;
    didInstantiateEditorPane(typeId: string): boolean;
}
