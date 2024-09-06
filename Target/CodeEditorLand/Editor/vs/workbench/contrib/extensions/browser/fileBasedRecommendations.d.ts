import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { IExtensionRecommendationNotificationService } from "vs/platform/extensionRecommendations/common/extensionRecommendations";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ExtensionRecommendations, GalleryExtensionRecommendation } from "vs/workbench/contrib/extensions/browser/extensionRecommendations";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { IExtensionIgnoredRecommendationsService } from "vs/workbench/services/extensionRecommendations/common/extensionRecommendations";
export declare class FileBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionsWorkbenchService;
    private readonly modelService;
    private readonly languageService;
    private readonly storageService;
    private readonly extensionRecommendationNotificationService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly workspaceContextService;
    private readonly fileOpenRecommendations;
    private readonly recommendationsByPattern;
    private readonly fileBasedRecommendations;
    private readonly fileBasedImportantRecommendations;
    get recommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    get importantRecommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    get otherRecommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, modelService: IModelService, languageService: ILanguageService, productService: IProductService, storageService: IStorageService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService, workspaceContextService: IWorkspaceContextService);
    protected doActivate(): Promise<void>;
    private onModelAdded;
    /**
     * Prompt the user to either install the recommended extension for the file type in the current editor model
     * or prompt to search the marketplace if it has extensions that can support the file type
     */
    private promptImportantRecommendations;
    private promptFromRecommendations;
    private promptRecommendedExtensionForFileType;
    private promptImportantExtensionsInstallNotification;
    private getPromptedRecommendations;
    private addToPromptedRecommendations;
    private filterIgnoredOrNotAllowed;
    private filterInstalled;
    private getCachedRecommendations;
    private storeCachedRecommendations;
}
