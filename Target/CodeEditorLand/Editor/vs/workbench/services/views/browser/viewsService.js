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
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { isString } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import {
  PaneComposite,
  PaneCompositeDescriptor,
  Extensions as PaneCompositeExtensions
} from "../../../browser/panecomposite.js";
import { FilterViewPaneContainer } from "../../../browser/parts/views/viewsViewlet.js";
import {
  FocusedViewContext,
  getVisbileViewContextKey
} from "../../../common/contextkeys.js";
import {
  IViewDescriptorService,
  ViewContainerLocation
} from "../../../common/views.js";
import { IEditorGroupsService } from "../../editor/common/editorGroupsService.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import {
  IWorkbenchLayoutService,
  Parts
} from "../../layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../../panecomposite/browser/panecomposite.js";
import { IViewsService } from "../common/viewsService.js";
let ViewsService = class extends Disposable {
  constructor(viewDescriptorService, paneCompositeService, contextKeyService, layoutService, editorService) {
    super();
    this.viewDescriptorService = viewDescriptorService;
    this.paneCompositeService = paneCompositeService;
    this.contextKeyService = contextKeyService;
    this.layoutService = layoutService;
    this.editorService = editorService;
    this.viewDisposable = /* @__PURE__ */ new Map();
    this.enabledViewContainersContextKeys = /* @__PURE__ */ new Map();
    this.visibleViewContextKeys = /* @__PURE__ */ new Map();
    this.viewPaneContainers = /* @__PURE__ */ new Map();
    this._register(
      toDisposable(() => {
        this.viewDisposable.forEach(
          (disposable) => disposable.dispose()
        );
        this.viewDisposable.clear();
      })
    );
    this.viewDescriptorService.viewContainers.forEach(
      (viewContainer) => this.onDidRegisterViewContainer(
        viewContainer,
        this.viewDescriptorService.getViewContainerLocation(
          viewContainer
        )
      )
    );
    this._register(
      this.viewDescriptorService.onDidChangeViewContainers(
        ({ added, removed }) => this.onDidChangeContainers(added, removed)
      )
    );
    this._register(
      this.viewDescriptorService.onDidChangeContainerLocation(
        ({ viewContainer, from, to }) => this.onDidChangeContainerLocation(viewContainer, from, to)
      )
    );
    this._register(
      this.paneCompositeService.onDidPaneCompositeOpen(
        (e) => this._onDidChangeViewContainerVisibility.fire({
          id: e.composite.getId(),
          visible: true,
          location: e.viewContainerLocation
        })
      )
    );
    this._register(
      this.paneCompositeService.onDidPaneCompositeClose(
        (e) => this._onDidChangeViewContainerVisibility.fire({
          id: e.composite.getId(),
          visible: false,
          location: e.viewContainerLocation
        })
      )
    );
    this.focusedViewContextKey = FocusedViewContext.bindTo(contextKeyService);
  }
  viewDisposable;
  viewPaneContainers;
  _onDidChangeViewVisibility = this._register(new Emitter());
  onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
  _onDidChangeViewContainerVisibility = this._register(
    new Emitter()
  );
  onDidChangeViewContainerVisibility = this._onDidChangeViewContainerVisibility.event;
  _onDidChangeFocusedView = this._register(
    new Emitter()
  );
  onDidChangeFocusedView = this._onDidChangeFocusedView.event;
  viewContainerDisposables = this._register(
    new DisposableMap()
  );
  enabledViewContainersContextKeys;
  visibleViewContextKeys;
  focusedViewContextKey;
  onViewsAdded(added) {
    for (const view of added) {
      this.onViewsVisibilityChanged(view, view.isBodyVisible());
    }
  }
  onViewsVisibilityChanged(view, visible) {
    this.getOrCreateActiveViewContextKey(view).set(visible);
    this._onDidChangeViewVisibility.fire({ id: view.id, visible });
  }
  onViewsRemoved(removed) {
    for (const view of removed) {
      this.onViewsVisibilityChanged(view, false);
    }
  }
  getOrCreateActiveViewContextKey(view) {
    const visibleContextKeyId = getVisbileViewContextKey(view.id);
    let contextKey = this.visibleViewContextKeys.get(visibleContextKeyId);
    if (!contextKey) {
      contextKey = new RawContextKey(visibleContextKeyId, false).bindTo(
        this.contextKeyService
      );
      this.visibleViewContextKeys.set(visibleContextKeyId, contextKey);
    }
    return contextKey;
  }
  onDidChangeContainers(added, removed) {
    for (const { container, location } of removed) {
      this.onDidDeregisterViewContainer(container, location);
    }
    for (const { container, location } of added) {
      this.onDidRegisterViewContainer(container, location);
    }
  }
  onDidRegisterViewContainer(viewContainer, viewContainerLocation) {
    this.registerPaneComposite(viewContainer, viewContainerLocation);
    const disposables = new DisposableStore();
    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
    this.onViewDescriptorsAdded(
      viewContainerModel.allViewDescriptors,
      viewContainer
    );
    disposables.add(
      viewContainerModel.onDidChangeAllViewDescriptors(
        ({ added, removed }) => {
          this.onViewDescriptorsAdded(added, viewContainer);
          this.onViewDescriptorsRemoved(removed);
        }
      )
    );
    this.updateViewContainerEnablementContextKey(viewContainer);
    disposables.add(
      viewContainerModel.onDidChangeActiveViewDescriptors(
        () => this.updateViewContainerEnablementContextKey(viewContainer)
      )
    );
    disposables.add(this.registerOpenViewContainerAction(viewContainer));
    this.viewContainerDisposables.set(viewContainer.id, disposables);
  }
  onDidDeregisterViewContainer(viewContainer, viewContainerLocation) {
    this.deregisterPaneComposite(viewContainer, viewContainerLocation);
    this.viewContainerDisposables.deleteAndDispose(viewContainer.id);
  }
  onDidChangeContainerLocation(viewContainer, from, to) {
    this.deregisterPaneComposite(viewContainer, from);
    this.registerPaneComposite(viewContainer, to);
    if (this.layoutService.isVisible(getPartByLocation(to)) && this.viewDescriptorService.getViewContainersByLocation(to).filter((vc) => this.isViewContainerActive(vc.id)).length === 1) {
      this.openViewContainer(viewContainer.id);
    }
  }
  onViewDescriptorsAdded(views, container) {
    const location = this.viewDescriptorService.getViewContainerLocation(container);
    if (location === null) {
      return;
    }
    for (const viewDescriptor of views) {
      const disposables = new DisposableStore();
      disposables.add(this.registerOpenViewAction(viewDescriptor));
      disposables.add(
        this.registerFocusViewAction(viewDescriptor, container.title)
      );
      disposables.add(
        this.registerResetViewLocationAction(viewDescriptor)
      );
      this.viewDisposable.set(viewDescriptor, disposables);
    }
  }
  onViewDescriptorsRemoved(views) {
    for (const view of views) {
      const disposable = this.viewDisposable.get(view);
      if (disposable) {
        disposable.dispose();
        this.viewDisposable.delete(view);
      }
    }
  }
  updateViewContainerEnablementContextKey(viewContainer) {
    let contextKey = this.enabledViewContainersContextKeys.get(
      viewContainer.id
    );
    if (!contextKey) {
      contextKey = this.contextKeyService.createKey(
        getEnabledViewContainerContextKey(viewContainer.id),
        false
      );
      this.enabledViewContainersContextKeys.set(
        viewContainer.id,
        contextKey
      );
    }
    contextKey.set(
      !(viewContainer.hideIfEmpty && this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length === 0)
    );
  }
  async openComposite(compositeId, location, focus) {
    return this.paneCompositeService.openPaneComposite(
      compositeId,
      location,
      focus
    );
  }
  getComposite(compositeId, location) {
    return this.paneCompositeService.getPaneComposite(
      compositeId,
      location
    );
  }
  // One view container can be visible at a time in a location
  isViewContainerVisible(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id);
    if (!viewContainer) {
      return false;
    }
    const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    if (viewContainerLocation === null) {
      return false;
    }
    return this.paneCompositeService.getActivePaneComposite(viewContainerLocation)?.getId() === id;
  }
  // Multiple view containers can be active/inactive at a time in a location
  isViewContainerActive(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id);
    if (!viewContainer) {
      return false;
    }
    if (!viewContainer.hideIfEmpty) {
      return true;
    }
    return this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0;
  }
  getVisibleViewContainer(location) {
    const viewContainerId = this.paneCompositeService.getActivePaneComposite(location)?.getId();
    return viewContainerId ? this.viewDescriptorService.getViewContainerById(viewContainerId) : null;
  }
  getActiveViewPaneContainerWithId(viewContainerId) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
    return viewContainer ? this.getActiveViewPaneContainer(viewContainer) : null;
  }
  async openViewContainer(id, focus) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id);
    if (viewContainer) {
      const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(
        viewContainer
      );
      if (viewContainerLocation !== null) {
        const paneComposite = await this.paneCompositeService.openPaneComposite(
          id,
          viewContainerLocation,
          focus
        );
        return paneComposite || null;
      }
    }
    return null;
  }
  async closeViewContainer(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id);
    if (viewContainer) {
      const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(
        viewContainer
      );
      const isActive = viewContainerLocation !== null && this.paneCompositeService.getActivePaneComposite(
        viewContainerLocation
      );
      if (viewContainerLocation !== null) {
        return isActive ? this.layoutService.setPartHidden(
          true,
          getPartByLocation(viewContainerLocation)
        ) : void 0;
      }
    }
  }
  isViewVisible(id) {
    const activeView = this.getActiveViewWithId(id);
    return activeView?.isBodyVisible() || false;
  }
  getActiveViewWithId(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
    if (viewContainer) {
      const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
      if (activeViewPaneContainer) {
        return activeViewPaneContainer.getView(id);
      }
    }
    return null;
  }
  getViewWithId(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
    if (viewContainer) {
      const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
      if (viewPaneContainer) {
        return viewPaneContainer.getView(id);
      }
    }
    return null;
  }
  getFocusedViewName() {
    const viewId = this.contextKeyService.getContextKeyValue(FocusedViewContext.key) ?? "";
    const textEditorFocused = this.editorService.activeTextEditorControl?.hasTextFocus() ? localize("editor", "Text Editor") : void 0;
    return this.viewDescriptorService.getViewDescriptorById(viewId.toString())?.name?.value ?? textEditorFocused ?? "";
  }
  async openView(id, focus) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
    if (!viewContainer) {
      return null;
    }
    if (!this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.some(
      (viewDescriptor) => viewDescriptor.id === id
    )) {
      return null;
    }
    const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    const compositeDescriptor = this.getComposite(
      viewContainer.id,
      location
    );
    if (compositeDescriptor) {
      const paneComposite = await this.openComposite(
        compositeDescriptor.id,
        location
      );
      if (paneComposite && paneComposite.openView) {
        return paneComposite.openView(id, focus) || null;
      } else if (focus) {
        paneComposite?.focus();
      }
    }
    return null;
  }
  closeView(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
    if (viewContainer) {
      const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
      if (activeViewPaneContainer) {
        const view = activeViewPaneContainer.getView(id);
        if (view) {
          if (activeViewPaneContainer.views.length === 1) {
            const location = this.viewDescriptorService.getViewContainerLocation(
              viewContainer
            );
            if (location === ViewContainerLocation.Sidebar) {
              this.layoutService.setPartHidden(
                true,
                Parts.SIDEBAR_PART
              );
            } else if (location === ViewContainerLocation.Panel || location === ViewContainerLocation.AuxiliaryBar) {
              this.paneCompositeService.hideActivePaneComposite(
                location
              );
            }
            if (this.focusedViewContextKey.get() === id) {
              this.focusedViewContextKey.reset();
            }
          } else {
            view.setExpanded(false);
          }
        }
      }
    }
  }
  getActiveViewPaneContainer(viewContainer) {
    const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    if (location === null) {
      return null;
    }
    const activePaneComposite = this.paneCompositeService.getActivePaneComposite(location);
    if (activePaneComposite?.getId() === viewContainer.id) {
      return activePaneComposite.getViewPaneContainer() || null;
    }
    return null;
  }
  getViewProgressIndicator(viewId) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(viewId);
    if (!viewContainer) {
      return void 0;
    }
    const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
    if (!viewPaneContainer) {
      return void 0;
    }
    const view = viewPaneContainer.getView(viewId);
    if (!view) {
      return void 0;
    }
    if (viewPaneContainer.isViewMergedWithContainer()) {
      return this.getViewContainerProgressIndicator(viewContainer);
    }
    return view.getProgressIndicator();
  }
  getViewContainerProgressIndicator(viewContainer) {
    const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    if (viewContainerLocation === null) {
      return void 0;
    }
    return this.paneCompositeService.getProgressIndicator(
      viewContainer.id,
      viewContainerLocation
    );
  }
  registerOpenViewContainerAction(viewContainer) {
    const disposables = new DisposableStore();
    if (viewContainer.openCommandActionDescriptor) {
      const { id, mnemonicTitle, keybindings, order } = viewContainer.openCommandActionDescriptor ?? {
        id: viewContainer.id
      };
      const title = viewContainer.openCommandActionDescriptor.title ?? viewContainer.title;
      const that = this;
      disposables.add(
        registerAction2(
          class OpenViewContainerAction extends Action2 {
            constructor() {
              super({
                id,
                get title() {
                  const viewContainerLocation = that.viewDescriptorService.getViewContainerLocation(
                    viewContainer
                  );
                  const localizedTitle = typeof title === "string" ? title : title.value;
                  const originalTitle = typeof title === "string" ? title : title.original;
                  if (viewContainerLocation === ViewContainerLocation.Sidebar) {
                    return {
                      value: localize(
                        "show view",
                        "Show {0}",
                        localizedTitle
                      ),
                      original: `Show ${originalTitle}`
                    };
                  } else {
                    return {
                      value: localize(
                        "toggle view",
                        "Toggle {0}",
                        localizedTitle
                      ),
                      original: `Toggle ${originalTitle}`
                    };
                  }
                },
                category: Categories.View,
                precondition: ContextKeyExpr.has(
                  getEnabledViewContainerContextKey(
                    viewContainer.id
                  )
                ),
                keybinding: keybindings ? {
                  ...keybindings,
                  weight: KeybindingWeight.WorkbenchContrib
                } : void 0,
                f1: true
              });
            }
            async run(serviceAccessor) {
              const editorGroupService = serviceAccessor.get(IEditorGroupsService);
              const viewDescriptorService = serviceAccessor.get(
                IViewDescriptorService
              );
              const layoutService = serviceAccessor.get(
                IWorkbenchLayoutService
              );
              const viewsService = serviceAccessor.get(IViewsService);
              const viewContainerLocation = viewDescriptorService.getViewContainerLocation(
                viewContainer
              );
              switch (viewContainerLocation) {
                case ViewContainerLocation.AuxiliaryBar:
                case ViewContainerLocation.Sidebar: {
                  const part = viewContainerLocation === ViewContainerLocation.Sidebar ? Parts.SIDEBAR_PART : Parts.AUXILIARYBAR_PART;
                  if (!viewsService.isViewContainerVisible(
                    viewContainer.id
                  ) || !layoutService.hasFocus(part)) {
                    await viewsService.openViewContainer(
                      viewContainer.id,
                      true
                    );
                  } else {
                    editorGroupService.activeGroup.focus();
                  }
                  break;
                }
                case ViewContainerLocation.Panel:
                  if (!viewsService.isViewContainerVisible(
                    viewContainer.id
                  ) || !layoutService.hasFocus(
                    Parts.PANEL_PART
                  )) {
                    await viewsService.openViewContainer(
                      viewContainer.id,
                      true
                    );
                  } else {
                    viewsService.closeViewContainer(
                      viewContainer.id
                    );
                  }
                  break;
              }
            }
          }
        )
      );
      if (mnemonicTitle) {
        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(
          viewContainer
        );
        disposables.add(
          MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
            command: {
              id,
              title: mnemonicTitle
            },
            group: defaultLocation === ViewContainerLocation.Sidebar ? "3_views" : "4_panels",
            when: ContextKeyExpr.has(
              getEnabledViewContainerContextKey(viewContainer.id)
            ),
            order: order ?? Number.MAX_VALUE
          })
        );
      }
    }
    return disposables;
  }
  registerOpenViewAction(viewDescriptor) {
    const disposables = new DisposableStore();
    if (viewDescriptor.openCommandActionDescriptor) {
      const title = viewDescriptor.openCommandActionDescriptor.title ?? viewDescriptor.name;
      const commandId = viewDescriptor.openCommandActionDescriptor.id;
      const that = this;
      disposables.add(
        registerAction2(
          class OpenViewAction extends Action2 {
            constructor() {
              super({
                id: commandId,
                get title() {
                  const viewContainerLocation = that.viewDescriptorService.getViewLocationById(
                    viewDescriptor.id
                  );
                  const localizedTitle = typeof title === "string" ? title : title.value;
                  const originalTitle = typeof title === "string" ? title : title.original;
                  if (viewContainerLocation === ViewContainerLocation.Sidebar) {
                    return {
                      value: localize(
                        "show view",
                        "Show {0}",
                        localizedTitle
                      ),
                      original: `Show ${originalTitle}`
                    };
                  } else {
                    return {
                      value: localize(
                        "toggle view",
                        "Toggle {0}",
                        localizedTitle
                      ),
                      original: `Toggle ${originalTitle}`
                    };
                  }
                },
                category: Categories.View,
                precondition: ContextKeyExpr.has(
                  `${viewDescriptor.id}.active`
                ),
                keybinding: viewDescriptor.openCommandActionDescriptor.keybindings ? {
                  ...viewDescriptor.openCommandActionDescriptor.keybindings,
                  weight: KeybindingWeight.WorkbenchContrib
                } : void 0,
                f1: true
              });
            }
            async run(serviceAccessor) {
              const editorGroupService = serviceAccessor.get(IEditorGroupsService);
              const viewDescriptorService = serviceAccessor.get(
                IViewDescriptorService
              );
              const layoutService = serviceAccessor.get(
                IWorkbenchLayoutService
              );
              const viewsService = serviceAccessor.get(IViewsService);
              const contextKeyService = serviceAccessor.get(IContextKeyService);
              const focusedViewId = FocusedViewContext.getValue(contextKeyService);
              if (focusedViewId === viewDescriptor.id) {
                const viewLocation = viewDescriptorService.getViewLocationById(
                  viewDescriptor.id
                );
                if (viewDescriptorService.getViewLocationById(
                  viewDescriptor.id
                ) === ViewContainerLocation.Sidebar) {
                  editorGroupService.activeGroup.focus();
                } else if (viewLocation !== null) {
                  layoutService.setPartHidden(
                    true,
                    getPartByLocation(viewLocation)
                  );
                }
              } else {
                viewsService.openView(viewDescriptor.id, true);
              }
            }
          }
        )
      );
      if (viewDescriptor.openCommandActionDescriptor.mnemonicTitle) {
        const defaultViewContainer = this.viewDescriptorService.getDefaultContainerById(
          viewDescriptor.id
        );
        if (defaultViewContainer) {
          const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(
            defaultViewContainer
          );
          disposables.add(
            MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
              command: {
                id: commandId,
                title: viewDescriptor.openCommandActionDescriptor.mnemonicTitle
              },
              group: defaultLocation === ViewContainerLocation.Sidebar ? "3_views" : "4_panels",
              when: ContextKeyExpr.has(
                `${viewDescriptor.id}.active`
              ),
              order: viewDescriptor.openCommandActionDescriptor.order ?? Number.MAX_VALUE
            })
          );
        }
      }
    }
    return disposables;
  }
  registerFocusViewAction(viewDescriptor, category) {
    return registerAction2(
      class FocusViewAction extends Action2 {
        constructor() {
          const title = localize2(
            {
              key: "focus view",
              comment: [
                "{0} indicates the name of the view to be focused."
              ]
            },
            "Focus on {0} View",
            viewDescriptor.name.value
          );
          super({
            id: viewDescriptor.focusCommand ? viewDescriptor.focusCommand.id : `${viewDescriptor.id}.focus`,
            title,
            category,
            menu: [
              {
                id: MenuId.CommandPalette,
                when: viewDescriptor.when
              }
            ],
            keybinding: {
              when: ContextKeyExpr.has(
                `${viewDescriptor.id}.active`
              ),
              weight: KeybindingWeight.WorkbenchContrib,
              primary: viewDescriptor.focusCommand?.keybindings?.primary,
              secondary: viewDescriptor.focusCommand?.keybindings?.secondary,
              linux: viewDescriptor.focusCommand?.keybindings?.linux,
              mac: viewDescriptor.focusCommand?.keybindings?.mac,
              win: viewDescriptor.focusCommand?.keybindings?.win
            },
            metadata: {
              description: title.value,
              args: [
                {
                  name: "focusOptions",
                  description: "Focus Options",
                  schema: {
                    type: "object",
                    properties: {
                      preserveFocus: {
                        type: "boolean",
                        default: false
                      }
                    }
                  }
                }
              ]
            }
          });
        }
        run(accessor, options) {
          accessor.get(IViewsService).openView(viewDescriptor.id, !options?.preserveFocus);
        }
      }
    );
  }
  registerResetViewLocationAction(viewDescriptor) {
    return registerAction2(
      class ResetViewLocationAction extends Action2 {
        constructor() {
          super({
            id: `${viewDescriptor.id}.resetViewLocation`,
            title: localize2("resetViewLocation", "Reset Location"),
            menu: [
              {
                id: MenuId.ViewTitleContext,
                when: ContextKeyExpr.or(
                  ContextKeyExpr.and(
                    ContextKeyExpr.equals(
                      "view",
                      viewDescriptor.id
                    ),
                    ContextKeyExpr.equals(
                      `${viewDescriptor.id}.defaultViewLocation`,
                      false
                    )
                  )
                ),
                group: "1_hide",
                order: 2
              }
            ]
          });
        }
        run(accessor) {
          const viewDescriptorService = accessor.get(
            IViewDescriptorService
          );
          const defaultContainer = viewDescriptorService.getDefaultContainerById(
            viewDescriptor.id
          );
          const containerModel = viewDescriptorService.getViewContainerModel(
            defaultContainer
          );
          if (defaultContainer.hideIfEmpty && containerModel.visibleViewDescriptors.length === 0) {
            const defaultLocation = viewDescriptorService.getDefaultViewContainerLocation(
              defaultContainer
            );
            viewDescriptorService.moveViewContainerToLocation(
              defaultContainer,
              defaultLocation,
              void 0,
              this.desc.id
            );
          }
          viewDescriptorService.moveViewsToContainer(
            [viewDescriptor],
            viewDescriptorService.getDefaultContainerById(
              viewDescriptor.id
            ),
            void 0,
            this.desc.id
          );
          accessor.get(IViewsService).openView(viewDescriptor.id, true);
        }
      }
    );
  }
  registerPaneComposite(viewContainer, viewContainerLocation) {
    const that = this;
    let PaneContainer = class extends PaneComposite {
      constructor(telemetryService, contextService, storageService, instantiationService, themeService, contextMenuService, extensionService) {
        super(
          viewContainer.id,
          telemetryService,
          storageService,
          instantiationService,
          themeService,
          contextMenuService,
          extensionService,
          contextService
        );
      }
      createViewPaneContainer(element) {
        const viewPaneContainerDisposables = this._register(
          new DisposableStore()
        );
        const viewPaneContainer = that.createViewPaneContainer(
          element,
          viewContainer,
          viewContainerLocation,
          viewPaneContainerDisposables,
          this.instantiationService
        );
        if (!(viewPaneContainer instanceof FilterViewPaneContainer)) {
          viewPaneContainerDisposables.add(
            Event.any(
              viewPaneContainer.onDidAddViews,
              viewPaneContainer.onDidRemoveViews,
              viewPaneContainer.onTitleAreaUpdate
            )(() => {
              this.updateTitleArea();
            })
          );
        }
        return viewPaneContainer;
      }
    };
    PaneContainer = __decorateClass([
      __decorateParam(0, ITelemetryService),
      __decorateParam(1, IWorkspaceContextService),
      __decorateParam(2, IStorageService),
      __decorateParam(3, IInstantiationService),
      __decorateParam(4, IThemeService),
      __decorateParam(5, IContextMenuService),
      __decorateParam(6, IExtensionService)
    ], PaneContainer);
    Registry.as(
      getPaneCompositeExtension(viewContainerLocation)
    ).registerPaneComposite(
      PaneCompositeDescriptor.create(
        PaneContainer,
        viewContainer.id,
        typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value,
        isString(viewContainer.icon) ? viewContainer.icon : void 0,
        viewContainer.order,
        viewContainer.requestedIndex,
        viewContainer.icon instanceof URI ? viewContainer.icon : void 0
      )
    );
  }
  deregisterPaneComposite(viewContainer, viewContainerLocation) {
    Registry.as(
      getPaneCompositeExtension(viewContainerLocation)
    ).deregisterPaneComposite(viewContainer.id);
  }
  createViewPaneContainer(element, viewContainer, viewContainerLocation, disposables, instantiationService) {
    const viewPaneContainer = instantiationService.createInstance(
      viewContainer.ctorDescriptor.ctor,
      ...viewContainer.ctorDescriptor.staticArguments || []
    );
    this.viewPaneContainers.set(
      viewPaneContainer.getId(),
      viewPaneContainer
    );
    disposables.add(
      toDisposable(
        () => this.viewPaneContainers.delete(viewPaneContainer.getId())
      )
    );
    disposables.add(
      viewPaneContainer.onDidAddViews(
        (views) => this.onViewsAdded(views)
      )
    );
    disposables.add(
      viewPaneContainer.onDidChangeViewVisibility(
        (view) => this.onViewsVisibilityChanged(view, view.isBodyVisible())
      )
    );
    disposables.add(
      viewPaneContainer.onDidRemoveViews(
        (views) => this.onViewsRemoved(views)
      )
    );
    disposables.add(
      viewPaneContainer.onDidFocusView((view) => {
        if (this.focusedViewContextKey.get() !== view.id) {
          this.focusedViewContextKey.set(view.id);
          this._onDidChangeFocusedView.fire();
        }
      })
    );
    disposables.add(
      viewPaneContainer.onDidBlurView((view) => {
        if (this.focusedViewContextKey.get() === view.id) {
          this.focusedViewContextKey.reset();
          this._onDidChangeFocusedView.fire();
        }
      })
    );
    return viewPaneContainer;
  }
};
ViewsService = __decorateClass([
  __decorateParam(0, IViewDescriptorService),
  __decorateParam(1, IPaneCompositePartService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IEditorService)
], ViewsService);
function getEnabledViewContainerContextKey(viewContainerId) {
  return `viewContainer.${viewContainerId}.enabled`;
}
function getPaneCompositeExtension(viewContainerLocation) {
  switch (viewContainerLocation) {
    case ViewContainerLocation.AuxiliaryBar:
      return PaneCompositeExtensions.Auxiliary;
    case ViewContainerLocation.Panel:
      return PaneCompositeExtensions.Panels;
    case ViewContainerLocation.Sidebar:
    default:
      return PaneCompositeExtensions.Viewlets;
  }
}
function getPartByLocation(viewContainerLocation) {
  switch (viewContainerLocation) {
    case ViewContainerLocation.AuxiliaryBar:
      return Parts.AUXILIARYBAR_PART;
    case ViewContainerLocation.Panel:
      return Parts.PANEL_PART;
    case ViewContainerLocation.Sidebar:
    default:
      return Parts.SIDEBAR_PART;
  }
}
registerSingleton(
  IViewsService,
  ViewsService,
  InstantiationType.Eager
);
export {
  ViewsService,
  getPartByLocation
};
