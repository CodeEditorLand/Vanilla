import { Disposable } from "vs/base/common/lifecycle";
import { ICommandHandler } from "vs/platform/commands/common/commands";
import { IResourceEditorInput, ITextResourceEditorInput } from "vs/platform/editor/common/editor";
import { GroupIdentifier, IEditorPane, IUntitledTextResourceEditorInput, IUntypedEditorInput } from "vs/workbench/common/editor";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { ACTIVE_GROUP_TYPE, AUX_WINDOW_GROUP_TYPE, IEditorService, SIDE_GROUP_TYPE } from "vs/workbench/services/editor/common/editorService";
export declare const inQuickPickContextKeyValue = "inQuickOpen";
export declare const InQuickPickContextKey: any;
export declare const inQuickPickContext: any;
export declare const defaultQuickAccessContextKeyValue = "inFilesPicker";
export declare const defaultQuickAccessContext: any;
export interface IWorkbenchQuickAccessConfiguration {
    readonly workbench: {
        readonly commandPalette: {
            readonly history: number;
            readonly preserveInput: boolean;
            readonly experimental: {
                readonly suggestCommands: boolean;
                readonly enableNaturalLanguageSearch: boolean;
                readonly askChatLocation: "quickChat" | "chatView";
            };
        };
        readonly quickOpen: {
            readonly enableExperimentalNewVersion: boolean;
            readonly preserveInput: boolean;
        };
    };
}
export declare function getQuickNavigateHandler(id: string, next?: boolean): ICommandHandler;
export declare class PickerEditorState extends Disposable {
    private readonly editorService;
    private readonly editorGroupsService;
    private _editorViewState;
    private readonly openedTransientEditors;
    constructor(editorService: IEditorService, editorGroupsService: IEditorGroupsService);
    set(): void;
    /**
     * Open a transient editor such that it may be closed when the state is restored.
     * Note that, when the state is restored, if the editor is no longer transient, it will not be closed.
     */
    openTransientEditor(editor: IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput | IUntypedEditorInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): Promise<IEditorPane | undefined>;
    restore(): Promise<void>;
    reset(): void;
    dispose(): void;
}
