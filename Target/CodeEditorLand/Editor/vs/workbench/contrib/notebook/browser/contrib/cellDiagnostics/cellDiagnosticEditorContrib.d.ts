import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IMarkerService } from "vs/platform/markers/common/markers";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { INotebookEditor, INotebookEditorContribution } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
export declare class CellDiagnostics extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly notebookExecutionStateService;
    private readonly markerService;
    private readonly chatAgentService;
    private readonly configurationService;
    static ID: string;
    private enabled;
    private listening;
    private diagnosticsByHandle;
    constructor(notebookEditor: INotebookEditor, notebookExecutionStateService: INotebookExecutionStateService, markerService: IMarkerService, chatAgentService: IChatAgentService, configurationService: IConfigurationService);
    private updateEnabled;
    private handleChangeExecutionState;
    private clearAll;
    clear(cellHandle: number): void;
    private setDiagnostics;
    private createMarkerData;
    dispose(): void;
}
