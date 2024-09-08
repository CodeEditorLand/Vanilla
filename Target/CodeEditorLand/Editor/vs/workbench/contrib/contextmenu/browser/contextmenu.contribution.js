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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
let ContextMenuContribution = class extends Disposable {
  constructor(layoutService, contextMenuService) {
    super();
    const update = (visible) => layoutService.activeContainer.classList.toggle(
      "context-menu-visible",
      visible
    );
    this._register(
      contextMenuService.onDidShowContextMenu(() => update(true))
    );
    this._register(
      contextMenuService.onDidHideContextMenu(() => update(false))
    );
  }
};
ContextMenuContribution = __decorateClass([
  __decorateParam(0, ILayoutService),
  __decorateParam(1, IContextMenuService)
], ContextMenuContribution);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  ContextMenuContribution,
  LifecyclePhase.Eventually
);
