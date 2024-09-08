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
import "./media/extension.css";
import {
  $,
  addDisposableListener,
  append
} from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Event } from "../../../../base/common/event.js";
import {
  combinedDisposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import {
  registerThemingParticipant
} from "../../../../platform/theme/common/themeService.js";
import { WORKBENCH_BACKGROUND } from "../../../common/theme.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  ExtensionContainers,
  ExtensionState,
  IExtensionsWorkbenchService
} from "../common/extensions.js";
import {
  ButtonWithDropDownExtensionAction,
  ButtonWithDropdownExtensionActionViewItem,
  ClearLanguageAction,
  DropDownExtensionAction,
  ExtensionRuntimeStateAction,
  ExtensionStatusAction,
  ExtensionStatusLabelAction,
  InstallDropdownAction,
  InstallingLabelAction,
  LocalInstallAction,
  ManageExtensionAction,
  MigrateDeprecatedExtensionAction,
  RemoteInstallAction,
  SetLanguageAction,
  UpdateAction,
  WebInstallAction
} from "./extensionsActions.js";
import { verifiedPublisherIcon as verifiedPublisherThemeIcon } from "./extensionsIcons.js";
import {
  ExtensionActivationStatusWidget,
  ExtensionHoverWidget,
  ExtensionPackCountWidget as ExtensionPackBadgeWidget,
  InstallCountWidget,
  PreReleaseBookmarkWidget,
  RatingsWidget,
  RecommendationWidget,
  RemoteBadgeWidget,
  SyncIgnoredWidget,
  VerifiedPublisherWidget,
  extensionVerifiedPublisherIconColor
} from "./extensionsWidgets.js";
const EXTENSION_LIST_ELEMENT_HEIGHT = 72;
class Delegate {
  getHeight() {
    return EXTENSION_LIST_ELEMENT_HEIGHT;
  }
  getTemplateId() {
    return "extension";
  }
}
let Renderer = class {
  constructor(extensionViewState, options, instantiationService, notificationService, extensionService, extensionsWorkbenchService, extensionEnablementService, contextMenuService) {
    this.extensionViewState = extensionViewState;
    this.options = options;
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.contextMenuService = contextMenuService;
  }
  get templateId() {
    return "extension";
  }
  renderTemplate(root) {
    const recommendationWidget = this.instantiationService.createInstance(
      RecommendationWidget,
      append(root, $(".extension-bookmark-container"))
    );
    const preReleaseWidget = this.instantiationService.createInstance(
      PreReleaseBookmarkWidget,
      append(root, $(".extension-bookmark-container"))
    );
    const element = append(root, $(".extension-list-item"));
    const iconContainer = append(element, $(".icon-container"));
    const icon = append(
      iconContainer,
      $("img.icon", { alt: "" })
    );
    const iconRemoteBadgeWidget = this.instantiationService.createInstance(
      RemoteBadgeWidget,
      iconContainer,
      false
    );
    const extensionPackBadgeWidget = this.instantiationService.createInstance(
      ExtensionPackBadgeWidget,
      iconContainer
    );
    const details = append(element, $(".details"));
    const headerContainer = append(details, $(".header-container"));
    const header = append(headerContainer, $(".header"));
    const name = append(header, $("span.name"));
    const installCount = append(header, $("span.install-count"));
    const ratings = append(header, $("span.ratings"));
    const syncIgnore = append(header, $("span.sync-ignored"));
    const activationStatus = append(header, $("span.activation-status"));
    const headerRemoteBadgeWidget = this.instantiationService.createInstance(
      RemoteBadgeWidget,
      header,
      false
    );
    const description = append(details, $(".description.ellipsis"));
    const footer = append(details, $(".footer"));
    const publisher = append(footer, $(".author.ellipsis"));
    const verifiedPublisherWidget = this.instantiationService.createInstance(
      VerifiedPublisherWidget,
      append(publisher, $(`.verified-publisher`)),
      true
    );
    const publisherDisplayName = append(
      publisher,
      $(".publisher-name.ellipsis")
    );
    const actionbar = new ActionBar(footer, {
      actionViewItemProvider: (action, options) => {
        if (action instanceof ButtonWithDropDownExtensionAction) {
          return new ButtonWithDropdownExtensionActionViewItem(
            action,
            {
              ...options,
              icon: true,
              label: true,
              menuActionsOrProvider: {
                getActions: () => action.menuActions
              },
              menuActionClassNames: action.menuActionClassNames
            },
            this.contextMenuService
          );
        }
        if (action instanceof DropDownExtensionAction) {
          return action.createActionViewItem(options);
        }
        return void 0;
      },
      focusOnlyEnabledItems: true
    });
    actionbar.setFocusable(false);
    actionbar.onDidRun(
      ({ error }) => error && this.notificationService.error(error)
    );
    const extensionStatusIconAction = this.instantiationService.createInstance(ExtensionStatusAction);
    const actions = [
      this.instantiationService.createInstance(
        ExtensionStatusLabelAction
      ),
      this.instantiationService.createInstance(
        MigrateDeprecatedExtensionAction,
        true
      ),
      this.instantiationService.createInstance(
        ExtensionRuntimeStateAction
      ),
      this.instantiationService.createInstance(UpdateAction, false),
      this.instantiationService.createInstance(InstallDropdownAction),
      this.instantiationService.createInstance(InstallingLabelAction),
      this.instantiationService.createInstance(SetLanguageAction),
      this.instantiationService.createInstance(ClearLanguageAction),
      this.instantiationService.createInstance(
        RemoteInstallAction,
        false
      ),
      this.instantiationService.createInstance(LocalInstallAction),
      this.instantiationService.createInstance(WebInstallAction),
      extensionStatusIconAction,
      this.instantiationService.createInstance(ManageExtensionAction)
    ];
    const extensionHoverWidget = this.instantiationService.createInstance(
      ExtensionHoverWidget,
      { target: root, position: this.options.hoverOptions.position },
      extensionStatusIconAction
    );
    const widgets = [
      recommendationWidget,
      preReleaseWidget,
      iconRemoteBadgeWidget,
      extensionPackBadgeWidget,
      headerRemoteBadgeWidget,
      verifiedPublisherWidget,
      extensionHoverWidget,
      this.instantiationService.createInstance(
        SyncIgnoredWidget,
        syncIgnore
      ),
      this.instantiationService.createInstance(
        ExtensionActivationStatusWidget,
        activationStatus,
        true
      ),
      this.instantiationService.createInstance(
        InstallCountWidget,
        installCount,
        true
      ),
      this.instantiationService.createInstance(
        RatingsWidget,
        ratings,
        true
      )
    ];
    const extensionContainers = this.instantiationService.createInstance(ExtensionContainers, [
      ...actions,
      ...widgets
    ]);
    actionbar.push(actions, { icon: true, label: true });
    const disposable = combinedDisposable(
      ...actions,
      ...widgets,
      actionbar,
      extensionContainers
    );
    return {
      root,
      element,
      icon,
      name,
      installCount,
      ratings,
      description,
      publisherDisplayName,
      disposables: [disposable],
      actionbar,
      extensionDisposables: [],
      set extension(extension) {
        extensionContainers.extension = extension;
      }
    };
  }
  renderPlaceholder(index, data) {
    data.element.classList.add("loading");
    data.root.removeAttribute("aria-label");
    data.root.removeAttribute("data-extension-id");
    data.extensionDisposables = dispose(data.extensionDisposables);
    data.icon.src = "";
    data.name.textContent = "";
    data.description.textContent = "";
    data.publisherDisplayName.textContent = "";
    data.installCount.style.display = "none";
    data.ratings.style.display = "none";
    data.extension = null;
  }
  renderElement(extension, index, data) {
    data.element.classList.remove("loading");
    data.root.setAttribute("data-extension-id", extension.identifier.id);
    if (extension.state !== ExtensionState.Uninstalled && !extension.server) {
      extension = this.extensionsWorkbenchService.local.filter(
        (e) => e.server === extension.server && areSameExtensions(e.identifier, extension.identifier)
      )[0] || extension;
    }
    data.extensionDisposables = dispose(data.extensionDisposables);
    const updateEnablement = () => {
      const disabled = extension.state === ExtensionState.Installed && extension.local && !this.extensionEnablementService.isEnabled(extension.local);
      const deprecated = !!extension.deprecationInfo;
      data.element.classList.toggle("deprecated", deprecated);
      data.root.classList.toggle("disabled", disabled);
    };
    updateEnablement();
    this.extensionService.onDidChangeExtensions(
      () => updateEnablement(),
      this,
      data.extensionDisposables
    );
    data.extensionDisposables.push(
      addDisposableListener(
        data.icon,
        "error",
        () => data.icon.src = extension.iconUrlFallback,
        { once: true }
      )
    );
    data.icon.src = extension.iconUrl;
    if (data.icon.complete) {
      data.icon.style.visibility = "inherit";
    } else {
      data.icon.style.visibility = "hidden";
      data.icon.onload = () => data.icon.style.visibility = "inherit";
    }
    data.name.textContent = extension.displayName;
    data.description.textContent = extension.description;
    const updatePublisher = () => {
      data.publisherDisplayName.textContent = !extension.resourceExtension && extension.local?.source !== "resource" ? extension.publisherDisplayName : "";
    };
    updatePublisher();
    Event.filter(
      this.extensionsWorkbenchService.onChange,
      (e) => !!e && areSameExtensions(e.identifier, extension.identifier)
    )(() => updatePublisher(), this, data.extensionDisposables);
    data.installCount.style.display = "";
    data.ratings.style.display = "";
    data.extension = extension;
    if (extension.gallery && extension.gallery.properties && extension.gallery.properties.localizedLanguages && extension.gallery.properties.localizedLanguages.length) {
      data.description.textContent = extension.gallery.properties.localizedLanguages.map((name) => name[0].toLocaleUpperCase() + name.slice(1)).join(", ");
    }
    this.extensionViewState.onFocus(
      (e) => {
        if (areSameExtensions(extension.identifier, e.identifier)) {
          data.actionbar.setFocusable(true);
        }
      },
      this,
      data.extensionDisposables
    );
    this.extensionViewState.onBlur(
      (e) => {
        if (areSameExtensions(extension.identifier, e.identifier)) {
          data.actionbar.setFocusable(false);
        }
      },
      this,
      data.extensionDisposables
    );
  }
  disposeElement(extension, index, data) {
    data.extensionDisposables = dispose(data.extensionDisposables);
  }
  disposeTemplate(data) {
    data.extensionDisposables = dispose(data.extensionDisposables);
    data.disposables = dispose(data.disposables);
  }
};
Renderer = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IWorkbenchExtensionEnablementService),
  __decorateParam(7, IContextMenuService)
], Renderer);
registerThemingParticipant(
  (theme, collector) => {
    const verifiedPublisherIconColor = theme.getColor(
      extensionVerifiedPublisherIconColor
    );
    if (verifiedPublisherIconColor) {
      const disabledVerifiedPublisherIconColor = verifiedPublisherIconColor.transparent(0.5).makeOpaque(WORKBENCH_BACKGROUND(theme));
      collector.addRule(
        `.extensions-list .monaco-list .monaco-list-row.disabled:not(.selected) .author .verified-publisher ${ThemeIcon.asCSSSelector(verifiedPublisherThemeIcon)} { color: ${disabledVerifiedPublisherIconColor}; }`
      );
    }
  }
);
export {
  Delegate,
  Renderer
};
