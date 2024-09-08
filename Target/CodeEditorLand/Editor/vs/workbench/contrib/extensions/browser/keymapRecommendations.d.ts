import { IProductService } from "../../../../platform/product/common/productService.js";
import { ExtensionRecommendations, type ExtensionRecommendation } from "./extensionRecommendations.js";
export declare class KeymapRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(productService: IProductService);
    protected doActivate(): Promise<void>;
}
