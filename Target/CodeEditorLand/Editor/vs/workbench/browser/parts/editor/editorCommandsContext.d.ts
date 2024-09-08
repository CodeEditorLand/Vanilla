import type { IListService } from "../../../../platform/list/browser/listService.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { type IEditorGroup, type IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import type { IEditorService } from "../../../services/editor/common/editorService.js";
export interface IResolvedEditorCommandsContext {
    readonly groupedEditors: {
        readonly group: IEditorGroup;
        readonly editors: EditorInput[];
    }[];
    readonly preserveFocus: boolean;
}
export declare function resolveCommandsContext(commandArgs: unknown[], editorService: IEditorService, editorGroupsService: IEditorGroupsService, listService: IListService): IResolvedEditorCommandsContext;
