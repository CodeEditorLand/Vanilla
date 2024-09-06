import { Iterable } from "vs/base/common/iterator";
import { URI } from "vs/base/common/uri";
import { IMainThreadTestCollection } from "vs/workbench/contrib/testing/common/testService";
import { AbstractIncrementalTestCollection, IncrementalChangeCollector, IncrementalTestCollectionItem, InternalTestItem, ITestUriCanonicalizer, TestsDiff } from "vs/workbench/contrib/testing/common/testTypes";
export declare class MainThreadTestCollection extends AbstractIncrementalTestCollection<IncrementalTestCollectionItem> implements IMainThreadTestCollection {
    private readonly expandActual;
    private testsByUrl;
    private busyProvidersChangeEmitter;
    private expandPromises;
    /**
     * @inheritdoc
     */
    get busyProviders(): any;
    /**
     * @inheritdoc
     */
    get rootItems(): any;
    /**
     * @inheritdoc
     */
    get all(): Generator<any, void, unknown>;
    get rootIds(): any;
    readonly onBusyProvidersChange: any;
    constructor(uriIdentityService: ITestUriCanonicalizer, expandActual: (id: string, levels: number) => Promise<void>);
    /**
     * @inheritdoc
     */
    expand(testId: string, levels: number): Promise<void>;
    /**
     * @inheritdoc
     */
    getNodeById(id: string): any;
    /**
     * @inheritdoc
     */
    getNodeByUrl(uri: URI): Iterable<IncrementalTestCollectionItem>;
    /**
     * @inheritdoc
     */
    getReviverDiff(): TestsDiff;
    /**
     * Applies the diff to the collection.
     */
    apply(diff: TestsDiff): void;
    /**
     * Clears everything from the collection, and returns a diff that applies
     * that action.
     */
    clear(): TestsDiff;
    /**
     * @override
     */
    protected createItem(internal: InternalTestItem): IncrementalTestCollectionItem;
    private readonly changeCollector;
    protected createChangeCollector(): IncrementalChangeCollector<IncrementalTestCollectionItem>;
    private getIterator;
}
