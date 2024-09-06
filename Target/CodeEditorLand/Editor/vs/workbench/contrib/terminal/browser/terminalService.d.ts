import { DynamicListEventMultiplexer, Event, IDynamicListEventMultiplexer } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { ITerminalCapabilityImplMap, TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { ICreateContributedTerminalProfileOptions, ITerminalBackend, ITerminalLaunchError, ITerminalLogService, TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { IEditableData } from "../../../common/views.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP_TYPE, AUX_WINDOW_GROUP_TYPE, SIDE_GROUP_TYPE } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { ITimerService } from "../../../services/timer/browser/timerService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IRemoteTerminalAttachTarget, IStartExtensionTerminalRequest, ITerminalProcessExtHostProxy, ITerminalProfileService } from "../common/terminal.js";
import { ICreateTerminalOptions, IDetachedTerminalInstance, IDetachedXTermOptions, ITerminalConfigurationService, ITerminalEditorService, ITerminalGroup, ITerminalGroupService, ITerminalInstance, ITerminalInstanceHost, ITerminalInstanceService, ITerminalLocationOptions, ITerminalService, ITerminalServiceNativeDelegate, TerminalConnectionState } from "./terminal.js";
export declare class TerminalService extends Disposable implements ITerminalService {
    private _contextKeyService;
    private readonly _lifecycleService;
    private readonly _logService;
    private _dialogService;
    private _instantiationService;
    private _remoteAgentService;
    private _viewsService;
    private readonly _configurationService;
    private readonly _terminalConfigService;
    private readonly _environmentService;
    private readonly _terminalConfigurationService;
    private readonly _terminalEditorService;
    private readonly _terminalGroupService;
    private readonly _terminalInstanceService;
    private readonly _editorGroupsService;
    private readonly _terminalProfileService;
    private readonly _extensionService;
    private readonly _notificationService;
    private readonly _workspaceContextService;
    private readonly _commandService;
    private readonly _keybindingService;
    private readonly _timerService;
    _serviceBrand: undefined;
    private _hostActiveTerminals;
    private _detachedXterms;
    private _terminalEditorActive;
    private readonly _terminalShellTypeContextKey;
    private _isShuttingDown;
    private _backgroundedTerminalInstances;
    private _backgroundedTerminalDisposables;
    private _processSupportContextKey;
    private _primaryBackend?;
    private _terminalHasBeenCreated;
    private _terminalCountContextKey;
    private _nativeDelegate?;
    private _shutdownWindowCount?;
    private _editable;
    get isProcessSupportRegistered(): boolean;
    private _connectionState;
    get connectionState(): TerminalConnectionState;
    private readonly _whenConnected;
    get whenConnected(): Promise<void>;
    private _restoredGroupCount;
    get restoredGroupCount(): number;
    get instances(): ITerminalInstance[];
    get detachedInstances(): Iterable<IDetachedTerminalInstance>;
    private _reconnectedTerminalGroups;
    private _reconnectedTerminals;
    getReconnectedTerminals(reconnectionOwner: string): ITerminalInstance[] | undefined;
    get defaultLocation(): TerminalLocation;
    private _activeInstance;
    get activeInstance(): ITerminalInstance | undefined;
    private _editingTerminal;
    private readonly _onDidCreateInstance;
    get onDidCreateInstance(): Event<ITerminalInstance>;
    private readonly _onDidChangeInstanceDimensions;
    get onDidChangeInstanceDimensions(): Event<ITerminalInstance>;
    private readonly _onDidRegisterProcessSupport;
    get onDidRegisterProcessSupport(): Event<void>;
    private readonly _onDidChangeConnectionState;
    get onDidChangeConnectionState(): Event<void>;
    private readonly _onDidRequestStartExtensionTerminal;
    get onDidRequestStartExtensionTerminal(): Event<IStartExtensionTerminalRequest>;
    private readonly _onDidDisposeInstance;
    get onDidDisposeInstance(): Event<ITerminalInstance>;
    private readonly _onDidFocusInstance;
    get onDidFocusInstance(): Event<ITerminalInstance>;
    private readonly _onDidChangeActiveInstance;
    get onDidChangeActiveInstance(): Event<ITerminalInstance | undefined>;
    private readonly _onDidChangeInstances;
    get onDidChangeInstances(): Event<void>;
    private readonly _onDidChangeInstanceCapability;
    get onDidChangeInstanceCapability(): Event<ITerminalInstance>;
    private readonly _onDidChangeActiveGroup;
    get onDidChangeActiveGroup(): Event<ITerminalGroup | undefined>;
    get onAnyInstanceData(): Event<{
        instance: ITerminalInstance;
        data: string;
    }>;
    get onAnyInstanceDataInput(): Event<ITerminalInstance>;
    get onAnyInstanceIconChange(): Event<{
        instance: ITerminalInstance;
        userInitiated: boolean;
    }>;
    get onAnyInstanceMaximumDimensionsChange(): Event<ITerminalInstance>;
    get onAnyInstancePrimaryStatusChange(): Event<ITerminalInstance>;
    get onAnyInstanceProcessIdReady(): Event<ITerminalInstance>;
    get onAnyInstanceSelectionChange(): Event<ITerminalInstance>;
    get onAnyInstanceTitleChange(): Event<ITerminalInstance>;
    constructor(_contextKeyService: IContextKeyService, _lifecycleService: ILifecycleService, _logService: ITerminalLogService, _dialogService: IDialogService, _instantiationService: IInstantiationService, _remoteAgentService: IRemoteAgentService, _viewsService: IViewsService, _configurationService: IConfigurationService, _terminalConfigService: ITerminalConfigurationService, _environmentService: IWorkbenchEnvironmentService, _terminalConfigurationService: ITerminalConfigurationService, _terminalEditorService: ITerminalEditorService, _terminalGroupService: ITerminalGroupService, _terminalInstanceService: ITerminalInstanceService, _editorGroupsService: IEditorGroupsService, _terminalProfileService: ITerminalProfileService, _extensionService: IExtensionService, _notificationService: INotificationService, _workspaceContextService: IWorkspaceContextService, _commandService: ICommandService, _keybindingService: IKeybindingService, _timerService: ITimerService);
    showProfileQuickPick(type: "setDefault" | "createInstance", cwd?: string | URI): Promise<ITerminalInstance | undefined>;
    private _initializePrimaryBackend;
    getPrimaryBackend(): ITerminalBackend | undefined;
    private _forwardInstanceHostEvents;
    private _evaluateActiveInstance;
    setActiveInstance(value: ITerminalInstance): void;
    focusInstance(instance: ITerminalInstance): Promise<void>;
    focusActiveInstance(): Promise<void>;
    createContributedTerminalProfile(extensionIdentifier: string, id: string, options: ICreateContributedTerminalProfileOptions): Promise<void>;
    safeDisposeTerminal(instance: ITerminalInstance): Promise<void>;
    private _setConnected;
    private _reconnectToRemoteTerminals;
    private _reconnectToLocalTerminals;
    private _recreateTerminalGroups;
    private _recreateTerminalGroup;
    private _attachProcessLayoutListeners;
    private _handleInstanceContextKeys;
    getActiveOrCreateInstance(options?: {
        acceptsInput?: boolean;
    }): Promise<ITerminalInstance>;
    revealTerminal(source: ITerminalInstance, preserveFocus?: boolean): Promise<void>;
    revealActiveTerminal(preserveFocus?: boolean): Promise<void>;
    setEditable(instance: ITerminalInstance, data?: IEditableData | null): void;
    isEditable(instance: ITerminalInstance | undefined): boolean;
    getEditableData(instance: ITerminalInstance): IEditableData | undefined;
    requestStartExtensionTerminal(proxy: ITerminalProcessExtHostProxy, cols: number, rows: number): Promise<ITerminalLaunchError | undefined>;
    private _onBeforeShutdown;
    private _onBeforeShutdownAsync;
    setNativeDelegate(nativeDelegate: ITerminalServiceNativeDelegate): void;
    private _shouldReviveProcesses;
    private _onBeforeShutdownConfirmation;
    private _onWillShutdown;
    private _saveState;
    private _updateTitle;
    private _updateIcon;
    refreshActiveGroup(): void;
    getInstanceFromId(terminalId: number): ITerminalInstance | undefined;
    getInstanceFromIndex(terminalIndex: number): ITerminalInstance;
    getInstanceFromResource(resource: URI | undefined): ITerminalInstance | undefined;
    isAttachedToTerminal(remoteTerm: IRemoteTerminalAttachTarget): boolean;
    moveToEditor(source: ITerminalInstance, group?: GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): void;
    moveIntoNewEditor(source: ITerminalInstance): void;
    moveToTerminalView(source?: ITerminalInstance | URI, target?: ITerminalInstance, side?: "before" | "after"): Promise<void>;
    protected _initInstanceListeners(instance: ITerminalInstance): void;
    private _addInstanceToGroup;
    registerProcessSupport(isSupported: boolean): void;
    private _getIndexFromId;
    protected _showTerminalCloseConfirmation(singleTerminal?: boolean): Promise<boolean>;
    getDefaultInstanceHost(): ITerminalInstanceHost;
    getInstanceHost(location: ITerminalLocationOptions | undefined): Promise<ITerminalInstanceHost>;
    createTerminal(options?: ICreateTerminalOptions): Promise<ITerminalInstance>;
    private _getContributedProfile;
    createDetachedTerminal(options: IDetachedXTermOptions): Promise<IDetachedTerminalInstance>;
    private _resolveCwd;
    private _splitTerminal;
    private _addToReconnected;
    private _createTerminal;
    resolveLocation(location?: ITerminalLocationOptions): Promise<TerminalLocation | undefined>;
    private _getSplitParent;
    private _getEditorOptions;
    private _evaluateLocalCwd;
    protected _showBackgroundTerminal(instance: ITerminalInstance): void;
    setContainers(panelContainer: HTMLElement, terminalContainer: HTMLElement): Promise<void>;
    getEditingTerminal(): ITerminalInstance | undefined;
    setEditingTerminal(instance: ITerminalInstance | undefined): void;
    createOnInstanceEvent<T>(getEvent: (instance: ITerminalInstance) => Event<T>): DynamicListEventMultiplexer<ITerminalInstance, T>;
    createOnInstanceCapabilityEvent<T extends TerminalCapability, K>(capabilityId: T, getEvent: (capability: ITerminalCapabilityImplMap[T]) => Event<K>): IDynamicListEventMultiplexer<{
        instance: ITerminalInstance;
        data: K;
    }>;
}
