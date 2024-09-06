import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IExtensionPoint } from "vs/workbench/services/extensions/common/extensionsRegistry";
import { ExtensionData, IThemeExtensionPoint } from "vs/workbench/services/themes/common/workbenchThemeService";
export declare function registerColorThemeExtensionPoint(): any;
export declare function registerFileIconThemeExtensionPoint(): any;
export declare function registerProductIconThemeExtensionPoint(): any;
export interface ThemeChangeEvent<T> {
    themes: T[];
    added: T[];
    removed: T[];
}
export interface IThemeData {
    id: string;
    settingsId: string | null;
    location?: URI;
}
export declare class ThemeRegistry<T extends IThemeData> implements IDisposable {
    private readonly themesExtPoint;
    private create;
    private idRequired;
    private builtInTheme;
    private extensionThemes;
    private readonly onDidChangeEmitter;
    readonly onDidChange: Event<ThemeChangeEvent<T>>;
    constructor(themesExtPoint: IExtensionPoint<IThemeExtensionPoint[]>, create: (theme: IThemeExtensionPoint, themeLocation: URI, extensionData: ExtensionData) => T, idRequired?: boolean, builtInTheme?: T | undefined);
    dispose(): void;
    private initialize;
    private onThemes;
    findThemeById(themeId: string): T | undefined;
    findThemeBySettingsId(settingsId: string | null, defaultSettingsId?: string): T | undefined;
    findThemeByExtensionLocation(extLocation: URI | undefined): T[];
    getThemes(): T[];
    getMarketplaceThemes(manifest: any, extensionLocation: URI, extensionData: ExtensionData): T[];
}
