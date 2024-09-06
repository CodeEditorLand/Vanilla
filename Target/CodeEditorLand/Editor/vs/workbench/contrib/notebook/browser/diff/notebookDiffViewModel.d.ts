import { CancellationToken } from "vs/base/common/cancellation";
import { IDiffResult } from "vs/base/common/diff/diff";
import { type IValueWithChangeEvent } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import type { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import type { ContextKeyValue } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { MultiDiffEditorItem } from "vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService";
import { IDiffElementViewModelBase } from "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel";
import { NotebookDiffEditorEventDispatcher } from "vs/workbench/contrib/notebook/browser/diff/eventDispatcher";
import { INotebookDiffViewModel } from "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser";
import { INotebookDiffEditorModel } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { INotebookEditorWorkerService } from "vs/workbench/contrib/notebook/common/services/notebookWorkerService";
export declare class NotebookDiffViewModel extends Disposable implements INotebookDiffViewModel, IValueWithChangeEvent<readonly MultiDiffEditorItem[]> {
    private readonly model;
    private readonly notebookEditorWorkerService;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly eventDispatcher;
    private readonly notebookService;
    private readonly fontInfo?;
    private readonly excludeUnchangedPlaceholder?;
    private readonly placeholderAndRelatedCells;
    private readonly _items;
    get items(): readonly IDiffElementViewModelBase[];
    private readonly _onDidChangeItems;
    readonly onDidChangeItems: any;
    private readonly disposables;
    private _onDidChange;
    private diffEditorItems;
    onDidChange: any;
    get value(): readonly NotebookMultiDiffEditorItem[];
    private _hasUnchangedCells?;
    get hasUnchangedCells(): boolean;
    private _includeUnchanged?;
    get includeUnchanged(): boolean;
    set includeUnchanged(value: boolean);
    private hideOutput?;
    private hideCellMetadata?;
    private originalCellViewModels;
    constructor(model: INotebookDiffEditorModel, notebookEditorWorkerService: INotebookEditorWorkerService, instantiationService: IInstantiationService, configurationService: IConfigurationService, eventDispatcher: NotebookDiffEditorEventDispatcher, notebookService: INotebookService, fontInfo?: any, excludeUnchangedPlaceholder?: boolean | undefined);
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
