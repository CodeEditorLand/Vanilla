import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { ICommandHandler } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IFileDialogService, IOpenDialogOptions, ISaveDialogOptions } from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare namespace OpenLocalFileCommand {
    const ID = "workbench.action.files.openLocalFile";
    const LABEL: any;
    function handler(): ICommandHandler;
}
export declare namespace SaveLocalFileCommand {
    const ID = "workbench.action.files.saveLocalFile";
    const LABEL: any;
    function handler(): ICommandHandler;
}
export declare namespace OpenLocalFolderCommand {
    const ID = "workbench.action.files.openLocalFolder";
    const LABEL: any;
    function handler(): ICommandHandler;
}
export declare namespace OpenLocalFileFolderCommand {
    const ID = "workbench.action.files.openLocalFileFolder";
    const LABEL: any;
    function handler(): ICommandHandler;
}
export declare const RemoteFileDialogContext: any;
export interface ISimpleFileDialog {
    showOpenDialog(options: IOpenDialogOptions): Promise<URI | undefined>;
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
}
export declare class SimpleFileDialog implements ISimpleFileDialog {
    private readonly fileService;
    private readonly quickInputService;
    private readonly labelService;
    private readonly workspaceContextService;
    private readonly notificationService;
    private readonly fileDialogService;
    private readonly modelService;
    private readonly languageService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    private readonly remoteAgentService;
    protected readonly pathService: IPathService;
    private readonly keybindingService;
    private readonly accessibilityService;
    private options;
    private currentFolder;
    private filePickBox;
    private hidden;
    private allowFileSelection;
    private allowFolderSelection;
    private remoteAuthority;
    private requiresTrailing;
    private trailing;
    protected scheme: string;
    private contextKey;
    private userEnteredPathSegment;
    private autoCompletePathSegment;
    private activeItem;
    private userHome;
    private trueHome;
    private isWindows;
    private badPath;
    private remoteAgentEnvironment;
    private separator;
    private readonly onBusyChangeEmitter;
    private updatingPromise;
    protected disposables: IDisposable[];
    constructor(fileService: IFileService, quickInputService: IQuickInputService, labelService: ILabelService, workspaceContextService: IWorkspaceContextService, notificationService: INotificationService, fileDialogService: IFileDialogService, modelService: IModelService, languageService: ILanguageService, environmentService: IWorkbenchEnvironmentService, remoteAgentService: IRemoteAgentService, pathService: IPathService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, accessibilityService: IAccessibilityService);
    set busy(busy: boolean);
    get busy(): boolean;
    showOpenDialog(options?: IOpenDialogOptions): Promise<URI | undefined>;
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
    private getOptions;
    private remoteUriFrom;
    private getScheme;
    private getRemoteAgentEnvironment;
    protected getUserHome(trueHome?: boolean): Promise<URI>;
    private pickResource;
    private handleValueChange;
    private isBadSubpath;
    private isValueChangeFromUser;
    private isSelectionChangeFromUser;
    private constructFullUserPath;
    private filePickBoxValue;
    private onDidAccept;
    private root;
    private tildaReplace;
    private tryAddTrailingSeparatorToDirectory;
    private tryUpdateItems;
    private tryUpdateTrailing;
    private setActiveItems;
    private setAutoComplete;
    private insertText;
    private addPostfix;
    private trimTrailingSlash;
    private yesNoPrompt;
    private validate;
    private updateItems;
    private pathFromUri;
    private pathAppend;
    private checkIsWindowsOS;
    private endsWithSlash;
    private basenameWithTrailingSlash;
    private createBackItem;
    private createItems;
    private filterFile;
    private createItem;
}
