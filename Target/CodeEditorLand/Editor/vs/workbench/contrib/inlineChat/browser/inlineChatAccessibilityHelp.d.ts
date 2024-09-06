import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
export declare class InlineChatAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 106;
    readonly name = "inlineChat";
    readonly type: any;
    readonly when: any;
    getProvider(accessor: ServicesAccessor): any;
}
