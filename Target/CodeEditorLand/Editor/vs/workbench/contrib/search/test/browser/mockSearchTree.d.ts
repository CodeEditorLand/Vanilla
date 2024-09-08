import type { ITreeNavigator } from "../../../../../base/browser/ui/tree/tree.js";
import type { IDisposable } from "../../../../../base/common/lifecycle.js";
import type { RenderableMatch } from "../../browser/searchModel.js";
/**
 * Add stub methods as needed
 */
export declare class MockObjectTree<T, TRef> implements IDisposable {
    private elements;
    get onDidChangeFocus(): import("../../../../../base/common/event.js").Event<unknown>;
    get onDidChangeSelection(): import("../../../../../base/common/event.js").Event<unknown>;
    get onDidOpen(): import("../../../../../base/common/event.js").Event<unknown>;
    get onMouseClick(): import("../../../../../base/common/event.js").Event<unknown>;
    get onMouseDblClick(): import("../../../../../base/common/event.js").Event<unknown>;
    get onContextMenu(): import("../../../../../base/common/event.js").Event<unknown>;
    get onKeyDown(): import("../../../../../base/common/event.js").Event<unknown>;
    get onKeyUp(): import("../../../../../base/common/event.js").Event<unknown>;
    get onKeyPress(): import("../../../../../base/common/event.js").Event<unknown>;
    get onDidFocus(): import("../../../../../base/common/event.js").Event<unknown>;
    get onDidBlur(): import("../../../../../base/common/event.js").Event<unknown>;
    get onDidChangeCollapseState(): import("../../../../../base/common/event.js").Event<unknown>;
    get onDidChangeRenderNodeCount(): import("../../../../../base/common/event.js").Event<unknown>;
    get onDidDispose(): import("../../../../../base/common/event.js").Event<unknown>;
    get lastVisibleElement(): any;
    constructor(elements: any[]);
    domFocus(): void;
    collapse(location: TRef, recursive?: boolean): boolean;
    expand(location: TRef, recursive?: boolean): boolean;
    navigate(start?: TRef): ITreeNavigator<T>;
    getParentElement(elem: RenderableMatch): import("../../browser/searchModel.js").FileMatch | import("../../browser/searchModel.js").FolderMatch | import("../../browser/searchModel.js").SearchResult;
    dispose(): void;
}
