import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import { ITextModel } from "vs/editor/common/model";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { ILogService } from "vs/platform/log/common/log";
export declare const ILanguageFeatureDebounceService: any;
export interface ILanguageFeatureDebounceService {
    readonly _serviceBrand: undefined;
    for(feature: LanguageFeatureRegistry<object>, debugName: string, config?: {
        min?: number;
        max?: number;
        salt?: string;
    }): IFeatureDebounceInformation;
}
export interface IFeatureDebounceInformation {
    get(model: ITextModel): number;
    update(model: ITextModel, value: number): number;
    default(): number;
}
export declare class LanguageFeatureDebounceService implements ILanguageFeatureDebounceService {
    private readonly _logService;
    _serviceBrand: undefined;
    private readonly _data;
    private readonly _isDev;
    constructor(_logService: ILogService, envService: IEnvironmentService);
    for(feature: LanguageFeatureRegistry<object>, name: string, config?: {
        min?: number;
        max?: number;
        key?: string;
    }): IFeatureDebounceInformation;
    private _overallAverage;
}
