import { Disposable } from "vs/base/common/lifecycle";
import { INotebookEditor, INotebookEditorContribution } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { IUserActivityService } from "vs/workbench/services/userActivity/common/userActivityService";
export declare class ExecutionEditorProgressController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _notebookExecutionStateService;
    private readonly _userActivity;
    static id: string;
    private readonly _activityMutex;
    constructor(_notebookEditor: INotebookEditor, _notebookExecutionStateService: INotebookExecutionStateService, _userActivity: IUserActivityService);
    private _update;
}
