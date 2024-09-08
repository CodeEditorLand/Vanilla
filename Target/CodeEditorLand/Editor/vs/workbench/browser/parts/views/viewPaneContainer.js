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
import {
  DragAndDropObserver,
  EventType,
  addDisposableListener,
  getWindow,
  isAncestor
} from "../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import {
  Gesture,
  EventType as TouchEventType
} from "../../../../base/browser/touch.js";
import {
  Orientation
} from "../../../../base/browser/ui/sash/sash.js";
import {
  PaneView
} from "../../../../base/browser/ui/splitview/paneview.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  DisposableStore,
  combinedDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import "./media/paneviewlet.css";
import * as nls from "../../../../nls.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  Action2,
  IMenuService,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  activeContrastBorder,
  asCssVariable
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  IThemeService,
  Themable
} from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Component } from "../../../common/component.js";
import { FocusedViewContext } from "../../../common/contextkeys.js";
import {
  PANEL_SECTION_BORDER,
  PANEL_SECTION_DRAG_AND_DROP_BACKGROUND,
  PANEL_SECTION_HEADER_BACKGROUND,
  PANEL_SECTION_HEADER_BORDER,
  PANEL_SECTION_HEADER_FOREGROUND,
  SIDE_BAR_DRAG_AND_DROP_BACKGROUND,
  SIDE_BAR_SECTION_HEADER_BACKGROUND,
  SIDE_BAR_SECTION_HEADER_BORDER,
  SIDE_BAR_SECTION_HEADER_FOREGROUND
} from "../../../common/theme.js";
import {
  IViewDescriptorService,
  ViewContainerLocation,
  ViewContainerLocationToString,
  ViewVisibilityState
} from "../../../common/views.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  IWorkbenchLayoutService,
  LayoutSettings,
  isHorizontal
} from "../../../services/layout/browser/layoutService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { CompositeMenuActions } from "../../actions.js";
import { CompositeDragAndDropObserver, toggleDropEffect } from "../../dnd.js";
const ViewsSubMenu = new MenuId("Views");
MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
  submenu: ViewsSubMenu,
  title: nls.localize("views", "Views"),
  order: 1
});
var DropDirection = /* @__PURE__ */ ((DropDirection2) => {
  DropDirection2[DropDirection2["UP"] = 0] = "UP";
  DropDirection2[DropDirection2["DOWN"] = 1] = "DOWN";
  DropDirection2[DropDirection2["LEFT"] = 2] = "LEFT";
  DropDirection2[DropDirection2["RIGHT"] = 3] = "RIGHT";
  return DropDirection2;
})(DropDirection || {});
class ViewPaneDropOverlay extends Themable {
  constructor(paneElement, orientation, bounds, location, themeService) {
    super(themeService);
    this.paneElement = paneElement;
    this.orientation = orientation;
    this.bounds = bounds;
    this.location = location;
    this.cleanupOverlayScheduler = this._register(
      new RunOnceScheduler(() => this.dispose(), 300)
    );
    this.create();
  }
  static OVERLAY_ID = "monaco-pane-drop-overlay";
  container;
  overlay;
  _currentDropOperation;
  // private currentDropOperation: IDropOperation | undefined;
  _disposed;
  cleanupOverlayScheduler;
  get currentDropOperation() {
    return this._currentDropOperation;
  }
  get disposed() {
    return !!this._disposed;
  }
  create() {
    this.container = document.createElement("div");
    this.container.id = ViewPaneDropOverlay.OVERLAY_ID;
    this.container.style.top = "0px";
    this.paneElement.appendChild(this.container);
    this.paneElement.classList.add("dragged-over");
    this._register(
      toDisposable(() => {
        this.container.remove();
        this.paneElement.classList.remove("dragged-over");
      })
    );
    this.overlay = document.createElement("div");
    this.overlay.classList.add("pane-overlay-indicator");
    this.container.appendChild(this.overlay);
    this.registerListeners();
    this.updateStyles();
  }
  updateStyles() {
    this.overlay.style.backgroundColor = this.getColor(
      this.location === ViewContainerLocation.Panel ? PANEL_SECTION_DRAG_AND_DROP_BACKGROUND : SIDE_BAR_DRAG_AND_DROP_BACKGROUND
    ) || "";
    const activeContrastBorderColor = this.getColor(activeContrastBorder);
    this.overlay.style.outlineColor = activeContrastBorderColor || "";
    this.overlay.style.outlineOffset = activeContrastBorderColor ? "-2px" : "";
    this.overlay.style.outlineStyle = activeContrastBorderColor ? "dashed" : "";
    this.overlay.style.outlineWidth = activeContrastBorderColor ? "2px" : "";
    this.overlay.style.borderColor = activeContrastBorderColor || "";
    this.overlay.style.borderStyle = "solid";
    this.overlay.style.borderWidth = "0px";
  }
  registerListeners() {
    this._register(
      new DragAndDropObserver(this.container, {
        onDragOver: (e) => {
          this.positionOverlay(e.offsetX, e.offsetY);
          if (this.cleanupOverlayScheduler.isScheduled()) {
            this.cleanupOverlayScheduler.cancel();
          }
        },
        onDragLeave: (e) => this.dispose(),
        onDragEnd: (e) => this.dispose(),
        onDrop: (e) => {
          this.dispose();
        }
      })
    );
    this._register(
      addDisposableListener(this.container, EventType.MOUSE_OVER, () => {
        if (!this.cleanupOverlayScheduler.isScheduled()) {
          this.cleanupOverlayScheduler.schedule();
        }
      })
    );
  }
  positionOverlay(mousePosX, mousePosY) {
    const paneWidth = this.paneElement.clientWidth;
    const paneHeight = this.paneElement.clientHeight;
    const splitWidthThreshold = paneWidth / 2;
    const splitHeightThreshold = paneHeight / 2;
    let dropDirection;
    if (this.orientation === Orientation.VERTICAL) {
      if (mousePosY < splitHeightThreshold) {
        dropDirection = 0 /* UP */;
      } else if (mousePosY >= splitHeightThreshold) {
        dropDirection = 1 /* DOWN */;
      }
    } else if (this.orientation === Orientation.HORIZONTAL) {
      if (mousePosX < splitWidthThreshold) {
        dropDirection = 2 /* LEFT */;
      } else if (mousePosX >= splitWidthThreshold) {
        dropDirection = 3 /* RIGHT */;
      }
    }
    switch (dropDirection) {
      case 0 /* UP */:
        this.doPositionOverlay({
          top: "0",
          left: "0",
          width: "100%",
          height: "50%"
        });
        break;
      case 1 /* DOWN */:
        this.doPositionOverlay({
          bottom: "0",
          left: "0",
          width: "100%",
          height: "50%"
        });
        break;
      case 2 /* LEFT */:
        this.doPositionOverlay({
          top: "0",
          left: "0",
          width: "50%",
          height: "100%"
        });
        break;
      case 3 /* RIGHT */:
        this.doPositionOverlay({
          top: "0",
          right: "0",
          width: "50%",
          height: "100%"
        });
        break;
      default: {
        let top = "0";
        let left = "0";
        let width = "100%";
        let height = "100%";
        if (this.bounds) {
          const boundingRect = this.container.getBoundingClientRect();
          top = `${this.bounds.top - boundingRect.top}px`;
          left = `${this.bounds.left - boundingRect.left}px`;
          height = `${this.bounds.bottom - this.bounds.top}px`;
          width = `${this.bounds.right - this.bounds.left}px`;
        }
        this.doPositionOverlay({ top, left, width, height });
      }
    }
    if (this.orientation === Orientation.VERTICAL && paneHeight <= 25 || this.orientation === Orientation.HORIZONTAL && paneWidth <= 25) {
      this.doUpdateOverlayBorder(dropDirection);
    } else {
      this.doUpdateOverlayBorder(void 0);
    }
    this.overlay.style.opacity = "1";
    setTimeout(
      () => this.overlay.classList.add("overlay-move-transition"),
      0
    );
    this._currentDropOperation = dropDirection;
  }
  doUpdateOverlayBorder(direction) {
    this.overlay.style.borderTopWidth = direction === 0 /* UP */ ? "2px" : "0px";
    this.overlay.style.borderLeftWidth = direction === 2 /* LEFT */ ? "2px" : "0px";
    this.overlay.style.borderBottomWidth = direction === 1 /* DOWN */ ? "2px" : "0px";
    this.overlay.style.borderRightWidth = direction === 3 /* RIGHT */ ? "2px" : "0px";
  }
  doPositionOverlay(options) {
    this.container.style.height = "100%";
    this.overlay.style.top = options.top || "";
    this.overlay.style.left = options.left || "";
    this.overlay.style.bottom = options.bottom || "";
    this.overlay.style.right = options.right || "";
    this.overlay.style.width = options.width;
    this.overlay.style.height = options.height;
  }
  contains(element) {
    return element === this.container || element === this.overlay;
  }
  dispose() {
    super.dispose();
    this._disposed = true;
  }
}
let ViewContainerMenuActions = class extends CompositeMenuActions {
  constructor(element, viewContainer, viewDescriptorService, contextKeyService, menuService) {
    const scopedContextKeyService = contextKeyService.createScoped(element);
    scopedContextKeyService.createKey("viewContainer", viewContainer.id);
    const viewContainerLocationKey = scopedContextKeyService.createKey(
      "viewContainerLocation",
      ViewContainerLocationToString(
        viewDescriptorService.getViewContainerLocation(viewContainer)
      )
    );
    super(
      MenuId.ViewContainerTitle,
      MenuId.ViewContainerTitleContext,
      { shouldForwardArgs: true, renderShortTitle: true },
      scopedContextKeyService,
      menuService
    );
    this._register(scopedContextKeyService);
    this._register(
      Event.filter(
        viewDescriptorService.onDidChangeContainerLocation,
        (e) => e.viewContainer === viewContainer
      )(
        () => viewContainerLocationKey.set(
          ViewContainerLocationToString(
            viewDescriptorService.getViewContainerLocation(
              viewContainer
            )
          )
        )
      )
    );
  }
};
ViewContainerMenuActions = __decorateClass([
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IMenuService)
], ViewContainerMenuActions);
let ViewPaneContainer = class extends Component {
  constructor(id, options, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService) {
    super(id, themeService, storageService);
    this.options = options;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.telemetryService = telemetryService;
    this.extensionService = extensionService;
    this.storageService = storageService;
    this.contextService = contextService;
    this.viewDescriptorService = viewDescriptorService;
    const container = this.viewDescriptorService.getViewContainerById(id);
    if (!container) {
      throw new Error("Could not find container");
    }
    this.viewContainer = container;
    this.visibleViewsStorageId = `${id}.numberOfVisibleViews`;
    this.visibleViewsCountFromCache = this.storageService.getNumber(this.visibleViewsStorageId, StorageScope.WORKSPACE, void 0);
    this.viewContainerModel = this.viewDescriptorService.getViewContainerModel(container);
  }
  viewContainer;
  lastFocusedPane;
  lastMergedCollapsedPane;
  paneItems = [];
  paneview;
  visible = false;
  areExtensionsReady = false;
  didLayout = false;
  dimension;
  _boundarySashes;
  visibleViewsCountFromCache;
  visibleViewsStorageId;
  viewContainerModel;
  _onTitleAreaUpdate = this._register(
    new Emitter()
  );
  onTitleAreaUpdate = this._onTitleAreaUpdate.event;
  _onDidChangeVisibility = this._register(
    new Emitter()
  );
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  _onDidAddViews = this._register(new Emitter());
  onDidAddViews = this._onDidAddViews.event;
  _onDidRemoveViews = this._register(new Emitter());
  onDidRemoveViews = this._onDidRemoveViews.event;
  _onDidChangeViewVisibility = this._register(
    new Emitter()
  );
  onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
  _onDidFocusView = this._register(new Emitter());
  onDidFocusView = this._onDidFocusView.event;
  _onDidBlurView = this._register(new Emitter());
  onDidBlurView = this._onDidBlurView.event;
  get onDidSashChange() {
    return assertIsDefined(this.paneview).onDidSashChange;
  }
  get panes() {
    return this.paneItems.map((i) => i.pane);
  }
  get views() {
    return this.panes;
  }
  get length() {
    return this.paneItems.length;
  }
  _menuActions;
  get menuActions() {
    return this._menuActions;
  }
  create(parent) {
    const options = this.options;
    options.orientation = this.orientation;
    this.paneview = this._register(new PaneView(parent, this.options));
    if (this._boundarySashes) {
      this.paneview.setBoundarySashes(this._boundarySashes);
    }
    this._register(
      this.paneview.onDidDrop(
        ({ from, to }) => this.movePane(from, to)
      )
    );
    this._register(
      this.paneview.onDidScroll((_) => this.onDidScrollPane())
    );
    this._register(
      this.paneview.onDidSashReset((index) => this.onDidSashReset(index))
    );
    this._register(
      addDisposableListener(
        parent,
        EventType.CONTEXT_MENU,
        (e) => this.showContextMenu(
          new StandardMouseEvent(getWindow(parent), e)
        )
      )
    );
    this._register(Gesture.addTarget(parent));
    this._register(
      addDisposableListener(
        parent,
        TouchEventType.Contextmenu,
        (e) => this.showContextMenu(
          new StandardMouseEvent(getWindow(parent), e)
        )
      )
    );
    this._menuActions = this._register(
      this.instantiationService.createInstance(
        ViewContainerMenuActions,
        this.paneview.element,
        this.viewContainer
      )
    );
    this._register(
      this._menuActions.onDidChange(() => this.updateTitleArea())
    );
    let overlay;
    const getOverlayBounds = () => {
      const fullSize = parent.getBoundingClientRect();
      const lastPane = this.panes[this.panes.length - 1].element.getBoundingClientRect();
      const top = this.orientation === Orientation.VERTICAL ? lastPane.bottom : fullSize.top;
      const left = this.orientation === Orientation.HORIZONTAL ? lastPane.right : fullSize.left;
      return {
        top,
        bottom: fullSize.bottom,
        left,
        right: fullSize.right
      };
    };
    const inBounds = (bounds2, pos) => {
      return pos.x >= bounds2.left && pos.x <= bounds2.right && pos.y >= bounds2.top && pos.y <= bounds2.bottom;
    };
    let bounds;
    this._register(
      CompositeDragAndDropObserver.INSTANCE.registerTarget(parent, {
        onDragEnter: (e) => {
          bounds = getOverlayBounds();
          if (overlay && overlay.disposed) {
            overlay = void 0;
          }
          if (!overlay && inBounds(bounds, e.eventData)) {
            const dropData = e.dragAndDropData.getData();
            if (dropData.type === "view") {
              const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(
                dropData.id
              );
              const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(
                dropData.id
              );
              if (oldViewContainer !== this.viewContainer && (!viewDescriptor || !viewDescriptor.canMoveView || this.viewContainer.rejectAddedViews)) {
                return;
              }
              overlay = new ViewPaneDropOverlay(
                parent,
                void 0,
                bounds,
                this.viewDescriptorService.getViewContainerLocation(
                  this.viewContainer
                ),
                this.themeService
              );
            }
            if (dropData.type === "composite" && dropData.id !== this.viewContainer.id) {
              const container = this.viewDescriptorService.getViewContainerById(
                dropData.id
              );
              const viewsToMove = this.viewDescriptorService.getViewContainerModel(
                container
              ).allViewDescriptors;
              if (!viewsToMove.some((v) => !v.canMoveView) && viewsToMove.length > 0) {
                overlay = new ViewPaneDropOverlay(
                  parent,
                  void 0,
                  bounds,
                  this.viewDescriptorService.getViewContainerLocation(
                    this.viewContainer
                  ),
                  this.themeService
                );
              }
            }
          }
        },
        onDragOver: (e) => {
          if (overlay && overlay.disposed) {
            overlay = void 0;
          }
          if (overlay && !inBounds(bounds, e.eventData)) {
            overlay.dispose();
            overlay = void 0;
          }
          if (inBounds(bounds, e.eventData)) {
            toggleDropEffect(
              e.eventData.dataTransfer,
              "move",
              overlay !== void 0
            );
          }
        },
        onDragLeave: (e) => {
          overlay?.dispose();
          overlay = void 0;
        },
        onDrop: (e) => {
          if (overlay) {
            const dropData = e.dragAndDropData.getData();
            const viewsToMove = [];
            if (dropData.type === "composite" && dropData.id !== this.viewContainer.id) {
              const container = this.viewDescriptorService.getViewContainerById(
                dropData.id
              );
              const allViews = this.viewDescriptorService.getViewContainerModel(
                container
              ).allViewDescriptors;
              if (!allViews.some((v) => !v.canMoveView)) {
                viewsToMove.push(...allViews);
              }
            } else if (dropData.type === "view") {
              const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(
                dropData.id
              );
              const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(
                dropData.id
              );
              if (oldViewContainer !== this.viewContainer && viewDescriptor && viewDescriptor.canMoveView) {
                this.viewDescriptorService.moveViewsToContainer(
                  [viewDescriptor],
                  this.viewContainer,
                  void 0,
                  "dnd"
                );
              }
            }
            const paneCount = this.panes.length;
            if (viewsToMove.length > 0) {
              this.viewDescriptorService.moveViewsToContainer(
                viewsToMove,
                this.viewContainer,
                void 0,
                "dnd"
              );
            }
            if (paneCount > 0) {
              for (const view of viewsToMove) {
                const paneToMove = this.panes.find(
                  (p) => p.id === view.id
                );
                if (paneToMove) {
                  this.movePane(
                    paneToMove,
                    this.panes[this.panes.length - 1]
                  );
                }
              }
            }
          }
          overlay?.dispose();
          overlay = void 0;
        }
      })
    );
    this._register(this.onDidSashChange(() => this.saveViewSizes()));
    this._register(
      this.viewContainerModel.onDidAddVisibleViewDescriptors(
        (added) => this.onDidAddViewDescriptors(added)
      )
    );
    this._register(
      this.viewContainerModel.onDidRemoveVisibleViewDescriptors(
        (removed) => this.onDidRemoveViewDescriptors(removed)
      )
    );
    const addedViews = this.viewContainerModel.visibleViewDescriptors.map(
      (viewDescriptor, index) => {
        const size = this.viewContainerModel.getSize(
          viewDescriptor.id
        );
        const collapsed = this.viewContainerModel.isCollapsed(
          viewDescriptor.id
        );
        return { viewDescriptor, index, size, collapsed };
      }
    );
    if (addedViews.length) {
      this.onDidAddViewDescriptors(addedViews);
    }
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      this.areExtensionsReady = true;
      if (this.panes.length) {
        this.updateTitleArea();
        this.updateViewHeaders();
      }
      this._register(
        this.configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(
            LayoutSettings.ACTIVITY_BAR_LOCATION
          )) {
            this.updateViewHeaders();
          }
        })
      );
    });
    this._register(
      this.viewContainerModel.onDidChangeActiveViewDescriptors(
        () => this._onTitleAreaUpdate.fire()
      )
    );
  }
  getTitle() {
    const containerTitle = this.viewContainerModel.title;
    if (this.isViewMergedWithContainer()) {
      const singleViewPaneContainerTitle = this.paneItems[0].pane.singleViewPaneContainerTitle;
      if (singleViewPaneContainerTitle) {
        return singleViewPaneContainerTitle;
      }
      const paneItemTitle = this.paneItems[0].pane.title;
      if (containerTitle === paneItemTitle) {
        return paneItemTitle;
      }
      return paneItemTitle ? `${containerTitle}: ${paneItemTitle}` : containerTitle;
    }
    return containerTitle;
  }
  showContextMenu(event) {
    for (const paneItem of this.paneItems) {
      if (isAncestor(event.target, paneItem.pane.element)) {
        return;
      }
    }
    event.stopPropagation();
    event.preventDefault();
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => this.menuActions?.getContextMenuActions() ?? []
    });
  }
  getActionsContext() {
    if (this.isViewMergedWithContainer()) {
      return this.panes[0].getActionsContext();
    }
    return void 0;
  }
  getActionViewItem(action, options) {
    if (this.isViewMergedWithContainer()) {
      return this.paneItems[0].pane.getActionViewItem(action, options);
    }
    return createActionViewItem(this.instantiationService, action, options);
  }
  focus() {
    let paneToFocus;
    if (this.lastFocusedPane) {
      paneToFocus = this.lastFocusedPane;
    } else if (this.paneItems.length > 0) {
      for (const { pane } of this.paneItems) {
        if (pane.isExpanded()) {
          paneToFocus = pane;
          break;
        }
      }
    }
    if (paneToFocus) {
      paneToFocus.focus();
    }
  }
  get orientation() {
    switch (this.viewDescriptorService.getViewContainerLocation(
      this.viewContainer
    )) {
      case ViewContainerLocation.Sidebar:
      case ViewContainerLocation.AuxiliaryBar:
        return Orientation.VERTICAL;
      case ViewContainerLocation.Panel: {
        return isHorizontal(this.layoutService.getPanelPosition()) ? Orientation.HORIZONTAL : Orientation.VERTICAL;
      }
    }
    return Orientation.VERTICAL;
  }
  layout(dimension) {
    if (this.paneview) {
      if (this.paneview.orientation !== this.orientation) {
        this.paneview.flipOrientation(
          dimension.height,
          dimension.width
        );
      }
      this.paneview.layout(dimension.height, dimension.width);
    }
    this.dimension = dimension;
    if (this.didLayout) {
      this.saveViewSizes();
    } else {
      this.didLayout = true;
      this.restoreViewSizes();
    }
  }
  setBoundarySashes(sashes) {
    this._boundarySashes = sashes;
    this.paneview?.setBoundarySashes(sashes);
  }
  getOptimalWidth() {
    const additionalMargin = 16;
    const optimalWidth = Math.max(
      ...this.panes.map((view) => view.getOptimalWidth() || 0)
    );
    return optimalWidth + additionalMargin;
  }
  addPanes(panes) {
    const wasMerged = this.isViewMergedWithContainer();
    for (const { pane, size, index, disposable } of panes) {
      this.addPane(pane, size, disposable, index);
    }
    this.updateViewHeaders();
    if (this.isViewMergedWithContainer() !== wasMerged) {
      this.updateTitleArea();
    }
    this._onDidAddViews.fire(panes.map(({ pane }) => pane));
  }
  setVisible(visible) {
    if (this.visible !== !!visible) {
      this.visible = visible;
      this._onDidChangeVisibility.fire(visible);
    }
    this.panes.filter((view) => view.isVisible() !== visible).map((view) => view.setVisible(visible));
  }
  isVisible() {
    return this.visible;
  }
  updateTitleArea() {
    this._onTitleAreaUpdate.fire();
  }
  createView(viewDescriptor, options) {
    return this.instantiationService.createInstance(
      viewDescriptor.ctorDescriptor.ctor,
      ...viewDescriptor.ctorDescriptor.staticArguments || [],
      options
    );
  }
  getView(id) {
    return this.panes.filter((view) => view.id === id)[0];
  }
  saveViewSizes() {
    if (this.didLayout) {
      this.viewContainerModel.setSizes(
        this.panes.map((view) => ({
          id: view.id,
          size: this.getPaneSize(view)
        }))
      );
    }
  }
  restoreViewSizes() {
    if (this.didLayout) {
      let initialSizes;
      for (let i = 0; i < this.viewContainerModel.visibleViewDescriptors.length; i++) {
        const pane = this.panes[i];
        const viewDescriptor = this.viewContainerModel.visibleViewDescriptors[i];
        const size = this.viewContainerModel.getSize(viewDescriptor.id);
        if (typeof size === "number") {
          this.resizePane(pane, size);
        } else {
          initialSizes = initialSizes ? initialSizes : this.computeInitialSizes();
          this.resizePane(pane, initialSizes.get(pane.id) || 200);
        }
      }
    }
  }
  computeInitialSizes() {
    const sizes = /* @__PURE__ */ new Map();
    if (this.dimension) {
      const totalWeight = this.viewContainerModel.visibleViewDescriptors.reduce(
        (totalWeight2, { weight }) => totalWeight2 + (weight || 20),
        0
      );
      for (const viewDescriptor of this.viewContainerModel.visibleViewDescriptors) {
        if (this.orientation === Orientation.VERTICAL) {
          sizes.set(
            viewDescriptor.id,
            this.dimension.height * (viewDescriptor.weight || 20) / totalWeight
          );
        } else {
          sizes.set(
            viewDescriptor.id,
            this.dimension.width * (viewDescriptor.weight || 20) / totalWeight
          );
        }
      }
    }
    return sizes;
  }
  saveState() {
    this.panes.forEach((view) => view.saveState());
    this.storageService.store(
      this.visibleViewsStorageId,
      this.length,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
  onContextMenu(event, viewPane) {
    event.stopPropagation();
    event.preventDefault();
    const actions = viewPane.menuActions.getContextMenuActions();
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => actions
    });
  }
  openView(id, focus) {
    let view = this.getView(id);
    if (!view) {
      this.toggleViewVisibility(id);
    }
    view = this.getView(id);
    if (view) {
      view.setExpanded(true);
      if (focus) {
        view.focus();
      }
    }
    return view;
  }
  onDidAddViewDescriptors(added) {
    const panesToAdd = [];
    for (const { viewDescriptor, collapsed, index, size } of added) {
      const pane = this.createView(viewDescriptor, {
        id: viewDescriptor.id,
        title: viewDescriptor.name.value,
        fromExtensionId: viewDescriptor.extensionId,
        expanded: !collapsed,
        singleViewPaneContainerTitle: viewDescriptor.singleViewPaneContainerTitle
      });
      pane.render();
      const contextMenuDisposable = addDisposableListener(
        pane.draggableElement,
        "contextmenu",
        (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.onContextMenu(
            new StandardMouseEvent(
              getWindow(pane.draggableElement),
              e
            ),
            pane
          );
        }
      );
      const collapseDisposable = Event.latch(
        Event.map(pane.onDidChange, () => !pane.isExpanded())
      )((collapsed2) => {
        this.viewContainerModel.setCollapsed(
          viewDescriptor.id,
          collapsed2
        );
      });
      panesToAdd.push({
        pane,
        size: size || pane.minimumSize,
        index,
        disposable: combinedDisposable(
          contextMenuDisposable,
          collapseDisposable
        )
      });
    }
    this.addPanes(panesToAdd);
    this.restoreViewSizes();
    const panes = [];
    for (const { pane } of panesToAdd) {
      pane.setVisible(this.isVisible());
      panes.push(pane);
    }
    return panes;
  }
  onDidRemoveViewDescriptors(removed) {
    removed = removed.sort((a, b) => b.index - a.index);
    const panesToRemove = [];
    for (const { index } of removed) {
      const paneItem = this.paneItems[index];
      if (paneItem) {
        panesToRemove.push(this.paneItems[index].pane);
      }
    }
    if (panesToRemove.length) {
      this.removePanes(panesToRemove);
      for (const pane of panesToRemove) {
        pane.setVisible(false);
      }
    }
  }
  toggleViewVisibility(viewId) {
    if (this.viewContainerModel.activeViewDescriptors.some(
      (viewDescriptor) => viewDescriptor.id === viewId
    )) {
      const visible = !this.viewContainerModel.isVisible(viewId);
      this.viewContainerModel.setVisible(viewId, visible);
    }
  }
  addPane(pane, size, disposable, index = this.paneItems.length - 1) {
    const onDidFocus = pane.onDidFocus(() => {
      this._onDidFocusView.fire(pane);
      this.lastFocusedPane = pane;
    });
    const onDidBlur = pane.onDidBlur(() => this._onDidBlurView.fire(pane));
    const onDidChangeTitleArea = pane.onDidChangeTitleArea(() => {
      if (this.isViewMergedWithContainer()) {
        this.updateTitleArea();
      }
    });
    const onDidChangeVisibility = pane.onDidChangeBodyVisibility(
      () => this._onDidChangeViewVisibility.fire(pane)
    );
    const onDidChange = pane.onDidChange(() => {
      if (pane === this.lastFocusedPane && !pane.isExpanded()) {
        this.lastFocusedPane = void 0;
      }
    });
    const isPanel = this.viewDescriptorService.getViewContainerLocation(
      this.viewContainer
    ) === ViewContainerLocation.Panel;
    pane.style({
      headerForeground: asCssVariable(
        isPanel ? PANEL_SECTION_HEADER_FOREGROUND : SIDE_BAR_SECTION_HEADER_FOREGROUND
      ),
      headerBackground: asCssVariable(
        isPanel ? PANEL_SECTION_HEADER_BACKGROUND : SIDE_BAR_SECTION_HEADER_BACKGROUND
      ),
      headerBorder: asCssVariable(
        isPanel ? PANEL_SECTION_HEADER_BORDER : SIDE_BAR_SECTION_HEADER_BORDER
      ),
      dropBackground: asCssVariable(
        isPanel ? PANEL_SECTION_DRAG_AND_DROP_BACKGROUND : SIDE_BAR_DRAG_AND_DROP_BACKGROUND
      ),
      leftBorder: isPanel ? asCssVariable(PANEL_SECTION_BORDER) : void 0
    });
    const store = new DisposableStore();
    store.add(disposable);
    store.add(
      combinedDisposable(
        pane,
        onDidFocus,
        onDidBlur,
        onDidChangeTitleArea,
        onDidChange,
        onDidChangeVisibility
      )
    );
    const paneItem = { pane, disposable: store };
    this.paneItems.splice(index, 0, paneItem);
    assertIsDefined(this.paneview).addPane(pane, size, index);
    let overlay;
    store.add(
      CompositeDragAndDropObserver.INSTANCE.registerDraggable(
        pane.draggableElement,
        () => {
          return { type: "view", id: pane.id };
        },
        {}
      )
    );
    store.add(
      CompositeDragAndDropObserver.INSTANCE.registerTarget(
        pane.dropTargetElement,
        {
          onDragEnter: (e) => {
            if (!overlay) {
              const dropData = e.dragAndDropData.getData();
              if (dropData.type === "view" && dropData.id !== pane.id) {
                const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(
                  dropData.id
                );
                const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(
                  dropData.id
                );
                if (oldViewContainer !== this.viewContainer && (!viewDescriptor || !viewDescriptor.canMoveView || this.viewContainer.rejectAddedViews)) {
                  return;
                }
                overlay = new ViewPaneDropOverlay(
                  pane.dropTargetElement,
                  this.orientation ?? Orientation.VERTICAL,
                  void 0,
                  this.viewDescriptorService.getViewContainerLocation(
                    this.viewContainer
                  ),
                  this.themeService
                );
              }
              if (dropData.type === "composite" && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
                const container = this.viewDescriptorService.getViewContainerById(
                  dropData.id
                );
                const viewsToMove = this.viewDescriptorService.getViewContainerModel(
                  container
                ).allViewDescriptors;
                if (!viewsToMove.some((v) => !v.canMoveView) && viewsToMove.length > 0) {
                  overlay = new ViewPaneDropOverlay(
                    pane.dropTargetElement,
                    this.orientation ?? Orientation.VERTICAL,
                    void 0,
                    this.viewDescriptorService.getViewContainerLocation(
                      this.viewContainer
                    ),
                    this.themeService
                  );
                }
              }
            }
          },
          onDragOver: (e) => {
            toggleDropEffect(
              e.eventData.dataTransfer,
              "move",
              overlay !== void 0
            );
          },
          onDragLeave: (e) => {
            overlay?.dispose();
            overlay = void 0;
          },
          onDrop: (e) => {
            if (overlay) {
              const dropData = e.dragAndDropData.getData();
              const viewsToMove = [];
              let anchorView;
              if (dropData.type === "composite" && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
                const container = this.viewDescriptorService.getViewContainerById(
                  dropData.id
                );
                const allViews = this.viewDescriptorService.getViewContainerModel(
                  container
                ).allViewDescriptors;
                if (allViews.length > 0 && !allViews.some((v) => !v.canMoveView)) {
                  viewsToMove.push(...allViews);
                  anchorView = allViews[0];
                }
              } else if (dropData.type === "view") {
                const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(
                  dropData.id
                );
                const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(
                  dropData.id
                );
                if (oldViewContainer !== this.viewContainer && viewDescriptor && viewDescriptor.canMoveView && !this.viewContainer.rejectAddedViews) {
                  viewsToMove.push(viewDescriptor);
                }
                if (viewDescriptor) {
                  anchorView = viewDescriptor;
                }
              }
              if (viewsToMove) {
                this.viewDescriptorService.moveViewsToContainer(
                  viewsToMove,
                  this.viewContainer,
                  void 0,
                  "dnd"
                );
              }
              if (anchorView) {
                if (overlay.currentDropOperation === 1 /* DOWN */ || overlay.currentDropOperation === 3 /* RIGHT */) {
                  const fromIndex = this.panes.findIndex(
                    (p) => p.id === anchorView.id
                  );
                  let toIndex = this.panes.findIndex(
                    (p) => p.id === pane.id
                  );
                  if (fromIndex >= 0 && toIndex >= 0) {
                    if (fromIndex > toIndex) {
                      toIndex++;
                    }
                    if (toIndex < this.panes.length && toIndex !== fromIndex) {
                      this.movePane(
                        this.panes[fromIndex],
                        this.panes[toIndex]
                      );
                    }
                  }
                }
                if (overlay.currentDropOperation === 0 /* UP */ || overlay.currentDropOperation === 2 /* LEFT */) {
                  const fromIndex = this.panes.findIndex(
                    (p) => p.id === anchorView.id
                  );
                  let toIndex = this.panes.findIndex(
                    (p) => p.id === pane.id
                  );
                  if (fromIndex >= 0 && toIndex >= 0) {
                    if (fromIndex < toIndex) {
                      toIndex--;
                    }
                    if (toIndex >= 0 && toIndex !== fromIndex) {
                      this.movePane(
                        this.panes[fromIndex],
                        this.panes[toIndex]
                      );
                    }
                  }
                }
                if (viewsToMove.length > 1) {
                  viewsToMove.slice(1).forEach((view) => {
                    let toIndex = this.panes.findIndex(
                      (p) => p.id === anchorView.id
                    );
                    const fromIndex = this.panes.findIndex(
                      (p) => p.id === view.id
                    );
                    if (fromIndex >= 0 && toIndex >= 0) {
                      if (fromIndex > toIndex) {
                        toIndex++;
                      }
                      if (toIndex < this.panes.length && toIndex !== fromIndex) {
                        this.movePane(
                          this.panes[fromIndex],
                          this.panes[toIndex]
                        );
                        anchorView = view;
                      }
                    }
                  });
                }
              }
            }
            overlay?.dispose();
            overlay = void 0;
          }
        }
      )
    );
  }
  removePanes(panes) {
    const wasMerged = this.isViewMergedWithContainer();
    panes.forEach((pane) => this.removePane(pane));
    this.updateViewHeaders();
    if (wasMerged !== this.isViewMergedWithContainer()) {
      this.updateTitleArea();
    }
    this._onDidRemoveViews.fire(panes);
  }
  removePane(pane) {
    const index = this.paneItems.findIndex((i) => i.pane === pane);
    if (index === -1) {
      return;
    }
    if (this.lastFocusedPane === pane) {
      this.lastFocusedPane = void 0;
    }
    assertIsDefined(this.paneview).removePane(pane);
    const [paneItem] = this.paneItems.splice(index, 1);
    paneItem.disposable.dispose();
  }
  movePane(from, to) {
    const fromIndex = this.paneItems.findIndex(
      (item) => item.pane === from
    );
    const toIndex = this.paneItems.findIndex((item) => item.pane === to);
    const fromViewDescriptor = this.viewContainerModel.visibleViewDescriptors[fromIndex];
    const toViewDescriptor = this.viewContainerModel.visibleViewDescriptors[toIndex];
    if (fromIndex < 0 || fromIndex >= this.paneItems.length) {
      return;
    }
    if (toIndex < 0 || toIndex >= this.paneItems.length) {
      return;
    }
    const [paneItem] = this.paneItems.splice(fromIndex, 1);
    this.paneItems.splice(toIndex, 0, paneItem);
    assertIsDefined(this.paneview).movePane(from, to);
    this.viewContainerModel.move(
      fromViewDescriptor.id,
      toViewDescriptor.id
    );
    this.updateTitleArea();
  }
  resizePane(pane, size) {
    assertIsDefined(this.paneview).resizePane(pane, size);
  }
  getPaneSize(pane) {
    return assertIsDefined(this.paneview).getPaneSize(pane);
  }
  updateViewHeaders() {
    if (this.isViewMergedWithContainer()) {
      if (this.paneItems[0].pane.isExpanded()) {
        this.lastMergedCollapsedPane = void 0;
      } else {
        this.lastMergedCollapsedPane = this.paneItems[0].pane;
        this.paneItems[0].pane.setExpanded(true);
      }
      this.paneItems[0].pane.headerVisible = false;
      this.paneItems[0].pane.collapsible = true;
    } else {
      if (this.paneItems.length === 1) {
        this.paneItems[0].pane.headerVisible = true;
        if (this.paneItems[0].pane === this.lastMergedCollapsedPane) {
          this.paneItems[0].pane.setExpanded(false);
        }
        this.paneItems[0].pane.collapsible = false;
      } else {
        this.paneItems.forEach((i) => {
          i.pane.headerVisible = true;
          i.pane.collapsible = true;
          if (i.pane === this.lastMergedCollapsedPane) {
            i.pane.setExpanded(false);
          }
        });
      }
      this.lastMergedCollapsedPane = void 0;
    }
  }
  isViewMergedWithContainer() {
    if (!(this.options.mergeViewWithContainerWhenSingleView && this.paneItems.length === 1)) {
      return false;
    }
    if (!this.areExtensionsReady) {
      if (this.visibleViewsCountFromCache === void 0) {
        return this.paneItems[0].pane.isExpanded();
      }
      return this.visibleViewsCountFromCache === 1;
    }
    return true;
  }
  onDidScrollPane() {
    for (const pane of this.panes) {
      pane.onDidScrollRoot();
    }
  }
  onDidSashReset(index) {
    let firstPane;
    let secondPane;
    for (let i = index; i >= 0; i--) {
      if (this.paneItems[i].pane?.isVisible() && this.paneItems[i]?.pane.isExpanded()) {
        firstPane = this.paneItems[i].pane;
        break;
      }
    }
    for (let i = index + 1; i < this.paneItems.length; i++) {
      if (this.paneItems[i].pane?.isVisible() && this.paneItems[i]?.pane.isExpanded()) {
        secondPane = this.paneItems[i].pane;
        break;
      }
    }
    if (firstPane && secondPane) {
      const firstPaneSize = this.getPaneSize(firstPane);
      const secondPaneSize = this.getPaneSize(secondPane);
      const newFirstPaneSize = Math.ceil(
        (firstPaneSize + secondPaneSize) / 2
      );
      const newSecondPaneSize = Math.floor(
        (firstPaneSize + secondPaneSize) / 2
      );
      if (firstPaneSize > secondPaneSize) {
        this.resizePane(firstPane, newFirstPaneSize);
        this.resizePane(secondPane, newSecondPaneSize);
      } else {
        this.resizePane(secondPane, newSecondPaneSize);
        this.resizePane(firstPane, newFirstPaneSize);
      }
    }
  }
  dispose() {
    super.dispose();
    this.paneItems.forEach((i) => i.disposable.dispose());
    if (this.paneview) {
      this.paneview.dispose();
    }
  }
};
ViewPaneContainer = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IWorkbenchLayoutService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IWorkspaceContextService),
  __decorateParam(11, IViewDescriptorService)
], ViewPaneContainer);
class ViewPaneContainerAction extends Action2 {
  desc;
  constructor(desc) {
    super(desc);
    this.desc = desc;
  }
  run(accessor, ...args) {
    const viewPaneContainer = accessor.get(IViewsService).getActiveViewPaneContainerWithId(this.desc.viewPaneContainerId);
    if (viewPaneContainer) {
      return this.runInViewPaneContainer(
        accessor,
        viewPaneContainer,
        ...args
      );
    }
  }
}
class MoveViewPosition extends Action2 {
  constructor(desc, offset) {
    super(desc);
    this.offset = offset;
  }
  async run(accessor) {
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const contextKeyService = accessor.get(IContextKeyService);
    const viewId = FocusedViewContext.getValue(contextKeyService);
    if (viewId === void 0) {
      return;
    }
    const viewContainer = viewDescriptorService.getViewContainerByViewId(viewId);
    const model = viewDescriptorService.getViewContainerModel(viewContainer);
    const viewDescriptor = model.visibleViewDescriptors.find(
      (vd) => vd.id === viewId
    );
    const currentIndex = model.visibleViewDescriptors.indexOf(viewDescriptor);
    if (currentIndex + this.offset < 0 || currentIndex + this.offset >= model.visibleViewDescriptors.length) {
      return;
    }
    const newPosition = model.visibleViewDescriptors[currentIndex + this.offset];
    model.move(viewDescriptor.id, newPosition.id);
  }
}
registerAction2(
  class MoveViewUp extends MoveViewPosition {
    constructor() {
      super(
        {
          id: "views.moveViewUp",
          title: nls.localize("viewMoveUp", "Move View Up"),
          keybinding: {
            primary: KeyChord(
              KeyMod.CtrlCmd + KeyCode.KeyK,
              KeyCode.UpArrow
            ),
            weight: KeybindingWeight.WorkbenchContrib + 1,
            when: FocusedViewContext.notEqualsTo("")
          }
        },
        -1
      );
    }
  }
);
registerAction2(
  class MoveViewLeft extends MoveViewPosition {
    constructor() {
      super(
        {
          id: "views.moveViewLeft",
          title: nls.localize("viewMoveLeft", "Move View Left"),
          keybinding: {
            primary: KeyChord(
              KeyMod.CtrlCmd + KeyCode.KeyK,
              KeyCode.LeftArrow
            ),
            weight: KeybindingWeight.WorkbenchContrib + 1,
            when: FocusedViewContext.notEqualsTo("")
          }
        },
        -1
      );
    }
  }
);
registerAction2(
  class MoveViewDown extends MoveViewPosition {
    constructor() {
      super(
        {
          id: "views.moveViewDown",
          title: nls.localize("viewMoveDown", "Move View Down"),
          keybinding: {
            primary: KeyChord(
              KeyMod.CtrlCmd + KeyCode.KeyK,
              KeyCode.DownArrow
            ),
            weight: KeybindingWeight.WorkbenchContrib + 1,
            when: FocusedViewContext.notEqualsTo("")
          }
        },
        1
      );
    }
  }
);
registerAction2(
  class MoveViewRight extends MoveViewPosition {
    constructor() {
      super(
        {
          id: "views.moveViewRight",
          title: nls.localize("viewMoveRight", "Move View Right"),
          keybinding: {
            primary: KeyChord(
              KeyMod.CtrlCmd + KeyCode.KeyK,
              KeyCode.RightArrow
            ),
            weight: KeybindingWeight.WorkbenchContrib + 1,
            when: FocusedViewContext.notEqualsTo("")
          }
        },
        1
      );
    }
  }
);
registerAction2(
  class MoveViews extends Action2 {
    constructor() {
      super({
        id: "vscode.moveViews",
        title: nls.localize("viewsMove", "Move Views")
      });
    }
    async run(accessor, options) {
      if (!Array.isArray(options?.viewIds) || typeof options?.destinationId !== "string") {
        return Promise.reject("Invalid arguments");
      }
      const viewDescriptorService = accessor.get(IViewDescriptorService);
      const destination = viewDescriptorService.getViewContainerById(
        options.destinationId
      );
      if (!destination) {
        return;
      }
      for (const viewId of options.viewIds) {
        const viewDescriptor = viewDescriptorService.getViewDescriptorById(viewId);
        if (viewDescriptor?.canMoveView) {
          viewDescriptorService.moveViewsToContainer(
            [viewDescriptor],
            destination,
            ViewVisibilityState.Default,
            this.desc.id
          );
        }
      }
      await accessor.get(IViewsService).openViewContainer(destination.id, true);
    }
  }
);
export {
  ViewPaneContainer,
  ViewPaneContainerAction,
  ViewsSubMenu
};
