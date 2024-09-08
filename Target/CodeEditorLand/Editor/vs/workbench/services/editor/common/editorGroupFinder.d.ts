import { EditorActivation } from "../../../../platform/editor/common/editor.js";
import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { type EditorInputWithOptions, type IUntypedEditorInput } from "../../../common/editor.js";
import { type IEditorGroup } from "./editorGroupsService.js";
import { type AUX_WINDOW_GROUP_TYPE, type PreferredGroup } from "./editorService.js";
/**
 * Finds the target `IEditorGroup` given the instructions provided
 * that is best for the editor and matches the preferred group if
 * possible.
 */
export declare function findGroup(accessor: ServicesAccessor, editor: IUntypedEditorInput, preferredGroup: Exclude<PreferredGroup, AUX_WINDOW_GROUP_TYPE> | undefined): [IEditorGroup, EditorActivation | undefined];
export declare function findGroup(accessor: ServicesAccessor, editor: EditorInputWithOptions, preferredGroup: Exclude<PreferredGroup, AUX_WINDOW_GROUP_TYPE> | undefined): [IEditorGroup, EditorActivation | undefined];
export declare function findGroup(accessor: ServicesAccessor, editor: EditorInputWithOptions | IUntypedEditorInput, preferredGroup: Exclude<PreferredGroup, AUX_WINDOW_GROUP_TYPE> | undefined): [IEditorGroup, EditorActivation | undefined];
export declare function findGroup(accessor: ServicesAccessor, editor: IUntypedEditorInput, preferredGroup: AUX_WINDOW_GROUP_TYPE): Promise<[IEditorGroup, EditorActivation | undefined]>;
export declare function findGroup(accessor: ServicesAccessor, editor: EditorInputWithOptions, preferredGroup: AUX_WINDOW_GROUP_TYPE): Promise<[IEditorGroup, EditorActivation | undefined]>;
export declare function findGroup(accessor: ServicesAccessor, editor: EditorInputWithOptions | IUntypedEditorInput, preferredGroup: AUX_WINDOW_GROUP_TYPE): Promise<[IEditorGroup, EditorActivation | undefined]>;
export declare function findGroup(accessor: ServicesAccessor, editor: EditorInputWithOptions | IUntypedEditorInput, preferredGroup: PreferredGroup | undefined): Promise<[IEditorGroup, EditorActivation | undefined]> | [IEditorGroup, EditorActivation | undefined];
