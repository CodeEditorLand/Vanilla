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
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { mixin } from "../../../base/common/objects.js";
import { isWeb } from "../../../base/common/platform.js";
import { escapeRegExpCharacters } from "../../../base/common/strings.js";
import { localize } from "../../../nls.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { ConfigurationScope, Extensions, IConfigurationRegistry } from "../../configuration/common/configurationRegistry.js";
import product from "../../product/common/product.js";
import { IProductService } from "../../product/common/productService.js";
import { Registry } from "../../registry/common/platform.js";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "./gdprTypings.js";
import { ITelemetryData, ITelemetryService, TelemetryConfiguration, TelemetryLevel, TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SECTION_ID, TELEMETRY_SETTING_ID, ICommonProperties } from "./telemetry.js";
import { cleanData, getTelemetryLevel, ITelemetryAppender } from "./telemetryUtils.js";
let TelemetryService = class {
  constructor(config, _configurationService, _productService) {
    this._configurationService = _configurationService;
    this._productService = _productService;
    this._appenders = config.appenders;
    this._commonProperties = config.commonProperties ?? /* @__PURE__ */ Object.create(null);
    this.sessionId = this._commonProperties["sessionID"];
    this.machineId = this._commonProperties["common.machineId"];
    this.sqmId = this._commonProperties["common.sqmId"];
    this.devDeviceId = this._commonProperties["common.devDeviceId"];
    this.firstSessionDate = this._commonProperties["common.firstSessionDate"];
    this.msftInternal = this._commonProperties["common.msftInternal"];
    this._piiPaths = config.piiPaths || [];
    this._telemetryLevel = TelemetryLevel.USAGE;
    this._sendErrorTelemetry = !!config.sendErrorTelemetry;
    this._cleanupPatterns = [/(vscode-)?file:\/\/\/.*?\/resources\/app\//gi];
    for (const piiPath of this._piiPaths) {
      this._cleanupPatterns.push(new RegExp(escapeRegExpCharacters(piiPath), "gi"));
      if (piiPath.indexOf("\\") >= 0) {
        this._cleanupPatterns.push(new RegExp(escapeRegExpCharacters(piiPath.replace(/\\/g, "/")), "gi"));
      }
    }
    this._updateTelemetryLevel();
    this._disposables.add(this._configurationService.onDidChangeConfiguration((e) => {
      const affectsTelemetryConfig = e.affectsConfiguration(TELEMETRY_SETTING_ID) || e.affectsConfiguration(TELEMETRY_OLD_SETTING_ID) || e.affectsConfiguration(TELEMETRY_CRASH_REPORTER_SETTING_ID);
      if (affectsTelemetryConfig) {
        this._updateTelemetryLevel();
      }
    }));
  }
  static {
    __name(this, "TelemetryService");
  }
  static IDLE_START_EVENT_NAME = "UserIdleStart";
  static IDLE_STOP_EVENT_NAME = "UserIdleStop";
  sessionId;
  machineId;
  sqmId;
  devDeviceId;
  firstSessionDate;
  msftInternal;
  _appenders;
  _commonProperties;
  _experimentProperties = {};
  _piiPaths;
  _telemetryLevel;
  _sendErrorTelemetry;
  _disposables = new DisposableStore();
  _cleanupPatterns = [];
  setExperimentProperty(name, value) {
    this._experimentProperties[name] = value;
  }
  _updateTelemetryLevel() {
    let level = getTelemetryLevel(this._configurationService);
    const collectableTelemetry = this._productService.enabledTelemetryLevels;
    if (collectableTelemetry) {
      this._sendErrorTelemetry = this.sendErrorTelemetry ? collectableTelemetry.error : false;
      const maxCollectableTelemetryLevel = collectableTelemetry.usage ? TelemetryLevel.USAGE : collectableTelemetry.error ? TelemetryLevel.ERROR : TelemetryLevel.NONE;
      level = Math.min(level, maxCollectableTelemetryLevel);
    }
    this._telemetryLevel = level;
  }
  get sendErrorTelemetry() {
    return this._sendErrorTelemetry;
  }
  get telemetryLevel() {
    return this._telemetryLevel;
  }
  dispose() {
    this._disposables.dispose();
  }
  _log(eventName, eventLevel, data) {
    if (this._telemetryLevel < eventLevel) {
      return;
    }
    data = mixin(data, this._experimentProperties);
    data = cleanData(data, this._cleanupPatterns);
    data = mixin(data, this._commonProperties);
    this._appenders.forEach((a) => a.log(eventName, data));
  }
  publicLog(eventName, data) {
    this._log(eventName, TelemetryLevel.USAGE, data);
  }
  publicLog2(eventName, data) {
    this.publicLog(eventName, data);
  }
  publicLogError(errorEventName, data) {
    if (!this._sendErrorTelemetry) {
      return;
    }
    this._log(errorEventName, TelemetryLevel.ERROR, data);
  }
  publicLogError2(eventName, data) {
    this.publicLogError(eventName, data);
  }
};
TelemetryService = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IProductService)
], TelemetryService);
function getTelemetryLevelSettingDescription() {
  const telemetryText = localize("telemetry.telemetryLevelMd", "Controls {0} telemetry, first-party extension telemetry, and participating third-party extension telemetry. Some third party extensions might not respect this setting. Consult the specific extension's documentation to be sure. Telemetry helps us better understand how {0} is performing, where improvements need to be made, and how features are being used.", product.nameLong);
  const externalLinksStatement = !product.privacyStatementUrl ? localize("telemetry.docsStatement", "Read more about the [data we collect]({0}).", "https://aka.ms/vscode-telemetry") : localize("telemetry.docsAndPrivacyStatement", "Read more about the [data we collect]({0}) and our [privacy statement]({1}).", "https://aka.ms/vscode-telemetry", product.privacyStatementUrl);
  const restartString = !isWeb ? localize("telemetry.restart", "A full restart of the application is necessary for crash reporting changes to take effect.") : "";
  const crashReportsHeader = localize("telemetry.crashReports", "Crash Reports");
  const errorsHeader = localize("telemetry.errors", "Error Telemetry");
  const usageHeader = localize("telemetry.usage", "Usage Data");
  const telemetryTableDescription = localize("telemetry.telemetryLevel.tableDescription", "The following table outlines the data sent with each setting:");
  const telemetryTable = `
|       | ${crashReportsHeader} | ${errorsHeader} | ${usageHeader} |
|:------|:---------------------:|:---------------:|:--------------:|
| all   |            \u2713          |        \u2713        |        \u2713       |
| error |            \u2713          |        \u2713        |        -       |
| crash |            \u2713          |        -        |        -       |
| off   |            -          |        -        |        -       |
`;
  const deprecatedSettingNote = localize("telemetry.telemetryLevel.deprecated", "****Note:*** If this setting is 'off', no telemetry will be sent regardless of other telemetry settings. If this setting is set to anything except 'off' and telemetry is disabled with deprecated settings, no telemetry will be sent.*");
  const telemetryDescription = `
${telemetryText} ${externalLinksStatement} ${restartString}

&nbsp;

${telemetryTableDescription}
${telemetryTable}

&nbsp;

${deprecatedSettingNote}
`;
  return telemetryDescription;
}
__name(getTelemetryLevelSettingDescription, "getTelemetryLevelSettingDescription");
Registry.as(Extensions.Configuration).registerConfiguration({
  "id": TELEMETRY_SECTION_ID,
  "order": 1,
  "type": "object",
  "title": localize("telemetryConfigurationTitle", "Telemetry"),
  "properties": {
    [TELEMETRY_SETTING_ID]: {
      "type": "string",
      "enum": [TelemetryConfiguration.ON, TelemetryConfiguration.ERROR, TelemetryConfiguration.CRASH, TelemetryConfiguration.OFF],
      "enumDescriptions": [
        localize("telemetry.telemetryLevel.default", "Sends usage data, errors, and crash reports."),
        localize("telemetry.telemetryLevel.error", "Sends general error telemetry and crash reports."),
        localize("telemetry.telemetryLevel.crash", "Sends OS level crash reports."),
        localize("telemetry.telemetryLevel.off", "Disables all product telemetry.")
      ],
      "markdownDescription": getTelemetryLevelSettingDescription(),
      "default": TelemetryConfiguration.ON,
      "restricted": true,
      "scope": ConfigurationScope.APPLICATION,
      "tags": ["usesOnlineServices", "telemetry"]
    }
  }
});
Registry.as(Extensions.Configuration).registerConfiguration({
  "id": TELEMETRY_SECTION_ID,
  "order": 110,
  "type": "object",
  "title": localize("telemetryConfigurationTitle", "Telemetry"),
  "properties": {
    [TELEMETRY_OLD_SETTING_ID]: {
      "type": "boolean",
      "markdownDescription": !product.privacyStatementUrl ? localize("telemetry.enableTelemetry", "Enable diagnostic data to be collected. This helps us to better understand how {0} is performing and where improvements need to be made.", product.nameLong) : localize("telemetry.enableTelemetryMd", "Enable diagnostic data to be collected. This helps us to better understand how {0} is performing and where improvements need to be made. [Read more]({1}) about what we collect and our privacy statement.", product.nameLong, product.privacyStatementUrl),
      "default": true,
      "restricted": true,
      "markdownDeprecationMessage": localize("enableTelemetryDeprecated", "If this setting is false, no telemetry will be sent regardless of the new setting's value. Deprecated in favor of the {0} setting.", `\`#${TELEMETRY_SETTING_ID}#\``),
      "scope": ConfigurationScope.APPLICATION,
      "tags": ["usesOnlineServices", "telemetry"]
    }
  }
});
export {
  TelemetryService
};
//# sourceMappingURL=telemetryService.js.map
