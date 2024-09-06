import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigBasedExtensionTip, IExecutableBasedExtensionTip, IExtensionManagementService, IExtensionTipsService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtensionRecommendationNotificationService } from "vs/platform/extensionRecommendations/common/extensionRecommendations";
import { IFileService } from "vs/platform/files/common/files";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class ExtensionTipsService extends Disposable implements IExtensionTipsService {
    protected readonly fileService: IFileService;
    private readonly productService;
    _serviceBrand: any;
    private readonly allConfigBasedTips;
    constructor(fileService: IFileService, productService: IProductService);
    getConfigBasedTips(folder: URI): Promise<IConfigBasedExtensionTip[]>;
    getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    private getValidConfigBasedTips;
}
export declare abstract class AbstractNativeExtensionTipsService extends ExtensionTipsService {
    private readonly userHome;
    private readonly windowEvents;
    private readonly telemetryService;
    private readonly extensionManagementService;
    private readonly storageService;
    private readonly extensionRecommendationNotificationService;
    private readonly highImportanceExecutableTips;
    private readonly mediumImportanceExecutableTips;
    private readonly allOtherExecutableTips;
    private highImportanceTipsByExe;
    private mediumImportanceTipsByExe;
    constructor(userHome: URI, windowEvents: {
        readonly onDidOpenMainWindow: Event<unknown>;
        readonly onDidFocusMainWindow: Event<unknown>;
    }, telemetryService: ITelemetryService, extensionManagementService: IExtensionManagementService, storageService: IStorageService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, fileService: IFileService, productService: IProductService);
    getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    private collectTips;
    private groupImportantTipsByExe;
    /**
     * High importance tips are prompted once per restart session
     */
    private promptHighImportanceExeBasedTip;
    /**
     * Medium importance tips are prompted once per 7 days
     */
    private promptMediumImportanceExeBasedTip;
    private promptExeRecommendations;
    private getLastPromptedMediumExeTime;
    private updateLastPromptedMediumExeTime;
    private getPromptedExecutableTips;
    private addToRecommendedExecutables;
    private groupByInstalled;
    private getValidExecutableBasedExtensionTips;
}
