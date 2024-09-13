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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable,
  toDisposable
} from "../../../base/common/lifecycle.js";
import * as nls from "../../../nls.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import {
  DisposableTunnel,
  TunnelPrivacyId
} from "../../../platform/tunnel/common/tunnel.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import * as types from "./extHostTypes.js";
class ExtensionTunnel extends DisposableTunnel {
  static {
    __name(this, "ExtensionTunnel");
  }
}
var TunnelDtoConverter;
((TunnelDtoConverter2) => {
  function fromApiTunnel(tunnel) {
    return {
      remoteAddress: tunnel.remoteAddress,
      localAddress: tunnel.localAddress,
      public: !!tunnel.public,
      privacy: tunnel.privacy ?? (tunnel.public ? TunnelPrivacyId.Public : TunnelPrivacyId.Private),
      protocol: tunnel.protocol
    };
  }
  TunnelDtoConverter2.fromApiTunnel = fromApiTunnel;
  __name(fromApiTunnel, "fromApiTunnel");
  function fromServiceTunnel(tunnel) {
    return {
      remoteAddress: {
        host: tunnel.tunnelRemoteHost,
        port: tunnel.tunnelRemotePort
      },
      localAddress: tunnel.localAddress,
      public: tunnel.privacy !== TunnelPrivacyId.ConstantPrivate && tunnel.privacy !== TunnelPrivacyId.ConstantPrivate,
      privacy: tunnel.privacy,
      protocol: tunnel.protocol
    };
  }
  TunnelDtoConverter2.fromServiceTunnel = fromServiceTunnel;
  __name(fromServiceTunnel, "fromServiceTunnel");
})(TunnelDtoConverter || (TunnelDtoConverter = {}));
const IExtHostTunnelService = createDecorator(
  "IExtHostTunnelService"
);
let ExtHostTunnelService = class extends Disposable {
  constructor(extHostRpc, initData, logService) {
    super();
    this.logService = logService;
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadTunnelService);
  }
  static {
    __name(this, "ExtHostTunnelService");
  }
  _serviceBrand;
  _proxy;
  _forwardPortProvider;
  _showCandidatePort = /* @__PURE__ */ __name(() => {
    return Promise.resolve(true);
  }, "_showCandidatePort");
  _extensionTunnels = /* @__PURE__ */ new Map();
  _onDidChangeTunnels = new Emitter();
  onDidChangeTunnels = this._onDidChangeTunnels.event;
  _providerHandleCounter = 0;
  _portAttributesProviders = /* @__PURE__ */ new Map();
  async openTunnel(extension, forward) {
    this.logService.trace(
      `ForwardedPorts: (ExtHostTunnelService) ${extension.identifier.value} called openTunnel API for ${forward.remoteAddress.host}:${forward.remoteAddress.port}.`
    );
    const tunnel = await this._proxy.$openTunnel(
      forward,
      extension.displayName
    );
    if (tunnel) {
      const disposableTunnel = new ExtensionTunnel(
        tunnel.remoteAddress,
        tunnel.localAddress,
        () => {
          return this._proxy.$closeTunnel(tunnel.remoteAddress);
        }
      );
      this._register(disposableTunnel);
      return disposableTunnel;
    }
    return void 0;
  }
  async getTunnels() {
    return this._proxy.$getTunnels();
  }
  nextPortAttributesProviderHandle() {
    return this._providerHandleCounter++;
  }
  registerPortsAttributesProvider(portSelector, provider) {
    if (portSelector.portRange === void 0 && portSelector.commandPattern === void 0) {
      this.logService.error(
        "PortAttributesProvider must specify either a portRange or a commandPattern"
      );
    }
    const providerHandle = this.nextPortAttributesProviderHandle();
    this._portAttributesProviders.set(providerHandle, {
      selector: portSelector,
      provider
    });
    this._proxy.$registerPortsAttributesProvider(
      portSelector,
      providerHandle
    );
    return new types.Disposable(() => {
      this._portAttributesProviders.delete(providerHandle);
      this._proxy.$unregisterPortsAttributesProvider(providerHandle);
    });
  }
  async $providePortAttributes(handles, ports, pid, commandLine, cancellationToken) {
    const providedAttributes = [];
    for (const handle of handles) {
      const provider = this._portAttributesProviders.get(handle);
      if (!provider) {
        return [];
      }
      providedAttributes.push(
        ...await Promise.all(
          ports.map(async (port) => {
            let providedAttributes2;
            try {
              providedAttributes2 = await provider.provider.providePortAttributes(
                { port, pid, commandLine },
                cancellationToken
              );
            } catch (e) {
              providedAttributes2 = await provider.provider.providePortAttributes(port, pid, commandLine, cancellationToken);
            }
            return { providedAttributes: providedAttributes2, port };
          })
        )
      );
    }
    const allAttributes = providedAttributes.filter(
      (attribute) => !!attribute.providedAttributes
    );
    return allAttributes.length > 0 ? allAttributes.map((attributes) => {
      return {
        autoForwardAction: attributes.providedAttributes.autoForwardAction,
        port: attributes.port
      };
    }) : [];
  }
  async $registerCandidateFinder(_enable) {
  }
  registerTunnelProvider(provider, information) {
    if (this._forwardPortProvider) {
      throw new Error(
        "A tunnel provider has already been registered. Only the first tunnel provider to be registered will be used."
      );
    }
    this._forwardPortProvider = async (tunnelOptions, tunnelCreationOptions) => {
      const result = await provider.provideTunnel(
        tunnelOptions,
        tunnelCreationOptions,
        CancellationToken.None
      );
      return result ?? void 0;
    };
    const tunnelFeatures = information.tunnelFeatures ? {
      elevation: !!information.tunnelFeatures?.elevation,
      privacyOptions: information.tunnelFeatures?.privacyOptions,
      protocol: information.tunnelFeatures.protocol === void 0 ? true : information.tunnelFeatures.protocol
    } : void 0;
    this._proxy.$setTunnelProvider(tunnelFeatures, true);
    return Promise.resolve(
      toDisposable(() => {
        this._forwardPortProvider = void 0;
        this._proxy.$setTunnelProvider(void 0, false);
      })
    );
  }
  /**
   * Applies the tunnel metadata and factory found in the remote authority
   * resolver to the tunnel system.
   *
   * `managedRemoteAuthority` should be be passed if the resolver returned on.
   * If this is the case, the tunnel cannot be connected to via a websocket from
   * the share process, so a synethic tunnel factory is used as a default.
   */
  async setTunnelFactory(provider, managedRemoteAuthority) {
    if (provider) {
      if (provider.candidatePortSource !== void 0) {
        this._proxy.$setCandidatePortSource(
          provider.candidatePortSource
        );
      }
      if (provider.showCandidatePort) {
        this._showCandidatePort = provider.showCandidatePort;
        this._proxy.$setCandidateFilter();
      }
      const tunnelFactory = provider.tunnelFactory ?? (managedRemoteAuthority ? this.makeManagedTunnelFactory(managedRemoteAuthority) : void 0);
      if (tunnelFactory) {
        this._forwardPortProvider = tunnelFactory;
        let privacyOptions = provider.tunnelFeatures?.privacyOptions ?? [];
        if (provider.tunnelFeatures?.public && privacyOptions.length === 0) {
          privacyOptions = [
            {
              id: "private",
              label: nls.localize(
                "tunnelPrivacy.private",
                "Private"
              ),
              themeIcon: "lock"
            },
            {
              id: "public",
              label: nls.localize(
                "tunnelPrivacy.public",
                "Public"
              ),
              themeIcon: "eye"
            }
          ];
        }
        const tunnelFeatures = provider.tunnelFeatures ? {
          elevation: !!provider.tunnelFeatures?.elevation,
          public: !!provider.tunnelFeatures?.public,
          privacyOptions,
          protocol: true
        } : void 0;
        this._proxy.$setTunnelProvider(
          tunnelFeatures,
          !!provider.tunnelFactory
        );
      }
    } else {
      this._forwardPortProvider = void 0;
    }
    return toDisposable(() => {
      this._forwardPortProvider = void 0;
    });
  }
  makeManagedTunnelFactory(_authority) {
    return void 0;
  }
  async $closeTunnel(remote, silent) {
    if (this._extensionTunnels.has(remote.host)) {
      const hostMap = this._extensionTunnels.get(remote.host);
      if (hostMap.has(remote.port)) {
        if (silent) {
          hostMap.get(remote.port).disposeListener.dispose();
        }
        await hostMap.get(remote.port).tunnel.dispose();
        hostMap.delete(remote.port);
      }
    }
  }
  async $onDidTunnelsChange() {
    this._onDidChangeTunnels.fire();
  }
  async $forwardPort(tunnelOptions, tunnelCreationOptions) {
    if (this._forwardPortProvider) {
      try {
        this.logService.trace(
          "ForwardedPorts: (ExtHostTunnelService) Getting tunnel from provider."
        );
        const providedPort = this._forwardPortProvider(
          tunnelOptions,
          tunnelCreationOptions
        );
        this.logService.trace(
          "ForwardedPorts: (ExtHostTunnelService) Got tunnel promise from provider."
        );
        if (providedPort !== void 0) {
          const tunnel = await providedPort;
          this.logService.trace(
            "ForwardedPorts: (ExtHostTunnelService) Successfully awaited tunnel from provider."
          );
          if (tunnel === void 0) {
            this.logService.error(
              "ForwardedPorts: (ExtHostTunnelService) Resolved tunnel is undefined"
            );
            return void 0;
          }
          if (!this._extensionTunnels.has(
            tunnelOptions.remoteAddress.host
          )) {
            this._extensionTunnels.set(
              tunnelOptions.remoteAddress.host,
              /* @__PURE__ */ new Map()
            );
          }
          const disposeListener = this._register(
            tunnel.onDidDispose(() => {
              this.logService.trace(
                "ForwardedPorts: (ExtHostTunnelService) Extension fired tunnel's onDidDispose."
              );
              return this._proxy.$closeTunnel(
                tunnel.remoteAddress
              );
            })
          );
          this._extensionTunnels.get(tunnelOptions.remoteAddress.host).set(tunnelOptions.remoteAddress.port, {
            tunnel,
            disposeListener
          });
          return TunnelDtoConverter.fromApiTunnel(tunnel);
        } else {
          this.logService.trace(
            "ForwardedPorts: (ExtHostTunnelService) Tunnel is undefined"
          );
        }
      } catch (e) {
        this.logService.trace(
          "ForwardedPorts: (ExtHostTunnelService) tunnel provider error"
        );
        if (e instanceof Error) {
          return e.message;
        }
      }
    }
    return void 0;
  }
  async $applyCandidateFilter(candidates) {
    const filter = await Promise.all(
      candidates.map(
        (candidate) => this._showCandidatePort(
          candidate.host,
          candidate.port,
          candidate.detail ?? ""
        )
      )
    );
    const result = candidates.filter((candidate, index) => filter[index]);
    this.logService.trace(
      `ForwardedPorts: (ExtHostTunnelService) filtered from ${candidates.map((port) => port.port).join(", ")} to ${result.map((port) => port.port).join(", ")}`
    );
    return result;
  }
};
ExtHostTunnelService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, ILogService)
], ExtHostTunnelService);
export {
  ExtHostTunnelService,
  IExtHostTunnelService,
  TunnelDtoConverter
};
//# sourceMappingURL=extHostTunnelService.js.map
