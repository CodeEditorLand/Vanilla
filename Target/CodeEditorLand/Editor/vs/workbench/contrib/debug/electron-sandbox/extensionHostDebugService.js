import { IExtensionHostDebugService } from "../../../../platform/debug/common/extensionHostDebug.js";
import {
  ExtensionHostDebugBroadcastChannel,
  ExtensionHostDebugChannelClient
} from "../../../../platform/debug/common/extensionHostDebugIpc.js";
import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
registerMainProcessRemoteService(
  IExtensionHostDebugService,
  ExtensionHostDebugBroadcastChannel.ChannelName,
  { channelClientCtor: ExtensionHostDebugChannelClient }
);
