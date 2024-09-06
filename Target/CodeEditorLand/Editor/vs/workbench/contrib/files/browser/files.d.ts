import { URI } from "vs/base/common/uri";
import { ResourceFileEdit } from "vs/editor/browser/services/bulkEditService";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IListService } from "vs/platform/list/browser/listService";
import { ProgressLocation } from "vs/platform/progress/common/progress";
import { IEditorIdentifier } from "vs/workbench/common/editor";
import { IEditableData } from "vs/workbench/common/views";
import { ExplorerItem } from "vs/workbench/contrib/files/common/explorerModel";
import { ISortOrderConfiguration } from "vs/workbench/contrib/files/common/files";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export interface IExplorerService {
    readonly _serviceBrand: undefined;
    readonly roots: ExplorerItem[];
    readonly sortOrderConfiguration: ISortOrderConfiguration;
    getContext(respectMultiSelection: boolean, ignoreNestedChildren?: boolean): ExplorerItem[];
    hasViewFocus(): boolean;
    setEditable(stat: ExplorerItem, data: IEditableData | null): Promise<void>;
    getEditable(): {
        stat: ExplorerItem;
        data: IEditableData;
    } | undefined;
    getEditableData(stat: ExplorerItem): IEditableData | undefined;
    isEditable(stat: ExplorerItem | undefined): boolean;
    findClosest(resource: URI): ExplorerItem | null;
    findClosestRoot(resource: URI): ExplorerItem | null;
    refresh(): Promise<void>;
    setToCopy(stats: ExplorerItem[], cut: boolean): Promise<void>;
    isCut(stat: ExplorerItem): boolean;
    applyBulkEdit(edit: ResourceFileEdit[], options: {
        undoLabel: string;
        progressLabel: string;
        confirmBeforeUndo?: boolean;
        progressLocation?: ProgressLocation.Explorer | ProgressLocation.Window;
    }): Promise<void>;
    /**
     * Selects and reveal the file element provided by the given resource if its found in the explorer.
     * Will try to resolve the path in case the explorer is not yet expanded to the file yet.
     */
    select(resource: URI, reveal?: boolean | string): Promise<void>;
    registerView(contextAndRefreshProvider: IExplorerView): void;
}
export declare const IExplorerService: any;
export interface IExplorerView {
    autoReveal: boolean | "force" | "focusNoScroll";
    getContext(respectMultiSelection: boolean): ExplorerItem[];
    refresh(recursive: boolean, item?: ExplorerItem, cancelEditing?: boolean): Promise<void>;
    selectResource(resource: URI | undefined, reveal?: boolean | string, retry?: number): Promise<void>;
    setTreeInput(): Promise<void>;
    itemsCopied(tats: ExplorerItem[], cut: boolean, previousCut: ExplorerItem[] | undefined): void;
    setEditable(stat: ExplorerItem, isEditing: boolean): Promise<void>;
    isItemVisible(item: ExplorerItem): boolean;
    isItemCollapsed(item: ExplorerItem): boolean;
    hasFocus(): boolean;
    getFocus(): ExplorerItem[];
    focusNext(): void;
    focusLast(): void;
}
export declare function getResourceForCommand(commandArg: unknown, editorService: IEditorService, listService: IListService): URI | undefined;
export declare function getMultiSelectedResources(commandArg: unknown, listService: IListService, editorSerice: IEditorService, editorGroupService: IEditorGroupsService, explorerService: IExplorerService): Array<URI>;
export declare function getOpenEditorsViewMultiSelection(accessor: ServicesAccessor): Array<IEditorIdentifier> | undefined;
