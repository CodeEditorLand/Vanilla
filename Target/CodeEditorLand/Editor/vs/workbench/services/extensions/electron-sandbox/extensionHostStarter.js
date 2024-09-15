import {
  IExtensionHostStarter,
  ipcExtensionHostStarterChannelName
} from "../../../../platform/extensions/common/extensionHostStarter.js";
import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
registerMainProcessRemoteService(
  IExtensionHostStarter,
  ipcExtensionHostStarterChannelName
);
//# sourceMappingURL=extensionHostStarter.js.map
