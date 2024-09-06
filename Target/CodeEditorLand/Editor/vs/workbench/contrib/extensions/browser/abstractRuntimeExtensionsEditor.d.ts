import { Dimension } from "vs/base/browser/dom";
import { Action } from "vs/base/common/actions";
import "vs/css!./media/runtimeExtensionsEditor";
import { Action2 } from "vs/platform/actions/common/actions";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { ExtensionIdentifier, IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { EditorPane } from "vs/workbench/browser/parts/editor/editorPane";
import { IExtension, IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionFeaturesManagementService } from "vs/workbench/services/extensionManagement/common/extensionFeatures";
import { IExtensionHostProfile, IExtensionService, IExtensionsStatus } from "vs/workbench/services/extensions/common/extensions";
interface IExtensionProfileInformation {
    /**
     * segment when the extension was running.
     * 2*i = segment start time
     * 2*i+1 = segment end time
     */
    segments: number[];
    /**
     * total time when the extension was running.
     * (sum of all segment lengths).
     */
    totalTime: number;
}
export interface IRuntimeExtension {
    originalIndex: number;
    description: IExtensionDescription;
    marketplaceInfo: IExtension | undefined;
    status: IExtensionsStatus;
    profileInfo?: IExtensionProfileInformation;
    unresponsiveProfile?: IExtensionHostProfile;
}
export declare abstract class AbstractRuntimeExtensionsEditor extends EditorPane {
    private readonly _extensionsWorkbenchService;
    private readonly _extensionService;
    private readonly _notificationService;
    private readonly _contextMenuService;
    protected readonly _instantiationService: IInstantiationService;
    private readonly _labelService;
    private readonly _environmentService;
    private readonly _clipboardService;
    private readonly _extensionFeaturesManagementService;
    private readonly _hoverService;
    static readonly ID: string;
    private _list;
    private _elements;
    private _updateSoon;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, contextKeyService: IContextKeyService, _extensionsWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _notificationService: INotificationService, _contextMenuService: IContextMenuService, _instantiationService: IInstantiationService, storageService: IStorageService, _labelService: ILabelService, _environmentService: IWorkbenchEnvironmentService, _clipboardService: IClipboardService, _extensionFeaturesManagementService: IExtensionFeaturesManagementService, _hoverService: IHoverService);
    protected _updateExtensions(): Promise<void>;
    private _resolveExtensions;
    protected createEditor(parent: HTMLElement): void;
    private get saveExtensionHostProfileAction();
    layout(dimension: Dimension): void;
    protected abstract _getProfileInfo(): IExtensionHostProfile | null;
    protected abstract _getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    protected abstract _createSlowExtensionAction(element: IRuntimeExtension): Action | null;
    protected abstract _createReportExtensionIssueAction(element: IRuntimeExtension): Action | null;
    protected abstract _createSaveExtensionHostProfileAction(): Action | null;
    protected abstract _createProfileAction(): Action | null;
}
export declare class ShowRuntimeExtensionsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export {};
