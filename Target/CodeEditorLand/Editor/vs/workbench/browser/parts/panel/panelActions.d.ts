import "vs/css!./media/panelpart";
import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { Action2, IAction2Options } from "vs/platform/actions/common/actions";
import { ViewContainerLocation } from "vs/workbench/common/views";
export declare class TogglePanelAction extends Action2 {
    static readonly ID = "workbench.action.togglePanel";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare class MoveViewsBetweenPanelsAction extends Action2 {
    private readonly source;
    private readonly destination;
    constructor(source: ViewContainerLocation, destination: ViewContainerLocation, desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class MovePanelToSecondarySideBarAction extends MoveViewsBetweenPanelsAction {
    static readonly ID = "workbench.action.movePanelToSecondarySideBar";
    constructor();
}
export declare class MoveSecondarySideBarToPanelAction extends MoveViewsBetweenPanelsAction {
    static readonly ID = "workbench.action.moveSecondarySideBarToPanel";
    constructor();
}
export {};
