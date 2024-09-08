import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../../common/contributions.js";
import { SyncScroll as ScrollLocking } from "./scrollLocking.js";
registerWorkbenchContribution2(
  ScrollLocking.ID,
  ScrollLocking,
  WorkbenchPhase.Eventually
  // registration only
);
