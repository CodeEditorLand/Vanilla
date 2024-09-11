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
import * as nls from "../../../../nls.js";
import { IPreferencesService, ISetting } from "../../../services/preferences/common/preferences.js";
import { settingKeyToDisplayFormat } from "../../preferences/browser/settingsTreeModels.js";
import { URI } from "../../../../base/common/uri.js";
import { ConfigurationTarget, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { IAction } from "../../../../base/common/actions.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { Schemas } from "../../../../base/common/network.js";
import { Tokens } from "../../../../base/common/marked/marked.js";
let SimpleSettingRenderer = class {
  // setting ID to feature value
  constructor(_configurationService, _contextMenuService, _preferencesService, _telemetryService, _clipboardService) {
    this._configurationService = _configurationService;
    this._contextMenuService = _contextMenuService;
    this._preferencesService = _preferencesService;
    this._telemetryService = _telemetryService;
    this._clipboardService = _clipboardService;
    this.codeSettingRegex = new RegExp(`^<a (href)=".*code.*://settings/([^\\s"]+)"(?:\\s*codesetting="([^"]+)")?>`);
  }
  static {
    __name(this, "SimpleSettingRenderer");
  }
  codeSettingRegex;
  _updatedSettings = /* @__PURE__ */ new Map();
  // setting ID to user's original setting value
  _encounteredSettings = /* @__PURE__ */ new Map();
  // setting ID to setting
  _featuredSettings = /* @__PURE__ */ new Map();
  get featuredSettingStates() {
    const result = /* @__PURE__ */ new Map();
    for (const [settingId, value] of this._featuredSettings) {
      result.set(settingId, this._configurationService.getValue(settingId) === value);
    }
    return result;
  }
  getHtmlRenderer() {
    return ({ raw }) => {
      const match = this.codeSettingRegex.exec(raw);
      if (match && match.length === 4) {
        const settingId = match[2];
        const rendered = this.render(settingId, match[3]);
        if (rendered) {
          raw = raw.replace(this.codeSettingRegex, rendered);
        }
      }
      return raw;
    };
  }
  settingToUriString(settingId, value) {
    return `${Schemas.codeSetting}://${settingId}${value ? `/${value}` : ""}`;
  }
  getSetting(settingId) {
    if (this._encounteredSettings.has(settingId)) {
      return this._encounteredSettings.get(settingId);
    }
    return this._preferencesService.getSetting(settingId);
  }
  parseValue(settingId, value) {
    if (value === "undefined" || value === "") {
      return void 0;
    }
    const setting = this.getSetting(settingId);
    if (!setting) {
      return value;
    }
    switch (setting.type) {
      case "boolean":
        return value === "true";
      case "number":
        return parseInt(value, 10);
      case "string":
      default:
        return value;
    }
  }
  render(settingId, newValue) {
    const setting = this.getSetting(settingId);
    if (!setting) {
      return "";
    }
    return this.renderSetting(setting, newValue);
  }
  viewInSettingsMessage(settingId, alreadyDisplayed) {
    if (alreadyDisplayed) {
      return nls.localize("viewInSettings", "View in Settings");
    } else {
      const displayName = settingKeyToDisplayFormat(settingId);
      return nls.localize("viewInSettingsDetailed", 'View "{0}: {1}" in Settings', displayName.category, displayName.label);
    }
  }
  restorePreviousSettingMessage(settingId) {
    const displayName = settingKeyToDisplayFormat(settingId);
    return nls.localize("restorePreviousValue", 'Restore value of "{0}: {1}"', displayName.category, displayName.label);
  }
  booleanSettingMessage(setting, booleanValue) {
    const currentValue = this._configurationService.getValue(setting.key);
    if (currentValue === booleanValue || currentValue === void 0 && setting.value === booleanValue) {
      return void 0;
    }
    const displayName = settingKeyToDisplayFormat(setting.key);
    if (booleanValue) {
      return nls.localize("trueMessage", 'Enable "{0}: {1}"', displayName.category, displayName.label);
    } else {
      return nls.localize("falseMessage", 'Disable "{0}: {1}"', displayName.category, displayName.label);
    }
  }
  stringSettingMessage(setting, stringValue) {
    const currentValue = this._configurationService.getValue(setting.key);
    if (currentValue === stringValue || currentValue === void 0 && setting.value === stringValue) {
      return void 0;
    }
    const displayName = settingKeyToDisplayFormat(setting.key);
    return nls.localize("stringValue", 'Set "{0}: {1}" to "{2}"', displayName.category, displayName.label, stringValue);
  }
  numberSettingMessage(setting, numberValue) {
    const currentValue = this._configurationService.getValue(setting.key);
    if (currentValue === numberValue || currentValue === void 0 && setting.value === numberValue) {
      return void 0;
    }
    const displayName = settingKeyToDisplayFormat(setting.key);
    return nls.localize("numberValue", 'Set "{0}: {1}" to {2}', displayName.category, displayName.label, numberValue);
  }
  renderSetting(setting, newValue) {
    const href = this.settingToUriString(setting.key, newValue);
    const title = nls.localize("changeSettingTitle", "View or change setting");
    return `<code tabindex="0"><a href="${href}" class="codesetting" title="${title}" aria-role="button"><svg width="14" height="14" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"/></svg>
			<span class="separator"></span>
			<span class="setting-name">${setting.key}</span>
		</a></code>`;
  }
  getSettingMessage(setting, newValue) {
    if (setting.type === "boolean") {
      return this.booleanSettingMessage(setting, newValue);
    } else if (setting.type === "string") {
      return this.stringSettingMessage(setting, newValue);
    } else if (setting.type === "number") {
      return this.numberSettingMessage(setting, newValue);
    }
    return void 0;
  }
  async restoreSetting(settingId) {
    const userOriginalSettingValue = this._updatedSettings.get(settingId);
    this._updatedSettings.delete(settingId);
    return this._configurationService.updateValue(settingId, userOriginalSettingValue, ConfigurationTarget.USER);
  }
  async setSetting(settingId, currentSettingValue, newSettingValue) {
    this._updatedSettings.set(settingId, currentSettingValue);
    return this._configurationService.updateValue(settingId, newSettingValue, ConfigurationTarget.USER);
  }
  getActions(uri) {
    if (uri.scheme !== Schemas.codeSetting) {
      return;
    }
    const actions = [];
    const settingId = uri.authority;
    const newSettingValue = this.parseValue(uri.authority, uri.path.substring(1));
    const currentSettingValue = this._configurationService.inspect(settingId).userValue;
    if (newSettingValue !== void 0 && newSettingValue === currentSettingValue && this._updatedSettings.has(settingId)) {
      const restoreMessage = this.restorePreviousSettingMessage(settingId);
      actions.push({
        class: void 0,
        id: "restoreSetting",
        enabled: true,
        tooltip: restoreMessage,
        label: restoreMessage,
        run: /* @__PURE__ */ __name(() => {
          return this.restoreSetting(settingId);
        }, "run")
      });
    } else if (newSettingValue !== void 0) {
      const setting = this.getSetting(settingId);
      const trySettingMessage = setting ? this.getSettingMessage(setting, newSettingValue) : void 0;
      if (setting && trySettingMessage) {
        actions.push({
          class: void 0,
          id: "trySetting",
          enabled: currentSettingValue !== newSettingValue,
          tooltip: trySettingMessage,
          label: trySettingMessage,
          run: /* @__PURE__ */ __name(() => {
            this.setSetting(settingId, currentSettingValue, newSettingValue);
          }, "run")
        });
      }
    }
    const viewInSettingsMessage = this.viewInSettingsMessage(settingId, actions.length > 0);
    actions.push({
      class: void 0,
      enabled: true,
      id: "viewInSettings",
      tooltip: viewInSettingsMessage,
      label: viewInSettingsMessage,
      run: /* @__PURE__ */ __name(() => {
        return this._preferencesService.openApplicationSettings({ query: `@id:${settingId}` });
      }, "run")
    });
    actions.push({
      class: void 0,
      enabled: true,
      id: "copySettingId",
      tooltip: nls.localize("copySettingId", "Copy Setting ID"),
      label: nls.localize("copySettingId", "Copy Setting ID"),
      run: /* @__PURE__ */ __name(() => {
        this._clipboardService.writeText(settingId);
      }, "run")
    });
    return actions;
  }
  showContextMenu(uri, x, y) {
    const actions = this.getActions(uri);
    if (!actions) {
      return;
    }
    this._contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => ({ x, y }), "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
      getActionViewItem: /* @__PURE__ */ __name((action) => {
        return new ActionViewItem(action, action, { label: true });
      }, "getActionViewItem")
    });
  }
  async updateSetting(uri, x, y) {
    if (uri.scheme === Schemas.codeSetting) {
      this._telemetryService.publicLog2("releaseNotesSettingAction", {
        settingId: uri.authority
      });
      return this.showContextMenu(uri, x, y);
    }
  }
};
SimpleSettingRenderer = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IClipboardService)
], SimpleSettingRenderer);
export {
  SimpleSettingRenderer
};
//# sourceMappingURL=markdownSettingRenderer.js.map
