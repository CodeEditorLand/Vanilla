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
import "./media/activitybarpart.css";
import "./media/activityaction.css";
import {
  $,
  EventType,
  addDisposableListener,
  append,
  clearNode,
  isAncestor
} from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { ActionsOrientation } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import {
  Separator,
  SubmenuAction,
  toAction
} from "../../../../base/common/actions.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  Action2,
  IMenuService,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import {
  activeContrastBorder,
  contrastBorder,
  focusBorder
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  IThemeService,
  registerThemingParticipant
} from "../../../../platform/theme/common/themeService.js";
import { getMenuBarVisibility } from "../../../../platform/window/common/window.js";
import {
  ACTIVITY_BAR_ACTIVE_BACKGROUND,
  ACTIVITY_BAR_ACTIVE_BORDER,
  ACTIVITY_BAR_ACTIVE_FOCUS_BORDER,
  ACTIVITY_BAR_BACKGROUND,
  ACTIVITY_BAR_BADGE_BACKGROUND,
  ACTIVITY_BAR_BADGE_FOREGROUND,
  ACTIVITY_BAR_BORDER,
  ACTIVITY_BAR_DRAG_AND_DROP_BORDER,
  ACTIVITY_BAR_FOREGROUND,
  ACTIVITY_BAR_INACTIVE_FOREGROUND
} from "../../../common/theme.js";
import {
  IViewDescriptorService,
  ViewContainerLocation,
  ViewContainerLocationToString
} from "../../../common/views.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  ActivityBarPosition,
  IWorkbenchLayoutService,
  LayoutSettings,
  Parts,
  Position
} from "../../../services/layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ToggleSidebarPositionAction } from "../../actions/layoutActions.js";
import { Part } from "../../part.js";
import { GlobalCompositeBar } from "../globalCompositeBar.js";
import {
  PaneCompositeBar
} from "../paneCompositeBar.js";
import { CustomMenubarControl } from "../titlebar/menubarControl.js";
let ActivitybarPart = class extends Part {
  constructor(paneCompositePart, instantiationService, layoutService, themeService, storageService) {
    super(Parts.ACTIVITYBAR_PART, { hasTitle: false }, themeService, storageService, layoutService);
    this.paneCompositePart = paneCompositePart;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ActivitybarPart");
  }
  static ACTION_HEIGHT = 48;
  static pinnedViewContainersKey = "workbench.activity.pinnedViewlets2";
  static placeholderViewContainersKey = "workbench.activity.placeholderViewlets";
  static viewContainersWorkspaceStateKey = "workbench.activity.viewletsWorkspaceState";
  //#region IView
  minimumWidth = 48;
  maximumWidth = 48;
  minimumHeight = 0;
  maximumHeight = Number.POSITIVE_INFINITY;
  //#endregion
  compositeBar = this._register(
    new MutableDisposable()
  );
  content;
  createCompositeBar() {
    return this.instantiationService.createInstance(
      ActivityBarCompositeBar,
      {
        partContainerClass: "activitybar",
        pinnedViewContainersKey: ActivitybarPart.pinnedViewContainersKey,
        placeholderViewContainersKey: ActivitybarPart.placeholderViewContainersKey,
        viewContainersWorkspaceStateKey: ActivitybarPart.viewContainersWorkspaceStateKey,
        orientation: ActionsOrientation.VERTICAL,
        icon: true,
        iconSize: 24,
        activityHoverOptions: {
          position: /* @__PURE__ */ __name(() => this.layoutService.getSideBarPosition() === Position.LEFT ? HoverPosition.RIGHT : HoverPosition.LEFT, "position")
        },
        preventLoopNavigation: true,
        recomputeSizes: false,
        fillExtraContextMenuActions: /* @__PURE__ */ __name((actions, e) => {
        }, "fillExtraContextMenuActions"),
        compositeSize: 52,
        colors: /* @__PURE__ */ __name((theme) => ({
          activeForegroundColor: theme.getColor(
            ACTIVITY_BAR_FOREGROUND
          ),
          inactiveForegroundColor: theme.getColor(
            ACTIVITY_BAR_INACTIVE_FOREGROUND
          ),
          activeBorderColor: theme.getColor(
            ACTIVITY_BAR_ACTIVE_BORDER
          ),
          activeBackground: theme.getColor(
            ACTIVITY_BAR_ACTIVE_BACKGROUND
          ),
          badgeBackground: theme.getColor(
            ACTIVITY_BAR_BADGE_BACKGROUND
          ),
          badgeForeground: theme.getColor(
            ACTIVITY_BAR_BADGE_FOREGROUND
          ),
          dragAndDropBorder: theme.getColor(
            ACTIVITY_BAR_DRAG_AND_DROP_BORDER
          ),
          activeBackgroundColor: void 0,
          inactiveBackgroundColor: void 0,
          activeBorderBottomColor: void 0
        }), "colors"),
        overflowActionSize: ActivitybarPart.ACTION_HEIGHT
      },
      Parts.ACTIVITYBAR_PART,
      this.paneCompositePart,
      true
    );
  }
  createContentArea(parent) {
    this.element = parent;
    this.content = append(this.element, $(".content"));
    if (this.layoutService.isVisible(Parts.ACTIVITYBAR_PART)) {
      this.show();
    }
    return this.content;
  }
  getPinnedPaneCompositeIds() {
    return this.compositeBar.value?.getPinnedPaneCompositeIds() ?? [];
  }
  getVisiblePaneCompositeIds() {
    return this.compositeBar.value?.getVisiblePaneCompositeIds() ?? [];
  }
  focus() {
    this.compositeBar.value?.focus();
  }
  updateStyles() {
    super.updateStyles();
    const container = assertIsDefined(this.getContainer());
    const background = this.getColor(ACTIVITY_BAR_BACKGROUND) || "";
    container.style.backgroundColor = background;
    const borderColor = this.getColor(ACTIVITY_BAR_BORDER) || this.getColor(contrastBorder) || "";
    container.classList.toggle("bordered", !!borderColor);
    container.style.borderColor = borderColor ? borderColor : "";
  }
  show(focus) {
    if (!this.content) {
      return;
    }
    if (!this.compositeBar.value) {
      this.compositeBar.value = this.createCompositeBar();
      this.compositeBar.value.create(this.content);
      if (this.dimension) {
        this.layout(this.dimension.width, this.dimension.height);
      }
    }
    if (focus) {
      this.focus();
    }
  }
  hide() {
    if (!this.compositeBar.value) {
      return;
    }
    this.compositeBar.clear();
    if (this.content) {
      clearNode(this.content);
    }
  }
  layout(width, height) {
    super.layout(width, height, 0, 0);
    if (!this.compositeBar.value) {
      return;
    }
    const contentAreaSize = super.layoutContents(width, height).contentSize;
    this.compositeBar.value.layout(width, contentAreaSize.height);
  }
  toJSON() {
    return {
      type: Parts.ACTIVITYBAR_PART
    };
  }
};
ActivitybarPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkbenchLayoutService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService)
], ActivitybarPart);
let ActivityBarCompositeBar = class extends PaneCompositeBar {
  constructor(options, part, paneCompositePart, showGlobalActivities, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, configurationService, menuService, layoutService) {
    super({
      ...options,
      fillExtraContextMenuActions: /* @__PURE__ */ __name((actions, e) => {
        options.fillExtraContextMenuActions(actions, e);
        this.fillContextMenuActions(actions, e);
      }, "fillExtraContextMenuActions")
    }, part, paneCompositePart, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, layoutService);
    this.configurationService = configurationService;
    this.menuService = menuService;
    if (showGlobalActivities) {
      this.globalCompositeBar = this._register(instantiationService.createInstance(GlobalCompositeBar, () => this.getContextMenuActions(), (theme) => this.options.colors(theme), this.options.activityHoverOptions));
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("window.menuBarVisibility")) {
        if (getMenuBarVisibility(this.configurationService) === "compact") {
          this.installMenubar();
        } else {
          this.uninstallMenubar();
        }
      }
    }));
  }
  static {
    __name(this, "ActivityBarCompositeBar");
  }
  element;
  menuBar;
  menuBarContainer;
  compositeBarContainer;
  globalCompositeBar;
  keyboardNavigationDisposables = this._register(
    new DisposableStore()
  );
  fillContextMenuActions(actions, e) {
    const menuBarVisibility = getMenuBarVisibility(
      this.configurationService
    );
    if (menuBarVisibility === "compact" || menuBarVisibility === "hidden" || menuBarVisibility === "toggle") {
      actions.unshift(
        ...[
          toAction({
            id: "toggleMenuVisibility",
            label: localize("menu", "Menu"),
            checked: menuBarVisibility === "compact",
            run: /* @__PURE__ */ __name(() => this.configurationService.updateValue(
              "window.menuBarVisibility",
              menuBarVisibility === "compact" ? "toggle" : "compact"
            ), "run")
          }),
          new Separator()
        ]
      );
    }
    if (menuBarVisibility === "compact" && this.menuBarContainer && e?.target) {
      if (isAncestor(e.target, this.menuBarContainer)) {
        actions.unshift(
          ...[
            toAction({
              id: "hideCompactMenu",
              label: localize("hideMenu", "Hide Menu"),
              run: /* @__PURE__ */ __name(() => this.configurationService.updateValue(
                "window.menuBarVisibility",
                "toggle"
              ), "run")
            }),
            new Separator()
          ]
        );
      }
    }
    if (this.globalCompositeBar) {
      actions.push(new Separator());
      actions.push(...this.globalCompositeBar.getContextMenuActions());
    }
    actions.push(new Separator());
    actions.push(...this.getActivityBarContextMenuActions());
  }
  uninstallMenubar() {
    if (this.menuBar) {
      this.menuBar.dispose();
      this.menuBar = void 0;
    }
    if (this.menuBarContainer) {
      this.menuBarContainer.remove();
      this.menuBarContainer = void 0;
    }
  }
  installMenubar() {
    if (this.menuBar) {
      return;
    }
    this.menuBarContainer = document.createElement("div");
    this.menuBarContainer.classList.add("menubar");
    const content = assertIsDefined(this.element);
    content.prepend(this.menuBarContainer);
    this.menuBar = this._register(
      this.instantiationService.createInstance(CustomMenubarControl)
    );
    this.menuBar.create(this.menuBarContainer);
  }
  registerKeyboardNavigationListeners() {
    this.keyboardNavigationDisposables.clear();
    if (this.menuBarContainer) {
      this.keyboardNavigationDisposables.add(
        addDisposableListener(
          this.menuBarContainer,
          EventType.KEY_DOWN,
          (e) => {
            const kbEvent = new StandardKeyboardEvent(e);
            if (kbEvent.equals(KeyCode.DownArrow) || kbEvent.equals(KeyCode.RightArrow)) {
              this.focus();
            }
          }
        )
      );
    }
    if (this.compositeBarContainer) {
      this.keyboardNavigationDisposables.add(
        addDisposableListener(
          this.compositeBarContainer,
          EventType.KEY_DOWN,
          (e) => {
            const kbEvent = new StandardKeyboardEvent(e);
            if (kbEvent.equals(KeyCode.DownArrow) || kbEvent.equals(KeyCode.RightArrow)) {
              this.globalCompositeBar?.focus();
            } else if (kbEvent.equals(KeyCode.UpArrow) || kbEvent.equals(KeyCode.LeftArrow)) {
              this.menuBar?.toggleFocus();
            }
          }
        )
      );
    }
    if (this.globalCompositeBar) {
      this.keyboardNavigationDisposables.add(
        addDisposableListener(
          this.globalCompositeBar.element,
          EventType.KEY_DOWN,
          (e) => {
            const kbEvent = new StandardKeyboardEvent(e);
            if (kbEvent.equals(KeyCode.UpArrow) || kbEvent.equals(KeyCode.LeftArrow)) {
              this.focus(
                this.getVisiblePaneCompositeIds().length - 1
              );
            }
          }
        )
      );
    }
  }
  create(parent) {
    this.element = parent;
    if (getMenuBarVisibility(this.configurationService) === "compact") {
      this.installMenubar();
    }
    this.compositeBarContainer = super.create(this.element);
    if (this.globalCompositeBar) {
      this.globalCompositeBar.create(this.element);
    }
    this.registerKeyboardNavigationListeners();
    return this.compositeBarContainer;
  }
  layout(width, height) {
    if (this.menuBarContainer) {
      if (this.options.orientation === ActionsOrientation.VERTICAL) {
        height -= this.menuBarContainer.clientHeight;
      } else {
        width -= this.menuBarContainer.clientWidth;
      }
    }
    if (this.globalCompositeBar) {
      if (this.options.orientation === ActionsOrientation.VERTICAL) {
        height -= this.globalCompositeBar.size() * ActivitybarPart.ACTION_HEIGHT;
      } else {
        width -= this.globalCompositeBar.element.clientWidth;
      }
    }
    super.layout(width, height);
  }
  getActivityBarContextMenuActions() {
    const activityBarPositionMenu = this.menuService.getMenuActions(
      MenuId.ActivityBarPositionMenu,
      this.contextKeyService,
      { shouldForwardArgs: true, renderShortTitle: true }
    );
    const positionActions = [];
    createAndFillInContextMenuActions(activityBarPositionMenu, {
      primary: [],
      secondary: positionActions
    });
    return [
      new SubmenuAction(
        "workbench.action.panel.position",
        localize("activity bar position", "Activity Bar Position"),
        positionActions
      ),
      toAction({
        id: ToggleSidebarPositionAction.ID,
        label: ToggleSidebarPositionAction.getLabel(this.layoutService),
        run: /* @__PURE__ */ __name(() => this.instantiationService.invokeFunction(
          (accessor) => new ToggleSidebarPositionAction().run(accessor)
        ), "run")
      })
    ];
  }
};
ActivityBarCompositeBar = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IViewDescriptorService),
  __decorateParam(8, IViewsService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, IWorkbenchLayoutService)
], ActivityBarCompositeBar);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.activityBarLocation.default",
        title: {
          ...localize2(
            "positionActivityBarDefault",
            "Move Activity Bar to Side"
          ),
          mnemonicTitle: localize(
            {
              key: "miDefaultActivityBar",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Default"
          )
        },
        shortTitle: localize("default", "Default"),
        category: Categories.View,
        toggled: ContextKeyExpr.equals(
          `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
          ActivityBarPosition.DEFAULT
        ),
        menu: [
          {
            id: MenuId.ActivityBarPositionMenu,
            order: 1
          },
          {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(
              `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
              ActivityBarPosition.DEFAULT
            )
          }
        ]
      });
    }
    run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      configurationService.updateValue(
        LayoutSettings.ACTIVITY_BAR_LOCATION,
        ActivityBarPosition.DEFAULT
      );
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.activityBarLocation.top",
        title: {
          ...localize2(
            "positionActivityBarTop",
            "Move Activity Bar to Top"
          ),
          mnemonicTitle: localize(
            {
              key: "miTopActivityBar",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Top"
          )
        },
        shortTitle: localize("top", "Top"),
        category: Categories.View,
        toggled: ContextKeyExpr.equals(
          `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
          ActivityBarPosition.TOP
        ),
        menu: [
          {
            id: MenuId.ActivityBarPositionMenu,
            order: 2
          },
          {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(
              `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
              ActivityBarPosition.TOP
            )
          }
        ]
      });
    }
    run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      configurationService.updateValue(
        LayoutSettings.ACTIVITY_BAR_LOCATION,
        ActivityBarPosition.TOP
      );
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.activityBarLocation.bottom",
        title: {
          ...localize2(
            "positionActivityBarBottom",
            "Move Activity Bar to Bottom"
          ),
          mnemonicTitle: localize(
            {
              key: "miBottomActivityBar",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Bottom"
          )
        },
        shortTitle: localize("bottom", "Bottom"),
        category: Categories.View,
        toggled: ContextKeyExpr.equals(
          `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
          ActivityBarPosition.BOTTOM
        ),
        menu: [
          {
            id: MenuId.ActivityBarPositionMenu,
            order: 3
          },
          {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(
              `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
              ActivityBarPosition.BOTTOM
            )
          }
        ]
      });
    }
    run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      configurationService.updateValue(
        LayoutSettings.ACTIVITY_BAR_LOCATION,
        ActivityBarPosition.BOTTOM
      );
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.activityBarLocation.hide",
        title: {
          ...localize2("hideActivityBar", "Hide Activity Bar"),
          mnemonicTitle: localize(
            {
              key: "miHideActivityBar",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Hidden"
          )
        },
        shortTitle: localize("hide", "Hidden"),
        category: Categories.View,
        toggled: ContextKeyExpr.equals(
          `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
          ActivityBarPosition.HIDDEN
        ),
        menu: [
          {
            id: MenuId.ActivityBarPositionMenu,
            order: 4
          },
          {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(
              `config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`,
              ActivityBarPosition.HIDDEN
            )
          }
        ]
      });
    }
    run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      configurationService.updateValue(
        LayoutSettings.ACTIVITY_BAR_LOCATION,
        ActivityBarPosition.HIDDEN
      );
    }
  }
);
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.ActivityBarPositionMenu,
  title: localize("positionActivituBar", "Activity Bar Position"),
  group: "3_workbench_layout_move",
  order: 2
});
MenuRegistry.appendMenuItem(MenuId.ViewContainerTitleContext, {
  submenu: MenuId.ActivityBarPositionMenu,
  title: localize("positionActivituBar", "Activity Bar Position"),
  when: ContextKeyExpr.equals(
    "viewContainerLocation",
    ViewContainerLocationToString(ViewContainerLocation.Sidebar)
  ),
  group: "3_workbench_layout_move",
  order: 1
});
MenuRegistry.appendMenuItem(MenuId.ViewTitleContext, {
  submenu: MenuId.ActivityBarPositionMenu,
  title: localize("positionActivituBar", "Activity Bar Position"),
  when: ContextKeyExpr.equals(
    "viewLocation",
    ViewContainerLocationToString(ViewContainerLocation.Sidebar)
  ),
  group: "3_workbench_layout_move",
  order: 1
});
class SwitchSideBarViewAction extends Action2 {
  constructor(desc, offset) {
    super(desc);
    this.offset = offset;
  }
  static {
    __name(this, "SwitchSideBarViewAction");
  }
  async run(accessor) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const visibleViewletIds = paneCompositeService.getVisiblePaneCompositeIds(
      ViewContainerLocation.Sidebar
    );
    const activeViewlet = paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    );
    if (!activeViewlet) {
      return;
    }
    let targetViewletId;
    for (let i = 0; i < visibleViewletIds.length; i++) {
      if (visibleViewletIds[i] === activeViewlet.getId()) {
        targetViewletId = visibleViewletIds[(i + visibleViewletIds.length + this.offset) % visibleViewletIds.length];
        break;
      }
    }
    await paneCompositeService.openPaneComposite(
      targetViewletId,
      ViewContainerLocation.Sidebar,
      true
    );
  }
}
registerAction2(
  class PreviousSideBarViewAction extends SwitchSideBarViewAction {
    static {
      __name(this, "PreviousSideBarViewAction");
    }
    constructor() {
      super(
        {
          id: "workbench.action.previousSideBarView",
          title: localize2(
            "previousSideBarView",
            "Previous Primary Side Bar View"
          ),
          category: Categories.View,
          f1: true
        },
        -1
      );
    }
  }
);
registerAction2(
  class NextSideBarViewAction extends SwitchSideBarViewAction {
    static {
      __name(this, "NextSideBarViewAction");
    }
    constructor() {
      super(
        {
          id: "workbench.action.nextSideBarView",
          title: localize2(
            "nextSideBarView",
            "Next Primary Side Bar View"
          ),
          category: Categories.View,
          f1: true
        },
        1
      );
    }
  }
);
registerAction2(
  class FocusActivityBarAction extends Action2 {
    static {
      __name(this, "FocusActivityBarAction");
    }
    constructor() {
      super({
        id: "workbench.action.focusActivityBar",
        title: localize2("focusActivityBar", "Focus Activity Bar"),
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor) {
      const layoutService = accessor.get(IWorkbenchLayoutService);
      layoutService.focusPart(Parts.ACTIVITYBAR_PART);
    }
  }
);
registerThemingParticipant((theme, collector) => {
  const activityBarActiveBorderColor = theme.getColor(
    ACTIVITY_BAR_ACTIVE_BORDER
  );
  if (activityBarActiveBorderColor) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${activityBarActiveBorderColor};
			}
		`);
  }
  const activityBarActiveFocusBorderColor = theme.getColor(
    ACTIVITY_BAR_ACTIVE_FOCUS_BORDER
  );
  if (activityBarActiveFocusBorderColor) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus::before {
				visibility: hidden;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus .active-item-indicator:before {
				visibility: visible;
				border-left-color: ${activityBarActiveFocusBorderColor};
			}
		`);
  }
  const activityBarActiveBackgroundColor = theme.getColor(
    ACTIVITY_BAR_ACTIVE_BACKGROUND
  );
  if (activityBarActiveBackgroundColor) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${activityBarActiveBackgroundColor};
			}
		`);
  }
  const outline = theme.getColor(activeContrastBorder);
  if (outline) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label::before{
				padding: 6px;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover .action-label::before {
				outline: 1px solid ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label::before {
				outline: 1px dashed ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
				border-left-color: ${outline};
			}
		`);
  } else {
    const focusBorderColor = theme.getColor(focusBorder);
    if (focusBorderColor) {
      collector.addRule(`
				.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator::before {
						border-left-color: ${focusBorderColor};
					}
				`);
    }
  }
});
export {
  ActivityBarCompositeBar,
  ActivitybarPart
};
//# sourceMappingURL=activitybarPart.js.map
