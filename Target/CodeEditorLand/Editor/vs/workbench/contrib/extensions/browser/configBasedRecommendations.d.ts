import { IExtensionTipsService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ExtensionRecommendations, type ExtensionRecommendation } from "./extensionRecommendations.js";
type ConfigBasedExtensionRecommendation = ExtensionRecommendation & {
    whenNotInstalled: string[] | undefined;
};
export declare class ConfigBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionTipsService;
    private readonly workspaceContextService;
    private importantTips;
    private otherTips;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: import("../../../../base/common/event.js").Event<void>;
    private _otherRecommendations;
    get otherRecommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    private _importantRecommendations;
    get importantRecommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    get recommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    constructor(extensionTipsService: IExtensionTipsService, workspaceContextService: IWorkspaceContextService);
    protected doActivate(): Promise<void>;
    private fetch;
    private onWorkspaceFoldersChanged;
    private toExtensionRecommendation;
}
export {};
