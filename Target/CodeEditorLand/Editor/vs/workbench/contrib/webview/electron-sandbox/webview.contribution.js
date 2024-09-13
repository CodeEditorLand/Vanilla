import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IWebviewService } from "../browser/webview.js";
import * as webviewCommands from "./webviewCommands.js";
import { ElectronWebviewService } from "./webviewService.js";
registerSingleton(
  IWebviewService,
  ElectronWebviewService,
  InstantiationType.Delayed
);
registerAction2(webviewCommands.OpenWebviewDeveloperToolsAction);
//# sourceMappingURL=webview.contribution.js.map
