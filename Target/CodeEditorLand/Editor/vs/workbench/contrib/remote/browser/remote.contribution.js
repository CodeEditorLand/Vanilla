import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  registerWorkbenchContribution2,
  Extensions as WorkbenchExtensions,
  WorkbenchPhase
} from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import {
  RemoteAgentConnectionStatusListener,
  RemoteMarkers
} from "./remote.js";
import { InitialRemoteConnectionHealthContribution } from "./remoteConnectionHealth.js";
import {
  AutomaticPortForwarding,
  ForwardedPortsView,
  PortRestore
} from "./remoteExplorer.js";
import { RemoteStatusIndicator } from "./remoteIndicator.js";
import { ShowCandidateContribution } from "./showCandidate.js";
import { TunnelFactoryContribution } from "./tunnelFactory.js";
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(
  ShowCandidateContribution.ID,
  ShowCandidateContribution,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  TunnelFactoryContribution.ID,
  TunnelFactoryContribution,
  WorkbenchPhase.BlockRestore
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  RemoteAgentConnectionStatusListener,
  LifecyclePhase.Eventually
);
registerWorkbenchContribution2(
  RemoteStatusIndicator.ID,
  RemoteStatusIndicator,
  WorkbenchPhase.BlockStartup
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  ForwardedPortsView,
  LifecyclePhase.Restored
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  PortRestore,
  LifecyclePhase.Eventually
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  AutomaticPortForwarding,
  LifecyclePhase.Eventually
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  RemoteMarkers,
  LifecyclePhase.Eventually
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  InitialRemoteConnectionHealthContribution,
  LifecyclePhase.Restored
);
