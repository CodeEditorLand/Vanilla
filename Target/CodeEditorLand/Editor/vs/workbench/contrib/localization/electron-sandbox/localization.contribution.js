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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import * as platform from "../../../../base/common/platform.js";
import Severity from "../../../../base/common/severity.js";
import { localize } from "../../../../nls.js";
import {
  IExtensionGalleryService,
  IExtensionManagementService,
  InstallOperation
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import {
  INotificationService,
  NeverShowAgainScope
} from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { ViewContainerLocation } from "../../../common/views.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { ILocaleService } from "../../../services/localization/common/locale.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import {
  VIEWLET_ID as EXTENSIONS_VIEWLET_ID
} from "../../extensions/common/extensions.js";
import { BaseLocalizationWorkbenchContribution } from "../common/localization.contribution.js";
import { minimumTranslatedStrings } from "./minimalTranslations.js";
let NativeLocalizationWorkbenchContribution = class extends BaseLocalizationWorkbenchContribution {
  constructor(notificationService, localeService, productService, storageService, extensionManagementService, galleryService, paneCompositeService, telemetryService) {
    super();
    this.notificationService = notificationService;
    this.localeService = localeService;
    this.productService = productService;
    this.storageService = storageService;
    this.extensionManagementService = extensionManagementService;
    this.galleryService = galleryService;
    this.paneCompositeService = paneCompositeService;
    this.telemetryService = telemetryService;
    this.checkAndInstall();
    this._register(
      this.extensionManagementService.onDidInstallExtensions(
        (e) => this.onDidInstallExtensions(e)
      )
    );
    this._register(
      this.extensionManagementService.onDidUninstallExtension(
        (e) => this.onDidUninstallExtension(e)
      )
    );
  }
  static LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY = "extensionsAssistant/languagePackSuggestionIgnore";
  async onDidInstallExtensions(results) {
    for (const result of results) {
      if (result.operation === InstallOperation.Install && result.local) {
        await this.onDidInstallExtension(
          result.local,
          !!result.context?.extensionsSync
        );
      }
    }
  }
  async onDidInstallExtension(localExtension, fromSettingsSync) {
    const localization = localExtension.manifest.contributes?.localizations?.[0];
    if (!localization || platform.language === localization.languageId) {
      return;
    }
    const { languageId, languageName } = localization;
    this.notificationService.prompt(
      Severity.Info,
      localize(
        "updateLocale",
        "Would you like to change {0}'s display language to {1} and restart?",
        this.productService.nameLong,
        languageName || languageId
      ),
      [
        {
          label: localize(
            "changeAndRestart",
            "Change Language and Restart"
          ),
          run: async () => {
            await this.localeService.setLocale(
              {
                id: languageId,
                label: languageName ?? languageId,
                extensionId: localExtension.identifier.id
                // If settings sync installs the language pack, then we would have just shown the notification so no
                // need to show the dialog.
              },
              true
            );
          }
        }
      ],
      {
        sticky: true,
        neverShowAgain: {
          id: "langugage.update.donotask",
          isSecondary: true,
          scope: NeverShowAgainScope.APPLICATION
        }
      }
    );
  }
  async onDidUninstallExtension(_event) {
    if (!await this.isLocaleInstalled(platform.language)) {
      this.localeService.setLocale({
        id: "en",
        label: "English"
      });
    }
  }
  async checkAndInstall() {
    const language = platform.language;
    let locale = platform.locale ?? "";
    const languagePackSuggestionIgnoreList = JSON.parse(
      this.storageService.get(
        NativeLocalizationWorkbenchContribution.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY,
        StorageScope.APPLICATION,
        "[]"
      )
    );
    if (!this.galleryService.isEnabled()) {
      return;
    }
    if (!language || !locale || platform.Language.isDefaultVariant()) {
      return;
    }
    if (locale.startsWith(language) || languagePackSuggestionIgnoreList.includes(locale)) {
      return;
    }
    const installed = await this.isLocaleInstalled(locale);
    if (installed) {
      return;
    }
    const fullLocale = locale;
    let tagResult = await this.galleryService.query(
      { text: `tag:lp-${locale}` },
      CancellationToken.None
    );
    if (tagResult.total === 0) {
      locale = locale.split("-")[0];
      tagResult = await this.galleryService.query(
        { text: `tag:lp-${locale}` },
        CancellationToken.None
      );
      if (tagResult.total === 0) {
        return;
      }
    }
    const extensionToInstall = tagResult.total === 1 ? tagResult.firstPage[0] : tagResult.firstPage.find(
      (e) => e.publisher === "MS-CEINTL" && e.name.startsWith("vscode-language-pack")
    );
    const extensionToFetchTranslationsFrom = extensionToInstall ?? tagResult.firstPage[0];
    if (!extensionToFetchTranslationsFrom.assets.manifest) {
      return;
    }
    const [manifest, translation] = await Promise.all([
      this.galleryService.getManifest(
        extensionToFetchTranslationsFrom,
        CancellationToken.None
      ),
      this.galleryService.getCoreTranslation(
        extensionToFetchTranslationsFrom,
        locale
      )
    ]);
    const loc = manifest?.contributes?.localizations?.find(
      (x) => locale.startsWith(x.languageId.toLowerCase())
    );
    const languageName = loc ? loc.languageName || locale : locale;
    const languageDisplayName = loc ? loc.localizedLanguageName || loc.languageName || locale : locale;
    const translationsFromPack = translation?.contents?.["vs/workbench/contrib/localization/electron-sandbox/minimalTranslations"] ?? {};
    const promptMessageKey = extensionToInstall ? "installAndRestartMessage" : "showLanguagePackExtensions";
    const useEnglish = !translationsFromPack[promptMessageKey];
    const translations = {};
    Object.keys(minimumTranslatedStrings).forEach((key) => {
      if (!translationsFromPack[key] || useEnglish) {
        translations[key] = minimumTranslatedStrings[key].replace(
          "{0}",
          () => languageName
        );
      } else {
        translations[key] = `${translationsFromPack[key].replace("{0}", () => languageDisplayName)} (${minimumTranslatedStrings[key].replace("{0}", () => languageName)})`;
      }
    });
    const logUserReaction = (userReaction) => {
      this.telemetryService.publicLog("languagePackSuggestion:popup", {
        userReaction,
        language: locale
      });
    };
    const searchAction = {
      label: translations["searchMarketplace"],
      run: async () => {
        logUserReaction("search");
        const viewlet = await this.paneCompositeService.openPaneComposite(
          EXTENSIONS_VIEWLET_ID,
          ViewContainerLocation.Sidebar,
          true
        );
        if (!viewlet) {
          return;
        }
        const container = viewlet.getViewPaneContainer();
        if (!container) {
          return;
        }
        container.search(
          `tag:lp-${locale}`
        );
        container.focus();
      }
    };
    const installAndRestartAction = {
      label: translations["installAndRestart"],
      run: async () => {
        logUserReaction("installAndRestart");
        await this.localeService.setLocale(
          {
            id: locale,
            label: languageName,
            extensionId: extensionToInstall?.identifier.id,
            galleryExtension: extensionToInstall
            // The user will be prompted if they want to install the language pack before this.
          },
          true
        );
      }
    };
    const promptMessage = translations[promptMessageKey];
    this.notificationService.prompt(
      Severity.Info,
      promptMessage,
      [
        extensionToInstall ? installAndRestartAction : searchAction,
        {
          label: localize("neverAgain", "Don't Show Again"),
          isSecondary: true,
          run: () => {
            languagePackSuggestionIgnoreList.push(fullLocale);
            this.storageService.store(
              NativeLocalizationWorkbenchContribution.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY,
              JSON.stringify(languagePackSuggestionIgnoreList),
              StorageScope.APPLICATION,
              StorageTarget.USER
            );
            logUserReaction("neverShowAgain");
          }
        }
      ],
      {
        onCancel: () => {
          logUserReaction("cancelled");
        }
      }
    );
  }
  async isLocaleInstalled(locale) {
    const installed = await this.extensionManagementService.getInstalled();
    return installed.some(
      (i) => !!i.manifest.contributes?.localizations?.length && i.manifest.contributes.localizations.some(
        (l) => locale.startsWith(l.languageId.toLowerCase())
      )
    );
  }
};
NativeLocalizationWorkbenchContribution = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ILocaleService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IExtensionManagementService),
  __decorateParam(5, IExtensionGalleryService),
  __decorateParam(6, IPaneCompositePartService),
  __decorateParam(7, ITelemetryService)
], NativeLocalizationWorkbenchContribution);
const workbenchRegistry = Registry.as(
  WorkbenchExtensions.Workbench
);
workbenchRegistry.registerWorkbenchContribution(
  NativeLocalizationWorkbenchContribution,
  LifecyclePhase.Eventually
);
