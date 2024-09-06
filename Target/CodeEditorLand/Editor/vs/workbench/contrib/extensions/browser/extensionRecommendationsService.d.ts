import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IExtensionGalleryService, IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtensionRecommendationNotificationService } from "vs/platform/extensionRecommendations/common/extensionRecommendations";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IRemoteExtensionsScannerService } from "vs/platform/remote/common/remoteExtensionsScanner";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { ExtensionRecommendationReason, IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from "vs/workbench/services/extensionRecommendations/common/extensionRecommendations";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IUserDataInitializationService } from "vs/workbench/services/userData/browser/userDataInit";
export declare class ExtensionRecommendationsService extends Disposable implements IExtensionRecommendationsService {
    private readonly lifecycleService;
    private readonly galleryService;
    private readonly telemetryService;
    private readonly environmentService;
    private readonly extensionManagementService;
    private readonly extensionRecommendationsManagementService;
    private readonly extensionRecommendationNotificationService;
    private readonly extensionsWorkbenchService;
    private readonly remoteExtensionsScannerService;
    private readonly userDataInitializationService;
    readonly _serviceBrand: undefined;
    private readonly fileBasedRecommendations;
    private readonly workspaceRecommendations;
    private readonly configBasedRecommendations;
    private readonly exeBasedRecommendations;
    private readonly keymapRecommendations;
    private readonly webRecommendations;
    private readonly languageRecommendations;
    private readonly remoteRecommendations;
    readonly activationPromise: Promise<void>;
    private sessionSeed;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: any;
    constructor(instantiationService: IInstantiationService, lifecycleService: ILifecycleService, galleryService: IExtensionGalleryService, telemetryService: ITelemetryService, environmentService: IEnvironmentService, extensionManagementService: IExtensionManagementService, extensionRecommendationsManagementService: IExtensionIgnoredRecommendationsService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, extensionsWorkbenchService: IExtensionsWorkbenchService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, userDataInitializationService: IUserDataInitializationService);
    private activate;
    private isEnabled;
    private activateProactiveRecommendations;
    getAllRecommendationsWithReason(): {
        [id: string]: {
            reasonId: ExtensionRecommendationReason;
            reasonText: string;
        };
    };
    getConfigBasedRecommendations(): Promise<{
        important: string[];
        others: string[];
    }>;
    getOtherRecommendations(): Promise<string[]>;
    getImportantRecommendations(): Promise<string[]>;
    getKeymapRecommendations(): string[];
    getLanguageRecommendations(): string[];
    getRemoteRecommendations(): string[];
    getWorkspaceRecommendations(): Promise<Array<string | URI>>;
    getExeBasedRecommendations(exe?: string): Promise<{
        important: string[];
        others: string[];
    }>;
    getFileBasedRecommendations(): string[];
    private onDidInstallExtensions;
    private toExtensionIds;
    private isExtensionAllowedToBeRecommended;
    private promptWorkspaceRecommendations;
    private _registerP;
}
