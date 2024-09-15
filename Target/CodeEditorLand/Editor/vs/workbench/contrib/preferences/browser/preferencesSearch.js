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
import { distinct } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  matchesContiguousSubString,
  matchesWords
} from "../../../../base/common/filters.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import * as strings from "../../../../base/common/strings.js";
import {
  TfIdfCalculator
} from "../../../../base/common/tfIdf.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IExtensionManagementService
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionType } from "../../../../platform/extensions/common/extensions.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  IAiRelatedInformationService,
  RelatedInformationType
} from "../../../services/aiRelatedInformation/common/aiRelatedInformation.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import {
  SettingMatchType
} from "../../../services/preferences/common/preferences.js";
import { nullRange } from "../../../services/preferences/common/preferencesModels.js";
import {
  IPreferencesSearchService
} from "../common/preferences.js";
let PreferencesSearchService = class extends Disposable {
  constructor(instantiationService, configurationService, extensionManagementService, extensionEnablementService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.extensionManagementService = extensionManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this._installedExtensions = this.extensionManagementService.getInstalled(ExtensionType.User).then((exts) => {
      return exts.filter(
        (ext) => this.extensionEnablementService.isEnabled(ext)
      ).filter(
        (ext) => ext.manifest && ext.manifest.contributes && ext.manifest.contributes.configuration
      ).filter((ext) => !!ext.identifier.uuid);
    });
  }
  static {
    __name(this, "PreferencesSearchService");
  }
  // @ts-expect-error disable remote search for now, ref https://github.com/microsoft/vscode/issues/172411
  _installedExtensions;
  _remoteSearchProvider;
  get remoteSearchAllowed() {
    const workbenchSettings = this.configurationService.getValue().workbench.settings;
    return workbenchSettings.enableNaturalLanguageSearch;
  }
  getRemoteSearchProvider(filter) {
    if (!this.remoteSearchAllowed) {
      return void 0;
    }
    this._remoteSearchProvider ??= this.instantiationService.createInstance(RemoteSearchProvider);
    this._remoteSearchProvider.setFilter(filter);
    return this._remoteSearchProvider;
  }
  getLocalSearchProvider(filter) {
    return this.instantiationService.createInstance(
      LocalSearchProvider,
      filter
    );
  }
};
PreferencesSearchService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IWorkbenchExtensionEnablementService)
], PreferencesSearchService);
function cleanFilter(filter) {
  return filter.replace(/[":]/g, " ").replace(/ {2}/g, " ").trim();
}
__name(cleanFilter, "cleanFilter");
let LocalSearchProvider = class {
  constructor(_filter, configurationService) {
    this._filter = _filter;
    this.configurationService = configurationService;
    this._filter = cleanFilter(this._filter);
  }
  static {
    __name(this, "LocalSearchProvider");
  }
  static EXACT_MATCH_SCORE = 1e4;
  static START_SCORE = 1e3;
  searchModel(preferencesModel, token) {
    if (!this._filter) {
      return Promise.resolve(null);
    }
    let orderedScore = LocalSearchProvider.START_SCORE;
    const settingMatcher = /* @__PURE__ */ __name((setting) => {
      const { matches, matchType } = new SettingMatches(
        this._filter,
        setting,
        true,
        true,
        (filter, setting2) => preferencesModel.findValueMatches(filter, setting2),
        this.configurationService
      );
      const score = this._filter === setting.key ? LocalSearchProvider.EXACT_MATCH_SCORE : orderedScore--;
      return matches.length ? {
        matches,
        matchType,
        score
      } : null;
    }, "settingMatcher");
    const filterMatches = preferencesModel.filterSettings(
      this._filter,
      this.getGroupFilter(this._filter),
      settingMatcher
    );
    const exactMatch = filterMatches.find(
      (m) => m.score === LocalSearchProvider.EXACT_MATCH_SCORE
    );
    if (exactMatch) {
      return Promise.resolve({
        filterMatches: [exactMatch],
        exactMatch: true
      });
    } else {
      return Promise.resolve({
        filterMatches
      });
    }
  }
  getGroupFilter(filter) {
    const regex = strings.createRegExp(filter, false, { global: true });
    return (group) => {
      return group.id !== "defaultOverrides" && regex.test(group.title);
    };
  }
};
LocalSearchProvider = __decorateClass([
  __decorateParam(1, IConfigurationService)
], LocalSearchProvider);
let SettingMatches = class {
  constructor(searchString, setting, requireFullQueryMatch, searchDescription, valuesMatcher, configurationService) {
    this.searchDescription = searchDescription;
    this.configurationService = configurationService;
    this.matches = distinct(
      this._findMatchesInSetting(searchString, setting),
      (match) => `${match.startLineNumber}_${match.startColumn}_${match.endLineNumber}_${match.endColumn}_`
    );
  }
  static {
    __name(this, "SettingMatches");
  }
  matches;
  matchType = SettingMatchType.None;
  _findMatchesInSetting(searchString, setting) {
    const result = this._doFindMatchesInSetting(searchString, setting);
    return result;
  }
  _keyToLabel(settingId) {
    const label = settingId.replace(/[-._]/g, " ").replace(/([a-z]+)([A-Z])/g, "$1 $2").replace(/([A-Za-z]+)(\d+)/g, "$1 $2").replace(/(\d+)([A-Za-z]+)/g, "$1 $2").toLowerCase();
    return label;
  }
  _doFindMatchesInSetting(searchString, setting) {
    const descriptionMatchingWords = /* @__PURE__ */ new Map();
    const keyMatchingWords = /* @__PURE__ */ new Map();
    const valueMatchingWords = /* @__PURE__ */ new Map();
    const words = new Set(searchString.split(" "));
    const settingKeyAsWords = this._keyToLabel(setting.key);
    for (const word of words) {
      const keyMatches = matchesWords(word, settingKeyAsWords, true);
      if (keyMatches?.length) {
        keyMatchingWords.set(
          word,
          keyMatches.map((match) => this.toKeyRange(setting, match))
        );
      }
    }
    if (keyMatchingWords.size === words.size) {
      this.matchType |= SettingMatchType.KeyMatch;
    } else {
      keyMatchingWords.clear();
    }
    const keyIdMatches = matchesContiguousSubString(
      searchString,
      setting.key
    );
    if (keyIdMatches?.length) {
      keyMatchingWords.set(
        setting.key,
        keyIdMatches.map((match) => this.toKeyRange(setting, match))
      );
      this.matchType |= SettingMatchType.KeyMatch;
    }
    if (setting.overrides?.length && this.matchType & SettingMatchType.KeyMatch) {
      this.matchType = SettingMatchType.LanguageTagSettingMatch;
      const keyRanges2 = keyMatchingWords.size ? Array.from(keyMatchingWords.values()).flat() : [];
      return [...keyRanges2];
    }
    if (this.searchDescription) {
      for (const word of words) {
        for (let lineIndex = 0; lineIndex < setting.description.length; lineIndex++) {
          const descriptionMatches = matchesContiguousSubString(
            word,
            setting.description[lineIndex]
          );
          if (descriptionMatches?.length) {
            descriptionMatchingWords.set(
              word,
              descriptionMatches.map(
                (match) => this.toDescriptionRange(
                  setting,
                  match,
                  lineIndex
                )
              )
            );
          }
        }
      }
      if (descriptionMatchingWords.size === words.size) {
        this.matchType |= SettingMatchType.DescriptionOrValueMatch;
      } else {
        descriptionMatchingWords.clear();
      }
    }
    if (setting.enum?.length) {
      for (const option of setting.enum) {
        if (typeof option !== "string") {
          continue;
        }
        valueMatchingWords.clear();
        for (const word of words) {
          const valueMatches = matchesContiguousSubString(
            word,
            option
          );
          if (valueMatches?.length) {
            valueMatchingWords.set(
              word,
              valueMatches.map(
                (match) => this.toValueRange(setting, match)
              )
            );
          }
        }
        if (valueMatchingWords.size === words.size) {
          this.matchType |= SettingMatchType.DescriptionOrValueMatch;
          break;
        } else {
          valueMatchingWords.clear();
        }
      }
    } else {
      const settingValue = this.configurationService.getValue(
        setting.key
      );
      if (typeof settingValue === "string") {
        for (const word of words) {
          const valueMatches = matchesContiguousSubString(
            word,
            settingValue
          );
          if (valueMatches?.length) {
            valueMatchingWords.set(
              word,
              valueMatches.map(
                (match) => this.toValueRange(setting, match)
              )
            );
          }
        }
        if (valueMatchingWords.size === words.size) {
          this.matchType |= SettingMatchType.DescriptionOrValueMatch;
        } else {
          valueMatchingWords.clear();
        }
      }
    }
    const descriptionRanges = descriptionMatchingWords.size ? Array.from(descriptionMatchingWords.values()).flat() : [];
    const keyRanges = keyMatchingWords.size ? Array.from(keyMatchingWords.values()).flat() : [];
    const valueRanges = valueMatchingWords.size ? Array.from(valueMatchingWords.values()).flat() : [];
    return [...descriptionRanges, ...keyRanges, ...valueRanges];
  }
  toKeyRange(setting, match) {
    return {
      startLineNumber: setting.keyRange.startLineNumber,
      startColumn: setting.keyRange.startColumn + match.start,
      endLineNumber: setting.keyRange.startLineNumber,
      endColumn: setting.keyRange.startColumn + match.end
    };
  }
  toDescriptionRange(setting, match, lineIndex) {
    const descriptionRange = setting.descriptionRanges[lineIndex];
    if (!descriptionRange) {
      return nullRange;
    }
    return {
      startLineNumber: descriptionRange.startLineNumber,
      startColumn: descriptionRange.startColumn + match.start,
      endLineNumber: descriptionRange.endLineNumber,
      endColumn: descriptionRange.startColumn + match.end
    };
  }
  toValueRange(setting, match) {
    return {
      startLineNumber: setting.valueRange.startLineNumber,
      startColumn: setting.valueRange.startColumn + match.start + 1,
      endLineNumber: setting.valueRange.startLineNumber,
      endColumn: setting.valueRange.startColumn + match.end + 1
    };
  }
};
SettingMatches = __decorateClass([
  __decorateParam(5, IConfigurationService)
], SettingMatches);
class AiRelatedInformationSearchKeysProvider {
  constructor(aiRelatedInformationService) {
    this.aiRelatedInformationService = aiRelatedInformationService;
  }
  static {
    __name(this, "AiRelatedInformationSearchKeysProvider");
  }
  settingKeys = [];
  settingsRecord = {};
  currentPreferencesModel;
  updateModel(preferencesModel) {
    if (preferencesModel === this.currentPreferencesModel) {
      return;
    }
    this.currentPreferencesModel = preferencesModel;
    this.refresh();
  }
  refresh() {
    this.settingKeys = [];
    this.settingsRecord = {};
    if (!this.currentPreferencesModel || !this.aiRelatedInformationService.isEnabled()) {
      return;
    }
    for (const group of this.currentPreferencesModel.settingsGroups) {
      if (group.id === "mostCommonlyUsed") {
        continue;
      }
      for (const section of group.sections) {
        for (const setting of section.settings) {
          this.settingKeys.push(setting.key);
          this.settingsRecord[setting.key] = setting;
        }
      }
    }
  }
  getSettingKeys() {
    return this.settingKeys;
  }
  getSettingsRecord() {
    return this.settingsRecord;
  }
}
let AiRelatedInformationSearchProvider = class {
  constructor(aiRelatedInformationService) {
    this.aiRelatedInformationService = aiRelatedInformationService;
    this._keysProvider = new AiRelatedInformationSearchKeysProvider(
      aiRelatedInformationService
    );
  }
  static {
    __name(this, "AiRelatedInformationSearchProvider");
  }
  static AI_RELATED_INFORMATION_THRESHOLD = 0.73;
  static AI_RELATED_INFORMATION_MAX_PICKS = 5;
  _keysProvider;
  _filter = "";
  setFilter(filter) {
    this._filter = cleanFilter(filter);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter || !this.aiRelatedInformationService.isEnabled()) {
      return null;
    }
    this._keysProvider.updateModel(preferencesModel);
    return {
      filterMatches: await this.getAiRelatedInformationItems(token)
    };
  }
  async getAiRelatedInformationItems(token) {
    const settingsRecord = this._keysProvider.getSettingsRecord();
    const filterMatches = [];
    const relatedInformation = await this.aiRelatedInformationService.getRelatedInformation(
      this._filter,
      [RelatedInformationType.SettingInformation],
      token ?? CancellationToken.None
    );
    relatedInformation.sort((a, b) => b.weight - a.weight);
    for (const info of relatedInformation) {
      if (info.weight < AiRelatedInformationSearchProvider.AI_RELATED_INFORMATION_THRESHOLD || filterMatches.length === AiRelatedInformationSearchProvider.AI_RELATED_INFORMATION_MAX_PICKS) {
        break;
      }
      const pick = info.setting;
      filterMatches.push({
        setting: settingsRecord[pick],
        matches: [settingsRecord[pick].range],
        matchType: SettingMatchType.RemoteMatch,
        score: info.weight
      });
    }
    return filterMatches;
  }
};
AiRelatedInformationSearchProvider = __decorateClass([
  __decorateParam(0, IAiRelatedInformationService)
], AiRelatedInformationSearchProvider);
class TfIdfSearchProvider {
  static {
    __name(this, "TfIdfSearchProvider");
  }
  static TF_IDF_PRE_NORMALIZE_THRESHOLD = 50;
  static TF_IDF_POST_NORMALIZE_THRESHOLD = 0.7;
  static TF_IDF_MAX_PICKS = 5;
  _currentPreferencesModel;
  _filter = "";
  _documents = [];
  _settingsRecord = {};
  constructor() {
  }
  setFilter(filter) {
    this._filter = cleanFilter(filter);
  }
  keyToLabel(settingId) {
    const label = settingId.replace(/[-._]/g, " ").replace(/([a-z]+)([A-Z])/g, "$1 $2").replace(/([A-Za-z]+)(\d+)/g, "$1 $2").replace(/(\d+)([A-Za-z]+)/g, "$1 $2").toLowerCase();
    return label;
  }
  settingItemToEmbeddingString(item) {
    let result = `Setting Id: ${item.key}
`;
    result += `Label: ${this.keyToLabel(item.key)}
`;
    result += `Description: ${item.description}
`;
    return result;
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter) {
      return null;
    }
    if (this._currentPreferencesModel !== preferencesModel) {
      this._currentPreferencesModel = preferencesModel;
      this._documents = [];
      this._settingsRecord = {};
      for (const group of preferencesModel.settingsGroups) {
        if (group.id === "mostCommonlyUsed") {
          continue;
        }
        for (const section of group.sections) {
          for (const setting of section.settings) {
            this._documents.push({
              key: setting.key,
              textChunks: [
                this.settingItemToEmbeddingString(setting)
              ]
            });
            this._settingsRecord[setting.key] = setting;
          }
        }
      }
    }
    return {
      filterMatches: await this.getTfIdfItems(token)
    };
  }
  async getTfIdfItems(token) {
    const filterMatches = [];
    const tfIdfCalculator = new TfIdfCalculator();
    tfIdfCalculator.updateDocuments(this._documents);
    const tfIdfRankings = tfIdfCalculator.calculateScores(
      this._filter,
      token ?? CancellationToken.None
    );
    tfIdfRankings.sort((a, b) => b.score - a.score);
    const maxScore = tfIdfRankings[0].score;
    if (maxScore < TfIdfSearchProvider.TF_IDF_PRE_NORMALIZE_THRESHOLD) {
      return [];
    }
    for (const info of tfIdfRankings) {
      if (info.score / maxScore < TfIdfSearchProvider.TF_IDF_POST_NORMALIZE_THRESHOLD || filterMatches.length === TfIdfSearchProvider.TF_IDF_MAX_PICKS) {
        break;
      }
      const pick = info.key;
      filterMatches.push({
        setting: this._settingsRecord[pick],
        matches: [this._settingsRecord[pick].range],
        matchType: SettingMatchType.RemoteMatch,
        score: info.score
      });
    }
    return filterMatches;
  }
}
let RemoteSearchProvider = class {
  constructor(aiRelatedInformationService) {
    this.aiRelatedInformationService = aiRelatedInformationService;
  }
  static {
    __name(this, "RemoteSearchProvider");
  }
  adaSearchProvider;
  tfIdfSearchProvider;
  filter = "";
  initializeSearchProviders() {
    if (this.aiRelatedInformationService.isEnabled()) {
      this.adaSearchProvider ??= new AiRelatedInformationSearchProvider(
        this.aiRelatedInformationService
      );
    }
    this.tfIdfSearchProvider ??= new TfIdfSearchProvider();
  }
  setFilter(filter) {
    this.initializeSearchProviders();
    this.filter = filter;
    if (this.adaSearchProvider) {
      this.adaSearchProvider.setFilter(filter);
    }
    this.tfIdfSearchProvider.setFilter(filter);
  }
  searchModel(preferencesModel, token) {
    if (!this.filter) {
      return Promise.resolve(null);
    }
    if (!this.adaSearchProvider) {
      return this.tfIdfSearchProvider.searchModel(
        preferencesModel,
        token
      );
    }
    return this.adaSearchProvider.searchModel(preferencesModel, token).then((results) => {
      return results?.filterMatches.length ? results : this.tfIdfSearchProvider.searchModel(
        preferencesModel,
        token
      );
    });
  }
};
RemoteSearchProvider = __decorateClass([
  __decorateParam(0, IAiRelatedInformationService)
], RemoteSearchProvider);
registerSingleton(
  IPreferencesSearchService,
  PreferencesSearchService,
  InstantiationType.Delayed
);
export {
  LocalSearchProvider,
  PreferencesSearchService,
  SettingMatches
};
//# sourceMappingURL=preferencesSearch.js.map
