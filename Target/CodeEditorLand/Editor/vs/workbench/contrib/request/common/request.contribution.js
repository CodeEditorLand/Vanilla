import { Event } from "../../../../base/common/event.js";
import { localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions,
  IOutputService
} from "../../../services/output/common/output.js";
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.actions.showNetworkLog",
        title: localize2("showNetworkLog", "Show Network Log"),
        category: Categories.Developer,
        f1: true
      });
    }
    async run(servicesAccessor) {
      const loggerService = servicesAccessor.get(ILoggerService);
      const outputService = servicesAccessor.get(IOutputService);
      for (const logger of loggerService.getRegisteredLoggers()) {
        if (logger.id.startsWith("network-")) {
          loggerService.setVisibility(logger.id, true);
        }
      }
      if (!outputService.getChannelDescriptor("network-window")) {
        await Event.toPromise(
          Event.filter(
            Registry.as(
              Extensions.OutputChannels
            ).onDidRegisterChannel,
            (channel) => channel === "network-window"
          )
        );
      }
      outputService.showChannel("network-window");
    }
  }
);
//# sourceMappingURL=request.contribution.js.map
