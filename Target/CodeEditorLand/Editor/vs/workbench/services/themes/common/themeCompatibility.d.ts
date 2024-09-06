import { IColorMap, ITextMateThemingRule } from "vs/workbench/services/themes/common/workbenchThemeService";
export declare function convertSettings(oldSettings: ITextMateThemingRule[], result: {
    textMateRules: ITextMateThemingRule[];
    colors: IColorMap;
}): void;
