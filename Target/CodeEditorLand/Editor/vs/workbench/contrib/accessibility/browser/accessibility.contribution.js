import { IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions as WorkbenchExtensions,
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import {
  AccessibleViewInformationService,
  IAccessibleViewInformationService
} from "../../../services/accessibility/common/accessibleViewInformationService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { DiffEditorActiveAnnouncementContribution } from "../../accessibilitySignals/browser/openDiffEditorAnnouncement.js";
import { SaveAccessibilitySignalContribution } from "../../accessibilitySignals/browser/saveAccessibilitySignal.js";
import { SpeechAccessibilitySignalContribution } from "../../speech/browser/speechAccessibilitySignal.js";
import {
  DynamicSpeechAccessibilityConfiguration,
  registerAccessibilityConfiguration
} from "./accessibilityConfiguration.js";
import { AccessibilityStatus } from "./accessibilityStatus.js";
import { AccessibleViewService } from "./accessibleView.js";
import {
  AccesibleViewContributions,
  AccesibleViewHelpContribution
} from "./accessibleViewContributions.js";
import { EditorAccessibilityHelpContribution } from "./editorAccessibilityHelp.js";
import { ExtensionAccessibilityHelpDialogContribution } from "./extensionAccesibilityHelp.contribution.js";
import { UnfocusedViewDimmingContribution } from "./unfocusedViewDimmingContribution.js";
registerAccessibilityConfiguration();
registerSingleton(
  IAccessibleViewService,
  AccessibleViewService,
  InstantiationType.Delayed
);
registerSingleton(
  IAccessibleViewInformationService,
  AccessibleViewInformationService,
  InstantiationType.Delayed
);
const workbenchRegistry = Registry.as(
  WorkbenchExtensions.Workbench
);
workbenchRegistry.registerWorkbenchContribution(
  EditorAccessibilityHelpContribution,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  UnfocusedViewDimmingContribution,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  AccesibleViewHelpContribution,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  AccesibleViewContributions,
  LifecyclePhase.Eventually
);
registerWorkbenchContribution2(
  AccessibilityStatus.ID,
  AccessibilityStatus,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  ExtensionAccessibilityHelpDialogContribution.ID,
  ExtensionAccessibilityHelpDialogContribution,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  SaveAccessibilitySignalContribution.ID,
  SaveAccessibilitySignalContribution,
  WorkbenchPhase.AfterRestored
);
registerWorkbenchContribution2(
  SpeechAccessibilitySignalContribution.ID,
  SpeechAccessibilitySignalContribution,
  WorkbenchPhase.AfterRestored
);
registerWorkbenchContribution2(
  DiffEditorActiveAnnouncementContribution.ID,
  DiffEditorActiveAnnouncementContribution,
  WorkbenchPhase.AfterRestored
);
registerWorkbenchContribution2(
  DynamicSpeechAccessibilityConfiguration.ID,
  DynamicSpeechAccessibilityConfiguration,
  WorkbenchPhase.AfterRestored
);
