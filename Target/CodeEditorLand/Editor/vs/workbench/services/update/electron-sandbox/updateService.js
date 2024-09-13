import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { IUpdateService } from "../../../../platform/update/common/update.js";
import { UpdateChannelClient } from "../../../../platform/update/common/updateIpc.js";
registerMainProcessRemoteService(IUpdateService, "update", {
  channelClientCtor: UpdateChannelClient
});
//# sourceMappingURL=updateService.js.map
