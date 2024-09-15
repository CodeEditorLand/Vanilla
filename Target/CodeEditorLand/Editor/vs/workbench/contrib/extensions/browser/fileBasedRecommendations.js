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
import { disposableTimeout } from "../../../../base/common/async.js";
import { match } from "../../../../base/common/glob.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename, extname } from "../../../../base/common/resources.js";
import { isEmptyObject } from "../../../../base/common/types.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../editor/common/languages/modesRegistry.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import {
  IExtensionRecommendationNotificationService,
  RecommendationSource,
  RecommendationsNotificationResult
} from "../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { EnablementState } from "../../../services/extensionManagement/common/extensionManagement.js";
import {
  ExtensionRecommendationReason,
  IExtensionIgnoredRecommendationsService
} from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
import { CellUri } from "../../notebook/common/notebookCommon.js";
import {
  IExtensionsWorkbenchService
} from "../common/extensions.js";
import {
  ExtensionRecommendations
} from "./extensionRecommendations.js";
const promptedRecommendationsStorageKey = "fileBasedRecommendations/promptedRecommendations";
const recommendationsStorageKey = "extensionsAssistant/recommendations";
const milliSecondsInADay = 1e3 * 60 * 60 * 24;
let FileBasedRecommendations = class extends ExtensionRecommendations {
  constructor(extensionsWorkbenchService, modelService, languageService, productService, storageService, extensionRecommendationNotificationService, extensionIgnoredRecommendationsService, workspaceContextService) {
    super();
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.storageService = storageService;
    this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
    this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
    this.workspaceContextService = workspaceContextService;
    this.fileOpenRecommendations = {};
    if (productService.extensionRecommendations) {
      for (const [extensionId, recommendation] of Object.entries(
        productService.extensionRecommendations
      )) {
        if (recommendation.onFileOpen) {
          this.fileOpenRecommendations[extensionId.toLowerCase()] = recommendation.onFileOpen;
        }
      }
    }
  }
  static {
    __name(this, "FileBasedRecommendations");
  }
  fileOpenRecommendations;
  recommendationsByPattern = /* @__PURE__ */ new Map();
  fileBasedRecommendations = /* @__PURE__ */ new Map();
  fileBasedImportantRecommendations = /* @__PURE__ */ new Set();
  get recommendations() {
    const recommendations = [];
    [...this.fileBasedRecommendations.keys()].sort((a, b) => {
      if (this.fileBasedRecommendations.get(a).recommendedTime === this.fileBasedRecommendations.get(b).recommendedTime) {
        if (this.fileBasedImportantRecommendations.has(a)) {
          return -1;
        }
        if (this.fileBasedImportantRecommendations.has(b)) {
          return 1;
        }
      }
      return this.fileBasedRecommendations.get(a).recommendedTime > this.fileBasedRecommendations.get(b).recommendedTime ? -1 : 1;
    }).forEach((extensionId) => {
      recommendations.push({
        extension: extensionId,
        reason: {
          reasonId: ExtensionRecommendationReason.File,
          reasonText: localize(
            "fileBasedRecommendation",
            "This extension is recommended based on the files you recently opened."
          )
        }
      });
    });
    return recommendations;
  }
  get importantRecommendations() {
    return this.recommendations.filter(
      (e) => this.fileBasedImportantRecommendations.has(e.extension)
    );
  }
  get otherRecommendations() {
    return this.recommendations.filter(
      (e) => !this.fileBasedImportantRecommendations.has(e.extension)
    );
  }
  async doActivate() {
    if (isEmptyObject(this.fileOpenRecommendations)) {
      return;
    }
    await this.extensionsWorkbenchService.whenInitialized;
    const cachedRecommendations = this.getCachedRecommendations();
    const now = Date.now();
    Object.entries(cachedRecommendations).forEach(([key, value]) => {
      const diff = (now - value) / milliSecondsInADay;
      if (diff <= 7 && this.fileOpenRecommendations[key]) {
        this.fileBasedRecommendations.set(key.toLowerCase(), {
          recommendedTime: value
        });
      }
    });
    this._register(
      this.modelService.onModelAdded((model) => this.onModelAdded(model))
    );
    this.modelService.getModels().forEach((model) => this.onModelAdded(model));
  }
  onModelAdded(model) {
    const uri = model.uri.scheme === Schemas.vscodeNotebookCell ? CellUri.parse(model.uri)?.notebook : model.uri;
    if (!uri) {
      return;
    }
    const supportedSchemes = distinct([
      Schemas.untitled,
      Schemas.file,
      Schemas.vscodeRemote,
      ...this.workspaceContextService.getWorkspace().folders.map((folder) => folder.uri.scheme)
    ]);
    if (!uri || !supportedSchemes.includes(uri.scheme)) {
      return;
    }
    disposableTimeout(
      () => this.promptImportantRecommendations(uri, model),
      0,
      this._store
    );
  }
  /**
   * Prompt the user to either install the recommended extension for the file type in the current editor model
   * or prompt to search the marketplace if it has extensions that can support the file type
   */
  promptImportantRecommendations(uri, model, extensionRecommendations) {
    if (model.isDisposed()) {
      return;
    }
    const pattern = extname(uri).toLowerCase();
    extensionRecommendations = extensionRecommendations ?? this.recommendationsByPattern.get(pattern) ?? this.fileOpenRecommendations;
    const extensionRecommendationEntries = Object.entries(
      extensionRecommendations
    );
    if (extensionRecommendationEntries.length === 0) {
      return;
    }
    const processedPathGlobs = /* @__PURE__ */ new Map();
    const installed = this.extensionsWorkbenchService.local;
    const recommendationsByPattern = {};
    const matchedRecommendations = {};
    const unmatchedRecommendations = {};
    let listenOnLanguageChange = false;
    const languageId = model.getLanguageId();
    for (const [
      extensionId,
      conditions
    ] of extensionRecommendationEntries) {
      const conditionsByPattern = [];
      const matchedConditions = [];
      const unmatchedConditions = [];
      for (const condition of conditions) {
        let languageMatched = false;
        let pathGlobMatched = false;
        const isLanguageCondition = !!condition.languages;
        const isFileContentCondition = !!condition.contentPattern;
        if (isLanguageCondition || isFileContentCondition) {
          conditionsByPattern.push(condition);
        }
        if (isLanguageCondition) {
          if (condition.languages.includes(
            languageId
          )) {
            languageMatched = true;
          }
        }
        if (condition.pathGlob) {
          const pathGlob = condition.pathGlob;
          if (processedPathGlobs.get(pathGlob) ?? match(
            condition.pathGlob,
            uri.with({ fragment: "" }).toString()
          )) {
            pathGlobMatched = true;
          }
          processedPathGlobs.set(pathGlob, pathGlobMatched);
        }
        let matched = languageMatched || pathGlobMatched;
        if (pattern && !matched) {
          continue;
        }
        if (matched && condition.whenInstalled) {
          if (!condition.whenInstalled.every(
            (id) => installed.some(
              (local) => areSameExtensions({ id }, local.identifier)
            )
          )) {
            matched = false;
          }
        }
        if (matched && condition.whenNotInstalled) {
          if (installed.some(
            (local) => condition.whenNotInstalled?.some(
              (id) => areSameExtensions({ id }, local.identifier)
            )
          )) {
            matched = false;
          }
        }
        if (matched && isFileContentCondition) {
          if (!model.findMatches(
            condition.contentPattern,
            false,
            true,
            false,
            null,
            false
          ).length) {
            matched = false;
          }
        }
        if (matched) {
          matchedConditions.push(condition);
          conditionsByPattern.pop();
        } else if (isLanguageCondition || isFileContentCondition) {
          unmatchedConditions.push(condition);
          if (isLanguageCondition) {
            listenOnLanguageChange = true;
          }
        }
      }
      if (matchedConditions.length) {
        matchedRecommendations[extensionId] = matchedConditions;
      }
      if (unmatchedConditions.length) {
        unmatchedRecommendations[extensionId] = unmatchedConditions;
      }
      if (conditionsByPattern.length) {
        recommendationsByPattern[extensionId] = conditionsByPattern;
      }
    }
    if (pattern) {
      this.recommendationsByPattern.set(
        pattern,
        recommendationsByPattern
      );
    }
    if (Object.keys(unmatchedRecommendations).length) {
      if (listenOnLanguageChange) {
        const disposables = new DisposableStore();
        disposables.add(
          model.onDidChangeLanguage(() => {
            disposableTimeout(
              () => {
                if (!disposables.isDisposed) {
                  this.promptImportantRecommendations(
                    uri,
                    model,
                    unmatchedRecommendations
                  );
                  disposables.dispose();
                }
              },
              0,
              disposables
            );
          })
        );
        disposables.add(
          model.onWillDispose(() => disposables.dispose())
        );
      }
    }
    if (Object.keys(matchedRecommendations).length) {
      this.promptFromRecommendations(uri, model, matchedRecommendations);
    }
  }
  promptFromRecommendations(uri, model, extensionRecommendations) {
    let isImportantRecommendationForLanguage = false;
    const importantRecommendations = /* @__PURE__ */ new Set();
    const fileBasedRecommendations = /* @__PURE__ */ new Set();
    for (const [extensionId, conditions] of Object.entries(
      extensionRecommendations
    )) {
      for (const condition of conditions) {
        fileBasedRecommendations.add(extensionId);
        if (condition.important) {
          importantRecommendations.add(extensionId);
          this.fileBasedImportantRecommendations.add(extensionId);
        }
        if (condition.languages) {
          isImportantRecommendationForLanguage = true;
        }
      }
    }
    for (const recommendation of fileBasedRecommendations) {
      const filedBasedRecommendation = this.fileBasedRecommendations.get(
        recommendation
      ) || { recommendedTime: Date.now(), sources: [] };
      filedBasedRecommendation.recommendedTime = Date.now();
      this.fileBasedRecommendations.set(
        recommendation,
        filedBasedRecommendation
      );
    }
    this.storeCachedRecommendations();
    if (this.extensionRecommendationNotificationService.hasToIgnoreRecommendationNotifications()) {
      return;
    }
    const language = model.getLanguageId();
    const languageName = this.languageService.getLanguageName(language);
    if (importantRecommendations.size && this.promptRecommendedExtensionForFileType(
      languageName && isImportantRecommendationForLanguage && language !== PLAINTEXT_LANGUAGE_ID ? localize("languageName", "the {0} language", languageName) : basename(uri),
      language,
      [...importantRecommendations]
    )) {
      return;
    }
  }
  promptRecommendedExtensionForFileType(name, language, recommendations) {
    recommendations = this.filterIgnoredOrNotAllowed(recommendations);
    if (recommendations.length === 0) {
      return false;
    }
    recommendations = this.filterInstalled(
      recommendations,
      this.extensionsWorkbenchService.local
    ).filter(
      (extensionId) => this.fileBasedImportantRecommendations.has(extensionId)
    );
    const promptedRecommendations = language !== PLAINTEXT_LANGUAGE_ID ? this.getPromptedRecommendations()[language] : void 0;
    if (promptedRecommendations) {
      recommendations = recommendations.filter(
        (extensionId) => promptedRecommendations.includes(extensionId)
      );
    }
    if (recommendations.length === 0) {
      return false;
    }
    this.promptImportantExtensionsInstallNotification(
      recommendations,
      name,
      language
    );
    return true;
  }
  async promptImportantExtensionsInstallNotification(extensions, name, language) {
    try {
      const result = await this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification(
        { extensions, name, source: RecommendationSource.FILE }
      );
      if (result === RecommendationsNotificationResult.Accepted) {
        this.addToPromptedRecommendations(language, extensions);
      }
    } catch (error) {
    }
  }
  getPromptedRecommendations() {
    return JSON.parse(
      this.storageService.get(
        promptedRecommendationsStorageKey,
        StorageScope.PROFILE,
        "{}"
      )
    );
  }
  addToPromptedRecommendations(language, extensions) {
    const promptedRecommendations = this.getPromptedRecommendations();
    promptedRecommendations[language] = distinct([
      ...promptedRecommendations[language] ?? [],
      ...extensions
    ]);
    this.storageService.store(
      promptedRecommendationsStorageKey,
      JSON.stringify(promptedRecommendations),
      StorageScope.PROFILE,
      StorageTarget.USER
    );
  }
  filterIgnoredOrNotAllowed(recommendationsToSuggest) {
    const ignoredRecommendations = [
      ...this.extensionIgnoredRecommendationsService.ignoredRecommendations,
      ...this.extensionRecommendationNotificationService.ignoredRecommendations
    ];
    return recommendationsToSuggest.filter(
      (id) => !ignoredRecommendations.includes(id)
    );
  }
  filterInstalled(recommendationsToSuggest, installed) {
    const installedExtensionsIds = installed.reduce((result, i) => {
      if (i.enablementState !== EnablementState.DisabledByExtensionKind) {
        result.add(i.identifier.id.toLowerCase());
      }
      return result;
    }, /* @__PURE__ */ new Set());
    return recommendationsToSuggest.filter(
      (id) => !installedExtensionsIds.has(id.toLowerCase())
    );
  }
  getCachedRecommendations() {
    let storedRecommendations = JSON.parse(
      this.storageService.get(
        recommendationsStorageKey,
        StorageScope.PROFILE,
        "[]"
      )
    );
    if (Array.isArray(storedRecommendations)) {
      storedRecommendations = storedRecommendations.reduce((result2, id) => {
        result2[id] = Date.now();
        return result2;
      }, {});
    }
    const result = {};
    Object.entries(storedRecommendations).forEach(([key, value]) => {
      if (typeof value === "number") {
        result[key.toLowerCase()] = value;
      }
    });
    return result;
  }
  storeCachedRecommendations() {
    const storedRecommendations = {};
    this.fileBasedRecommendations.forEach(
      (value, key) => storedRecommendations[key] = value.recommendedTime
    );
    this.storageService.store(
      recommendationsStorageKey,
      JSON.stringify(storedRecommendations),
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
  }
};
FileBasedRecommendations = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IExtensionRecommendationNotificationService),
  __decorateParam(6, IExtensionIgnoredRecommendationsService),
  __decorateParam(7, IWorkspaceContextService)
], FileBasedRecommendations);
export {
  FileBasedRecommendations
};
//# sourceMappingURL=fileBasedRecommendations.js.map
