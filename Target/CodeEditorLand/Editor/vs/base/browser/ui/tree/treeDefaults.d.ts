import { Action } from "../../../common/actions.js";
import { AsyncDataTree } from "./asyncDataTree.js";
export declare class CollapseAllAction<TInput, T, TFilterData = void> extends Action {
    private viewer;
    constructor(viewer: AsyncDataTree<TInput, T, TFilterData>, enabled: boolean);
    run(): Promise<any>;
}
