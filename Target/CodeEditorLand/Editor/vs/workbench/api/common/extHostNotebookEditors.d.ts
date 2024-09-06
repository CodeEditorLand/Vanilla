import { ILogService } from "vs/platform/log/common/log";
import { ExtHostNotebookEditorsShape, INotebookEditorPropertiesChangeData, INotebookEditorViewColumnInfo } from "vs/workbench/api/common/extHost.protocol";
import { ExtHostNotebookController } from "vs/workbench/api/common/extHostNotebook";
export declare class ExtHostNotebookEditors implements ExtHostNotebookEditorsShape {
    private readonly _logService;
    private readonly _notebooksAndEditors;
    private readonly _onDidChangeNotebookEditorSelection;
    private readonly _onDidChangeNotebookEditorVisibleRanges;
    readonly onDidChangeNotebookEditorSelection: any;
    readonly onDidChangeNotebookEditorVisibleRanges: any;
    constructor(_logService: ILogService, _notebooksAndEditors: ExtHostNotebookController);
    $acceptEditorPropertiesChanged(id: string, data: INotebookEditorPropertiesChangeData): void;
    $acceptEditorViewColumns(data: INotebookEditorViewColumnInfo): void;
}
