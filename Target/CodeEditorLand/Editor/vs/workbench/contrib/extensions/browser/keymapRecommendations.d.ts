import { IProductService } from "vs/platform/product/common/productService";
import { ExtensionRecommendation, ExtensionRecommendations } from "vs/workbench/contrib/extensions/browser/extensionRecommendations";
export declare class KeymapRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(productService: IProductService);
    protected doActivate(): Promise<void>;
}
