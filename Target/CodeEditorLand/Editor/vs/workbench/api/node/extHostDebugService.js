var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import {
  createCancelablePromise,
  firstParallel,
  timeout
} from "../../../base/common/async.js";
import * as platform from "../../../base/common/platform.js";
import * as nls from "../../../nls.js";
import {
  LinuxExternalTerminalService,
  MacExternalTerminalService,
  WindowsExternalTerminalService
} from "../../../platform/externalTerminal/node/externalTerminalService.js";
import { SignService } from "../../../platform/sign/node/signService.js";
import {
  ExecutableDebugAdapter,
  NamedPipeDebugAdapter,
  SocketDebugAdapter
} from "../../contrib/debug/node/debugAdapter.js";
import {
  hasChildProcesses,
  prepareCommand
} from "../../contrib/debug/node/terminals.js";
import { IExtHostCommands } from "../common/extHostCommands.js";
import {
  IExtHostConfiguration
} from "../common/extHostConfiguration.js";
import {
  ExtHostDebugServiceBase
} from "../common/extHostDebugService.js";
import { IExtHostEditorTabs } from "../common/extHostEditorTabs.js";
import { IExtHostExtensionService } from "../common/extHostExtensionService.js";
import { IExtHostRpcService } from "../common/extHostRpcService.js";
import { IExtHostTerminalService } from "../common/extHostTerminalService.js";
import { IExtHostTesting } from "../common/extHostTesting.js";
import {
  DebugAdapterExecutable,
  DebugAdapterNamedPipeServer,
  DebugAdapterServer,
  ThemeIcon
} from "../common/extHostTypes.js";
import { IExtHostVariableResolverProvider } from "../common/extHostVariableResolverService.js";
import { IExtHostWorkspace } from "../common/extHostWorkspace.js";
let ExtHostDebugService = class extends ExtHostDebugServiceBase {
  constructor(extHostRpcService, workspaceService, extensionService, configurationService, _terminalService, editorTabs, variableResolver, commands, testing) {
    super(
      extHostRpcService,
      workspaceService,
      extensionService,
      configurationService,
      editorTabs,
      variableResolver,
      commands,
      testing
    );
    this._terminalService = _terminalService;
  }
  static {
    __name(this, "ExtHostDebugService");
  }
  _serviceBrand;
  _integratedTerminalInstances = new DebugTerminalCollection();
  _terminalDisposedListener;
  createDebugAdapter(adapter, session) {
    if (adapter instanceof DebugAdapterExecutable) {
      return new ExecutableDebugAdapter(
        this.convertExecutableToDto(adapter),
        session.type
      );
    } else if (adapter instanceof DebugAdapterServer) {
      return new SocketDebugAdapter(this.convertServerToDto(adapter));
    } else if (adapter instanceof DebugAdapterNamedPipeServer) {
      return new NamedPipeDebugAdapter(
        this.convertPipeServerToDto(adapter)
      );
    } else {
      return super.createDebugAdapter(adapter, session);
    }
  }
  daExecutableFromPackage(session, extensionRegistry) {
    const dae = ExecutableDebugAdapter.platformAdapterExecutable(
      extensionRegistry.getAllExtensionDescriptions(),
      session.type
    );
    if (dae) {
      return new DebugAdapterExecutable(
        dae.command,
        dae.args,
        dae.options
      );
    }
    return void 0;
  }
  createSignService() {
    return new SignService();
  }
  async $runInTerminal(args, sessionId) {
    if (args.kind === "integrated") {
      if (!this._terminalDisposedListener) {
        this._terminalDisposedListener = this._register(
          this._terminalService.onDidCloseTerminal((terminal2) => {
            this._integratedTerminalInstances.onTerminalClosed(
              terminal2
            );
          })
        );
      }
      const configProvider = await this._configurationService.getConfigProvider();
      const shell = this._terminalService.getDefaultShell(true);
      const shellArgs = this._terminalService.getDefaultShellArgs(true);
      const terminalName = args.title || nls.localize("debug.terminal.title", "Debug Process");
      const shellConfig = JSON.stringify({ shell, shellArgs });
      let terminal = await this._integratedTerminalInstances.checkout(
        shellConfig,
        terminalName
      );
      let cwdForPrepareCommand;
      let giveShellTimeToInitialize = false;
      if (terminal) {
        cwdForPrepareCommand = args.cwd;
      } else {
        const options = {
          shellPath: shell,
          shellArgs,
          cwd: args.cwd,
          name: terminalName,
          iconPath: new ThemeIcon("debug")
        };
        giveShellTimeToInitialize = true;
        terminal = this._terminalService.createTerminalFromOptions(
          options,
          {
            isFeatureTerminal: true,
            // Since debug termnials are REPLs, we want shell integration to be enabled.
            // Ignore isFeatureTerminal when evaluating shell integration enablement.
            forceShellIntegration: true,
            useShellEnvironment: true
          }
        );
        this._integratedTerminalInstances.insert(terminal, shellConfig);
      }
      terminal.show(true);
      const shellProcessId = await terminal.processId;
      if (giveShellTimeToInitialize) {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      } else {
        if (terminal.state.isInteractedWith) {
          terminal.sendText("");
          await timeout(200);
        }
        if (configProvider.getConfiguration("debug.terminal").get("clearBeforeReusing")) {
          if (shell.indexOf("powershell") >= 0 || shell.indexOf("pwsh") >= 0 || shell.indexOf("cmd.exe") >= 0) {
            terminal.sendText("cls");
          } else if (shell.indexOf("bash") >= 0) {
            terminal.sendText("clear");
          } else if (platform.isWindows) {
            terminal.sendText("cls");
          } else {
            terminal.sendText("clear");
          }
        }
      }
      const command = prepareCommand(
        shell,
        args.args,
        !!args.argsCanBeInterpretedByShell,
        cwdForPrepareCommand,
        args.env
      );
      terminal.sendText(command);
      const sessionListener = this.onDidTerminateDebugSession((s) => {
        if (s.id === sessionId) {
          this._integratedTerminalInstances.free(terminal);
          sessionListener.dispose();
        }
      });
      return shellProcessId;
    } else if (args.kind === "external") {
      return runInExternalTerminal(
        args,
        await this._configurationService.getConfigProvider()
      );
    }
    return super.$runInTerminal(args, sessionId);
  }
};
ExtHostDebugService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostWorkspace),
  __decorateParam(2, IExtHostExtensionService),
  __decorateParam(3, IExtHostConfiguration),
  __decorateParam(4, IExtHostTerminalService),
  __decorateParam(5, IExtHostEditorTabs),
  __decorateParam(6, IExtHostVariableResolverProvider),
  __decorateParam(7, IExtHostCommands),
  __decorateParam(8, IExtHostTesting)
], ExtHostDebugService);
let externalTerminalService;
function runInExternalTerminal(args, configProvider) {
  if (!externalTerminalService) {
    if (platform.isWindows) {
      externalTerminalService = new WindowsExternalTerminalService();
    } else if (platform.isMacintosh) {
      externalTerminalService = new MacExternalTerminalService();
    } else if (platform.isLinux) {
      externalTerminalService = new LinuxExternalTerminalService();
    } else {
      throw new Error(
        "external terminals not supported on this platform"
      );
    }
  }
  const config = configProvider.getConfiguration("terminal");
  return externalTerminalService.runInTerminal(
    args.title,
    args.cwd,
    args.args,
    args.env || {},
    config.external || {}
  );
}
__name(runInExternalTerminal, "runInExternalTerminal");
class DebugTerminalCollection {
  static {
    __name(this, "DebugTerminalCollection");
  }
  /**
   * Delay before a new terminal is a candidate for reuse. See #71850
   */
  static minUseDelay = 1e3;
  _terminalInstances = /* @__PURE__ */ new Map();
  async checkout(config, name, cleanupOthersByName = false) {
    const entries = [...this._terminalInstances.entries()];
    const promises = entries.map(
      ([terminal, termInfo]) => createCancelablePromise(async (ct) => {
        if (terminal.name !== name) {
          return null;
        }
        if (termInfo.lastUsedAt !== -1 && await hasChildProcesses(await terminal.processId)) {
          return null;
        }
        const now = Date.now();
        if (termInfo.lastUsedAt + DebugTerminalCollection.minUseDelay > now || ct.isCancellationRequested) {
          return null;
        }
        if (termInfo.config !== config) {
          if (cleanupOthersByName) {
            terminal.dispose();
          }
          return null;
        }
        termInfo.lastUsedAt = now;
        return terminal;
      })
    );
    return await firstParallel(promises, (t) => !!t);
  }
  insert(terminal, termConfig) {
    this._terminalInstances.set(terminal, {
      lastUsedAt: Date.now(),
      config: termConfig
    });
  }
  free(terminal) {
    const info = this._terminalInstances.get(terminal);
    if (info) {
      info.lastUsedAt = -1;
    }
  }
  onTerminalClosed(terminal) {
    this._terminalInstances.delete(terminal);
  }
}
export {
  ExtHostDebugService
};
//# sourceMappingURL=extHostDebugService.js.map
