import { WorkbenchObjectTree } from "vs/platform/list/browser/listService";
import { TestExplorerTreeElement } from "vs/workbench/contrib/testing/browser/explorerProjections/index";
import { ISerializedTestTreeCollapseState } from "vs/workbench/contrib/testing/browser/explorerProjections/testingViewState";
export declare class TestingObjectTree<TFilterData = void> extends WorkbenchObjectTree<TestExplorerTreeElement, TFilterData> {
    /**
     * Gets a serialized view state for the tree, optimized for storage.
     *
     * @param updatePreviousState Optional previous state to mutate and update
     * instead of creating a new one.
     */
    getOptimizedViewState(updatePreviousState?: ISerializedTestTreeCollapseState): ISerializedTestTreeCollapseState;
}
