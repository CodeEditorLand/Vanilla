import type { Color } from "../../base/common/color.js";
import type { ColorIdentifier } from "../../platform/theme/common/colorRegistry.js";
import type { ColorScheme } from "../../platform/theme/common/theme.js";
import type { IColorTheme } from "../../platform/theme/common/themeService.js";
export declare class EditorTheme {
    private _theme;
    get type(): ColorScheme;
    get value(): IColorTheme;
    constructor(theme: IColorTheme);
    update(theme: IColorTheme): void;
    getColor(color: ColorIdentifier): Color | undefined;
}
