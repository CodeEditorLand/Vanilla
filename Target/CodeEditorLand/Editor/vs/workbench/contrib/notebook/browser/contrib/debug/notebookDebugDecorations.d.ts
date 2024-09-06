import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
import { INotebookEditor, INotebookEditorContribution } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
export declare class PausedCellDecorationContribution extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _debugService;
    private readonly _notebookExecutionStateService;
    static id: string;
    private _currentTopDecorations;
    private _currentOtherDecorations;
    private _executingCellDecorations;
    constructor(_notebookEditor: INotebookEditor, _debugService: IDebugService, _notebookExecutionStateService: INotebookExecutionStateService);
    private updateExecutionDecorations;
    private setTopFrameDecoration;
    private setFocusedFrameDecoration;
    private setExecutingCellDecorations;
}
export declare class NotebookBreakpointDecorations extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _debugService;
    private readonly _configService;
    static id: string;
    private _currentDecorations;
    constructor(_notebookEditor: INotebookEditor, _debugService: IDebugService, _configService: IConfigurationService);
    private updateDecorations;
}
