import type { CancellationToken } from "../../../../../base/common/cancellation.js";
import { type Event } from "../../../../../base/common/event.js";
import type { URI } from "../../../../../base/common/uri.js";
import { IOutlineModelService } from "../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IMarkerService } from "../../../../../platform/markers/common/markers.js";
import { type OutlineChangeEvent } from "../../../../services/outline/browser/outline.js";
import { INotebookExecutionStateService } from "../../common/notebookExecutionStateService.js";
import type { INotebookEditor } from "../notebookBrowser.js";
import type { OutlineEntry } from "./OutlineEntry.js";
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
    get uri(): URI | undefined;
    computeFullSymbols(cancelToken: CancellationToken): Promise<void>;
    recomputeState(): void;
    recomputeActive(): {
        changeEventTriggered: boolean;
    };
    dispose(): void;
}
