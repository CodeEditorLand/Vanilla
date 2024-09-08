import { type IAction2Options } from "../../../../../platform/actions/common/actions.js";
import type { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { CellKind } from "../../common/notebookCommon.js";
import type { CellViewModel } from "../viewModel/notebookViewModelImpl.js";
import { NotebookAction, type INotebookActionContext } from "./coreActions.js";
export declare function insertNewCell(accessor: ServicesAccessor, context: INotebookActionContext, kind: CellKind, direction: "above" | "below", focusEditor: boolean): CellViewModel | null;
export declare abstract class InsertCellCommand extends NotebookAction {
    private kind;
    private direction;
    private focusEditor;
    constructor(desc: Readonly<IAction2Options>, kind: CellKind, direction: "above" | "below", focusEditor: boolean);
    runWithContext(accessor: ServicesAccessor, context: INotebookActionContext): Promise<void>;
}
