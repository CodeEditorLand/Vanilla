import { PerformanceMark } from "vs/base/common/performance";
import { URI } from "vs/base/common/uri";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { AbstractNativeEnvironmentService } from "vs/platform/environment/common/environmentService";
import { IProductService } from "vs/platform/product/common/productService";
import { IColorScheme, INativeWindowConfiguration, IOSConfiguration, IPath, IPathsToWaitFor } from "vs/platform/window/common/window";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
export declare const INativeWorkbenchEnvironmentService: any;
/**
 * A subclass of the `IWorkbenchEnvironmentService` to be used only in native
 * environments (Windows, Linux, macOS) but not e.g. web.
 */
export interface INativeWorkbenchEnvironmentService extends IBrowserWorkbenchEnvironmentService, INativeEnvironmentService {
    readonly window: {
        id: number;
        colorScheme: IColorScheme;
        maximized?: boolean;
        accessibilitySupport?: boolean;
        isInitialStartup?: boolean;
        isCodeCaching?: boolean;
        perfMarks: PerformanceMark[];
    };
    readonly mainPid: number;
    readonly os: IOSConfiguration;
    readonly machineId: string;
    readonly sqmId: string;
    readonly devDeviceId: string;
    readonly execPath: string;
    readonly backupPath?: string;
    readonly crashReporterDirectory?: string;
    readonly crashReporterId?: string;
    readonly filesToWait?: IPathsToWaitFor;
}
export declare class NativeWorkbenchEnvironmentService extends AbstractNativeEnvironmentService implements INativeWorkbenchEnvironmentService {
    private readonly configuration;
    get mainPid(): any;
    get machineId(): any;
    get sqmId(): any;
    get devDeviceId(): any;
    get remoteAuthority(): any;
    get expectsResolverExtension(): boolean;
    get execPath(): any;
    get backupPath(): any;
    get window(): {
        id: any;
        colorScheme: any;
        maximized: any;
        accessibilitySupport: any;
        perfMarks: any;
        isInitialStartup: any;
        isCodeCaching: boolean;
    };
    get windowLogsPath(): URI;
    get logFile(): URI;
    get extHostLogsPath(): URI;
    get extHostTelemetryLogFile(): URI;
    get webviewExternalEndpoint(): string;
    get skipReleaseNotes(): boolean;
    get skipWelcome(): boolean;
    get logExtensionHostCommunication(): boolean;
    get enableSmokeTestDriver(): boolean;
    get extensionEnabledProposedApi(): string[] | undefined;
    get os(): IOSConfiguration;
    get filesToOpenOrCreate(): IPath[] | undefined;
    get filesToDiff(): IPath[] | undefined;
    get filesToMerge(): IPath[] | undefined;
    get filesToWait(): IPathsToWaitFor | undefined;
    constructor(configuration: INativeWindowConfiguration, productService: IProductService);
}
