import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IOutlineModelService } from "vs/editor/contrib/documentSymbols/browser/outlineModel";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IMarkerService } from "vs/platform/markers/common/markers";
import { INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { OutlineChangeEvent } from "vs/workbench/services/outline/browser/outline";
import { OutlineEntry } from "./OutlineEntry";
export interface INotebookCellOutlineDataSource {
    readonly activeElement: OutlineEntry | undefined;
    readonly entries: OutlineEntry[];
}
export declare class NotebookCellOutlineDataSource implements INotebookCellOutlineDataSource {
    private readonly _editor;
    private readonly _notebookExecutionStateService;
    private readonly _outlineModelService;
    private readonly _markerService;
    private readonly _configurationService;
    private readonly _disposables;
    private readonly _onDidChange;
    readonly onDidChange: Event<OutlineChangeEvent>;
    private _uri;
    private _entries;
    private _activeEntry?;
    private readonly _outlineEntryFactory;
    constructor(_editor: INotebookEditor, _notebookExecutionStateService: INotebookExecutionStateService, _outlineModelService: IOutlineModelService, _markerService: IMarkerService, _configurationService: IConfigurationService);
    get activeElement(): OutlineEntry | undefined;
    get entries(): OutlineEntry[];
    get isEmpty(): boolean;
    get uri(): any;
    computeFullSymbols(cancelToken: CancellationToken): Promise<void>;
    recomputeState(): void;
    recomputeActive(): {
        changeEventTriggered: boolean;
    };
    dispose(): void;
}
