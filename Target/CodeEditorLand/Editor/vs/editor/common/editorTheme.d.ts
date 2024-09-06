import { Color } from "vs/base/common/color";
import { ColorIdentifier } from "vs/platform/theme/common/colorRegistry";
import { ColorScheme } from "vs/platform/theme/common/theme";
import { IColorTheme } from "vs/platform/theme/common/themeService";
export declare class EditorTheme {
    private _theme;
    get type(): ColorScheme;
    get value(): IColorTheme;
    constructor(theme: IColorTheme);
    update(theme: IColorTheme): void;
    getColor(color: ColorIdentifier): Color | undefined;
}
