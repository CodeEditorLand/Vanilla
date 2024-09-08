import { isMacintosh } from "../../../../base/common/platform.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { hasNativeTitlebar } from "../../../../platform/window/common/window.js";
class WindowIgnoreMenuShortcutsManager {
  constructor(configurationService, mainProcessService, _nativeHostService) {
    this._nativeHostService = _nativeHostService;
    this._isUsingNativeTitleBars = hasNativeTitlebar(configurationService);
    this._webviewMainService = ProxyChannel.toService(
      mainProcessService.getChannel("webview")
    );
  }
  _isUsingNativeTitleBars;
  _webviewMainService;
  didFocus() {
    this.setIgnoreMenuShortcuts(true);
  }
  didBlur() {
    this.setIgnoreMenuShortcuts(false);
  }
  get _shouldToggleMenuShortcutsEnablement() {
    return isMacintosh || this._isUsingNativeTitleBars;
  }
  setIgnoreMenuShortcuts(value) {
    if (this._shouldToggleMenuShortcutsEnablement) {
      this._webviewMainService.setIgnoreMenuShortcuts(
        { windowId: this._nativeHostService.windowId },
        value
      );
    }
  }
}
export {
  WindowIgnoreMenuShortcutsManager
};
