import { Tokens } from "vs/base/common/marked/marked";
import { URI } from "vs/base/common/uri";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
export declare class SimpleSettingRenderer {
    private readonly _configurationService;
    private readonly _contextMenuService;
    private readonly _preferencesService;
    private readonly _telemetryService;
    private readonly _clipboardService;
    private readonly codeSettingRegex;
    private _updatedSettings;
    private _encounteredSettings;
    private _featuredSettings;
    constructor(_configurationService: IConfigurationService, _contextMenuService: IContextMenuService, _preferencesService: IPreferencesService, _telemetryService: ITelemetryService, _clipboardService: IClipboardService);
    get featuredSettingStates(): Map<string, boolean>;
    getHtmlRenderer(): (token: Tokens.HTML) => string;
    settingToUriString(settingId: string, value?: any): string;
    private getSetting;
    parseValue(settingId: string, value: string): any;
    private render;
    private viewInSettingsMessage;
    private restorePreviousSettingMessage;
    private booleanSettingMessage;
    private stringSettingMessage;
    private numberSettingMessage;
    private renderSetting;
    private getSettingMessage;
    restoreSetting(settingId: string): Promise<void>;
    setSetting(settingId: string, currentSettingValue: any, newSettingValue: any): Promise<void>;
    getActions(uri: URI): IAction[] | undefined;
    private showContextMenu;
    updateSetting(uri: URI, x: number, y: number): Promise<void>;
}