import { Action2 } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class ToggleAuxiliaryBarAction extends Action2 {
    static readonly ID = "workbench.action.toggleAuxiliaryBar";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
