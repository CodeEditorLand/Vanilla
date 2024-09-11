var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as DOM from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { SimpleIconLabel } from "../../../../base/browser/ui/iconLabel/simpleIconLabel.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import { IMarkdownString, MarkdownString } from "../../../../base/common/htmlContent.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { IDisposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { SettingsTreeSettingElement } from "./settingsTreeModels.js";
import { POLICY_SETTING_TAG } from "../common/preferences.js";
import { IWorkbenchConfigurationService } from "../../../services/configuration/common/configuration.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
const $ = DOM.$;
let cachedSyncIgnoredSettingsSet = /* @__PURE__ */ new Set();
let cachedSyncIgnoredSettings = [];
let SettingsTreeIndicatorsLabel = class {
  constructor(container, configurationService, hoverService, userDataSyncEnablementService, languageService, userDataProfilesService, commandService) {
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.languageService = languageService;
    this.userDataProfilesService = userDataProfilesService;
    this.commandService = commandService;
    this.indicatorsContainerElement = DOM.append(container, $(".setting-indicators-container"));
    this.indicatorsContainerElement.style.display = "inline";
    this.profilesEnabled = this.userDataProfilesService.isEnabled();
    this.workspaceTrustIndicator = this.createWorkspaceTrustIndicator();
    this.scopeOverridesIndicator = this.createScopeOverridesIndicator();
    this.syncIgnoredIndicator = this.createSyncIgnoredIndicator();
    this.defaultOverrideIndicator = this.createDefaultOverrideIndicator();
    this.allIndicators = [this.workspaceTrustIndicator, this.scopeOverridesIndicator, this.syncIgnoredIndicator, this.defaultOverrideIndicator];
  }
  static {
    __name(this, "SettingsTreeIndicatorsLabel");
  }
  indicatorsContainerElement;
  workspaceTrustIndicator;
  scopeOverridesIndicator;
  syncIgnoredIndicator;
  defaultOverrideIndicator;
  allIndicators;
  profilesEnabled;
  keybindingListeners = new DisposableStore();
  focusedIndex = 0;
  defaultHoverOptions = {
    trapFocus: true,
    position: {
      hoverPosition: HoverPosition.BELOW
    },
    appearance: {
      showPointer: true,
      compact: false
    }
  };
  addHoverDisposables(disposables, element, showHover) {
    disposables.clear();
    const scheduler = disposables.add(new RunOnceScheduler(() => {
      const hover = showHover(false);
      if (hover) {
        disposables.add(hover);
      }
    }, this.configurationService.getValue("workbench.hover.delay")));
    disposables.add(DOM.addDisposableListener(element, DOM.EventType.MOUSE_OVER, () => {
      if (!scheduler.isScheduled()) {
        scheduler.schedule();
      }
    }));
    disposables.add(DOM.addDisposableListener(element, DOM.EventType.MOUSE_LEAVE, () => {
      scheduler.cancel();
    }));
    disposables.add(DOM.addDisposableListener(element, DOM.EventType.KEY_DOWN, (e) => {
      const evt = new StandardKeyboardEvent(e);
      if (evt.equals(KeyCode.Space) || evt.equals(KeyCode.Enter)) {
        const hover = showHover(true);
        if (hover) {
          disposables.add(hover);
        }
        e.preventDefault();
      }
    }));
  }
  createWorkspaceTrustIndicator() {
    const disposables = new DisposableStore();
    const workspaceTrustElement = $("span.setting-indicator.setting-item-workspace-trust");
    const workspaceTrustLabel = disposables.add(new SimpleIconLabel(workspaceTrustElement));
    workspaceTrustLabel.text = "$(warning) " + localize("workspaceUntrustedLabel", "Setting value not applied");
    const content = localize("trustLabel", "The setting value can only be applied in a trusted workspace.");
    const showHover = /* @__PURE__ */ __name((focus) => {
      return this.hoverService.showHover({
        ...this.defaultHoverOptions,
        content,
        target: workspaceTrustElement,
        actions: [{
          label: localize("manageWorkspaceTrust", "Manage Workspace Trust"),
          commandId: "workbench.trust.manage",
          run: /* @__PURE__ */ __name((target) => {
            this.commandService.executeCommand("workbench.trust.manage");
          }, "run")
        }]
      }, focus);
    }, "showHover");
    this.addHoverDisposables(disposables, workspaceTrustElement, showHover);
    return {
      element: workspaceTrustElement,
      label: workspaceTrustLabel,
      disposables
    };
  }
  createScopeOverridesIndicator() {
    const disposables = new DisposableStore();
    const otherOverridesElement = $("span.setting-item-overrides");
    const otherOverridesLabel = disposables.add(new SimpleIconLabel(otherOverridesElement));
    return {
      element: otherOverridesElement,
      label: otherOverridesLabel,
      disposables
    };
  }
  createSyncIgnoredIndicator() {
    const disposables = new DisposableStore();
    const syncIgnoredElement = $("span.setting-indicator.setting-item-ignored");
    const syncIgnoredLabel = disposables.add(new SimpleIconLabel(syncIgnoredElement));
    syncIgnoredLabel.text = localize("extensionSyncIgnoredLabel", "Not synced");
    const syncIgnoredHoverContent = localize("syncIgnoredTitle", "This setting is ignored during sync");
    const showHover = /* @__PURE__ */ __name((focus) => {
      return this.hoverService.showHover({
        ...this.defaultHoverOptions,
        content: syncIgnoredHoverContent,
        target: syncIgnoredElement
      }, focus);
    }, "showHover");
    this.addHoverDisposables(disposables, syncIgnoredElement, showHover);
    return {
      element: syncIgnoredElement,
      label: syncIgnoredLabel,
      disposables
    };
  }
  createDefaultOverrideIndicator() {
    const disposables = new DisposableStore();
    const defaultOverrideIndicator = $("span.setting-indicator.setting-item-default-overridden");
    const defaultOverrideLabel = disposables.add(new SimpleIconLabel(defaultOverrideIndicator));
    defaultOverrideLabel.text = localize("defaultOverriddenLabel", "Default value changed");
    return {
      element: defaultOverrideIndicator,
      label: defaultOverrideLabel,
      disposables
    };
  }
  render() {
    const indicatorsToShow = this.allIndicators.filter((indicator) => {
      return indicator.element.style.display !== "none";
    });
    this.indicatorsContainerElement.innerText = "";
    this.indicatorsContainerElement.style.display = "none";
    if (indicatorsToShow.length) {
      this.indicatorsContainerElement.style.display = "inline";
      DOM.append(this.indicatorsContainerElement, $("span", void 0, "("));
      for (let i = 0; i < indicatorsToShow.length - 1; i++) {
        DOM.append(this.indicatorsContainerElement, indicatorsToShow[i].element);
        DOM.append(this.indicatorsContainerElement, $("span.comma", void 0, " \u2022 "));
      }
      DOM.append(this.indicatorsContainerElement, indicatorsToShow[indicatorsToShow.length - 1].element);
      DOM.append(this.indicatorsContainerElement, $("span", void 0, ")"));
      this.resetIndicatorNavigationKeyBindings(indicatorsToShow);
    }
  }
  resetIndicatorNavigationKeyBindings(indicators) {
    this.keybindingListeners.clear();
    this.indicatorsContainerElement.role = indicators.length >= 1 ? "toolbar" : "button";
    if (!indicators.length) {
      return;
    }
    const firstElement = indicators[0].focusElement ?? indicators[0].element;
    firstElement.tabIndex = 0;
    this.keybindingListeners.add(DOM.addDisposableListener(this.indicatorsContainerElement, "keydown", (e) => {
      const ev = new StandardKeyboardEvent(e);
      let handled = true;
      if (ev.equals(KeyCode.Home)) {
        this.focusIndicatorAt(indicators, 0);
      } else if (ev.equals(KeyCode.End)) {
        this.focusIndicatorAt(indicators, indicators.length - 1);
      } else if (ev.equals(KeyCode.RightArrow)) {
        const indexToFocus = (this.focusedIndex + 1) % indicators.length;
        this.focusIndicatorAt(indicators, indexToFocus);
      } else if (ev.equals(KeyCode.LeftArrow)) {
        const indexToFocus = this.focusedIndex ? this.focusedIndex - 1 : indicators.length - 1;
        this.focusIndicatorAt(indicators, indexToFocus);
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }));
  }
  focusIndicatorAt(indicators, index) {
    if (index === this.focusedIndex) {
      return;
    }
    const indicator = indicators[index];
    const elementToFocus = indicator.focusElement ?? indicator.element;
    elementToFocus.tabIndex = 0;
    elementToFocus.focus();
    const currentlyFocusedIndicator = indicators[this.focusedIndex];
    const previousFocusedElement = currentlyFocusedIndicator.focusElement ?? currentlyFocusedIndicator.element;
    previousFocusedElement.tabIndex = -1;
    this.focusedIndex = index;
  }
  updateWorkspaceTrust(element) {
    this.workspaceTrustIndicator.element.style.display = element.isUntrusted ? "inline" : "none";
    this.render();
  }
  updateSyncIgnored(element, ignoredSettings) {
    this.syncIgnoredIndicator.element.style.display = this.userDataSyncEnablementService.isEnabled() && ignoredSettings.includes(element.setting.key) ? "inline" : "none";
    this.render();
    if (cachedSyncIgnoredSettings !== ignoredSettings) {
      cachedSyncIgnoredSettings = ignoredSettings;
      cachedSyncIgnoredSettingsSet = new Set(cachedSyncIgnoredSettings);
    }
  }
  getInlineScopeDisplayText(completeScope) {
    const [scope, language] = completeScope.split(":");
    const localizedScope = scope === "user" ? localize("user", "User") : scope === "workspace" ? localize("workspace", "Workspace") : localize("remote", "Remote");
    if (language) {
      return `${this.languageService.getLanguageName(language)} > ${localizedScope}`;
    }
    return localizedScope;
  }
  dispose() {
    this.keybindingListeners.dispose();
    for (const indicator of this.allIndicators) {
      indicator.disposables.dispose();
    }
  }
  updateScopeOverrides(element, onDidClickOverrideElement, onApplyFilter) {
    this.scopeOverridesIndicator.element.innerText = "";
    this.scopeOverridesIndicator.element.style.display = "none";
    this.scopeOverridesIndicator.focusElement = this.scopeOverridesIndicator.element;
    if (element.hasPolicyValue) {
      this.scopeOverridesIndicator.element.style.display = "inline";
      this.scopeOverridesIndicator.element.classList.add("setting-indicator");
      this.scopeOverridesIndicator.label.text = "$(warning) " + localize("policyLabelText", "Setting value not applied");
      const content = localize("policyDescription", "This setting is managed by your organization and its applied value cannot be changed.");
      const showHover = /* @__PURE__ */ __name((focus) => {
        return this.hoverService.showHover({
          ...this.defaultHoverOptions,
          content,
          actions: [{
            label: localize("policyFilterLink", "View policy settings"),
            commandId: "_settings.action.viewPolicySettings",
            run: /* @__PURE__ */ __name((_) => {
              onApplyFilter.fire(`@${POLICY_SETTING_TAG}`);
            }, "run")
          }],
          target: this.scopeOverridesIndicator.element
        }, focus);
      }, "showHover");
      this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
    } else if (this.profilesEnabled && element.settingsTarget === ConfigurationTarget.USER_LOCAL && this.configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
      this.scopeOverridesIndicator.element.style.display = "inline";
      this.scopeOverridesIndicator.element.classList.add("setting-indicator");
      this.scopeOverridesIndicator.label.text = localize("applicationSetting", "Applies to all profiles");
      const content = localize("applicationSettingDescription", "The setting is not specific to the current profile, and will retain its value when switching profiles.");
      const showHover = /* @__PURE__ */ __name((focus) => {
        return this.hoverService.showHover({
          ...this.defaultHoverOptions,
          content,
          target: this.scopeOverridesIndicator.element
        }, focus);
      }, "showHover");
      this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
    } else if (element.overriddenScopeList.length || element.overriddenDefaultsLanguageList.length) {
      if (element.overriddenScopeList.length === 1 && !element.overriddenDefaultsLanguageList.length) {
        this.scopeOverridesIndicator.element.style.display = "inline";
        this.scopeOverridesIndicator.element.classList.remove("setting-indicator");
        this.scopeOverridesIndicator.disposables.clear();
        const prefaceText = element.isConfigured ? localize("alsoConfiguredIn", "Also modified in") : localize("configuredIn", "Modified in");
        this.scopeOverridesIndicator.label.text = `${prefaceText} `;
        const overriddenScope = element.overriddenScopeList[0];
        const view = DOM.append(this.scopeOverridesIndicator.element, $("a.modified-scope", void 0, this.getInlineScopeDisplayText(overriddenScope)));
        view.tabIndex = -1;
        this.scopeOverridesIndicator.focusElement = view;
        const onClickOrKeydown = /* @__PURE__ */ __name((e) => {
          const [scope, language] = overriddenScope.split(":");
          onDidClickOverrideElement.fire({
            settingKey: element.setting.key,
            scope,
            language
          });
          e.preventDefault();
          e.stopPropagation();
        }, "onClickOrKeydown");
        this.scopeOverridesIndicator.disposables.add(DOM.addDisposableListener(view, DOM.EventType.CLICK, (e) => {
          onClickOrKeydown(e);
        }));
        this.scopeOverridesIndicator.disposables.add(DOM.addDisposableListener(view, DOM.EventType.KEY_DOWN, (e) => {
          const ev = new StandardKeyboardEvent(e);
          if (ev.equals(KeyCode.Space) || ev.equals(KeyCode.Enter)) {
            onClickOrKeydown(e);
          }
        }));
      } else {
        this.scopeOverridesIndicator.element.style.display = "inline";
        this.scopeOverridesIndicator.element.classList.add("setting-indicator");
        const scopeOverridesLabelText = element.isConfigured ? localize("alsoConfiguredElsewhere", "Also modified elsewhere") : localize("configuredElsewhere", "Modified elsewhere");
        this.scopeOverridesIndicator.label.text = scopeOverridesLabelText;
        let contentMarkdownString = "";
        if (element.overriddenScopeList.length) {
          const prefaceText = element.isConfigured ? localize("alsoModifiedInScopes", "The setting has also been modified in the following scopes:") : localize("modifiedInScopes", "The setting has been modified in the following scopes:");
          contentMarkdownString = prefaceText;
          for (const scope of element.overriddenScopeList) {
            const scopeDisplayText = this.getInlineScopeDisplayText(scope);
            contentMarkdownString += `
- [${scopeDisplayText}](${encodeURIComponent(scope)} "${getAccessibleScopeDisplayText(scope, this.languageService)}")`;
          }
        }
        if (element.overriddenDefaultsLanguageList.length) {
          if (contentMarkdownString) {
            contentMarkdownString += `

`;
          }
          const prefaceText = localize("hasDefaultOverridesForLanguages", "The following languages have default overrides:");
          contentMarkdownString += prefaceText;
          for (const language of element.overriddenDefaultsLanguageList) {
            const scopeDisplayText = this.languageService.getLanguageName(language);
            contentMarkdownString += `
- [${scopeDisplayText}](${encodeURIComponent(`default:${language}`)} "${scopeDisplayText}")`;
          }
        }
        const content = {
          value: contentMarkdownString,
          isTrusted: false,
          supportHtml: false
        };
        const showHover = /* @__PURE__ */ __name((focus) => {
          return this.hoverService.showHover({
            ...this.defaultHoverOptions,
            content,
            linkHandler: /* @__PURE__ */ __name((url) => {
              const [scope, language] = decodeURIComponent(url).split(":");
              onDidClickOverrideElement.fire({
                settingKey: element.setting.key,
                scope,
                language
              });
            }, "linkHandler"),
            target: this.scopeOverridesIndicator.element
          }, focus);
        }, "showHover");
        this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
      }
    }
    this.render();
  }
  updateDefaultOverrideIndicator(element) {
    this.defaultOverrideIndicator.element.style.display = "none";
    let sourceToDisplay = getDefaultValueSourceToDisplay(element);
    if (sourceToDisplay !== void 0) {
      this.defaultOverrideIndicator.element.style.display = "inline";
      this.defaultOverrideIndicator.disposables.clear();
      if (Array.isArray(sourceToDisplay) && sourceToDisplay.length === 1) {
        sourceToDisplay = sourceToDisplay[0];
      }
      let defaultOverrideHoverContent;
      if (!Array.isArray(sourceToDisplay)) {
        defaultOverrideHoverContent = localize("defaultOverriddenDetails", "Default setting value overridden by `{0}`", sourceToDisplay);
      } else {
        sourceToDisplay = sourceToDisplay.map((source) => `\`${source}\``);
        defaultOverrideHoverContent = localize("multipledefaultOverriddenDetails", "A default values has been set by {0}", sourceToDisplay.slice(0, -1).join(", ") + " & " + sourceToDisplay.slice(-1));
      }
      const showHover = /* @__PURE__ */ __name((focus) => {
        return this.hoverService.showHover({
          content: new MarkdownString().appendMarkdown(defaultOverrideHoverContent),
          target: this.defaultOverrideIndicator.element,
          position: {
            hoverPosition: HoverPosition.BELOW
          },
          appearance: {
            showPointer: true,
            compact: false
          }
        }, focus);
      }, "showHover");
      this.addHoverDisposables(this.defaultOverrideIndicator.disposables, this.defaultOverrideIndicator.element, showHover);
    }
    this.render();
  }
};
SettingsTreeIndicatorsLabel = __decorateClass([
  __decorateParam(1, IWorkbenchConfigurationService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, IUserDataSyncEnablementService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IUserDataProfilesService),
  __decorateParam(6, ICommandService)
], SettingsTreeIndicatorsLabel);
function getDefaultValueSourceToDisplay(element) {
  let sourceToDisplay;
  const defaultValueSource = element.defaultValueSource;
  if (defaultValueSource) {
    if (defaultValueSource instanceof Map) {
      sourceToDisplay = [];
      for (const [, value] of defaultValueSource) {
        const newValue = typeof value !== "string" ? value.displayName ?? value.id : value;
        if (!sourceToDisplay.includes(newValue)) {
          sourceToDisplay.push(newValue);
        }
      }
    } else if (typeof defaultValueSource === "string") {
      sourceToDisplay = defaultValueSource;
    } else {
      sourceToDisplay = defaultValueSource.displayName ?? defaultValueSource.id;
    }
  }
  return sourceToDisplay;
}
__name(getDefaultValueSourceToDisplay, "getDefaultValueSourceToDisplay");
function getAccessibleScopeDisplayText(completeScope, languageService) {
  const [scope, language] = completeScope.split(":");
  const localizedScope = scope === "user" ? localize("user", "User") : scope === "workspace" ? localize("workspace", "Workspace") : localize("remote", "Remote");
  if (language) {
    return localize("modifiedInScopeForLanguage", "The {0} scope for {1}", localizedScope, languageService.getLanguageName(language));
  }
  return localizedScope;
}
__name(getAccessibleScopeDisplayText, "getAccessibleScopeDisplayText");
function getAccessibleScopeDisplayMidSentenceText(completeScope, languageService) {
  const [scope, language] = completeScope.split(":");
  const localizedScope = scope === "user" ? localize("user", "User") : scope === "workspace" ? localize("workspace", "Workspace") : localize("remote", "Remote");
  if (language) {
    return localize("modifiedInScopeForLanguageMidSentence", "the {0} scope for {1}", localizedScope.toLowerCase(), languageService.getLanguageName(language));
  }
  return localizedScope;
}
__name(getAccessibleScopeDisplayMidSentenceText, "getAccessibleScopeDisplayMidSentenceText");
function getIndicatorsLabelAriaLabel(element, configurationService, userDataProfilesService, languageService) {
  const ariaLabelSections = [];
  if (element.isUntrusted) {
    ariaLabelSections.push(localize("workspaceUntrustedAriaLabel", "Workspace untrusted; setting value not applied"));
  }
  if (element.hasPolicyValue) {
    ariaLabelSections.push(localize("policyDescriptionAccessible", "Managed by organization policy; setting value not applied"));
  } else if (userDataProfilesService.isEnabled() && element.settingsTarget === ConfigurationTarget.USER_LOCAL && configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
    ariaLabelSections.push(localize("applicationSettingDescriptionAccessible", "Setting value retained when switching profiles"));
  } else {
    const otherOverridesStart = element.isConfigured ? localize("alsoConfiguredIn", "Also modified in") : localize("configuredIn", "Modified in");
    const otherOverridesList = element.overriddenScopeList.map((scope) => getAccessibleScopeDisplayMidSentenceText(scope, languageService)).join(", ");
    if (element.overriddenScopeList.length) {
      ariaLabelSections.push(`${otherOverridesStart} ${otherOverridesList}`);
    }
  }
  if (cachedSyncIgnoredSettingsSet.has(element.setting.key)) {
    ariaLabelSections.push(localize("syncIgnoredAriaLabel", "Setting ignored during sync"));
  }
  let sourceToDisplay = getDefaultValueSourceToDisplay(element);
  if (sourceToDisplay !== void 0) {
    if (Array.isArray(sourceToDisplay) && sourceToDisplay.length === 1) {
      sourceToDisplay = sourceToDisplay[0];
    }
    let overriddenDetailsText;
    if (!Array.isArray(sourceToDisplay)) {
      overriddenDetailsText = localize("defaultOverriddenDetailsAriaLabel", "{0} overrides the default value", sourceToDisplay);
    } else {
      overriddenDetailsText = localize("multipleDefaultOverriddenDetailsAriaLabel", "{0} override the default value", sourceToDisplay.slice(0, -1).join(", ") + " & " + sourceToDisplay.slice(-1));
    }
    ariaLabelSections.push(overriddenDetailsText);
  }
  const otherLanguageOverridesList = element.overriddenDefaultsLanguageList.map((language) => languageService.getLanguageName(language)).join(", ");
  if (element.overriddenDefaultsLanguageList.length) {
    const otherLanguageOverridesText = localize("defaultOverriddenLanguagesList", "Language-specific default values exist for {0}", otherLanguageOverridesList);
    ariaLabelSections.push(otherLanguageOverridesText);
  }
  const ariaLabel = ariaLabelSections.join(". ");
  return ariaLabel;
}
__name(getIndicatorsLabelAriaLabel, "getIndicatorsLabelAriaLabel");
export {
  SettingsTreeIndicatorsLabel,
  getIndicatorsLabelAriaLabel
};
//# sourceMappingURL=settingsEditorSettingIndicators.js.map
