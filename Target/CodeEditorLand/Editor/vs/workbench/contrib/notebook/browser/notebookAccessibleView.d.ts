import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class NotebookAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "notebook";
    readonly type: any;
    readonly when: any;
    getProvider(accessor: ServicesAccessor): any;
}
export declare function getAccessibleOutputProvider(editorService: IEditorService): any;
