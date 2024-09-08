import type { URI } from "../../../../base/common/uri.js";
import type { ILanguageSelection } from "../../../../editor/common/languages/language.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { type IOutputChannelModel } from "./outputChannelModel.js";
export declare const IOutputChannelModelService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IOutputChannelModelService>;
export interface IOutputChannelModelService {
    readonly _serviceBrand: undefined;
    createOutputChannelModel(id: string, modelUri: URI, language: ILanguageSelection, file?: URI): IOutputChannelModel;
}
export declare class OutputChannelModelService {
    private readonly fileService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly outputLocation;
    constructor(fileService: IFileService, instantiationService: IInstantiationService, environmentService: IWorkbenchEnvironmentService);
    createOutputChannelModel(id: string, modelUri: URI, language: ILanguageSelection, file?: URI): IOutputChannelModel;
    private _outputDir;
    private get outputDir();
}