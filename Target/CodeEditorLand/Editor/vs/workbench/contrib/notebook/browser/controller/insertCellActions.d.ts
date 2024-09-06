import { IAction2Options } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { INotebookActionContext, NotebookAction } from "vs/workbench/contrib/notebook/browser/controller/coreActions";
import { CellKind } from "vs/workbench/contrib/notebook/common/notebookCommon";
export declare function insertNewCell(accessor: ServicesAccessor, context: INotebookActionContext, kind: CellKind, direction: "above" | "below", focusEditor: boolean): any;
export declare abstract class InsertCellCommand extends NotebookAction {
    private kind;
    private direction;
    private focusEditor;
    constructor(desc: Readonly<IAction2Options>, kind: CellKind, direction: "above" | "below", focusEditor: boolean);
    runWithContext(accessor: ServicesAccessor, context: INotebookActionContext): Promise<void>;
}
