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
import {
  Dimension,
  asCSSUrl,
  createCSSRule,
  isMouseEvent
} from "../../../base/browser/dom.js";
import { ActionsOrientation } from "../../../base/browser/ui/actionbar/actionbar.js";
import { toAction } from "../../../base/common/actions.js";
import { StringSHA1 } from "../../../base/common/hash.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore
} from "../../../base/common/lifecycle.js";
import { isNative } from "../../../base/common/platform.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { isString } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
import {
  IViewDescriptorService,
  ViewContainerLocation
} from "../../common/views.js";
import { IActivityService } from "../../services/activity/common/activity.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import {
  IWorkbenchLayoutService,
  Parts
} from "../../services/layout/browser/layoutService.js";
import { IViewsService } from "../../services/views/common/viewsService.js";
import {
  CompositeBar,
  CompositeDragAndDrop
} from "./compositeBar.js";
import {
  CompositeBarAction,
  ToggleCompositeBadgeAction,
  ToggleCompositePinnedAction
} from "./compositeBarActions.js";
let PaneCompositeBar = class extends Disposable {
  constructor(options, part, paneCompositePart, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, layoutService) {
    super();
    this.options = options;
    this.part = part;
    this.paneCompositePart = paneCompositePart;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.viewDescriptorService = viewDescriptorService;
    this.viewService = viewService;
    this.contextKeyService = contextKeyService;
    this.environmentService = environmentService;
    this.layoutService = layoutService;
    this.location = paneCompositePart.partId === Parts.PANEL_PART ? ViewContainerLocation.Panel : paneCompositePart.partId === Parts.AUXILIARYBAR_PART ? ViewContainerLocation.AuxiliaryBar : ViewContainerLocation.Sidebar;
    this.dndHandler = new CompositeDragAndDrop(
      this.viewDescriptorService,
      this.location,
      this.options.orientation,
      async (id, focus) => {
        return await this.paneCompositePart.openPaneComposite(id, focus) ?? null;
      },
      (from, to, before) => this.compositeBar.move(from, to, this.options.orientation === ActionsOrientation.VERTICAL ? before?.verticallyBefore : before?.horizontallyBefore),
      () => this.compositeBar.getCompositeBarItems()
    );
    const cachedItems = this.cachedViewContainers.map((container) => ({
      id: container.id,
      name: container.name,
      visible: !this.shouldBeHidden(container.id, container),
      order: container.order,
      pinned: container.pinned
    }));
    this.compositeBar = this.createCompositeBar(cachedItems);
    this.onDidRegisterViewContainers(this.getViewContainers());
    this.registerListeners();
  }
  static {
    __name(this, "PaneCompositeBar");
  }
  viewContainerDisposables = this._register(
    new DisposableMap()
  );
  location;
  compositeBar;
  dndHandler;
  compositeActions = /* @__PURE__ */ new Map();
  hasExtensionsRegistered = false;
  createCompositeBar(cachedItems) {
    return this._register(
      this.instantiationService.createInstance(
        CompositeBar,
        cachedItems,
        {
          icon: this.options.icon,
          compact: this.options.compact,
          orientation: this.options.orientation,
          activityHoverOptions: this.options.activityHoverOptions,
          preventLoopNavigation: this.options.preventLoopNavigation,
          openComposite: /* @__PURE__ */ __name(async (compositeId, preserveFocus) => {
            return await this.paneCompositePart.openPaneComposite(
              compositeId,
              !preserveFocus
            ) ?? null;
          }, "openComposite"),
          getActivityAction: /* @__PURE__ */ __name((compositeId) => this.getCompositeActions(compositeId).activityAction, "getActivityAction"),
          getCompositePinnedAction: /* @__PURE__ */ __name((compositeId) => this.getCompositeActions(compositeId).pinnedAction, "getCompositePinnedAction"),
          getCompositeBadgeAction: /* @__PURE__ */ __name((compositeId) => this.getCompositeActions(compositeId).badgeAction, "getCompositeBadgeAction"),
          getOnCompositeClickAction: /* @__PURE__ */ __name((compositeId) => this.getCompositeActions(compositeId).activityAction, "getOnCompositeClickAction"),
          fillExtraContextMenuActions: /* @__PURE__ */ __name((actions, e) => this.options.fillExtraContextMenuActions(actions, e), "fillExtraContextMenuActions"),
          getContextMenuActionsForComposite: /* @__PURE__ */ __name((compositeId) => this.getContextMenuActionsForComposite(compositeId), "getContextMenuActionsForComposite"),
          getDefaultCompositeId: /* @__PURE__ */ __name(() => this.viewDescriptorService.getDefaultViewContainer(
            this.location
          )?.id, "getDefaultCompositeId"),
          dndHandler: this.dndHandler,
          compositeSize: this.options.compositeSize,
          overflowActionSize: this.options.overflowActionSize,
          colors: /* @__PURE__ */ __name((theme) => this.options.colors(theme), "colors")
        }
      )
    );
  }
  getContextMenuActionsForComposite(compositeId) {
    const actions = [];
    const viewContainer = this.viewDescriptorService.getViewContainerById(compositeId);
    const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(
      viewContainer
    );
    if (defaultLocation !== this.viewDescriptorService.getViewContainerLocation(viewContainer)) {
      actions.push(
        toAction({
          id: "resetLocationAction",
          label: localize("resetLocation", "Reset Location"),
          run: /* @__PURE__ */ __name(() => this.viewDescriptorService.moveViewContainerToLocation(
            viewContainer,
            defaultLocation,
            void 0,
            "resetLocationAction"
          ), "run")
        })
      );
    } else {
      const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
      if (viewContainerModel.allViewDescriptors.length === 1) {
        const viewToReset = viewContainerModel.allViewDescriptors[0];
        const defaultContainer = this.viewDescriptorService.getDefaultContainerById(
          viewToReset.id
        );
        if (defaultContainer !== viewContainer) {
          actions.push(
            toAction({
              id: "resetLocationAction",
              label: localize("resetLocation", "Reset Location"),
              run: /* @__PURE__ */ __name(() => this.viewDescriptorService.moveViewsToContainer(
                [viewToReset],
                defaultContainer,
                void 0,
                "resetLocationAction"
              ), "run")
            })
          );
        }
      }
    }
    return actions;
  }
  registerListeners() {
    this._register(
      this.viewDescriptorService.onDidChangeViewContainers(
        ({ added, removed }) => this.onDidChangeViewContainers(added, removed)
      )
    );
    this._register(
      this.viewDescriptorService.onDidChangeContainerLocation(
        ({ viewContainer, from, to }) => this.onDidChangeViewContainerLocation(
          viewContainer,
          from,
          to
        )
      )
    );
    this._register(
      this.paneCompositePart.onDidPaneCompositeOpen(
        (e) => this.onDidChangeViewContainerVisibility(e.getId(), true)
      )
    );
    this._register(
      this.paneCompositePart.onDidPaneCompositeClose(
        (e) => this.onDidChangeViewContainerVisibility(e.getId(), false)
      )
    );
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      if (this._store.isDisposed) {
        return;
      }
      this.onDidRegisterExtensions();
      this._register(
        this.compositeBar.onDidChange(
          () => this.saveCachedViewContainers()
        )
      );
      this._register(
        this.storageService.onDidChangeValue(
          StorageScope.PROFILE,
          this.options.pinnedViewContainersKey,
          this._store
        )((e) => this.onDidPinnedViewContainersStorageValueChange(e))
      );
    });
  }
  onDidChangeViewContainers(added, removed) {
    removed.filter(({ location }) => location === this.location).forEach(
      ({ container }) => this.onDidDeregisterViewContainer(container)
    );
    this.onDidRegisterViewContainers(
      added.filter(({ location }) => location === this.location).map(({ container }) => container)
    );
  }
  onDidChangeViewContainerLocation(container, from, to) {
    if (from === this.location) {
      this.onDidDeregisterViewContainer(container);
    }
    if (to === this.location) {
      this.onDidRegisterViewContainers([container]);
    }
  }
  onDidChangeViewContainerVisibility(id, visible) {
    if (visible) {
      this.onDidViewContainerVisible(id);
    } else {
      this.compositeBar.deactivateComposite(id);
    }
  }
  onDidRegisterExtensions() {
    this.hasExtensionsRegistered = true;
    for (const { id } of this.cachedViewContainers) {
      const viewContainer = this.getViewContainer(id);
      if (viewContainer) {
        this.showOrHideViewContainer(viewContainer);
      } else if (this.viewDescriptorService.isViewContainerRemovedPermanently(id)) {
        this.removeComposite(id);
      } else {
        this.hideComposite(id);
      }
    }
    this.saveCachedViewContainers();
  }
  onDidViewContainerVisible(id) {
    const viewContainer = this.getViewContainer(id);
    if (viewContainer) {
      this.addComposite(viewContainer);
      this.compositeBar.activateComposite(viewContainer.id);
      if (this.shouldBeHidden(viewContainer)) {
        const viewContainerModel = this.viewDescriptorService.getViewContainerModel(
          viewContainer
        );
        if (viewContainerModel.activeViewDescriptors.length === 0) {
          this.hideComposite(viewContainer.id);
        }
      }
    }
  }
  create(parent) {
    return this.compositeBar.create(parent);
  }
  getCompositeActions(compositeId) {
    let compositeActions = this.compositeActions.get(compositeId);
    if (!compositeActions) {
      const viewContainer = this.getViewContainer(compositeId);
      if (viewContainer) {
        const viewContainerModel = this.viewDescriptorService.getViewContainerModel(
          viewContainer
        );
        compositeActions = {
          activityAction: this._register(
            this.instantiationService.createInstance(
              ViewContainerActivityAction,
              this.toCompositeBarActionItemFrom(
                viewContainerModel
              ),
              this.part,
              this.paneCompositePart
            )
          ),
          pinnedAction: this._register(
            new ToggleCompositePinnedAction(
              this.toCompositeBarActionItemFrom(
                viewContainerModel
              ),
              this.compositeBar
            )
          ),
          badgeAction: this._register(
            new ToggleCompositeBadgeAction(
              this.toCompositeBarActionItemFrom(
                viewContainerModel
              ),
              this.compositeBar
            )
          )
        };
      } else {
        const cachedComposite = this.cachedViewContainers.filter(
          (c) => c.id === compositeId
        )[0];
        compositeActions = {
          activityAction: this._register(
            this.instantiationService.createInstance(
              PlaceHolderViewContainerActivityAction,
              this.toCompositeBarActionItem(
                compositeId,
                cachedComposite?.name ?? compositeId,
                cachedComposite?.icon,
                void 0
              ),
              this.part,
              this.paneCompositePart
            )
          ),
          pinnedAction: this._register(
            new PlaceHolderToggleCompositePinnedAction(
              compositeId,
              this.compositeBar
            )
          ),
          badgeAction: this._register(
            new PlaceHolderToggleCompositeBadgeAction(
              compositeId,
              this.compositeBar
            )
          )
        };
      }
      this.compositeActions.set(compositeId, compositeActions);
    }
    return compositeActions;
  }
  onDidRegisterViewContainers(viewContainers) {
    for (const viewContainer of viewContainers) {
      this.addComposite(viewContainer);
      const cachedViewContainer = this.cachedViewContainers.filter(
        ({ id }) => id === viewContainer.id
      )[0];
      if (!cachedViewContainer) {
        this.compositeBar.pin(viewContainer.id);
      }
      const visibleViewContainer = this.paneCompositePart.getActivePaneComposite();
      if (visibleViewContainer?.getId() === viewContainer.id) {
        this.compositeBar.activateComposite(viewContainer.id);
      }
      const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
      this.updateCompositeBarActionItem(
        viewContainer,
        viewContainerModel
      );
      this.showOrHideViewContainer(viewContainer);
      const disposables = new DisposableStore();
      disposables.add(
        viewContainerModel.onDidChangeContainerInfo(
          () => this.updateCompositeBarActionItem(
            viewContainer,
            viewContainerModel
          )
        )
      );
      disposables.add(
        viewContainerModel.onDidChangeActiveViewDescriptors(
          () => this.showOrHideViewContainer(viewContainer)
        )
      );
      this.viewContainerDisposables.set(viewContainer.id, disposables);
    }
  }
  onDidDeregisterViewContainer(viewContainer) {
    this.viewContainerDisposables.deleteAndDispose(viewContainer.id);
    this.removeComposite(viewContainer.id);
  }
  updateCompositeBarActionItem(viewContainer, viewContainerModel) {
    const compositeBarActionItem = this.toCompositeBarActionItemFrom(viewContainerModel);
    const { activityAction, pinnedAction } = this.getCompositeActions(
      viewContainer.id
    );
    activityAction.updateCompositeBarActionItem(compositeBarActionItem);
    if (pinnedAction instanceof PlaceHolderToggleCompositePinnedAction) {
      pinnedAction.setActivity(compositeBarActionItem);
    }
    if (this.options.recomputeSizes) {
      this.compositeBar.recomputeSizes();
    }
    this.saveCachedViewContainers();
  }
  toCompositeBarActionItemFrom(viewContainerModel) {
    return this.toCompositeBarActionItem(
      viewContainerModel.viewContainer.id,
      viewContainerModel.title,
      viewContainerModel.icon,
      viewContainerModel.keybindingId
    );
  }
  toCompositeBarActionItem(id, name, icon, keybindingId) {
    let classNames;
    let iconUrl;
    if (this.options.icon) {
      if (URI.isUri(icon)) {
        iconUrl = icon;
        const cssUrl = asCSSUrl(icon);
        const hash = new StringSHA1();
        hash.update(cssUrl);
        const iconId = `activity-${id.replace(/\./g, "-")}-${hash.digest()}`;
        const iconClass = `.monaco-workbench .${this.options.partContainerClass} .monaco-action-bar .action-label.${iconId}`;
        classNames = [iconId, "uri-icon"];
        createCSSRule(
          iconClass,
          `
				mask: ${cssUrl} no-repeat 50% 50%;
				mask-size: ${this.options.iconSize}px;
				-webkit-mask: ${cssUrl} no-repeat 50% 50%;
				-webkit-mask-size: ${this.options.iconSize}px;
				mask-origin: padding;
				-webkit-mask-origin: padding;
			`
        );
      } else if (ThemeIcon.isThemeIcon(icon)) {
        classNames = ThemeIcon.asClassNameArray(icon);
      }
    }
    return { id, name, classNames, iconUrl, keybindingId };
  }
  showOrHideViewContainer(viewContainer) {
    if (this.shouldBeHidden(viewContainer)) {
      this.hideComposite(viewContainer.id);
    } else {
      this.addComposite(viewContainer);
    }
  }
  shouldBeHidden(viewContainerOrId, cachedViewContainer) {
    const viewContainer = isString(viewContainerOrId) ? this.getViewContainer(viewContainerOrId) : viewContainerOrId;
    const viewContainerId = isString(viewContainerOrId) ? viewContainerOrId : viewContainerOrId.id;
    if (viewContainer) {
      if (viewContainer.hideIfEmpty) {
        if (this.viewService.isViewContainerActive(viewContainerId)) {
          return false;
        }
      } else {
        return false;
      }
    }
    if (!this.hasExtensionsRegistered && !(this.part === Parts.SIDEBAR_PART && this.environmentService.remoteAuthority && isNative)) {
      cachedViewContainer = cachedViewContainer || this.cachedViewContainers.find(
        ({ id }) => id === viewContainerId
      );
      if (!viewContainer && cachedViewContainer?.isBuiltin && cachedViewContainer?.visible) {
        return false;
      }
      if (cachedViewContainer?.views?.length) {
        return cachedViewContainer.views.every(
          ({ when }) => !!when && !this.contextKeyService.contextMatchesRules(
            ContextKeyExpr.deserialize(when)
          )
        );
      }
    }
    return true;
  }
  addComposite(viewContainer) {
    this.compositeBar.addComposite({
      id: viewContainer.id,
      name: typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value,
      order: viewContainer.order,
      requestedIndex: viewContainer.requestedIndex
    });
  }
  hideComposite(compositeId) {
    this.compositeBar.hideComposite(compositeId);
    const compositeActions = this.compositeActions.get(compositeId);
    if (compositeActions) {
      compositeActions.activityAction.dispose();
      compositeActions.pinnedAction.dispose();
      this.compositeActions.delete(compositeId);
    }
  }
  removeComposite(compositeId) {
    this.compositeBar.removeComposite(compositeId);
    const compositeActions = this.compositeActions.get(compositeId);
    if (compositeActions) {
      compositeActions.activityAction.dispose();
      compositeActions.pinnedAction.dispose();
      this.compositeActions.delete(compositeId);
    }
  }
  getPinnedPaneCompositeIds() {
    const pinnedCompositeIds = this.compositeBar.getPinnedComposites().map((v) => v.id);
    return this.getViewContainers().filter((v) => this.compositeBar.isPinned(v.id)).sort(
      (v1, v2) => pinnedCompositeIds.indexOf(v1.id) - pinnedCompositeIds.indexOf(v2.id)
    ).map((v) => v.id);
  }
  getVisiblePaneCompositeIds() {
    return this.compositeBar.getVisibleComposites().filter(
      (v) => this.paneCompositePart.getActivePaneComposite()?.getId() === v.id || this.compositeBar.isPinned(v.id)
    ).map((v) => v.id);
  }
  getContextMenuActions() {
    return this.compositeBar.getContextMenuActions();
  }
  focus(index) {
    this.compositeBar.focus(index);
  }
  layout(width, height) {
    this.compositeBar.layout(new Dimension(width, height));
  }
  getViewContainer(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id);
    return viewContainer && this.viewDescriptorService.getViewContainerLocation(
      viewContainer
    ) === this.location ? viewContainer : void 0;
  }
  getViewContainers() {
    return this.viewDescriptorService.getViewContainersByLocation(
      this.location
    );
  }
  onDidPinnedViewContainersStorageValueChange(e) {
    if (this.pinnedViewContainersValue !== this.getStoredPinnedViewContainersValue()) {
      this._placeholderViewContainersValue = void 0;
      this._pinnedViewContainersValue = void 0;
      this._cachedViewContainers = void 0;
      const newCompositeItems = [];
      const compositeItems = this.compositeBar.getCompositeBarItems();
      for (const cachedViewContainer of this.cachedViewContainers) {
        newCompositeItems.push({
          id: cachedViewContainer.id,
          name: cachedViewContainer.name,
          order: cachedViewContainer.order,
          pinned: cachedViewContainer.pinned,
          visible: cachedViewContainer.visible && !!this.getViewContainer(cachedViewContainer.id)
        });
      }
      for (const viewContainer of this.getViewContainers()) {
        if (!newCompositeItems.some(({ id }) => id === viewContainer.id)) {
          const index = compositeItems.findIndex(
            ({ id }) => id === viewContainer.id
          );
          if (index !== -1) {
            const compositeItem = compositeItems[index];
            newCompositeItems.splice(index, 0, {
              id: viewContainer.id,
              name: typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value,
              order: compositeItem.order,
              pinned: compositeItem.pinned,
              visible: compositeItem.visible
            });
          } else {
            newCompositeItems.push({
              id: viewContainer.id,
              name: typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value,
              order: viewContainer.order,
              pinned: true,
              visible: !this.shouldBeHidden(viewContainer)
            });
          }
        }
      }
      this.compositeBar.setCompositeBarItems(newCompositeItems);
    }
  }
  saveCachedViewContainers() {
    const state = [];
    const compositeItems = this.compositeBar.getCompositeBarItems();
    for (const compositeItem of compositeItems) {
      const viewContainer = this.getViewContainer(compositeItem.id);
      if (viewContainer) {
        const viewContainerModel = this.viewDescriptorService.getViewContainerModel(
          viewContainer
        );
        const views = [];
        for (const { when } of viewContainerModel.allViewDescriptors) {
          views.push({ when: when ? when.serialize() : void 0 });
        }
        state.push({
          id: compositeItem.id,
          name: viewContainerModel.title,
          icon: URI.isUri(viewContainerModel.icon) && this.environmentService.remoteAuthority ? void 0 : viewContainerModel.icon,
          // Do not cache uri icons with remote connection
          views,
          pinned: compositeItem.pinned,
          order: compositeItem.order,
          visible: compositeItem.visible,
          isBuiltin: !viewContainer.extensionId
        });
      } else {
        state.push({
          id: compositeItem.id,
          name: compositeItem.name,
          pinned: compositeItem.pinned,
          order: compositeItem.order,
          visible: false,
          isBuiltin: false
        });
      }
    }
    this.storeCachedViewContainersState(state);
  }
  _cachedViewContainers = void 0;
  get cachedViewContainers() {
    if (this._cachedViewContainers === void 0) {
      this._cachedViewContainers = this.getPinnedViewContainers();
      for (const placeholderViewContainer of this.getPlaceholderViewContainers()) {
        const cachedViewContainer = this._cachedViewContainers.find(
          (cached) => cached.id === placeholderViewContainer.id
        );
        if (cachedViewContainer) {
          cachedViewContainer.visible = placeholderViewContainer.visible ?? cachedViewContainer.visible;
          cachedViewContainer.name = placeholderViewContainer.name;
          cachedViewContainer.icon = placeholderViewContainer.themeIcon ? placeholderViewContainer.themeIcon : placeholderViewContainer.iconUrl ? URI.revive(placeholderViewContainer.iconUrl) : void 0;
          if (URI.isUri(cachedViewContainer.icon) && this.environmentService.remoteAuthority) {
            cachedViewContainer.icon = void 0;
          }
          cachedViewContainer.views = placeholderViewContainer.views;
          cachedViewContainer.isBuiltin = placeholderViewContainer.isBuiltin;
        }
      }
      for (const viewContainerWorkspaceState of this.getViewContainersWorkspaceState()) {
        const cachedViewContainer = this._cachedViewContainers.find(
          (cached) => cached.id === viewContainerWorkspaceState.id
        );
        if (cachedViewContainer) {
          cachedViewContainer.visible = viewContainerWorkspaceState.visible ?? cachedViewContainer.visible;
        }
      }
    }
    return this._cachedViewContainers;
  }
  storeCachedViewContainersState(cachedViewContainers) {
    const pinnedViewContainers = this.getPinnedViewContainers();
    this.setPinnedViewContainers(
      cachedViewContainers.map(
        ({ id, pinned, order }) => ({
          id,
          pinned,
          visible: Boolean(
            pinnedViewContainers.find(
              ({ id: pinnedId }) => pinnedId === id
            )?.visible
          ),
          order
        })
      )
    );
    this.setPlaceholderViewContainers(
      cachedViewContainers.map(
        ({ id, icon, name, views, isBuiltin }) => ({
          id,
          iconUrl: URI.isUri(icon) ? icon : void 0,
          themeIcon: ThemeIcon.isThemeIcon(icon) ? icon : void 0,
          name,
          isBuiltin,
          views
        })
      )
    );
    this.setViewContainersWorkspaceState(
      cachedViewContainers.map(
        ({ id, visible }) => ({
          id,
          visible
        })
      )
    );
  }
  getPinnedViewContainers() {
    return JSON.parse(this.pinnedViewContainersValue);
  }
  setPinnedViewContainers(pinnedViewContainers) {
    this.pinnedViewContainersValue = JSON.stringify(pinnedViewContainers);
  }
  _pinnedViewContainersValue;
  get pinnedViewContainersValue() {
    if (!this._pinnedViewContainersValue) {
      this._pinnedViewContainersValue = this.getStoredPinnedViewContainersValue();
    }
    return this._pinnedViewContainersValue;
  }
  set pinnedViewContainersValue(pinnedViewContainersValue) {
    if (this.pinnedViewContainersValue !== pinnedViewContainersValue) {
      this._pinnedViewContainersValue = pinnedViewContainersValue;
      this.setStoredPinnedViewContainersValue(pinnedViewContainersValue);
    }
  }
  getStoredPinnedViewContainersValue() {
    return this.storageService.get(
      this.options.pinnedViewContainersKey,
      StorageScope.PROFILE,
      "[]"
    );
  }
  setStoredPinnedViewContainersValue(value) {
    this.storageService.store(
      this.options.pinnedViewContainersKey,
      value,
      StorageScope.PROFILE,
      StorageTarget.USER
    );
  }
  getPlaceholderViewContainers() {
    return JSON.parse(this.placeholderViewContainersValue);
  }
  setPlaceholderViewContainers(placeholderViewContainers) {
    this.placeholderViewContainersValue = JSON.stringify(
      placeholderViewContainers
    );
  }
  _placeholderViewContainersValue;
  get placeholderViewContainersValue() {
    if (!this._placeholderViewContainersValue) {
      this._placeholderViewContainersValue = this.getStoredPlaceholderViewContainersValue();
    }
    return this._placeholderViewContainersValue;
  }
  set placeholderViewContainersValue(placeholderViewContainesValue) {
    if (this.placeholderViewContainersValue !== placeholderViewContainesValue) {
      this._placeholderViewContainersValue = placeholderViewContainesValue;
      this.setStoredPlaceholderViewContainersValue(
        placeholderViewContainesValue
      );
    }
  }
  getStoredPlaceholderViewContainersValue() {
    return this.storageService.get(
      this.options.placeholderViewContainersKey,
      StorageScope.PROFILE,
      "[]"
    );
  }
  setStoredPlaceholderViewContainersValue(value) {
    this.storageService.store(
      this.options.placeholderViewContainersKey,
      value,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
  }
  getViewContainersWorkspaceState() {
    return JSON.parse(this.viewContainersWorkspaceStateValue);
  }
  setViewContainersWorkspaceState(viewContainersWorkspaceState) {
    this.viewContainersWorkspaceStateValue = JSON.stringify(
      viewContainersWorkspaceState
    );
  }
  _viewContainersWorkspaceStateValue;
  get viewContainersWorkspaceStateValue() {
    if (!this._viewContainersWorkspaceStateValue) {
      this._viewContainersWorkspaceStateValue = this.getStoredViewContainersWorkspaceStateValue();
    }
    return this._viewContainersWorkspaceStateValue;
  }
  set viewContainersWorkspaceStateValue(viewContainersWorkspaceStateValue) {
    if (this.viewContainersWorkspaceStateValue !== viewContainersWorkspaceStateValue) {
      this._viewContainersWorkspaceStateValue = viewContainersWorkspaceStateValue;
      this.setStoredViewContainersWorkspaceStateValue(
        viewContainersWorkspaceStateValue
      );
    }
  }
  getStoredViewContainersWorkspaceStateValue() {
    return this.storageService.get(
      this.options.viewContainersWorkspaceStateKey,
      StorageScope.WORKSPACE,
      "[]"
    );
  }
  setStoredViewContainersWorkspaceStateValue(value) {
    this.storageService.store(
      this.options.viewContainersWorkspaceStateKey,
      value,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
};
PaneCompositeBar = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IViewDescriptorService),
  __decorateParam(7, IViewsService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IWorkbenchLayoutService)
], PaneCompositeBar);
let ViewContainerActivityAction = class extends CompositeBarAction {
  constructor(compositeBarActionItem, part, paneCompositePart, layoutService, telemetryService, configurationService, activityService) {
    super(compositeBarActionItem);
    this.part = part;
    this.paneCompositePart = paneCompositePart;
    this.layoutService = layoutService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.activityService = activityService;
    this.updateActivity();
    this._register(this.activityService.onDidChangeActivity((viewContainerOrAction) => {
      if (!isString(viewContainerOrAction) && viewContainerOrAction.id === this.compositeBarActionItem.id) {
        this.updateActivity();
      }
    }));
  }
  static {
    __name(this, "ViewContainerActivityAction");
  }
  static preventDoubleClickDelay = 300;
  lastRun = 0;
  updateCompositeBarActionItem(compositeBarActionItem) {
    this.compositeBarActionItem = compositeBarActionItem;
  }
  updateActivity() {
    const activities = this.activityService.getViewContainerActivities(
      this.compositeBarActionItem.id
    );
    this.activity = activities[0];
  }
  async run(event) {
    if (isMouseEvent(event) && event.button === 2) {
      return;
    }
    const now = Date.now();
    if (now > this.lastRun && now - this.lastRun < ViewContainerActivityAction.preventDoubleClickDelay) {
      return;
    }
    this.lastRun = now;
    const focus = event && "preserveFocus" in event ? !event.preserveFocus : true;
    if (this.part === Parts.ACTIVITYBAR_PART) {
      const sideBarVisible = this.layoutService.isVisible(
        Parts.SIDEBAR_PART
      );
      const activeViewlet = this.paneCompositePart.getActivePaneComposite();
      const focusBehavior = this.configurationService.getValue(
        "workbench.activityBar.iconClickBehavior"
      );
      if (sideBarVisible && activeViewlet?.getId() === this.compositeBarActionItem.id) {
        switch (focusBehavior) {
          case "focus":
            this.logAction("refocus");
            this.paneCompositePart.openPaneComposite(
              this.compositeBarActionItem.id,
              focus
            );
            break;
          case "toggle":
          default:
            this.logAction("hide");
            this.layoutService.setPartHidden(
              true,
              Parts.SIDEBAR_PART
            );
            break;
        }
        return;
      }
      this.logAction("show");
    }
    await this.paneCompositePart.openPaneComposite(
      this.compositeBarActionItem.id,
      focus
    );
    return this.activate();
  }
  logAction(action) {
    this.telemetryService.publicLog2("activityBarAction", {
      viewletId: this.compositeBarActionItem.id,
      action
    });
  }
};
ViewContainerActivityAction = __decorateClass([
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IActivityService)
], ViewContainerActivityAction);
class PlaceHolderViewContainerActivityAction extends ViewContainerActivityAction {
  static {
    __name(this, "PlaceHolderViewContainerActivityAction");
  }
}
class PlaceHolderToggleCompositePinnedAction extends ToggleCompositePinnedAction {
  static {
    __name(this, "PlaceHolderToggleCompositePinnedAction");
  }
  constructor(id, compositeBar) {
    super({ id, name: id, classNames: void 0 }, compositeBar);
  }
  setActivity(activity) {
    this.label = activity.name;
  }
}
class PlaceHolderToggleCompositeBadgeAction extends ToggleCompositeBadgeAction {
  static {
    __name(this, "PlaceHolderToggleCompositeBadgeAction");
  }
  constructor(id, compositeBar) {
    super({ id, name: id, classNames: void 0 }, compositeBar);
  }
  setCompositeBarActionItem(actionItem) {
    this.label = actionItem.name;
  }
}
export {
  PaneCompositeBar
};
//# sourceMappingURL=paneCompositeBar.js.map
