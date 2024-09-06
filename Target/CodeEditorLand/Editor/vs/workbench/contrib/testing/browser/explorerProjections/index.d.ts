import { IIdentityProvider } from "vs/base/browser/ui/list/list";
import { ObjectTree } from "vs/base/browser/ui/tree/objectTree";
import { IObjectTreeElement } from "vs/base/browser/ui/tree/tree";
import { Event } from "vs/base/common/event";
import { FuzzyScore } from "vs/base/common/filters";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { Iterable } from "vs/base/common/iterator";
import { IDisposable } from "vs/base/common/lifecycle";
import { ISerializedTestTreeCollapseState } from "vs/workbench/contrib/testing/browser/explorerProjections/testingViewState";
import { InternalTestItem } from "vs/workbench/contrib/testing/common/testTypes";
/**
 * Describes a rendering of tests in the explorer view. Different
 * implementations of this are used for trees and lists, and groupings.
 * Originally this was implemented as inline logic within the ViewModel and
 * using a single IncrementalTestChangeCollector, but this became hairy
 * with status projections.
 */
export interface ITestTreeProjection extends IDisposable {
    /**
     * Event that fires when the projection changes.
     */
    onUpdate: Event<void>;
    /**
     * State to use for applying default collapse state of items.
     */
    lastState: ISerializedTestTreeCollapseState;
    /**
     * Fired when an element in the tree is expanded.
     */
    expandElement(element: TestItemTreeElement, depth: number): void;
    /**
     * Gets an element by its extension-assigned ID.
     */
    getElementByTestId(testId: string): TestItemTreeElement | undefined;
    /**
     * Applies pending update to the tree.
     */
    applyTo(tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>): void;
}
export declare abstract class TestItemTreeElement {
    readonly test: InternalTestItem;
    /**
     * Parent tree item. May not actually be the test item who owns this one
     * in a 'flat' projection.
     */
    readonly parent: TestItemTreeElement | null;
    protected readonly changeEmitter: any;
    /**
     * Fired whenever the element or test properties change.
     */
    readonly onChange: any;
    /**
     * Tree children of this item.
     */
    readonly children: Set<TestExplorerTreeElement>;
    /**
     * Unique ID of the element in the tree.
     */
    readonly treeId: string;
    /**
     * Depth of the element in the tree.
     */
    depth: number;
    /**
     * Whether the node's test result is 'retired' -- from an outdated test run.
     */
    retired: boolean;
    /**
     * State to show on the item. This is generally the item's computed state
     * from its children.
     */
    state: any;
    /**
     * Time it took this test/item to run.
     */
    duration: number | undefined;
    /**
     * Tree element description.
     */
    abstract description: string | null;
    constructor(test: InternalTestItem, 
    /**
     * Parent tree item. May not actually be the test item who owns this one
     * in a 'flat' projection.
     */
    parent?: TestItemTreeElement | null);
    toJSON(): any;
}
export declare class TestTreeErrorMessage {
    readonly message: string | IMarkdownString;
    readonly parent: TestExplorerTreeElement;
    readonly treeId: string;
    readonly children: Set<never>;
    get description(): any;
    constructor(message: string | IMarkdownString, parent: TestExplorerTreeElement);
}
export type TestExplorerTreeElement = TestItemTreeElement | TestTreeErrorMessage;
export declare const testIdentityProvider: IIdentityProvider<TestExplorerTreeElement>;
export declare const getChildrenForParent: (serialized: ISerializedTestTreeCollapseState, rootsWithChildren: Iterable<TestExplorerTreeElement>, node: TestExplorerTreeElement | null) => Iterable<IObjectTreeElement<TestExplorerTreeElement>>;
