import type { CancellationToken } from "../../../../../base/common/cancellation.js";
import { type Event } from "../../../../../base/common/event.js";
import { Disposable, type IDisposable } from "../../../../../base/common/lifecycle.js";
import type { URI } from "../../../../../base/common/uri.js";
import type { INotebookCellStatusBarService } from "../../common/notebookCellStatusBarService.js";
import type { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from "../../common/notebookCommon.js";
export declare class NotebookCellStatusBarService extends Disposable implements INotebookCellStatusBarService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: Event<void>;
    private readonly _onDidChangeItems;
    readonly onDidChangeItems: Event<void>;
    private readonly _providers;
    registerCellStatusBarItemProvider(provider: INotebookCellStatusBarItemProvider): IDisposable;
    getStatusBarItemsForCell(docUri: URI, cellIndex: number, viewType: string, token: CancellationToken): Promise<INotebookCellStatusBarItemList[]>;
}
