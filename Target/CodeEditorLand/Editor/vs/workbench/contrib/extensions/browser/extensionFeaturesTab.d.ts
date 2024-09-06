import { IExtensionManifest } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IThemeService, Themable } from "vs/platform/theme/common/themeService";
export declare class ExtensionFeaturesTab extends Themable {
    private readonly manifest;
    private readonly feature;
    private readonly instantiationService;
    readonly domNode: HTMLElement;
    private readonly featureView;
    private featureViewDimension?;
    private readonly layoutParticipants;
    private readonly extensionId;
    constructor(manifest: IExtensionManifest, feature: string | undefined, themeService: IThemeService, instantiationService: IInstantiationService);
    layout(height?: number, width?: number): void;
    private create;
    private createFeaturesList;
    private layoutFeatureView;
    private showFeatureView;
    private getFeatures;
    private getRenderer;
}
