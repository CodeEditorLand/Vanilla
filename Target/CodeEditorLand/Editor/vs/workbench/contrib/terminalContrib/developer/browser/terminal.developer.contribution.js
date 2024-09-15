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
import { Delayer } from "../../../../../base/common/async.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable, combinedDisposable, dispose } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import "./media/developer.css";
import { localize, localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { ITerminalCommand, TerminalCapability } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { ITerminalLogService, TerminalSettingId } from "../../../../../platform/terminal/common/terminal.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IInternalXtermTerminal, ITerminalContribution, ITerminalInstance, IXtermTerminal } from "../../../terminal/browser/terminal.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalWidgetManager } from "../../../terminal/browser/widgets/widgetManager.js";
import { ITerminalProcessManager } from "../../../terminal/common/terminal.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { TerminalDeveloperCommandId } from "../common/terminal.developer.js";
import { IStatusbarService, StatusbarAlignment } from "../../../../services/statusbar/browser/statusbar.js";
registerTerminalAction({
  id: TerminalDeveloperCommandId.ShowTextureAtlas,
  title: localize2("workbench.action.terminal.showTextureAtlas", "Show Terminal Texture Atlas"),
  category: Categories.Developer,
  precondition: ContextKeyExpr.or(TerminalContextKeys.isOpen),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const fileService = accessor.get(IFileService);
    const openerService = accessor.get(IOpenerService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const bitmap = await c.service.activeInstance?.xterm?.textureAtlas;
    if (!bitmap) {
      return;
    }
    const cwdUri = workspaceContextService.getWorkspace().folders[0].uri;
    const fileUri = URI.joinPath(cwdUri, "textureAtlas.png");
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("bitmaprenderer");
    if (!ctx) {
      return;
    }
    ctx.transferFromImageBitmap(bitmap);
    const blob = await new Promise((res) => canvas.toBlob(res));
    if (!blob) {
      return;
    }
    await fileService.writeFile(fileUri, VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
    openerService.open(fileUri);
  }, "run")
});
registerTerminalAction({
  id: TerminalDeveloperCommandId.WriteDataToTerminal,
  title: localize2("workbench.action.terminal.writeDataToTerminal", "Write Data to Terminal"),
  category: Categories.Developer,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    const instance = await c.service.getActiveOrCreateInstance();
    await c.service.revealActiveTerminal();
    await instance.processReady;
    if (!instance.xterm) {
      throw new Error("Cannot write data to terminal if xterm isn't initialized");
    }
    const data = await quickInputService.input({
      value: "",
      placeHolder: "Enter data, use \\x to escape",
      prompt: localize("workbench.action.terminal.writeDataToTerminal.prompt", "Enter data to write directly to the terminal, bypassing the pty")
    });
    if (!data) {
      return;
    }
    let escapedData = data.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    while (true) {
      const match = escapedData.match(/\\x([0-9a-fA-F]{2})/);
      if (match === null || match.index === void 0 || match.length < 2) {
        break;
      }
      escapedData = escapedData.slice(0, match.index) + String.fromCharCode(parseInt(match[1], 16)) + escapedData.slice(match.index + 4);
    }
    const xterm = instance.xterm;
    xterm._writeText(escapedData);
  }, "run")
});
registerTerminalAction({
  id: TerminalDeveloperCommandId.RecordSession,
  title: localize2("workbench.action.terminal.recordSession", "Record Terminal Session"),
  category: Categories.Developer,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const clipboardService = accessor.get(IClipboardService);
    const commandService = accessor.get(ICommandService);
    const statusbarService = accessor.get(IStatusbarService);
    const store = new DisposableStore();
    const text = localize("workbench.action.terminal.recordSession.recording", "Recording terminal session...");
    const statusbarEntry = {
      text,
      name: text,
      ariaLabel: text,
      showProgress: true
    };
    const statusbarHandle = statusbarService.addEntry(statusbarEntry, "recordSession", StatusbarAlignment.LEFT);
    store.add(statusbarHandle);
    const instance = await c.service.createTerminal();
    c.service.setActiveInstance(instance);
    await c.service.revealActiveTerminal();
    await Promise.all([
      instance.processReady,
      instance.focusWhenReady(true)
    ]);
    return new Promise((resolve) => {
      const events = [];
      const endRecording = /* @__PURE__ */ __name(() => {
        const session = JSON.stringify(events, null, 2);
        clipboardService.writeText(session);
        store.dispose();
        resolve();
      }, "endRecording");
      const timer = store.add(new Delayer(5e3));
      store.add(Event.runAndSubscribe(instance.onDimensionsChanged, () => {
        events.push({
          type: "resize",
          cols: instance.cols,
          rows: instance.rows
        });
        timer.trigger(endRecording);
      }));
      store.add(commandService.onWillExecuteCommand((e) => {
        events.push({
          type: "command",
          id: e.commandId
        });
        timer.trigger(endRecording);
      }));
      store.add(instance.onWillData((data) => {
        events.push({
          type: "output",
          data
        });
        timer.trigger(endRecording);
      }));
      store.add(instance.onDidSendText((data) => {
        events.push({
          type: "sendText",
          data
        });
        timer.trigger(endRecording);
      }));
      store.add(instance.xterm.raw.onData((data) => {
        events.push({
          type: "input",
          data
        });
        timer.trigger(endRecording);
      }));
      let commandDetectedRegistered = false;
      store.add(Event.runAndSubscribe(instance.capabilities.onDidAddCapability, (e) => {
        if (commandDetectedRegistered) {
          return;
        }
        const commandDetection = instance.capabilities.get(TerminalCapability.CommandDetection);
        if (!commandDetection) {
          return;
        }
        store.add(commandDetection.promptInputModel.onDidChangeInput((e2) => {
          events.push({
            type: "promptInputChange",
            data: commandDetection.promptInputModel.getCombinedString()
          });
          timer.trigger(endRecording);
        }));
        commandDetectedRegistered = true;
      }));
    });
  }, "run")
});
registerTerminalAction({
  id: TerminalDeveloperCommandId.RestartPtyHost,
  title: localize2("workbench.action.terminal.restartPtyHost", "Restart Pty Host"),
  category: Categories.Developer,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const logService = accessor.get(ITerminalLogService);
    const backends = Array.from(c.instanceService.getRegisteredBackends());
    const unresponsiveBackends = backends.filter((e) => !e.isResponsive);
    const restartCandidates = unresponsiveBackends.length > 0 ? unresponsiveBackends : backends;
    for (const backend of restartCandidates) {
      logService.warn(`Restarting pty host for authority "${backend.remoteAuthority}"`);
      backend.restartPtyHost();
    }
  }, "run")
});
let DevModeContribution = class extends Disposable {
  constructor(_instance, processManager, widgetManager, _configurationService, _statusbarService) {
    super();
    this._instance = _instance;
    this._configurationService = _configurationService;
    this._statusbarService = _statusbarService;
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalSettingId.DevMode)) {
        this._updateDevMode();
      }
    }));
  }
  static {
    __name(this, "DevModeContribution");
  }
  static ID = "terminal.devMode";
  static get(instance) {
    return instance.getContribution(DevModeContribution.ID);
  }
  _xterm;
  _activeDevModeDisposables = new MutableDisposable();
  _currentColor = 0;
  _statusbarEntry;
  _statusbarEntryAccessor = this._register(new MutableDisposable());
  xtermReady(xterm) {
    this._xterm = xterm;
    this._updateDevMode();
  }
  _updateDevMode() {
    const devMode = this._isEnabled();
    this._xterm?.raw.element?.classList.toggle("dev-mode", devMode);
    const commandDetection = this._instance.capabilities.get(TerminalCapability.CommandDetection);
    if (devMode) {
      if (commandDetection) {
        const commandDecorations = /* @__PURE__ */ new Map();
        this._activeDevModeDisposables.value = combinedDisposable(
          // Prompt input
          this._instance.onDidBlur(() => this._updateDevMode()),
          this._instance.onDidFocus(() => this._updateDevMode()),
          commandDetection.promptInputModel.onDidChangeInput(() => this._updateDevMode()),
          // Sequence markers
          commandDetection.onCommandFinished((command) => {
            const colorClass = `color-${this._currentColor}`;
            const decorations = [];
            commandDecorations.set(command, decorations);
            if (command.promptStartMarker) {
              const d = this._instance.xterm.raw?.registerDecoration({
                marker: command.promptStartMarker
              });
              if (d) {
                decorations.push(d);
                d.onRender((e) => {
                  e.textContent = "A";
                  e.classList.add("xterm-sequence-decoration", "top", "left", colorClass);
                });
              }
            }
            if (command.marker) {
              const d = this._instance.xterm.raw?.registerDecoration({
                marker: command.marker,
                x: command.startX
              });
              if (d) {
                decorations.push(d);
                d.onRender((e) => {
                  e.textContent = "B";
                  e.classList.add("xterm-sequence-decoration", "top", "right", colorClass);
                });
              }
            }
            if (command.executedMarker) {
              const d = this._instance.xterm.raw?.registerDecoration({
                marker: command.executedMarker,
                x: command.executedX
              });
              if (d) {
                decorations.push(d);
                d.onRender((e) => {
                  e.textContent = "C";
                  e.classList.add("xterm-sequence-decoration", "bottom", "left", colorClass);
                });
              }
            }
            if (command.endMarker) {
              const d = this._instance.xterm.raw?.registerDecoration({
                marker: command.endMarker
              });
              if (d) {
                decorations.push(d);
                d.onRender((e) => {
                  e.textContent = "D";
                  e.classList.add("xterm-sequence-decoration", "bottom", "right", colorClass);
                });
              }
            }
            this._currentColor = (this._currentColor + 1) % 2;
          }),
          commandDetection.onCommandInvalidated((commands) => {
            for (const c of commands) {
              const decorations = commandDecorations.get(c);
              if (decorations) {
                dispose(decorations);
              }
              commandDecorations.delete(c);
            }
          })
        );
        this._updatePromptInputStatusBar(commandDetection);
      } else {
        this._activeDevModeDisposables.value = this._instance.capabilities.onDidAddCapabilityType((e) => {
          if (e === TerminalCapability.CommandDetection) {
            this._updateDevMode();
          }
        });
      }
    } else {
      this._activeDevModeDisposables.clear();
    }
  }
  _isEnabled() {
    return this._configurationService.getValue(TerminalSettingId.DevMode) || false;
  }
  _updatePromptInputStatusBar(commandDetection) {
    const promptInputModel = commandDetection.promptInputModel;
    if (promptInputModel) {
      const name = localize("terminalDevMode", "Terminal Dev Mode");
      const isExecuting = promptInputModel.cursorIndex === -1;
      this._statusbarEntry = {
        name,
        text: `$(${isExecuting ? "loading~spin" : "terminal"}) ${promptInputModel.getCombinedString()}`,
        ariaLabel: name,
        tooltip: "The detected terminal prompt input",
        kind: "prominent"
      };
      if (!this._statusbarEntryAccessor.value) {
        this._statusbarEntryAccessor.value = this._statusbarService.addEntry(this._statusbarEntry, `terminal.promptInput.${this._instance.instanceId}`, StatusbarAlignment.LEFT);
      } else {
        this._statusbarEntryAccessor.value.update(this._statusbarEntry);
      }
      this._statusbarService.updateEntryVisibility(`terminal.promptInput.${this._instance.instanceId}`, this._instance.hasFocus);
    }
  }
};
DevModeContribution = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStatusbarService)
], DevModeContribution);
registerTerminalContribution(DevModeContribution.ID, DevModeContribution);
//# sourceMappingURL=terminal.developer.contribution.js.map
