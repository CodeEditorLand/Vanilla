import { Action2 } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class GoToFileAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
export declare class CollapseAllAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class ExpandAllAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
