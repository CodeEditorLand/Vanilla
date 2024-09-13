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
import {
  EventType,
  addDisposableListener,
  getWindowById
} from "../../../../base/browser/dom.js";
import { parentOriginHash } from "../../../../base/browser/iframe.js";
import {
  ThrottledDelayer,
  promiseWithResolvers
} from "../../../../base/common/async.js";
import {
  streamToBuffer
} from "../../../../base/common/buffer.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { COI } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.js";
import { WebviewPortMappingManager } from "../../../../platform/webview/common/webviewPortMapping.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import {
  decodeAuthority,
  webviewGenericCspSource,
  webviewRootResourceAuthority
} from "../common/webview.js";
import {
  WebviewResourceResponse,
  loadLocalResource
} from "./resourceLoading.js";
import {
  areWebviewContentOptionsEqual
} from "./webview.js";
import {
  WebviewFindWidget
} from "./webviewFindWidget.js";
var WebviewState;
((WebviewState2) => {
  let Type;
  ((Type2) => {
    Type2[Type2["Initializing"] = 0] = "Initializing";
    Type2[Type2["Ready"] = 1] = "Ready";
  })(Type = WebviewState2.Type || (WebviewState2.Type = {}));
  class Initializing {
    constructor(pendingMessages) {
      this.pendingMessages = pendingMessages;
    }
    static {
      __name(this, "Initializing");
    }
    type = 0 /* Initializing */;
  }
  WebviewState2.Initializing = Initializing;
  WebviewState2.Ready = { type: 1 /* Ready */ };
})(WebviewState || (WebviewState = {}));
const webviewIdContext = "webviewId";
let WebviewElement = class extends Disposable {
  constructor(initInfo, webviewThemeDataProvider, configurationService, contextMenuService, notificationService, _environmentService, _fileService, _logService, _remoteAuthorityResolverService, _telemetryService, _tunnelService, instantiationService, _accessibilityService) {
    super();
    this.webviewThemeDataProvider = webviewThemeDataProvider;
    this._environmentService = _environmentService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._telemetryService = _telemetryService;
    this._tunnelService = _tunnelService;
    this._accessibilityService = _accessibilityService;
    this.providedViewType = initInfo.providedViewType;
    this.origin = initInfo.origin ?? this.id;
    this._options = initInfo.options;
    this.extension = initInfo.extension;
    this._content = {
      html: "",
      title: initInfo.title,
      options: initInfo.contentOptions,
      state: void 0
    };
    this._portMappingManager = this._register(new WebviewPortMappingManager(
      () => this.extension?.location,
      () => this._content.options.portMapping || [],
      this._tunnelService
    ));
    this._element = this._createElement(initInfo.options, initInfo.contentOptions);
    this._register(this.on("no-csp-found", () => {
      this.handleNoCspFound();
    }));
    this._register(this.on("did-click-link", ({ uri }) => {
      this._onDidClickLink.fire(uri);
    }));
    this._register(this.on("onmessage", ({ message, transfer }) => {
      this._onMessage.fire({ message, transfer });
    }));
    this._register(this.on("did-scroll", ({ scrollYPercentage }) => {
      this._onDidScroll.fire({ scrollYPercentage });
    }));
    this._register(this.on("do-reload", () => {
      this.reload();
    }));
    this._register(this.on("do-update-state", (state) => {
      this.state = state;
      this._onDidUpdateState.fire(state);
    }));
    this._register(this.on("did-focus", () => {
      this.handleFocusChange(true);
    }));
    this._register(this.on("did-blur", () => {
      this.handleFocusChange(false);
    }));
    this._register(this.on("did-scroll-wheel", (event) => {
      this._onDidWheel.fire(event);
    }));
    this._register(this.on("did-find", ({ didFind }) => {
      this._hasFindResult.fire(didFind);
    }));
    this._register(this.on("fatal-error", (e) => {
      notificationService.error(localize("fatalErrorMessage", "Error loading webview: {0}", e.message));
      this._onFatalError.fire({ message: e.message });
    }));
    this._register(this.on("did-keydown", (data) => {
      this.handleKeyEvent("keydown", data);
    }));
    this._register(this.on("did-keyup", (data) => {
      this.handleKeyEvent("keyup", data);
    }));
    this._register(this.on("did-context-menu", (data) => {
      if (!this.element) {
        return;
      }
      if (!this._contextKeyService) {
        return;
      }
      const elementBox = this.element.getBoundingClientRect();
      const contextKeyService = this._contextKeyService.createOverlay([
        ...Object.entries(data.context),
        [webviewIdContext, this.providedViewType]
      ]);
      contextMenuService.showContextMenu({
        menuId: MenuId.WebviewContext,
        menuActionOptions: { shouldForwardArgs: true },
        contextKeyService,
        getActionsContext: /* @__PURE__ */ __name(() => ({ ...data.context, webview: this.providedViewType }), "getActionsContext"),
        getAnchor: /* @__PURE__ */ __name(() => ({
          x: elementBox.x + data.clientX,
          y: elementBox.y + data.clientY
        }), "getAnchor")
      });
      this._send("set-context-menu-visible", { visible: true });
    }));
    this._register(this.on("load-resource", async (entry) => {
      try {
        const authority = decodeAuthority(entry.authority);
        const uri = URI.from({
          scheme: entry.scheme,
          authority,
          path: decodeURIComponent(entry.path),
          // This gets re-encoded
          query: entry.query ? decodeURIComponent(entry.query) : entry.query
        });
        this.loadResource(entry.id, uri, entry.ifNoneMatch);
      } catch (e) {
        this._send("did-load-resource", {
          id: entry.id,
          status: 404,
          path: entry.path
        });
      }
    }));
    this._register(this.on("load-localhost", (entry) => {
      this.localLocalhost(entry.id, entry.origin);
    }));
    this._register(Event.runAndSubscribe(webviewThemeDataProvider.onThemeDataChanged, () => this.style()));
    this._register(_accessibilityService.onDidChangeReducedMotion(() => this.style()));
    this._register(_accessibilityService.onDidChangeScreenReaderOptimized(() => this.style()));
    this._register(contextMenuService.onDidHideContextMenu(() => this._send("set-context-menu-visible", { visible: false })));
    this._confirmBeforeClose = configurationService.getValue("window.confirmBeforeClose");
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("window.confirmBeforeClose")) {
        this._confirmBeforeClose = configurationService.getValue("window.confirmBeforeClose");
        this._send("set-confirm-before-close", this._confirmBeforeClose);
      }
    }));
    this._register(this.on("drag-start", () => {
      this._startBlockingIframeDragEvents();
    }));
    this._register(this.on("drag", (event) => {
      this.handleDragEvent("drag", event);
    }));
    if (initInfo.options.enableFindWidget) {
      this._webviewFindWidget = this._register(instantiationService.createInstance(WebviewFindWidget, this));
    }
  }
  static {
    __name(this, "WebviewElement");
  }
  id = generateUuid();
  /**
   * The provided identifier of this webview.
   */
  providedViewType;
  /**
   * The origin this webview itself is loaded from. May not be unique
   */
  origin;
  _windowId = void 0;
  get window() {
    return typeof this._windowId === "number" ? getWindowById(this._windowId)?.window : void 0;
  }
  _encodedWebviewOriginPromise;
  _encodedWebviewOrigin;
  get platform() {
    return "browser";
  }
  _expectedServiceWorkerVersion = 4;
  // Keep this in sync with the version in service-worker.js
  _element;
  get element() {
    return this._element;
  }
  _focused;
  get isFocused() {
    if (!this._focused) {
      return false;
    }
    if (!this.window) {
      return false;
    }
    if (this.window.document.activeElement && this.window.document.activeElement !== this.element) {
      return false;
    }
    return true;
  }
  _state = new WebviewState.Initializing([]);
  _content;
  _portMappingManager;
  _resourceLoadingCts = this._register(
    new CancellationTokenSource()
  );
  _contextKeyService;
  _confirmBeforeClose;
  _focusDelayer = this._register(new ThrottledDelayer(50));
  _onDidHtmlChange = this._register(
    new Emitter()
  );
  onDidHtmlChange = this._onDidHtmlChange.event;
  _messagePort;
  _messageHandlers = /* @__PURE__ */ new Map();
  _webviewFindWidget;
  checkImeCompletionState = true;
  _disposed = false;
  extension;
  _options;
  dispose() {
    this._disposed = true;
    this.element?.remove();
    this._element = void 0;
    this._messagePort = void 0;
    if (this._state.type === 0 /* Initializing */) {
      for (const message of this._state.pendingMessages) {
        message.resolve(false);
      }
      this._state.pendingMessages = [];
    }
    this._onDidDispose.fire();
    this._resourceLoadingCts.dispose(true);
    super.dispose();
  }
  setContextKeyService(contextKeyService) {
    this._contextKeyService = contextKeyService;
  }
  _onMissingCsp = this._register(
    new Emitter()
  );
  onMissingCsp = this._onMissingCsp.event;
  _onDidClickLink = this._register(new Emitter());
  onDidClickLink = this._onDidClickLink.event;
  _onDidReload = this._register(new Emitter());
  onDidReload = this._onDidReload.event;
  _onMessage = this._register(
    new Emitter()
  );
  onMessage = this._onMessage.event;
  _onDidScroll = this._register(
    new Emitter()
  );
  onDidScroll = this._onDidScroll.event;
  _onDidWheel = this._register(
    new Emitter()
  );
  onDidWheel = this._onDidWheel.event;
  _onDidUpdateState = this._register(
    new Emitter()
  );
  onDidUpdateState = this._onDidUpdateState.event;
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidBlur = this._register(new Emitter());
  onDidBlur = this._onDidBlur.event;
  _onFatalError = this._register(
    new Emitter()
  );
  onFatalError = this._onFatalError.event;
  _onDidDispose = this._register(new Emitter());
  onDidDispose = this._onDidDispose.event;
  postMessage(message, transfer) {
    return this._send("message", { message, transfer });
  }
  async _send(channel, data, _createElement = []) {
    if (this._state.type === 0 /* Initializing */) {
      const { promise, resolve } = promiseWithResolvers();
      this._state.pendingMessages.push({
        channel,
        data,
        transferable: _createElement,
        resolve
      });
      return promise;
    } else {
      return this.doPostMessage(channel, data, _createElement);
    }
  }
  _createElement(options, _contentOptions) {
    const element = document.createElement("iframe");
    element.name = this.id;
    element.className = `webview ${options.customClasses || ""}`;
    element.sandbox.add(
      "allow-scripts",
      "allow-same-origin",
      "allow-forms",
      "allow-pointer-lock",
      "allow-downloads"
    );
    const allowRules = ["cross-origin-isolated", "autoplay"];
    if (!isFirefox) {
      allowRules.push("clipboard-read", "clipboard-write");
    }
    element.setAttribute("allow", allowRules.join("; "));
    element.style.border = "none";
    element.style.width = "100%";
    element.style.height = "100%";
    element.focus = () => {
      this._doFocus();
    };
    return element;
  }
  _initElement(encodedWebviewOrigin, extension, options, targetWindow) {
    const params = {
      id: this.id,
      origin: this.origin,
      swVersion: String(this._expectedServiceWorkerVersion),
      extensionId: extension?.id.value ?? "",
      platform: this.platform,
      "vscode-resource-base-authority": webviewRootResourceAuthority,
      parentOrigin: targetWindow.origin
    };
    if (this._options.disableServiceWorker) {
      params.disableServiceWorker = "true";
    }
    if (this._environmentService.remoteAuthority) {
      params.remoteAuthority = this._environmentService.remoteAuthority;
    }
    if (options.purpose) {
      params.purpose = options.purpose;
    }
    COI.addSearchParam(params, true, true);
    const queryString = new URLSearchParams(params).toString();
    const fileName = isFirefox ? "index-no-csp.html" : "index.html";
    this.element.setAttribute(
      "src",
      `${this.webviewContentEndpoint(encodedWebviewOrigin)}/${fileName}?${queryString}`
    );
  }
  mountTo(element, targetWindow) {
    if (!this.element) {
      return;
    }
    this._windowId = targetWindow.vscodeWindowId;
    this._encodedWebviewOriginPromise = parentOriginHash(
      targetWindow.origin,
      this.origin
    ).then((id) => this._encodedWebviewOrigin = id);
    this._encodedWebviewOriginPromise.then((encodedWebviewOrigin) => {
      if (!this._disposed) {
        this._initElement(
          encodedWebviewOrigin,
          this.extension,
          this._options,
          targetWindow
        );
      }
    });
    this._registerMessageHandler(targetWindow);
    if (this._webviewFindWidget) {
      element.appendChild(this._webviewFindWidget.getDomNode());
    }
    for (const eventName of [
      EventType.MOUSE_DOWN,
      EventType.MOUSE_MOVE,
      EventType.DROP
    ]) {
      this._register(
        addDisposableListener(element, eventName, () => {
          this._stopBlockingIframeDragEvents();
        })
      );
    }
    for (const node of [element, targetWindow]) {
      this._register(
        addDisposableListener(node, EventType.DRAG_END, () => {
          this._stopBlockingIframeDragEvents();
        })
      );
    }
    element.id = this.id;
    element.appendChild(this.element);
  }
  _registerMessageHandler(targetWindow) {
    const subscription = this._register(
      addDisposableListener(
        targetWindow,
        "message",
        (e) => {
          if (!this._encodedWebviewOrigin || e?.data?.target !== this.id) {
            return;
          }
          if (e.origin !== this._webviewContentOrigin(this._encodedWebviewOrigin)) {
            console.log(
              `Skipped renderer receiving message due to mismatched origins: ${e.origin} ${this._webviewContentOrigin}`
            );
            return;
          }
          if (e.data.channel === "webview-ready") {
            if (this._messagePort) {
              return;
            }
            this._logService.debug(
              `Webview(${this.id}): webview ready`
            );
            this._messagePort = e.ports[0];
            this._messagePort.onmessage = (e2) => {
              const handlers = this._messageHandlers.get(
                e2.data.channel
              );
              if (!handlers) {
                console.log(
                  `No handlers found for '${e2.data.channel}'`
                );
                return;
              }
              handlers?.forEach(
                (handler) => handler(e2.data.data, e2)
              );
            };
            this.element?.classList.add("ready");
            if (this._state.type === 0 /* Initializing */) {
              this._state.pendingMessages.forEach(
                ({ channel, data, resolve }) => resolve(this.doPostMessage(channel, data))
              );
            }
            this._state = WebviewState.Ready;
            subscription.dispose();
          }
        }
      )
    );
  }
  _startBlockingIframeDragEvents() {
    if (this.element) {
      this.element.style.pointerEvents = "none";
    }
  }
  _stopBlockingIframeDragEvents() {
    if (this.element) {
      this.element.style.pointerEvents = "auto";
    }
  }
  webviewContentEndpoint(encodedWebviewOrigin) {
    const webviewExternalEndpoint = this._environmentService.webviewExternalEndpoint;
    if (!webviewExternalEndpoint) {
      throw new Error(
        `'webviewExternalEndpoint' has not been configured. Webviews will not work!`
      );
    }
    const endpoint = webviewExternalEndpoint.replace(
      "{{uuid}}",
      encodedWebviewOrigin
    );
    if (endpoint[endpoint.length - 1] === "/") {
      return endpoint.slice(0, endpoint.length - 1);
    }
    return endpoint;
  }
  _webviewContentOrigin(encodedWebviewOrigin) {
    const uri = URI.parse(
      this.webviewContentEndpoint(encodedWebviewOrigin)
    );
    return uri.scheme + "://" + uri.authority.toLowerCase();
  }
  doPostMessage(channel, data, transferable = []) {
    if (this.element && this._messagePort) {
      this._messagePort.postMessage(
        { channel, args: data },
        transferable
      );
      return true;
    }
    return false;
  }
  on(channel, handler) {
    let handlers = this._messageHandlers.get(channel);
    if (!handlers) {
      handlers = /* @__PURE__ */ new Set();
      this._messageHandlers.set(channel, handlers);
    }
    handlers.add(handler);
    return toDisposable(() => {
      this._messageHandlers.get(channel)?.delete(handler);
    });
  }
  _hasAlertedAboutMissingCsp = false;
  handleNoCspFound() {
    if (this._hasAlertedAboutMissingCsp) {
      return;
    }
    this._hasAlertedAboutMissingCsp = true;
    if (this.extension?.id) {
      if (this._environmentService.isExtensionDevelopment) {
        this._onMissingCsp.fire(this.extension.id);
      }
      const payload = {
        extension: this.extension.id.value
      };
      this._telemetryService.publicLog2(
        "webviewMissingCsp",
        payload
      );
    }
  }
  reload() {
    this.doUpdateContent(this._content);
    const subscription = this._register(
      this.on("did-load", () => {
        this._onDidReload.fire();
        subscription.dispose();
      })
    );
  }
  setHtml(html) {
    this.doUpdateContent({ ...this._content, html });
    this._onDidHtmlChange.fire(html);
  }
  setTitle(title) {
    this._content = { ...this._content, title };
    this._send("set-title", title);
  }
  set contentOptions(options) {
    this._logService.debug(
      `Webview(${this.id}): will update content options`
    );
    if (areWebviewContentOptionsEqual(options, this._content.options)) {
      this._logService.debug(
        `Webview(${this.id}): skipping content options update`
      );
      return;
    }
    this.doUpdateContent({ ...this._content, options });
  }
  set localResourcesRoot(resources) {
    this._content = {
      ...this._content,
      options: {
        ...this._content.options,
        localResourceRoots: resources
      }
    };
  }
  set state(state) {
    this._content = { ...this._content, state };
  }
  set initialScrollProgress(value) {
    this._send("initial-scroll-position", value);
  }
  doUpdateContent(newContent) {
    this._logService.debug(`Webview(${this.id}): will update content`);
    this._content = newContent;
    const allowScripts = !!this._content.options.allowScripts;
    this._send("content", {
      contents: this._content.html,
      title: this._content.title,
      options: {
        allowMultipleAPIAcquire: !!this._content.options.allowMultipleAPIAcquire,
        allowScripts,
        allowForms: this._content.options.allowForms ?? allowScripts
        // For back compat, we allow forms by default when scripts are enabled
      },
      state: this._content.state,
      cspSource: webviewGenericCspSource,
      confirmBeforeClose: this._confirmBeforeClose
    });
  }
  style() {
    let { styles, activeTheme, themeLabel, themeId } = this.webviewThemeDataProvider.getWebviewThemeData();
    if (this._options.transformCssVariables) {
      styles = this._options.transformCssVariables(styles);
    }
    const reduceMotion = this._accessibilityService.isMotionReduced();
    const screenReader = this._accessibilityService.isScreenReaderOptimized();
    this._send("styles", {
      styles,
      activeTheme,
      themeId,
      themeLabel,
      reduceMotion,
      screenReader
    });
  }
  handleFocusChange(isFocused) {
    this._focused = isFocused;
    if (isFocused) {
      this._onDidFocus.fire();
    } else {
      this._onDidBlur.fire();
    }
  }
  handleKeyEvent(type, event) {
    const emulatedKeyboardEvent = new KeyboardEvent(type, event);
    Object.defineProperty(emulatedKeyboardEvent, "target", {
      get: /* @__PURE__ */ __name(() => this.element, "get")
    });
    this.window?.dispatchEvent(emulatedKeyboardEvent);
  }
  handleDragEvent(type, event) {
    const emulatedDragEvent = new DragEvent(type, event);
    Object.defineProperty(emulatedDragEvent, "target", {
      get: /* @__PURE__ */ __name(() => this.element, "get")
    });
    this.window?.dispatchEvent(emulatedDragEvent);
  }
  windowDidDragStart() {
    this._startBlockingIframeDragEvents();
  }
  windowDidDragEnd() {
    this._stopBlockingIframeDragEvents();
  }
  selectAll() {
    this.execCommand("selectAll");
  }
  copy() {
    this.execCommand("copy");
  }
  paste() {
    this.execCommand("paste");
  }
  cut() {
    this.execCommand("cut");
  }
  undo() {
    this.execCommand("undo");
  }
  redo() {
    this.execCommand("redo");
  }
  execCommand(command) {
    if (this.element) {
      this._send("execCommand", command);
    }
  }
  async loadResource(id, uri, ifNoneMatch) {
    try {
      const result = await loadLocalResource(
        uri,
        {
          ifNoneMatch,
          roots: this._content.options.localResourceRoots || []
        },
        this._fileService,
        this._logService,
        this._resourceLoadingCts.token
      );
      switch (result.type) {
        case WebviewResourceResponse.Type.Success: {
          const buffer = await this.streamToBuffer(result.stream);
          return this._send(
            "did-load-resource",
            {
              id,
              status: 200,
              path: uri.path,
              mime: result.mimeType,
              data: buffer,
              etag: result.etag,
              mtime: result.mtime
            },
            [buffer]
          );
        }
        case WebviewResourceResponse.Type.NotModified: {
          return this._send("did-load-resource", {
            id,
            status: 304,
            // not modified
            path: uri.path,
            mime: result.mimeType,
            mtime: result.mtime
          });
        }
        case WebviewResourceResponse.Type.AccessDenied: {
          return this._send("did-load-resource", {
            id,
            status: 401,
            // unauthorized
            path: uri.path
          });
        }
      }
    } catch {
    }
    return this._send("did-load-resource", {
      id,
      status: 404,
      path: uri.path
    });
  }
  async streamToBuffer(stream) {
    const vsBuffer = await streamToBuffer(stream);
    return vsBuffer.buffer.buffer;
  }
  async localLocalhost(id, origin) {
    const authority = this._environmentService.remoteAuthority;
    const resolveAuthority = authority ? await this._remoteAuthorityResolverService.resolveAuthority(
      authority
    ) : void 0;
    const redirect = resolveAuthority ? await this._portMappingManager.getRedirect(
      resolveAuthority.authority,
      origin
    ) : void 0;
    return this._send("did-load-localhost", {
      id,
      origin,
      location: redirect
    });
  }
  focus() {
    this._doFocus();
    this.handleFocusChange(true);
  }
  _doFocus() {
    if (!this.element) {
      return;
    }
    try {
      this.element.contentWindow?.focus();
    } catch {
    }
    this._focusDelayer.trigger(async () => {
      if (!this.isFocused || !this.element) {
        return;
      }
      if (this.window?.document.activeElement && this.window.document.activeElement !== this.element && this.window.document.activeElement?.tagName !== "BODY") {
        return;
      }
      this.window?.document.body?.focus();
      this._send("focus", void 0);
    });
  }
  _hasFindResult = this._register(new Emitter());
  hasFindResult = this._hasFindResult.event;
  _onDidStopFind = this._register(new Emitter());
  onDidStopFind = this._onDidStopFind.event;
  /**
   * Webviews expose a stateful find API.
   * Successive calls to find will move forward or backward through onFindResults
   * depending on the supplied options.
   *
   * @param value The string to search for. Empty strings are ignored.
   */
  find(value, previous) {
    if (!this.element) {
      return;
    }
    this._send("find", { value, previous });
  }
  updateFind(value) {
    if (!value || !this.element) {
      return;
    }
    this._send("find", { value });
  }
  stopFind(keepSelection) {
    if (!this.element) {
      return;
    }
    this._send("find-stop", { clearSelection: !keepSelection });
    this._onDidStopFind.fire();
  }
  showFind(animated = true) {
    this._webviewFindWidget?.reveal(void 0, animated);
  }
  hideFind(animated = true) {
    this._webviewFindWidget?.hide(animated);
  }
  runFindAction(previous) {
    this._webviewFindWidget?.find(previous);
  }
};
WebviewElement = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IFileService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IRemoteAuthorityResolverService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, ITunnelService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IAccessibilityService)
], WebviewElement);
export {
  WebviewElement
};
//# sourceMappingURL=webviewElement.js.map
