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
import { isFirefox } from "../../../../base/browser/browser.js";
import { BrowserFeatures } from "../../../../base/browser/canIUse.js";
import { DataTransfers } from "../../../../base/browser/dnd.js";
import * as dom from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Orientation } from "../../../../base/browser/ui/sash/sash.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { AutoOpenBarrier, Barrier, Promises, disposableTimeout, timeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { debounce } from "../../../../base/common/decorators.js";
import { ErrorNoTelemetry, onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { ISeparator, template } from "../../../../base/common/labels.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable, dispose, toDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import * as path from "../../../../base/common/path.js";
import { OS, OperatingSystem, isMacintosh, isWindows } from "../../../../base/common/platform.js";
import { ScrollbarVisibility } from "../../../../base/common/scrollable.js";
import { URI } from "../../../../base/common/uri.js";
import { TabFocus } from "../../../../editor/browser/config/tabFocus.js";
import * as nls from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { CodeDataTransfers, containsDragType } from "../../../../platform/dnd/browser/dnd.js";
import { FileSystemProviderCapabilities, IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ResultKind } from "../../../../platform/keybinding/common/keybindingResolver.js";
import { INotificationService, IPromptChoice, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IQuickInputService, IQuickPickItem, QuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IMarkProperties, ITerminalCommand, TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalCapabilityStoreMultiplexer } from "../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { IEnvironmentVariableCollection, IMergedEnvironmentVariableCollection } from "../../../../platform/terminal/common/environmentVariable.js";
import { deserializeEnvironmentVariableCollections } from "../../../../platform/terminal/common/environmentVariableShared.js";
import { GeneralShellType, IProcessDataEvent, IProcessPropertyMap, IReconnectionProperties, IShellLaunchConfig, ITerminalDimensionsOverride, ITerminalLaunchError, ITerminalLogService, PosixShellType, ProcessPropertyType, ShellIntegrationStatus, TerminalExitReason, TerminalIcon, TerminalLocation, TerminalSettingId, TerminalShellType, TitleEventSource, WindowsShellType } from "../../../../platform/terminal/common/terminal.js";
import { formatMessageForTerminal } from "../../../../platform/terminal/common/terminalStrings.js";
import { editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { getIconRegistry } from "../../../../platform/theme/common/iconRegistry.js";
import { IColorTheme, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService, IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from "../../../common/theme.js";
import { IViewDescriptorService, ViewContainerLocation } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { IRequestAddInstanceToGroupEvent, ITerminalConfigurationService, ITerminalContribution, ITerminalInstance, IXtermColorProvider, TerminalDataTransfers } from "./terminal.js";
import { TerminalLaunchHelpAction } from "./terminalActions.js";
import { TerminalEditorInput } from "./terminalEditorInput.js";
import { TerminalExtensionsRegistry } from "./terminalExtensions.js";
import { getColorClass, createColorStyleElement, getStandardColors } from "./terminalIcon.js";
import { TerminalProcessManager } from "./terminalProcessManager.js";
import { showRunRecentQuickPick } from "./terminalRunRecentQuickPick.js";
import { ITerminalStatusList, TerminalStatus, TerminalStatusList } from "./terminalStatusList.js";
import { getTerminalResourcesFromDragEvent, getTerminalUri } from "./terminalUri.js";
import { TerminalWidgetManager } from "./widgets/widgetManager.js";
import { LineDataEventAddon } from "./xterm/lineDataEventAddon.js";
import { XtermTerminal, getXtermScaledDimensions } from "./xterm/xtermTerminal.js";
import { IEnvironmentVariableInfo } from "../common/environmentVariable.js";
import { getCommandHistory, getDirectoryHistory } from "../common/history.js";
import { DEFAULT_COMMANDS_TO_SKIP_SHELL, ITerminalProcessManager, ITerminalProfileResolverService, ProcessState, TERMINAL_CREATION_COMMANDS, TERMINAL_VIEW_ID, TerminalCommandId } from "../common/terminal.js";
import { TERMINAL_BACKGROUND_COLOR } from "../common/terminalColorRegistry.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { getWorkspaceForTerminal, preparePathForShell } from "../common/terminalEnvironment.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IHistoryService } from "../../../services/history/common/history.js";
import { isHorizontal, IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IPathService } from "../../../services/path/common/pathService.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { importAMDNodeModule } from "../../../../amdX.js";
import { AccessibilityCommandId } from "../../accessibility/common/accessibilityCommands.js";
import { terminalStrings } from "../common/terminalStrings.js";
import { shouldPasteTerminalText } from "../common/terminalClipboard.js";
import { TerminalIconPicker } from "./terminalIconPicker.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { TerminalResizeDebouncer } from "./terminalResizeDebouncer.js";
import { TerminalAccessibilityCommandId } from "../../terminalContrib/accessibility/common/terminal.accessibility.js";
import { openContextMenu } from "./terminalContextMenu.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["WaitForContainerThreshold"] = 100] = "WaitForContainerThreshold";
  Constants2[Constants2["DefaultCols"] = 80] = "DefaultCols";
  Constants2[Constants2["DefaultRows"] = 30] = "DefaultRows";
  Constants2[Constants2["MaxCanvasWidth"] = 4096] = "MaxCanvasWidth";
  return Constants2;
})(Constants || {});
let xtermConstructor;
const shellIntegrationSupportedShellTypes = [
  PosixShellType.Bash,
  PosixShellType.Zsh,
  GeneralShellType.PowerShell,
  GeneralShellType.Python
];
let TerminalInstance = class extends Disposable {
  constructor(_terminalShellTypeContextKey, _terminalInRunCommandPicker, _shellLaunchConfig, _contextKeyService, _contextMenuService, instantiationService, _terminalConfigurationService, _terminalProfileResolverService, _pathService, _keybindingService, _notificationService, _preferencesService, _viewsService, _clipboardService, _themeService, _configurationService, _logService, _storageService, _accessibilityService, _productService, _quickInputService, workbenchEnvironmentService, _workspaceContextService, _editorService, _workspaceTrustRequestService, _historyService, _telemetryService, _openerService, _commandService, _accessibilitySignalService, _viewDescriptorService) {
    super();
    this._terminalShellTypeContextKey = _terminalShellTypeContextKey;
    this._terminalInRunCommandPicker = _terminalInRunCommandPicker;
    this._shellLaunchConfig = _shellLaunchConfig;
    this._contextKeyService = _contextKeyService;
    this._contextMenuService = _contextMenuService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._pathService = _pathService;
    this._keybindingService = _keybindingService;
    this._notificationService = _notificationService;
    this._preferencesService = _preferencesService;
    this._viewsService = _viewsService;
    this._clipboardService = _clipboardService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._accessibilityService = _accessibilityService;
    this._productService = _productService;
    this._quickInputService = _quickInputService;
    this._workspaceContextService = _workspaceContextService;
    this._editorService = _editorService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._historyService = _historyService;
    this._telemetryService = _telemetryService;
    this._openerService = _openerService;
    this._commandService = _commandService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._viewDescriptorService = _viewDescriptorService;
    this._wrapperElement = document.createElement("div");
    this._wrapperElement.classList.add("terminal-wrapper");
    this._widgetManager = this._register(instantiationService.createInstance(TerminalWidgetManager));
    this._skipTerminalCommands = [];
    this._isExiting = false;
    this._hadFocusOnExit = false;
    this._isVisible = false;
    this._instanceId = TerminalInstance._instanceIdCounter++;
    this._hasHadInput = false;
    this._fixedRows = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.rows;
    this._fixedCols = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.cols;
    this._resource = getTerminalUri(this._workspaceContextService.getWorkspace().id, this.instanceId, this.title);
    if (this._shellLaunchConfig.attachPersistentProcess?.hideFromUser) {
      this._shellLaunchConfig.hideFromUser = this._shellLaunchConfig.attachPersistentProcess.hideFromUser;
    }
    if (this._shellLaunchConfig.attachPersistentProcess?.isFeatureTerminal) {
      this._shellLaunchConfig.isFeatureTerminal = this._shellLaunchConfig.attachPersistentProcess.isFeatureTerminal;
    }
    if (this._shellLaunchConfig.attachPersistentProcess?.type) {
      this._shellLaunchConfig.type = this._shellLaunchConfig.attachPersistentProcess.type;
    }
    if (this.shellLaunchConfig.cwd) {
      const cwdUri = typeof this._shellLaunchConfig.cwd === "string" ? URI.from({
        scheme: Schemas.file,
        path: this._shellLaunchConfig.cwd
      }) : this._shellLaunchConfig.cwd;
      if (cwdUri) {
        this._workspaceFolder = this._workspaceContextService.getWorkspaceFolder(cwdUri) ?? void 0;
      }
    }
    if (!this._workspaceFolder) {
      const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
      this._workspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    }
    const scopedContextKeyService = this._register(_contextKeyService.createScoped(this._wrapperElement));
    this._scopedContextKeyService = scopedContextKeyService;
    this._scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, scopedContextKeyService]
    )));
    this._terminalFocusContextKey = TerminalContextKeys.focus.bindTo(scopedContextKeyService);
    this._terminalHasFixedWidth = TerminalContextKeys.terminalHasFixedWidth.bindTo(scopedContextKeyService);
    this._terminalHasTextContextKey = TerminalContextKeys.textSelected.bindTo(scopedContextKeyService);
    this._terminalAltBufferActiveContextKey = TerminalContextKeys.altBufferActive.bindTo(scopedContextKeyService);
    this._terminalShellIntegrationEnabledContextKey = TerminalContextKeys.terminalShellIntegrationEnabled.bindTo(scopedContextKeyService);
    this._logService.trace(`terminalInstance#ctor (instanceId: ${this.instanceId})`, this._shellLaunchConfig);
    this._register(this.capabilities.onDidAddCapabilityType((e) => {
      this._logService.debug("terminalInstance added capability", e);
      if (e === TerminalCapability.CwdDetection) {
        this.capabilities.get(TerminalCapability.CwdDetection)?.onDidChangeCwd((e2) => {
          this._cwd = e2;
          this._setTitle(this.title, TitleEventSource.Config);
          this._scopedInstantiationService.invokeFunction(getDirectoryHistory)?.add(e2, { remoteAuthority: this.remoteAuthority });
        });
      } else if (e === TerminalCapability.CommandDetection) {
        const commandCapability = this.capabilities.get(TerminalCapability.CommandDetection);
        commandCapability?.onCommandFinished((e2) => {
          if (e2.command.trim().length > 0) {
            this._scopedInstantiationService.invokeFunction(getCommandHistory)?.add(e2.command, { shellType: this._shellType });
          }
        });
      }
    }));
    this._register(this.capabilities.onDidRemoveCapabilityType((e) => this._logService.debug("terminalInstance removed capability", e)));
    if (!this.shellLaunchConfig.executable && !workbenchEnvironmentService.remoteAuthority) {
      this._terminalProfileResolverService.resolveIcon(this._shellLaunchConfig, OS);
    }
    this._icon = _shellLaunchConfig.attachPersistentProcess?.icon || _shellLaunchConfig.icon;
    if (this.shellLaunchConfig.customPtyImplementation) {
      this._setTitle(this._shellLaunchConfig.name, TitleEventSource.Api);
    }
    this.statusList = this._register(this._scopedInstantiationService.createInstance(TerminalStatusList));
    this._initDimensions();
    this._processManager = this._createProcessManager();
    this._containerReadyBarrier = new AutoOpenBarrier(100 /* WaitForContainerThreshold */);
    this._attachBarrier = new AutoOpenBarrier(1e3);
    this._xtermReadyPromise = this._createXterm();
    this._xtermReadyPromise.then(async () => {
      await this._containerReadyBarrier.wait();
      if (!this.shellLaunchConfig.customPtyImplementation && this._terminalConfigurationService.config.shellIntegration?.enabled && !this.shellLaunchConfig.executable) {
        const os = await this._processManager.getBackendOS();
        const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority: this.remoteAuthority, os });
        this.shellLaunchConfig.executable = defaultProfile.path;
        this.shellLaunchConfig.args = defaultProfile.args;
        if (this.shellLaunchConfig.isExtensionOwnedTerminal) {
          this.shellLaunchConfig.icon ??= defaultProfile.icon;
          this.shellLaunchConfig.color ??= defaultProfile.color;
          this.shellLaunchConfig.env ??= defaultProfile.env;
        } else {
          this.shellLaunchConfig.icon = defaultProfile.icon;
          this.shellLaunchConfig.color = defaultProfile.color;
          this.shellLaunchConfig.env = defaultProfile.env;
        }
      }
      await this._createProcess();
      if (this.shellLaunchConfig.attachPersistentProcess) {
        this._cwd = this.shellLaunchConfig.attachPersistentProcess.cwd;
        this._setTitle(this.shellLaunchConfig.attachPersistentProcess.title, this.shellLaunchConfig.attachPersistentProcess.titleSource);
        this.setShellType(this.shellType);
      }
      if (this._fixedCols) {
        await this._addScrollbar();
      }
    }).catch((err) => {
      if (!this.isDisposed) {
        throw err;
      }
    });
    this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration(AccessibilityVerbositySettingId.Terminal)) {
        this._setAriaLabel(this.xterm?.raw, this._instanceId, this.title);
      }
      if (e.affectsConfiguration("terminal.integrated")) {
        this.updateConfig();
        this.setVisible(this._isVisible);
      }
      const layoutSettings = [
        TerminalSettingId.FontSize,
        TerminalSettingId.FontFamily,
        TerminalSettingId.FontWeight,
        TerminalSettingId.FontWeightBold,
        TerminalSettingId.LetterSpacing,
        TerminalSettingId.LineHeight,
        "editor.fontFamily"
      ];
      if (layoutSettings.some((id) => e.affectsConfiguration(id))) {
        this._layoutSettingsChanged = true;
        await this._resize();
      }
      if (e.affectsConfiguration(TerminalSettingId.UnicodeVersion)) {
        this._updateUnicodeVersion();
      }
      if (e.affectsConfiguration("editor.accessibilitySupport")) {
        this.updateAccessibilitySupport();
      }
      if (e.affectsConfiguration(TerminalSettingId.TerminalTitle) || e.affectsConfiguration(TerminalSettingId.TerminalTitleSeparator) || e.affectsConfiguration(TerminalSettingId.TerminalDescription)) {
        this._labelComputer?.refreshLabel(this);
      }
    }));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._labelComputer?.refreshLabel(this)));
    let initialDataEventsTimeout = dom.getWindow(this._container).setTimeout(() => {
      initialDataEventsTimeout = void 0;
      this._initialDataEvents = void 0;
      this._initialDataEventsListener.clear();
    }, 1e4);
    this._register(toDisposable(() => {
      if (initialDataEventsTimeout) {
        dom.getWindow(this._container).clearTimeout(initialDataEventsTimeout);
      }
    }));
    const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
    for (const desc of contributionDescs) {
      if (this._contributions.has(desc.id)) {
        onUnexpectedError(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
        continue;
      }
      let contribution;
      try {
        contribution = this._register(this._scopedInstantiationService.createInstance(desc.ctor, this, this._processManager, this._widgetManager));
        this._contributions.set(desc.id, contribution);
      } catch (err) {
        onUnexpectedError(err);
      }
      this._xtermReadyPromise.then((xterm) => {
        contribution.xtermReady?.(xterm);
      });
      this._register(this.onDisposed(() => {
        contribution.dispose();
        this._contributions.delete(desc.id);
        if ("instance" in contribution) {
          delete contribution.instance;
        }
        if ("_instance" in contribution) {
          delete contribution._instance;
        }
      }));
    }
  }
  static {
    __name(this, "TerminalInstance");
  }
  static _lastKnownCanvasDimensions;
  static _lastKnownGridDimensions;
  static _instanceIdCounter = 1;
  _scopedInstantiationService;
  _processManager;
  _contributions = /* @__PURE__ */ new Map();
  _resource;
  _xtermReadyPromise;
  _pressAnyKeyToCloseListener;
  _instanceId;
  _latestXtermWriteData = 0;
  _latestXtermParseData = 0;
  _isExiting;
  _hadFocusOnExit;
  _isVisible;
  _exitCode;
  _exitReason;
  _skipTerminalCommands;
  _shellType;
  _title = "";
  _titleSource = TitleEventSource.Process;
  _container;
  _wrapperElement;
  get domElement() {
    return this._wrapperElement;
  }
  _horizontalScrollbar;
  _terminalFocusContextKey;
  _terminalHasFixedWidth;
  _terminalHasTextContextKey;
  _terminalAltBufferActiveContextKey;
  _terminalShellIntegrationEnabledContextKey;
  _cols = 0;
  _rows = 0;
  _fixedCols;
  _fixedRows;
  _cwd = void 0;
  _initialCwd = void 0;
  _injectedArgs = void 0;
  _layoutSettingsChanged = true;
  _dimensionsOverride;
  _areLinksReady = false;
  _initialDataEventsListener = this._register(new MutableDisposable());
  _initialDataEvents = [];
  _containerReadyBarrier;
  _attachBarrier;
  _icon;
  _messageTitleDisposable = this._register(new MutableDisposable());
  _widgetManager;
  _dndObserver = this._register(new MutableDisposable());
  _lastLayoutDimensions;
  _hasHadInput;
  _description;
  _processName = "";
  _sequence;
  _staticTitle;
  _workspaceFolder;
  _labelComputer;
  _userHome;
  _hasScrollBar;
  _target;
  _usedShellIntegrationInjection = false;
  get usedShellIntegrationInjection() {
    return this._usedShellIntegrationInjection;
  }
  _lineDataEventAddon;
  _scopedContextKeyService;
  _resizeDebouncer;
  _pauseInputEventBarrier;
  pauseInputEvents(barrier) {
    this._pauseInputEventBarrier = barrier;
  }
  capabilities = this._register(new TerminalCapabilityStoreMultiplexer());
  statusList;
  get store() {
    return this._store;
  }
  get extEnvironmentVariableCollection() {
    return this._processManager.extEnvironmentVariableCollection;
  }
  xterm;
  disableLayout = false;
  get waitOnExit() {
    return this._shellLaunchConfig.attachPersistentProcess?.waitOnExit || this._shellLaunchConfig.waitOnExit;
  }
  set waitOnExit(value) {
    this._shellLaunchConfig.waitOnExit = value;
  }
  get target() {
    return this._target;
  }
  set target(value) {
    this._target = value;
    this._onDidChangeTarget.fire(value);
  }
  get instanceId() {
    return this._instanceId;
  }
  get resource() {
    return this._resource;
  }
  get cols() {
    if (this._fixedCols !== void 0) {
      return this._fixedCols;
    }
    if (this._dimensionsOverride && this._dimensionsOverride.cols) {
      if (this._dimensionsOverride.forceExactSize) {
        return this._dimensionsOverride.cols;
      }
      return Math.min(Math.max(this._dimensionsOverride.cols, 2), this._cols);
    }
    return this._cols;
  }
  get rows() {
    if (this._fixedRows !== void 0) {
      return this._fixedRows;
    }
    if (this._dimensionsOverride && this._dimensionsOverride.rows) {
      if (this._dimensionsOverride.forceExactSize) {
        return this._dimensionsOverride.rows;
      }
      return Math.min(Math.max(this._dimensionsOverride.rows, 2), this._rows);
    }
    return this._rows;
  }
  get isDisposed() {
    return this._store.isDisposed;
  }
  get fixedCols() {
    return this._fixedCols;
  }
  get fixedRows() {
    return this._fixedRows;
  }
  get maxCols() {
    return this._cols;
  }
  get maxRows() {
    return this._rows;
  }
  // TODO: Ideally processId would be merged into processReady
  get processId() {
    return this._processManager.shellProcessId;
  }
  // TODO: How does this work with detached processes?
  // TODO: Should this be an event as it can fire twice?
  get processReady() {
    return this._processManager.ptyProcessReady;
  }
  get hasChildProcesses() {
    return this.shellLaunchConfig.attachPersistentProcess?.hasChildProcesses || this._processManager.hasChildProcesses;
  }
  get reconnectionProperties() {
    return this.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties || this.shellLaunchConfig.reconnectionProperties;
  }
  get areLinksReady() {
    return this._areLinksReady;
  }
  get initialDataEvents() {
    return this._initialDataEvents;
  }
  get exitCode() {
    return this._exitCode;
  }
  get exitReason() {
    return this._exitReason;
  }
  get hadFocusOnExit() {
    return this._hadFocusOnExit;
  }
  get isTitleSetByProcess() {
    return !!this._messageTitleDisposable.value;
  }
  get shellLaunchConfig() {
    return this._shellLaunchConfig;
  }
  get shellType() {
    return this._shellType;
  }
  get os() {
    return this._processManager.os;
  }
  get isRemote() {
    return this._processManager.remoteAuthority !== void 0;
  }
  get remoteAuthority() {
    return this._processManager.remoteAuthority;
  }
  get hasFocus() {
    return dom.isAncestorOfActiveElement(this._wrapperElement);
  }
  get title() {
    return this._title;
  }
  get titleSource() {
    return this._titleSource;
  }
  get icon() {
    return this._getIcon();
  }
  get color() {
    return this._getColor();
  }
  get processName() {
    return this._processName;
  }
  get sequence() {
    return this._sequence;
  }
  get staticTitle() {
    return this._staticTitle;
  }
  get workspaceFolder() {
    return this._workspaceFolder;
  }
  get cwd() {
    return this._cwd;
  }
  get initialCwd() {
    return this._initialCwd;
  }
  get description() {
    if (this._description) {
      return this._description;
    }
    const type = this.shellLaunchConfig.attachPersistentProcess?.type || this.shellLaunchConfig.type;
    switch (type) {
      case "Task":
        return terminalStrings.typeTask;
      case "Local":
        return terminalStrings.typeLocal;
      default:
        return void 0;
    }
  }
  get userHome() {
    return this._userHome;
  }
  get shellIntegrationNonce() {
    return this._processManager.shellIntegrationNonce;
  }
  get injectedArgs() {
    return this._injectedArgs;
  }
  // The onExit event is special in that it fires and is disposed after the terminal instance
  // itself is disposed
  _onExit = new Emitter();
  onExit = this._onExit.event;
  _onDisposed = this._register(new Emitter());
  onDisposed = this._onDisposed.event;
  _onProcessIdReady = this._register(new Emitter());
  onProcessIdReady = this._onProcessIdReady.event;
  _onProcessReplayComplete = this._register(new Emitter());
  onProcessReplayComplete = this._onProcessReplayComplete.event;
  _onTitleChanged = this._register(new Emitter());
  onTitleChanged = this._onTitleChanged.event;
  _onIconChanged = this._register(new Emitter());
  onIconChanged = this._onIconChanged.event;
  _onWillData = this._register(new Emitter());
  onWillData = this._onWillData.event;
  _onData = this._register(new Emitter());
  onData = this._onData.event;
  _onBinary = this._register(new Emitter());
  onBinary = this._onBinary.event;
  _onLineData = this._register(new Emitter({
    onDidAddFirstListener: /* @__PURE__ */ __name(() => this._onLineDataSetup(), "onDidAddFirstListener")
  }));
  onLineData = this._onLineData.event;
  _onRequestExtHostProcess = this._register(new Emitter());
  onRequestExtHostProcess = this._onRequestExtHostProcess.event;
  _onDimensionsChanged = this._register(new Emitter());
  onDimensionsChanged = this._onDimensionsChanged.event;
  _onMaximumDimensionsChanged = this._register(new Emitter());
  onMaximumDimensionsChanged = this._onMaximumDimensionsChanged.event;
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidRequestFocus = this._register(new Emitter());
  onDidRequestFocus = this._onDidRequestFocus.event;
  _onDidBlur = this._register(new Emitter());
  onDidBlur = this._onDidBlur.event;
  _onDidInputData = this._register(new Emitter());
  onDidInputData = this._onDidInputData.event;
  _onDidChangeSelection = this._register(new Emitter());
  onDidChangeSelection = this._onDidChangeSelection.event;
  _onRequestAddInstanceToGroup = this._register(new Emitter());
  onRequestAddInstanceToGroup = this._onRequestAddInstanceToGroup.event;
  _onDidChangeHasChildProcesses = this._register(new Emitter());
  onDidChangeHasChildProcesses = this._onDidChangeHasChildProcesses.event;
  _onDidExecuteText = this._register(new Emitter());
  onDidExecuteText = this._onDidExecuteText.event;
  _onDidChangeTarget = this._register(new Emitter());
  onDidChangeTarget = this._onDidChangeTarget.event;
  _onDidSendText = this._register(new Emitter());
  onDidSendText = this._onDidSendText.event;
  _onDidChangeShellType = this._register(new Emitter());
  onDidChangeShellType = this._onDidChangeShellType.event;
  _onDidChangeVisibility = this._register(new Emitter());
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  _onWillPaste = this._register(new Emitter());
  onWillPaste = this._onWillPaste.event;
  _onDidPaste = this._register(new Emitter());
  onDidPaste = this._onDidPaste.event;
  getContribution(id) {
    return this._contributions.get(id);
  }
  _getIcon() {
    if (!this._icon) {
      this._icon = this._processManager.processState >= ProcessState.Launching ? getIconRegistry().getIcon(this._configurationService.getValue(TerminalSettingId.TabsDefaultIcon)) : void 0;
    }
    return this._icon;
  }
  _getColor() {
    if (this.shellLaunchConfig.color) {
      return this.shellLaunchConfig.color;
    }
    if (this.shellLaunchConfig?.attachPersistentProcess?.color) {
      return this.shellLaunchConfig.attachPersistentProcess.color;
    }
    if (this._processManager.processState >= ProcessState.Launching) {
      return void 0;
    }
    return void 0;
  }
  _initDimensions() {
    if (!this._container) {
      this._cols = 80 /* DefaultCols */;
      this._rows = 30 /* DefaultRows */;
      return;
    }
    const computedStyle = dom.getWindow(this._container).getComputedStyle(this._container);
    const width = parseInt(computedStyle.width);
    const height = parseInt(computedStyle.height);
    this._evaluateColsAndRows(width, height);
  }
  /**
   * Evaluates and sets the cols and rows of the terminal if possible.
   * @param width The width of the container.
   * @param height The height of the container.
   * @return The terminal's width if it requires a layout.
   */
  _evaluateColsAndRows(width, height) {
    if (!width || !height) {
      this._setLastKnownColsAndRows();
      return null;
    }
    const dimension = this._getDimension(width, height);
    if (!dimension) {
      this._setLastKnownColsAndRows();
      return null;
    }
    const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement));
    const newRC = getXtermScaledDimensions(dom.getWindow(this.domElement), font, dimension.width, dimension.height);
    if (!newRC) {
      this._setLastKnownColsAndRows();
      return null;
    }
    if (this._cols !== newRC.cols || this._rows !== newRC.rows) {
      this._cols = newRC.cols;
      this._rows = newRC.rows;
      this._fireMaximumDimensionsChanged();
    }
    return dimension.width;
  }
  _setLastKnownColsAndRows() {
    if (TerminalInstance._lastKnownGridDimensions) {
      this._cols = TerminalInstance._lastKnownGridDimensions.cols;
      this._rows = TerminalInstance._lastKnownGridDimensions.rows;
    }
  }
  _fireMaximumDimensionsChanged() {
    this._onMaximumDimensionsChanged.fire();
  }
  _getDimension(width, height) {
    const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement));
    if (!font || !font.charWidth || !font.charHeight) {
      return void 0;
    }
    if (!this.xterm?.raw.element) {
      return void 0;
    }
    const computedStyle = dom.getWindow(this.xterm.raw.element).getComputedStyle(this.xterm.raw.element);
    const horizontalPadding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight) + 14;
    const verticalPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
    TerminalInstance._lastKnownCanvasDimensions = new dom.Dimension(
      Math.min(4096 /* MaxCanvasWidth */, width - horizontalPadding),
      height - verticalPadding + (this._hasScrollBar && this._horizontalScrollbar ? -5 : 0)
    );
    return TerminalInstance._lastKnownCanvasDimensions;
  }
  get persistentProcessId() {
    return this._processManager.persistentProcessId;
  }
  get shouldPersist() {
    return this._processManager.shouldPersist && !this.shellLaunchConfig.isTransient && (!this.reconnectionProperties || this._configurationService.getValue("task.reconnection") === true);
  }
  static getXtermConstructor(keybindingService, contextKeyService) {
    const keybinding = keybindingService.lookupKeybinding(TerminalAccessibilityCommandId.FocusAccessibleBuffer, contextKeyService);
    if (xtermConstructor) {
      return xtermConstructor;
    }
    xtermConstructor = Promises.withAsyncBody(async (resolve) => {
      const Terminal = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
      Terminal.strings.promptLabel = nls.localize("terminal.integrated.a11yPromptLabel", "Terminal input");
      Terminal.strings.tooMuchOutput = keybinding ? nls.localize("terminal.integrated.useAccessibleBuffer", "Use the accessible buffer {0} to manually review output", keybinding.getLabel()) : nls.localize("terminal.integrated.useAccessibleBufferNoKb", "Use the Terminal: Focus Accessible Buffer command to manually review output");
      resolve(Terminal);
    });
    return xtermConstructor;
  }
  /**
   * Create xterm.js instance and attach data listeners.
   */
  async _createXterm() {
    const Terminal = await TerminalInstance.getXtermConstructor(this._keybindingService, this._contextKeyService);
    if (this.isDisposed) {
      throw new ErrorNoTelemetry("Terminal disposed of during xterm.js creation");
    }
    const disableShellIntegrationReporting = this.shellLaunchConfig.executable === void 0 || this.shellType === void 0 || !shellIntegrationSupportedShellTypes.includes(this.shellType);
    const xterm = this._scopedInstantiationService.createInstance(
      XtermTerminal,
      Terminal,
      this._cols,
      this._rows,
      this._scopedInstantiationService.createInstance(TerminalInstanceColorProvider, this),
      this.capabilities,
      this._processManager.shellIntegrationNonce,
      disableShellIntegrationReporting
    );
    this.xterm = xterm;
    this._resizeDebouncer = this._register(new TerminalResizeDebouncer(
      () => this._isVisible,
      () => xterm,
      async (cols, rows) => {
        xterm.raw.resize(cols, rows);
        await this._updatePtyDimensions(xterm.raw);
      },
      async (cols) => {
        xterm.raw.resize(cols, xterm.raw.rows);
        await this._updatePtyDimensions(xterm.raw);
      },
      async (rows) => {
        xterm.raw.resize(xterm.raw.cols, rows);
        await this._updatePtyDimensions(xterm.raw);
      }
    ));
    this.updateAccessibilitySupport();
    this._register(this.xterm.onDidRequestRunCommand((e) => {
      if (e.copyAsHtml) {
        this.copySelection(true, e.command);
      } else {
        this.sendText(e.command.command, e.noNewLine ? false : true);
      }
    }));
    this._register(this.xterm.onDidRequestFocus(() => this.focus()));
    this._register(this.xterm.onDidRequestSendText((e) => this.sendText(e, false)));
    const initialTextWrittenPromise = this._shellLaunchConfig.initialText ? new Promise((r) => this._writeInitialText(xterm, r)) : void 0;
    const lineDataEventAddon = this._register(new LineDataEventAddon(initialTextWrittenPromise));
    this._register(lineDataEventAddon.onLineData((e) => this._onLineData.fire(e)));
    this._lineDataEventAddon = lineDataEventAddon;
    disposableTimeout(() => {
      this._register(xterm.raw.onBell(() => {
        if (this._configurationService.getValue(TerminalSettingId.EnableBell) || this._configurationService.getValue(TerminalSettingId.EnableVisualBell)) {
          this.statusList.add({
            id: TerminalStatus.Bell,
            severity: Severity.Warning,
            icon: Codicon.bell,
            tooltip: nls.localize("bellStatus", "Bell")
          }, this._terminalConfigurationService.config.bellDuration);
        }
        this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalBell);
      }));
    }, 1e3, this._store);
    this._register(xterm.raw.onSelectionChange(async () => this._onSelectionChange()));
    this._register(xterm.raw.buffer.onBufferChange(() => this._refreshAltBufferContextKey()));
    this._register(this._processManager.onProcessData((e) => this._onProcessData(e)));
    this._register(xterm.raw.onData(async (data) => {
      await this._pauseInputEventBarrier?.wait();
      await this._processManager.write(data);
      this._onDidInputData.fire(data);
    }));
    this._register(xterm.raw.onBinary((data) => this._processManager.processBinary(data)));
    this._register(this._processManager.onProcessReady(async (processTraits) => {
      if (this._processManager.os) {
        lineDataEventAddon.setOperatingSystem(this._processManager.os);
      }
      xterm.raw.options.windowsPty = processTraits.windowsPty;
    }));
    this._register(this._processManager.onRestoreCommands((e) => this.xterm?.shellIntegration.deserialize(e)));
    this._register(this._viewDescriptorService.onDidChangeLocation(({ views }) => {
      if (views.some((v) => v.id === TERMINAL_VIEW_ID)) {
        xterm.refresh();
      }
    }));
    if (!this.capabilities.has(TerminalCapability.CwdDetection)) {
      let onKeyListener = xterm.raw.onKey((e) => {
        const event = new StandardKeyboardEvent(e.domEvent);
        if (event.equals(KeyCode.Enter)) {
          this._updateProcessCwd();
        }
      });
      this._register(this.capabilities.onDidAddCapabilityType((e) => {
        if (e === TerminalCapability.CwdDetection) {
          onKeyListener?.dispose();
          onKeyListener = void 0;
        }
      }));
    }
    this._pathService.userHome().then((userHome) => {
      this._userHome = userHome.fsPath;
    });
    if (this._isVisible) {
      this._open();
    }
    return xterm;
  }
  async _onLineDataSetup() {
    const xterm = this.xterm || await this._xtermReadyPromise;
    xterm.raw.loadAddon(this._lineDataEventAddon);
  }
  async runCommand(commandLine, shouldExecute) {
    let commandDetection = this.capabilities.get(TerminalCapability.CommandDetection);
    if (!commandDetection && (this._processManager.processState === ProcessState.Uninitialized || this._processManager.processState === ProcessState.Launching)) {
      const store = new DisposableStore();
      await Promise.race([
        new Promise((r) => {
          store.add(this.capabilities.onDidAddCapabilityType((e) => {
            if (e === TerminalCapability.CommandDetection) {
              commandDetection = this.capabilities.get(TerminalCapability.CommandDetection);
              r();
            }
          }));
        }),
        timeout(2e3)
      ]);
      store.dispose();
    }
    if (!commandDetection || commandDetection.promptInputModel.value.length > 0) {
      await this.sendText("", false);
      await timeout(100);
    }
    await this.sendText(commandLine, shouldExecute, !shouldExecute);
  }
  async runRecent(type, filterMode, value) {
    return this._scopedInstantiationService.invokeFunction(
      showRunRecentQuickPick,
      this,
      this._terminalInRunCommandPicker,
      type,
      filterMode,
      value
    );
  }
  detachFromElement() {
    this._wrapperElement.remove();
    this._container = void 0;
  }
  attachToElement(container) {
    if (this._container === container) {
      return;
    }
    if (!this._attachBarrier.isOpen()) {
      this._attachBarrier.open();
    }
    this._container = container;
    this._container.appendChild(this._wrapperElement);
    if (this.xterm?.raw.element) {
      this.xterm.raw.open(this.xterm.raw.element);
    }
    this.xterm?.refresh();
    setTimeout(() => this._initDragAndDrop(container));
  }
  /**
   * Opens the the terminal instance inside the parent DOM element previously set with
   * `attachToElement`, you must ensure the parent DOM element is explicitly visible before
   * invoking this function as it performs some DOM calculations internally
   */
  _open() {
    if (!this.xterm || this.xterm.raw.element) {
      return;
    }
    if (!this._container || !this._container.isConnected) {
      throw new Error("A container element needs to be set with `attachToElement` and be part of the DOM before calling `_open`");
    }
    const xtermElement = document.createElement("div");
    this._wrapperElement.appendChild(xtermElement);
    this._container.appendChild(this._wrapperElement);
    const xterm = this.xterm;
    this._wrapperElement.xterm = xterm.raw;
    const screenElement = xterm.attachToElement(xtermElement);
    for (const contribution of this._contributions.values()) {
      if (!this.xterm) {
        this._xtermReadyPromise.then((xterm2) => contribution.xtermOpen?.(xterm2));
      } else {
        contribution.xtermOpen?.(this.xterm);
      }
    }
    this._register(xterm.shellIntegration.onDidChangeStatus(() => {
      if (this.hasFocus) {
        this._setShellIntegrationContextKey();
      } else {
        this._terminalShellIntegrationEnabledContextKey.reset();
      }
    }));
    if (!xterm.raw.element || !xterm.raw.textarea) {
      throw new Error("xterm elements not set after open");
    }
    this._setAriaLabel(xterm.raw, this._instanceId, this._title);
    xterm.raw.attachCustomKeyEventHandler((event) => {
      if (this._isExiting) {
        return false;
      }
      const standardKeyboardEvent = new StandardKeyboardEvent(event);
      const resolveResult = this._keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
      const isValidChord = resolveResult.kind === ResultKind.MoreChordsNeeded && this._terminalConfigurationService.config.allowChords && event.key !== "Escape";
      if (this._keybindingService.inChordMode || isValidChord) {
        event.preventDefault();
        return false;
      }
      const SHOW_TERMINAL_CONFIG_PROMPT_KEY = "terminal.integrated.showTerminalConfigPrompt";
      const EXCLUDED_KEYS = ["RightArrow", "LeftArrow", "UpArrow", "DownArrow", "Space", "Meta", "Control", "Shift", "Alt", "", "Delete", "Backspace", "Tab"];
      if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, StorageScope.APPLICATION, true) && !EXCLUDED_KEYS.includes(event.key) && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        this._hasHadInput = true;
      }
      if (resolveResult.kind === ResultKind.KbFound && resolveResult.commandId && this._skipTerminalCommands.some((k) => k === resolveResult.commandId) && !this._terminalConfigurationService.config.sendKeybindingsToShell) {
        if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, StorageScope.APPLICATION, true) && this._hasHadInput && !TERMINAL_CREATION_COMMANDS.includes(resolveResult.commandId)) {
          this._notificationService.prompt(
            Severity.Info,
            nls.localize("keybindingHandling", "Some keybindings don't go to the terminal by default and are handled by {0} instead.", this._productService.nameLong),
            [
              {
                label: nls.localize("configureTerminalSettings", "Configure Terminal Settings"),
                run: /* @__PURE__ */ __name(() => {
                  this._preferencesService.openSettings({ jsonEditor: false, query: `@id:${TerminalSettingId.CommandsToSkipShell},${TerminalSettingId.SendKeybindingsToShell},${TerminalSettingId.AllowChords}` });
                }, "run")
              }
            ]
          );
          this._storageService.store(SHOW_TERMINAL_CONFIG_PROMPT_KEY, false, StorageScope.APPLICATION, StorageTarget.USER);
        }
        event.preventDefault();
        return false;
      }
      if (this._terminalConfigurationService.config.allowMnemonics && !isMacintosh && event.altKey) {
        return false;
      }
      if (TabFocus.getTabFocusMode() && event.key === "Tab") {
        return false;
      }
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        return true;
      }
      if (isWindows && event.altKey && event.key === "F4" && !event.ctrlKey) {
        return false;
      }
      if (!BrowserFeatures.clipboard.readText && event.key === "v" && event.ctrlKey) {
        return false;
      }
      return true;
    });
    this._register(dom.addDisposableListener(xterm.raw.element, "mousedown", () => {
      const listener = dom.addDisposableListener(xterm.raw.element.ownerDocument, "mouseup", () => {
        setTimeout(() => this._refreshSelectionContextKey(), 0);
        listener.dispose();
      });
    }));
    this._register(dom.addDisposableListener(xterm.raw.element, "touchstart", () => {
      xterm.raw.focus();
    }));
    this._register(dom.addDisposableListener(xterm.raw.element, "keyup", () => {
      setTimeout(() => this._refreshSelectionContextKey(), 0);
    }));
    this._register(dom.addDisposableListener(xterm.raw.textarea, "focus", () => this._setFocus(true)));
    this._register(dom.addDisposableListener(xterm.raw.textarea, "blur", () => this._setFocus(false)));
    this._register(dom.addDisposableListener(xterm.raw.textarea, "focusout", () => this._setFocus(false)));
    this._initDragAndDrop(this._container);
    this._widgetManager.attachToElement(screenElement);
    if (this._lastLayoutDimensions) {
      this.layout(this._lastLayoutDimensions);
    }
    this.updateConfig();
    if (xterm.raw.options.disableStdin) {
      this._attachPressAnyKeyToCloseListener(xterm.raw);
    }
  }
  _setFocus(focused) {
    if (focused) {
      this._terminalFocusContextKey.set(true);
      this._setShellIntegrationContextKey();
      this._onDidFocus.fire(this);
    } else {
      this.resetFocusContextKey();
      this._onDidBlur.fire(this);
      this._refreshSelectionContextKey();
    }
  }
  _setShellIntegrationContextKey() {
    if (this.xterm) {
      this._terminalShellIntegrationEnabledContextKey.set(this.xterm.shellIntegration.status === ShellIntegrationStatus.VSCode);
    }
  }
  resetFocusContextKey() {
    this._terminalFocusContextKey.reset();
    this._terminalShellIntegrationEnabledContextKey.reset();
  }
  _initDragAndDrop(container) {
    const store = new DisposableStore();
    const dndController = store.add(this._scopedInstantiationService.createInstance(TerminalInstanceDragAndDropController, container));
    store.add(dndController.onDropTerminal((e) => this._onRequestAddInstanceToGroup.fire(e)));
    store.add(dndController.onDropFile(async (path2) => {
      this.focus();
      await this.sendPath(path2, false);
    }));
    store.add(new dom.DragAndDropObserver(container, dndController));
    this._dndObserver.value = store;
  }
  hasSelection() {
    return this.xterm ? this.xterm.raw.hasSelection() : false;
  }
  async copySelection(asHtml, command) {
    const xterm = await this._xtermReadyPromise;
    await xterm.copySelection(asHtml, command);
  }
  get selection() {
    return this.xterm && this.hasSelection() ? this.xterm.raw.getSelection() : void 0;
  }
  clearSelection() {
    this.xterm?.raw.clearSelection();
  }
  _refreshAltBufferContextKey() {
    this._terminalAltBufferActiveContextKey.set(!!(this.xterm && this.xterm.raw.buffer.active === this.xterm.raw.buffer.alternate));
  }
  dispose(reason) {
    if (this.shellLaunchConfig.type === "Task" && reason === TerminalExitReason.Process && this._exitCode !== 0 && !this.shellLaunchConfig.waitOnExit) {
      return;
    }
    if (this.isDisposed) {
      return;
    }
    this._logService.trace(`terminalInstance#dispose (instanceId: ${this.instanceId})`);
    dispose(this._widgetManager);
    if (this.xterm?.raw.element) {
      this._hadFocusOnExit = this.hasFocus;
    }
    if (this._wrapperElement.xterm) {
      this._wrapperElement.xterm = void 0;
    }
    if (this._horizontalScrollbar) {
      this._horizontalScrollbar.dispose();
      this._horizontalScrollbar = void 0;
    }
    try {
      this.xterm?.dispose();
    } catch (err) {
      this._logService.error("Exception occurred during xterm disposal", err);
    }
    if (isFirefox) {
      this.resetFocusContextKey();
      this._terminalHasTextContextKey.reset();
      this._onDidBlur.fire(this);
    }
    if (this._pressAnyKeyToCloseListener) {
      this._pressAnyKeyToCloseListener.dispose();
      this._pressAnyKeyToCloseListener = void 0;
    }
    if (this._exitReason === void 0) {
      this._exitReason = reason ?? TerminalExitReason.Unknown;
    }
    this._processManager.dispose();
    this._onProcessExit(void 0);
    this._onDisposed.fire(this);
    super.dispose();
  }
  async detachProcessAndDispose(reason) {
    await this._processManager.detachFromProcess(reason === TerminalExitReason.User);
    this.dispose(reason);
  }
  focus(force) {
    this._refreshAltBufferContextKey();
    if (!this.xterm) {
      return;
    }
    if (force || !dom.getActiveWindow().getSelection()?.toString()) {
      this.xterm.raw.focus();
      this._onDidRequestFocus.fire();
    }
  }
  async focusWhenReady(force) {
    await this._xtermReadyPromise;
    await this._attachBarrier.wait();
    this.focus(force);
  }
  async paste() {
    await this._paste(await this._clipboardService.readText());
  }
  async pasteSelection() {
    await this._paste(await this._clipboardService.readText("selection"));
  }
  async _paste(value) {
    if (!this.xterm) {
      return;
    }
    let currentText = value;
    const shouldPasteText = await this._scopedInstantiationService.invokeFunction(shouldPasteTerminalText, currentText, this.xterm?.raw.modes.bracketedPasteMode);
    if (!shouldPasteText) {
      return;
    }
    if (typeof shouldPasteText === "object") {
      currentText = shouldPasteText.modifiedText;
    }
    this.focus();
    this._onWillPaste.fire(currentText);
    this.xterm.raw.paste(currentText);
    this._onDidPaste.fire(currentText);
  }
  async sendText(text, shouldExecute, bracketedPasteMode) {
    if (bracketedPasteMode && this.xterm?.raw.modes.bracketedPasteMode) {
      text = `\x1B[200~${text}\x1B[201~`;
    }
    text = text.replace(/\r?\n/g, "\r");
    if (shouldExecute && !text.endsWith("\r")) {
      text += "\r";
    }
    this._logService.debug("sending data (vscode)", text);
    await this._processManager.write(text);
    this._onDidInputData.fire(text);
    this._onDidSendText.fire(text);
    this.xterm?.scrollToBottom();
    if (shouldExecute) {
      this._onDidExecuteText.fire();
    }
  }
  async sendPath(originalPath, shouldExecute) {
    return this.sendText(await this.preparePathForShell(originalPath), shouldExecute);
  }
  async preparePathForShell(originalPath) {
    await this.processReady;
    return preparePathForShell(originalPath, this.shellLaunchConfig.executable, this.title, this.shellType, this._processManager.backend, this._processManager.os);
  }
  setVisible(visible) {
    const didChange = this._isVisible !== visible;
    this._isVisible = visible;
    this._wrapperElement.classList.toggle("active", visible);
    if (visible && this.xterm) {
      this._open();
      this._resizeDebouncer?.flush();
      this._resize();
    }
    if (didChange) {
      this._onDidChangeVisibility.fire(visible);
    }
  }
  scrollDownLine() {
    this.xterm?.scrollDownLine();
  }
  scrollDownPage() {
    this.xterm?.scrollDownPage();
  }
  scrollToBottom() {
    this.xterm?.scrollToBottom();
  }
  scrollUpLine() {
    this.xterm?.scrollUpLine();
  }
  scrollUpPage() {
    this.xterm?.scrollUpPage();
  }
  scrollToTop() {
    this.xterm?.scrollToTop();
  }
  clearBuffer() {
    this._processManager.clearBuffer();
    this.xterm?.clearBuffer();
  }
  _refreshSelectionContextKey() {
    const isActive = !!this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    let isEditorActive = false;
    const editor = this._editorService.activeEditor;
    if (editor) {
      isEditorActive = editor instanceof TerminalEditorInput;
    }
    this._terminalHasTextContextKey.set((isActive || isEditorActive) && this.hasSelection());
  }
  _createProcessManager() {
    let deserializedCollections;
    if (this.shellLaunchConfig.attachPersistentProcess?.environmentVariableCollections) {
      deserializedCollections = deserializeEnvironmentVariableCollections(this.shellLaunchConfig.attachPersistentProcess.environmentVariableCollections);
    }
    const processManager = this._scopedInstantiationService.createInstance(
      TerminalProcessManager,
      this._instanceId,
      this.shellLaunchConfig?.cwd,
      deserializedCollections,
      this.shellLaunchConfig.attachPersistentProcess?.shellIntegrationNonce
    );
    this.capabilities.add(processManager.capabilities);
    this._register(processManager.onProcessReady(async (e) => {
      this._onProcessIdReady.fire(this);
      this._initialCwd = await this.getInitialCwd();
      if (!this._labelComputer) {
        this._labelComputer = this._register(this._scopedInstantiationService.createInstance(TerminalLabelComputer));
        this._register(this._labelComputer.onDidChangeLabel((e2) => {
          const wasChanged = this._title !== e2.title || this._description !== e2.description;
          if (wasChanged) {
            this._title = e2.title;
            this._description = e2.description;
            this._onTitleChanged.fire(this);
          }
        }));
      }
      if (this._shellLaunchConfig.name) {
        this._setTitle(this._shellLaunchConfig.name, TitleEventSource.Api);
      } else {
        setTimeout(() => {
          this._xtermReadyPromise.then((xterm) => {
            this._messageTitleDisposable.value = xterm.raw.onTitleChange((e2) => this._onTitleChange(e2));
          });
        });
        this._setTitle(this._shellLaunchConfig.executable, TitleEventSource.Process);
      }
    }));
    this._register(processManager.onProcessExit((exitCode) => this._onProcessExit(exitCode)));
    this._register(processManager.onDidChangeProperty(({ type, value }) => {
      switch (type) {
        case ProcessPropertyType.Cwd:
          this._cwd = value;
          this._labelComputer?.refreshLabel(this);
          break;
        case ProcessPropertyType.InitialCwd:
          this._initialCwd = value;
          this._cwd = this._initialCwd;
          this._setTitle(this.title, TitleEventSource.Config);
          this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
          this._onIconChanged.fire({ instance: this, userInitiated: false });
          break;
        case ProcessPropertyType.Title:
          this._setTitle(value ?? "", TitleEventSource.Process);
          break;
        case ProcessPropertyType.OverrideDimensions:
          this.setOverrideDimensions(value, true);
          break;
        case ProcessPropertyType.ResolvedShellLaunchConfig:
          this._setResolvedShellLaunchConfig(value);
          break;
        case ProcessPropertyType.ShellType:
          this.setShellType(value);
          break;
        case ProcessPropertyType.HasChildProcesses:
          this._onDidChangeHasChildProcesses.fire(value);
          break;
        case ProcessPropertyType.UsedShellIntegrationInjection:
          this._usedShellIntegrationInjection = true;
          break;
      }
    }));
    this._initialDataEventsListener.value = processManager.onProcessData((ev) => this._initialDataEvents?.push(ev.data));
    this._register(processManager.onProcessReplayComplete(() => this._onProcessReplayComplete.fire()));
    this._register(processManager.onEnvironmentVariableInfoChanged((e) => this._onEnvironmentVariableInfoChanged(e)));
    this._register(processManager.onPtyDisconnect(() => {
      if (this.xterm) {
        this.xterm.raw.options.disableStdin = true;
      }
      this.statusList.add({
        id: TerminalStatus.Disconnected,
        severity: Severity.Error,
        icon: Codicon.debugDisconnect,
        tooltip: nls.localize("disconnectStatus", "Lost connection to process")
      });
    }));
    this._register(processManager.onPtyReconnect(() => {
      if (this.xterm) {
        this.xterm.raw.options.disableStdin = false;
      }
      this.statusList.remove(TerminalStatus.Disconnected);
    }));
    return processManager;
  }
  async _createProcess() {
    if (this.isDisposed) {
      return;
    }
    const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(Schemas.file);
    if (activeWorkspaceRootUri) {
      const trusted = await this._trust();
      if (!trusted) {
        this._onProcessExit({ message: nls.localize("workspaceNotTrustedCreateTerminal", "Cannot launch a terminal process in an untrusted workspace") });
      }
    } else if (this._cwd && this._userHome && this._cwd !== this._userHome) {
      this._onProcessExit({
        message: nls.localize("workspaceNotTrustedCreateTerminalCwd", "Cannot launch a terminal process in an untrusted workspace with cwd {0} and userHome {1}", this._cwd, this._userHome)
      });
    }
    if (this._container && this._cols === 0 && this._rows === 0) {
      this._initDimensions();
      this.xterm?.raw.resize(this._cols || 80 /* DefaultCols */, this._rows || 30 /* DefaultRows */);
    }
    const originalIcon = this.shellLaunchConfig.icon;
    await this._processManager.createProcess(this._shellLaunchConfig, this._cols || 80 /* DefaultCols */, this._rows || 30 /* DefaultRows */).then((result) => {
      if (result) {
        if ("message" in result) {
          this._onProcessExit(result);
        } else if ("injectedArgs" in result) {
          this._injectedArgs = result.injectedArgs;
        }
      }
    });
    if (this.isDisposed) {
      return;
    }
    if (this.xterm?.shellIntegration) {
      this.capabilities.add(this.xterm.shellIntegration.capabilities);
    }
    if (originalIcon !== this.shellLaunchConfig.icon || this.shellLaunchConfig.color) {
      this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
      this._onIconChanged.fire({ instance: this, userInitiated: false });
    }
  }
  registerMarker(offset) {
    return this.xterm?.raw.registerMarker(offset);
  }
  addBufferMarker(properties) {
    this.capabilities.get(TerminalCapability.BufferMarkDetection)?.addMark(properties);
  }
  scrollToMark(startMarkId, endMarkId, highlight) {
    this.xterm?.markTracker.scrollToClosestMarker(startMarkId, endMarkId, highlight);
  }
  async freePortKillProcess(port, command) {
    await this._processManager?.freePortKillProcess(port);
    this.runCommand(command, false);
  }
  _onProcessData(ev) {
    const execIndex = ev.data.indexOf("\x1B]633;C\x07");
    if (execIndex !== -1) {
      if (ev.trackCommit) {
        this._writeProcessData(ev.data.substring(0, execIndex + "\x1B]633;C\x07".length));
        ev.writePromise = new Promise((r) => this._writeProcessData(ev.data.substring(execIndex + "\x1B]633;C\x07".length), r));
      } else {
        this._writeProcessData(ev.data.substring(0, execIndex + "\x1B]633;C\x07".length));
        this._writeProcessData(ev.data.substring(execIndex + "\x1B]633;C\x07".length));
      }
    } else {
      if (ev.trackCommit) {
        ev.writePromise = new Promise((r) => this._writeProcessData(ev.data, r));
      } else {
        this._writeProcessData(ev.data);
      }
    }
  }
  _writeProcessData(data, cb) {
    this._onWillData.fire(data);
    const messageId = ++this._latestXtermWriteData;
    this.xterm?.raw.write(data, () => {
      this._latestXtermParseData = messageId;
      this._processManager.acknowledgeDataEvent(data.length);
      cb?.();
      this._onData.fire(data);
    });
  }
  /**
   * Called when either a process tied to a terminal has exited or when a terminal renderer
   * simulates a process exiting (e.g. custom execution task).
   * @param exitCode The exit code of the process, this is undefined when the terminal was exited
   * through user action.
   */
  async _onProcessExit(exitCodeOrError) {
    if (this._isExiting) {
      return;
    }
    const parsedExitResult = parseExitResult(exitCodeOrError, this.shellLaunchConfig, this._processManager.processState, this._initialCwd);
    if (this._usedShellIntegrationInjection && this._processManager.processState === ProcessState.KilledDuringLaunch && parsedExitResult?.code !== 0) {
      this._relaunchWithShellIntegrationDisabled(parsedExitResult?.message);
      this._onExit.fire(exitCodeOrError);
      return;
    }
    this._isExiting = true;
    await this._flushXtermData();
    this._exitCode = parsedExitResult?.code;
    const exitMessage = parsedExitResult?.message;
    this._logService.debug("Terminal process exit", "instanceId", this.instanceId, "code", this._exitCode, "processState", this._processManager.processState);
    const waitOnExit = this.waitOnExit;
    if (waitOnExit && this._processManager.processState !== ProcessState.KilledByUser) {
      this._xtermReadyPromise.then((xterm) => {
        if (exitMessage) {
          xterm.raw.write(formatMessageForTerminal(exitMessage));
        }
        switch (typeof waitOnExit) {
          case "string":
            xterm.raw.write(formatMessageForTerminal(waitOnExit, { excludeLeadingNewLine: true }));
            break;
          case "function":
            if (this.exitCode !== void 0) {
              xterm.raw.write(formatMessageForTerminal(waitOnExit(this.exitCode), { excludeLeadingNewLine: true }));
            }
            break;
        }
        xterm.raw.options.disableStdin = true;
        if (xterm.raw.textarea) {
          this._attachPressAnyKeyToCloseListener(xterm.raw);
        }
      });
    } else {
      if (exitMessage) {
        const failedDuringLaunch = this._processManager.processState === ProcessState.KilledDuringLaunch;
        if (failedDuringLaunch || this._terminalConfigurationService.config.showExitAlert) {
          this._notificationService.notify({
            message: exitMessage,
            severity: Severity.Error,
            actions: { primary: [this._scopedInstantiationService.createInstance(TerminalLaunchHelpAction)] }
          });
        } else {
          this._logService.warn(exitMessage);
        }
      }
      this.dispose(TerminalExitReason.Process);
    }
    this._onExit.fire(exitCodeOrError);
    if (this.isDisposed) {
      this._onExit.dispose();
    }
  }
  _relaunchWithShellIntegrationDisabled(exitMessage) {
    this._shellLaunchConfig.ignoreShellIntegration = true;
    this.relaunch();
    this.statusList.add({
      id: TerminalStatus.ShellIntegrationAttentionNeeded,
      severity: Severity.Warning,
      icon: Codicon.warning,
      tooltip: `${exitMessage} ` + nls.localize("launchFailed.exitCodeOnlyShellIntegration", "Disabling shell integration in user settings might help."),
      hoverActions: [{
        commandId: TerminalCommandId.ShellIntegrationLearnMore,
        label: nls.localize("shellIntegration.learnMore", "Learn more about shell integration"),
        run: /* @__PURE__ */ __name(() => {
          this._openerService.open("https://code.visualstudio.com/docs/editor/integrated-terminal#_shell-integration");
        }, "run")
      }, {
        commandId: "workbench.action.openSettings",
        label: nls.localize("shellIntegration.openSettings", "Open user settings"),
        run: /* @__PURE__ */ __name(() => {
          this._commandService.executeCommand("workbench.action.openSettings", "terminal.integrated.shellIntegration.enabled");
        }, "run")
      }]
    });
    this._telemetryService.publicLog2("terminal/shellIntegrationFailureProcessExit");
  }
  /**
   * Ensure write calls to xterm.js have finished before resolving.
   */
  _flushXtermData() {
    if (this._latestXtermWriteData === this._latestXtermParseData) {
      return Promise.resolve();
    }
    let retries = 0;
    return new Promise((r) => {
      const interval = dom.disposableWindowInterval(dom.getActiveWindow().window, () => {
        if (this._latestXtermWriteData === this._latestXtermParseData || ++retries === 5) {
          interval.dispose();
          r();
        }
      }, 20);
    });
  }
  _attachPressAnyKeyToCloseListener(xterm) {
    if (xterm.textarea && !this._pressAnyKeyToCloseListener) {
      this._pressAnyKeyToCloseListener = dom.addDisposableListener(xterm.textarea, "keypress", (event) => {
        if (this._pressAnyKeyToCloseListener) {
          this._pressAnyKeyToCloseListener.dispose();
          this._pressAnyKeyToCloseListener = void 0;
          this.dispose(TerminalExitReason.Process);
          event.preventDefault();
        }
      });
    }
  }
  _writeInitialText(xterm, callback) {
    if (!this._shellLaunchConfig.initialText) {
      callback?.();
      return;
    }
    const text = typeof this._shellLaunchConfig.initialText === "string" ? this._shellLaunchConfig.initialText : this._shellLaunchConfig.initialText?.text;
    if (typeof this._shellLaunchConfig.initialText === "string") {
      xterm.raw.writeln(text, callback);
    } else {
      if (this._shellLaunchConfig.initialText.trailingNewLine) {
        xterm.raw.writeln(text, callback);
      } else {
        xterm.raw.write(text, callback);
      }
    }
  }
  async reuseTerminal(shell, reset = false) {
    this._pressAnyKeyToCloseListener?.dispose();
    this._pressAnyKeyToCloseListener = void 0;
    const xterm = this.xterm;
    if (xterm) {
      if (!reset) {
        await new Promise((r) => xterm.raw.write("\n\x1B[G", r));
      }
      if (shell.initialText) {
        this._shellLaunchConfig.initialText = shell.initialText;
        await new Promise((r) => this._writeInitialText(xterm, r));
      }
      if (this._isExiting && this._shellLaunchConfig.waitOnExit) {
        xterm.raw.options.disableStdin = false;
        this._isExiting = false;
      }
      if (reset) {
        xterm.clearDecorations();
      }
    }
    this.statusList.remove(TerminalStatus.RelaunchNeeded);
    if (!reset) {
      shell.initialText = " ";
    }
    this._shellLaunchConfig = shell;
    await this._processManager.relaunch(this._shellLaunchConfig, this._cols || 80 /* DefaultCols */, this._rows || 30 /* DefaultRows */, reset).then((result) => {
      if (result) {
        if ("message" in result) {
          this._onProcessExit(result);
        } else if ("injectedArgs" in result) {
          this._injectedArgs = result.injectedArgs;
        }
      }
    });
  }
  relaunch() {
    this.reuseTerminal(this._shellLaunchConfig, true);
  }
  _onTitleChange(title) {
    if (this.isTitleSetByProcess) {
      this._setTitle(title, TitleEventSource.Sequence);
    }
  }
  async _trust() {
    return await this._workspaceTrustRequestService.requestWorkspaceTrust(
      {
        message: nls.localize("terminal.requestTrust", "Creating a terminal process requires executing code")
      }
    ) === true;
  }
  async _onSelectionChange() {
    this._onDidChangeSelection.fire(this);
    if (this._configurationService.getValue(TerminalSettingId.CopyOnSelection)) {
      if (this._overrideCopySelection === false) {
        return;
      }
      if (this.hasSelection()) {
        await this.copySelection();
      }
    }
  }
  _overrideCopySelection = void 0;
  overrideCopyOnSelection(value) {
    if (this._overrideCopySelection !== void 0) {
      throw new Error("Cannot set a copy on selection override multiple times");
    }
    this._overrideCopySelection = value;
    return toDisposable(() => this._overrideCopySelection = void 0);
  }
  async _updateProcessCwd() {
    if (this.isDisposed || this.shellLaunchConfig.customPtyImplementation) {
      return;
    }
    try {
      const cwd = await this._refreshProperty(ProcessPropertyType.Cwd);
      if (typeof cwd !== "string") {
        throw new Error(`cwd is not a string ${cwd}`);
      }
    } catch (e) {
      if (e instanceof Error && e.message === "Cannot refresh property when process is not set") {
        return;
      }
      throw e;
    }
  }
  updateConfig() {
    this._setCommandsToSkipShell(this._terminalConfigurationService.config.commandsToSkipShell);
    this._refreshEnvironmentVariableInfoWidgetState(this._processManager.environmentVariableInfo);
  }
  async _updateUnicodeVersion() {
    this._processManager.setUnicodeVersion(this._terminalConfigurationService.config.unicodeVersion);
  }
  updateAccessibilitySupport() {
    this.xterm.raw.options.screenReaderMode = this._accessibilityService.isScreenReaderOptimized();
  }
  _setCommandsToSkipShell(commands) {
    const excludeCommands = commands.filter((command) => command[0] === "-").map((command) => command.slice(1));
    this._skipTerminalCommands = DEFAULT_COMMANDS_TO_SKIP_SHELL.filter((defaultCommand) => {
      return !excludeCommands.includes(defaultCommand);
    }).concat(commands);
  }
  layout(dimension) {
    this._lastLayoutDimensions = dimension;
    if (this.disableLayout) {
      return;
    }
    if (dimension.width <= 0 || dimension.height <= 0) {
      return;
    }
    const terminalWidth = this._evaluateColsAndRows(dimension.width, dimension.height);
    if (!terminalWidth) {
      return;
    }
    this._resize();
    if (!this._containerReadyBarrier.isOpen()) {
      this._containerReadyBarrier.open();
    }
    for (const contribution of this._contributions.values()) {
      if (!this.xterm) {
        this._xtermReadyPromise.then((xterm) => contribution.layout?.(xterm, dimension));
      } else {
        contribution.layout?.(this.xterm, dimension);
      }
    }
  }
  async _resize(immediate) {
    if (!this.xterm) {
      return;
    }
    let cols = this.cols;
    let rows = this.rows;
    if (this._isVisible && this._layoutSettingsChanged) {
      const font = this.xterm.getFont();
      const config = this._terminalConfigurationService.config;
      this.xterm.raw.options.letterSpacing = font.letterSpacing;
      this.xterm.raw.options.lineHeight = font.lineHeight;
      this.xterm.raw.options.fontSize = font.fontSize;
      this.xterm.raw.options.fontFamily = font.fontFamily;
      this.xterm.raw.options.fontWeight = config.fontWeight;
      this.xterm.raw.options.fontWeightBold = config.fontWeightBold;
      this._initDimensions();
      cols = this.cols;
      rows = this.rows;
      this._layoutSettingsChanged = false;
    }
    if (isNaN(cols) || isNaN(rows)) {
      return;
    }
    if (cols !== this.xterm.raw.cols || rows !== this.xterm.raw.rows) {
      if (this._fixedRows || this._fixedCols) {
        await this._updateProperty(ProcessPropertyType.FixedDimensions, { cols: this._fixedCols, rows: this._fixedRows });
      }
      this._onDimensionsChanged.fire();
    }
    TerminalInstance._lastKnownGridDimensions = { cols, rows };
    this._resizeDebouncer.resize(cols, rows, immediate ?? false);
  }
  async _updatePtyDimensions(rawXterm) {
    await this._processManager.setDimensions(rawXterm.cols, rawXterm.rows);
  }
  setShellType(shellType) {
    if (this._shellType === shellType) {
      return;
    }
    if (shellType) {
      this._shellType = shellType;
      this._terminalShellTypeContextKey.set(shellType?.toString());
      this._onDidChangeShellType.fire(shellType);
    }
  }
  _setAriaLabel(xterm, terminalId, title) {
    const labelParts = [];
    if (xterm && xterm.textarea) {
      if (title && title.length > 0) {
        labelParts.push(nls.localize("terminalTextBoxAriaLabelNumberAndTitle", "Terminal {0}, {1}", terminalId, title));
      } else {
        labelParts.push(nls.localize("terminalTextBoxAriaLabel", "Terminal {0}", terminalId));
      }
      const screenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
      if (!screenReaderOptimized) {
        labelParts.push(nls.localize("terminalScreenReaderMode", "Run the command: Toggle Screen Reader Accessibility Mode for an optimized screen reader experience"));
      }
      const accessibilityHelpKeybinding = this._keybindingService.lookupKeybinding(AccessibilityCommandId.OpenAccessibilityHelp)?.getLabel();
      if (this._configurationService.getValue(AccessibilityVerbositySettingId.Terminal) && accessibilityHelpKeybinding) {
        labelParts.push(nls.localize("terminalHelpAriaLabel", "Use {0} for terminal accessibility help", accessibilityHelpKeybinding));
      }
      xterm.textarea.setAttribute("aria-label", labelParts.join("\n"));
    }
  }
  _updateTitleProperties(title, eventSource) {
    if (!title) {
      return this._processName;
    }
    switch (eventSource) {
      case TitleEventSource.Process:
        if (this._processManager.os === OperatingSystem.Windows) {
          title = path.win32.parse(title).name;
        } else {
          const firstSpaceIndex = title.indexOf(" ");
          if (title.startsWith("/")) {
            title = path.basename(title);
          } else if (firstSpaceIndex > -1) {
            title = title.substring(0, firstSpaceIndex);
          }
        }
        this._processName = title;
        break;
      case TitleEventSource.Api:
        this._staticTitle = title;
        this._messageTitleDisposable.value = void 0;
        break;
      case TitleEventSource.Sequence:
        this._sequence = title;
        if (this._processManager.os === OperatingSystem.Windows && title.match(/^[a-zA-Z]:\\.+\.[a-zA-Z]{1,3}/)) {
          this._sequence = path.win32.parse(title).name;
        }
        break;
    }
    this._titleSource = eventSource;
    return title;
  }
  setOverrideDimensions(dimensions, immediate = false) {
    if (this._dimensionsOverride && this._dimensionsOverride.forceExactSize && !dimensions && this._rows === 0 && this._cols === 0) {
      this._cols = this._dimensionsOverride.cols;
      this._rows = this._dimensionsOverride.rows;
    }
    this._dimensionsOverride = dimensions;
    if (immediate) {
      this._resize(true);
    } else {
      this._resize();
    }
  }
  async setFixedDimensions() {
    const cols = await this._quickInputService.input({
      title: nls.localize("setTerminalDimensionsColumn", "Set Fixed Dimensions: Column"),
      placeHolder: "Enter a number of columns or leave empty for automatic width",
      validateInput: /* @__PURE__ */ __name(async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: "Enter a number or leave empty size automatically", severity: Severity.Error } : void 0, "validateInput")
    });
    if (cols === void 0) {
      return;
    }
    this._fixedCols = this._parseFixedDimension(cols);
    this._labelComputer?.refreshLabel(this);
    this._terminalHasFixedWidth.set(!!this._fixedCols);
    const rows = await this._quickInputService.input({
      title: nls.localize("setTerminalDimensionsRow", "Set Fixed Dimensions: Row"),
      placeHolder: "Enter a number of rows or leave empty for automatic height",
      validateInput: /* @__PURE__ */ __name(async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: "Enter a number or leave empty size automatically", severity: Severity.Error } : void 0, "validateInput")
    });
    if (rows === void 0) {
      return;
    }
    this._fixedRows = this._parseFixedDimension(rows);
    this._labelComputer?.refreshLabel(this);
    await this._refreshScrollbar();
    this._resize();
    this.focus();
  }
  _parseFixedDimension(value) {
    if (value === "") {
      return void 0;
    }
    const parsed = parseInt(value);
    if (parsed <= 0) {
      throw new Error(`Could not parse dimension "${value}"`);
    }
    return parsed;
  }
  async toggleSizeToContentWidth() {
    if (!this.xterm?.raw.buffer.active) {
      return;
    }
    if (this._hasScrollBar) {
      this._terminalHasFixedWidth.set(false);
      this._fixedCols = void 0;
      this._fixedRows = void 0;
      this._hasScrollBar = false;
      this._initDimensions();
      await this._resize();
    } else {
      const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement));
      const maxColsForTexture = Math.floor(4096 /* MaxCanvasWidth */ / (font.charWidth ?? 20));
      const proposedCols = Math.max(this.maxCols, Math.min(this.xterm.getLongestViewportWrappedLineLength(), maxColsForTexture));
      if (proposedCols > this.xterm.raw.cols) {
        this._fixedCols = proposedCols;
      }
    }
    await this._refreshScrollbar();
    this._labelComputer?.refreshLabel(this);
    this.focus();
  }
  _refreshScrollbar() {
    if (this._fixedCols || this._fixedRows) {
      return this._addScrollbar();
    }
    return this._removeScrollbar();
  }
  async _addScrollbar() {
    const charWidth = (this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement))).charWidth;
    if (!this.xterm?.raw.element || !this._container || !charWidth || !this._fixedCols) {
      return;
    }
    this._wrapperElement.classList.add("fixed-dims");
    this._hasScrollBar = true;
    this._initDimensions();
    await this._resize();
    this._terminalHasFixedWidth.set(true);
    if (!this._horizontalScrollbar) {
      this._horizontalScrollbar = this._register(new DomScrollableElement(this._wrapperElement, {
        vertical: ScrollbarVisibility.Hidden,
        horizontal: ScrollbarVisibility.Auto,
        useShadows: false,
        scrollYToX: false,
        consumeMouseWheelIfScrollbarIsNeeded: false
      }));
      this._container.appendChild(this._horizontalScrollbar.getDomNode());
    }
    this._horizontalScrollbar.setScrollDimensions({
      width: this.xterm.raw.element.clientWidth,
      scrollWidth: this._fixedCols * charWidth + 40
      // Padding + scroll bar
    });
    this._horizontalScrollbar.getDomNode().style.paddingBottom = "16px";
    if (isWindows) {
      for (let i = this.xterm.raw.buffer.active.viewportY; i < this.xterm.raw.buffer.active.length; i++) {
        const line = this.xterm.raw.buffer.active.getLine(i);
        line._line.isWrapped = false;
      }
    }
  }
  async _removeScrollbar() {
    if (!this._container || !this._horizontalScrollbar) {
      return;
    }
    this._horizontalScrollbar.getDomNode().remove();
    this._horizontalScrollbar.dispose();
    this._horizontalScrollbar = void 0;
    this._wrapperElement.remove();
    this._wrapperElement.classList.remove("fixed-dims");
    this._container.appendChild(this._wrapperElement);
  }
  _setResolvedShellLaunchConfig(shellLaunchConfig) {
    this._shellLaunchConfig.args = shellLaunchConfig.args;
    this._shellLaunchConfig.cwd = shellLaunchConfig.cwd;
    this._shellLaunchConfig.executable = shellLaunchConfig.executable;
    this._shellLaunchConfig.env = shellLaunchConfig.env;
  }
  _onEnvironmentVariableInfoChanged(info) {
    if (info.requiresAction) {
      this.xterm?.raw.textarea?.setAttribute("aria-label", nls.localize("terminalStaleTextBoxAriaLabel", "Terminal {0} environment is stale, run the 'Show Environment Information' command for more information", this._instanceId));
    }
    this._refreshEnvironmentVariableInfoWidgetState(info);
  }
  async _refreshEnvironmentVariableInfoWidgetState(info) {
    if (!info) {
      this.statusList.remove(TerminalStatus.RelaunchNeeded);
      this.statusList.remove(TerminalStatus.EnvironmentVariableInfoChangesActive);
      return;
    }
    if (
      // The change requires a relaunch
      info.requiresAction && // The feature is enabled
      this._terminalConfigurationService.config.environmentChangesRelaunch && // Has not been interacted with
      !this._processManager.hasWrittenData && // Not a feature terminal or is a reconnecting task terminal (TODO: Need to explain the latter case)
      (!this._shellLaunchConfig.isFeatureTerminal || this.reconnectionProperties && this._configurationService.getValue("task.reconnection") === true) && // Not a custom pty
      !this._shellLaunchConfig.customPtyImplementation && // Not an extension owned terminal
      !this._shellLaunchConfig.isExtensionOwnedTerminal && // Not a reconnected or revived terminal
      !this._shellLaunchConfig.attachPersistentProcess && // Not a Windows remote using ConPTY (#187084)
      !(this._processManager.remoteAuthority && this._terminalConfigurationService.config.windowsEnableConpty && await this._processManager.getBackendOS() === OperatingSystem.Windows)
    ) {
      this.relaunch();
      return;
    }
    const workspaceFolder = getWorkspaceForTerminal(this.shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
    this.statusList.add(info.getStatus({ workspaceFolder }));
  }
  async getInitialCwd() {
    if (!this._initialCwd) {
      this._initialCwd = this._processManager.initialCwd;
    }
    return this._initialCwd;
  }
  async getCwd() {
    if (this.capabilities.has(TerminalCapability.CwdDetection)) {
      return this.capabilities.get(TerminalCapability.CwdDetection).getCwd();
    } else if (this.capabilities.has(TerminalCapability.NaiveCwdDetection)) {
      return this.capabilities.get(TerminalCapability.NaiveCwdDetection).getCwd();
    }
    return this._processManager.initialCwd;
  }
  async _refreshProperty(type) {
    await this.processReady;
    return this._processManager.refreshProperty(type);
  }
  async _updateProperty(type, value) {
    return this._processManager.updateProperty(type, value);
  }
  async rename(title) {
    this._setTitle(title, TitleEventSource.Api);
  }
  _setTitle(title, eventSource) {
    const reset = !title;
    title = this._updateTitleProperties(title, eventSource);
    const titleChanged = title !== this._title;
    this._title = title;
    this._labelComputer?.refreshLabel(this, reset);
    this._setAriaLabel(this.xterm?.raw, this._instanceId, this._title);
    if (titleChanged) {
      this._onTitleChanged.fire(this);
    }
  }
  async changeIcon(icon) {
    if (icon) {
      this._icon = icon;
      this._onIconChanged.fire({ instance: this, userInitiated: true });
      return icon;
    }
    const iconPicker = this._scopedInstantiationService.createInstance(TerminalIconPicker);
    const pickedIcon = await iconPicker.pickIcons();
    iconPicker.dispose();
    if (!pickedIcon) {
      return void 0;
    }
    this._icon = pickedIcon;
    this._onIconChanged.fire({ instance: this, userInitiated: true });
    return pickedIcon;
  }
  async changeColor(color, skipQuickPick) {
    if (color) {
      this.shellLaunchConfig.color = color;
      this._onIconChanged.fire({ instance: this, userInitiated: true });
      return color;
    } else if (skipQuickPick) {
      this.shellLaunchConfig.color = "";
      this._onIconChanged.fire({ instance: this, userInitiated: true });
      return;
    }
    const icon = this._getIcon();
    if (!icon) {
      return;
    }
    const colorTheme = this._themeService.getColorTheme();
    const standardColors = getStandardColors(colorTheme);
    const colorStyleDisposable = createColorStyleElement(colorTheme);
    const items = [];
    for (const colorKey of standardColors) {
      const colorClass = getColorClass(colorKey);
      items.push({
        label: `$(${Codicon.circleFilled.id}) ${colorKey.replace("terminal.ansi", "")}`,
        id: colorKey,
        description: colorKey,
        iconClasses: [colorClass]
      });
    }
    items.push({ type: "separator" });
    const showAllColorsItem = { label: "Reset to default" };
    items.push(showAllColorsItem);
    const disposables = [];
    const quickPick = this._quickInputService.createQuickPick({ useSeparators: true });
    disposables.push(quickPick);
    quickPick.items = items;
    quickPick.matchOnDescription = true;
    quickPick.placeholder = nls.localize("changeColor", "Select a color for the terminal");
    quickPick.show();
    const result = await new Promise((r) => {
      disposables.push(quickPick.onDidHide(() => r(void 0)));
      disposables.push(quickPick.onDidAccept(() => r(quickPick.selectedItems[0])));
    });
    dispose(disposables);
    if (result) {
      this.shellLaunchConfig.color = result.id;
      this._onIconChanged.fire({ instance: this, userInitiated: true });
    }
    quickPick.hide();
    colorStyleDisposable.dispose();
    return result?.id;
  }
  forceScrollbarVisibility() {
    this._wrapperElement.classList.add("force-scrollbar");
  }
  resetScrollbarVisibility() {
    this._wrapperElement.classList.remove("force-scrollbar");
  }
  setParentContextKeyService(parentContextKeyService) {
    this._scopedContextKeyService.updateParent(parentContextKeyService);
  }
  async handleMouseEvent(event, contextMenu) {
    if (dom.isHTMLElement(event.target) && (event.target.classList.contains("scrollbar") || event.target.classList.contains("slider"))) {
      return { cancelContextMenu: true };
    }
    if (event.which === 2) {
      switch (this._terminalConfigurationService.config.middleClickBehavior) {
        case "paste":
          this.paste();
          break;
        case "default":
        default:
          this.focus();
          break;
      }
      return;
    }
    if (event.which === 3) {
      const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
      if (rightClickBehavior === "nothing") {
        if (!event.shiftKey) {
          return { cancelContextMenu: true };
        }
        return;
      } else if (rightClickBehavior === "copyPaste" || rightClickBehavior === "paste") {
        if (rightClickBehavior === "copyPaste" && event.shiftKey) {
          openContextMenu(dom.getActiveWindow(), event, this, contextMenu, this._contextMenuService);
          return;
        }
        if (rightClickBehavior === "copyPaste" && this.hasSelection()) {
          await this.copySelection();
          this.clearSelection();
        } else {
          if (BrowserFeatures.clipboard.readText) {
            this.paste();
          } else {
            this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${isMacintosh ? "\u2318" : "Ctrl"}+V instead.`);
          }
        }
        if (isMacintosh) {
          setTimeout(() => this.clearSelection(), 0);
        }
        return { cancelContextMenu: true };
      }
    }
  }
};
__decorateClass([
  debounce(50)
], TerminalInstance.prototype, "_fireMaximumDimensionsChanged", 1);
__decorateClass([
  debounce(1e3)
], TerminalInstance.prototype, "relaunch", 1);
__decorateClass([
  debounce(2e3)
], TerminalInstance.prototype, "_updateProcessCwd", 1);
TerminalInstance = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ITerminalConfigurationService),
  __decorateParam(7, ITerminalProfileResolverService),
  __decorateParam(8, IPathService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IPreferencesService),
  __decorateParam(12, IViewsService),
  __decorateParam(13, IClipboardService),
  __decorateParam(14, IThemeService),
  __decorateParam(15, IConfigurationService),
  __decorateParam(16, ITerminalLogService),
  __decorateParam(17, IStorageService),
  __decorateParam(18, IAccessibilityService),
  __decorateParam(19, IProductService),
  __decorateParam(20, IQuickInputService),
  __decorateParam(21, IWorkbenchEnvironmentService),
  __decorateParam(22, IWorkspaceContextService),
  __decorateParam(23, IEditorService),
  __decorateParam(24, IWorkspaceTrustRequestService),
  __decorateParam(25, IHistoryService),
  __decorateParam(26, ITelemetryService),
  __decorateParam(27, IOpenerService),
  __decorateParam(28, ICommandService),
  __decorateParam(29, IAccessibilitySignalService),
  __decorateParam(30, IViewDescriptorService)
], TerminalInstance);
let TerminalInstanceDragAndDropController = class extends Disposable {
  constructor(_container, _layoutService, _viewDescriptorService, _hostService) {
    super();
    this._container = _container;
    this._layoutService = _layoutService;
    this._viewDescriptorService = _viewDescriptorService;
    this._hostService = _hostService;
    this._register(toDisposable(() => this._clearDropOverlay()));
  }
  static {
    __name(this, "TerminalInstanceDragAndDropController");
  }
  _dropOverlay;
  _onDropFile = this._register(new Emitter());
  get onDropFile() {
    return this._onDropFile.event;
  }
  _onDropTerminal = this._register(new Emitter());
  get onDropTerminal() {
    return this._onDropTerminal.event;
  }
  _clearDropOverlay() {
    this._dropOverlay?.remove();
    this._dropOverlay = void 0;
  }
  onDragEnter(e) {
    if (!containsDragType(e, DataTransfers.FILES, DataTransfers.RESOURCES, TerminalDataTransfers.Terminals, CodeDataTransfers.FILES)) {
      return;
    }
    if (!this._dropOverlay) {
      this._dropOverlay = document.createElement("div");
      this._dropOverlay.classList.add("terminal-drop-overlay");
    }
    if (containsDragType(e, TerminalDataTransfers.Terminals)) {
      const side = this._getDropSide(e);
      this._dropOverlay.classList.toggle("drop-before", side === "before");
      this._dropOverlay.classList.toggle("drop-after", side === "after");
    }
    if (!this._dropOverlay.parentElement) {
      this._container.appendChild(this._dropOverlay);
    }
  }
  onDragLeave(e) {
    this._clearDropOverlay();
  }
  onDragEnd(e) {
    this._clearDropOverlay();
  }
  onDragOver(e) {
    if (!e.dataTransfer || !this._dropOverlay) {
      return;
    }
    if (containsDragType(e, TerminalDataTransfers.Terminals)) {
      const side = this._getDropSide(e);
      this._dropOverlay.classList.toggle("drop-before", side === "before");
      this._dropOverlay.classList.toggle("drop-after", side === "after");
    }
    this._dropOverlay.style.opacity = "1";
  }
  async onDrop(e) {
    this._clearDropOverlay();
    if (!e.dataTransfer) {
      return;
    }
    const terminalResources = getTerminalResourcesFromDragEvent(e);
    if (terminalResources) {
      for (const uri of terminalResources) {
        const side = this._getDropSide(e);
        this._onDropTerminal.fire({ uri, side });
      }
      return;
    }
    let path2;
    const rawResources = e.dataTransfer.getData(DataTransfers.RESOURCES);
    if (rawResources) {
      path2 = URI.parse(JSON.parse(rawResources)[0]);
    }
    const rawCodeFiles = e.dataTransfer.getData(CodeDataTransfers.FILES);
    if (!path2 && rawCodeFiles) {
      path2 = URI.file(JSON.parse(rawCodeFiles)[0]);
    }
    if (!path2 && e.dataTransfer.files.length > 0 && this._hostService.getPathForFile(e.dataTransfer.files[0])) {
      path2 = URI.file(this._hostService.getPathForFile(e.dataTransfer.files[0]));
    }
    if (!path2) {
      return;
    }
    this._onDropFile.fire(path2);
  }
  _getDropSide(e) {
    const target = this._container;
    if (!target) {
      return "after";
    }
    const rect = target.getBoundingClientRect();
    return this._getViewOrientation() === Orientation.HORIZONTAL ? e.clientX - rect.left < rect.width / 2 ? "before" : "after" : e.clientY - rect.top < rect.height / 2 ? "before" : "after";
  }
  _getViewOrientation() {
    const panelPosition = this._layoutService.getPanelPosition();
    const terminalLocation = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
    return terminalLocation === ViewContainerLocation.Panel && isHorizontal(panelPosition) ? Orientation.HORIZONTAL : Orientation.VERTICAL;
  }
};
TerminalInstanceDragAndDropController = __decorateClass([
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IHostService)
], TerminalInstanceDragAndDropController);
var TerminalLabelType = /* @__PURE__ */ ((TerminalLabelType2) => {
  TerminalLabelType2["Title"] = "title";
  TerminalLabelType2["Description"] = "description";
  return TerminalLabelType2;
})(TerminalLabelType || {});
let TerminalLabelComputer = class extends Disposable {
  constructor(_fileService, _terminalConfigurationService, _workspaceContextService) {
    super();
    this._fileService = _fileService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._workspaceContextService = _workspaceContextService;
  }
  static {
    __name(this, "TerminalLabelComputer");
  }
  _title = "";
  _description = "";
  get title() {
    return this._title;
  }
  get description() {
    return this._description;
  }
  _onDidChangeLabel = this._register(new Emitter());
  onDidChangeLabel = this._onDidChangeLabel.event;
  refreshLabel(instance, reset) {
    this._title = this.computeLabel(instance, this._terminalConfigurationService.config.tabs.title, "title" /* Title */, reset);
    this._description = this.computeLabel(instance, this._terminalConfigurationService.config.tabs.description, "description" /* Description */);
    if (this._title !== instance.title || this._description !== instance.description || reset) {
      this._onDidChangeLabel.fire({ title: this._title, description: this._description });
    }
  }
  computeLabel(instance, labelTemplate, labelType, reset) {
    const type = instance.shellLaunchConfig.attachPersistentProcess?.type || instance.shellLaunchConfig.type;
    const templateProperties = {
      cwd: instance.cwd || instance.initialCwd || "",
      cwdFolder: "",
      workspaceFolderName: instance.workspaceFolder?.name,
      workspaceFolder: instance.workspaceFolder ? path.basename(instance.workspaceFolder.uri.fsPath) : void 0,
      local: type === "Local" ? terminalStrings.typeLocal : void 0,
      process: instance.processName,
      sequence: instance.sequence,
      task: type === "Task" ? terminalStrings.typeTask : void 0,
      fixedDimensions: instance.fixedCols ? instance.fixedRows ? `\u2194${instance.fixedCols} \u2195${instance.fixedRows}` : `\u2194${instance.fixedCols}` : instance.fixedRows ? `\u2195${instance.fixedRows}` : "",
      separator: { label: this._terminalConfigurationService.config.tabs.separator }
    };
    templateProperties.workspaceFolderName = instance.workspaceFolder?.name ?? templateProperties.workspaceFolder;
    labelTemplate = labelTemplate.trim();
    if (!labelTemplate) {
      return labelType === "title" /* Title */ ? instance.processName || "" : "";
    }
    if (!reset && instance.staticTitle && labelType === "title" /* Title */) {
      return instance.staticTitle.replace(/[\n\r\t]/g, "") || templateProperties.process?.replace(/[\n\r\t]/g, "") || "";
    }
    const detection = instance.capabilities.has(TerminalCapability.CwdDetection) || instance.capabilities.has(TerminalCapability.NaiveCwdDetection);
    const folders = this._workspaceContextService.getWorkspace().folders;
    const multiRootWorkspace = folders.length > 1;
    if (templateProperties.cwd && detection && (!instance.shellLaunchConfig.isFeatureTerminal || labelType === "title" /* Title */)) {
      const cwdUri = URI.from({
        scheme: instance.workspaceFolder?.uri.scheme || Schemas.file,
        path: instance.cwd ? path.resolve(instance.cwd) : void 0
      });
      let showCwd = false;
      if (multiRootWorkspace) {
        showCwd = true;
      } else if (instance.workspaceFolder?.uri) {
        const caseSensitive = this._fileService.hasCapability(instance.workspaceFolder.uri, FileSystemProviderCapabilities.PathCaseSensitive);
        showCwd = cwdUri.fsPath.localeCompare(instance.workspaceFolder.uri.fsPath, void 0, { sensitivity: caseSensitive ? "case" : "base" }) !== 0;
      }
      if (showCwd) {
        templateProperties.cwdFolder = path.basename(templateProperties.cwd);
      }
    }
    const label = template(labelTemplate, templateProperties).replace(/[\n\r\t]/g, "").trim();
    return label === "" && labelType === "title" /* Title */ ? instance.processName || "" : label;
  }
};
TerminalLabelComputer = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ITerminalConfigurationService),
  __decorateParam(2, IWorkspaceContextService)
], TerminalLabelComputer);
function parseExitResult(exitCodeOrError, shellLaunchConfig, processState, initialCwd) {
  if (exitCodeOrError === void 0 || exitCodeOrError === 0) {
    return { code: exitCodeOrError, message: void 0 };
  }
  const code = typeof exitCodeOrError === "number" ? exitCodeOrError : exitCodeOrError.code;
  let message = void 0;
  switch (typeof exitCodeOrError) {
    case "number": {
      let commandLine = void 0;
      if (shellLaunchConfig.executable) {
        commandLine = shellLaunchConfig.executable;
        if (typeof shellLaunchConfig.args === "string") {
          commandLine += ` ${shellLaunchConfig.args}`;
        } else if (shellLaunchConfig.args && shellLaunchConfig.args.length) {
          commandLine += shellLaunchConfig.args.map((a) => ` '${a}'`).join();
        }
      }
      if (processState === ProcessState.KilledDuringLaunch) {
        if (commandLine) {
          message = nls.localize("launchFailed.exitCodeAndCommandLine", 'The terminal process "{0}" failed to launch (exit code: {1}).', commandLine, code);
        } else {
          message = nls.localize("launchFailed.exitCodeOnly", "The terminal process failed to launch (exit code: {0}).", code);
        }
      } else {
        if (commandLine) {
          message = nls.localize("terminated.exitCodeAndCommandLine", 'The terminal process "{0}" terminated with exit code: {1}.', commandLine, code);
        } else {
          message = nls.localize("terminated.exitCodeOnly", "The terminal process terminated with exit code: {0}.", code);
        }
      }
      break;
    }
    case "object": {
      if (exitCodeOrError.message.toString().includes("Could not find pty with id")) {
        break;
      }
      let innerMessage = exitCodeOrError.message;
      const conptyError = exitCodeOrError.message.match(/.*error code:\s*(\d+).*$/);
      if (conptyError) {
        const errorCode = conptyError.length > 1 ? parseInt(conptyError[1]) : void 0;
        switch (errorCode) {
          case 5:
            innerMessage = `Access was denied to the path containing your executable "${shellLaunchConfig.executable}". Manage and change your permissions to get this to work`;
            break;
          case 267:
            innerMessage = `Invalid starting directory "${initialCwd}", review your terminal.integrated.cwd setting`;
            break;
          case 1260:
            innerMessage = `Windows cannot open this program because it has been prevented by a software restriction policy. For more information, open Event Viewer or contact your system Administrator`;
            break;
        }
      }
      message = nls.localize("launchFailed.errorMessage", "The terminal process failed to launch: {0}.", innerMessage);
      break;
    }
  }
  return { code, message };
}
__name(parseExitResult, "parseExitResult");
let TerminalInstanceColorProvider = class {
  constructor(_instance, _viewDescriptorService) {
    this._instance = _instance;
    this._viewDescriptorService = _viewDescriptorService;
  }
  static {
    __name(this, "TerminalInstanceColorProvider");
  }
  getBackgroundColor(theme) {
    const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR);
    if (terminalBackground) {
      return terminalBackground;
    }
    if (this._instance.target === TerminalLocation.Editor) {
      return theme.getColor(editorBackground);
    }
    const location = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
    if (location === ViewContainerLocation.Panel) {
      return theme.getColor(PANEL_BACKGROUND);
    }
    return theme.getColor(SIDE_BAR_BACKGROUND);
  }
};
TerminalInstanceColorProvider = __decorateClass([
  __decorateParam(1, IViewDescriptorService)
], TerminalInstanceColorProvider);
export {
  TerminalInstance,
  TerminalInstanceColorProvider,
  TerminalLabelComputer,
  parseExitResult
};
//# sourceMappingURL=terminalInstance.js.map
