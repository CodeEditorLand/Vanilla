import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IUserActivityService } from "../../../../../services/userActivity/common/userActivityService.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
import type { INotebookEditor, INotebookEditorContribution } from "../../notebookBrowser.js";
export declare class ExecutionEditorProgressController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _notebookExecutionStateService;
    private readonly _userActivity;
    static id: string;
    private readonly _activityMutex;
    constructor(_notebookEditor: INotebookEditor, _notebookExecutionStateService: INotebookExecutionStateService, _userActivity: IUserActivityService);
    private _update;
}
