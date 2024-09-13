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
import * as dom from "../../../../../base/browser/dom.js";
import {
  renderFormattedText
} from "../../../../../base/browser/formattedTextRenderer.js";
import { status } from "../../../../../base/browser/ui/aria/aria.js";
import { KeybindingLabel } from "../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../../base/common/lifecycle.js";
import { OS } from "../../../../../base/common/platform.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import {
  TerminalCapability
} from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { AccessibilityVerbositySettingId } from "../../../accessibility/browser/accessibilityConfiguration.js";
import {
  ITerminalEditorService,
  ITerminalGroupService,
  ITerminalService
} from "../../../terminal/browser/terminal.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalInstance } from "../../../terminal/browser/terminalInstance.js";
import { TerminalChatCommandId } from "./terminalChat.js";
import "./media/terminalInitialHint.css";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import {
  ChatAgentLocation,
  IChatAgentService
} from "../../../chat/common/chatAgents.js";
import { TerminalInitialHintSettingId } from "../common/terminalInitialHintConfiguration.js";
const $ = dom.$;
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2["InitialHintHideStorageKey"] = "terminal.initialHint.hide";
  return Constants2;
})(Constants || {});
class InitialHintAddon extends Disposable {
  constructor(_capabilities, _onDidChangeAgents) {
    super();
    this._capabilities = _capabilities;
    this._onDidChangeAgents = _onDidChangeAgents;
  }
  static {
    __name(this, "InitialHintAddon");
  }
  _onDidRequestCreateHint = this._register(
    new Emitter()
  );
  get onDidRequestCreateHint() {
    return this._onDidRequestCreateHint.event;
  }
  _disposables = this._register(
    new MutableDisposable()
  );
  activate(terminal) {
    const store = this._register(new DisposableStore());
    this._disposables.value = store;
    const capability = this._capabilities.get(
      TerminalCapability.CommandDetection
    );
    if (capability) {
      store.add(
        Event.once(capability.promptInputModel.onDidStartInput)(
          () => this._onDidRequestCreateHint.fire()
        )
      );
    } else {
      this._register(
        this._capabilities.onDidAddCapability((e) => {
          if (e.id === TerminalCapability.CommandDetection) {
            const capability2 = e.capability;
            store.add(
              Event.once(
                capability2.promptInputModel.onDidStartInput
              )(() => this._onDidRequestCreateHint.fire())
            );
            if (!capability2.promptInputModel.value) {
              this._onDidRequestCreateHint.fire();
            }
          }
        })
      );
    }
    const agentListener = this._onDidChangeAgents((e) => {
      if (e?.locations.includes(ChatAgentLocation.Terminal)) {
        this._onDidRequestCreateHint.fire();
        agentListener.dispose();
      }
    });
    this._disposables.value?.add(agentListener);
  }
}
let TerminalInitialHintContribution = class extends Disposable {
  constructor(_instance, processManager, widgetManager, _instantiationService, _configurationService, _terminalGroupService, _terminalEditorService, _chatAgentService, _storageService) {
    super();
    this._instance = _instance;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalEditorService = _terminalEditorService;
    this._chatAgentService = _chatAgentService;
    this._storageService = _storageService;
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalInitialHintSettingId.Enabled)) {
        this._storageService.remove("terminal.initialHint.hide" /* InitialHintHideStorageKey */, StorageScope.APPLICATION);
      }
    }));
  }
  static {
    __name(this, "TerminalInitialHintContribution");
  }
  static ID = "terminal.initialHint";
  _addon;
  _hintWidget;
  static get(instance) {
    return instance.getContribution(
      TerminalInitialHintContribution.ID
    );
  }
  _decoration;
  _xterm;
  xtermOpen(xterm) {
    if ("shellLaunchConfig" in this._instance && (this._instance.shellLaunchConfig.isExtensionOwnedTerminal || this._instance.shellLaunchConfig.isFeatureTerminal)) {
      return;
    }
    if (this._storageService.getBoolean(
      "terminal.initialHint.hide" /* InitialHintHideStorageKey */,
      StorageScope.APPLICATION,
      false
    )) {
      return;
    }
    if (this._terminalGroupService.instances.length + this._terminalEditorService.instances.length !== 1) {
      return;
    }
    this._xterm = xterm;
    this._addon = this._register(
      this._instantiationService.createInstance(
        InitialHintAddon,
        this._instance.capabilities,
        this._chatAgentService.onDidChangeAgents
      )
    );
    this._xterm.raw.loadAddon(this._addon);
    this._register(
      this._addon.onDidRequestCreateHint(() => this._createHint())
    );
  }
  _createHint() {
    const instance = this._instance instanceof TerminalInstance ? this._instance : void 0;
    const commandDetectionCapability = instance?.capabilities.get(
      TerminalCapability.CommandDetection
    );
    if (!instance || !this._xterm || this._hintWidget || !commandDetectionCapability || commandDetectionCapability.promptInputModel.value || !!instance.shellLaunchConfig.attachPersistentProcess) {
      return;
    }
    if (!this._configurationService.getValue(
      TerminalInitialHintSettingId.Enabled
    )) {
      return;
    }
    if (!this._decoration) {
      const marker = this._xterm.raw.registerMarker();
      if (!marker) {
        return;
      }
      if (this._xterm.raw.buffer.active.cursorX === 0) {
        return;
      }
      this._register(marker);
      this._decoration = this._xterm.raw.registerDecoration({
        marker,
        x: this._xterm.raw.buffer.active.cursorX + 1
      });
      if (this._decoration) {
        this._register(this._decoration);
      }
    }
    this._register(this._xterm.raw.onKey(() => this.dispose()));
    this._register(
      this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(
          TerminalInitialHintSettingId.Enabled
        ) && !this._configurationService.getValue(
          TerminalInitialHintSettingId.Enabled
        )) {
          this.dispose();
        }
      })
    );
    const inputModel = commandDetectionCapability.promptInputModel;
    if (inputModel) {
      this._register(
        inputModel.onDidChangeInput(() => {
          if (inputModel.value) {
            this.dispose();
          }
        })
      );
    }
    if (!this._decoration) {
      return;
    }
    this._register(this._decoration);
    this._register(
      this._decoration.onRender((e) => {
        if (!this._hintWidget && this._xterm?.isFocused && this._terminalGroupService.instances.length + this._terminalEditorService.instances.length === 1) {
          const terminalAgents = this._chatAgentService.getActivatedAgents().filter(
            (candidate) => candidate.locations.includes(
              ChatAgentLocation.Terminal
            )
          );
          if (terminalAgents?.length) {
            const widget = this._register(
              this._instantiationService.createInstance(
                TerminalInitialHintWidget,
                instance
              )
            );
            this._addon?.dispose();
            this._hintWidget = widget.getDomNode(terminalAgents);
            if (!this._hintWidget) {
              return;
            }
            e.appendChild(this._hintWidget);
            e.classList.add("terminal-initial-hint");
            const font = this._xterm.getFont();
            if (font) {
              e.style.fontFamily = font.fontFamily;
              e.style.fontSize = font.fontSize + "px";
            }
          }
        }
        if (this._hintWidget && this._xterm) {
          const decoration = this._hintWidget.parentElement;
          if (decoration) {
            decoration.style.width = (this._xterm.raw.cols - this._xterm.raw.buffer.active.cursorX) / this._xterm.raw.cols * 100 + "%";
          }
        }
      })
    );
  }
};
TerminalInitialHintContribution = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ITerminalGroupService),
  __decorateParam(6, ITerminalEditorService),
  __decorateParam(7, IChatAgentService),
  __decorateParam(8, IStorageService)
], TerminalInitialHintContribution);
registerTerminalContribution(
  TerminalInitialHintContribution.ID,
  TerminalInitialHintContribution,
  false
);
let TerminalInitialHintWidget = class extends Disposable {
  constructor(_instance, _chatAgentService, commandService, configurationService, keybindingService, telemetryService, productService, terminalService, _storageService, contextMenuService) {
    super();
    this._instance = _instance;
    this._chatAgentService = _chatAgentService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.terminalService = terminalService;
    this._storageService = _storageService;
    this.contextMenuService = contextMenuService;
    this.toDispose.add(_instance.onDidFocus(() => {
      if (this._instance.hasFocus && this.isVisible && this.ariaLabel && this.configurationService.getValue(AccessibilityVerbositySettingId.TerminalChat)) {
        status(this.ariaLabel);
      }
    }));
    this.toDispose.add(terminalService.onDidChangeInstances(() => {
      if (this.terminalService.instances.length !== 1) {
        this.dispose();
      }
    }));
    this.toDispose.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalInitialHintSettingId.Enabled) && !this.configurationService.getValue(TerminalInitialHintSettingId.Enabled)) {
        this.dispose();
      }
    }));
  }
  static {
    __name(this, "TerminalInitialHintWidget");
  }
  domNode;
  toDispose = this._register(
    new DisposableStore()
  );
  isVisible = false;
  ariaLabel = "";
  _getHintInlineChat(agents) {
    let providerName = (agents.length === 1 ? agents[0].fullName : void 0) ?? this.productService.nameShort;
    const defaultAgent = this._chatAgentService.getDefaultAgent(
      ChatAgentLocation.Panel
    );
    if (defaultAgent?.extensionId.value === agents[0].extensionId.value) {
      providerName = defaultAgent.fullName ?? providerName;
    }
    let ariaLabel = `Ask ${providerName} something or start typing to dismiss.`;
    const handleClick = /* @__PURE__ */ __name(() => {
      this._storageService.store(
        "terminal.initialHint.hide" /* InitialHintHideStorageKey */,
        true,
        StorageScope.APPLICATION,
        StorageTarget.USER
      );
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: "terminalInlineChat.hintAction",
        from: "hint"
      });
      this.commandService.executeCommand(TerminalChatCommandId.Start, {
        from: "hint"
      });
    }, "handleClick");
    this.toDispose.add(
      this.commandService.onDidExecuteCommand((e) => {
        if (e.commandId === TerminalChatCommandId.Start) {
          this._storageService.store(
            "terminal.initialHint.hide" /* InitialHintHideStorageKey */,
            true,
            StorageScope.APPLICATION,
            StorageTarget.USER
          );
          this.dispose();
        }
      })
    );
    const hintHandler = {
      disposables: this.toDispose,
      callback: /* @__PURE__ */ __name((index, _event) => {
        switch (index) {
          case "0":
            handleClick();
            break;
        }
      }, "callback")
    };
    const hintElement = $("div.terminal-initial-hint");
    hintElement.style.display = "block";
    const keybindingHint = this.keybindingService.lookupKeybinding(
      TerminalChatCommandId.Start
    );
    const keybindingHintLabel = keybindingHint?.getLabel();
    if (keybindingHint && keybindingHintLabel) {
      const actionPart = localize(
        "emptyHintText",
        "Press {0} to ask {1} to do something. ",
        keybindingHintLabel,
        providerName
      );
      const [before, after] = actionPart.split(keybindingHintLabel).map((fragment) => {
        const hintPart = $("a", void 0, fragment);
        this.toDispose.add(
          dom.addDisposableListener(
            hintPart,
            dom.EventType.CLICK,
            handleClick
          )
        );
        return hintPart;
      });
      hintElement.appendChild(before);
      const label = hintHandler.disposables.add(
        new KeybindingLabel(hintElement, OS)
      );
      label.set(keybindingHint);
      label.element.style.width = "min-content";
      label.element.style.display = "inline";
      label.element.style.cursor = "pointer";
      this.toDispose.add(
        dom.addDisposableListener(
          label.element,
          dom.EventType.CLICK,
          handleClick
        )
      );
      hintElement.appendChild(after);
      const typeToDismiss = localize(
        "hintTextDismiss",
        "Start typing to dismiss."
      );
      const textHint2 = $("span.detail", void 0, typeToDismiss);
      hintElement.appendChild(textHint2);
      ariaLabel = actionPart.concat(typeToDismiss);
    } else {
      const hintMsg = localize(
        {
          key: "inlineChatHint",
          comment: [
            "Preserve double-square brackets and their order"
          ]
        },
        "[[Ask {0} to do something]] or start typing to dismiss.",
        providerName
      );
      const rendered = renderFormattedText(hintMsg, {
        actionHandler: hintHandler
      });
      hintElement.appendChild(rendered);
    }
    return { ariaLabel, hintHandler, hintElement };
  }
  getDomNode(agents) {
    if (!this.domNode) {
      this.domNode = $(".terminal-initial-hint");
      this.domNode.style.paddingLeft = "4px";
      const { hintElement, ariaLabel } = this._getHintInlineChat(agents);
      this.domNode.append(hintElement);
      this.ariaLabel = ariaLabel.concat(
        localize(
          "disableHint",
          " Toggle {0} in settings to disable this hint.",
          AccessibilityVerbositySettingId.TerminalChat
        )
      );
      this.toDispose.add(
        dom.addDisposableListener(this.domNode, "click", () => {
          this.domNode?.remove();
          this.domNode = void 0;
        })
      );
      this.toDispose.add(
        dom.addDisposableListener(
          this.domNode,
          dom.EventType.CONTEXT_MENU,
          (e) => {
            this.contextMenuService.showContextMenu({
              getAnchor: /* @__PURE__ */ __name(() => {
                return new StandardMouseEvent(
                  dom.getActiveWindow(),
                  e
                );
              }, "getAnchor"),
              getActions: /* @__PURE__ */ __name(() => {
                return [
                  {
                    id: "workench.action.disableTerminalInitialHint",
                    label: localize(
                      "disableInitialHint",
                      "Disable Initial Hint"
                    ),
                    tooltip: localize(
                      "disableInitialHint",
                      "Disable Initial Hint"
                    ),
                    enabled: true,
                    class: void 0,
                    run: /* @__PURE__ */ __name(() => this.configurationService.updateValue(
                      TerminalInitialHintSettingId.Enabled,
                      false
                    ), "run")
                  }
                ];
              }, "getActions")
            });
          }
        )
      );
    }
    return this.domNode;
  }
  dispose() {
    this.domNode?.remove();
    super.dispose();
  }
};
TerminalInitialHintWidget = __decorateClass([
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IProductService),
  __decorateParam(7, ITerminalService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IContextMenuService)
], TerminalInitialHintWidget);
export {
  InitialHintAddon,
  TerminalInitialHintContribution
};
//# sourceMappingURL=terminal.initialHint.contribution.js.map
