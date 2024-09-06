import { URI } from "vs/base/common/uri";
import { ITextEditorOptions } from "vs/platform/editor/common/editor";
import { ExtensionKind, IExtensionHostDebugParams } from "vs/platform/environment/common/environment";
import { IProductService } from "vs/platform/product/common/productService";
import { IPath } from "vs/platform/window/common/window";
import { IWorkbenchConstructionOptions } from "vs/workbench/browser/web.api";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare const IBrowserWorkbenchEnvironmentService: any;
/**
 * A subclass of the `IWorkbenchEnvironmentService` to be used only environments
 * where the web API is available (browsers, Electron).
 */
export interface IBrowserWorkbenchEnvironmentService extends IWorkbenchEnvironmentService {
    /**
     * Options used to configure the workbench.
     */
    readonly options?: IWorkbenchConstructionOptions;
    /**
     * Gets whether a resolver extension is expected for the environment.
     */
    readonly expectsResolverExtension: boolean;
}
export declare class BrowserWorkbenchEnvironmentService implements IBrowserWorkbenchEnvironmentService {
    private readonly workspaceId;
    readonly logsHome: URI;
    readonly options: IWorkbenchConstructionOptions;
    private readonly productService;
    readonly _serviceBrand: undefined;
    get remoteAuthority(): string | undefined;
    get expectsResolverExtension(): boolean;
    get isBuilt(): boolean;
    get logLevel(): string | undefined;
    get extensionLogLevel(): [string, string][] | undefined;
    get profDurationMarkers(): string[] | undefined;
    get windowLogsPath(): URI;
    get logFile(): URI;
    get userRoamingDataHome(): URI;
    get argvResource(): URI;
    get cacheHome(): URI;
    get workspaceStorageHome(): URI;
    get localHistoryHome(): URI;
    get stateResource(): URI;
    /**
     * In Web every workspace can potentially have scoped user-data
     * and/or extensions and if Sync state is shared then it can make
     * Sync error prone - say removing extensions from another workspace.
     * Hence scope Sync state per workspace. Sync scoped to a workspace
     * is capable of handling opening same workspace in multiple windows.
     */
    get userDataSyncHome(): URI;
    get sync(): "on" | "off" | undefined;
    get keyboardLayoutResource(): URI;
    get untitledWorkspacesHome(): URI;
    get serviceMachineIdResource(): URI;
    get extHostLogsPath(): URI;
    get extHostTelemetryLogFile(): URI;
    private extensionHostDebugEnvironment;
    get debugExtensionHost(): IExtensionHostDebugParams;
    get isExtensionDevelopment(): boolean;
    get extensionDevelopmentLocationURI(): URI[] | undefined;
    get extensionDevelopmentLocationKind(): ExtensionKind[] | undefined;
    get extensionTestsLocationURI(): URI | undefined;
    get extensionEnabledProposedApi(): string[] | undefined;
    get debugRenderer(): boolean;
    get enableSmokeTestDriver(): any;
    get disableExtensions(): boolean;
    get enableExtensions(): any;
    get webviewExternalEndpoint(): string;
    get extensionTelemetryLogResource(): URI;
    get disableTelemetry(): boolean;
    get verbose(): boolean;
    get logExtensionHostCommunication(): boolean;
    get skipReleaseNotes(): boolean;
    get skipWelcome(): boolean;
    get disableWorkspaceTrust(): boolean;
    get profile(): string | undefined;
    editSessionId: string | undefined;
    private payload;
    constructor(workspaceId: string, logsHome: URI, options: IWorkbenchConstructionOptions, productService: IProductService);
    private resolveExtensionHostDebugEnvironment;
    get filesToOpenOrCreate(): IPath<ITextEditorOptions>[] | undefined;
    get filesToDiff(): IPath[] | undefined;
    get filesToMerge(): IPath[] | undefined;
}
