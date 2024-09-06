import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ITerminalConfigurationService, LinuxDistro } from "vs/workbench/contrib/terminal/browser/terminal";
import type { IXtermCore } from "vs/workbench/contrib/terminal/browser/xterm-private";
import { ITerminalConfiguration, type ITerminalFont } from "vs/workbench/contrib/terminal/common/terminal";
export declare class TerminalConfigurationService extends Disposable implements ITerminalConfigurationService {
    private readonly _configurationService;
    _serviceBrand: undefined;
    protected _fontMetrics: TerminalFontMetrics;
    protected _config: Readonly<ITerminalConfiguration>;
    get config(): ITerminalConfiguration;
    private readonly _onConfigChanged;
    get onConfigChanged(): Event<void>;
    constructor(_configurationService: IConfigurationService);
    setPanelContainer(panelContainer: HTMLElement): void;
    configFontIsMonospace(): boolean;
    getFont(w: Window, xtermCore?: IXtermCore, excludeDimensions?: boolean): ITerminalFont;
    private _updateConfig;
    private _normalizeFontWeight;
}
export declare class TerminalFontMetrics extends Disposable {
    private readonly _terminalConfigurationService;
    private readonly _configurationService;
    private _panelContainer;
    private _charMeasureElement;
    private _lastFontMeasurement;
    linuxDistro: LinuxDistro;
    constructor(_terminalConfigurationService: ITerminalConfigurationService, _configurationService: IConfigurationService);
    setPanelContainer(panelContainer: HTMLElement): void;
    configFontIsMonospace(): boolean;
    /**
     * Gets the font information based on the terminal.integrated.fontFamily
     * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
     */
    getFont(w: Window, xtermCore?: IXtermCore, excludeDimensions?: boolean): ITerminalFont;
    private _createCharMeasureElementIfNecessary;
    private _getBoundingRectFor;
    private _measureFont;
}
