import { IProductService } from "../../../../platform/product/common/productService.js";
import { ExtensionRecommendations, type GalleryExtensionRecommendation } from "./extensionRecommendations.js";
export declare class RemoteRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private _recommendations;
    get recommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    constructor(productService: IProductService);
    protected doActivate(): Promise<void>;
}
