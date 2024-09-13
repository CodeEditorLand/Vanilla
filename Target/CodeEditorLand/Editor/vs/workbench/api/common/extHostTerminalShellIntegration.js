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
  AsyncIterableObject,
  Barrier
} from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IExtHostTerminalService } from "./extHostTerminalService.js";
import { TerminalShellExecutionCommandLineConfidence } from "./extHostTypes.js";
const IExtHostTerminalShellIntegration = createDecorator(
  "IExtHostTerminalShellIntegration"
);
let ExtHostTerminalShellIntegration = class extends Disposable {
  constructor(extHostRpc, _extHostTerminalService) {
    super();
    this._extHostTerminalService = _extHostTerminalService;
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadTerminalShellIntegration);
    this._register(toDisposable(() => {
      for (const [_, integration] of this._activeShellIntegrations) {
        integration.dispose();
      }
      this._activeShellIntegrations.clear();
    }));
  }
  static {
    __name(this, "ExtHostTerminalShellIntegration");
  }
  _serviceBrand;
  _proxy;
  _activeShellIntegrations = /* @__PURE__ */ new Map();
  _onDidChangeTerminalShellIntegration = new Emitter();
  onDidChangeTerminalShellIntegration = this._onDidChangeTerminalShellIntegration.event;
  _onDidStartTerminalShellExecution = new Emitter();
  onDidStartTerminalShellExecution = this._onDidStartTerminalShellExecution.event;
  _onDidEndTerminalShellExecution = new Emitter();
  onDidEndTerminalShellExecution = this._onDidEndTerminalShellExecution.event;
  $shellIntegrationChange(instanceId) {
    const terminal = this._extHostTerminalService.getTerminalById(instanceId);
    if (!terminal) {
      return;
    }
    const apiTerminal = terminal.value;
    let shellIntegration = this._activeShellIntegrations.get(instanceId);
    if (!shellIntegration) {
      shellIntegration = new InternalTerminalShellIntegration(
        terminal.value,
        this._onDidStartTerminalShellExecution
      );
      this._activeShellIntegrations.set(instanceId, shellIntegration);
      shellIntegration.store.add(
        terminal.onWillDispose(
          () => this._activeShellIntegrations.get(instanceId)?.dispose()
        )
      );
      shellIntegration.store.add(
        shellIntegration.onDidRequestShellExecution(
          (commandLine) => this._proxy.$executeCommand(instanceId, commandLine)
        )
      );
      shellIntegration.store.add(
        shellIntegration.onDidRequestEndExecution(
          (e) => this._onDidEndTerminalShellExecution.fire(e)
        )
      );
      shellIntegration.store.add(
        shellIntegration.onDidRequestChangeShellIntegration(
          (e) => this._onDidChangeTerminalShellIntegration.fire(e)
        )
      );
      terminal.shellIntegration = shellIntegration.value;
    }
    this._onDidChangeTerminalShellIntegration.fire({
      terminal: apiTerminal,
      shellIntegration: shellIntegration.value
    });
  }
  $shellExecutionStart(instanceId, commandLineValue, commandLineConfidence, isTrusted, cwd) {
    if (!this._activeShellIntegrations.has(instanceId)) {
      this.$shellIntegrationChange(instanceId);
    }
    const commandLine = {
      value: commandLineValue,
      confidence: commandLineConfidence,
      isTrusted
    };
    this._activeShellIntegrations.get(instanceId)?.startShellExecution(commandLine, URI.revive(cwd));
  }
  $shellExecutionEnd(instanceId, commandLineValue, commandLineConfidence, isTrusted, exitCode) {
    const commandLine = {
      value: commandLineValue,
      confidence: commandLineConfidence,
      isTrusted
    };
    this._activeShellIntegrations.get(instanceId)?.endShellExecution(commandLine, exitCode);
  }
  $shellExecutionData(instanceId, data) {
    this._activeShellIntegrations.get(instanceId)?.emitData(data);
  }
  $cwdChange(instanceId, cwd) {
    this._activeShellIntegrations.get(instanceId)?.setCwd(URI.revive(cwd));
  }
  $closeTerminal(instanceId) {
    this._activeShellIntegrations.get(instanceId)?.dispose();
    this._activeShellIntegrations.delete(instanceId);
  }
};
ExtHostTerminalShellIntegration = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostTerminalService)
], ExtHostTerminalShellIntegration);
class InternalTerminalShellIntegration extends Disposable {
  constructor(_terminal, _onDidStartTerminalShellExecution) {
    super();
    this._terminal = _terminal;
    this._onDidStartTerminalShellExecution = _onDidStartTerminalShellExecution;
    const that = this;
    this.value = {
      get cwd() {
        return that._cwd;
      },
      // executeCommand(commandLine: string): vscode.TerminalShellExecution;
      // executeCommand(executable: string, args: string[]): vscode.TerminalShellExecution;
      executeCommand(commandLineOrExecutable, args) {
        let commandLineValue = commandLineOrExecutable;
        if (args) {
          commandLineValue += ` "${args.map((e) => `${e.replaceAll('"', '\\"')}`).join('" "')}"`;
        }
        that._onDidRequestShellExecution.fire(commandLineValue);
        const commandLine = {
          value: commandLineValue,
          confidence: TerminalShellExecutionCommandLineConfidence.High,
          isTrusted: true
        };
        const execution = that.startShellExecution(
          commandLine,
          that._cwd,
          true
        ).value;
        that._ignoreNextExecution = true;
        return execution;
      }
    };
  }
  static {
    __name(this, "InternalTerminalShellIntegration");
  }
  _currentExecution;
  get currentExecution() {
    return this._currentExecution;
  }
  _ignoreNextExecution = false;
  _cwd;
  store = this._register(new DisposableStore());
  value;
  _onDidRequestChangeShellIntegration = this._register(
    new Emitter()
  );
  onDidRequestChangeShellIntegration = this._onDidRequestChangeShellIntegration.event;
  _onDidRequestShellExecution = this._register(
    new Emitter()
  );
  onDidRequestShellExecution = this._onDidRequestShellExecution.event;
  _onDidRequestEndExecution = this._register(
    new Emitter()
  );
  onDidRequestEndExecution = this._onDidRequestEndExecution.event;
  startShellExecution(commandLine, cwd, fireEventInMicrotask) {
    if (this._ignoreNextExecution && this._currentExecution) {
      this._ignoreNextExecution = false;
    } else {
      if (this._currentExecution) {
        this._currentExecution.endExecution(void 0);
        this._onDidRequestEndExecution.fire({
          terminal: this._terminal,
          shellIntegration: this.value,
          execution: this._currentExecution.value,
          exitCode: void 0
        });
      }
      const currentExecution = this._currentExecution = new InternalTerminalShellExecution(
        commandLine,
        cwd ?? this._cwd
      );
      if (fireEventInMicrotask) {
        queueMicrotask(
          () => this._onDidStartTerminalShellExecution.fire({
            terminal: this._terminal,
            shellIntegration: this.value,
            execution: currentExecution.value
          })
        );
      } else {
        this._onDidStartTerminalShellExecution.fire({
          terminal: this._terminal,
          shellIntegration: this.value,
          execution: this._currentExecution.value
        });
      }
    }
    return this._currentExecution;
  }
  emitData(data) {
    this.currentExecution?.emitData(data);
  }
  endShellExecution(commandLine, exitCode) {
    if (this._currentExecution) {
      this._currentExecution.endExecution(commandLine);
      this._onDidRequestEndExecution.fire({
        terminal: this._terminal,
        shellIntegration: this.value,
        execution: this._currentExecution.value,
        exitCode
      });
      this._currentExecution = void 0;
    }
  }
  setCwd(cwd) {
    let wasChanged = false;
    if (URI.isUri(this._cwd)) {
      wasChanged = !URI.isUri(cwd) || this._cwd.toString() !== cwd.toString();
    } else if (this._cwd !== cwd) {
      wasChanged = true;
    }
    if (wasChanged) {
      this._cwd = cwd;
      this._onDidRequestChangeShellIntegration.fire({
        terminal: this._terminal,
        shellIntegration: this.value
      });
    }
  }
}
class InternalTerminalShellExecution {
  constructor(_commandLine, cwd) {
    this._commandLine = _commandLine;
    this.cwd = cwd;
    const that = this;
    this.value = {
      get commandLine() {
        return that._commandLine;
      },
      get cwd() {
        return that.cwd;
      },
      read() {
        return that._createDataStream();
      }
    };
  }
  static {
    __name(this, "InternalTerminalShellExecution");
  }
  _dataStream;
  _ended = false;
  value;
  _createDataStream() {
    if (!this._dataStream) {
      if (this._ended) {
        return AsyncIterableObject.EMPTY;
      }
      this._dataStream = new ShellExecutionDataStream();
    }
    return this._dataStream.createIterable();
  }
  emitData(data) {
    this._dataStream?.emitData(data);
  }
  endExecution(commandLine) {
    if (commandLine) {
      this._commandLine = commandLine;
    }
    this._dataStream?.endExecution();
    this._dataStream = void 0;
    this._ended = true;
  }
}
class ShellExecutionDataStream extends Disposable {
  static {
    __name(this, "ShellExecutionDataStream");
  }
  _barrier;
  _emitters = [];
  createIterable() {
    if (!this._barrier) {
      this._barrier = new Barrier();
    }
    const barrier = this._barrier;
    const iterable = new AsyncIterableObject(async (emitter) => {
      this._emitters.push(emitter);
      await barrier.wait();
    });
    return iterable;
  }
  emitData(data) {
    for (const emitter of this._emitters) {
      emitter.emitOne(data);
    }
  }
  endExecution() {
    this._barrier?.open();
    this._barrier = void 0;
  }
}
export {
  ExtHostTerminalShellIntegration,
  IExtHostTerminalShellIntegration
};
//# sourceMappingURL=extHostTerminalShellIntegration.js.map
