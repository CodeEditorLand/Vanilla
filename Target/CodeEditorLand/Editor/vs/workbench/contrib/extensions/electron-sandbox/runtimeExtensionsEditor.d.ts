import { Action } from '../../../../base/common/actions.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IExtensionsWorkbenchService } from '../common/extensions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IExtensionService, IExtensionHostProfile } from '../../../services/extensions/common/extensions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { Event } from '../../../../base/common/event.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { AbstractRuntimeExtensionsEditor, IRuntimeExtension } from '../browser/abstractRuntimeExtensionsEditor.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IExtensionFeaturesManagementService } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare const IExtensionHostProfileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionHostProfileService>;
export declare const CONTEXT_PROFILE_SESSION_STATE: RawContextKey<string>;
export declare const CONTEXT_EXTENSION_HOST_PROFILE_RECORDED: RawContextKey<boolean>;
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
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, _extensionHostProfileService: IExtensionHostProfileService);
    run(): Promise<any>;
}
export declare class StopExtensionHostProfileAction extends Action {
    private readonly _extensionHostProfileService;
    static readonly ID = "workbench.extensions.action.stopExtensionHostProfile";
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, _extensionHostProfileService: IExtensionHostProfileService);
    run(): Promise<any>;
}
export declare class SaveExtensionHostProfileAction extends Action {
    private readonly _environmentService;
    private readonly _extensionHostProfileService;
    private readonly _fileService;
    private readonly _fileDialogService;
    static readonly LABEL: string;
    static readonly ID = "workbench.extensions.action.saveExtensionHostProfile";
    constructor(id: string | undefined, label: string | undefined, _environmentService: IWorkbenchEnvironmentService, _extensionHostProfileService: IExtensionHostProfileService, _fileService: IFileService, _fileDialogService: IFileDialogService);
    run(): Promise<any>;
    private _asyncRun;
}
