import { ILocalizedString } from "vs/nls";
import { ICommandActionTitle } from "vs/platform/action/common/action";
import { Action2 } from "vs/platform/actions/common/actions";
import { ContextKeyExpression } from "vs/platform/contextkey/common/contextkey";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare const ToggleActivityBarVisibilityActionId = "workbench.action.toggleActivityBarVisibility";
export declare class ToggleSidebarPositionAction extends Action2 {
    static readonly ID = "workbench.action.toggleSidebarPosition";
    static readonly LABEL: any;
    static getLabel(layoutService: IWorkbenchLayoutService): string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleStatusbarVisibilityAction extends Action2 {
    static readonly ID = "workbench.action.toggleStatusbarVisibility";
    private static readonly statusbarVisibleKey;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class AbstractSetShowTabsAction extends Action2 {
    private readonly settingName;
    private readonly value;
    constructor(settingName: string, value: string, title: ICommandActionTitle, id: string, precondition: ContextKeyExpression, description: string | ILocalizedString | undefined);
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class HideEditorTabsAction extends AbstractSetShowTabsAction {
    static readonly ID = "workbench.action.hideEditorTabs";
    constructor();
}
export declare class ZenHideEditorTabsAction extends AbstractSetShowTabsAction {
    static readonly ID = "workbench.action.zenHideEditorTabs";
    constructor();
}
export declare class ShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
    static readonly ID = "workbench.action.showMultipleEditorTabs";
    constructor();
}
export declare class ZenShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
    static readonly ID = "workbench.action.zenShowMultipleEditorTabs";
    constructor();
}
export declare class ShowSingleEditorTabAction extends AbstractSetShowTabsAction {
    static readonly ID = "workbench.action.showEditorTab";
    constructor();
}
export declare class ZenShowSingleEditorTabAction extends AbstractSetShowTabsAction {
    static readonly ID = "workbench.action.zenShowEditorTab";
    constructor();
}
export declare class EditorActionsTitleBarAction extends Action2 {
    static readonly ID = "workbench.action.editorActionsTitleBar";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class EditorActionsDefaultAction extends Action2 {
    static readonly ID = "workbench.action.editorActionsDefault";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class HideEditorActionsAction extends Action2 {
    static readonly ID = "workbench.action.hideEditorActions";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowEditorActionsAction extends Action2 {
    static readonly ID = "workbench.action.showEditorActions";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ConfigureEditorTabsAction extends Action2 {
    static readonly ID = "workbench.action.configureEditorTabs";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ConfigureEditorAction extends Action2 {
    static readonly ID = "workbench.action.configureEditor";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export {};
