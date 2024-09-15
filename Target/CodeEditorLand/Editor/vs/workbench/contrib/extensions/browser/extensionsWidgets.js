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
import "./media/extensionsWidgets.css";
import {
  $,
  EventType,
  addDisposableListener,
  append,
  finalHandler,
  reset
} from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import { CountBadge } from "../../../../base/browser/ui/countBadge/countBadge.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Color } from "../../../../base/common/color.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import * as platform from "../../../../base/common/platform.js";
import * as semver from "../../../../base/common/semver/semver.js";
import Severity from "../../../../base/common/severity.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { defaultCountBadgeStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import {
  registerColor,
  textLinkForeground
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  IThemeService,
  registerThemingParticipant
} from "../../../../platform/theme/common/themeService.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import {
  EXTENSION_BADGE_REMOTE_BACKGROUND,
  EXTENSION_BADGE_REMOTE_FOREGROUND
} from "../../../common/theme.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.js";
import {
  IExtensionIgnoredRecommendationsService,
  IExtensionRecommendationsService
} from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  ExtensionEditorTab,
  ExtensionState,
  IExtensionsWorkbenchService
} from "../common/extensions.js";
import {
  extensionButtonProminentBackground
} from "./extensionsActions.js";
import {
  activationTimeIcon,
  errorIcon,
  infoIcon,
  installCountIcon,
  preReleaseIcon,
  ratingIcon,
  remoteIcon,
  sponsorIcon,
  starEmptyIcon,
  starFullIcon,
  starHalfIcon,
  syncIgnoredIcon,
  verifiedPublisherIcon,
  warningIcon
} from "./extensionsIcons.js";
class ExtensionWidget extends Disposable {
  static {
    __name(this, "ExtensionWidget");
  }
  _extension = null;
  get extension() {
    return this._extension;
  }
  set extension(extension) {
    this._extension = extension;
    this.update();
  }
  update() {
    this.render();
  }
}
function onClick(element, callback) {
  const disposables = new DisposableStore();
  disposables.add(
    addDisposableListener(element, EventType.CLICK, finalHandler(callback))
  );
  disposables.add(
    addDisposableListener(element, EventType.KEY_UP, (e) => {
      const keyboardEvent = new StandardKeyboardEvent(e);
      if (keyboardEvent.equals(KeyCode.Space) || keyboardEvent.equals(KeyCode.Enter)) {
        e.preventDefault();
        e.stopPropagation();
        callback();
      }
    })
  );
  return disposables;
}
__name(onClick, "onClick");
class InstallCountWidget extends ExtensionWidget {
  constructor(container, small) {
    super();
    this.container = container;
    this.small = small;
    container.classList.add("extension-install-count");
    this.render();
  }
  static {
    __name(this, "InstallCountWidget");
  }
  render() {
    this.container.innerText = "";
    if (!this.extension) {
      return;
    }
    if (this.small && this.extension.state !== ExtensionState.Uninstalled) {
      return;
    }
    const installLabel = InstallCountWidget.getInstallLabel(
      this.extension,
      this.small
    );
    if (!installLabel) {
      return;
    }
    append(
      this.container,
      $("span" + ThemeIcon.asCSSSelector(installCountIcon))
    );
    const count = append(this.container, $("span.count"));
    count.textContent = installLabel;
  }
  static getInstallLabel(extension, small) {
    const installCount = extension.installCount;
    if (installCount === void 0) {
      return void 0;
    }
    let installLabel;
    if (small) {
      if (installCount > 1e6) {
        installLabel = `${Math.floor(installCount / 1e5) / 10}M`;
      } else if (installCount > 1e3) {
        installLabel = `${Math.floor(installCount / 1e3)}K`;
      } else {
        installLabel = String(installCount);
      }
    } else {
      installLabel = installCount.toLocaleString(platform.language);
    }
    return installLabel;
  }
}
let RatingsWidget = class extends ExtensionWidget {
  constructor(container, small, hoverService) {
    super();
    this.container = container;
    this.small = small;
    container.classList.add("extension-ratings");
    if (this.small) {
      container.classList.add("small");
    }
    this.containerHover = this._register(
      hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        container,
        ""
      )
    );
    this.render();
  }
  static {
    __name(this, "RatingsWidget");
  }
  containerHover;
  render() {
    this.container.innerText = "";
    if (!this.extension) {
      return;
    }
    if (this.small && this.extension.state !== ExtensionState.Uninstalled) {
      return;
    }
    if (this.extension.rating === void 0) {
      return;
    }
    if (this.small && !this.extension.ratingCount) {
      return;
    }
    const rating = Math.round(this.extension.rating * 2) / 2;
    this.containerHover.update(
      localize("ratedLabel", "Average rating: {0} out of 5", rating)
    );
    if (this.small) {
      append(
        this.container,
        $("span" + ThemeIcon.asCSSSelector(starFullIcon))
      );
      const count = append(this.container, $("span.count"));
      count.textContent = String(rating);
    } else {
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
          append(
            this.container,
            $("span" + ThemeIcon.asCSSSelector(starFullIcon))
          );
        } else if (rating >= i - 0.5) {
          append(
            this.container,
            $("span" + ThemeIcon.asCSSSelector(starHalfIcon))
          );
        } else {
          append(
            this.container,
            $("span" + ThemeIcon.asCSSSelector(starEmptyIcon))
          );
        }
      }
      if (this.extension.ratingCount) {
        const ratingCountElemet = append(
          this.container,
          $("span", void 0, ` (${this.extension.ratingCount})`)
        );
        ratingCountElemet.style.paddingLeft = "1px";
      }
    }
  }
};
RatingsWidget = __decorateClass([
  __decorateParam(2, IHoverService)
], RatingsWidget);
let VerifiedPublisherWidget = class extends ExtensionWidget {
  constructor(container, small, hoverService, openerService) {
    super();
    this.container = container;
    this.small = small;
    this.openerService = openerService;
    this.containerHover = this._register(
      hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        container,
        ""
      )
    );
    this.render();
  }
  static {
    __name(this, "VerifiedPublisherWidget");
  }
  disposables = this._register(new DisposableStore());
  containerHover;
  render() {
    reset(this.container);
    this.disposables.clear();
    if (!this.extension?.publisherDomain?.verified) {
      return;
    }
    if (this.extension.resourceExtension) {
      return;
    }
    if (this.extension.local?.source === "resource") {
      return;
    }
    const publisherDomainLink = URI.parse(
      this.extension.publisherDomain.link
    );
    const verifiedPublisher = append(
      this.container,
      $("span.extension-verified-publisher.clickable")
    );
    append(verifiedPublisher, renderIcon(verifiedPublisherIcon));
    if (!this.small) {
      verifiedPublisher.tabIndex = 0;
      this.containerHover.update(
        `Verified Domain: ${this.extension.publisherDomain.link}`
      );
      verifiedPublisher.setAttribute("role", "link");
      append(
        verifiedPublisher,
        $(
          "span.extension-verified-publisher-domain",
          void 0,
          publisherDomainLink.authority.startsWith("www.") ? publisherDomainLink.authority.substring(4) : publisherDomainLink.authority
        )
      );
      this.disposables.add(
        onClick(
          verifiedPublisher,
          () => this.openerService.open(publisherDomainLink)
        )
      );
    }
  }
};
VerifiedPublisherWidget = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IOpenerService)
], VerifiedPublisherWidget);
let SponsorWidget = class extends ExtensionWidget {
  constructor(container, hoverService, openerService, telemetryService) {
    super();
    this.container = container;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.telemetryService = telemetryService;
    this.render();
  }
  static {
    __name(this, "SponsorWidget");
  }
  disposables = this._register(new DisposableStore());
  render() {
    reset(this.container);
    this.disposables.clear();
    if (!this.extension?.publisherSponsorLink) {
      return;
    }
    const sponsor = append(
      this.container,
      $("span.sponsor.clickable", { tabIndex: 0 })
    );
    this.disposables.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        sponsor,
        this.extension?.publisherSponsorLink.toString() ?? ""
      )
    );
    sponsor.setAttribute("role", "link");
    const sponsorIconElement = renderIcon(sponsorIcon);
    const label = $("span", void 0, localize("sponsor", "Sponsor"));
    append(sponsor, sponsorIconElement, label);
    this.disposables.add(
      onClick(sponsor, () => {
        this.telemetryService.publicLog2("extensionsAction.sponsorExtension", {
          extensionId: this.extension.identifier.id
        });
        this.openerService.open(this.extension.publisherSponsorLink);
      })
    );
  }
};
SponsorWidget = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, ITelemetryService)
], SponsorWidget);
let RecommendationWidget = class extends ExtensionWidget {
  constructor(parent, extensionRecommendationsService) {
    super();
    this.parent = parent;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.render();
    this._register(toDisposable(() => this.clear()));
    this._register(
      this.extensionRecommendationsService.onDidChangeRecommendations(
        () => this.render()
      )
    );
  }
  static {
    __name(this, "RecommendationWidget");
  }
  element;
  disposables = this._register(new DisposableStore());
  clear() {
    this.element?.remove();
    this.element = void 0;
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.extension || this.extension.state === ExtensionState.Installed || this.extension.deprecationInfo) {
      return;
    }
    const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
    if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
      this.element = append(this.parent, $("div.extension-bookmark"));
      const recommendation = append(this.element, $(".recommendation"));
      append(
        recommendation,
        $("span" + ThemeIcon.asCSSSelector(ratingIcon))
      );
    }
  }
};
RecommendationWidget = __decorateClass([
  __decorateParam(1, IExtensionRecommendationsService)
], RecommendationWidget);
class PreReleaseBookmarkWidget extends ExtensionWidget {
  constructor(parent) {
    super();
    this.parent = parent;
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  static {
    __name(this, "PreReleaseBookmarkWidget");
  }
  element;
  disposables = this._register(new DisposableStore());
  clear() {
    this.element?.remove();
    this.element = void 0;
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (this.extension?.state === ExtensionState.Installed ? this.extension.preRelease : this.extension?.hasPreReleaseVersion) {
      this.element = append(this.parent, $("div.extension-bookmark"));
      const preRelease = append(this.element, $(".pre-release"));
      append(
        preRelease,
        $("span" + ThemeIcon.asCSSSelector(preReleaseIcon))
      );
    }
  }
}
let RemoteBadgeWidget = class extends ExtensionWidget {
  constructor(parent, tooltip, extensionManagementServerService, instantiationService) {
    super();
    this.tooltip = tooltip;
    this.extensionManagementServerService = extensionManagementServerService;
    this.instantiationService = instantiationService;
    this.element = append(parent, $(".extension-remote-badge-container"));
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  static {
    __name(this, "RemoteBadgeWidget");
  }
  remoteBadge = this._register(
    new MutableDisposable()
  );
  element;
  clear() {
    this.remoteBadge.value?.element.remove();
    this.remoteBadge.clear();
  }
  render() {
    this.clear();
    if (!this.extension || !this.extension.local || !this.extension.server || !(this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) || this.extension.server !== this.extensionManagementServerService.remoteExtensionManagementServer) {
      return;
    }
    this.remoteBadge.value = this.instantiationService.createInstance(
      RemoteBadge,
      this.tooltip
    );
    append(this.element, this.remoteBadge.value.element);
  }
};
RemoteBadgeWidget = __decorateClass([
  __decorateParam(2, IExtensionManagementServerService),
  __decorateParam(3, IInstantiationService)
], RemoteBadgeWidget);
let RemoteBadge = class extends Disposable {
  constructor(tooltip, hoverService, labelService, themeService, extensionManagementServerService) {
    super();
    this.tooltip = tooltip;
    this.labelService = labelService;
    this.themeService = themeService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.element = $("div.extension-badge.extension-remote-badge");
    this.elementHover = this._register(
      hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        this.element,
        ""
      )
    );
    this.render();
  }
  static {
    __name(this, "RemoteBadge");
  }
  element;
  elementHover;
  render() {
    append(this.element, $("span" + ThemeIcon.asCSSSelector(remoteIcon)));
    const applyBadgeStyle = /* @__PURE__ */ __name(() => {
      if (!this.element) {
        return;
      }
      const bgColor = this.themeService.getColorTheme().getColor(EXTENSION_BADGE_REMOTE_BACKGROUND);
      const fgColor = this.themeService.getColorTheme().getColor(EXTENSION_BADGE_REMOTE_FOREGROUND);
      this.element.style.backgroundColor = bgColor ? bgColor.toString() : "";
      this.element.style.color = fgColor ? fgColor.toString() : "";
    }, "applyBadgeStyle");
    applyBadgeStyle();
    this._register(
      this.themeService.onDidColorThemeChange(() => applyBadgeStyle())
    );
    if (this.tooltip) {
      const updateTitle = /* @__PURE__ */ __name(() => {
        if (this.element && this.extensionManagementServerService.remoteExtensionManagementServer) {
          this.elementHover.update(
            localize(
              "remote extension title",
              "Extension in {0}",
              this.extensionManagementServerService.remoteExtensionManagementServer.label
            )
          );
        }
      }, "updateTitle");
      this._register(
        this.labelService.onDidChangeFormatters(() => updateTitle())
      );
      updateTitle();
    }
  }
};
RemoteBadge = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IExtensionManagementServerService)
], RemoteBadge);
class ExtensionPackCountWidget extends ExtensionWidget {
  constructor(parent) {
    super();
    this.parent = parent;
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  static {
    __name(this, "ExtensionPackCountWidget");
  }
  element;
  clear() {
    this.element?.remove();
  }
  render() {
    this.clear();
    if (!this.extension || !this.extension.categories?.some(
      (category) => category.toLowerCase() === "extension packs"
    ) || !this.extension.extensionPack.length) {
      return;
    }
    this.element = append(
      this.parent,
      $(".extension-badge.extension-pack-badge")
    );
    const countBadge = new CountBadge(
      this.element,
      {},
      defaultCountBadgeStyles
    );
    countBadge.setCount(this.extension.extensionPack.length);
  }
}
let SyncIgnoredWidget = class extends ExtensionWidget {
  constructor(container, configurationService, extensionsWorkbenchService, hoverService, userDataSyncEnablementService) {
    super();
    this.container = container;
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.hoverService = hoverService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this._register(
      Event.filter(
        this.configurationService.onDidChangeConfiguration,
        (e) => e.affectsConfiguration("settingsSync.ignoredExtensions")
      )(() => this.render())
    );
    this._register(
      userDataSyncEnablementService.onDidChangeEnablement(
        () => this.update()
      )
    );
    this.render();
  }
  static {
    __name(this, "SyncIgnoredWidget");
  }
  disposables = this._register(new DisposableStore());
  render() {
    this.disposables.clear();
    this.container.innerText = "";
    if (this.extension && this.extension.state === ExtensionState.Installed && this.userDataSyncEnablementService.isEnabled() && this.extensionsWorkbenchService.isExtensionIgnoredToSync(
      this.extension
    )) {
      const element = append(
        this.container,
        $(
          "span.extension-sync-ignored" + ThemeIcon.asCSSSelector(syncIgnoredIcon)
        )
      );
      this.disposables.add(
        this.hoverService.setupManagedHover(
          getDefaultHoverDelegate("mouse"),
          element,
          localize(
            "syncingore.label",
            "This extension is ignored during sync."
          )
        )
      );
      element.classList.add(
        ...ThemeIcon.asClassNameArray(syncIgnoredIcon)
      );
    }
  }
};
SyncIgnoredWidget = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IUserDataSyncEnablementService)
], SyncIgnoredWidget);
let ExtensionActivationStatusWidget = class extends ExtensionWidget {
  constructor(container, small, extensionService, extensionsWorkbenchService) {
    super();
    this.container = container;
    this.small = small;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this._register(
      extensionService.onDidChangeExtensionsStatus((extensions) => {
        if (this.extension && extensions.some(
          (e) => areSameExtensions(
            { id: e.value },
            this.extension.identifier
          )
        )) {
          this.update();
        }
      })
    );
  }
  static {
    __name(this, "ExtensionActivationStatusWidget");
  }
  render() {
    this.container.innerText = "";
    if (!this.extension) {
      return;
    }
    const extensionStatus = this.extensionsWorkbenchService.getExtensionRuntimeStatus(
      this.extension
    );
    if (!extensionStatus || !extensionStatus.activationTimes) {
      return;
    }
    const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
    if (this.small) {
      append(
        this.container,
        $("span" + ThemeIcon.asCSSSelector(activationTimeIcon))
      );
      const activationTimeElement = append(
        this.container,
        $("span.activationTime")
      );
      activationTimeElement.textContent = `${activationTime}ms`;
    } else {
      const activationTimeElement = append(
        this.container,
        $("span.activationTime")
      );
      activationTimeElement.textContent = `${localize("activation", "Activation time")}${extensionStatus.activationTimes.activationReason.startup ? ` (${localize("startup", "Startup")})` : ""} : ${activationTime}ms`;
    }
  }
};
ExtensionActivationStatusWidget = __decorateClass([
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IExtensionsWorkbenchService)
], ExtensionActivationStatusWidget);
let ExtensionHoverWidget = class extends ExtensionWidget {
  constructor(options, extensionStatusAction, extensionsWorkbenchService, hoverService, configurationService, extensionRecommendationsService, themeService, contextService) {
    super();
    this.options = options;
    this.extensionStatusAction = extensionStatusAction;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.hoverService = hoverService;
    this.configurationService = configurationService;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.themeService = themeService;
    this.contextService = contextService;
  }
  static {
    __name(this, "ExtensionHoverWidget");
  }
  hover = this._register(
    new MutableDisposable()
  );
  render() {
    this.hover.value = void 0;
    if (this.extension) {
      this.hover.value = this.hoverService.setupManagedHover(
        {
          delay: this.configurationService.getValue(
            "workbench.hover.delay"
          ),
          showHover: /* @__PURE__ */ __name((options, focus) => {
            return this.hoverService.showHover(
              {
                ...options,
                additionalClasses: ["extension-hover"],
                position: {
                  hoverPosition: this.options.position(),
                  forcePosition: true
                },
                persistence: {
                  hideOnKeyDown: true
                }
              },
              focus
            );
          }, "showHover"),
          placement: "element"
        },
        this.options.target,
        {
          markdown: /* @__PURE__ */ __name(() => Promise.resolve(this.getHoverMarkdown()), "markdown"),
          markdownNotSupportedFallback: void 0
        },
        {
          appearance: {
            showHoverHint: true
          }
        }
      );
    }
  }
  getHoverMarkdown() {
    if (!this.extension) {
      return void 0;
    }
    const markdown = new MarkdownString("", {
      isTrusted: true,
      supportThemeIcons: true
    });
    markdown.appendMarkdown(`**${this.extension.displayName}**`);
    if (semver.valid(this.extension.version)) {
      markdown.appendMarkdown(
        `&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.version}${this.extension.isPreReleaseVersion ? " (pre-release)" : ""}_**&nbsp;</span>`
      );
    }
    markdown.appendText(`
`);
    if (this.extension.state === ExtensionState.Installed) {
      let addSeparator = false;
      const installLabel = InstallCountWidget.getInstallLabel(
        this.extension,
        true
      );
      if (installLabel) {
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        markdown.appendMarkdown(
          `$(${installCountIcon.id}) ${installLabel}`
        );
        addSeparator = true;
      }
      if (this.extension.rating) {
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        const rating = Math.round(this.extension.rating * 2) / 2;
        markdown.appendMarkdown(
          `$(${starFullIcon.id}) [${rating}](${this.extension.url}&ssr=false#review-details)`
        );
        addSeparator = true;
      }
      if (this.extension.publisherSponsorLink) {
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        markdown.appendMarkdown(
          `$(${sponsorIcon.id}) [${localize("sponsor", "Sponsor")}](${this.extension.publisherSponsorLink})`
        );
        addSeparator = true;
      }
      if (addSeparator) {
        markdown.appendText(`
`);
      }
    }
    const location = this.extension.resourceExtension?.location ?? (this.extension.local?.source === "resource" ? this.extension.local?.location : void 0);
    if (location) {
      if (this.extension.isWorkspaceScoped && this.contextService.isInsideWorkspace(location)) {
        markdown.appendMarkdown(
          localize("workspace extension", "Workspace Extension")
        );
      } else {
        markdown.appendMarkdown(
          localize("local extension", "Local Extension")
        );
      }
      markdown.appendText(`
`);
    }
    if (this.extension.description) {
      markdown.appendMarkdown(`${this.extension.description}`);
      markdown.appendText(`
`);
    }
    if (this.extension.publisherDomain?.verified) {
      const bgColor = this.themeService.getColorTheme().getColor(extensionVerifiedPublisherIconColor);
      const publisherVerifiedTooltip = localize(
        "publisher verified tooltip",
        "This publisher has verified ownership of {0}",
        `[${URI.parse(this.extension.publisherDomain.link).authority}](${this.extension.publisherDomain.link})`
      );
      markdown.appendMarkdown(
        `<span style="color:${bgColor ? Color.Format.CSS.formatHex(bgColor) : "#ffffff"};">$(${verifiedPublisherIcon.id})</span>&nbsp;${publisherVerifiedTooltip}`
      );
      markdown.appendText(`
`);
    }
    if (this.extension.outdated) {
      markdown.appendMarkdown(
        localize("updateRequired", "Latest version:")
      );
      markdown.appendMarkdown(
        `&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.latestVersion}_**&nbsp;</span>`
      );
      markdown.appendText(`
`);
    }
    const preReleaseMessage = ExtensionHoverWidget.getPreReleaseMessage(
      this.extension
    );
    const extensionRuntimeStatus = this.extensionsWorkbenchService.getExtensionRuntimeStatus(
      this.extension
    );
    const extensionStatus = this.extensionStatusAction.status;
    const runtimeState = this.extension.runtimeState;
    const recommendationMessage = this.getRecommendationMessage(
      this.extension
    );
    if (extensionRuntimeStatus || extensionStatus.length || runtimeState || recommendationMessage || preReleaseMessage) {
      markdown.appendMarkdown(`---`);
      markdown.appendText(`
`);
      if (extensionRuntimeStatus) {
        if (extensionRuntimeStatus.activationTimes) {
          const activationTime = extensionRuntimeStatus.activationTimes.codeLoadingTime + extensionRuntimeStatus.activationTimes.activateCallTime;
          markdown.appendMarkdown(
            `${localize("activation", "Activation time")}${extensionRuntimeStatus.activationTimes.activationReason.startup ? ` (${localize("startup", "Startup")})` : ""}: \`${activationTime}ms\``
          );
          markdown.appendText(`
`);
        }
        if (extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.length) {
          const hasErrors = extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.some(
            (message) => message.type === Severity.Error
          );
          const hasWarnings = extensionRuntimeStatus.messages.some(
            (message) => message.type === Severity.Warning
          );
          const errorsLink = extensionRuntimeStatus.runtimeErrors.length ? `[${extensionRuntimeStatus.runtimeErrors.length === 1 ? localize("uncaught error", "1 uncaught error") : localize("uncaught errors", "{0} uncaught errors", extensionRuntimeStatus.runtimeErrors.length)}](${URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, ExtensionEditorTab.Features]))}`)})` : void 0;
          const messageLink = extensionRuntimeStatus.messages.length ? `[${extensionRuntimeStatus.messages.length === 1 ? localize("message", "1 message") : localize("messages", "{0} messages", extensionRuntimeStatus.messages.length)}](${URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, ExtensionEditorTab.Features]))}`)})` : void 0;
          markdown.appendMarkdown(
            `$(${hasErrors ? errorIcon.id : hasWarnings ? warningIcon.id : infoIcon.id}) This extension has reported `
          );
          if (errorsLink && messageLink) {
            markdown.appendMarkdown(
              `${errorsLink} and ${messageLink}`
            );
          } else {
            markdown.appendMarkdown(`${errorsLink || messageLink}`);
          }
          markdown.appendText(`
`);
        }
      }
      for (const status of extensionStatus) {
        if (status.icon) {
          markdown.appendMarkdown(`$(${status.icon.id})&nbsp;`);
        }
        markdown.appendMarkdown(status.message.value);
        markdown.appendText(`
`);
      }
      if (runtimeState) {
        markdown.appendMarkdown(`$(${infoIcon.id})&nbsp;`);
        markdown.appendMarkdown(`${runtimeState.reason}`);
        markdown.appendText(`
`);
      }
      if (preReleaseMessage) {
        const extensionPreReleaseIcon = this.themeService.getColorTheme().getColor(extensionPreReleaseIconColor);
        markdown.appendMarkdown(
          `<span style="color:${extensionPreReleaseIcon ? Color.Format.CSS.formatHex(extensionPreReleaseIcon) : "#ffffff"};">$(${preReleaseIcon.id})</span>&nbsp;${preReleaseMessage}`
        );
        markdown.appendText(`
`);
      }
      if (recommendationMessage) {
        markdown.appendMarkdown(recommendationMessage);
        markdown.appendText(`
`);
      }
    }
    return markdown;
  }
  getRecommendationMessage(extension) {
    if (extension.state === ExtensionState.Installed) {
      return void 0;
    }
    if (extension.deprecationInfo) {
      return void 0;
    }
    const recommendation = this.extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()];
    if (!recommendation?.reasonText) {
      return void 0;
    }
    const bgColor = this.themeService.getColorTheme().getColor(extensionButtonProminentBackground);
    return `<span style="color:${bgColor ? Color.Format.CSS.formatHex(bgColor) : "#ffffff"};">$(${starEmptyIcon.id})</span>&nbsp;${recommendation.reasonText}`;
  }
  static getPreReleaseMessage(extension) {
    if (!extension.hasPreReleaseVersion) {
      return void 0;
    }
    if (extension.isBuiltin) {
      return void 0;
    }
    if (extension.isPreReleaseVersion) {
      return void 0;
    }
    if (extension.preRelease) {
      return void 0;
    }
    const preReleaseVersionLink = `[${localize("Show prerelease version", "Pre-Release version")}](${URI.parse(`command:workbench.extensions.action.showPreReleaseVersion?${encodeURIComponent(JSON.stringify([extension.identifier.id]))}`)})`;
    return localize(
      "has prerelease",
      "This extension has a {0} available",
      preReleaseVersionLink
    );
  }
};
ExtensionHoverWidget = __decorateClass([
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IExtensionRecommendationsService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IWorkspaceContextService)
], ExtensionHoverWidget);
let ExtensionStatusWidget = class extends ExtensionWidget {
  constructor(container, extensionStatusAction, openerService) {
    super();
    this.container = container;
    this.extensionStatusAction = extensionStatusAction;
    this.openerService = openerService;
    this.render();
    this._register(
      extensionStatusAction.onDidChangeStatus(() => this.render())
    );
  }
  static {
    __name(this, "ExtensionStatusWidget");
  }
  renderDisposables = this._register(
    new MutableDisposable()
  );
  _onDidRender = this._register(new Emitter());
  onDidRender = this._onDidRender.event;
  render() {
    reset(this.container);
    this.renderDisposables.value = void 0;
    const disposables = new DisposableStore();
    this.renderDisposables.value = disposables;
    const extensionStatus = this.extensionStatusAction.status;
    if (extensionStatus.length) {
      const markdown = new MarkdownString("", {
        isTrusted: true,
        supportThemeIcons: true
      });
      for (let i = 0; i < extensionStatus.length; i++) {
        const status = extensionStatus[i];
        if (status.icon) {
          markdown.appendMarkdown(`$(${status.icon.id})&nbsp;`);
        }
        markdown.appendMarkdown(status.message.value);
        if (i < extensionStatus.length - 1) {
          markdown.appendText(`
`);
        }
      }
      const rendered = disposables.add(
        renderMarkdown(markdown, {
          actionHandler: {
            callback: /* @__PURE__ */ __name((content) => {
              this.openerService.open(content, { allowCommands: true }).catch(onUnexpectedError);
            }, "callback"),
            disposables
          }
        })
      );
      append(this.container, rendered.element);
    }
    this._onDidRender.fire();
  }
};
ExtensionStatusWidget = __decorateClass([
  __decorateParam(2, IOpenerService)
], ExtensionStatusWidget);
let ExtensionRecommendationWidget = class extends ExtensionWidget {
  constructor(container, extensionRecommendationsService, extensionIgnoredRecommendationsService) {
    super();
    this.container = container;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
    this.render();
    this._register(
      this.extensionRecommendationsService.onDidChangeRecommendations(
        () => this.render()
      )
    );
  }
  static {
    __name(this, "ExtensionRecommendationWidget");
  }
  _onDidRender = this._register(new Emitter());
  onDidRender = this._onDidRender.event;
  render() {
    reset(this.container);
    const recommendationStatus = this.getRecommendationStatus();
    if (recommendationStatus) {
      if (recommendationStatus.icon) {
        append(
          this.container,
          $(
            `div${ThemeIcon.asCSSSelector(recommendationStatus.icon)}`
          )
        );
      }
      append(
        this.container,
        $(
          `div.recommendation-text`,
          void 0,
          recommendationStatus.message
        )
      );
    }
    this._onDidRender.fire();
  }
  getRecommendationStatus() {
    if (!this.extension || this.extension.deprecationInfo || this.extension.state === ExtensionState.Installed) {
      return void 0;
    }
    const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
    if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
      const reasonText = extRecommendations[this.extension.identifier.id.toLowerCase()].reasonText;
      if (reasonText) {
        return { icon: starEmptyIcon, message: reasonText };
      }
    } else if (this.extensionIgnoredRecommendationsService.globalIgnoredRecommendations.indexOf(
      this.extension.identifier.id.toLowerCase()
    ) !== -1) {
      return {
        icon: void 0,
        message: localize(
          "recommendationHasBeenIgnored",
          "You have chosen not to receive recommendations for this extension."
        )
      };
    }
    return void 0;
  }
};
ExtensionRecommendationWidget = __decorateClass([
  __decorateParam(1, IExtensionRecommendationsService),
  __decorateParam(2, IExtensionIgnoredRecommendationsService)
], ExtensionRecommendationWidget);
const extensionRatingIconColor = registerColor(
  "extensionIcon.starForeground",
  {
    light: "#DF6100",
    dark: "#FF8E00",
    hcDark: "#FF8E00",
    hcLight: textLinkForeground
  },
  localize(
    "extensionIconStarForeground",
    "The icon color for extension ratings."
  ),
  true
);
const extensionVerifiedPublisherIconColor = registerColor(
  "extensionIcon.verifiedForeground",
  textLinkForeground,
  localize(
    "extensionIconVerifiedForeground",
    "The icon color for extension verified publisher."
  ),
  true
);
const extensionPreReleaseIconColor = registerColor(
  "extensionIcon.preReleaseForeground",
  {
    dark: "#1d9271",
    light: "#1d9271",
    hcDark: "#1d9271",
    hcLight: textLinkForeground
  },
  localize(
    "extensionPreReleaseForeground",
    "The icon color for pre-release extension."
  ),
  true
);
const extensionSponsorIconColor = registerColor(
  "extensionIcon.sponsorForeground",
  { light: "#B51E78", dark: "#D758B3", hcDark: null, hcLight: "#B51E78" },
  localize(
    "extensionIcon.sponsorForeground",
    "The icon color for extension sponsor."
  ),
  true
);
registerThemingParticipant((theme, collector) => {
  const extensionRatingIcon = theme.getColor(extensionRatingIconColor);
  if (extensionRatingIcon) {
    collector.addRule(
      `.extension-ratings .codicon-extensions-star-full, .extension-ratings .codicon-extensions-star-half { color: ${extensionRatingIcon}; }`
    );
    collector.addRule(
      `.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(starFullIcon)} { color: ${extensionRatingIcon}; }`
    );
  }
  const extensionVerifiedPublisherIcon = theme.getColor(
    extensionVerifiedPublisherIconColor
  );
  if (extensionVerifiedPublisherIcon) {
    collector.addRule(
      `${ThemeIcon.asCSSSelector(verifiedPublisherIcon)} { color: ${extensionVerifiedPublisherIcon}; }`
    );
  }
  collector.addRule(
    `.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`
  );
  collector.addRule(
    `.extension-editor > .header > .details > .subtitle .sponsor ${ThemeIcon.asCSSSelector(sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`
  );
});
export {
  ExtensionActivationStatusWidget,
  ExtensionHoverWidget,
  ExtensionPackCountWidget,
  ExtensionRecommendationWidget,
  ExtensionStatusWidget,
  ExtensionWidget,
  InstallCountWidget,
  PreReleaseBookmarkWidget,
  RatingsWidget,
  RecommendationWidget,
  RemoteBadgeWidget,
  SponsorWidget,
  SyncIgnoredWidget,
  VerifiedPublisherWidget,
  extensionPreReleaseIconColor,
  extensionRatingIconColor,
  extensionSponsorIconColor,
  extensionVerifiedPublisherIconColor,
  onClick
};
//# sourceMappingURL=extensionsWidgets.js.map
