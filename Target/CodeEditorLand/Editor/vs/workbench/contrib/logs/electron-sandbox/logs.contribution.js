import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  OpenExtensionLogsFolderAction,
  OpenLogsFolderAction
} from "./logsActions.js";
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: OpenLogsFolderAction.ID,
        title: OpenLogsFolderAction.TITLE,
        category: Categories.Developer,
        f1: true
      });
    }
    run(servicesAccessor) {
      return servicesAccessor.get(IInstantiationService).createInstance(
        OpenLogsFolderAction,
        OpenLogsFolderAction.ID,
        OpenLogsFolderAction.TITLE.value
      ).run();
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: OpenExtensionLogsFolderAction.ID,
        title: OpenExtensionLogsFolderAction.TITLE,
        category: Categories.Developer,
        f1: true
      });
    }
    run(servicesAccessor) {
      return servicesAccessor.get(IInstantiationService).createInstance(
        OpenExtensionLogsFolderAction,
        OpenExtensionLogsFolderAction.ID,
        OpenExtensionLogsFolderAction.TITLE.value
      ).run();
    }
  }
);
//# sourceMappingURL=logs.contribution.js.map
