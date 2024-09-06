import { Color } from "../../base/common/color.js";
import { ColorIdentifier } from "../../platform/theme/common/colorRegistry.js";
import { ColorScheme } from "../../platform/theme/common/theme.js";
import { IColorTheme } from "../../platform/theme/common/themeService.js";
export declare class EditorTheme {
    private _theme;
    get type(): ColorScheme;
    get value(): IColorTheme;
    constructor(theme: IColorTheme);
    update(theme: IColorTheme): void;
    getColor(color: ColorIdentifier): Color | undefined;
}
