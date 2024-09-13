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
import { Disposable } from "../../../base/common/lifecycle.js";
import * as nls from "../../../nls.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import {
  Extensions as ConfigurationExtensions
} from "../../../platform/configuration/common/configurationRegistry.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../platform/log/common/log.js";
import {
  INotificationService,
  Severity
} from "../../../platform/notification/common/notification.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import {
  ITunnelService,
  TunnelProtocol
} from "../../../platform/tunnel/common/tunnel.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import { IRemoteAgentService } from "../../services/remote/common/remoteAgentService.js";
import {
  IRemoteExplorerService,
  PORT_AUTO_FORWARD_SETTING,
  PORT_AUTO_SOURCE_SETTING,
  PORT_AUTO_SOURCE_SETTING_HYBRID,
  PORT_AUTO_SOURCE_SETTING_OUTPUT
} from "../../services/remote/common/remoteExplorerService.js";
import {
  TunnelCloseReason,
  TunnelSource,
  forwardedPortsViewEnabled,
  makeAddress
} from "../../services/remote/common/tunnelModel.js";
import {
  CandidatePortSource,
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
import { TunnelDtoConverter } from "../common/extHostTunnelService.js";
let MainThreadTunnelService = class extends Disposable {
  constructor(extHostContext, remoteExplorerService, tunnelService, notificationService, configurationService, logService, remoteAgentService, contextKeyService) {
    super();
    this.remoteExplorerService = remoteExplorerService;
    this.tunnelService = tunnelService;
    this.notificationService = notificationService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.remoteAgentService = remoteAgentService;
    this.contextKeyService = contextKeyService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTunnelService);
    this._register(tunnelService.onTunnelOpened(() => this._proxy.$onDidTunnelsChange()));
    this._register(tunnelService.onTunnelClosed(() => this._proxy.$onDidTunnelsChange()));
  }
  _proxy;
  elevateionRetry = false;
  portsAttributesProviders = /* @__PURE__ */ new Map();
  processFindingEnabled() {
    return (!!this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING) || this.tunnelService.hasTunnelProvider) && this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) !== PORT_AUTO_SOURCE_SETTING_OUTPUT;
  }
  async $setRemoteTunnelService(processId) {
    this.remoteExplorerService.namedProcesses.set(
      processId,
      "Code Extension Host"
    );
    if (this.remoteExplorerService.portsFeaturesEnabled) {
      this._proxy.$registerCandidateFinder(this.processFindingEnabled());
    } else {
      this._register(
        this.remoteExplorerService.onEnabledPortsFeatures(
          () => this._proxy.$registerCandidateFinder(
            this.processFindingEnabled()
          )
        )
      );
    }
    this._register(
      this.configurationService.onDidChangeConfiguration(async (e) => {
        if (this.remoteExplorerService.portsFeaturesEnabled && (e.affectsConfiguration(PORT_AUTO_FORWARD_SETTING) || e.affectsConfiguration(PORT_AUTO_SOURCE_SETTING))) {
          return this._proxy.$registerCandidateFinder(
            this.processFindingEnabled()
          );
        }
      })
    );
    this._register(
      this.tunnelService.onAddedTunnelProvider(async () => {
        if (this.remoteExplorerService.portsFeaturesEnabled) {
          return this._proxy.$registerCandidateFinder(
            this.processFindingEnabled()
          );
        }
      })
    );
  }
  _alreadyRegistered = false;
  async $registerPortsAttributesProvider(selector, providerHandle) {
    this.portsAttributesProviders.set(providerHandle, selector);
    if (!this._alreadyRegistered) {
      this.remoteExplorerService.tunnelModel.addAttributesProvider(this);
      this._alreadyRegistered = true;
    }
  }
  async $unregisterPortsAttributesProvider(providerHandle) {
    this.portsAttributesProviders.delete(providerHandle);
  }
  async providePortAttributes(ports, pid, commandLine, token) {
    if (this.portsAttributesProviders.size === 0) {
      return [];
    }
    const appropriateHandles = Array.from(
      this.portsAttributesProviders.entries()
    ).filter((entry) => {
      const selector = entry[1];
      const portRange = typeof selector.portRange === "number" ? [selector.portRange, selector.portRange + 1] : selector.portRange;
      const portInRange = portRange ? ports.some(
        (port) => portRange[0] <= port && port < portRange[1]
      ) : true;
      const commandMatches = !selector.commandPattern || commandLine && commandLine.match(selector.commandPattern);
      return portInRange && commandMatches;
    }).map((entry) => entry[0]);
    if (appropriateHandles.length === 0) {
      return [];
    }
    return this._proxy.$providePortAttributes(
      appropriateHandles,
      ports,
      pid,
      commandLine,
      token
    );
  }
  async $openTunnel(tunnelOptions, source) {
    const tunnel = await this.remoteExplorerService.forward({
      remote: tunnelOptions.remoteAddress,
      local: tunnelOptions.localAddressPort,
      name: tunnelOptions.label,
      source: {
        source: TunnelSource.Extension,
        description: source
      },
      elevateIfNeeded: false
    });
    if (!tunnel || typeof tunnel === "string") {
      return void 0;
    }
    if (!this.elevateionRetry && tunnelOptions.localAddressPort !== void 0 && tunnel.tunnelLocalPort !== void 0 && this.tunnelService.isPortPrivileged(
      tunnelOptions.localAddressPort
    ) && tunnel.tunnelLocalPort !== tunnelOptions.localAddressPort && this.tunnelService.canElevate) {
      this.elevationPrompt(tunnelOptions, tunnel, source);
    }
    return TunnelDtoConverter.fromServiceTunnel(tunnel);
  }
  async elevationPrompt(tunnelOptions, tunnel, source) {
    return this.notificationService.prompt(
      Severity.Info,
      nls.localize(
        "remote.tunnel.openTunnel",
        "The extension {0} has forwarded port {1}. You'll need to run as superuser to use port {2} locally.",
        source,
        tunnelOptions.remoteAddress.port,
        tunnelOptions.localAddressPort
      ),
      [
        {
          label: nls.localize(
            "remote.tunnelsView.elevationButton",
            "Use Port {0} as Sudo...",
            tunnel.tunnelRemotePort
          ),
          run: /* @__PURE__ */ __name(async () => {
            this.elevateionRetry = true;
            await this.remoteExplorerService.close(
              {
                host: tunnel.tunnelRemoteHost,
                port: tunnel.tunnelRemotePort
              },
              TunnelCloseReason.Other
            );
            await this.remoteExplorerService.forward({
              remote: tunnelOptions.remoteAddress,
              local: tunnelOptions.localAddressPort,
              name: tunnelOptions.label,
              source: {
                source: TunnelSource.Extension,
                description: source
              },
              elevateIfNeeded: true
            });
            this.elevateionRetry = false;
          }, "run")
        }
      ]
    );
  }
  async $closeTunnel(remote) {
    return this.remoteExplorerService.close(
      remote,
      TunnelCloseReason.Other
    );
  }
  async $getTunnels() {
    return (await this.tunnelService.tunnels).map((tunnel) => {
      return {
        remoteAddress: {
          port: tunnel.tunnelRemotePort,
          host: tunnel.tunnelRemoteHost
        },
        localAddress: tunnel.localAddress,
        privacy: tunnel.privacy,
        protocol: tunnel.protocol
      };
    });
  }
  async $onFoundNewCandidates(candidates) {
    this.remoteExplorerService.onFoundNewCandidates(candidates);
  }
  async $setTunnelProvider(features) {
    const tunnelProvider = {
      forwardPort: /* @__PURE__ */ __name((tunnelOptions, tunnelCreationOptions) => {
        const forward = this._proxy.$forwardPort(
          tunnelOptions,
          tunnelCreationOptions
        );
        return forward.then((tunnelOrError) => {
          if (!tunnelOrError) {
            return void 0;
          } else if (typeof tunnelOrError === "string") {
            return tunnelOrError;
          }
          const tunnel = tunnelOrError;
          this.logService.trace(
            `ForwardedPorts: (MainThreadTunnelService) New tunnel established by tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`
          );
          return {
            tunnelRemotePort: tunnel.remoteAddress.port,
            tunnelRemoteHost: tunnel.remoteAddress.host,
            localAddress: typeof tunnel.localAddress === "string" ? tunnel.localAddress : makeAddress(
              tunnel.localAddress.host,
              tunnel.localAddress.port
            ),
            tunnelLocalPort: typeof tunnel.localAddress !== "string" ? tunnel.localAddress.port : void 0,
            public: tunnel.public,
            privacy: tunnel.privacy,
            protocol: tunnel.protocol ?? TunnelProtocol.Http,
            dispose: /* @__PURE__ */ __name(async (silent) => {
              this.logService.trace(
                `ForwardedPorts: (MainThreadTunnelService) Closing tunnel from tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`
              );
              return this._proxy.$closeTunnel(
                {
                  host: tunnel.remoteAddress.host,
                  port: tunnel.remoteAddress.port
                },
                silent
              );
            }, "dispose")
          };
        });
      }, "forwardPort")
    };
    if (features) {
      this.tunnelService.setTunnelFeatures(features);
    }
    this.tunnelService.setTunnelProvider(tunnelProvider);
    this.contextKeyService.createKey(forwardedPortsViewEnabled.key, true);
  }
  async $setCandidateFilter() {
    this.remoteExplorerService.setCandidateFilter(
      (candidates) => {
        return this._proxy.$applyCandidateFilter(candidates);
      }
    );
  }
  async $setCandidatePortSource(source) {
    this.remoteAgentService.getEnvironment().then(() => {
      switch (source) {
        case CandidatePortSource.None: {
          Registry.as(
            ConfigurationExtensions.Configuration
          ).registerDefaultConfigurations([
            { overrides: { "remote.autoForwardPorts": false } }
          ]);
          break;
        }
        case CandidatePortSource.Output: {
          Registry.as(
            ConfigurationExtensions.Configuration
          ).registerDefaultConfigurations([
            {
              overrides: {
                "remote.autoForwardPortsSource": PORT_AUTO_SOURCE_SETTING_OUTPUT
              }
            }
          ]);
          break;
        }
        case CandidatePortSource.Hybrid: {
          Registry.as(
            ConfigurationExtensions.Configuration
          ).registerDefaultConfigurations([
            {
              overrides: {
                "remote.autoForwardPortsSource": PORT_AUTO_SOURCE_SETTING_HYBRID
              }
            }
          ]);
          break;
        }
        default:
      }
    }).catch(() => {
    });
  }
};
__name(MainThreadTunnelService, "MainThreadTunnelService");
MainThreadTunnelService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTunnelService),
  __decorateParam(1, IRemoteExplorerService),
  __decorateParam(2, ITunnelService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IRemoteAgentService),
  __decorateParam(7, IContextKeyService)
], MainThreadTunnelService);
export {
  MainThreadTunnelService
};
//# sourceMappingURL=mainThreadTunnelService.js.map
