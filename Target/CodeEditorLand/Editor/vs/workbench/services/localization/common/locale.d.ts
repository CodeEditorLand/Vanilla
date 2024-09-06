import { ILanguagePackItem } from "vs/platform/languagePacks/common/languagePacks";
export declare const ILocaleService: any;
export interface ILocaleService {
    readonly _serviceBrand: undefined;
    setLocale(languagePackItem: ILanguagePackItem, skipDialog?: boolean): Promise<void>;
    clearLocalePreference(): Promise<void>;
}
export declare const IActiveLanguagePackService: any;
export interface IActiveLanguagePackService {
    readonly _serviceBrand: undefined;
    getExtensionIdProvidingCurrentLocale(): Promise<string | undefined>;
}
