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
import "./media/sidebarpart.css";
import "./sidebarActions.js";
import { ActivityBarPosition, IWorkbenchLayoutService, LayoutSettings, Parts, Position as SideBarPosition } from "../../../services/layout/browser/layoutService.js";
import { SidebarFocusContext, ActiveViewletContext } from "../../../common/contextkeys.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { contrastBorder } from "../../../../platform/theme/common/colorRegistry.js";
import { SIDE_BAR_TITLE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_FOREGROUND, SIDE_BAR_BORDER, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_TOP_FOREGROUND, ACTIVITY_BAR_TOP_ACTIVE_BORDER, ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND, ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER } from "../../../common/theme.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { AnchorAlignment } from "../../../../base/browser/ui/contextview/contextview.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { LayoutPriority } from "../../../../base/browser/ui/grid/grid.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { AbstractPaneCompositePart, CompositeBarPosition } from "../paneCompositePart.js";
import { ActivityBarCompositeBar, ActivitybarPart } from "../activitybar/activitybarPart.js";
import { ActionsOrientation } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { IPaneCompositeBarOptions } from "../paneCompositeBar.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Action2, IMenuService, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { Separator } from "../../../../base/common/actions.js";
import { ToggleActivityBarVisibilityActionId } from "../../actions/layoutActions.js";
import { localize2 } from "../../../../nls.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
let SidebarPart = class extends AbstractPaneCompositePart {
  //#endregion
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, configurationService, menuService) {
    super(
      Parts.SIDEBAR_PART,
      { hasTitle: true, borderWidth: /* @__PURE__ */ __name(() => this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder) ? 1 : 0, "borderWidth") },
      SidebarPart.activeViewletSettingsKey,
      ActiveViewletContext.bindTo(contextKeyService),
      SidebarFocusContext.bindTo(contextKeyService),
      "sideBar",
      "viewlet",
      SIDE_BAR_TITLE_FOREGROUND,
      notificationService,
      storageService,
      contextMenuService,
      layoutService,
      keybindingService,
      hoverService,
      instantiationService,
      themeService,
      viewDescriptorService,
      contextKeyService,
      extensionService,
      menuService
    );
    this.configurationService = configurationService;
    this.rememberActivityBarVisiblePosition();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(LayoutSettings.ACTIVITY_BAR_LOCATION)) {
        this.onDidChangeActivityBarLocation();
      }
    }));
    this.registerActions();
  }
  static {
    __name(this, "SidebarPart");
  }
  static activeViewletSettingsKey = "workbench.sidebar.activeviewletid";
  //#region IView
  minimumWidth = 170;
  maximumWidth = Number.POSITIVE_INFINITY;
  minimumHeight = 0;
  maximumHeight = Number.POSITIVE_INFINITY;
  get snap() {
    return true;
  }
  priority = LayoutPriority.Low;
  get preferredWidth() {
    const viewlet = this.getActivePaneComposite();
    if (!viewlet) {
      return;
    }
    const width = viewlet.getOptimalWidth();
    if (typeof width !== "number") {
      return;
    }
    return Math.max(width, 300);
  }
  activityBarPart = this._register(this.instantiationService.createInstance(ActivitybarPart, this));
  onDidChangeActivityBarLocation() {
    this.activityBarPart.hide();
    this.updateCompositeBar();
    const id = this.getActiveComposite()?.getId();
    if (id) {
      this.onTitleAreaUpdate(id);
    }
    if (this.shouldShowActivityBar()) {
      this.activityBarPart.show();
    }
    this.rememberActivityBarVisiblePosition();
  }
  updateStyles() {
    super.updateStyles();
    const container = assertIsDefined(this.getContainer());
    container.style.backgroundColor = this.getColor(SIDE_BAR_BACKGROUND) || "";
    container.style.color = this.getColor(SIDE_BAR_FOREGROUND) || "";
    const borderColor = this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder);
    const isPositionLeft = this.layoutService.getSideBarPosition() === SideBarPosition.LEFT;
    container.style.borderRightWidth = borderColor && isPositionLeft ? "1px" : "";
    container.style.borderRightStyle = borderColor && isPositionLeft ? "solid" : "";
    container.style.borderRightColor = isPositionLeft ? borderColor || "" : "";
    container.style.borderLeftWidth = borderColor && !isPositionLeft ? "1px" : "";
    container.style.borderLeftStyle = borderColor && !isPositionLeft ? "solid" : "";
    container.style.borderLeftColor = !isPositionLeft ? borderColor || "" : "";
    container.style.outlineColor = this.getColor(SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? "";
  }
  layout(width, height, top, left) {
    if (!this.layoutService.isVisible(Parts.SIDEBAR_PART)) {
      return;
    }
    super.layout(width, height, top, left);
  }
  getTitleAreaDropDownAnchorAlignment() {
    return this.layoutService.getSideBarPosition() === SideBarPosition.LEFT ? AnchorAlignment.LEFT : AnchorAlignment.RIGHT;
  }
  createCompositeBar() {
    return this.instantiationService.createInstance(ActivityBarCompositeBar, this.getCompositeBarOptions(), this.partId, this, false);
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "sidebar",
      pinnedViewContainersKey: ActivitybarPart.pinnedViewContainersKey,
      placeholderViewContainersKey: ActivitybarPart.placeholderViewContainersKey,
      viewContainersWorkspaceStateKey: ActivitybarPart.viewContainersWorkspaceStateKey,
      icon: true,
      orientation: ActionsOrientation.HORIZONTAL,
      recomputeSizes: true,
      activityHoverOptions: {
        position: /* @__PURE__ */ __name(() => this.getCompositeBarPosition() === CompositeBarPosition.BOTTOM ? HoverPosition.ABOVE : HoverPosition.BELOW, "position")
      },
      fillExtraContextMenuActions: /* @__PURE__ */ __name((actions) => {
        const viewsSubmenuAction = this.getViewsSubmenuAction();
        if (viewsSubmenuAction) {
          actions.push(new Separator());
          actions.push(viewsSubmenuAction);
        }
      }, "fillExtraContextMenuActions"),
      compositeSize: 0,
      iconSize: 16,
      overflowActionSize: 30,
      colors: /* @__PURE__ */ __name((theme) => ({
        activeBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        inactiveBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        activeBorderBottomColor: theme.getColor(ACTIVITY_BAR_TOP_ACTIVE_BORDER),
        activeForegroundColor: theme.getColor(ACTIVITY_BAR_TOP_FOREGROUND),
        inactiveForegroundColor: theme.getColor(ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND),
        badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
        dragAndDropBorder: theme.getColor(ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER)
      }), "colors"),
      compact: true
    };
  }
  shouldShowCompositeBar() {
    const activityBarPosition = this.configurationService.getValue(LayoutSettings.ACTIVITY_BAR_LOCATION);
    return activityBarPosition === ActivityBarPosition.TOP || activityBarPosition === ActivityBarPosition.BOTTOM;
  }
  shouldShowActivityBar() {
    if (this.shouldShowCompositeBar()) {
      return false;
    }
    return this.configurationService.getValue(LayoutSettings.ACTIVITY_BAR_LOCATION) !== ActivityBarPosition.HIDDEN;
  }
  getCompositeBarPosition() {
    const activityBarPosition = this.configurationService.getValue(LayoutSettings.ACTIVITY_BAR_LOCATION);
    switch (activityBarPosition) {
      case ActivityBarPosition.TOP:
        return CompositeBarPosition.TOP;
      case ActivityBarPosition.BOTTOM:
        return CompositeBarPosition.BOTTOM;
      case ActivityBarPosition.HIDDEN:
      case ActivityBarPosition.DEFAULT:
      // noop
      default:
        return CompositeBarPosition.TITLE;
    }
  }
  rememberActivityBarVisiblePosition() {
    const activityBarPosition = this.configurationService.getValue(LayoutSettings.ACTIVITY_BAR_LOCATION);
    if (activityBarPosition !== ActivityBarPosition.HIDDEN) {
      this.storageService.store(LayoutSettings.ACTIVITY_BAR_LOCATION, activityBarPosition, StorageScope.PROFILE, StorageTarget.USER);
    }
  }
  getRememberedActivityBarVisiblePosition() {
    const activityBarPosition = this.storageService.get(LayoutSettings.ACTIVITY_BAR_LOCATION, StorageScope.PROFILE);
    switch (activityBarPosition) {
      case ActivityBarPosition.TOP:
        return ActivityBarPosition.TOP;
      case ActivityBarPosition.BOTTOM:
        return ActivityBarPosition.BOTTOM;
      default:
        return ActivityBarPosition.DEFAULT;
    }
  }
  getPinnedPaneCompositeIds() {
    return this.shouldShowCompositeBar() ? super.getPinnedPaneCompositeIds() : this.activityBarPart.getPinnedPaneCompositeIds();
  }
  getVisiblePaneCompositeIds() {
    return this.shouldShowCompositeBar() ? super.getVisiblePaneCompositeIds() : this.activityBarPart.getVisiblePaneCompositeIds();
  }
  async focusActivityBar() {
    if (this.configurationService.getValue(LayoutSettings.ACTIVITY_BAR_LOCATION) === ActivityBarPosition.HIDDEN) {
      await this.configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_LOCATION, this.getRememberedActivityBarVisiblePosition());
      this.onDidChangeActivityBarLocation();
    }
    if (this.shouldShowCompositeBar()) {
      this.focusCompositeBar();
    } else {
      if (!this.layoutService.isVisible(Parts.ACTIVITYBAR_PART)) {
        this.layoutService.setPartHidden(false, Parts.ACTIVITYBAR_PART);
      }
      this.activityBarPart.show(true);
    }
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: ToggleActivityBarVisibilityActionId,
          title: localize2("toggleActivityBar", "Toggle Activity Bar Visibility")
        });
      }
      run() {
        const value = that.configurationService.getValue(LayoutSettings.ACTIVITY_BAR_LOCATION) === ActivityBarPosition.HIDDEN ? that.getRememberedActivityBarVisiblePosition() : ActivityBarPosition.HIDDEN;
        return that.configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_LOCATION, value);
      }
    }));
  }
  toJSON() {
    return {
      type: Parts.SIDEBAR_PART
    };
  }
};
SidebarPart = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IViewDescriptorService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IMenuService)
], SidebarPart);
export {
  SidebarPart
};
//# sourceMappingURL=sidebarPart.js.map
