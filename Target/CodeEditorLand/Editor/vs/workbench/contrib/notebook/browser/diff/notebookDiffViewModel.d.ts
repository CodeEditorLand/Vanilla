import type { CancellationToken } from "../../../../../base/common/cancellation.js";
import type { IDiffResult } from "../../../../../base/common/diff/diff.js";
import { type IValueWithChangeEvent } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { URI } from "../../../../../base/common/uri.js";
import type { FontInfo } from "../../../../../editor/common/config/fontInfo.js";
import type { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import type { ContextKeyValue } from "../../../../../platform/contextkey/common/contextkey.js";
import { MultiDiffEditorItem } from "../../../multiDiffEditor/browser/multiDiffSourceResolverService.js";
import { type INotebookDiffEditorModel } from "../../common/notebookCommon.js";
import type { INotebookService } from "../../common/notebookService.js";
import type { INotebookEditorWorkerService } from "../../common/services/notebookWorkerService.js";
import { type IDiffElementViewModelBase } from "./diffElementViewModel.js";
import type { NotebookDiffEditorEventDispatcher } from "./eventDispatcher.js";
import { type INotebookDiffViewModel, type INotebookDiffViewModelUpdateEvent } from "./notebookDiffEditorBrowser.js";
export declare class NotebookDiffViewModel extends Disposable implements INotebookDiffViewModel, IValueWithChangeEvent<readonly MultiDiffEditorItem[]> {
    private readonly model;
    private readonly notebookEditorWorkerService;
    private readonly configurationService;
    private readonly eventDispatcher;
    private readonly notebookService;
    private readonly fontInfo?;
    private readonly excludeUnchangedPlaceholder?;
    private readonly placeholderAndRelatedCells;
    private readonly _items;
    get items(): readonly IDiffElementViewModelBase[];
    private readonly _onDidChangeItems;
    readonly onDidChangeItems: import("../../../../../base/common/event.js").Event<INotebookDiffViewModelUpdateEvent>;
    private readonly disposables;
    private _onDidChange;
    private diffEditorItems;
    onDidChange: import("../../../../../base/common/event.js").Event<void>;
    get value(): readonly NotebookMultiDiffEditorItem[];
    private _hasUnchangedCells?;
    get hasUnchangedCells(): boolean;
    private _includeUnchanged?;
    get includeUnchanged(): boolean;
    set includeUnchanged(value: boolean);
    private hideOutput?;
    private hideCellMetadata?;
    private originalCellViewModels;
    constructor(model: INotebookDiffEditorModel, notebookEditorWorkerService: INotebookEditorWorkerService, configurationService: IConfigurationService, eventDispatcher: NotebookDiffEditorEventDispatcher, notebookService: INotebookService, fontInfo?: FontInfo | undefined, excludeUnchangedPlaceholder?: boolean | undefined);
    dispose(): void;
    private clear;
    computeDiff(token: CancellationToken): Promise<{
        firstChangeIndex: number;
    } | undefined>;
    private updateDiffEditorItems;
    private updateViewModels;
}
/**
 * making sure that swapping cells are always translated to `insert+delete`.
 */
export declare function prettyChanges(model: INotebookDiffEditorModel, diffResult: IDiffResult): void;
export declare abstract class NotebookMultiDiffEditorItem extends MultiDiffEditorItem {
    readonly type: IDiffElementViewModelBase["type"];
    readonly containerType: IDiffElementViewModelBase["type"];
    kind: "Cell" | "Metadata" | "Output";
    constructor(originalUri: URI | undefined, modifiedUri: URI | undefined, goToFileUri: URI | undefined, type: IDiffElementViewModelBase["type"], containerType: IDiffElementViewModelBase["type"], kind: "Cell" | "Metadata" | "Output", contextKeys?: Record<string, ContextKeyValue>);
}
