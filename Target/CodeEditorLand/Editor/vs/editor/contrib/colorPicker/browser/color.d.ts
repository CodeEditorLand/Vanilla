import { CancellationToken } from "vs/base/common/cancellation";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import { DocumentColorProvider, IColorInformation, IColorPresentation } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
export declare function getColors(colorProviderRegistry: LanguageFeatureRegistry<DocumentColorProvider>, model: ITextModel, token: CancellationToken, isDefaultColorDecoratorsEnabled?: boolean): Promise<IColorData[]>;
export declare function getColorPresentations(model: ITextModel, colorInfo: IColorInformation, provider: DocumentColorProvider, token: CancellationToken): Promise<IColorPresentation[] | null | undefined>;
export interface IColorData {
    colorInfo: IColorInformation;
    provider: DocumentColorProvider;
}
