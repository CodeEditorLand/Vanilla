import type { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { type ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelService, type ITextModelContentProvider } from "../../../../editor/common/services/resolverService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
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
