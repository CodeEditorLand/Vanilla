import type { ObjectTree } from "../../../../../base/browser/ui/tree/objectTree.js";
import type { FuzzyScore } from "../../../../../base/common/filters.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ITestResultService } from "../../common/testResultService.js";
import { ITestService } from "../../common/testService.js";
import { TestItemTreeElement, type ITestTreeProjection, type TestExplorerTreeElement } from "./index.js";
import { type ISerializedTestTreeCollapseState } from "./testingViewState.js";
/**
 * Projection that lists tests in their traditional tree view.
 */
export declare class ListProjection extends Disposable implements ITestTreeProjection {
    lastState: ISerializedTestTreeCollapseState;
    private readonly testService;
    private readonly results;
    private readonly updateEmitter;
    private readonly items;
    /**
     * Gets root elements of the tree.
     */
    private get rootsWithChildren();
    /**
     * @inheritdoc
     */
    readonly onUpdate: import("../../../../../base/common/event.js").Event<void>;
    constructor(lastState: ISerializedTestTreeCollapseState, testService: ITestService, results: ITestResultService);
    /**
     * @inheritdoc
     */
    getElementByTestId(testId: string): TestItemTreeElement | undefined;
    /**
     * @inheritdoc
     */
    private applyDiff;
    /**
     * @inheritdoc
     */
    applyTo(tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>): void;
    /**
     * @inheritdoc
     */
    expandElement(element: TestItemTreeElement, depth: number): void;
    private unstoreItem;
    private _storeItem;
    private storeItem;
}
