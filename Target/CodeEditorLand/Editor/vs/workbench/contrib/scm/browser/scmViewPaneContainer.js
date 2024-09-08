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
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import {
  HISTORY_VIEW_PANE_ID,
  REPOSITORIES_VIEW_PANE_ID,
  VIEW_PANE_ID,
  VIEWLET_ID
} from "../common/scm.js";
let SCMViewPaneContainer = class extends ViewPaneContainer {
  constructor(layoutService, telemetryService, instantiationService, contextMenuService, themeService, storageService, configurationService, extensionService, contextService, viewDescriptorService) {
    super(
      VIEWLET_ID,
      { mergeViewWithContainerWhenSingleView: true },
      instantiationService,
      configurationService,
      layoutService,
      contextMenuService,
      telemetryService,
      extensionService,
      themeService,
      storageService,
      contextService,
      viewDescriptorService
    );
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("scm-viewlet");
  }
  getOptimalWidth() {
    return 400;
  }
  getTitle() {
    if (this.panes.length === 1) {
      if (this.panes[0].id === VIEW_PANE_ID || this.panes[0].id === REPOSITORIES_VIEW_PANE_ID || this.panes[0].id === HISTORY_VIEW_PANE_ID) {
        return this.panes[0].title;
      } else {
        return super.getTitle();
      }
    }
    return localize("source control", "Source Control");
  }
};
SCMViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IViewDescriptorService)
], SCMViewPaneContainer);
export {
  SCMViewPaneContainer
};
