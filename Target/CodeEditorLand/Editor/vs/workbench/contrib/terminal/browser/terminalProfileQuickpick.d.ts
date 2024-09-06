import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IPickerQuickAccessItem } from "vs/platform/quickinput/browser/pickerQuickAccess";
import { IKeyMods, IQuickInputService, IQuickPickItem } from "vs/platform/quickinput/common/quickInput";
import { IExtensionTerminalProfile, ITerminalProfile } from "vs/platform/terminal/common/terminal";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IQuickPickTerminalObject, ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
import { ITerminalProfileResolverService, ITerminalProfileService } from "vs/workbench/contrib/terminal/common/terminal";
type DefaultProfileName = string;
export declare class TerminalProfileQuickpick {
    private readonly _terminalProfileService;
    private readonly _terminalProfileResolverService;
    private readonly _configurationService;
    private readonly _quickInputService;
    private readonly _themeService;
    private readonly _notificationService;
    constructor(_terminalProfileService: ITerminalProfileService, _terminalProfileResolverService: ITerminalProfileResolverService, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _themeService: IThemeService, _notificationService: INotificationService);
    showAndGetResult(type: "setDefault" | "createInstance"): Promise<IQuickPickTerminalObject | DefaultProfileName | undefined>;
    private _createAndShow;
    private _createNewProfileConfig;
    private _isProfileSafe;
    private _createProfileQuickPickItem;
    private _sortProfileQuickPickItems;
}
export interface IProfileQuickPickItem extends IQuickPickItem {
    profile: ITerminalProfile | IExtensionTerminalProfile;
    profileName: string;
    keyMods?: IKeyMods | undefined;
}
export interface ITerminalQuickPickItem extends IPickerQuickAccessItem {
    terminal: ITerminalInstance;
}
export {};
