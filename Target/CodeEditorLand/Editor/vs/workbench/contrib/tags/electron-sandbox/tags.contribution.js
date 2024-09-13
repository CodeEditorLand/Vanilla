import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { WorkspaceTags } from "./workspaceTags.js";
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(WorkspaceTags, LifecyclePhase.Eventually);
//# sourceMappingURL=tags.contribution.js.map
