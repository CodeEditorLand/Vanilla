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
import "./media/panelpart.css";
import { Dimension } from "../../../../base/browser/dom.js";
import { ActionsOrientation } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import {
  Separator,
  SubmenuAction,
  toAction
} from "../../../../base/common/actions.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  IMenuService,
  MenuId
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import {
  badgeBackground,
  badgeForeground,
  contrastBorder
} from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  ActivePanelContext,
  PanelFocusContext
} from "../../../common/contextkeys.js";
import {
  PANEL_ACTIVE_TITLE_BORDER,
  PANEL_ACTIVE_TITLE_FOREGROUND,
  PANEL_BACKGROUND,
  PANEL_BORDER,
  PANEL_DRAG_AND_DROP_BORDER,
  PANEL_INACTIVE_TITLE_FOREGROUND
} from "../../../common/theme.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  IWorkbenchLayoutService,
  Parts,
  Position
} from "../../../services/layout/browser/layoutService.js";
import {
  AbstractPaneCompositePart,
  CompositeBarPosition
} from "../paneCompositePart.js";
import { TogglePanelAction } from "./panelActions.js";
let PanelPart = class extends AbstractPaneCompositePart {
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService, menuService, configurationService) {
    super(
      Parts.PANEL_PART,
      { hasTitle: true },
      PanelPart.activePanelSettingsKey,
      ActivePanelContext.bindTo(contextKeyService),
      PanelFocusContext.bindTo(contextKeyService),
      "panel",
      "panel",
      void 0,
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
    this.commandService = commandService;
    this.configurationService = configurationService;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.panel.showLabel")) {
        this.updateCompositeBar(true);
      }
    }));
  }
  //#region IView
  minimumWidth = 300;
  maximumWidth = Number.POSITIVE_INFINITY;
  minimumHeight = 77;
  maximumHeight = Number.POSITIVE_INFINITY;
  get preferredHeight() {
    return this.layoutService.mainContainerDimension.height * 0.4;
  }
  get preferredWidth() {
    const activeComposite = this.getActivePaneComposite();
    if (!activeComposite) {
      return;
    }
    const width = activeComposite.getOptimalWidth();
    if (typeof width !== "number") {
      return;
    }
    return Math.max(width, 300);
  }
  //#endregion
  static activePanelSettingsKey = "workbench.panelpart.activepanelid";
  updateStyles() {
    super.updateStyles();
    const container = assertIsDefined(this.getContainer());
    container.style.backgroundColor = this.getColor(PANEL_BACKGROUND) || "";
    const borderColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || "";
    container.style.borderLeftColor = borderColor;
    container.style.borderRightColor = borderColor;
    container.style.borderBottomColor = borderColor;
    const title = this.getTitleArea();
    if (title) {
      title.style.borderTopColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || "";
    }
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "panel",
      pinnedViewContainersKey: "workbench.panel.pinnedPanels",
      placeholderViewContainersKey: "workbench.panel.placeholderPanels",
      viewContainersWorkspaceStateKey: "workbench.panel.viewContainersWorkspaceState",
      icon: !this.configurationService.getValue(
        "workbench.panel.showLabel"
      ),
      orientation: ActionsOrientation.HORIZONTAL,
      recomputeSizes: true,
      activityHoverOptions: {
        position: () => this.layoutService.getPanelPosition() === Position.BOTTOM && !this.layoutService.isPanelMaximized() ? HoverPosition.ABOVE : HoverPosition.BELOW
      },
      fillExtraContextMenuActions: (actions) => this.fillExtraContextMenuActions(actions),
      compositeSize: 0,
      iconSize: 16,
      overflowActionSize: 44,
      colors: (theme) => ({
        activeBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        // Background color for overflow action
        inactiveBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        // Background color for overflow action
        activeBorderBottomColor: theme.getColor(
          PANEL_ACTIVE_TITLE_BORDER
        ),
        activeForegroundColor: theme.getColor(
          PANEL_ACTIVE_TITLE_FOREGROUND
        ),
        inactiveForegroundColor: theme.getColor(
          PANEL_INACTIVE_TITLE_FOREGROUND
        ),
        badgeBackground: theme.getColor(badgeBackground),
        badgeForeground: theme.getColor(badgeForeground),
        dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
      })
    };
  }
  fillExtraContextMenuActions(actions) {
    const panelPositionMenu = this.menuService.getMenuActions(
      MenuId.PanelPositionMenu,
      this.contextKeyService,
      { shouldForwardArgs: true }
    );
    const panelAlignMenu = this.menuService.getMenuActions(
      MenuId.PanelAlignmentMenu,
      this.contextKeyService,
      { shouldForwardArgs: true }
    );
    const positionActions = [];
    const alignActions = [];
    createAndFillInContextMenuActions(panelPositionMenu, {
      primary: [],
      secondary: positionActions
    });
    createAndFillInContextMenuActions(panelAlignMenu, {
      primary: [],
      secondary: alignActions
    });
    actions.push(
      ...[
        new Separator(),
        new SubmenuAction(
          "workbench.action.panel.position",
          localize("panel position", "Panel Position"),
          positionActions
        ),
        new SubmenuAction(
          "workbench.action.panel.align",
          localize("align panel", "Align Panel"),
          alignActions
        ),
        toAction({
          id: TogglePanelAction.ID,
          label: localize("hidePanel", "Hide Panel"),
          run: () => this.commandService.executeCommand(
            TogglePanelAction.ID
          )
        })
      ]
    );
  }
  layout(width, height, top, left) {
    let dimensions;
    switch (this.layoutService.getPanelPosition()) {
      case Position.RIGHT:
        dimensions = new Dimension(width - 1, height);
        break;
      case Position.TOP:
        dimensions = new Dimension(width, height - 1);
        break;
      default:
        dimensions = new Dimension(width, height);
        break;
    }
    super.layout(dimensions.width, dimensions.height, top, left);
  }
  shouldShowCompositeBar() {
    return true;
  }
  getCompositeBarPosition() {
    return CompositeBarPosition.TITLE;
  }
  toJSON() {
    return {
      type: Parts.PANEL_PART
    };
  }
};
PanelPart = __decorateClass([
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
  __decorateParam(11, ICommandService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, IConfigurationService)
], PanelPart);
export {
  PanelPart
};
