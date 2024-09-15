import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ILocalPtyService, TerminalIpcChannels } from "../../../../platform/terminal/common/terminal.js";
import { IWorkbenchContributionsRegistry, WorkbenchPhase, Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { ITerminalProfileResolverService } from "../common/terminal.js";
import { TerminalNativeContribution } from "./terminalNativeContribution.js";
import { ElectronTerminalProfileResolverService } from "./terminalProfileResolverService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { LocalTerminalBackendContribution } from "./localTerminalBackend.js";
registerMainProcessRemoteService(ILocalPtyService, TerminalIpcChannels.LocalPty);
registerSingleton(ITerminalProfileResolverService, ElectronTerminalProfileResolverService, InstantiationType.Delayed);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(LocalTerminalBackendContribution.ID, LocalTerminalBackendContribution, WorkbenchPhase.BlockStartup);
workbenchRegistry.registerWorkbenchContribution(TerminalNativeContribution, LifecyclePhase.Restored);
//# sourceMappingURL=terminal.contribution.js.map
