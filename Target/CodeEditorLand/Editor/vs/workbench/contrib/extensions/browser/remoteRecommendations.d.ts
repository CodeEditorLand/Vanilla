import { IProductService } from "vs/platform/product/common/productService";
import { ExtensionRecommendations, GalleryExtensionRecommendation } from "vs/workbench/contrib/extensions/browser/extensionRecommendations";
export declare class RemoteRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private _recommendations;
    get recommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    constructor(productService: IProductService);
    protected doActivate(): Promise<void>;
}
