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
import { Promises } from "../../../base/common/async.js";
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { NotSupportedError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../base/common/marshallingIds.js";
import { ThemeColor } from "../../../base/common/themables.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { localize } from "../../../nls.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import {
  serializeEnvironmentDescriptionMap,
  serializeEnvironmentVariableCollection
} from "../../../platform/terminal/common/environmentVariableShared.js";
import {
  ProcessPropertyType
} from "../../../platform/terminal/common/terminal.js";
import { TerminalDataBufferer } from "../../../platform/terminal/common/terminalDataBuffering.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostCommands } from "./extHostCommands.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { TerminalQuickFix, ViewColumn } from "./extHostTypeConverters.js";
import {
  EnvironmentVariableMutatorType,
  Disposable as VSCodeDisposable
} from "./extHostTypes.js";
const IExtHostTerminalService = createDecorator(
  "IExtHostTerminalService"
);
class ExtHostTerminal extends Disposable {
  constructor(_proxy, _id, _creationOptions, _name) {
    super();
    this._proxy = _proxy;
    this._id = _id;
    this._creationOptions = _creationOptions;
    this._name = _name;
    this._creationOptions = Object.freeze(this._creationOptions);
    this._pidPromise = new Promise(
      (c) => this._pidPromiseComplete = c
    );
    const that = this;
    this.value = {
      get name() {
        return that._name || "";
      },
      get processId() {
        return that._pidPromise;
      },
      get creationOptions() {
        return that._creationOptions;
      },
      get exitStatus() {
        return that._exitStatus;
      },
      get state() {
        return that._state;
      },
      get selection() {
        return that._selection;
      },
      get shellIntegration() {
        return that.shellIntegration;
      },
      sendText(text, shouldExecute = true) {
        that._checkDisposed();
        that._proxy.$sendText(that._id, text, shouldExecute);
      },
      show(preserveFocus) {
        that._checkDisposed();
        that._proxy.$show(that._id, preserveFocus);
      },
      hide() {
        that._checkDisposed();
        that._proxy.$hide(that._id);
      },
      dispose() {
        if (!that._disposed) {
          that._disposed = true;
          that._proxy.$dispose(that._id);
        }
      },
      get dimensions() {
        if (that._cols === void 0 || that._rows === void 0) {
          return void 0;
        }
        return {
          columns: that._cols,
          rows: that._rows
        };
      }
    };
  }
  static {
    __name(this, "ExtHostTerminal");
  }
  _disposed = false;
  _pidPromise;
  _cols;
  _pidPromiseComplete;
  _rows;
  _exitStatus;
  _state = { isInteractedWith: false };
  _selection;
  shellIntegration;
  isOpen = false;
  value;
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
  async create(options, internalOptions) {
    if (typeof this._id !== "string") {
      throw new Error("Terminal has already been created");
    }
    await this._proxy.$createTerminal(this._id, {
      name: options.name,
      shellPath: options.shellPath ?? void 0,
      shellArgs: options.shellArgs ?? void 0,
      cwd: options.cwd ?? internalOptions?.cwd ?? void 0,
      env: options.env ?? void 0,
      icon: asTerminalIcon(options.iconPath) ?? void 0,
      color: ThemeColor.isThemeColor(options.color) ? options.color.id : void 0,
      initialText: options.message ?? void 0,
      strictEnv: options.strictEnv ?? void 0,
      hideFromUser: options.hideFromUser ?? void 0,
      forceShellIntegration: internalOptions?.forceShellIntegration ?? void 0,
      isFeatureTerminal: internalOptions?.isFeatureTerminal ?? void 0,
      isExtensionOwnedTerminal: true,
      useShellEnvironment: internalOptions?.useShellEnvironment ?? void 0,
      location: internalOptions?.location || this._serializeParentTerminal(
        options.location,
        internalOptions?.resolvedExtHostIdentifier
      ),
      isTransient: options.isTransient ?? void 0
    });
  }
  async createExtensionTerminal(location, internalOptions, parentTerminal, iconPath, color) {
    if (typeof this._id !== "string") {
      throw new Error("Terminal has already been created");
    }
    await this._proxy.$createTerminal(this._id, {
      name: this._name,
      isExtensionCustomPtyTerminal: true,
      icon: iconPath,
      color: ThemeColor.isThemeColor(color) ? color.id : void 0,
      location: internalOptions?.location || this._serializeParentTerminal(location, parentTerminal),
      isTransient: true
    });
    if (typeof this._id === "string") {
      throw new Error("Terminal creation failed");
    }
    return this._id;
  }
  _serializeParentTerminal(location, parentTerminal) {
    if (typeof location === "object") {
      if ("parentTerminal" in location && location.parentTerminal && parentTerminal) {
        return { parentTerminal };
      }
      if ("viewColumn" in location) {
        return {
          viewColumn: ViewColumn.from(location.viewColumn),
          preserveFocus: location.preserveFocus
        };
      }
      return void 0;
    }
    return location;
  }
  _checkDisposed() {
    if (this._disposed) {
      throw new Error("Terminal has already been disposed");
    }
  }
  set name(name) {
    this._name = name;
  }
  setExitStatus(code, reason) {
    this._exitStatus = Object.freeze({ code, reason });
  }
  setDimensions(cols, rows) {
    if (cols === this._cols && rows === this._rows) {
      return false;
    }
    if (cols === 0 || rows === 0) {
      return false;
    }
    this._cols = cols;
    this._rows = rows;
    return true;
  }
  setInteractedWith() {
    if (!this._state.isInteractedWith) {
      this._state = { isInteractedWith: true };
      return true;
    }
    return false;
  }
  setSelection(selection) {
    this._selection = selection;
  }
  _setProcessId(processId) {
    if (this._pidPromiseComplete) {
      this._pidPromiseComplete(processId);
      this._pidPromiseComplete = void 0;
    } else {
      this._pidPromise.then((pid) => {
        if (pid !== processId) {
          this._pidPromise = Promise.resolve(processId);
        }
      });
    }
  }
}
class ExtHostPseudoterminal {
  constructor(_pty) {
    this._pty = _pty;
  }
  static {
    __name(this, "ExtHostPseudoterminal");
  }
  id = 0;
  shouldPersist = false;
  _onProcessData = new Emitter();
  onProcessData = this._onProcessData.event;
  _onProcessReady = new Emitter();
  get onProcessReady() {
    return this._onProcessReady.event;
  }
  _onDidChangeProperty = new Emitter();
  onDidChangeProperty = this._onDidChangeProperty.event;
  _onProcessExit = new Emitter();
  onProcessExit = this._onProcessExit.event;
  refreshProperty(property) {
    throw new Error(
      `refreshProperty is not suppported in extension owned terminals. property: ${property}`
    );
  }
  updateProperty(property, value) {
    throw new Error(
      `updateProperty is not suppported in extension owned terminals. property: ${property}, value: ${value}`
    );
  }
  async start() {
    return void 0;
  }
  shutdown() {
    this._pty.close();
  }
  input(data) {
    this._pty.handleInput?.(data);
  }
  resize(cols, rows) {
    this._pty.setDimensions?.({ columns: cols, rows });
  }
  clearBuffer() {
  }
  async processBinary(data) {
  }
  acknowledgeDataEvent(charCount) {
  }
  async setUnicodeVersion(version) {
  }
  getInitialCwd() {
    return Promise.resolve("");
  }
  getCwd() {
    return Promise.resolve("");
  }
  startSendingEvents(initialDimensions) {
    this._pty.onDidWrite((e) => this._onProcessData.fire(e));
    this._pty.onDidClose?.((e = void 0) => {
      this._onProcessExit.fire(e === void 0 ? void 0 : e);
    });
    this._pty.onDidOverrideDimensions?.((e) => {
      if (e) {
        this._onDidChangeProperty.fire({
          type: ProcessPropertyType.OverrideDimensions,
          value: { cols: e.columns, rows: e.rows }
        });
      }
    });
    this._pty.onDidChangeName?.((title) => {
      this._onDidChangeProperty.fire({
        type: ProcessPropertyType.Title,
        value: title
      });
    });
    this._pty.open(initialDimensions ? initialDimensions : void 0);
    if (initialDimensions) {
      this._pty.setDimensions?.(initialDimensions);
    }
    this._onProcessReady.fire({ pid: -1, cwd: "", windowsPty: void 0 });
  }
}
let nextLinkId = 1;
let BaseExtHostTerminalService = class extends Disposable {
  constructor(supportsProcesses, _extHostCommands, extHostRpc) {
    super();
    this._extHostCommands = _extHostCommands;
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadTerminalService);
    this._bufferer = new TerminalDataBufferer(this._proxy.$sendProcessData);
    this._proxy.$registerProcessSupport(supportsProcesses);
    this._extHostCommands.registerArgumentProcessor({
      processArgument: /* @__PURE__ */ __name((arg) => {
        const deserialize = /* @__PURE__ */ __name((arg2) => {
          const cast = arg2;
          return this.getTerminalById(cast.instanceId)?.value;
        }, "deserialize");
        switch (arg?.$mid) {
          case MarshalledId.TerminalContext:
            return deserialize(arg);
          default: {
            if (Array.isArray(arg)) {
              for (let i = 0; i < arg.length; i++) {
                if (arg[i].$mid === MarshalledId.TerminalContext) {
                  arg[i] = deserialize(arg[i]);
                } else {
                  break;
                }
              }
            }
            return arg;
          }
        }
      }, "processArgument")
    });
    this._register({
      dispose: /* @__PURE__ */ __name(() => {
        for (const [_, terminalProcess] of this._terminalProcesses) {
          terminalProcess.shutdown(true);
        }
      }, "dispose")
    });
  }
  static {
    __name(this, "BaseExtHostTerminalService");
  }
  _serviceBrand;
  _proxy;
  _activeTerminal;
  _terminals = [];
  _terminalProcesses = /* @__PURE__ */ new Map();
  _terminalProcessDisposables = {};
  _extensionTerminalAwaitingStart = {};
  _getTerminalPromises = {};
  _environmentVariableCollections = /* @__PURE__ */ new Map();
  _defaultProfile;
  _defaultAutomationProfile;
  _lastQuickFixCommands = this._register(new MutableDisposable());
  _bufferer;
  _linkProviders = /* @__PURE__ */ new Set();
  _profileProviders = /* @__PURE__ */ new Map();
  _quickFixProviders = /* @__PURE__ */ new Map();
  _terminalLinkCache = /* @__PURE__ */ new Map();
  _terminalLinkCancellationSource = /* @__PURE__ */ new Map();
  get activeTerminal() {
    return this._activeTerminal?.value;
  }
  get terminals() {
    return this._terminals.map((term) => term.value);
  }
  _onDidCloseTerminal = new Emitter();
  onDidCloseTerminal = this._onDidCloseTerminal.event;
  _onDidOpenTerminal = new Emitter();
  onDidOpenTerminal = this._onDidOpenTerminal.event;
  _onDidChangeActiveTerminal = new Emitter();
  onDidChangeActiveTerminal = this._onDidChangeActiveTerminal.event;
  _onDidChangeTerminalDimensions = new Emitter();
  onDidChangeTerminalDimensions = this._onDidChangeTerminalDimensions.event;
  _onDidChangeTerminalState = new Emitter();
  onDidChangeTerminalState = this._onDidChangeTerminalState.event;
  _onDidChangeShell = new Emitter();
  onDidChangeShell = this._onDidChangeShell.event;
  _onDidWriteTerminalData = new Emitter({
    onWillAddFirstListener: /* @__PURE__ */ __name(() => this._proxy.$startSendingDataEvents(), "onWillAddFirstListener"),
    onDidRemoveLastListener: /* @__PURE__ */ __name(() => this._proxy.$stopSendingDataEvents(), "onDidRemoveLastListener")
  });
  onDidWriteTerminalData = this._onDidWriteTerminalData.event;
  _onDidExecuteCommand = new Emitter({
    onWillAddFirstListener: /* @__PURE__ */ __name(() => this._proxy.$startSendingCommandEvents(), "onWillAddFirstListener"),
    onDidRemoveLastListener: /* @__PURE__ */ __name(() => this._proxy.$stopSendingCommandEvents(), "onDidRemoveLastListener")
  });
  onDidExecuteTerminalCommand = this._onDidExecuteCommand.event;
  getDefaultShell(useAutomationShell) {
    const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
    return profile?.path || "";
  }
  getDefaultShellArgs(useAutomationShell) {
    const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
    return profile?.args || [];
  }
  createExtensionTerminal(options, internalOptions) {
    const terminal = new ExtHostTerminal(
      this._proxy,
      generateUuid(),
      options,
      options.name
    );
    const p = new ExtHostPseudoterminal(options.pty);
    terminal.createExtensionTerminal(
      options.location,
      internalOptions,
      this._serializeParentTerminal(options, internalOptions).resolvedExtHostIdentifier,
      asTerminalIcon(options.iconPath),
      asTerminalColor(options.color)
    ).then((id) => {
      const disposable = this._setupExtHostProcessListeners(id, p);
      this._terminalProcessDisposables[id] = disposable;
    });
    this._terminals.push(terminal);
    return terminal.value;
  }
  _serializeParentTerminal(options, internalOptions) {
    internalOptions = internalOptions ? internalOptions : {};
    if (options.location && typeof options.location === "object" && "parentTerminal" in options.location) {
      const parentTerminal = options.location.parentTerminal;
      if (parentTerminal) {
        const parentExtHostTerminal = this._terminals.find(
          (t) => t.value === parentTerminal
        );
        if (parentExtHostTerminal) {
          internalOptions.resolvedExtHostIdentifier = parentExtHostTerminal._id;
        }
      }
    } else if (options.location && typeof options.location !== "object") {
      internalOptions.location = options.location;
    } else if (internalOptions.location && typeof internalOptions.location === "object" && "splitActiveTerminal" in internalOptions.location) {
      internalOptions.location = { splitActiveTerminal: true };
    }
    return internalOptions;
  }
  attachPtyToTerminal(id, pty) {
    const terminal = this.getTerminalById(id);
    if (!terminal) {
      throw new Error(
        `Cannot resolve terminal with id ${id} for virtual process`
      );
    }
    const p = new ExtHostPseudoterminal(pty);
    const disposable = this._setupExtHostProcessListeners(id, p);
    this._terminalProcessDisposables[id] = disposable;
  }
  async $acceptActiveTerminalChanged(id) {
    const original = this._activeTerminal;
    if (id === null) {
      this._activeTerminal = void 0;
      if (original !== this._activeTerminal) {
        this._onDidChangeActiveTerminal.fire(this._activeTerminal);
      }
      return;
    }
    const terminal = this.getTerminalById(id);
    if (terminal) {
      this._activeTerminal = terminal;
      if (original !== this._activeTerminal) {
        this._onDidChangeActiveTerminal.fire(
          this._activeTerminal.value
        );
      }
    }
  }
  async $acceptTerminalProcessData(id, data) {
    const terminal = this.getTerminalById(id);
    if (terminal) {
      this._onDidWriteTerminalData.fire({
        terminal: terminal.value,
        data
      });
    }
  }
  async $acceptTerminalDimensions(id, cols, rows) {
    const terminal = this.getTerminalById(id);
    if (terminal) {
      if (terminal.setDimensions(cols, rows)) {
        this._onDidChangeTerminalDimensions.fire({
          terminal: terminal.value,
          dimensions: terminal.value.dimensions
        });
      }
    }
  }
  async $acceptDidExecuteCommand(id, command) {
    const terminal = this.getTerminalById(id);
    if (terminal) {
      this._onDidExecuteCommand.fire({
        terminal: terminal.value,
        ...command
      });
    }
  }
  async $acceptTerminalMaximumDimensions(id, cols, rows) {
    this._terminalProcesses.get(id)?.resize(cols, rows);
  }
  async $acceptTerminalTitleChange(id, name) {
    const terminal = this.getTerminalById(id);
    if (terminal) {
      terminal.name = name;
    }
  }
  async $acceptTerminalClosed(id, exitCode, exitReason) {
    const index = this._getTerminalObjectIndexById(this._terminals, id);
    if (index !== null) {
      const terminal = this._terminals.splice(index, 1)[0];
      terminal.setExitStatus(exitCode, exitReason);
      this._onDidCloseTerminal.fire(terminal.value);
    }
  }
  $acceptTerminalOpened(id, extHostTerminalId, name, shellLaunchConfigDto) {
    if (extHostTerminalId) {
      const index = this._getTerminalObjectIndexById(
        this._terminals,
        extHostTerminalId
      );
      if (index !== null) {
        this._terminals[index]._id = id;
        this._onDidOpenTerminal.fire(this.terminals[index]);
        this._terminals[index].isOpen = true;
        return;
      }
    }
    const creationOptions = {
      name: shellLaunchConfigDto.name,
      shellPath: shellLaunchConfigDto.executable,
      shellArgs: shellLaunchConfigDto.args,
      cwd: typeof shellLaunchConfigDto.cwd === "string" ? shellLaunchConfigDto.cwd : URI.revive(shellLaunchConfigDto.cwd),
      env: shellLaunchConfigDto.env,
      hideFromUser: shellLaunchConfigDto.hideFromUser
    };
    const terminal = new ExtHostTerminal(
      this._proxy,
      id,
      creationOptions,
      name
    );
    this._terminals.push(terminal);
    this._onDidOpenTerminal.fire(terminal.value);
    terminal.isOpen = true;
  }
  async $acceptTerminalProcessId(id, processId) {
    const terminal = this.getTerminalById(id);
    terminal?._setProcessId(processId);
  }
  async $startExtensionTerminal(id, initialDimensions) {
    const terminal = this.getTerminalById(id);
    if (!terminal) {
      return {
        message: localize(
          "launchFail.idMissingOnExtHost",
          "Could not find the terminal with id {0} on the extension host",
          id
        )
      };
    }
    if (!terminal.isOpen) {
      await new Promise((r) => {
        const listener = this.onDidOpenTerminal(async (e) => {
          if (e === terminal.value) {
            listener.dispose();
            r();
          }
        });
      });
    }
    const terminalProcess = this._terminalProcesses.get(id);
    if (terminalProcess) {
      terminalProcess.startSendingEvents(
        initialDimensions
      );
    } else {
      this._extensionTerminalAwaitingStart[id] = { initialDimensions };
    }
    return void 0;
  }
  _setupExtHostProcessListeners(id, p) {
    const disposables = new DisposableStore();
    disposables.add(
      p.onProcessReady(
        (e) => this._proxy.$sendProcessReady(id, e.pid, e.cwd, e.windowsPty)
      )
    );
    disposables.add(
      p.onDidChangeProperty(
        (property) => this._proxy.$sendProcessProperty(id, property)
      )
    );
    this._bufferer.startBuffering(id, p.onProcessData);
    disposables.add(
      p.onProcessExit((exitCode) => this._onProcessExit(id, exitCode))
    );
    this._terminalProcesses.set(id, p);
    const awaitingStart = this._extensionTerminalAwaitingStart[id];
    if (awaitingStart && p instanceof ExtHostPseudoterminal) {
      p.startSendingEvents(awaitingStart.initialDimensions);
      delete this._extensionTerminalAwaitingStart[id];
    }
    return disposables;
  }
  $acceptProcessAckDataEvent(id, charCount) {
    this._terminalProcesses.get(id)?.acknowledgeDataEvent(charCount);
  }
  $acceptProcessInput(id, data) {
    this._terminalProcesses.get(id)?.input(data);
  }
  $acceptTerminalInteraction(id) {
    const terminal = this.getTerminalById(id);
    if (terminal?.setInteractedWith()) {
      this._onDidChangeTerminalState.fire(terminal.value);
    }
  }
  $acceptTerminalSelection(id, selection) {
    this.getTerminalById(id)?.setSelection(selection);
  }
  $acceptProcessResize(id, cols, rows) {
    try {
      this._terminalProcesses.get(id)?.resize(cols, rows);
    } catch (error) {
      if (error.code !== "EPIPE" && error.code !== "ERR_IPC_CHANNEL_CLOSED") {
        throw error;
      }
    }
  }
  $acceptProcessShutdown(id, immediate) {
    this._terminalProcesses.get(id)?.shutdown(immediate);
  }
  $acceptProcessRequestInitialCwd(id) {
    this._terminalProcesses.get(id)?.getInitialCwd().then(
      (initialCwd) => this._proxy.$sendProcessProperty(id, {
        type: ProcessPropertyType.InitialCwd,
        value: initialCwd
      })
    );
  }
  $acceptProcessRequestCwd(id) {
    this._terminalProcesses.get(id)?.getCwd().then(
      (cwd) => this._proxy.$sendProcessProperty(id, {
        type: ProcessPropertyType.Cwd,
        value: cwd
      })
    );
  }
  $acceptProcessRequestLatency(id) {
    return Promise.resolve(id);
  }
  registerLinkProvider(provider) {
    this._linkProviders.add(provider);
    if (this._linkProviders.size === 1) {
      this._proxy.$startLinkProvider();
    }
    return new VSCodeDisposable(() => {
      this._linkProviders.delete(provider);
      if (this._linkProviders.size === 0) {
        this._proxy.$stopLinkProvider();
      }
    });
  }
  registerProfileProvider(extension, id, provider) {
    if (this._profileProviders.has(id)) {
      throw new Error(
        `Terminal profile provider "${id}" already registered`
      );
    }
    this._profileProviders.set(id, provider);
    this._proxy.$registerProfileProvider(id, extension.identifier.value);
    return new VSCodeDisposable(() => {
      this._profileProviders.delete(id);
      this._proxy.$unregisterProfileProvider(id);
    });
  }
  registerTerminalQuickFixProvider(id, extensionId, provider) {
    if (this._quickFixProviders.has(id)) {
      throw new Error(
        `Terminal quick fix provider "${id}" is already registered`
      );
    }
    this._quickFixProviders.set(id, provider);
    this._proxy.$registerQuickFixProvider(id, extensionId);
    return new VSCodeDisposable(() => {
      this._quickFixProviders.delete(id);
      this._proxy.$unregisterQuickFixProvider(id);
    });
  }
  async $provideTerminalQuickFixes(id, matchResult) {
    const token = new CancellationTokenSource().token;
    if (token.isCancellationRequested) {
      return;
    }
    const provider = this._quickFixProviders.get(id);
    if (!provider) {
      return;
    }
    const quickFixes = await provider.provideTerminalQuickFixes(
      matchResult,
      token
    );
    if (quickFixes === null || Array.isArray(quickFixes) && quickFixes.length === 0) {
      return void 0;
    }
    const store = new DisposableStore();
    this._lastQuickFixCommands.value = store;
    if (!Array.isArray(quickFixes)) {
      return quickFixes ? TerminalQuickFix.from(
        quickFixes,
        this._extHostCommands.converter,
        store
      ) : void 0;
    }
    const result = [];
    for (const fix of quickFixes) {
      const converted = TerminalQuickFix.from(
        fix,
        this._extHostCommands.converter,
        store
      );
      if (converted) {
        result.push(converted);
      }
    }
    return result;
  }
  async $createContributedProfileTerminal(id, options) {
    const token = new CancellationTokenSource().token;
    let profile = await this._profileProviders.get(id)?.provideTerminalProfile(token);
    if (token.isCancellationRequested) {
      return;
    }
    if (profile && !("options" in profile)) {
      profile = { options: profile };
    }
    if (!profile || !("options" in profile)) {
      throw new Error(
        `No terminal profile options provided for id "${id}"`
      );
    }
    if ("pty" in profile.options) {
      this.createExtensionTerminal(profile.options, options);
      return;
    }
    this.createTerminalFromOptions(profile.options, options);
  }
  async $provideLinks(terminalId, line) {
    const terminal = this.getTerminalById(terminalId);
    if (!terminal) {
      return [];
    }
    this._terminalLinkCache.delete(terminalId);
    const oldToken = this._terminalLinkCancellationSource.get(terminalId);
    oldToken?.dispose(true);
    const cancellationSource = new CancellationTokenSource();
    this._terminalLinkCancellationSource.set(
      terminalId,
      cancellationSource
    );
    const result = [];
    const context = {
      terminal: terminal.value,
      line
    };
    const promises = [];
    for (const provider of this._linkProviders) {
      promises.push(
        Promises.withAsyncBody(async (r) => {
          cancellationSource.token.onCancellationRequested(
            () => r({ provider, links: [] })
          );
          const links = await provider.provideTerminalLinks(
            context,
            cancellationSource.token
          ) || [];
          if (!cancellationSource.token.isCancellationRequested) {
            r({ provider, links });
          }
        })
      );
    }
    const provideResults = await Promise.all(promises);
    if (cancellationSource.token.isCancellationRequested) {
      return [];
    }
    const cacheLinkMap = /* @__PURE__ */ new Map();
    for (const provideResult of provideResults) {
      if (provideResult && provideResult.links.length > 0) {
        result.push(
          ...provideResult.links.map((providerLink) => {
            const link = {
              id: nextLinkId++,
              startIndex: providerLink.startIndex,
              length: providerLink.length,
              label: providerLink.tooltip
            };
            cacheLinkMap.set(link.id, {
              provider: provideResult.provider,
              link: providerLink
            });
            return link;
          })
        );
      }
    }
    this._terminalLinkCache.set(terminalId, cacheLinkMap);
    return result;
  }
  $activateLink(terminalId, linkId) {
    const cachedLink = this._terminalLinkCache.get(terminalId)?.get(linkId);
    if (!cachedLink) {
      return;
    }
    cachedLink.provider.handleTerminalLink(cachedLink.link);
  }
  _onProcessExit(id, exitCode) {
    this._bufferer.stopBuffering(id);
    this._terminalProcesses.delete(id);
    delete this._extensionTerminalAwaitingStart[id];
    const processDiposable = this._terminalProcessDisposables[id];
    if (processDiposable) {
      processDiposable.dispose();
      delete this._terminalProcessDisposables[id];
    }
    this._proxy.$sendProcessExit(id, exitCode);
  }
  getTerminalById(id) {
    return this._getTerminalObjectById(this._terminals, id);
  }
  getTerminalIdByApiObject(terminal) {
    const index = this._terminals.findIndex((item) => {
      return item.value === terminal;
    });
    return index >= 0 ? index : null;
  }
  _getTerminalObjectById(array, id) {
    const index = this._getTerminalObjectIndexById(array, id);
    return index !== null ? array[index] : null;
  }
  _getTerminalObjectIndexById(array, id) {
    const index = array.findIndex((item) => {
      return item._id === id;
    });
    return index >= 0 ? index : null;
  }
  getEnvironmentVariableCollection(extension) {
    let collection = this._environmentVariableCollections.get(
      extension.identifier.value
    );
    if (!collection) {
      collection = this._register(
        new UnifiedEnvironmentVariableCollection()
      );
      this._setEnvironmentVariableCollection(
        extension.identifier.value,
        collection
      );
    }
    return collection.getScopedEnvironmentVariableCollection(void 0);
  }
  _syncEnvironmentVariableCollection(extensionIdentifier, collection) {
    const serialized = serializeEnvironmentVariableCollection(
      collection.map
    );
    const serializedDescription = serializeEnvironmentDescriptionMap(
      collection.descriptionMap
    );
    this._proxy.$setEnvironmentVariableCollection(
      extensionIdentifier,
      collection.persistent,
      serialized.length === 0 ? void 0 : serialized,
      serializedDescription
    );
  }
  $initEnvironmentVariableCollections(collections) {
    collections.forEach((entry) => {
      const extensionIdentifier = entry[0];
      const collection = this._register(
        new UnifiedEnvironmentVariableCollection(entry[1])
      );
      this._setEnvironmentVariableCollection(
        extensionIdentifier,
        collection
      );
    });
  }
  $acceptDefaultProfile(profile, automationProfile) {
    const oldProfile = this._defaultProfile;
    this._defaultProfile = profile;
    this._defaultAutomationProfile = automationProfile;
    if (oldProfile?.path !== profile.path) {
      this._onDidChangeShell.fire(profile.path);
    }
  }
  _setEnvironmentVariableCollection(extensionIdentifier, collection) {
    this._environmentVariableCollections.set(
      extensionIdentifier,
      collection
    );
    this._register(
      collection.onDidChangeCollection(() => {
        this._syncEnvironmentVariableCollection(
          extensionIdentifier,
          collection
        );
      })
    );
  }
};
BaseExtHostTerminalService = __decorateClass([
  __decorateParam(1, IExtHostCommands),
  __decorateParam(2, IExtHostRpcService)
], BaseExtHostTerminalService);
class UnifiedEnvironmentVariableCollection extends Disposable {
  static {
    __name(this, "UnifiedEnvironmentVariableCollection");
  }
  map = /* @__PURE__ */ new Map();
  scopedCollections = /* @__PURE__ */ new Map();
  descriptionMap = /* @__PURE__ */ new Map();
  _persistent = true;
  get persistent() {
    return this._persistent;
  }
  set persistent(value) {
    this._persistent = value;
    this._onDidChangeCollection.fire();
  }
  _onDidChangeCollection = new Emitter();
  get onDidChangeCollection() {
    return this._onDidChangeCollection && this._onDidChangeCollection.event;
  }
  constructor(serialized) {
    super();
    this.map = new Map(serialized);
  }
  getScopedEnvironmentVariableCollection(scope) {
    const scopedCollectionKey = this.getScopeKey(scope);
    let scopedCollection = this.scopedCollections.get(scopedCollectionKey);
    if (!scopedCollection) {
      scopedCollection = new ScopedEnvironmentVariableCollection(
        this,
        scope
      );
      this.scopedCollections.set(scopedCollectionKey, scopedCollection);
      this._register(
        scopedCollection.onDidChangeCollection(
          () => this._onDidChangeCollection.fire()
        )
      );
    }
    return scopedCollection;
  }
  replace(variable, value, options, scope) {
    this._setIfDiffers(variable, {
      value,
      type: EnvironmentVariableMutatorType.Replace,
      options: options ?? { applyAtProcessCreation: true },
      scope
    });
  }
  append(variable, value, options, scope) {
    this._setIfDiffers(variable, {
      value,
      type: EnvironmentVariableMutatorType.Append,
      options: options ?? { applyAtProcessCreation: true },
      scope
    });
  }
  prepend(variable, value, options, scope) {
    this._setIfDiffers(variable, {
      value,
      type: EnvironmentVariableMutatorType.Prepend,
      options: options ?? { applyAtProcessCreation: true },
      scope
    });
  }
  _setIfDiffers(variable, mutator) {
    if (mutator.options && mutator.options.applyAtProcessCreation === false && !mutator.options.applyAtShellIntegration) {
      throw new Error(
        "EnvironmentVariableMutatorOptions must apply at either process creation or shell integration"
      );
    }
    const key = this.getKey(variable, mutator.scope);
    const current = this.map.get(key);
    const newOptions = mutator.options ? {
      applyAtProcessCreation: mutator.options.applyAtProcessCreation ?? false,
      applyAtShellIntegration: mutator.options.applyAtShellIntegration ?? false
    } : {
      applyAtProcessCreation: true
    };
    if (!current || current.value !== mutator.value || current.type !== mutator.type || current.options?.applyAtProcessCreation !== newOptions.applyAtProcessCreation || current.options?.applyAtShellIntegration !== newOptions.applyAtShellIntegration || current.scope?.workspaceFolder?.index !== mutator.scope?.workspaceFolder?.index) {
      const key2 = this.getKey(variable, mutator.scope);
      const value = {
        variable,
        ...mutator,
        options: newOptions
      };
      this.map.set(key2, value);
      this._onDidChangeCollection.fire();
    }
  }
  get(variable, scope) {
    const key = this.getKey(variable, scope);
    const value = this.map.get(key);
    return value ? convertMutator(value) : void 0;
  }
  getKey(variable, scope) {
    const scopeKey = this.getScopeKey(scope);
    return scopeKey.length ? `${variable}:::${scopeKey}` : variable;
  }
  getScopeKey(scope) {
    return this.getWorkspaceKey(scope?.workspaceFolder) ?? "";
  }
  getWorkspaceKey(workspaceFolder) {
    return workspaceFolder ? workspaceFolder.uri.toString() : void 0;
  }
  getVariableMap(scope) {
    const map = /* @__PURE__ */ new Map();
    for (const [_, value] of this.map) {
      if (this.getScopeKey(value.scope) === this.getScopeKey(scope)) {
        map.set(value.variable, convertMutator(value));
      }
    }
    return map;
  }
  delete(variable, scope) {
    const key = this.getKey(variable, scope);
    this.map.delete(key);
    this._onDidChangeCollection.fire();
  }
  clear(scope) {
    if (scope?.workspaceFolder) {
      for (const [key, mutator] of this.map) {
        if (mutator.scope?.workspaceFolder?.index === scope.workspaceFolder.index) {
          this.map.delete(key);
        }
      }
      this.clearDescription(scope);
    } else {
      this.map.clear();
      this.descriptionMap.clear();
    }
    this._onDidChangeCollection.fire();
  }
  setDescription(description, scope) {
    const key = this.getScopeKey(scope);
    const current = this.descriptionMap.get(key);
    if (!current || current.description !== description) {
      let descriptionStr;
      if (typeof description === "string") {
        descriptionStr = description;
      } else {
        descriptionStr = description?.value.split("\n\n")[0];
      }
      const value = {
        description: descriptionStr,
        scope
      };
      this.descriptionMap.set(key, value);
      this._onDidChangeCollection.fire();
    }
  }
  getDescription(scope) {
    const key = this.getScopeKey(scope);
    return this.descriptionMap.get(key)?.description;
  }
  clearDescription(scope) {
    const key = this.getScopeKey(scope);
    this.descriptionMap.delete(key);
  }
}
class ScopedEnvironmentVariableCollection {
  constructor(collection, scope) {
    this.collection = collection;
    this.scope = scope;
  }
  static {
    __name(this, "ScopedEnvironmentVariableCollection");
  }
  get persistent() {
    return this.collection.persistent;
  }
  set persistent(value) {
    this.collection.persistent = value;
  }
  _onDidChangeCollection = new Emitter();
  get onDidChangeCollection() {
    return this._onDidChangeCollection && this._onDidChangeCollection.event;
  }
  getScoped(scope) {
    return this.collection.getScopedEnvironmentVariableCollection(scope);
  }
  replace(variable, value, options) {
    this.collection.replace(variable, value, options, this.scope);
  }
  append(variable, value, options) {
    this.collection.append(variable, value, options, this.scope);
  }
  prepend(variable, value, options) {
    this.collection.prepend(variable, value, options, this.scope);
  }
  get(variable) {
    return this.collection.get(variable, this.scope);
  }
  forEach(callback, thisArg) {
    this.collection.getVariableMap(this.scope).forEach(
      (value, variable) => callback.call(thisArg, variable, value, this),
      this.scope
    );
  }
  [Symbol.iterator]() {
    return this.collection.getVariableMap(this.scope).entries();
  }
  delete(variable) {
    this.collection.delete(variable, this.scope);
    this._onDidChangeCollection.fire(void 0);
  }
  clear() {
    this.collection.clear(this.scope);
  }
  set description(description) {
    this.collection.setDescription(description, this.scope);
  }
  get description() {
    return this.collection.getDescription(this.scope);
  }
}
let WorkerExtHostTerminalService = class extends BaseExtHostTerminalService {
  static {
    __name(this, "WorkerExtHostTerminalService");
  }
  constructor(extHostCommands, extHostRpc) {
    super(false, extHostCommands, extHostRpc);
  }
  createTerminal(name, shellPath, shellArgs) {
    throw new NotSupportedError();
  }
  createTerminalFromOptions(options, internalOptions) {
    throw new NotSupportedError();
  }
};
WorkerExtHostTerminalService = __decorateClass([
  __decorateParam(0, IExtHostCommands),
  __decorateParam(1, IExtHostRpcService)
], WorkerExtHostTerminalService);
function asTerminalIcon(iconPath) {
  if (!iconPath || typeof iconPath === "string") {
    return void 0;
  }
  if (!("id" in iconPath)) {
    return iconPath;
  }
  return {
    id: iconPath.id,
    color: iconPath.color
  };
}
__name(asTerminalIcon, "asTerminalIcon");
function asTerminalColor(color) {
  return ThemeColor.isThemeColor(color) ? color : void 0;
}
__name(asTerminalColor, "asTerminalColor");
function convertMutator(mutator) {
  const newMutator = { ...mutator };
  delete newMutator.scope;
  newMutator.options = newMutator.options ?? void 0;
  delete newMutator.variable;
  return newMutator;
}
__name(convertMutator, "convertMutator");
export {
  BaseExtHostTerminalService,
  ExtHostTerminal,
  IExtHostTerminalService,
  WorkerExtHostTerminalService
};
//# sourceMappingURL=extHostTerminalService.js.map
