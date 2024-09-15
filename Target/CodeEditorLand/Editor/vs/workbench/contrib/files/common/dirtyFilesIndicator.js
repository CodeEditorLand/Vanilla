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
import {
  Disposable,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import * as nls from "../../../../nls.js";
import {
  IActivityService,
  NumberBadge
} from "../../../services/activity/common/activity.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import {
  WorkingCopyCapabilities
} from "../../../services/workingCopy/common/workingCopy.js";
import { IWorkingCopyService } from "../../../services/workingCopy/common/workingCopyService.js";
import { VIEWLET_ID } from "./files.js";
let DirtyFilesIndicator = class extends Disposable {
  constructor(activityService, workingCopyService, filesConfigurationService) {
    super();
    this.activityService = activityService;
    this.workingCopyService = workingCopyService;
    this.filesConfigurationService = filesConfigurationService;
    this.updateActivityBadge();
    this.registerListeners();
  }
  static {
    __name(this, "DirtyFilesIndicator");
  }
  static ID = "workbench.contrib.dirtyFilesIndicator";
  badgeHandle = this._register(new MutableDisposable());
  lastKnownDirtyCount = 0;
  registerListeners() {
    this._register(
      this.workingCopyService.onDidChangeDirty(
        (workingCopy) => this.onWorkingCopyDidChangeDirty(workingCopy)
      )
    );
  }
  onWorkingCopyDidChangeDirty(workingCopy) {
    const gotDirty = workingCopy.isDirty();
    if (gotDirty && !(workingCopy.capabilities & WorkingCopyCapabilities.Untitled) && this.filesConfigurationService.hasShortAutoSaveDelay(
      workingCopy.resource
    )) {
      return;
    }
    if (gotDirty || this.lastKnownDirtyCount > 0) {
      this.updateActivityBadge();
    }
  }
  updateActivityBadge() {
    const dirtyCount = this.lastKnownDirtyCount = this.workingCopyService.dirtyCount;
    if (dirtyCount > 0) {
      this.badgeHandle.value = this.activityService.showViewContainerActivity(VIEWLET_ID, {
        badge: new NumberBadge(
          dirtyCount,
          (num) => num === 1 ? nls.localize("dirtyFile", "1 unsaved file") : nls.localize(
            "dirtyFiles",
            "{0} unsaved files",
            dirtyCount
          )
        )
      });
    } else {
      this.badgeHandle.clear();
    }
  }
};
DirtyFilesIndicator = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IWorkingCopyService),
  __decorateParam(2, IFilesConfigurationService)
], DirtyFilesIndicator);
export {
  DirtyFilesIndicator
};
//# sourceMappingURL=dirtyFilesIndicator.js.map
