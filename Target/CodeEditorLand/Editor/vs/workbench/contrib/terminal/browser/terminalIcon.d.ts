import { type IDisposable } from "../../../../base/common/lifecycle.js";
import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import type { IExtensionTerminalProfile, ITerminalProfile } from "../../../../platform/terminal/common/terminal.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import type { IColorTheme } from "../../../../platform/theme/common/themeService.js";
import type { ITerminalInstance } from "./terminal.js";
export declare function getColorClass(colorKey: string): string;
export declare function getColorClass(profile: ITerminalProfile): string;
export declare function getColorClass(terminal: ITerminalInstance): string | undefined;
export declare function getColorClass(extensionTerminalProfile: IExtensionTerminalProfile): string | undefined;
export declare function getStandardColors(colorTheme: IColorTheme): string[];
export declare function createColorStyleElement(colorTheme: IColorTheme): IDisposable;
export declare function getColorStyleContent(colorTheme: IColorTheme, editor?: boolean): string;
export declare function getUriClasses(terminal: ITerminalInstance | IExtensionTerminalProfile | ITerminalProfile, colorScheme: ColorScheme, extensionContributed?: boolean): string[] | undefined;
export declare function getIconId(accessor: ServicesAccessor, terminal: ITerminalInstance | IExtensionTerminalProfile | ITerminalProfile): string;