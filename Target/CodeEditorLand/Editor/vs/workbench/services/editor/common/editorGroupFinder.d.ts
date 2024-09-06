import { EditorActivation } from "vs/platform/editor/common/editor";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { EditorInputWithOptions, IUntypedEditorInput } from "vs/workbench/common/editor";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
import { AUX_WINDOW_GROUP_TYPE, PreferredGroup } from "vs/workbench/services/editor/common/editorService";
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
