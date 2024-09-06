import { Action } from "vs/base/common/actions";
import { OperatingSystem } from "vs/base/common/platform";
import { URI } from "vs/base/common/uri";
import { ILocalizedString } from "vs/platform/action/common/action";
import { Action2 } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { INotificationService, Severity } from "vs/platform/notification/common/notification";
import { IExplorerService } from "vs/workbench/contrib/files/browser/files";
import { ExplorerItem } from "vs/workbench/contrib/files/common/explorerModel";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { IWorkingCopyService } from "vs/workbench/services/workingCopy/common/workingCopyService";
export declare const NEW_FILE_COMMAND_ID = "explorer.newFile";
export declare const NEW_FILE_LABEL: any;
export declare const NEW_FOLDER_COMMAND_ID = "explorer.newFolder";
export declare const NEW_FOLDER_LABEL: any;
export declare const TRIGGER_RENAME_LABEL: any;
export declare const MOVE_FILE_TO_TRASH_LABEL: any;
export declare const COPY_FILE_LABEL: any;
export declare const PASTE_FILE_LABEL: any;
export declare const FileCopiedContext: any;
export declare const DOWNLOAD_COMMAND_ID = "explorer.download";
export declare const DOWNLOAD_LABEL: any;
export declare const UPLOAD_COMMAND_ID = "explorer.upload";
export declare const UPLOAD_LABEL: any;
export declare function findValidPasteFileTarget(explorerService: IExplorerService, fileService: IFileService, dialogService: IDialogService, targetFolder: ExplorerItem, fileToPaste: {
    resource: URI | string;
    isDirectory?: boolean;
    allowOverwrite: boolean;
}, incrementalNaming: "simple" | "smart" | "disabled"): Promise<URI | undefined>;
export declare function incrementFileName(name: string, isFolder: boolean, incrementalNaming: "simple" | "smart"): string;
export declare class GlobalCompareResourcesAction extends Action2 {
    static readonly ID = "workbench.files.action.compareFileWith";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleAutoSaveAction extends Action2 {
    static readonly ID = "workbench.action.toggleAutoSave";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class BaseSaveAllAction extends Action {
    protected commandService: ICommandService;
    private notificationService;
    private readonly workingCopyService;
    private lastDirtyState;
    constructor(id: string, label: string, commandService: ICommandService, notificationService: INotificationService, workingCopyService: IWorkingCopyService);
    protected abstract doRun(context: unknown): Promise<void>;
    private registerListeners;
    private updateEnablement;
    run(context?: unknown): Promise<void>;
}
export declare class SaveAllInGroupAction extends BaseSaveAllAction {
    static readonly ID = "workbench.files.action.saveAllInGroup";
    static readonly LABEL: any;
    get class(): string;
    protected doRun(context: unknown): Promise<void>;
}
export declare class CloseGroupAction extends Action {
    private readonly commandService;
    static readonly ID = "workbench.files.action.closeGroup";
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(context?: unknown): Promise<void>;
}
export declare class FocusFilesExplorer extends Action2 {
    static readonly ID = "workbench.files.action.focusFilesExplorer";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowActiveFileInExplorer extends Action2 {
    static readonly ID = "workbench.files.action.showActiveFileInExplorer";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenActiveFileInEmptyWorkspace extends Action2 {
    static readonly ID = "workbench.action.files.showOpenedFileInNewWindow";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare function validateFileName(pathService: IPathService, item: ExplorerItem, name: string, os: OperatingSystem): {
    content: string;
    severity: Severity;
} | null;
export declare class CompareNewUntitledTextFilesAction extends Action2 {
    static readonly ID = "workbench.files.action.compareNewUntitledTextFiles";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class CompareWithClipboardAction extends Action2 {
    static readonly ID = "workbench.files.action.compareWithClipboard";
    static readonly LABEL: any;
    private registrationDisposal;
    private static SCHEME_COUNTER;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    dispose(): void;
}
export declare const renameHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const moveFileToTrashHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const deleteFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const copyFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const cutFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const pasteFileHandler: (accessor: ServicesAccessor, fileList?: FileList) => Promise<void>;
export declare const openFilePreserveFocusHandler: (accessor: ServicesAccessor) => Promise<void>;
declare class BaseSetActiveEditorReadonlyInSession extends Action2 {
    private readonly newReadonlyState;
    constructor(id: string, title: ILocalizedString, newReadonlyState: true | false | "toggle" | "reset");
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.setActiveEditorReadonlyInSession";
    static readonly LABEL: any;
    constructor();
}
export declare class SetActiveEditorWriteableInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.setActiveEditorWriteableInSession";
    static readonly LABEL: any;
    constructor();
}
export declare class ToggleActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.toggleActiveEditorReadonlyInSession";
    static readonly LABEL: any;
    constructor();
}
export declare class ResetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.resetActiveEditorReadonlyInSession";
    static readonly LABEL: any;
    constructor();
}
export {};
