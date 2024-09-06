import { Disposable } from "vs/base/common/lifecycle";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IExtensionFeaturesManagementService } from "vs/workbench/services/extensionManagement/common/extensionFeatures";
export declare const ILanguageModelStatsService: any;
export interface ILanguageModelStatsService {
    readonly _serviceBrand: undefined;
    update(model: string, extensionId: ExtensionIdentifier, agent: string | undefined, tokenCount: number | undefined): Promise<void>;
}
export declare class LanguageModelStatsService extends Disposable implements ILanguageModelStatsService {
    private readonly extensionFeaturesManagementService;
    private readonly _storageService;
    private static readonly MODEL_STATS_STORAGE_KEY_PREFIX;
    private static readonly MODEL_ACCESS_STORAGE_KEY_PREFIX;
    _serviceBrand: undefined;
    private readonly _onDidChangeStats;
    readonly onDidChangeLanguageMoelStats: any;
    private readonly sessionStats;
    constructor(extensionFeaturesManagementService: IExtensionFeaturesManagementService, _storageService: IStorageService);
    hasAccessedModel(extensionId: string, model: string): boolean;
    update(model: string, extensionId: ExtensionIdentifier, agent: string | undefined, tokenCount: number | undefined): Promise<void>;
    private addAccess;
    private getAccessExtensions;
    private write;
    private add;
    private read;
    private getModel;
    private getKey;
    private getAccessKey;
}
