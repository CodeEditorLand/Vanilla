var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import { PartsSplash } from "./partsSplash.js";
import { ISplashStorageService } from "./splash.js";
registerSingleton(
  ISplashStorageService,
  class SplashStorageService {
    static {
      __name(this, "SplashStorageService");
    }
    _serviceBrand;
    async saveWindowSplash(splash) {
      const raw = JSON.stringify(splash);
      localStorage.setItem("monaco-parts-splash", raw);
    }
  },
  InstantiationType.Delayed
);
registerWorkbenchContribution2(
  PartsSplash.ID,
  PartsSplash,
  WorkbenchPhase.BlockStartup
);
//# sourceMappingURL=splash.contribution.js.map
