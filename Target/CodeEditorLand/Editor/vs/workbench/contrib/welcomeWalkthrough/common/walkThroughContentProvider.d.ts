import { URI } from "vs/base/common/uri";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextModel } from "vs/editor/common/model";
import { IModelService } from "vs/editor/common/services/model";
import { ITextModelContentProvider, ITextModelService } from "vs/editor/common/services/resolverService";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
interface IWalkThroughContentProvider {
    (accessor: ServicesAccessor): string;
}
declare class WalkThroughContentProviderRegistry {
    private readonly providers;
    registerProvider(moduleId: string, provider: IWalkThroughContentProvider): void;
    getProvider(moduleId: string): IWalkThroughContentProvider | undefined;
}
export declare const walkThroughContentRegistry: WalkThroughContentProviderRegistry;
export declare function moduleToContent(instantiationService: IInstantiationService, resource: URI): Promise<string>;
export declare class WalkThroughSnippetContentProvider implements ITextModelContentProvider, IWorkbenchContribution {
    private readonly textModelResolverService;
    private readonly languageService;
    private readonly modelService;
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.walkThroughSnippetContentProvider";
    private loads;
    constructor(textModelResolverService: ITextModelService, languageService: ILanguageService, modelService: IModelService, instantiationService: IInstantiationService);
    private textBufferFactoryFromResource;
    provideTextContent(resource: URI): Promise<ITextModel>;
}
export {};
