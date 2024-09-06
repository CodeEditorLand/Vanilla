import { Disposable } from "vs/base/common/lifecycle";
import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { AccessibleViewType, IAccessibleViewContentProvider } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare class RunAndDebugAccessibilityHelp implements IAccessibleViewImplentation {
    priority: number;
    name: string;
    when: any;
    type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): RunAndDebugAccessibilityHelpProvider;
}
declare class RunAndDebugAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _commandService;
    private readonly _viewsService;
    readonly id: any;
    readonly verbositySettingKey: any;
    readonly options: {
        type: any;
    };
    private _focusedView;
    constructor(_commandService: ICommandService, _viewsService: IViewsService);
    onClose(): void;
    provideContent(): string;
}
export {};
