import { IExpression } from "vs/base/common/glob";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationChangeEvent, IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
export declare class ResourceGlobMatcher extends Disposable {
    private getExpression;
    private shouldUpdate;
    private readonly contextService;
    private readonly configurationService;
    private static readonly NO_FOLDER;
    private readonly _onExpressionChange;
    readonly onExpressionChange: any;
    private readonly mapFolderToParsedExpression;
    private readonly mapFolderToConfiguredExpression;
    constructor(getExpression: (folder?: URI) => IExpression | undefined, shouldUpdate: (event: IConfigurationChangeEvent) => boolean, contextService: IWorkspaceContextService, configurationService: IConfigurationService);
    private registerListeners;
    private updateExpressions;
    private doGetExpression;
    matches(resource: URI, hasSibling?: (name: string) => boolean): boolean;
    private uriToPath;
}
