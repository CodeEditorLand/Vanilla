var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Codicon } from "../../../../base/common/codicons.js";
import { basename } from "../../../../base/common/path.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import * as nls from "../../../../nls.js";
import {
  ConfigurationTarget,
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import {
  TerminalSettingPrefix
} from "../../../../platform/terminal/common/terminal.js";
import { getIconRegistry } from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  ITerminalProfileResolverService,
  ITerminalProfileService
} from "../common/terminal.js";
import {
  createColorStyleElement,
  getColorClass,
  getUriClasses
} from "./terminalIcon.js";
import { configureTerminalProfileIcon } from "./terminalIcons.js";
let TerminalProfileQuickpick = class {
  constructor(_terminalProfileService, _terminalProfileResolverService, _configurationService, _quickInputService, _themeService, _notificationService) {
    this._terminalProfileService = _terminalProfileService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._configurationService = _configurationService;
    this._quickInputService = _quickInputService;
    this._themeService = _themeService;
    this._notificationService = _notificationService;
  }
  async showAndGetResult(type) {
    const platformKey = await this._terminalProfileService.getPlatformKey();
    const profilesKey = TerminalSettingPrefix.Profiles + platformKey;
    const result = await this._createAndShow(type);
    const defaultProfileKey = `${TerminalSettingPrefix.DefaultProfile}${platformKey}`;
    if (!result) {
      return;
    }
    if (type === "setDefault") {
      if ("command" in result.profile) {
        return;
      } else if ("id" in result.profile) {
        await this._configurationService.updateValue(
          defaultProfileKey,
          result.profile.title,
          ConfigurationTarget.USER
        );
        return {
          config: {
            extensionIdentifier: result.profile.extensionIdentifier,
            id: result.profile.id,
            title: result.profile.title,
            options: {
              color: result.profile.color,
              icon: result.profile.icon
            }
          },
          keyMods: result.keyMods
        };
      }
      if ("isAutoDetected" in result.profile) {
        const profilesConfig = await this._configurationService.getValue(profilesKey);
        if (typeof profilesConfig === "object") {
          const newProfile = {
            path: result.profile.path
          };
          if (result.profile.args) {
            newProfile.args = result.profile.args;
          }
          profilesConfig[result.profile.profileName] = this._createNewProfileConfig(result.profile);
          await this._configurationService.updateValue(
            profilesKey,
            profilesConfig,
            ConfigurationTarget.USER
          );
        }
      }
      await this._configurationService.updateValue(
        defaultProfileKey,
        result.profileName,
        ConfigurationTarget.USER
      );
    } else if (type === "createInstance") {
      if ("id" in result.profile) {
        return {
          config: {
            extensionIdentifier: result.profile.extensionIdentifier,
            id: result.profile.id,
            title: result.profile.title,
            options: {
              icon: result.profile.icon,
              color: result.profile.color
            }
          },
          keyMods: result.keyMods
        };
      } else {
        return { config: result.profile, keyMods: result.keyMods };
      }
    }
    return "profileName" in result.profile ? result.profile.profileName : result.profile.title;
  }
  async _createAndShow(type) {
    const platformKey = await this._terminalProfileService.getPlatformKey();
    const profiles = this._terminalProfileService.availableProfiles;
    const profilesKey = TerminalSettingPrefix.Profiles + platformKey;
    const defaultProfileName = this._terminalProfileService.getDefaultProfileName();
    let keyMods;
    const options = {
      placeHolder: type === "createInstance" ? nls.localize(
        "terminal.integrated.selectProfileToCreate",
        "Select the terminal profile to create"
      ) : nls.localize(
        "terminal.integrated.chooseDefaultProfile",
        "Select your default terminal profile"
      ),
      onDidTriggerItemButton: async (context) => {
        if (!await this._isProfileSafe(context.item.profile)) {
          return;
        }
        if ("command" in context.item.profile) {
          return;
        }
        if ("id" in context.item.profile) {
          return;
        }
        const configProfiles2 = this._configurationService.getValue(
          TerminalSettingPrefix.Profiles + platformKey
        );
        const existingProfiles = !!configProfiles2 ? Object.keys(configProfiles2) : [];
        const name = await this._quickInputService.input({
          prompt: nls.localize(
            "enterTerminalProfileName",
            "Enter terminal profile name"
          ),
          value: context.item.profile.profileName,
          validateInput: async (input) => {
            if (existingProfiles.includes(input)) {
              return nls.localize(
                "terminalProfileAlreadyExists",
                "A terminal profile already exists with that name"
              );
            }
            return void 0;
          }
        });
        if (!name) {
          return;
        }
        const newConfigValue = {
          ...configProfiles2,
          [name]: this._createNewProfileConfig(context.item.profile)
        };
        await this._configurationService.updateValue(
          profilesKey,
          newConfigValue,
          ConfigurationTarget.USER
        );
      },
      onKeyMods: (mods) => keyMods = mods
    };
    const quickPickItems = [];
    const configProfiles = profiles.filter((e) => !e.isAutoDetected);
    const autoDetectedProfiles = profiles.filter((e) => e.isAutoDetected);
    if (configProfiles.length > 0) {
      quickPickItems.push({
        type: "separator",
        label: nls.localize("terminalProfiles", "profiles")
      });
      quickPickItems.push(
        ...this._sortProfileQuickPickItems(
          configProfiles.map(
            (e) => this._createProfileQuickPickItem(e)
          ),
          defaultProfileName
        )
      );
    }
    quickPickItems.push({
      type: "separator",
      label: nls.localize(
        "ICreateContributedTerminalProfileOptions",
        "contributed"
      )
    });
    const contributedProfiles = [];
    for (const contributed of this._terminalProfileService.contributedProfiles) {
      let icon;
      if (typeof contributed.icon === "string") {
        if (contributed.icon.startsWith("$(")) {
          icon = ThemeIcon.fromString(contributed.icon);
        } else {
          icon = ThemeIcon.fromId(contributed.icon);
        }
      }
      if (!icon || !getIconRegistry().getIcon(icon.id)) {
        icon = this._terminalProfileResolverService.getDefaultIcon();
      }
      const uriClasses = getUriClasses(
        contributed,
        this._themeService.getColorTheme().type,
        true
      );
      const colorClass = getColorClass(contributed);
      const iconClasses = [];
      if (uriClasses) {
        iconClasses.push(...uriClasses);
      }
      if (colorClass) {
        iconClasses.push(colorClass);
      }
      contributedProfiles.push({
        label: `$(${icon.id}) ${contributed.title}`,
        profile: {
          extensionIdentifier: contributed.extensionIdentifier,
          title: contributed.title,
          icon: contributed.icon,
          id: contributed.id,
          color: contributed.color
        },
        profileName: contributed.title,
        iconClasses
      });
    }
    if (contributedProfiles.length > 0) {
      quickPickItems.push(
        ...this._sortProfileQuickPickItems(
          contributedProfiles,
          defaultProfileName
        )
      );
    }
    if (autoDetectedProfiles.length > 0) {
      quickPickItems.push({
        type: "separator",
        label: nls.localize("terminalProfiles.detected", "detected")
      });
      quickPickItems.push(
        ...this._sortProfileQuickPickItems(
          autoDetectedProfiles.map(
            (e) => this._createProfileQuickPickItem(e)
          ),
          defaultProfileName
        )
      );
    }
    const colorStyleDisposable = createColorStyleElement(
      this._themeService.getColorTheme()
    );
    const result = await this._quickInputService.pick(
      quickPickItems,
      options
    );
    colorStyleDisposable.dispose();
    if (!result) {
      return void 0;
    }
    if (!await this._isProfileSafe(result.profile)) {
      return void 0;
    }
    if (keyMods) {
      result.keyMods = keyMods;
    }
    return result;
  }
  _createNewProfileConfig(profile) {
    const result = { path: profile.path };
    if (profile.args) {
      result.args = profile.args;
    }
    if (profile.env) {
      result.env = profile.env;
    }
    return result;
  }
  async _isProfileSafe(profile) {
    const isUnsafePath = "isUnsafePath" in profile && profile.isUnsafePath;
    const requiresUnsafePath = "requiresUnsafePath" in profile && profile.requiresUnsafePath;
    if (!isUnsafePath && !requiresUnsafePath) {
      return true;
    }
    return await new Promise((r) => {
      const unsafePaths = [];
      if (isUnsafePath) {
        unsafePaths.push(profile.path);
      }
      if (requiresUnsafePath) {
        unsafePaths.push(requiresUnsafePath);
      }
      const handle = this._notificationService.prompt(
        Severity.Warning,
        nls.localize(
          "unsafePathWarning",
          "This terminal profile uses a potentially unsafe path that can be modified by another user: {0}. Are you sure you want to use it?",
          `"${unsafePaths.join(",")}"`
        ),
        [
          {
            label: nls.localize("yes", "Yes"),
            run: () => r(true)
          },
          {
            label: nls.localize("cancel", "Cancel"),
            run: () => r(false)
          }
        ]
      );
      handle.onDidClose(() => r(false));
    });
  }
  _createProfileQuickPickItem(profile) {
    const buttons = [
      {
        iconClass: ThemeIcon.asClassName(configureTerminalProfileIcon),
        tooltip: nls.localize(
          "createQuickLaunchProfile",
          "Configure Terminal Profile"
        )
      }
    ];
    const icon = profile.icon && ThemeIcon.isThemeIcon(profile.icon) ? profile.icon : Codicon.terminal;
    const label = `$(${icon.id}) ${profile.profileName}`;
    const friendlyPath = profile.isFromPath ? basename(profile.path) : profile.path;
    const colorClass = getColorClass(profile);
    const iconClasses = [];
    if (colorClass) {
      iconClasses.push(colorClass);
    }
    if (profile.args) {
      if (typeof profile.args === "string") {
        return {
          label,
          description: `${profile.path} ${profile.args}`,
          profile,
          profileName: profile.profileName,
          buttons,
          iconClasses
        };
      }
      const argsString = profile.args.map((e) => {
        if (e.includes(" ")) {
          return `"${e.replace(/"/g, '\\"')}"`;
        }
        return e;
      }).join(" ");
      return {
        label,
        description: `${friendlyPath} ${argsString}`,
        profile,
        profileName: profile.profileName,
        buttons,
        iconClasses
      };
    }
    return {
      label,
      description: friendlyPath,
      profile,
      profileName: profile.profileName,
      buttons,
      iconClasses
    };
  }
  _sortProfileQuickPickItems(items, defaultProfileName) {
    return items.sort((a, b) => {
      if (b.profileName === defaultProfileName) {
        return 1;
      }
      if (a.profileName === defaultProfileName) {
        return -1;
      }
      return a.profileName.localeCompare(b.profileName);
    });
  }
};
TerminalProfileQuickpick = __decorateClass([
  __decorateParam(0, ITerminalProfileService),
  __decorateParam(1, ITerminalProfileResolverService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, INotificationService)
], TerminalProfileQuickpick);
export {
  TerminalProfileQuickpick
};
