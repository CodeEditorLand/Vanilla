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
import { Codicon } from "../../../../base/common/codicons.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  dispose,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { ModesRegistry } from "../../../../editor/common/languages/modesRegistry.js";
import * as nls from "../../../../nls.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import {
  Extensions as ConfigurationExtensions,
  ConfigurationScope
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  ILoggerService,
  LogLevel,
  LogLevelToLocalizedString,
  LogLevelToString
} from "../../../../platform/log/common/log.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import {
  Extensions as ViewContainerExtensions,
  ViewContainerLocation
} from "../../../common/views.js";
import {
  AUX_WINDOW_GROUP,
  IEditorService
} from "../../../services/editor/common/editorService.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import {
  ACTIVE_OUTPUT_CHANNEL_CONTEXT,
  CONTEXT_ACTIVE_FILE_OUTPUT,
  CONTEXT_ACTIVE_OUTPUT_LEVEL,
  CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT,
  CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE,
  CONTEXT_IN_OUTPUT,
  CONTEXT_OUTPUT_SCROLL_LOCK,
  Extensions,
  IOutputService,
  LOG_MIME,
  LOG_MODE_ID,
  OUTPUT_MIME,
  OUTPUT_MODE_ID,
  OUTPUT_VIEW_ID
} from "../../../services/output/common/output.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IDefaultLogLevelsService } from "../../logs/common/defaultLogLevels.js";
import { OutputService } from "./outputServices.js";
import { OutputViewPane } from "./outputView.js";
registerSingleton(IOutputService, OutputService, InstantiationType.Delayed);
ModesRegistry.registerLanguage({
  id: OUTPUT_MODE_ID,
  extensions: [],
  mimetypes: [OUTPUT_MIME]
});
ModesRegistry.registerLanguage({
  id: LOG_MODE_ID,
  extensions: [],
  mimetypes: [LOG_MIME]
});
const outputViewIcon = registerIcon(
  "output-view-icon",
  Codicon.output,
  nls.localize("outputViewIcon", "View icon of the output view.")
);
const VIEW_CONTAINER = Registry.as(
  ViewContainerExtensions.ViewContainersRegistry
).registerViewContainer(
  {
    id: OUTPUT_VIEW_ID,
    title: nls.localize2("output", "Output"),
    icon: outputViewIcon,
    order: 1,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [
      OUTPUT_VIEW_ID,
      { mergeViewWithContainerWhenSingleView: true }
    ]),
    storageId: OUTPUT_VIEW_ID,
    hideIfEmpty: true
  },
  ViewContainerLocation.Panel,
  { doNotRegisterOpenCommand: true }
);
Registry.as(
  ViewContainerExtensions.ViewsRegistry
).registerViews(
  [
    {
      id: OUTPUT_VIEW_ID,
      name: nls.localize2("output", "Output"),
      containerIcon: outputViewIcon,
      canMoveView: true,
      canToggleVisibility: false,
      ctorDescriptor: new SyncDescriptor(OutputViewPane),
      openCommandActionDescriptor: {
        id: "workbench.action.output.toggleOutput",
        mnemonicTitle: nls.localize(
          {
            key: "miToggleOutput",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Output"
        ),
        keybindings: {
          primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyU,
          linux: {
            primary: KeyChord(
              KeyMod.CtrlCmd | KeyCode.KeyK,
              KeyMod.CtrlCmd | KeyCode.KeyH
            )
            // On Ubuntu Ctrl+Shift+U is taken by some global OS command
          }
        },
        order: 1
      }
    }
  ],
  VIEW_CONTAINER
);
let OutputContribution = class extends Disposable {
  constructor(outputService, editorService, fileConfigurationService) {
    super();
    this.outputService = outputService;
    this.editorService = editorService;
    this.fileConfigurationService = fileConfigurationService;
    this.registerActions();
  }
  static {
    __name(this, "OutputContribution");
  }
  registerActions() {
    this.registerSwitchOutputAction();
    this.registerShowOutputChannelsAction();
    this.registerClearOutputAction();
    this.registerToggleAutoScrollAction();
    this.registerOpenActiveOutputFileAction();
    this.registerOpenActiveOutputFileInAuxWindowAction();
    this.registerShowLogsAction();
    this.registerOpenLogFileAction();
    this.registerConfigureActiveOutputLogLevelAction();
  }
  registerSwitchOutputAction() {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.output.action.switchBetweenOutputs`,
              title: nls.localize(
                "switchBetweenOutputs.label",
                "Switch Output"
              )
            });
          }
          async run(accessor, channelId) {
            if (channelId) {
              accessor.get(IOutputService).showChannel(channelId, true);
            }
          }
        }
      )
    );
    const switchOutputMenu = new MenuId(
      "workbench.output.menu.switchOutput"
    );
    this._register(
      MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
        submenu: switchOutputMenu,
        title: nls.localize("switchToOutput.label", "Switch Output"),
        group: "navigation",
        when: ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
        order: 1,
        isSelection: true
      })
    );
    const registeredChannels = /* @__PURE__ */ new Map();
    this._register(
      toDisposable(() => dispose(registeredChannels.values()))
    );
    const registerOutputChannels = /* @__PURE__ */ __name((channels) => {
      for (const channel of channels) {
        const title = channel.label;
        const group = channel.extensionId ? "0_ext_outputchannels" : "1_core_outputchannels";
        registeredChannels.set(
          channel.id,
          registerAction2(
            class extends Action2 {
              constructor() {
                super({
                  id: `workbench.action.output.show.${channel.id}`,
                  title,
                  toggled: ACTIVE_OUTPUT_CHANNEL_CONTEXT.isEqualTo(
                    channel.id
                  ),
                  menu: {
                    id: switchOutputMenu,
                    group
                  }
                });
              }
              async run(accessor) {
                return accessor.get(IOutputService).showChannel(channel.id, true);
              }
            }
          )
        );
      }
    }, "registerOutputChannels");
    registerOutputChannels(this.outputService.getChannelDescriptors());
    const outputChannelRegistry = Registry.as(
      Extensions.OutputChannels
    );
    this._register(
      outputChannelRegistry.onDidRegisterChannel((e) => {
        const channel = this.outputService.getChannelDescriptor(e);
        if (channel) {
          registerOutputChannels([channel]);
        }
      })
    );
    this._register(
      outputChannelRegistry.onDidRemoveChannel((e) => {
        registeredChannels.get(e)?.dispose();
        registeredChannels.delete(e);
      })
    );
  }
  registerShowOutputChannelsAction() {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.showOutputChannels",
              title: nls.localize2(
                "showOutputChannels",
                "Show Output Channels..."
              ),
              category: nls.localize2("output", "Output"),
              f1: true
            });
          }
          async run(accessor) {
            const outputService = accessor.get(IOutputService);
            const quickInputService = accessor.get(IQuickInputService);
            const extensionChannels = [], coreChannels = [];
            for (const channel of outputService.getChannelDescriptors()) {
              if (channel.extensionId) {
                extensionChannels.push(channel);
              } else {
                coreChannels.push(channel);
              }
            }
            const entries = [];
            for (const { id, label } of extensionChannels) {
              entries.push({ id, label });
            }
            if (extensionChannels.length && coreChannels.length) {
              entries.push({ type: "separator" });
            }
            for (const { id, label } of coreChannels) {
              entries.push({ id, label });
            }
            const entry = await quickInputService.pick(entries, {
              placeHolder: nls.localize(
                "selectOutput",
                "Select Output Channel"
              )
            });
            if (entry) {
              return outputService.showChannel(entry.id);
            }
          }
        }
      )
    );
  }
  registerClearOutputAction() {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.output.action.clearOutput`,
              title: nls.localize2(
                "clearOutput.label",
                "Clear Output"
              ),
              category: Categories.View,
              menu: [
                {
                  id: MenuId.ViewTitle,
                  when: ContextKeyExpr.equals(
                    "view",
                    OUTPUT_VIEW_ID
                  ),
                  group: "navigation",
                  order: 2
                },
                {
                  id: MenuId.CommandPalette
                },
                {
                  id: MenuId.EditorContext,
                  when: CONTEXT_IN_OUTPUT
                }
              ],
              icon: Codicon.clearAll
            });
          }
          async run(accessor) {
            const outputService = accessor.get(IOutputService);
            const accessibilitySignalService = accessor.get(
              IAccessibilitySignalService
            );
            const activeChannel = outputService.getActiveChannel();
            if (activeChannel) {
              activeChannel.clear();
              accessibilitySignalService.playSignal(
                AccessibilitySignal.clear
              );
            }
          }
        }
      )
    );
  }
  registerToggleAutoScrollAction() {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.output.action.toggleAutoScroll`,
              title: nls.localize2(
                "toggleAutoScroll",
                "Toggle Auto Scrolling"
              ),
              tooltip: nls.localize(
                "outputScrollOff",
                "Turn Auto Scrolling Off"
              ),
              menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals(
                    "view",
                    OUTPUT_VIEW_ID
                  )
                ),
                group: "navigation",
                order: 3
              },
              icon: Codicon.lock,
              toggled: {
                condition: CONTEXT_OUTPUT_SCROLL_LOCK,
                icon: Codicon.unlock,
                tooltip: nls.localize(
                  "outputScrollOn",
                  "Turn Auto Scrolling On"
                )
              }
            });
          }
          async run(accessor) {
            const outputView = accessor.get(IViewsService).getActiveViewWithId(
              OUTPUT_VIEW_ID
            );
            outputView.scrollLock = !outputView.scrollLock;
          }
        }
      )
    );
  }
  registerOpenActiveOutputFileAction() {
    const that = this;
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.action.openActiveLogOutputFile`,
              title: nls.localize2(
                "openActiveOutputFile",
                "Open Output in Editor"
              ),
              menu: [
                {
                  id: MenuId.ViewTitle,
                  when: ContextKeyExpr.equals(
                    "view",
                    OUTPUT_VIEW_ID
                  ),
                  group: "navigation",
                  order: 4,
                  isHiddenByDefault: true
                }
              ],
              icon: Codicon.goToFile,
              precondition: CONTEXT_ACTIVE_FILE_OUTPUT
            });
          }
          async run() {
            that.openActiveOutoutFile();
          }
        }
      )
    );
  }
  registerOpenActiveOutputFileInAuxWindowAction() {
    const that = this;
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.action.openActiveLogOutputFileInNewWindow`,
              title: nls.localize2(
                "openActiveOutputFileInNewWindow",
                "Open Output in New Window"
              ),
              menu: [
                {
                  id: MenuId.ViewTitle,
                  when: ContextKeyExpr.equals(
                    "view",
                    OUTPUT_VIEW_ID
                  ),
                  group: "navigation",
                  order: 5,
                  isHiddenByDefault: true
                }
              ],
              icon: Codicon.emptyWindow,
              precondition: CONTEXT_ACTIVE_FILE_OUTPUT
            });
          }
          async run() {
            that.openActiveOutoutFile(AUX_WINDOW_GROUP);
          }
        }
      )
    );
  }
  async openActiveOutoutFile(group) {
    const fileOutputChannelDescriptor = this.getFileOutputChannelDescriptor();
    if (fileOutputChannelDescriptor) {
      await this.fileConfigurationService.updateReadonly(
        fileOutputChannelDescriptor.file,
        true
      );
      await this.editorService.openEditor(
        {
          resource: fileOutputChannelDescriptor.file,
          options: {
            pinned: true
          }
        },
        group
      );
    }
  }
  getFileOutputChannelDescriptor() {
    const channel = this.outputService.getActiveChannel();
    if (channel) {
      const descriptor = this.outputService.getChannelDescriptors().filter((c) => c.id === channel.id)[0];
      if (descriptor?.file) {
        return descriptor;
      }
    }
    return null;
  }
  registerConfigureActiveOutputLogLevelAction() {
    const that = this;
    const logLevelMenu = new MenuId("workbench.output.menu.logLevel");
    this._register(
      MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
        submenu: logLevelMenu,
        title: nls.localize("logLevel.label", "Set Log Level..."),
        group: "navigation",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", OUTPUT_VIEW_ID),
          CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE
        ),
        icon: Codicon.gear,
        order: 6
      })
    );
    let order = 0;
    const registerLogLevel = /* @__PURE__ */ __name((logLevel) => {
      this._register(
        registerAction2(
          class extends Action2 {
            constructor() {
              super({
                id: `workbench.action.output.activeOutputLogLevel.${logLevel}`,
                title: LogLevelToLocalizedString(logLevel).value,
                toggled: CONTEXT_ACTIVE_OUTPUT_LEVEL.isEqualTo(
                  LogLevelToString(logLevel)
                ),
                menu: {
                  id: logLevelMenu,
                  order: order++,
                  group: "0_level"
                }
              });
            }
            async run(accessor) {
              const channel = that.outputService.getActiveChannel();
              if (channel) {
                const channelDescriptor = that.outputService.getChannelDescriptor(
                  channel.id
                );
                if (channelDescriptor?.log && channelDescriptor.file) {
                  return accessor.get(ILoggerService).setLogLevel(
                    channelDescriptor.file,
                    logLevel
                  );
                }
              }
            }
          }
        )
      );
    }, "registerLogLevel");
    registerLogLevel(LogLevel.Trace);
    registerLogLevel(LogLevel.Debug);
    registerLogLevel(LogLevel.Info);
    registerLogLevel(LogLevel.Warning);
    registerLogLevel(LogLevel.Error);
    registerLogLevel(LogLevel.Off);
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.action.output.activeOutputLogLevelDefault`,
              title: nls.localize(
                "logLevelDefault.label",
                "Set As Default"
              ),
              menu: {
                id: logLevelMenu,
                order,
                group: "1_default"
              },
              precondition: CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT.negate()
            });
          }
          async run(accessor) {
            const channel = that.outputService.getActiveChannel();
            if (channel) {
              const channelDescriptor = that.outputService.getChannelDescriptor(
                channel.id
              );
              if (channelDescriptor?.log && channelDescriptor.file) {
                const logLevel = accessor.get(ILoggerService).getLogLevel(channelDescriptor.file);
                return await accessor.get(IDefaultLogLevelsService).setDefaultLogLevel(
                  logLevel,
                  channelDescriptor.extensionId
                );
              }
            }
          }
        }
      )
    );
  }
  registerShowLogsAction() {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.showLogs",
              title: nls.localize2("showLogs", "Show Logs..."),
              category: Categories.Developer,
              menu: {
                id: MenuId.CommandPalette
              }
            });
          }
          async run(accessor) {
            const outputService = accessor.get(IOutputService);
            const quickInputService = accessor.get(IQuickInputService);
            const extensionLogs = [], logs = [];
            for (const channel of outputService.getChannelDescriptors()) {
              if (channel.log) {
                if (channel.extensionId) {
                  extensionLogs.push(channel);
                } else {
                  logs.push(channel);
                }
              }
            }
            const entries = [];
            for (const { id, label } of logs) {
              entries.push({ id, label });
            }
            if (extensionLogs.length && logs.length) {
              entries.push({
                type: "separator",
                label: nls.localize(
                  "extensionLogs",
                  "Extension Logs"
                )
              });
            }
            for (const { id, label } of extensionLogs) {
              entries.push({ id, label });
            }
            const entry = await quickInputService.pick(entries, {
              placeHolder: nls.localize(
                "selectlog",
                "Select Log"
              )
            });
            if (entry) {
              return outputService.showChannel(entry.id);
            }
          }
        }
      )
    );
  }
  registerOpenLogFileAction() {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openLogFile",
              title: nls.localize2(
                "openLogFile",
                "Open Log File..."
              ),
              category: Categories.Developer,
              menu: {
                id: MenuId.CommandPalette
              },
              metadata: {
                description: "workbench.action.openLogFile",
                args: [
                  {
                    name: "logFile",
                    schema: {
                      markdownDescription: nls.localize(
                        "logFile",
                        'The id of the log file to open, for example `"window"`. Currently the best way to get this is to get the ID by checking the `workbench.action.output.show.<id>` commands'
                      ),
                      type: "string"
                    }
                  }
                ]
              }
            });
          }
          async run(accessor, args) {
            const outputService = accessor.get(IOutputService);
            const quickInputService = accessor.get(IQuickInputService);
            const editorService = accessor.get(IEditorService);
            const fileConfigurationService = accessor.get(
              IFilesConfigurationService
            );
            let entry;
            const argName = args && typeof args === "string" ? args : void 0;
            const extensionChannels = [];
            const coreChannels = [];
            for (const c of outputService.getChannelDescriptors()) {
              if (c.file && c.log) {
                const e = {
                  id: c.id,
                  label: c.label,
                  channel: c
                };
                if (c.extensionId) {
                  extensionChannels.push(e);
                } else {
                  coreChannels.push(e);
                }
                if (e.id === argName) {
                  entry = e;
                }
              }
            }
            if (!entry) {
              const entries = [
                ...extensionChannels.sort(
                  (a, b) => a.label.localeCompare(b.label)
                )
              ];
              if (entries.length && coreChannels.length) {
                entries.push({ type: "separator" });
                entries.push(
                  ...coreChannels.sort(
                    (a, b) => a.label.localeCompare(b.label)
                  )
                );
              }
              entry = await quickInputService.pick(entries, {
                placeHolder: nls.localize(
                  "selectlogFile",
                  "Select Log File"
                )
              });
            }
            if (entry) {
              const resource = assertIsDefined(
                entry.channel.file
              );
              await fileConfigurationService.updateReadonly(
                resource,
                true
              );
              await editorService.openEditor({
                resource,
                options: {
                  pinned: true
                }
              });
            }
          }
        }
      )
    );
  }
};
OutputContribution = __decorateClass([
  __decorateParam(0, IOutputService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IFilesConfigurationService)
], OutputContribution);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(OutputContribution, LifecyclePhase.Restored);
Registry.as(
  ConfigurationExtensions.Configuration
).registerConfiguration({
  id: "output",
  order: 30,
  title: nls.localize("output", "Output"),
  type: "object",
  properties: {
    "output.smartScroll.enabled": {
      type: "boolean",
      description: nls.localize(
        "output.smartScroll.enabled",
        "Enable/disable the ability of smart scrolling in the output view. Smart scrolling allows you to lock scrolling automatically when you click in the output view and unlocks when you click in the last line."
      ),
      default: true,
      scope: ConfigurationScope.WINDOW,
      tags: ["output"]
    }
  }
});
//# sourceMappingURL=output.contribution.js.map
