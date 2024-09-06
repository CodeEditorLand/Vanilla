import { TestId } from "vs/workbench/contrib/testing/common/testId";
export interface ISerializedTestTreeCollapseState {
    collapsed?: boolean;
    children?: {
        [localId: string]: ISerializedTestTreeCollapseState;
    };
}
/**
 * Gets whether the given test ID is collapsed.
 */
export declare function isCollapsedInSerializedTestTree(serialized: ISerializedTestTreeCollapseState, id: TestId | string): boolean | undefined;
