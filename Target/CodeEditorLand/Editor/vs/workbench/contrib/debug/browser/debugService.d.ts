import { Event } from "../../../../base/common/event.js";
import { URI as uri } from "../../../../base/common/uri.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionHostDebugService } from "../../../../platform/debug/common/extensionHostDebug.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IActivityService } from "../../../services/activity/common/activity.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ITestService } from "../../testing/common/testService.js";
import { IAdapterManager, IBreakpoint, IBreakpointData, IBreakpointUpdateData, IConfig, IConfigurationManager, IDebugModel, IDebugService, IDebugSession, IDebugSessionOptions, IEnablement, IExceptionBreakpoint, ILaunch, IStackFrame, IThread, IViewModel, State } from "../common/debug.js";
import { IDataBreakpointOptions, IFunctionBreakpointOptions, IInstructionBreakpointOptions } from "../common/debugModel.js";
export declare class DebugService implements IDebugService {
    private readonly editorService;
    private readonly paneCompositeService;
    private readonly viewsService;
    private readonly viewDescriptorService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly layoutService;
    private readonly contextService;
    private readonly contextKeyService;
    private readonly lifecycleService;
    private readonly instantiationService;
    private readonly extensionService;
    private readonly fileService;
    private readonly configurationService;
    private readonly extensionHostDebugService;
    private readonly activityService;
    private readonly commandService;
    private readonly quickInputService;
    private readonly workspaceTrustRequestService;
    private readonly uriIdentityService;
    private readonly testService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeState;
    private readonly _onDidNewSession;
    private readonly _onWillNewSession;
    private readonly _onDidEndSession;
    private readonly restartingSessions;
    private debugStorage;
    private model;
    private viewModel;
    private telemetry;
    private taskRunner;
    private configurationManager;
    private adapterManager;
    private readonly disposables;
    private debugType;
    private debugState;
    private inDebugMode;
    private debugUx;
    private hasDebugged;
    private breakpointsExist;
    private disassemblyViewFocus;
    private breakpointsToSendOnResourceSaved;
    private initializing;
    private _initializingOptions;
    private previousState;
    private sessionCancellationTokens;
    private activity;
    private chosenEnvironments;
    private haveDoneLazySetup;
    constructor(editorService: IEditorService, paneCompositeService: IPaneCompositePartService, viewsService: IViewsService, viewDescriptorService: IViewDescriptorService, notificationService: INotificationService, dialogService: IDialogService, layoutService: IWorkbenchLayoutService, contextService: IWorkspaceContextService, contextKeyService: IContextKeyService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, extensionService: IExtensionService, fileService: IFileService, configurationService: IConfigurationService, extensionHostDebugService: IExtensionHostDebugService, activityService: IActivityService, commandService: ICommandService, quickInputService: IQuickInputService, workspaceTrustRequestService: IWorkspaceTrustRequestService, uriIdentityService: IUriIdentityService, testService: ITestService);
    private initContextKeys;
    getModel(): IDebugModel;
    getViewModel(): IViewModel;
    getConfigurationManager(): IConfigurationManager;
    getAdapterManager(): IAdapterManager;
    sourceIsNotAvailable(uri: uri): void;
    dispose(): void;
    get state(): State;
    get initializingOptions(): IDebugSessionOptions | undefined;
    private startInitializingState;
    private endInitializingState;
    private cancelTokens;
    private onStateChange;
    get onDidChangeState(): Event<State>;
    get onDidNewSession(): Event<IDebugSession>;
    get onWillNewSession(): Event<IDebugSession>;
    get onDidEndSession(): Event<{
        session: IDebugSession;
        restart: boolean;
    }>;
    private lazySetup;
    /**
     * main entry point
     * properly manages compounds, checks for errors and handles the initializing state.
     */
    startDebugging(launch: ILaunch | undefined, configOrName?: IConfig | string, options?: IDebugSessionOptions, saveBeforeStart?: boolean): Promise<boolean>;
    /**
     * gets the debugger for the type, resolves configurations by providers, substitutes variables and runs prelaunch tasks
     */
    private createSession;
    /**
     * instantiates the new session, initializes the session, registers session listeners and reports telemetry
     */
    private doCreateSession;
    private launchOrAttachToSession;
    private registerSessionListeners;
    restartSession(session: IDebugSession, restartData?: any): Promise<any>;
    stopSession(session: IDebugSession | undefined, disconnect?: boolean, suspend?: boolean): Promise<any>;
    private substituteVariables;
    private showError;
    focusStackFrame(_stackFrame: IStackFrame | undefined, _thread?: IThread, _session?: IDebugSession, options?: {
        explicit?: boolean;
        preserveFocus?: boolean;
        sideBySide?: boolean;
        pinned?: boolean;
    }): Promise<void>;
    addWatchExpression(name?: string): void;
    renameWatchExpression(id: string, newName: string): void;
    moveWatchExpression(id: string, position: number): void;
    removeWatchExpressions(id?: string): void;
    canSetBreakpointsIn(model: ITextModel): boolean;
    enableOrDisableBreakpoints(enable: boolean, breakpoint?: IEnablement): Promise<void>;
    addBreakpoints(uri: uri, rawBreakpoints: IBreakpointData[], ariaAnnounce?: boolean): Promise<IBreakpoint[]>;
    updateBreakpoints(uri: uri, data: Map<string, IBreakpointUpdateData>, sendOnResourceSaved: boolean): Promise<void>;
    removeBreakpoints(id?: string): Promise<void>;
    setBreakpointsActivated(activated: boolean): Promise<void>;
    addFunctionBreakpoint(opts?: IFunctionBreakpointOptions, id?: string): Promise<void>;
    updateFunctionBreakpoint(id: string, update: {
        name?: string;
        hitCondition?: string;
        condition?: string;
    }): Promise<void>;
    removeFunctionBreakpoints(id?: string): Promise<void>;
    addDataBreakpoint(opts: IDataBreakpointOptions): Promise<void>;
    updateDataBreakpoint(id: string, update: {
        hitCondition?: string;
        condition?: string;
    }): Promise<void>;
    removeDataBreakpoints(id?: string): Promise<void>;
    addInstructionBreakpoint(opts: IInstructionBreakpointOptions): Promise<void>;
    removeInstructionBreakpoints(instructionReference?: string, offset?: number): Promise<void>;
    setExceptionBreakpointFallbackSession(sessionId: string): void;
    setExceptionBreakpointsForSession(session: IDebugSession, filters: DebugProtocol.ExceptionBreakpointsFilter[]): void;
    setExceptionBreakpointCondition(exceptionBreakpoint: IExceptionBreakpoint, condition: string | undefined): Promise<void>;
    sendAllBreakpoints(session?: IDebugSession): Promise<any>;
    /**
     * Removes the condition of triggered breakpoints that depended on
     * breakpoints in `removedBreakpoints`. Returns the URIs of resources that
     * had their breakpoints changed in this way.
     */
    private unlinkTriggeredBreakpoints;
    private makeTriggeredBreakpointsMatchEnablement;
    sendBreakpoints(modelUri: uri, sourceModified?: boolean, session?: IDebugSession): Promise<void>;
    private sendFunctionBreakpoints;
    private sendDataBreakpoints;
    private sendInstructionBreakpoints;
    private sendExceptionBreakpoints;
    private onFileChanges;
    runTo(uri: uri, lineNumber: number, column?: number): Promise<void>;
    private addAndValidateBreakpoints;
}
export declare function getStackFrameThreadAndSessionToFocus(model: IDebugModel, stackFrame: IStackFrame | undefined, thread?: IThread, session?: IDebugSession, avoidSession?: IDebugSession): {
    stackFrame: IStackFrame | undefined;
    thread: IThread | undefined;
    session: IDebugSession | undefined;
};
