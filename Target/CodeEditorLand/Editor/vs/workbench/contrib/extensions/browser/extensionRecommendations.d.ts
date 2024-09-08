import { Disposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { IExtensionRecommendationReason } from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
export type GalleryExtensionRecommendation = {
    readonly extension: string;
    readonly reason: IExtensionRecommendationReason;
};
export type ResourceExtensionRecommendation = {
    readonly extension: URI;
    readonly reason: IExtensionRecommendationReason;
};
export type ExtensionRecommendation = GalleryExtensionRecommendation | ResourceExtensionRecommendation;
export declare abstract class ExtensionRecommendations extends Disposable {
    abstract readonly recommendations: ReadonlyArray<ExtensionRecommendation>;
    protected abstract doActivate(): Promise<void>;
    private _activationPromise;
    get activated(): boolean;
    activate(): Promise<void>;
}
