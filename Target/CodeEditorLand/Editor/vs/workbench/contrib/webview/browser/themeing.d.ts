import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { WebviewStyles } from "vs/workbench/contrib/webview/browser/webview";
import { IWorkbenchColorTheme, IWorkbenchThemeService } from "vs/workbench/services/themes/common/workbenchThemeService";
interface WebviewThemeData {
    readonly activeTheme: string;
    readonly themeLabel: string;
    readonly themeId: string;
    readonly styles: Readonly<WebviewStyles>;
}
export declare class WebviewThemeDataProvider extends Disposable {
    private readonly _themeService;
    private readonly _configurationService;
    private _cachedWebViewThemeData;
    private readonly _onThemeDataChanged;
    readonly onThemeDataChanged: any;
    constructor(_themeService: IWorkbenchThemeService, _configurationService: IConfigurationService);
    getTheme(): IWorkbenchColorTheme;
    getWebviewThemeData(): WebviewThemeData;
    private _reset;
}
export {};
