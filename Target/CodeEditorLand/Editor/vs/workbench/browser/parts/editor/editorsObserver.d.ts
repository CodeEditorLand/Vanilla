import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IResourceEditorInputIdentifier } from "vs/platform/editor/common/editor";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IEditorIdentifier } from "vs/workbench/common/editor";
import { IEditorGroupsContainer, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
/**
 * A observer of opened editors across all editor groups by most recently used.
 * Rules:
 * - the last editor in the list is the one most recently activated
 * - the first editor in the list is the one that was activated the longest time ago
 * - an editor that opens inactive will be placed behind the currently active editor
 *
 * The observer may start to close editors based on the workbench.editor.limit setting.
 */
export declare class EditorsObserver extends Disposable {
    private editorGroupService;
    private readonly storageService;
    private static readonly STORAGE_KEY;
    private readonly keyMap;
    private readonly mostRecentEditorsMap;
    private readonly editorsPerResourceCounter;
    private readonly _onDidMostRecentlyActiveEditorsChange;
    readonly onDidMostRecentlyActiveEditorsChange: any;
    get count(): number;
    get editors(): IEditorIdentifier[];
    hasEditor(editor: IResourceEditorInputIdentifier): boolean;
    hasEditors(resource: URI): boolean;
    private toIdentifier;
    private readonly editorGroupsContainer;
    private readonly isScoped;
    constructor(editorGroupsContainer: IEditorGroupsContainer | undefined, editorGroupService: IEditorGroupsService, storageService: IStorageService);
    private registerListeners;
    private onGroupAdded;
    private registerGroupListeners;
    private onDidChangeEditorPartOptions;
    private addMostRecentEditor;
    private updateEditorResourcesMap;
    private removeMostRecentEditor;
    private findKey;
    private ensureKey;
    private ensureOpenedEditorsLimit;
    private doEnsureOpenedEditorsLimit;
    private saveState;
    private serialize;
    private loadState;
    private deserialize;
}
