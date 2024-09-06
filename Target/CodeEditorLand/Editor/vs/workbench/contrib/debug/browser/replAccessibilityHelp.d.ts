import { Disposable } from "vs/base/common/lifecycle";
import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { AccessibleViewType, IAccessibleViewContentProvider } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { Repl } from "vs/workbench/contrib/debug/browser/repl";
export declare class ReplAccessibilityHelp implements IAccessibleViewImplentation {
    priority: number;
    name: string;
    when: any;
    type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): ReplAccessibilityHelpProvider | undefined;
}
declare class ReplAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _replView;
    readonly id: any;
    readonly verbositySettingKey: any;
    readonly options: {
        type: any;
    };
    private _treeHadFocus;
    constructor(_replView: Repl);
    onClose(): void;
    provideContent(): string;
}
export {};
