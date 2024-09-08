import type { Color } from "../../../base/common/color.js";
import type { IColorTheme, IThemeService } from "../../../platform/theme/common/themeService.js";
import type { ITokenThemeRule, TokenTheme } from "../../common/languages/supports/tokenization.js";
export declare const IStandaloneThemeService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IStandaloneThemeService>;
export type BuiltinTheme = "vs" | "vs-dark" | "hc-black" | "hc-light";
export type IColors = {
    [colorId: string]: string;
};
export interface IStandaloneThemeData {
    base: BuiltinTheme;
    inherit: boolean;
    rules: ITokenThemeRule[];
    encodedTokensColors?: string[];
    colors: IColors;
}
export interface IStandaloneTheme extends IColorTheme {
    tokenTheme: TokenTheme;
    themeName: string;
}
export interface IStandaloneThemeService extends IThemeService {
    readonly _serviceBrand: undefined;
    setTheme(themeName: string): void;
    setAutoDetectHighContrast(autoDetectHighContrast: boolean): void;
    defineTheme(themeName: string, themeData: IStandaloneThemeData): void;
    getColorTheme(): IStandaloneTheme;
    setColorMapOverride(colorMapOverride: Color[] | null): void;
}
