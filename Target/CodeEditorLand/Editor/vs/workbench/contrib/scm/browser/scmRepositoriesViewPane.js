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
import "./media/scm.css";
import { $, append } from "../../../../base/browser/dom.js";
import { Orientation } from "../../../../base/browser/ui/sash/sash.js";
import { Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchList } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  ViewPane
} from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { ISCMViewService } from "../common/scm.js";
import {
  RepositoryActionRunner,
  RepositoryRenderer
} from "./scmRepositoryRenderer.js";
import {
  collectContextMenuActions,
  getActionViewItemProvider
} from "./util.js";
class ListDelegate {
  getHeight() {
    return 22;
  }
  getTemplateId() {
    return RepositoryRenderer.TEMPLATE_ID;
  }
}
let SCMRepositoriesViewPane = class extends ViewPane {
  constructor(options, scmViewService, keybindingService, contextMenuService, instantiationService, viewDescriptorService, contextKeyService, configurationService, openerService, themeService, telemetryService, hoverService) {
    super(
      { ...options, titleMenuId: MenuId.SCMSourceControlTitle },
      keybindingService,
      contextMenuService,
      configurationService,
      contextKeyService,
      viewDescriptorService,
      instantiationService,
      openerService,
      themeService,
      telemetryService,
      hoverService
    );
    this.scmViewService = scmViewService;
  }
  list;
  disposables = new DisposableStore();
  renderBody(container) {
    super.renderBody(container);
    const listContainer = append(
      container,
      $(".scm-view.scm-repositories-view")
    );
    const updateProviderCountVisibility = () => {
      const value = this.configurationService.getValue("scm.providerCountBadge");
      listContainer.classList.toggle(
        "hide-provider-counts",
        value === "hidden"
      );
      listContainer.classList.toggle(
        "auto-provider-counts",
        value === "auto"
      );
    };
    this._register(
      Event.filter(
        this.configurationService.onDidChangeConfiguration,
        (e) => e.affectsConfiguration("scm.providerCountBadge"),
        this.disposables
      )(updateProviderCountVisibility)
    );
    updateProviderCountVisibility();
    const delegate = new ListDelegate();
    const renderer = this.instantiationService.createInstance(
      RepositoryRenderer,
      MenuId.SCMSourceControlInline,
      getActionViewItemProvider(this.instantiationService)
    );
    const identityProvider = {
      getId: (r) => r.provider.id
    };
    this.list = this.instantiationService.createInstance(
      WorkbenchList,
      `SCM Main`,
      listContainer,
      delegate,
      [renderer],
      {
        identityProvider,
        horizontalScrolling: false,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles,
        accessibilityProvider: {
          getAriaLabel(r) {
            return r.provider.label;
          },
          getWidgetAriaLabel() {
            return localize("scm", "Source Control Repositories");
          }
        }
      }
    );
    this._register(this.list);
    this._register(
      this.list.onDidChangeSelection(this.onListSelectionChange, this)
    );
    this._register(this.list.onContextMenu(this.onListContextMenu, this));
    this._register(
      this.scmViewService.onDidChangeRepositories(
        this.onDidChangeRepositories,
        this
      )
    );
    this._register(
      this.scmViewService.onDidChangeVisibleRepositories(
        this.updateListSelection,
        this
      )
    );
    if (this.orientation === Orientation.VERTICAL) {
      this._register(
        this.configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration("scm.repositories.visible")) {
            this.updateBodySize();
          }
        })
      );
    }
    this.onDidChangeRepositories();
    this.updateListSelection();
  }
  onDidChangeRepositories() {
    this.list.splice(0, this.list.length, this.scmViewService.repositories);
    this.updateBodySize();
  }
  focus() {
    super.focus();
    this.list.domFocus();
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.list.layout(height, width);
  }
  updateBodySize() {
    if (this.orientation === Orientation.HORIZONTAL) {
      return;
    }
    const visibleCount = this.configurationService.getValue(
      "scm.repositories.visible"
    );
    const empty = this.list.length === 0;
    const size = Math.min(this.list.length, visibleCount) * 22;
    this.minimumBodySize = visibleCount === 0 ? 22 : size;
    this.maximumBodySize = visibleCount === 0 ? Number.POSITIVE_INFINITY : empty ? Number.POSITIVE_INFINITY : size;
  }
  onListContextMenu(e) {
    if (!e.element) {
      return;
    }
    const provider = e.element.provider;
    const menus = this.scmViewService.menus.getRepositoryMenus(provider);
    const menu = menus.repositoryContextMenu;
    const actions = collectContextMenuActions(menu);
    const actionRunner = this._register(
      new RepositoryActionRunner(() => {
        return this.list.getSelectedElements();
      })
    );
    actionRunner.onWillRun(() => this.list.domFocus());
    this.contextMenuService.showContextMenu({
      actionRunner,
      getAnchor: () => e.anchor,
      getActions: () => actions,
      getActionsContext: () => provider
    });
  }
  onListSelectionChange(e) {
    if (e.browserEvent && e.elements.length > 0) {
      const scrollTop = this.list.scrollTop;
      this.scmViewService.visibleRepositories = e.elements;
      this.list.scrollTop = scrollTop;
    }
  }
  updateListSelection() {
    const oldSelection = this.list.getSelection();
    const oldSet = new Set(
      Iterable.map(oldSelection, (i) => this.list.element(i))
    );
    const set = new Set(this.scmViewService.visibleRepositories);
    const added = new Set(Iterable.filter(set, (r) => !oldSet.has(r)));
    const removed = new Set(Iterable.filter(oldSet, (r) => !set.has(r)));
    if (added.size === 0 && removed.size === 0) {
      return;
    }
    const selection = oldSelection.filter(
      (i) => !removed.has(this.list.element(i))
    );
    for (let i = 0; i < this.list.length; i++) {
      if (added.has(this.list.element(i))) {
        selection.push(i);
      }
    }
    this.list.setSelection(selection);
    if (selection.length > 0 && selection.indexOf(this.list.getFocus()[0]) === -1) {
      this.list.setAnchor(selection[0]);
      this.list.setFocus([selection[0]]);
    }
  }
  dispose() {
    this.disposables.dispose();
    super.dispose();
  }
};
SCMRepositoriesViewPane = __decorateClass([
  __decorateParam(1, ISCMViewService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService)
], SCMRepositoriesViewPane);
export {
  SCMRepositoriesViewPane
};
