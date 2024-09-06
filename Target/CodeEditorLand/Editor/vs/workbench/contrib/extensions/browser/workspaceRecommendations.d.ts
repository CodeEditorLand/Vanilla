import { IFileService } from "vs/platform/files/common/files";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ExtensionRecommendation, ExtensionRecommendations } from "vs/workbench/contrib/extensions/browser/extensionRecommendations";
import { IWorkbenchExtensionManagementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IWorkspaceExtensionsConfigService } from "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig";
export declare class WorkspaceRecommendations extends ExtensionRecommendations {
    private readonly workspaceExtensionsConfigService;
    private readonly contextService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly workbenchExtensionManagementService;
    private readonly notificationService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: any;
    private _ignoredRecommendations;
    get ignoredRecommendations(): ReadonlyArray<string>;
    private workspaceExtensions;
    private readonly onDidChangeWorkspaceExtensionsScheduler;
    constructor(workspaceExtensionsConfigService: IWorkspaceExtensionsConfigService, contextService: IWorkspaceContextService, uriIdentityService: IUriIdentityService, fileService: IFileService, workbenchExtensionManagementService: IWorkbenchExtensionManagementService, notificationService: INotificationService);
    protected doActivate(): Promise<void>;
    private onDidChangeWorkspaceExtensionsFolders;
    private fetchWorkspaceExtensions;
    /**
     * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
     */
    private fetch;
    private validateExtensions;
    private onDidChangeExtensionsConfigs;
}
