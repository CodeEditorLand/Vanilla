import "./localHistoryCommands.js";
import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../../common/contributions.js";
import { LocalHistoryTimeline } from "./localHistoryTimeline.js";
registerWorkbenchContribution2(
  LocalHistoryTimeline.ID,
  LocalHistoryTimeline,
  WorkbenchPhase.BlockRestore
);
