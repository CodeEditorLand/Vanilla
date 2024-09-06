import { IProductService } from "../../../../platform/product/common/productService.js";
import { ExtensionRecommendation, ExtensionRecommendations } from "./extensionRecommendations.js";
export declare class LanguageRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(productService: IProductService);
    protected doActivate(): Promise<void>;
}
