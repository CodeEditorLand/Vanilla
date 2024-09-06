import { Action } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IFileService } from "vs/platform/files/common/files";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { AbstractRuntimeExtensionsEditor, IRuntimeExtension } from "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionFeaturesManagementService } from "vs/workbench/services/extensionManagement/common/extensionFeatures";
import { IExtensionHostProfile, IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare const IExtensionHostProfileService: any;
export declare const CONTEXT_PROFILE_SESSION_STATE: any;
export declare const CONTEXT_EXTENSION_HOST_PROFILE_RECORDED: any;
export declare enum ProfileSessionState {
    None = 0,
    Starting = 1,
    Running = 2,
    Stopping = 3
}
export interface IExtensionHostProfileService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeState: Event<void>;
    readonly onDidChangeLastProfile: Event<void>;
    readonly state: ProfileSessionState;
    readonly lastProfile: IExtensionHostProfile | null;
    startProfiling(): void;
    stopProfiling(): void;
    getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    setUnresponsiveProfile(extensionId: ExtensionIdentifier, profile: IExtensionHostProfile): void;
}
export declare class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    private readonly _extensionHostProfileService;
    private _profileInfo;
    private _extensionsHostRecorded;
    private _profileSessionState;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, contextKeyService: IContextKeyService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, notificationService: INotificationService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, storageService: IStorageService, labelService: ILabelService, environmentService: IWorkbenchEnvironmentService, clipboardService: IClipboardService, _extensionHostProfileService: IExtensionHostProfileService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, hoverService: IHoverService);
    protected _getProfileInfo(): IExtensionHostProfile | null;
    protected _getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    protected _createSlowExtensionAction(element: IRuntimeExtension): Action | null;
    protected _createReportExtensionIssueAction(element: IRuntimeExtension): Action | null;
    protected _createSaveExtensionHostProfileAction(): Action | null;
    protected _createProfileAction(): Action | null;
}
export declare class StartExtensionHostProfileAction extends Action {
    private readonly _extensionHostProfileService;
    static readonly ID = "workbench.extensions.action.extensionHostProfile";
    static readonly LABEL: any;
    constructor(id: string | undefined, label: string | undefined, _extensionHostProfileService: IExtensionHostProfileService);
    run(): Promise<any>;
}
export declare class StopExtensionHostProfileAction extends Action {
    private readonly _extensionHostProfileService;
    static readonly ID = "workbench.extensions.action.stopExtensionHostProfile";
    static readonly LABEL: any;
    constructor(id: string | undefined, label: string | undefined, _extensionHostProfileService: IExtensionHostProfileService);
    run(): Promise<any>;
}
export declare class SaveExtensionHostProfileAction extends Action {
    private readonly _environmentService;
    private readonly _extensionHostProfileService;
    private readonly _fileService;
    private readonly _fileDialogService;
    static readonly LABEL: any;
    static readonly ID = "workbench.extensions.action.saveExtensionHostProfile";
    constructor(id: string | undefined, label: string | undefined, _environmentService: IWorkbenchEnvironmentService, _extensionHostProfileService: IExtensionHostProfileService, _fileService: IFileService, _fileDialogService: IFileDialogService);
    run(): Promise<any>;
    private _asyncRun;
}
