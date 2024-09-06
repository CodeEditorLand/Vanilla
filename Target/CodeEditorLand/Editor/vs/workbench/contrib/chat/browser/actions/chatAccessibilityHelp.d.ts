import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
export declare class ChatAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 107;
    readonly name = "panelChat";
    readonly type: any;
    readonly when: any;
    getProvider(accessor: ServicesAccessor): any;
}
export declare function getAccessibilityHelpText(type: "panelChat" | "inlineChat"): string;
export declare function getChatAccessibilityHelpProvider(accessor: ServicesAccessor, editor: ICodeEditor | undefined, type: "panelChat" | "inlineChat"): any;
