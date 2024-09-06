import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IModelService } from "vs/editor/common/services/model";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
export declare class OutputLinkProvider extends Disposable {
    private readonly contextService;
    private readonly modelService;
    private readonly languageFeaturesService;
    private static readonly DISPOSE_WORKER_TIME;
    private worker?;
    private disposeWorkerScheduler;
    private linkProviderRegistration;
    constructor(contextService: IWorkspaceContextService, modelService: IModelService, languageFeaturesService: ILanguageFeaturesService);
    private registerListeners;
    private updateLinkProviderWorker;
    private getOrCreateWorker;
    private provideLinks;
    private disposeWorker;
}
