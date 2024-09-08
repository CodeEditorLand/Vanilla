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
  setGlobalHoverDelay,
  setGlobalSashSize
} from "../../../../base/browser/ui/sash/sash.js";
import { Event } from "../../../../base/common/event.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { clamp } from "../../../../base/common/numbers.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
const minSize = 1;
const maxSize = 20;
let SashSettingsController = class {
  constructor(configurationService, layoutService) {
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    const onDidChangeSize = Event.filter(
      configurationService.onDidChangeConfiguration,
      (e) => e.affectsConfiguration("workbench.sash.size")
    );
    onDidChangeSize(this.onDidChangeSize, this, this.disposables);
    this.onDidChangeSize();
    const onDidChangeHoverDelay = Event.filter(
      configurationService.onDidChangeConfiguration,
      (e) => e.affectsConfiguration("workbench.sash.hoverDelay")
    );
    onDidChangeHoverDelay(
      this.onDidChangeHoverDelay,
      this,
      this.disposables
    );
    this.onDidChangeHoverDelay();
  }
  disposables = new DisposableStore();
  onDidChangeSize() {
    const configuredSize = this.configurationService.getValue(
      "workbench.sash.size"
    );
    const size = clamp(configuredSize, 4, 20);
    const hoverSize = clamp(configuredSize, 1, 8);
    this.layoutService.mainContainer.style.setProperty(
      "--vscode-sash-size",
      size + "px"
    );
    this.layoutService.mainContainer.style.setProperty(
      "--vscode-sash-hover-size",
      hoverSize + "px"
    );
    setGlobalSashSize(size);
  }
  onDidChangeHoverDelay() {
    setGlobalHoverDelay(
      this.configurationService.getValue(
        "workbench.sash.hoverDelay"
      )
    );
  }
  dispose() {
    this.disposables.dispose();
  }
};
SashSettingsController = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ILayoutService)
], SashSettingsController);
export {
  SashSettingsController,
  maxSize,
  minSize
};
