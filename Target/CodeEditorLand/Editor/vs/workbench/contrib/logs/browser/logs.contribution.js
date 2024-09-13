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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { OpenWindowSessionLogFileAction } from "../common/logsActions.js";
import { LogsDataCleaner } from "../common/logsDataCleaner.js";
let WebLogOutputChannels = class extends Disposable {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.registerWebContributions();
  }
  static {
    __name(this, "WebLogOutputChannels");
  }
  registerWebContributions() {
    this.instantiationService.createInstance(LogsDataCleaner);
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: OpenWindowSessionLogFileAction.ID,
              title: OpenWindowSessionLogFileAction.TITLE,
              category: Categories.Developer,
              f1: true
            });
          }
          run(servicesAccessor) {
            return servicesAccessor.get(IInstantiationService).createInstance(
              OpenWindowSessionLogFileAction,
              OpenWindowSessionLogFileAction.ID,
              OpenWindowSessionLogFileAction.TITLE.value
            ).run();
          }
        }
      )
    );
  }
};
WebLogOutputChannels = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WebLogOutputChannels);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(WebLogOutputChannels, LifecyclePhase.Restored);
//# sourceMappingURL=logs.contribution.js.map
