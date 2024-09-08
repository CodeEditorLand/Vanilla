import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../../common/contributions.js";
import { IReplaceService } from "./replace.js";
import {
  ReplacePreviewContentProvider,
  ReplaceService
} from "./replaceService.js";
function registerContributions() {
  registerSingleton(
    IReplaceService,
    ReplaceService,
    InstantiationType.Delayed
  );
  registerWorkbenchContribution2(
    ReplacePreviewContentProvider.ID,
    ReplacePreviewContentProvider,
    WorkbenchPhase.BlockStartup
  );
}
export {
  registerContributions
};
