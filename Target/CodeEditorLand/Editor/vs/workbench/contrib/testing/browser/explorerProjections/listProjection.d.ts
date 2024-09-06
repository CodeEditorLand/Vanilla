import { ObjectTree } from "vs/base/browser/ui/tree/objectTree";
import { FuzzyScore } from "vs/base/common/filters";
import { Disposable } from "vs/base/common/lifecycle";
import { ITestTreeProjection, TestExplorerTreeElement, TestItemTreeElement } from "vs/workbench/contrib/testing/browser/explorerProjections/index";
import { ISerializedTestTreeCollapseState } from "vs/workbench/contrib/testing/browser/explorerProjections/testingViewState";
import { ITestResultService } from "vs/workbench/contrib/testing/common/testResultService";
import { ITestService } from "vs/workbench/contrib/testing/common/testService";
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
    readonly onUpdate: any;
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
