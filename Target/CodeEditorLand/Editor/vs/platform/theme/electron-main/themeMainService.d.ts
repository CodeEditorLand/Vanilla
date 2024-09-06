import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IStateService } from "vs/platform/state/node/state";
import { IPartsSplash } from "vs/platform/theme/common/themeService";
import { IColorScheme } from "vs/platform/window/common/window";
export declare const IThemeMainService: any;
export interface IThemeMainService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeColorScheme: Event<IColorScheme>;
    getBackgroundColor(): string;
    saveWindowSplash(windowId: number | undefined, splash: IPartsSplash): void;
    getWindowSplash(): IPartsSplash | undefined;
    getColorScheme(): IColorScheme;
}
export declare class ThemeMainService extends Disposable implements IThemeMainService {
    private stateService;
    private configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeColorScheme;
    readonly onDidChangeColorScheme: any;
    constructor(stateService: IStateService, configurationService: IConfigurationService);
    private updateSystemColorTheme;
    getColorScheme(): IColorScheme;
    getBackgroundColor(): string;
    private getBaseTheme;
    saveWindowSplash(windowId: number | undefined, splash: IPartsSplash): void;
    private updateBackgroundColor;
    getWindowSplash(): IPartsSplash | undefined;
}
