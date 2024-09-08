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
import { Delayer } from "../../../../base/common/async.js";
import { Schemas } from "../../../../base/common/network.js";
import { consumeStream } from "../../../../base/common/stream.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { WebviewElement } from "../browser/webviewElement.js";
import { WindowIgnoreMenuShortcutsManager } from "./windowIgnoreMenuShortcutsManager.js";
let ElectronWebviewElement = class extends WebviewElement {
  constructor(initInfo, webviewThemeDataProvider, contextMenuService, tunnelService, fileService, telemetryService, environmentService, remoteAuthorityResolverService, logService, configurationService, mainProcessService, notificationService, _nativeHostService, instantiationService, accessibilityService) {
    super(
      initInfo,
      webviewThemeDataProvider,
      configurationService,
      contextMenuService,
      notificationService,
      environmentService,
      fileService,
      logService,
      remoteAuthorityResolverService,
      telemetryService,
      tunnelService,
      instantiationService,
      accessibilityService
    );
    this._nativeHostService = _nativeHostService;
    this._webviewKeyboardHandler = new WindowIgnoreMenuShortcutsManager(
      configurationService,
      mainProcessService,
      _nativeHostService
    );
    this._webviewMainService = ProxyChannel.toService(
      mainProcessService.getChannel("webview")
    );
    if (initInfo.options.enableFindWidget) {
      this._register(
        this.onDidHtmlChange((newContent) => {
          if (this._findStarted && this._cachedHtmlContent !== newContent) {
            this.stopFind(false);
            this._cachedHtmlContent = newContent;
          }
        })
      );
      this._register(
        this._webviewMainService.onFoundInFrame((result) => {
          this._hasFindResult.fire(result.matches > 0);
        })
      );
    }
  }
  _webviewKeyboardHandler;
  _findStarted = false;
  _cachedHtmlContent;
  _webviewMainService;
  _iframeDelayer = this._register(new Delayer(200));
  get platform() {
    return "electron";
  }
  dispose() {
    this._webviewKeyboardHandler.didBlur();
    super.dispose();
  }
  webviewContentEndpoint(iframeId) {
    return `${Schemas.vscodeWebview}://${iframeId}`;
  }
  streamToBuffer(stream) {
    return consumeStream(
      stream,
      (buffers) => {
        const totalLength = buffers.reduce(
          (prev, curr) => prev + curr.byteLength,
          0
        );
        const ret = new ArrayBuffer(totalLength);
        const view = new Uint8Array(ret);
        let offset = 0;
        for (const element of buffers) {
          view.set(element.buffer, offset);
          offset += element.byteLength;
        }
        return ret;
      }
    );
  }
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
    if (this._findStarted) {
      const options = {
        forward: !previous,
        findNext: false,
        matchCase: false
      };
      this._webviewMainService.findInFrame(
        { windowId: this._nativeHostService.windowId },
        this.id,
        value,
        options
      );
    } else {
      this.updateFind(value);
    }
  }
  updateFind(value) {
    if (!value || !this.element) {
      return;
    }
    const options = {
      forward: true,
      findNext: true,
      matchCase: false
    };
    this._iframeDelayer.trigger(() => {
      this._findStarted = true;
      this._webviewMainService.findInFrame(
        { windowId: this._nativeHostService.windowId },
        this.id,
        value,
        options
      );
    });
  }
  stopFind(keepSelection) {
    if (!this.element) {
      return;
    }
    this._iframeDelayer.cancel();
    this._findStarted = false;
    this._webviewMainService.stopFindInFrame(
      { windowId: this._nativeHostService.windowId },
      this.id,
      {
        keepSelection
      }
    );
    this._onDidStopFind.fire();
  }
  handleFocusChange(isFocused) {
    super.handleFocusChange(isFocused);
    if (isFocused) {
      this._webviewKeyboardHandler.didFocus();
    } else {
      this._webviewKeyboardHandler.didBlur();
    }
  }
};
ElectronWebviewElement = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, ITunnelService),
  __decorateParam(4, IFileService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, IRemoteAuthorityResolverService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IMainProcessService),
  __decorateParam(11, INotificationService),
  __decorateParam(12, INativeHostService),
  __decorateParam(13, IInstantiationService),
  __decorateParam(14, IAccessibilityService)
], ElectronWebviewElement);
export {
  ElectronWebviewElement
};
