import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { ILanguagePackItem } from "vs/platform/languagePacks/common/languagePacks";
import { IProductService } from "vs/platform/product/common/productService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { ILocaleService } from "vs/workbench/services/localization/common/locale";
export declare class WebLocaleService implements ILocaleService {
    private readonly dialogService;
    private readonly hostService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(dialogService: IDialogService, hostService: IHostService, productService: IProductService);
    setLocale(languagePackItem: ILanguagePackItem, _skipDialog?: boolean): Promise<void>;
    clearLocalePreference(): Promise<void>;
}
