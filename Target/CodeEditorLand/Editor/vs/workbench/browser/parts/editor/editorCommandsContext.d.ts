import { IListService } from "vs/platform/list/browser/listService";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export interface IResolvedEditorCommandsContext {
    readonly groupedEditors: {
        readonly group: IEditorGroup;
        readonly editors: EditorInput[];
    }[];
    readonly preserveFocus: boolean;
}
export declare function resolveCommandsContext(commandArgs: unknown[], editorService: IEditorService, editorGroupsService: IEditorGroupsService, listService: IListService): IResolvedEditorCommandsContext;
