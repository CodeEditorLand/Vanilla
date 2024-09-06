import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { AccessibleContentProvider, AccessibleViewType } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IVisibleEditorPane } from "../../../common/editor.js";
export declare class NotebookAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "notebook";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    readonly type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export declare function getAccessibilityHelpText(): string;
export declare function getAccessibilityHelpProvider(accessor: ServicesAccessor, editor: ICodeEditor | IVisibleEditorPane): AccessibleContentProvider;
