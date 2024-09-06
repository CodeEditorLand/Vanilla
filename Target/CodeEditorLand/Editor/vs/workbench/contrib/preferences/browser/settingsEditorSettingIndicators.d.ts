import { Emitter } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IUserDataSyncEnablementService } from "vs/platform/userDataSync/common/userDataSync";
import { SettingsTreeSettingElement } from "vs/workbench/contrib/preferences/browser/settingsTreeModels";
import { IWorkbenchConfigurationService } from "vs/workbench/services/configuration/common/configuration";
type ScopeString = "workspace" | "user" | "remote" | "default";
export interface ISettingOverrideClickEvent {
    scope: ScopeString;
    language: string;
    settingKey: string;
}
/**
 * Renders the indicators next to a setting, such as "Also Modified In".
 */
export declare class SettingsTreeIndicatorsLabel implements IDisposable {
    private readonly configurationService;
    private readonly hoverService;
    private readonly userDataSyncEnablementService;
    private readonly languageService;
    private readonly userDataProfilesService;
    private readonly commandService;
    private readonly indicatorsContainerElement;
    private readonly workspaceTrustIndicator;
    private readonly scopeOverridesIndicator;
    private readonly syncIgnoredIndicator;
    private readonly defaultOverrideIndicator;
    private readonly allIndicators;
    private readonly profilesEnabled;
    private readonly keybindingListeners;
    private focusedIndex;
    constructor(container: HTMLElement, configurationService: IWorkbenchConfigurationService, hoverService: IHoverService, userDataSyncEnablementService: IUserDataSyncEnablementService, languageService: ILanguageService, userDataProfilesService: IUserDataProfilesService, commandService: ICommandService);
    private defaultHoverOptions;
    private addHoverDisposables;
    private createWorkspaceTrustIndicator;
    private createScopeOverridesIndicator;
    private createSyncIgnoredIndicator;
    private createDefaultOverrideIndicator;
    private render;
    private resetIndicatorNavigationKeyBindings;
    private focusIndicatorAt;
    updateWorkspaceTrust(element: SettingsTreeSettingElement): void;
    updateSyncIgnored(element: SettingsTreeSettingElement, ignoredSettings: string[]): void;
    private getInlineScopeDisplayText;
    dispose(): void;
    updateScopeOverrides(element: SettingsTreeSettingElement, onDidClickOverrideElement: Emitter<ISettingOverrideClickEvent>, onApplyFilter: Emitter<string>): void;
    updateDefaultOverrideIndicator(element: SettingsTreeSettingElement): void;
}
export declare function getIndicatorsLabelAriaLabel(element: SettingsTreeSettingElement, configurationService: IWorkbenchConfigurationService, userDataProfilesService: IUserDataProfilesService, languageService: ILanguageService): string;
export {};
