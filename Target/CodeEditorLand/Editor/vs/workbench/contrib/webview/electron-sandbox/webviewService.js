import { WebviewService } from "../browser/webviewService.js";
import { ElectronWebviewElement } from "./webviewElement.js";
class ElectronWebviewService extends WebviewService {
  createWebviewElement(initInfo) {
    const webview = this._instantiationService.createInstance(
      ElectronWebviewElement,
      initInfo,
      this._webviewThemeDataProvider
    );
    this.registerNewWebview(webview);
    return webview;
  }
}
export {
  ElectronWebviewService
};
