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
import * as DOM from "../../../../base/browser/dom.js";
import {
  ActionViewItem
} from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { MarkersContextKeys } from "../common/markers.js";
import Messages from "./messages.js";
import "./markersViewActions.css";
class MarkersFilters extends Disposable {
  constructor(options, contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this._showErrors.set(options.showErrors);
    this._showWarnings.set(options.showWarnings);
    this._showInfos.set(options.showInfos);
    this._excludedFiles.set(options.excludedFiles);
    this._activeFile.set(options.activeFile);
    this.filterHistory = options.filterHistory;
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  filterHistory;
  _excludedFiles = MarkersContextKeys.ShowExcludedFilesFilterContextKey.bindTo(
    this.contextKeyService
  );
  get excludedFiles() {
    return !!this._excludedFiles.get();
  }
  set excludedFiles(filesExclude) {
    if (this._excludedFiles.get() !== filesExclude) {
      this._excludedFiles.set(filesExclude);
      this._onDidChange.fire({ excludedFiles: true });
    }
  }
  _activeFile = MarkersContextKeys.ShowActiveFileFilterContextKey.bindTo(
    this.contextKeyService
  );
  get activeFile() {
    return !!this._activeFile.get();
  }
  set activeFile(activeFile) {
    if (this._activeFile.get() !== activeFile) {
      this._activeFile.set(activeFile);
      this._onDidChange.fire({ activeFile: true });
    }
  }
  _showWarnings = MarkersContextKeys.ShowWarningsFilterContextKey.bindTo(
    this.contextKeyService
  );
  get showWarnings() {
    return !!this._showWarnings.get();
  }
  set showWarnings(showWarnings) {
    if (this._showWarnings.get() !== showWarnings) {
      this._showWarnings.set(showWarnings);
      this._onDidChange.fire({ showWarnings: true });
    }
  }
  _showErrors = MarkersContextKeys.ShowErrorsFilterContextKey.bindTo(
    this.contextKeyService
  );
  get showErrors() {
    return !!this._showErrors.get();
  }
  set showErrors(showErrors) {
    if (this._showErrors.get() !== showErrors) {
      this._showErrors.set(showErrors);
      this._onDidChange.fire({ showErrors: true });
    }
  }
  _showInfos = MarkersContextKeys.ShowInfoFilterContextKey.bindTo(
    this.contextKeyService
  );
  get showInfos() {
    return !!this._showInfos.get();
  }
  set showInfos(showInfos) {
    if (this._showInfos.get() !== showInfos) {
      this._showInfos.set(showInfos);
      this._onDidChange.fire({ showInfos: true });
    }
  }
}
class QuickFixAction extends Action {
  constructor(marker) {
    super(
      QuickFixAction.ID,
      Messages.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX,
      QuickFixAction.CLASS,
      false
    );
    this.marker = marker;
  }
  static ID = "workbench.actions.problems.quickfix";
  static CLASS = "markers-panel-action-quickfix " + ThemeIcon.asClassName(Codicon.lightBulb);
  static AUTO_FIX_CLASS = QuickFixAction.CLASS + " autofixable";
  _onShowQuickFixes = this._register(new Emitter());
  onShowQuickFixes = this._onShowQuickFixes.event;
  _quickFixes = [];
  get quickFixes() {
    return this._quickFixes;
  }
  set quickFixes(quickFixes) {
    this._quickFixes = quickFixes;
    this.enabled = this._quickFixes.length > 0;
  }
  autoFixable(autofixable) {
    this.class = autofixable ? QuickFixAction.AUTO_FIX_CLASS : QuickFixAction.CLASS;
  }
  run() {
    this._onShowQuickFixes.fire();
    return Promise.resolve();
  }
}
let QuickFixActionViewItem = class extends ActionViewItem {
  constructor(action, options, contextMenuService) {
    super(null, action, { ...options, icon: true, label: false });
    this.contextMenuService = contextMenuService;
  }
  onClick(event) {
    DOM.EventHelper.stop(event, true);
    this.showQuickFixes();
  }
  showQuickFixes() {
    if (!this.element) {
      return;
    }
    if (!this.isEnabled()) {
      return;
    }
    const elementPosition = DOM.getDomNodePagePosition(this.element);
    const quickFixes = this.action.quickFixes;
    if (quickFixes.length) {
      this.contextMenuService.showContextMenu({
        getAnchor: () => ({
          x: elementPosition.left + 10,
          y: elementPosition.top + elementPosition.height + 4
        }),
        getActions: () => quickFixes
      });
    }
  }
};
QuickFixActionViewItem = __decorateClass([
  __decorateParam(2, IContextMenuService)
], QuickFixActionViewItem);
export {
  MarkersFilters,
  QuickFixAction,
  QuickFixActionViewItem
};
