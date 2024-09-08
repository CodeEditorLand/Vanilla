import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { IMenubarService } from "../../../../platform/menubar/electron-sandbox/menubar.js";
registerMainProcessRemoteService(IMenubarService, "menubar");
