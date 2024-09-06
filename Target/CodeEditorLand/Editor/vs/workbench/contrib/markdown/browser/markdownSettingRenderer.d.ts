import { IAction } from "../../../../base/common/actions.js";
import { Tokens } from "../../../../base/common/marked/marked.js";
import { URI } from "../../../../base/common/uri.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
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
    getHtmlRenderer(): (token: Tokens.HTML | Tokens.Tag) => string;
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
