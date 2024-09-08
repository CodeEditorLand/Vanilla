var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { DomEmitter } from "../../../../base/browser/event.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { retry, RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  MarkdownString
} from "../../../../base/common/htmlContent.js";
import { getCodiconAriaLabel } from "../../../../base/common/iconLabels.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import {
  isWeb,
  platform,
  PlatformToString
} from "../../../../base/common/platform.js";
import { truncate } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import {
  Action2,
  IMenuService,
  MenuId,
  MenuItemAction,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  Extensions as ConfigurationExtensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT,
  IExtensionGalleryService,
  IExtensionManagementService
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { PersistentConnectionEventType } from "../../../../platform/remote/common/remoteAgentConnection.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { getRemoteName } from "../../../../platform/remote/common/remoteHosts.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { getVirtualWorkspaceLocation } from "../../../../platform/workspace/common/virtualWorkspace.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ReloadWindowAction } from "../../../browser/actions/windowActions.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import {
  RemoteNameContext,
  VirtualWorkspaceContext
} from "../../../common/contextkeys.js";
import { ViewContainerLocation } from "../../../common/views.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import {
  IRemoteAgentService,
  remoteConnectionLatencyMeasurer
} from "../../../services/remote/common/remoteAgentService.js";
import {
  IStatusbarService,
  StatusbarAlignment
} from "../../../services/statusbar/browser/statusbar.js";
import { infoIcon } from "../../extensions/browser/extensionsIcons.js";
import {
  LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
  VIEWLET_ID
} from "../../extensions/common/extensions.js";
let RemoteStatusIndicator = class extends Disposable {
  constructor(statusbarService, environmentService, labelService, contextKeyService, menuService, quickInputService, commandService, extensionService, remoteAgentService, remoteAuthorityResolverService, hostService, workspaceContextService, logService, extensionGalleryService, telemetryService, productService, extensionManagementService, openerService, configurationService) {
    super();
    this.statusbarService = statusbarService;
    this.environmentService = environmentService;
    this.labelService = labelService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.extensionService = extensionService;
    this.remoteAgentService = remoteAgentService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.hostService = hostService;
    this.workspaceContextService = workspaceContextService;
    this.logService = logService;
    this.extensionGalleryService = extensionGalleryService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.extensionManagementService = extensionManagementService;
    this.openerService = openerService;
    this.configurationService = configurationService;
    if (this.remoteAuthority) {
      this.connectionState = "initializing";
      this.connectionStateContextKey.set(this.connectionState);
    } else {
      this.updateVirtualWorkspaceLocation();
    }
    this.registerActions();
    this.registerListeners();
    this.updateWhenInstalledExtensionsRegistered();
    this.updateRemoteStatusIndicator();
  }
  static ID = "workbench.contrib.remoteStatusIndicator";
  static REMOTE_ACTIONS_COMMAND_ID = "workbench.action.remote.showMenu";
  static CLOSE_REMOTE_COMMAND_ID = "workbench.action.remote.close";
  static SHOW_CLOSE_REMOTE_COMMAND_ID = !isWeb;
  // web does not have a "Close Remote" command
  static INSTALL_REMOTE_EXTENSIONS_ID = "workbench.action.remote.extensions";
  static REMOTE_STATUS_LABEL_MAX_LENGTH = 40;
  static REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY = 60 * 1e3;
  static REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY = 10 * 1e3;
  remoteStatusEntry;
  legacyIndicatorMenu = this._register(
    this.menuService.createMenu(
      MenuId.StatusBarWindowIndicatorMenu,
      this.contextKeyService
    )
  );
  // to be removed once migration completed
  remoteIndicatorMenu = this._register(
    this.menuService.createMenu(
      MenuId.StatusBarRemoteIndicatorMenu,
      this.contextKeyService
    )
  );
  remoteMenuActionsGroups;
  remoteAuthority = this.environmentService.remoteAuthority;
  virtualWorkspaceLocation = void 0;
  connectionState = void 0;
  connectionToken = void 0;
  connectionStateContextKey = new RawContextKey("remoteConnectionState", "").bindTo(this.contextKeyService);
  networkState = void 0;
  measureNetworkConnectionLatencyScheduler = void 0;
  loggedInvalidGroupNames = /* @__PURE__ */ Object.create(null);
  _remoteExtensionMetadata = void 0;
  get remoteExtensionMetadata() {
    if (!this._remoteExtensionMetadata) {
      const remoteExtensionTips = {
        ...this.productService.remoteExtensionTips,
        ...this.productService.virtualWorkspaceExtensionTips
      };
      this._remoteExtensionMetadata = Object.values(remoteExtensionTips).filter((value) => value.startEntry !== void 0).map((value) => {
        return {
          id: value.extensionId,
          installed: false,
          friendlyName: value.friendlyName,
          isPlatformCompatible: false,
          dependencies: [],
          helpLink: value.startEntry?.helpLink ?? "",
          startConnectLabel: value.startEntry?.startConnectLabel ?? "",
          startCommand: value.startEntry?.startCommand ?? "",
          priority: value.startEntry?.priority ?? 10,
          supportedPlatforms: value.supportedPlatforms
        };
      });
      this.remoteExtensionMetadata.sort(
        (ext1, ext2) => ext1.priority - ext2.priority
      );
    }
    return this._remoteExtensionMetadata;
  }
  remoteMetadataInitialized = false;
  _onDidChangeEntries = this._register(new Emitter());
  onDidChangeEntries = this._onDidChangeEntries.event;
  registerActions() {
    const category = nls.localize2("remote.category", "Remote");
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID,
              category,
              title: nls.localize2(
                "remote.showMenu",
                "Show Remote Menu"
              ),
              f1: true,
              keybinding: {
                weight: KeybindingWeight.WorkbenchContrib,
                primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyO
              }
            });
          }
          run = () => this.showRemoteMenu();
        }
      )
    );
    if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID) {
      this._register(
        registerAction2(
          class extends Action2 {
            constructor() {
              super({
                id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                category,
                title: nls.localize2(
                  "remote.close",
                  "Close Remote Connection"
                ),
                f1: true,
                precondition: ContextKeyExpr.or(
                  RemoteNameContext,
                  VirtualWorkspaceContext
                )
              });
            }
            run = () => this.hostService.openWindow({
              forceReuseWindow: true,
              remoteAuthority: null
            });
          }
        )
      );
      if (this.remoteAuthority) {
        MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
          group: "6_close",
          command: {
            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
            title: nls.localize(
              {
                key: "miCloseRemote",
                comment: ["&& denotes a mnemonic"]
              },
              "Close Re&&mote Connection"
            )
          },
          order: 3.5
        });
      }
    }
    if (this.extensionGalleryService.isEnabled()) {
      this._register(
        registerAction2(
          class extends Action2 {
            constructor() {
              super({
                id: RemoteStatusIndicator.INSTALL_REMOTE_EXTENSIONS_ID,
                category,
                title: nls.localize2(
                  "remote.install",
                  "Install Remote Development Extensions"
                ),
                f1: true
              });
            }
            run = (accessor, input) => {
              const paneCompositeService = accessor.get(
                IPaneCompositePartService
              );
              return paneCompositeService.openPaneComposite(
                VIEWLET_ID,
                ViewContainerLocation.Sidebar,
                true
              ).then((viewlet) => {
                if (viewlet) {
                  (viewlet?.getViewPaneContainer()).search(`@recommended:remotes`);
                  viewlet.focus();
                }
              });
            };
          }
        )
      );
    }
  }
  registerListeners() {
    const updateRemoteActions = () => {
      this.remoteMenuActionsGroups = void 0;
      this.updateRemoteStatusIndicator();
    };
    this._register(
      this.legacyIndicatorMenu.onDidChange(updateRemoteActions)
    );
    this._register(
      this.remoteIndicatorMenu.onDidChange(updateRemoteActions)
    );
    this._register(
      this.labelService.onDidChangeFormatters(
        () => this.updateRemoteStatusIndicator()
      )
    );
    const remoteIndicator = this.environmentService.options?.windowIndicator;
    if (remoteIndicator && remoteIndicator.onDidChange) {
      this._register(
        remoteIndicator.onDidChange(
          () => this.updateRemoteStatusIndicator()
        )
      );
    }
    if (this.remoteAuthority) {
      const connection = this.remoteAgentService.getConnection();
      if (connection) {
        this._register(
          connection.onDidStateChange((e) => {
            switch (e.type) {
              case PersistentConnectionEventType.ConnectionLost:
              case PersistentConnectionEventType.ReconnectionRunning:
              case PersistentConnectionEventType.ReconnectionWait:
                this.setConnectionState("reconnecting");
                break;
              case PersistentConnectionEventType.ReconnectionPermanentFailure:
                this.setConnectionState("disconnected");
                break;
              case PersistentConnectionEventType.ConnectionGain:
                this.setConnectionState("connected");
                break;
            }
          })
        );
      }
    } else {
      this._register(
        this.workspaceContextService.onDidChangeWorkbenchState(() => {
          this.updateVirtualWorkspaceLocation();
          this.updateRemoteStatusIndicator();
        })
      );
    }
    if (isWeb) {
      this._register(
        Event.any(
          this._register(new DomEmitter(mainWindow, "online")).event,
          this._register(new DomEmitter(mainWindow, "offline")).event
        )(
          () => this.setNetworkState(
            navigator.onLine ? "online" : "offline"
          )
        )
      );
    }
    this._register(
      this.extensionService.onDidChangeExtensions(async (result) => {
        for (const ext of result.added) {
          const index = this.remoteExtensionMetadata.findIndex(
            (value) => ExtensionIdentifier.equals(
              value.id,
              ext.identifier
            )
          );
          if (index > -1) {
            this.remoteExtensionMetadata[index].installed = true;
          }
        }
      })
    );
    this._register(
      this.extensionManagementService.onDidUninstallExtension(
        async (result) => {
          const index = this.remoteExtensionMetadata.findIndex(
            (value) => ExtensionIdentifier.equals(
              value.id,
              result.identifier.id
            )
          );
          if (index > -1) {
            this.remoteExtensionMetadata[index].installed = false;
          }
        }
      )
    );
  }
  async initializeRemoteMetadata() {
    if (this.remoteMetadataInitialized) {
      return;
    }
    const currentPlatform = PlatformToString(platform);
    for (let i = 0; i < this.remoteExtensionMetadata.length; i++) {
      const extensionId = this.remoteExtensionMetadata[i].id;
      const supportedPlatforms = this.remoteExtensionMetadata[i].supportedPlatforms;
      const isInstalled = (await this.extensionManagementService.getInstalled()).find(
        (value) => ExtensionIdentifier.equals(value.identifier.id, extensionId)
      ) ? true : false;
      this.remoteExtensionMetadata[i].installed = isInstalled;
      if (isInstalled) {
        this.remoteExtensionMetadata[i].isPlatformCompatible = true;
      } else if (supportedPlatforms && !supportedPlatforms.includes(currentPlatform)) {
        this.remoteExtensionMetadata[i].isPlatformCompatible = false;
      } else {
        this.remoteExtensionMetadata[i].isPlatformCompatible = true;
      }
    }
    this.remoteMetadataInitialized = true;
    this._onDidChangeEntries.fire();
    this.updateRemoteStatusIndicator();
  }
  updateVirtualWorkspaceLocation() {
    this.virtualWorkspaceLocation = getVirtualWorkspaceLocation(
      this.workspaceContextService.getWorkspace()
    );
  }
  async updateWhenInstalledExtensionsRegistered() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const remoteAuthority = this.remoteAuthority;
    if (remoteAuthority) {
      (async () => {
        try {
          const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(
            remoteAuthority
          );
          this.connectionToken = authority.connectionToken;
          this.setConnectionState("connected");
        } catch (error) {
          this.setConnectionState("disconnected");
        }
      })();
    }
    this.updateRemoteStatusIndicator();
    this.initializeRemoteMetadata();
  }
  setConnectionState(newState) {
    if (this.connectionState !== newState) {
      this.connectionState = newState;
      if (this.connectionState === "reconnecting") {
        this.connectionStateContextKey.set("disconnected");
      } else {
        this.connectionStateContextKey.set(this.connectionState);
      }
      this.updateRemoteStatusIndicator();
      if (newState === "connected") {
        this.scheduleMeasureNetworkConnectionLatency();
      }
    }
  }
  scheduleMeasureNetworkConnectionLatency() {
    if (!this.remoteAuthority || // only when having a remote connection
    this.measureNetworkConnectionLatencyScheduler) {
      return;
    }
    this.measureNetworkConnectionLatencyScheduler = this._register(
      new RunOnceScheduler(
        () => this.measureNetworkConnectionLatency(),
        RemoteStatusIndicator.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY
      )
    );
    this.measureNetworkConnectionLatencyScheduler.schedule(
      RemoteStatusIndicator.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY
    );
  }
  async measureNetworkConnectionLatency() {
    if (this.hostService.hasFocus && this.networkState !== "offline") {
      const measurement = await remoteConnectionLatencyMeasurer.measure(
        this.remoteAgentService
      );
      if (measurement) {
        if (measurement.high) {
          this.setNetworkState("high-latency");
        } else if (this.networkState === "high-latency") {
          this.setNetworkState("online");
        }
      }
    }
    this.measureNetworkConnectionLatencyScheduler?.schedule();
  }
  setNetworkState(newState) {
    if (this.networkState !== newState) {
      const oldState = this.networkState;
      this.networkState = newState;
      if (newState === "high-latency") {
        this.logService.warn(
          `Remote network connection appears to have high latency (${remoteConnectionLatencyMeasurer.latency?.current?.toFixed(2)}ms last, ${remoteConnectionLatencyMeasurer.latency?.average?.toFixed(2)}ms average)`
        );
      }
      if (this.connectionToken) {
        if (newState === "online" && oldState === "high-latency") {
          this.logNetworkConnectionHealthTelemetry(
            this.connectionToken,
            "good"
          );
        } else if (newState === "high-latency" && oldState === "online") {
          this.logNetworkConnectionHealthTelemetry(
            this.connectionToken,
            "poor"
          );
        }
      }
      this.updateRemoteStatusIndicator();
    }
  }
  logNetworkConnectionHealthTelemetry(connectionToken, connectionHealth) {
    this.telemetryService.publicLog2("remoteConnectionHealth", {
      remoteName: getRemoteName(this.remoteAuthority),
      reconnectionToken: connectionToken,
      connectionHealth
    });
  }
  validatedGroup(group) {
    if (!group.match(
      /^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+.-]*)_(.*))$/
    )) {
      if (!this.loggedInvalidGroupNames[group]) {
        this.loggedInvalidGroupNames[group] = true;
        this.logService.warn(
          `Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${group}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`
        );
      }
      return false;
    }
    return true;
  }
  getRemoteMenuActions(doNotUseCache) {
    if (!this.remoteMenuActionsGroups || doNotUseCache) {
      this.remoteMenuActionsGroups = this.remoteIndicatorMenu.getActions().filter((a) => this.validatedGroup(a[0])).concat(this.legacyIndicatorMenu.getActions());
    }
    return this.remoteMenuActionsGroups;
  }
  updateRemoteStatusIndicator() {
    const remoteIndicator = this.environmentService.options?.windowIndicator;
    if (remoteIndicator) {
      let remoteIndicatorLabel = remoteIndicator.label.trim();
      if (!remoteIndicatorLabel.startsWith("$(")) {
        remoteIndicatorLabel = `$(remote) ${remoteIndicatorLabel}`;
      }
      this.renderRemoteStatusIndicator(
        truncate(
          remoteIndicatorLabel,
          RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH
        ),
        remoteIndicator.tooltip,
        remoteIndicator.command
      );
      return;
    }
    if (this.remoteAuthority) {
      const hostLabel = this.labelService.getHostLabel(
        Schemas.vscodeRemote,
        this.remoteAuthority
      ) || this.remoteAuthority;
      switch (this.connectionState) {
        case "initializing":
          this.renderRemoteStatusIndicator(
            nls.localize("host.open", "Opening Remote..."),
            nls.localize("host.open", "Opening Remote..."),
            void 0,
            true
          );
          break;
        case "reconnecting":
          this.renderRemoteStatusIndicator(
            `${nls.localize("host.reconnecting", "Reconnecting to {0}...", truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`,
            void 0,
            void 0,
            true
          );
          break;
        case "disconnected":
          this.renderRemoteStatusIndicator(
            `$(alert) ${nls.localize("disconnectedFrom", "Disconnected from {0}", truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`
          );
          break;
        default: {
          const tooltip = new MarkdownString("", {
            isTrusted: true,
            supportThemeIcons: true
          });
          const hostNameTooltip = this.labelService.getHostTooltip(
            Schemas.vscodeRemote,
            this.remoteAuthority
          );
          if (hostNameTooltip) {
            tooltip.appendMarkdown(hostNameTooltip);
          } else {
            tooltip.appendText(
              nls.localize(
                {
                  key: "host.tooltip",
                  comment: [
                    "{0} is a remote host name, e.g. Dev Container"
                  ]
                },
                "Editing on {0}",
                hostLabel
              )
            );
          }
          this.renderRemoteStatusIndicator(
            `$(remote) ${truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`,
            tooltip
          );
        }
      }
      return;
    }
    if (this.virtualWorkspaceLocation) {
      const workspaceLabel = this.labelService.getHostLabel(
        this.virtualWorkspaceLocation.scheme,
        this.virtualWorkspaceLocation.authority
      );
      if (workspaceLabel) {
        const tooltip = new MarkdownString("", {
          isTrusted: true,
          supportThemeIcons: true
        });
        const hostNameTooltip = this.labelService.getHostTooltip(
          this.virtualWorkspaceLocation.scheme,
          this.virtualWorkspaceLocation.authority
        );
        if (hostNameTooltip) {
          tooltip.appendMarkdown(hostNameTooltip);
        } else {
          tooltip.appendText(
            nls.localize(
              {
                key: "workspace.tooltip",
                comment: [
                  "{0} is a remote workspace name, e.g. GitHub"
                ]
              },
              "Editing on {0}",
              workspaceLabel
            )
          );
        }
        if (!isWeb || this.remoteAuthority) {
          tooltip.appendMarkdown("\n\n");
          tooltip.appendMarkdown(
            nls.localize(
              {
                key: "workspace.tooltip2",
                comment: [
                  "[features are not available]({1}) is a link. Only translate `features are not available`. Do not change brackets and parentheses or {0}"
                ]
              },
              "Some [features are not available]({0}) for resources located on a virtual file system.",
              `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`
            )
          );
        }
        this.renderRemoteStatusIndicator(
          `$(remote) ${truncate(workspaceLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`,
          tooltip
        );
        return;
      }
    }
    this.renderRemoteStatusIndicator(
      `$(remote)`,
      nls.localize("noHost.tooltip", "Open a Remote Window")
    );
    return;
  }
  renderRemoteStatusIndicator(initialText, initialTooltip, command, showProgress) {
    const { text, tooltip, ariaLabel } = this.withNetworkStatus(
      initialText,
      initialTooltip,
      showProgress
    );
    const properties = {
      name: nls.localize("remoteHost", "Remote Host"),
      kind: this.networkState === "offline" ? "offline" : "remote",
      ariaLabel,
      text,
      showProgress,
      tooltip,
      command: command ?? RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID
    };
    if (this.remoteStatusEntry) {
      this.remoteStatusEntry.update(properties);
    } else {
      this.remoteStatusEntry = this.statusbarService.addEntry(
        properties,
        "status.host",
        StatusbarAlignment.LEFT,
        Number.MAX_VALUE
      );
    }
  }
  withNetworkStatus(initialText, initialTooltip, showProgress) {
    let text = initialText;
    let tooltip = initialTooltip;
    let ariaLabel = getCodiconAriaLabel(text);
    function textWithAlert() {
      if (!showProgress && initialText.startsWith("$(remote)")) {
        return initialText.replace("$(remote)", "$(alert)");
      }
      return initialText;
    }
    switch (this.networkState) {
      case "offline": {
        const offlineMessage = nls.localize(
          "networkStatusOfflineTooltip",
          "Network appears to be offline, certain features might be unavailable."
        );
        text = textWithAlert();
        tooltip = this.appendTooltipLine(tooltip, offlineMessage);
        ariaLabel = `${ariaLabel}, ${offlineMessage}`;
        break;
      }
      case "high-latency":
        text = textWithAlert();
        tooltip = this.appendTooltipLine(
          tooltip,
          nls.localize(
            "networkStatusHighLatencyTooltip",
            "Network appears to have high latency ({0}ms last, {1}ms average), certain features may be slow to respond.",
            remoteConnectionLatencyMeasurer.latency?.current?.toFixed(
              2
            ),
            remoteConnectionLatencyMeasurer.latency?.average?.toFixed(
              2
            )
          )
        );
        break;
    }
    return { text, tooltip, ariaLabel };
  }
  appendTooltipLine(tooltip, line) {
    let markdownTooltip;
    if (typeof tooltip === "string") {
      markdownTooltip = new MarkdownString(tooltip, {
        isTrusted: true,
        supportThemeIcons: true
      });
    } else {
      markdownTooltip = tooltip ?? new MarkdownString("", {
        isTrusted: true,
        supportThemeIcons: true
      });
    }
    if (markdownTooltip.value.length > 0) {
      markdownTooltip.appendMarkdown("\n\n");
    }
    markdownTooltip.appendMarkdown(line);
    return markdownTooltip;
  }
  async installExtension(extensionId) {
    const galleryExtension = (await this.extensionGalleryService.getExtensions(
      [{ id: extensionId }],
      CancellationToken.None
    ))[0];
    await this.extensionManagementService.installFromGallery(
      galleryExtension,
      {
        isMachineScoped: false,
        donotIncludePackAndDependencies: false,
        context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
      }
    );
  }
  async runRemoteStartCommand(extensionId, startCommand) {
    await retry(
      async () => {
        const ext = await this.extensionService.getExtension(extensionId);
        if (!ext) {
          throw Error("Failed to find installed remote extension");
        }
        return ext;
      },
      300,
      10
    );
    this.commandService.executeCommand(startCommand);
    this.telemetryService.publicLog2("workbenchActionExecuted", {
      id: "remoteInstallAndRun",
      detail: extensionId,
      from: "remote indicator"
    });
  }
  showRemoteMenu() {
    const getCategoryLabel = (action) => {
      if (action.item.category) {
        return typeof action.item.category === "string" ? action.item.category : action.item.category.value;
      }
      return void 0;
    };
    const matchCurrentRemote = () => {
      if (this.remoteAuthority) {
        return new RegExp(
          `^remote_\\d\\d_${getRemoteName(this.remoteAuthority)}_`
        );
      } else if (this.virtualWorkspaceLocation) {
        return new RegExp(
          `^virtualfs_\\d\\d_${this.virtualWorkspaceLocation.scheme}_`
        );
      }
      return void 0;
    };
    const computeItems = () => {
      let actionGroups = this.getRemoteMenuActions(true);
      const items = [];
      const currentRemoteMatcher = matchCurrentRemote();
      if (currentRemoteMatcher) {
        actionGroups = actionGroups.sort((g1, g2) => {
          const isCurrentRemote1 = currentRemoteMatcher.test(g1[0]);
          const isCurrentRemote2 = currentRemoteMatcher.test(g2[0]);
          if (isCurrentRemote1 !== isCurrentRemote2) {
            return isCurrentRemote1 ? -1 : 1;
          }
          if (g1[0] !== "" && g2[0] === "") {
            return -1;
          } else if (g1[0] === "" && g2[0] !== "") {
            return 1;
          }
          return g1[0].localeCompare(g2[0]);
        });
      }
      let lastCategoryName;
      for (const actionGroup of actionGroups) {
        let hasGroupCategory = false;
        for (const action of actionGroup[1]) {
          if (action instanceof MenuItemAction) {
            if (!hasGroupCategory) {
              const category = getCategoryLabel(action);
              if (category !== lastCategoryName) {
                items.push({
                  type: "separator",
                  label: category
                });
                lastCategoryName = category;
              }
              hasGroupCategory = true;
            }
            const label = typeof action.item.title === "string" ? action.item.title : action.item.title.value;
            items.push({
              type: "item",
              id: action.item.id,
              label
            });
          }
        }
      }
      const showExtensionRecommendations = this.configurationService.getValue(
        "workbench.remoteIndicator.showExtensionRecommendations"
      );
      if (showExtensionRecommendations && this.extensionGalleryService.isEnabled() && this.remoteMetadataInitialized) {
        const notInstalledItems = [];
        for (const metadata of this.remoteExtensionMetadata) {
          if (!metadata.installed && metadata.isPlatformCompatible) {
            const label = metadata.startConnectLabel;
            const buttons = [
              {
                iconClass: ThemeIcon.asClassName(infoIcon),
                tooltip: nls.localize(
                  "remote.startActions.help",
                  "Learn More"
                )
              }
            ];
            notInstalledItems.push({
              type: "item",
              id: metadata.id,
              label,
              buttons
            });
          }
        }
        items.push({
          type: "separator",
          label: nls.localize(
            "remote.startActions.install",
            "Install"
          )
        });
        items.push(...notInstalledItems);
      }
      items.push({
        type: "separator"
      });
      const entriesBeforeConfig = items.length;
      if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID) {
        if (this.remoteAuthority) {
          items.push({
            type: "item",
            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
            label: nls.localize(
              "closeRemoteConnection.title",
              "Close Remote Connection"
            )
          });
          if (this.connectionState === "disconnected") {
            items.push({
              type: "item",
              id: ReloadWindowAction.ID,
              label: nls.localize(
                "reloadWindow",
                "Reload Window"
              )
            });
          }
        } else if (this.virtualWorkspaceLocation) {
          items.push({
            type: "item",
            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
            label: nls.localize(
              "closeVirtualWorkspace.title",
              "Close Remote Workspace"
            )
          });
        }
      }
      if (items.length === entriesBeforeConfig) {
        items.pop();
      }
      return items;
    };
    const disposables = new DisposableStore();
    const quickPick = disposables.add(
      this.quickInputService.createQuickPick({ useSeparators: true })
    );
    quickPick.placeholder = nls.localize(
      "remoteActions",
      "Select an option to open a Remote Window"
    );
    quickPick.items = computeItems();
    quickPick.sortByLabel = false;
    quickPick.canSelectMany = false;
    disposables.add(
      Event.once(quickPick.onDidAccept)(async (_) => {
        const selectedItems = quickPick.selectedItems;
        if (selectedItems.length === 1) {
          const commandId = selectedItems[0].id;
          const remoteExtension = this.remoteExtensionMetadata.find(
            (value) => ExtensionIdentifier.equals(value.id, commandId)
          );
          if (remoteExtension) {
            quickPick.items = [];
            quickPick.busy = true;
            quickPick.placeholder = nls.localize(
              "remote.startActions.installingExtension",
              "Installing extension... "
            );
            await this.installExtension(remoteExtension.id);
            quickPick.hide();
            await this.runRemoteStartCommand(
              remoteExtension.id,
              remoteExtension.startCommand
            );
          } else {
            this.telemetryService.publicLog2("workbenchActionExecuted", {
              id: commandId,
              from: "remote indicator"
            });
            this.commandService.executeCommand(commandId);
            quickPick.hide();
          }
        }
      })
    );
    disposables.add(
      Event.once(quickPick.onDidTriggerItemButton)(async (e) => {
        const remoteExtension = this.remoteExtensionMetadata.find(
          (value) => ExtensionIdentifier.equals(value.id, e.item.id)
        );
        if (remoteExtension) {
          await this.openerService.open(
            URI.parse(remoteExtension.helpLink)
          );
        }
      })
    );
    disposables.add(
      this.legacyIndicatorMenu.onDidChange(
        () => quickPick.items = computeItems()
      )
    );
    disposables.add(
      this.remoteIndicatorMenu.onDidChange(
        () => quickPick.items = computeItems()
      )
    );
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    if (!this.remoteMetadataInitialized) {
      quickPick.busy = true;
      this._register(
        this.onDidChangeEntries(() => {
          quickPick.busy = false;
          quickPick.items = computeItems();
        })
      );
    }
    quickPick.show();
  }
};
RemoteStatusIndicator = __decorateClass([
  __decorateParam(0, IStatusbarService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IRemoteAgentService),
  __decorateParam(9, IRemoteAuthorityResolverService),
  __decorateParam(10, IHostService),
  __decorateParam(11, IWorkspaceContextService),
  __decorateParam(12, ILogService),
  __decorateParam(13, IExtensionGalleryService),
  __decorateParam(14, ITelemetryService),
  __decorateParam(15, IProductService),
  __decorateParam(16, IExtensionManagementService),
  __decorateParam(17, IOpenerService),
  __decorateParam(18, IConfigurationService)
], RemoteStatusIndicator);
Registry.as(
  ConfigurationExtensions.Configuration
).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.remoteIndicator.showExtensionRecommendations": {
      type: "boolean",
      markdownDescription: nls.localize(
        "remote.showExtensionRecommendations",
        "When enabled, remote extensions recommendations will be shown in the Remote Indicator menu."
      ),
      default: true
    }
  }
});
export {
  RemoteStatusIndicator
};
