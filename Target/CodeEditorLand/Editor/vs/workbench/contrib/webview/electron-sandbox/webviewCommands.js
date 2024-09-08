import { getActiveWindow } from "../../../../base/browser/dom.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
class OpenWebviewDeveloperToolsAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.webview.openDeveloperTools",
      title: nls.localize2(
        "openToolsLabel",
        "Open Webview Developer Tools"
      ),
      category: Categories.Developer,
      metadata: {
        description: nls.localize(
          "openToolsDescription",
          "Opens Developer Tools for active webviews"
        )
      },
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const iframeWebviewElements = getActiveWindow().document.querySelectorAll("iframe.webview.ready");
    if (iframeWebviewElements.length) {
      console.info(
        nls.localize(
          "iframeWebviewAlert",
          "Using standard dev tools to debug iframe based webview"
        )
      );
      nativeHostService.openDevTools();
    }
  }
}
export {
  OpenWebviewDeveloperToolsAction
};
