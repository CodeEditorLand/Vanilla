import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { AccessibleViewType } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IVisibleEditorPane } from "vs/workbench/common/editor";
export declare class NotebookAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "notebook";
    readonly when: any;
    readonly type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): any;
}
export declare function getAccessibilityHelpText(): string;
export declare function getAccessibilityHelpProvider(accessor: ServicesAccessor, editor: ICodeEditor | IVisibleEditorPane): any;
