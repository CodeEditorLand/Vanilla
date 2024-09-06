import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IExtensionRecommendationReason } from "vs/workbench/services/extensionRecommendations/common/extensionRecommendations";
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
