import { type Dimension } from "../../../../base/browser/dom.js";
import { Action } from "../../../../base/common/actions.js";
import "./media/runtimeExtensionsEditor.css";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { type ExtensionIdentifier, type IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService, type ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import type { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionFeaturesManagementService } from "../../../services/extensionManagement/common/extensionFeatures.js";
import { IExtensionService, type IExtensionHostProfile, type IExtensionsStatus } from "../../../services/extensions/common/extensions.js";
import { IExtensionsWorkbenchService, type IExtension } from "../common/extensions.js";
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
