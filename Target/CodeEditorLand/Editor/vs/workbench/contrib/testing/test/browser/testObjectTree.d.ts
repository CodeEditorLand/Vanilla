import { ObjectTree } from "../../../../../base/browser/ui/tree/objectTree.js";
import type { ITreeSorter } from "../../../../../base/browser/ui/tree/tree.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { IWorkspaceFoldersChangeEvent } from "../../../../../platform/workspace/common/workspace.js";
import { type ITestTreeProjection, type TestExplorerTreeElement } from "../../browser/explorerProjections/index.js";
import type { ITestService } from "../../common/testService.js";
import type { TestsDiffOp } from "../../common/testTypes.js";
type SerializedTree = {
    e: string;
    children?: SerializedTree[];
    data?: string;
};
declare class TestObjectTree<T> extends ObjectTree<T, any> {
    constructor(serializer: (node: T) => string, sorter?: ITreeSorter<T>);
    getRendered(getProperty?: string): SerializedTree[] | undefined;
}
export declare class TestTreeTestHarness<T extends ITestTreeProjection = ITestTreeProjection> extends Disposable {
    readonly c: import("../common/testStubs.js").TestTestCollection;
    private readonly onDiff;
    readonly onFolderChange: Emitter<IWorkspaceFoldersChangeEvent>;
    private isProcessingDiff;
    readonly projection: T;
    readonly tree: TestObjectTree<TestExplorerTreeElement>;
    constructor(makeTree: (listener: ITestService) => T, c?: import("../common/testStubs.js").TestTestCollection);
    pushDiff(...diff: TestsDiffOp[]): void;
    flush(): SerializedTree[] | undefined;
}
export {};
