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
import { distinct } from "../../../base/common/arrays.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { CancellationError, getErrorMessage, isCancellationError } from "../../../base/common/errors.js";
import { IPager } from "../../../base/common/paging.js";
import { isWeb, platform } from "../../../base/common/platform.js";
import { arch } from "../../../base/common/process.js";
import { isBoolean } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { IHeaders, IRequestContext, IRequestOptions, isOfflineError } from "../../../base/parts/request/common/request.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { getTargetPlatform, IExtensionGalleryService, IExtensionIdentifier, IExtensionInfo, IGalleryExtension, IGalleryExtensionAsset, IGalleryExtensionAssets, IGalleryExtensionVersion, InstallOperation, IQueryOptions, IExtensionsControlManifest, isNotWebExtensionInWebTargetPlatform, isTargetPlatformCompatible, ITranslation, SortBy, SortOrder, StatisticType, toTargetPlatform, WEB_EXTENSION_TAG, IExtensionQueryOptions, IDeprecationInfo, ISearchPrefferedResults, ExtensionGalleryError, ExtensionGalleryErrorCode, IProductVersion } from "./extensionManagement.js";
import { adoptToGalleryExtensionId, areSameExtensions, getGalleryExtensionId, getGalleryExtensionTelemetryData } from "./extensionManagementUtil.js";
import { IExtensionManifest, TargetPlatform } from "../../extensions/common/extensions.js";
import { areApiProposalsCompatible, isEngineValid } from "../../extensions/common/extensionValidator.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { asJson, asTextOrError, IRequestService, isSuccess } from "../../request/common/request.js";
import { resolveMarketplaceHeaders } from "../../externalServices/common/marketplace.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
const CURRENT_TARGET_PLATFORM = isWeb ? TargetPlatform.WEB : getTargetPlatform(platform, arch);
const ACTIVITY_HEADER_NAME = "X-Market-Search-Activity-Id";
var Flags = /* @__PURE__ */ ((Flags2) => {
  Flags2[Flags2["None"] = 0] = "None";
  Flags2[Flags2["IncludeVersions"] = 1] = "IncludeVersions";
  Flags2[Flags2["IncludeFiles"] = 2] = "IncludeFiles";
  Flags2[Flags2["IncludeCategoryAndTags"] = 4] = "IncludeCategoryAndTags";
  Flags2[Flags2["IncludeSharedAccounts"] = 8] = "IncludeSharedAccounts";
  Flags2[Flags2["IncludeVersionProperties"] = 16] = "IncludeVersionProperties";
  Flags2[Flags2["ExcludeNonValidated"] = 32] = "ExcludeNonValidated";
  Flags2[Flags2["IncludeInstallationTargets"] = 64] = "IncludeInstallationTargets";
  Flags2[Flags2["IncludeAssetUri"] = 128] = "IncludeAssetUri";
  Flags2[Flags2["IncludeStatistics"] = 256] = "IncludeStatistics";
  Flags2[Flags2["IncludeLatestVersionOnly"] = 512] = "IncludeLatestVersionOnly";
  Flags2[Flags2["Unpublished"] = 4096] = "Unpublished";
  Flags2[Flags2["IncludeNameConflictInfo"] = 32768] = "IncludeNameConflictInfo";
  return Flags2;
})(Flags || {});
function flagsToString(...flags) {
  return String(flags.reduce((r, f) => r | f, 0));
}
__name(flagsToString, "flagsToString");
var FilterType = /* @__PURE__ */ ((FilterType2) => {
  FilterType2[FilterType2["Tag"] = 1] = "Tag";
  FilterType2[FilterType2["ExtensionId"] = 4] = "ExtensionId";
  FilterType2[FilterType2["Category"] = 5] = "Category";
  FilterType2[FilterType2["ExtensionName"] = 7] = "ExtensionName";
  FilterType2[FilterType2["Target"] = 8] = "Target";
  FilterType2[FilterType2["Featured"] = 9] = "Featured";
  FilterType2[FilterType2["SearchText"] = 10] = "SearchText";
  FilterType2[FilterType2["ExcludeWithFlags"] = 12] = "ExcludeWithFlags";
  return FilterType2;
})(FilterType || {});
const AssetType = {
  Icon: "Microsoft.VisualStudio.Services.Icons.Default",
  Details: "Microsoft.VisualStudio.Services.Content.Details",
  Changelog: "Microsoft.VisualStudio.Services.Content.Changelog",
  Manifest: "Microsoft.VisualStudio.Code.Manifest",
  VSIX: "Microsoft.VisualStudio.Services.VSIXPackage",
  License: "Microsoft.VisualStudio.Services.Content.License",
  Repository: "Microsoft.VisualStudio.Services.Links.Source",
  Signature: "Microsoft.VisualStudio.Services.VsixSignature"
};
const PropertyType = {
  Dependency: "Microsoft.VisualStudio.Code.ExtensionDependencies",
  ExtensionPack: "Microsoft.VisualStudio.Code.ExtensionPack",
  Engine: "Microsoft.VisualStudio.Code.Engine",
  PreRelease: "Microsoft.VisualStudio.Code.PreRelease",
  EnabledApiProposals: "Microsoft.VisualStudio.Code.EnabledApiProposals",
  LocalizedLanguages: "Microsoft.VisualStudio.Code.LocalizedLanguages",
  WebExtension: "Microsoft.VisualStudio.Code.WebExtension",
  SponsorLink: "Microsoft.VisualStudio.Code.SponsorLink",
  SupportLink: "Microsoft.VisualStudio.Services.Links.Support",
  ExecutesCode: "Microsoft.VisualStudio.Code.ExecutesCode"
};
const DefaultPageSize = 10;
const DefaultQueryState = {
  pageNumber: 1,
  pageSize: DefaultPageSize,
  sortBy: SortBy.NoneOrRelevance,
  sortOrder: SortOrder.Default,
  flags: 0 /* None */,
  criteria: [],
  assetTypes: []
};
class Query {
  constructor(state = DefaultQueryState) {
    this.state = state;
  }
  static {
    __name(this, "Query");
  }
  get pageNumber() {
    return this.state.pageNumber;
  }
  get pageSize() {
    return this.state.pageSize;
  }
  get sortBy() {
    return this.state.sortBy;
  }
  get sortOrder() {
    return this.state.sortOrder;
  }
  get flags() {
    return this.state.flags;
  }
  get criteria() {
    return this.state.criteria;
  }
  withPage(pageNumber, pageSize = this.state.pageSize) {
    return new Query({ ...this.state, pageNumber, pageSize });
  }
  withFilter(filterType, ...values) {
    const criteria = [
      ...this.state.criteria,
      ...values.length ? values.map((value) => ({ filterType, value })) : [{ filterType }]
    ];
    return new Query({ ...this.state, criteria });
  }
  withSortBy(sortBy) {
    return new Query({ ...this.state, sortBy });
  }
  withSortOrder(sortOrder) {
    return new Query({ ...this.state, sortOrder });
  }
  withFlags(...flags) {
    return new Query({ ...this.state, flags: flags.reduce((r, f) => r | f, 0) });
  }
  withAssetTypes(...assetTypes) {
    return new Query({ ...this.state, assetTypes });
  }
  withSource(source) {
    return new Query({ ...this.state, source });
  }
  get raw() {
    const { criteria, pageNumber, pageSize, sortBy, sortOrder, flags, assetTypes } = this.state;
    const filters = [{ criteria, pageNumber, pageSize, sortBy, sortOrder }];
    return { filters, assetTypes, flags };
  }
  get searchText() {
    const criterium = this.state.criteria.filter((criterium2) => criterium2.filterType === 10 /* SearchText */)[0];
    return criterium && criterium.value ? criterium.value : "";
  }
  get telemetryData() {
    return {
      filterTypes: this.state.criteria.map((criterium) => String(criterium.filterType)),
      flags: this.state.flags,
      sortBy: String(this.sortBy),
      sortOrder: String(this.sortOrder),
      pageNumber: String(this.pageNumber),
      source: this.state.source,
      searchTextLength: this.searchText.length
    };
  }
}
function getStatistic(statistics, name) {
  const result = (statistics || []).filter((s) => s.statisticName === name)[0];
  return result ? result.value : 0;
}
__name(getStatistic, "getStatistic");
function getCoreTranslationAssets(version) {
  const coreTranslationAssetPrefix = "Microsoft.VisualStudio.Code.Translation.";
  const result = version.files.filter((f) => f.assetType.indexOf(coreTranslationAssetPrefix) === 0);
  return result.reduce((result2, file) => {
    const asset = getVersionAsset(version, file.assetType);
    if (asset) {
      result2.push([file.assetType.substring(coreTranslationAssetPrefix.length), asset]);
    }
    return result2;
  }, []);
}
__name(getCoreTranslationAssets, "getCoreTranslationAssets");
function getRepositoryAsset(version) {
  if (version.properties) {
    const results = version.properties.filter((p) => p.key === AssetType.Repository);
    const gitRegExp = new RegExp("((git|ssh|http(s)?)|(git@[\\w.]+))(:(//)?)([\\w.@:/\\-~]+)(.git)(/)?");
    const uri = results.filter((r) => gitRegExp.test(r.value))[0];
    return uri ? { uri: uri.value, fallbackUri: uri.value } : null;
  }
  return getVersionAsset(version, AssetType.Repository);
}
__name(getRepositoryAsset, "getRepositoryAsset");
function getDownloadAsset(version) {
  return {
    // always use fallbackAssetUri for download asset to hit the Marketplace API so that downloads are counted
    uri: `${version.fallbackAssetUri}/${AssetType.VSIX}?redirect=true${version.targetPlatform ? `&targetPlatform=${version.targetPlatform}` : ""}`,
    fallbackUri: `${version.fallbackAssetUri}/${AssetType.VSIX}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ""}`
  };
}
__name(getDownloadAsset, "getDownloadAsset");
function getVersionAsset(version, type) {
  const result = version.files.filter((f) => f.assetType === type)[0];
  return result ? {
    uri: `${version.assetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ""}`,
    fallbackUri: `${version.fallbackAssetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ""}`
  } : null;
}
__name(getVersionAsset, "getVersionAsset");
function getExtensions(version, property) {
  const values = version.properties ? version.properties.filter((p) => p.key === property) : [];
  const value = values.length > 0 && values[0].value;
  return value ? value.split(",").map((v) => adoptToGalleryExtensionId(v)) : [];
}
__name(getExtensions, "getExtensions");
function getEngine(version) {
  const values = version.properties ? version.properties.filter((p) => p.key === PropertyType.Engine) : [];
  return values.length > 0 && values[0].value || "";
}
__name(getEngine, "getEngine");
function isPreReleaseVersion(version) {
  const values = version.properties ? version.properties.filter((p) => p.key === PropertyType.PreRelease) : [];
  return values.length > 0 && values[0].value === "true";
}
__name(isPreReleaseVersion, "isPreReleaseVersion");
function executesCode(version) {
  const values = version.properties ? version.properties.filter((p) => p.key === PropertyType.ExecutesCode) : [];
  return values.length > 0 ? values[0].value === "true" : void 0;
}
__name(executesCode, "executesCode");
function getEnabledApiProposals(version) {
  const values = version.properties ? version.properties.filter((p) => p.key === PropertyType.EnabledApiProposals) : [];
  const value = values.length > 0 && values[0].value || "";
  return value ? value.split(",") : [];
}
__name(getEnabledApiProposals, "getEnabledApiProposals");
function getLocalizedLanguages(version) {
  const values = version.properties ? version.properties.filter((p) => p.key === PropertyType.LocalizedLanguages) : [];
  const value = values.length > 0 && values[0].value || "";
  return value ? value.split(",") : [];
}
__name(getLocalizedLanguages, "getLocalizedLanguages");
function getSponsorLink(version) {
  return version.properties?.find((p) => p.key === PropertyType.SponsorLink)?.value;
}
__name(getSponsorLink, "getSponsorLink");
function getSupportLink(version) {
  return version.properties?.find((p) => p.key === PropertyType.SupportLink)?.value;
}
__name(getSupportLink, "getSupportLink");
function getIsPreview(flags) {
  return flags.indexOf("preview") !== -1;
}
__name(getIsPreview, "getIsPreview");
function getTargetPlatformForExtensionVersion(version) {
  return version.targetPlatform ? toTargetPlatform(version.targetPlatform) : TargetPlatform.UNDEFINED;
}
__name(getTargetPlatformForExtensionVersion, "getTargetPlatformForExtensionVersion");
function getAllTargetPlatforms(rawGalleryExtension) {
  const allTargetPlatforms = distinct(rawGalleryExtension.versions.map(getTargetPlatformForExtensionVersion));
  const isWebExtension = !!rawGalleryExtension.tags?.includes(WEB_EXTENSION_TAG);
  const webTargetPlatformIndex = allTargetPlatforms.indexOf(TargetPlatform.WEB);
  if (isWebExtension) {
    if (webTargetPlatformIndex === -1) {
      allTargetPlatforms.push(TargetPlatform.WEB);
    }
  } else {
    if (webTargetPlatformIndex !== -1) {
      allTargetPlatforms.splice(webTargetPlatformIndex, 1);
    }
  }
  return allTargetPlatforms;
}
__name(getAllTargetPlatforms, "getAllTargetPlatforms");
function sortExtensionVersions(versions, preferredTargetPlatform) {
  for (let index = 0; index < versions.length; index++) {
    const version = versions[index];
    if (version.version === versions[index - 1]?.version) {
      let insertionIndex = index;
      const versionTargetPlatform = getTargetPlatformForExtensionVersion(version);
      if (versionTargetPlatform === preferredTargetPlatform) {
        while (insertionIndex > 0 && versions[insertionIndex - 1].version === version.version) {
          insertionIndex--;
        }
      }
      if (insertionIndex !== index) {
        versions.splice(index, 1);
        versions.splice(insertionIndex, 0, version);
      }
    }
  }
  return versions;
}
__name(sortExtensionVersions, "sortExtensionVersions");
function setTelemetry(extension, index, querySource) {
  extension.telemetryData = { index, querySource, queryActivityId: extension.queryContext?.[ACTIVITY_HEADER_NAME] };
}
__name(setTelemetry, "setTelemetry");
function toExtension(galleryExtension, version, allTargetPlatforms, queryContext) {
  const latestVersion = galleryExtension.versions[0];
  const assets = {
    manifest: getVersionAsset(version, AssetType.Manifest),
    readme: getVersionAsset(version, AssetType.Details),
    changelog: getVersionAsset(version, AssetType.Changelog),
    license: getVersionAsset(version, AssetType.License),
    repository: getRepositoryAsset(version),
    download: getDownloadAsset(version),
    icon: getVersionAsset(version, AssetType.Icon),
    signature: getVersionAsset(version, AssetType.Signature),
    coreTranslations: getCoreTranslationAssets(version)
  };
  return {
    type: "gallery",
    identifier: {
      id: getGalleryExtensionId(galleryExtension.publisher.publisherName, galleryExtension.extensionName),
      uuid: galleryExtension.extensionId
    },
    name: galleryExtension.extensionName,
    version: version.version,
    displayName: galleryExtension.displayName,
    publisherId: galleryExtension.publisher.publisherId,
    publisher: galleryExtension.publisher.publisherName,
    publisherDisplayName: galleryExtension.publisher.displayName,
    publisherDomain: galleryExtension.publisher.domain ? { link: galleryExtension.publisher.domain, verified: !!galleryExtension.publisher.isDomainVerified } : void 0,
    publisherSponsorLink: getSponsorLink(latestVersion),
    description: galleryExtension.shortDescription ?? "",
    installCount: getStatistic(galleryExtension.statistics, "install"),
    rating: getStatistic(galleryExtension.statistics, "averagerating"),
    ratingCount: getStatistic(galleryExtension.statistics, "ratingcount"),
    categories: galleryExtension.categories || [],
    tags: galleryExtension.tags || [],
    releaseDate: Date.parse(galleryExtension.releaseDate),
    lastUpdated: Date.parse(galleryExtension.lastUpdated),
    allTargetPlatforms,
    assets,
    properties: {
      dependencies: getExtensions(version, PropertyType.Dependency),
      extensionPack: getExtensions(version, PropertyType.ExtensionPack),
      engine: getEngine(version),
      enabledApiProposals: getEnabledApiProposals(version),
      localizedLanguages: getLocalizedLanguages(version),
      targetPlatform: getTargetPlatformForExtensionVersion(version),
      isPreReleaseVersion: isPreReleaseVersion(version),
      executesCode: executesCode(version)
    },
    hasPreReleaseVersion: isPreReleaseVersion(latestVersion),
    hasReleaseVersion: true,
    preview: getIsPreview(galleryExtension.flags),
    isSigned: !!assets.signature,
    queryContext,
    supportLink: getSupportLink(latestVersion)
  };
}
__name(toExtension, "toExtension");
let AbstractExtensionGalleryService = class {
  constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
    this.requestService = requestService;
    this.logService = logService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.fileService = fileService;
    this.productService = productService;
    this.configurationService = configurationService;
    const config = productService.extensionsGallery;
    const isPPEEnabled = config?.servicePPEUrl && configurationService.getValue("_extensionsGallery.enablePPE");
    this.extensionsGalleryUrl = isPPEEnabled ? config.servicePPEUrl : config?.serviceUrl;
    this.extensionsGallerySearchUrl = isPPEEnabled ? void 0 : config?.searchUrl;
    this.extensionsControlUrl = config?.controlUrl;
    this.extensionsEnabledWithApiProposalVersion = productService.extensionsEnabledWithApiProposalVersion?.map((id) => id.toLowerCase()) ?? [];
    this.commonHeadersPromise = resolveMarketplaceHeaders(
      productService.version,
      productService,
      this.environmentService,
      this.configurationService,
      this.fileService,
      storageService,
      this.telemetryService
    );
  }
  static {
    __name(this, "AbstractExtensionGalleryService");
  }
  extensionsGalleryUrl;
  extensionsGallerySearchUrl;
  extensionsControlUrl;
  commonHeadersPromise;
  extensionsEnabledWithApiProposalVersion;
  api(path = "") {
    return `${this.extensionsGalleryUrl}${path}`;
  }
  isEnabled() {
    return !!this.extensionsGalleryUrl;
  }
  async getExtensions(extensionInfos, arg1, arg2) {
    const options = CancellationToken.isCancellationToken(arg1) ? {} : arg1;
    const token = CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
    const result = await this.doGetExtensions(extensionInfos, options, token);
    const uuids = result.map((r) => r.identifier.uuid);
    const extensionInfosByName = [];
    for (const e of extensionInfos) {
      if (e.uuid && !uuids.includes(e.uuid)) {
        extensionInfosByName.push({ ...e, uuid: void 0 });
      }
    }
    if (extensionInfosByName.length) {
      this.telemetryService.publicLog2("galleryService:additionalQueryByName", {
        count: extensionInfosByName.length
      });
      const extensions = await this.doGetExtensions(extensionInfosByName, options, token);
      result.push(...extensions);
    }
    return result;
  }
  async doGetExtensions(extensionInfos, options, token) {
    const names = [];
    const ids = [], includePreReleases = [], versions = [];
    let isQueryForReleaseVersionFromPreReleaseVersion = true;
    for (const extensionInfo of extensionInfos) {
      if (extensionInfo.uuid) {
        ids.push(extensionInfo.uuid);
      } else {
        names.push(extensionInfo.id);
      }
      const includePreRelease = !!(extensionInfo.version || extensionInfo.preRelease);
      includePreReleases.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, includePreRelease });
      if (extensionInfo.version) {
        versions.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, version: extensionInfo.version });
      }
      isQueryForReleaseVersionFromPreReleaseVersion = isQueryForReleaseVersionFromPreReleaseVersion && (!!extensionInfo.hasPreRelease && !includePreRelease);
    }
    if (!ids.length && !names.length) {
      return [];
    }
    let query = new Query().withPage(1, extensionInfos.length);
    if (ids.length) {
      query = query.withFilter(4 /* ExtensionId */, ...ids);
    }
    if (names.length) {
      query = query.withFilter(7 /* ExtensionName */, ...names);
    }
    if (options.queryAllVersions || isQueryForReleaseVersionFromPreReleaseVersion) {
      query = query.withFlags(query.flags, 1 /* IncludeVersions */);
    }
    if (options.source) {
      query = query.withSource(options.source);
    }
    const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform: options.targetPlatform ?? CURRENT_TARGET_PLATFORM, includePreRelease: includePreReleases, versions, compatible: !!options.compatible, productVersion: options.productVersion ?? { version: this.productService.version, date: this.productService.date } }, token);
    if (options.source) {
      extensions.forEach((e, index) => setTelemetry(e, index, options.source));
    }
    return extensions;
  }
  async getCompatibleExtension(extension, includePreRelease, targetPlatform, productVersion = { version: this.productService.version, date: this.productService.date }) {
    if (isNotWebExtensionInWebTargetPlatform(extension.allTargetPlatforms, targetPlatform)) {
      return null;
    }
    if (await this.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
      return extension;
    }
    const query = new Query().withFlags(1 /* IncludeVersions */).withPage(1, 1).withFilter(4 /* ExtensionId */, extension.identifier.uuid);
    const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform, compatible: true, includePreRelease, productVersion }, CancellationToken.None);
    return extensions[0] || null;
  }
  async isExtensionCompatible(extension, includePreRelease, targetPlatform, productVersion = { version: this.productService.version, date: this.productService.date }) {
    if (!isTargetPlatformCompatible(extension.properties.targetPlatform, extension.allTargetPlatforms, targetPlatform)) {
      return false;
    }
    if (!includePreRelease && extension.properties.isPreReleaseVersion) {
      return false;
    }
    let engine = extension.properties.engine;
    if (!engine) {
      const manifest = await this.getManifest(extension, CancellationToken.None);
      if (!manifest) {
        throw new Error("Manifest was not found");
      }
      engine = manifest.engines.vscode;
    }
    if (!isEngineValid(engine, productVersion.version, productVersion.date)) {
      return false;
    }
    if (!this.areApiProposalsCompatible(extension.identifier, extension.properties.enabledApiProposals)) {
      return false;
    }
    return true;
  }
  areApiProposalsCompatible(extensionIdentifier, enabledApiProposals) {
    if (!enabledApiProposals) {
      return true;
    }
    if (!this.extensionsEnabledWithApiProposalVersion.includes(extensionIdentifier.id.toLowerCase())) {
      return true;
    }
    return areApiProposalsCompatible(enabledApiProposals);
  }
  async isValidVersion(extension, rawGalleryExtensionVersion, versionType, compatible, allTargetPlatforms, targetPlatform, productVersion = { version: this.productService.version, date: this.productService.date }) {
    if (!isTargetPlatformCompatible(getTargetPlatformForExtensionVersion(rawGalleryExtensionVersion), allTargetPlatforms, targetPlatform)) {
      return false;
    }
    if (versionType !== "any" && isPreReleaseVersion(rawGalleryExtensionVersion) !== (versionType === "prerelease")) {
      return false;
    }
    if (compatible) {
      try {
        const engine = await this.getEngine(extension, rawGalleryExtensionVersion);
        if (!isEngineValid(engine, productVersion.version, productVersion.date)) {
          return false;
        }
      } catch (error) {
        this.logService.error(`Error while getting the engine for the version ${rawGalleryExtensionVersion.version}.`, getErrorMessage(error));
        return false;
      }
    }
    return true;
  }
  async query(options, token) {
    let text = options.text || "";
    const pageSize = options.pageSize ?? 50;
    let query = new Query().withPage(1, pageSize);
    if (text) {
      text = text.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
        query = query.withFilter(5 /* Category */, category || quotedCategory);
        return "";
      });
      text = text.replace(/\btag:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedTag, tag) => {
        query = query.withFilter(1 /* Tag */, tag || quotedTag);
        return "";
      });
      text = text.replace(/\bfeatured(\s+|\b|$)/g, () => {
        query = query.withFilter(9 /* Featured */);
        return "";
      });
      text = text.trim();
      if (text) {
        text = text.length < 200 ? text : text.substring(0, 200);
        query = query.withFilter(10 /* SearchText */, text);
      }
      query = query.withSortBy(SortBy.NoneOrRelevance);
    } else if (options.ids) {
      query = query.withFilter(4 /* ExtensionId */, ...options.ids);
    } else if (options.names) {
      query = query.withFilter(7 /* ExtensionName */, ...options.names);
    } else {
      query = query.withSortBy(SortBy.InstallCount);
    }
    if (typeof options.sortBy === "number") {
      query = query.withSortBy(options.sortBy);
    }
    if (typeof options.sortOrder === "number") {
      query = query.withSortOrder(options.sortOrder);
    }
    if (options.source) {
      query = query.withSource(options.source);
    }
    const runQuery = /* @__PURE__ */ __name(async (query2, token2) => {
      const { extensions: extensions2, total: total2 } = await this.queryGalleryExtensions(query2, { targetPlatform: CURRENT_TARGET_PLATFORM, compatible: false, includePreRelease: !!options.includePreRelease, productVersion: options.productVersion ?? { version: this.productService.version, date: this.productService.date } }, token2);
      extensions2.forEach((e, index) => setTelemetry(e, (query2.pageNumber - 1) * query2.pageSize + index, options.source));
      return { extensions: extensions2, total: total2 };
    }, "runQuery");
    const { extensions, total } = await runQuery(query, token);
    const getPage = /* @__PURE__ */ __name(async (pageIndex, ct) => {
      if (ct.isCancellationRequested) {
        throw new CancellationError();
      }
      const { extensions: extensions2 } = await runQuery(query.withPage(pageIndex + 1), ct);
      return extensions2;
    }, "getPage");
    return { firstPage: extensions, total, pageSize: query.pageSize, getPage };
  }
  async queryGalleryExtensions(query, criteria, token) {
    const flags = query.flags;
    if (!!(query.flags & 512 /* IncludeLatestVersionOnly */) && !!(query.flags & 1 /* IncludeVersions */)) {
      query = query.withFlags(query.flags & ~1 /* IncludeVersions */, 512 /* IncludeLatestVersionOnly */);
    }
    if (!(query.flags & 512 /* IncludeLatestVersionOnly */) && !(query.flags & 1 /* IncludeVersions */)) {
      query = query.withFlags(query.flags, 512 /* IncludeLatestVersionOnly */);
    }
    if (criteria.versions?.length) {
      query = query.withFlags(query.flags & ~512 /* IncludeLatestVersionOnly */, 1 /* IncludeVersions */);
    }
    query = query.withFlags(query.flags, 128 /* IncludeAssetUri */, 4 /* IncludeCategoryAndTags */, 2 /* IncludeFiles */, 256 /* IncludeStatistics */, 16 /* IncludeVersionProperties */);
    const { galleryExtensions: rawGalleryExtensions, total, context } = await this.queryRawGalleryExtensions(query, token);
    const hasAllVersions = !(query.flags & 512 /* IncludeLatestVersionOnly */);
    if (hasAllVersions) {
      const extensions = [];
      for (const rawGalleryExtension of rawGalleryExtensions) {
        const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, context);
        if (extension) {
          extensions.push(extension);
        }
      }
      return { extensions, total };
    }
    const result = [];
    const needAllVersions = /* @__PURE__ */ new Map();
    for (let index = 0; index < rawGalleryExtensions.length; index++) {
      const rawGalleryExtension = rawGalleryExtensions[index];
      const extensionIdentifier = { id: getGalleryExtensionId(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
      const includePreRelease = isBoolean(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find((extensionIdentifierWithPreRelease) => areSameExtensions(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
      if (criteria.compatible && isNotWebExtensionInWebTargetPlatform(getAllTargetPlatforms(rawGalleryExtension), criteria.targetPlatform)) {
        continue;
      }
      const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, context);
      if (!extension || extension.properties.isPreReleaseVersion && (!includePreRelease || !extension.hasReleaseVersion) || !extension.properties.isPreReleaseVersion && extension.properties.targetPlatform !== criteria.targetPlatform && extension.hasPreReleaseVersion) {
        needAllVersions.set(rawGalleryExtension.extensionId, index);
      } else {
        result.push([index, extension]);
      }
    }
    if (needAllVersions.size) {
      const stopWatch = new StopWatch();
      const query2 = new Query().withFlags(flags & ~512 /* IncludeLatestVersionOnly */, 1 /* IncludeVersions */).withPage(1, needAllVersions.size).withFilter(4 /* ExtensionId */, ...needAllVersions.keys());
      const { extensions } = await this.queryGalleryExtensions(query2, criteria, token);
      this.telemetryService.publicLog2("galleryService:additionalQuery", {
        duration: stopWatch.elapsed(),
        count: needAllVersions.size
      });
      for (const extension of extensions) {
        const index = needAllVersions.get(extension.identifier.uuid);
        result.push([index, extension]);
      }
    }
    return { extensions: result.sort((a, b) => a[0] - b[0]).map(([, extension]) => extension), total };
  }
  async toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, queryContext) {
    const extensionIdentifier = { id: getGalleryExtensionId(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
    const version = criteria.versions?.find((extensionIdentifierWithVersion) => areSameExtensions(extensionIdentifierWithVersion, extensionIdentifier))?.version;
    const includePreRelease = isBoolean(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find((extensionIdentifierWithPreRelease) => areSameExtensions(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
    const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
    const rawGalleryExtensionVersions = sortExtensionVersions(rawGalleryExtension.versions, criteria.targetPlatform);
    if (criteria.compatible && isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, criteria.targetPlatform)) {
      return null;
    }
    for (let index = 0; index < rawGalleryExtensionVersions.length; index++) {
      const rawGalleryExtensionVersion = rawGalleryExtensionVersions[index];
      if (version && rawGalleryExtensionVersion.version !== version) {
        continue;
      }
      if (await this.isValidVersion(
        extensionIdentifier.id,
        rawGalleryExtensionVersion,
        includePreRelease ? "any" : "release",
        criteria.compatible,
        allTargetPlatforms,
        criteria.targetPlatform,
        criteria.productVersion
      )) {
        if (criteria.compatible && !this.areApiProposalsCompatible(extensionIdentifier, getEnabledApiProposals(rawGalleryExtensionVersion))) {
          continue;
        }
        return toExtension(rawGalleryExtension, rawGalleryExtensionVersion, allTargetPlatforms, queryContext);
      }
      if (version && rawGalleryExtensionVersion.version === version) {
        return null;
      }
    }
    if (version || criteria.compatible) {
      return null;
    }
    return toExtension(rawGalleryExtension, rawGalleryExtension.versions[0], allTargetPlatforms);
  }
  async queryRawGalleryExtensions(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No extension gallery service configured.");
    }
    query = query.withFlags(query.flags, 32 /* ExcludeNonValidated */).withFilter(8 /* Target */, "Microsoft.VisualStudio.Code").withFilter(12 /* ExcludeWithFlags */, flagsToString(4096 /* Unpublished */));
    const commonHeaders = await this.commonHeadersPromise;
    const data = JSON.stringify(query.raw);
    const headers = {
      ...commonHeaders,
      "Content-Type": "application/json",
      "Accept": "application/json;api-version=3.0-preview.1",
      "Accept-Encoding": "gzip",
      "Content-Length": String(data.length)
    };
    const stopWatch = new StopWatch();
    let context, errorCode, total = 0;
    try {
      context = await this.requestService.request({
        type: "POST",
        url: this.extensionsGallerySearchUrl && query.criteria.some((c) => c.filterType === 10 /* SearchText */) ? this.extensionsGallerySearchUrl : this.api("/extensionquery"),
        data,
        headers
      }, token);
      if (context.res.statusCode && context.res.statusCode >= 400 && context.res.statusCode < 500) {
        return { galleryExtensions: [], total };
      }
      const result = await asJson(context);
      if (result) {
        const r = result.results[0];
        const galleryExtensions = r.extensions;
        const resultCount = r.resultMetadata && r.resultMetadata.filter((m) => m.metadataType === "ResultCount")[0];
        total = resultCount && resultCount.metadataItems.filter((i) => i.name === "TotalCount")[0].count || 0;
        return {
          galleryExtensions,
          total,
          context: context.res.headers["activityid"] ? {
            [ACTIVITY_HEADER_NAME]: context.res.headers["activityid"]
          } : {}
        };
      }
      return { galleryExtensions: [], total };
    } catch (e) {
      if (isCancellationError(e)) {
        errorCode = ExtensionGalleryErrorCode.Cancelled;
        throw e;
      } else {
        const errorMessage = getErrorMessage(e);
        errorCode = isOfflineError(e) ? ExtensionGalleryErrorCode.Offline : errorMessage.startsWith("XHR timeout") ? ExtensionGalleryErrorCode.Timeout : ExtensionGalleryErrorCode.Failed;
        throw new ExtensionGalleryError(errorMessage, errorCode);
      }
    } finally {
      this.telemetryService.publicLog2("galleryService:query", {
        ...query.telemetryData,
        requestBodySize: String(data.length),
        duration: stopWatch.elapsed(),
        success: !!context && isSuccess(context),
        responseBodySize: context?.res.headers["Content-Length"],
        statusCode: context ? String(context.res.statusCode) : void 0,
        errorCode,
        count: String(total)
      });
    }
  }
  async reportStatistic(publisher, name, version, type) {
    if (!this.isEnabled()) {
      return void 0;
    }
    const url = isWeb ? this.api(`/itemName/${publisher}.${name}/version/${version}/statType/${type === StatisticType.Install ? "1" : "3"}/vscodewebextension`) : this.api(`/publishers/${publisher}/extensions/${name}/${version}/stats?statType=${type}`);
    const Accept = isWeb ? "api-version=6.1-preview.1" : "*/*;api-version=4.0-preview.1";
    const commonHeaders = await this.commonHeadersPromise;
    const headers = { ...commonHeaders, Accept };
    try {
      await this.requestService.request({
        type: "POST",
        url,
        headers
      }, CancellationToken.None);
    } catch (error) {
    }
  }
  async download(extension, location, operation) {
    this.logService.trace("ExtensionGalleryService#download", extension.identifier.id);
    const data = getGalleryExtensionTelemetryData(extension);
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    const operationParam = operation === InstallOperation.Install ? "install" : operation === InstallOperation.Update ? "update" : "";
    const downloadAsset = operationParam ? {
      uri: `${extension.assets.download.uri}${URI.parse(extension.assets.download.uri).query ? "&" : "?"}${operationParam}=true`,
      fallbackUri: `${extension.assets.download.fallbackUri}${URI.parse(extension.assets.download.fallbackUri).query ? "&" : "?"}${operationParam}=true`
    } : extension.assets.download;
    const headers = extension.queryContext?.[ACTIVITY_HEADER_NAME] ? { [ACTIVITY_HEADER_NAME]: extension.queryContext[ACTIVITY_HEADER_NAME] } : void 0;
    const context = await this.getAsset(extension.identifier.id, downloadAsset, AssetType.VSIX, headers ? { headers } : void 0);
    try {
      await this.fileService.writeFile(location, context.stream);
    } catch (error) {
      try {
        await this.fileService.del(location);
      } catch (e) {
        this.logService.warn(`Error while deleting the file ${location.toString()}`, getErrorMessage(e));
      }
      throw new ExtensionGalleryError(getErrorMessage(error), ExtensionGalleryErrorCode.DownloadFailedWriting);
    }
    this.telemetryService.publicLog("galleryService:downloadVSIX", { ...data, duration: (/* @__PURE__ */ new Date()).getTime() - startTime });
  }
  async downloadSignatureArchive(extension, location) {
    if (!extension.assets.signature) {
      throw new Error("No signature asset found");
    }
    this.logService.trace("ExtensionGalleryService#downloadSignatureArchive", extension.identifier.id);
    const context = await this.getAsset(extension.identifier.id, extension.assets.signature, AssetType.Signature);
    try {
      await this.fileService.writeFile(location, context.stream);
    } catch (error) {
      try {
        await this.fileService.del(location);
      } catch (e) {
        this.logService.warn(`Error while deleting the file ${location.toString()}`, getErrorMessage(e));
      }
      throw new ExtensionGalleryError(getErrorMessage(error), ExtensionGalleryErrorCode.DownloadFailedWriting);
    }
  }
  async getReadme(extension, token) {
    if (extension.assets.readme) {
      const context = await this.getAsset(extension.identifier.id, extension.assets.readme, AssetType.Details, {}, token);
      const content = await asTextOrError(context);
      return content || "";
    }
    return "";
  }
  async getManifest(extension, token) {
    if (extension.assets.manifest) {
      const context = await this.getAsset(extension.identifier.id, extension.assets.manifest, AssetType.Manifest, {}, token);
      const text = await asTextOrError(context);
      return text ? JSON.parse(text) : null;
    }
    return null;
  }
  async getManifestFromRawExtensionVersion(extension, rawExtensionVersion, token) {
    const manifestAsset = getVersionAsset(rawExtensionVersion, AssetType.Manifest);
    if (!manifestAsset) {
      throw new Error("Manifest was not found");
    }
    const headers = { "Accept-Encoding": "gzip" };
    const context = await this.getAsset(extension, manifestAsset, AssetType.Manifest, { headers });
    return await asJson(context);
  }
  async getCoreTranslation(extension, languageId) {
    const asset = extension.assets.coreTranslations.filter((t) => t[0] === languageId.toUpperCase())[0];
    if (asset) {
      const context = await this.getAsset(extension.identifier.id, asset[1], asset[0]);
      const text = await asTextOrError(context);
      return text ? JSON.parse(text) : null;
    }
    return null;
  }
  async getChangelog(extension, token) {
    if (extension.assets.changelog) {
      const context = await this.getAsset(extension.identifier.id, extension.assets.changelog, AssetType.Changelog, {}, token);
      const content = await asTextOrError(context);
      return content || "";
    }
    return "";
  }
  async getAllCompatibleVersions(extensionIdentifier, includePreRelease, targetPlatform) {
    let query = new Query().withFlags(1 /* IncludeVersions */, 4 /* IncludeCategoryAndTags */, 2 /* IncludeFiles */, 16 /* IncludeVersionProperties */).withPage(1, 1);
    if (extensionIdentifier.uuid) {
      query = query.withFilter(4 /* ExtensionId */, extensionIdentifier.uuid);
    } else {
      query = query.withFilter(7 /* ExtensionName */, extensionIdentifier.id);
    }
    const { galleryExtensions } = await this.queryRawGalleryExtensions(query, CancellationToken.None);
    if (!galleryExtensions.length) {
      return [];
    }
    const allTargetPlatforms = getAllTargetPlatforms(galleryExtensions[0]);
    if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, targetPlatform)) {
      return [];
    }
    const validVersions = [];
    await Promise.all(galleryExtensions[0].versions.map(async (version) => {
      try {
        if (await this.isValidVersion(
          extensionIdentifier.id,
          version,
          includePreRelease ? "any" : "release",
          true,
          allTargetPlatforms,
          targetPlatform
        ) && this.areApiProposalsCompatible(extensionIdentifier, getEnabledApiProposals(version))) {
          validVersions.push(version);
        }
      } catch (error) {
      }
    }));
    const result = [];
    const seen = /* @__PURE__ */ new Set();
    for (const version of sortExtensionVersions(validVersions, targetPlatform)) {
      if (!seen.has(version.version)) {
        seen.add(version.version);
        result.push({ version: version.version, date: version.lastUpdated, isPreReleaseVersion: isPreReleaseVersion(version) });
      }
    }
    return result;
  }
  async getAsset(extension, asset, assetType, options = {}, token = CancellationToken.None) {
    const commonHeaders = await this.commonHeadersPromise;
    const baseOptions = { type: "GET" };
    const headers = { ...commonHeaders, ...options.headers || {} };
    options = { ...options, ...baseOptions, headers };
    const url = asset.uri;
    const fallbackUrl = asset.fallbackUri;
    const firstOptions = { ...options, url };
    try {
      const context = await this.requestService.request(firstOptions, token);
      if (context.res.statusCode === 200) {
        return context;
      }
      const message = await asTextOrError(context);
      throw new Error(`Expected 200, got back ${context.res.statusCode} instead.

${message}`);
    } catch (err) {
      if (isCancellationError(err)) {
        throw err;
      }
      const message = getErrorMessage(err);
      this.telemetryService.publicLog2("galleryService:cdnFallback", { extension, assetType, message });
      const fallbackOptions = { ...options, url: fallbackUrl };
      return this.requestService.request(fallbackOptions, token);
    }
  }
  async getEngine(extension, rawExtensionVersion) {
    let engine = getEngine(rawExtensionVersion);
    if (!engine) {
      this.telemetryService.publicLog2("galleryService:engineFallback", { extension, version: rawExtensionVersion.version });
      const manifest = await this.getManifestFromRawExtensionVersion(extension, rawExtensionVersion, CancellationToken.None);
      if (!manifest) {
        throw new Error("Manifest was not found");
      }
      engine = manifest.engines.vscode;
    }
    return engine;
  }
  async getExtensionsControlManifest() {
    if (!this.isEnabled()) {
      throw new Error("No extension gallery service configured.");
    }
    if (!this.extensionsControlUrl) {
      return { malicious: [], deprecated: {}, search: [] };
    }
    const context = await this.requestService.request({ type: "GET", url: this.extensionsControlUrl }, CancellationToken.None);
    if (context.res.statusCode !== 200) {
      throw new Error("Could not get extensions report.");
    }
    const result = await asJson(context);
    const malicious = [];
    const deprecated = {};
    const search = [];
    const extensionsEnabledWithPreRelease = [];
    if (result) {
      for (const id of result.malicious) {
        malicious.push({ id });
      }
      if (result.migrateToPreRelease) {
        for (const [unsupportedPreReleaseExtensionId, preReleaseExtensionInfo] of Object.entries(result.migrateToPreRelease)) {
          if (!preReleaseExtensionInfo.engine || isEngineValid(preReleaseExtensionInfo.engine, this.productService.version, this.productService.date)) {
            deprecated[unsupportedPreReleaseExtensionId.toLowerCase()] = {
              disallowInstall: true,
              extension: {
                id: preReleaseExtensionInfo.id,
                displayName: preReleaseExtensionInfo.displayName,
                autoMigrate: { storage: !!preReleaseExtensionInfo.migrateStorage },
                preRelease: true
              }
            };
          }
        }
      }
      if (result.deprecated) {
        for (const [deprecatedExtensionId, deprecationInfo] of Object.entries(result.deprecated)) {
          if (deprecationInfo) {
            deprecated[deprecatedExtensionId.toLowerCase()] = isBoolean(deprecationInfo) ? {} : deprecationInfo;
          }
        }
      }
      if (result.search) {
        for (const s of result.search) {
          search.push(s);
        }
      }
      if (Array.isArray(result.extensionsEnabledWithPreRelease)) {
        for (const id of result.extensionsEnabledWithPreRelease) {
          extensionsEnabledWithPreRelease.push(id.toLowerCase());
        }
      }
    }
    return { malicious, deprecated, search, extensionsEnabledWithPreRelease };
  }
};
AbstractExtensionGalleryService = __decorateClass([
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IConfigurationService)
], AbstractExtensionGalleryService);
let ExtensionGalleryService = class extends AbstractExtensionGalleryService {
  static {
    __name(this, "ExtensionGalleryService");
  }
  constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
    super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
  }
};
ExtensionGalleryService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IConfigurationService)
], ExtensionGalleryService);
let ExtensionGalleryServiceWithNoStorageService = class extends AbstractExtensionGalleryService {
  static {
    __name(this, "ExtensionGalleryServiceWithNoStorageService");
  }
  constructor(requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
    super(void 0, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
  }
};
ExtensionGalleryServiceWithNoStorageService = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IConfigurationService)
], ExtensionGalleryServiceWithNoStorageService);
export {
  ExtensionGalleryService,
  ExtensionGalleryServiceWithNoStorageService,
  sortExtensionVersions
};
//# sourceMappingURL=extensionGalleryService.js.map
