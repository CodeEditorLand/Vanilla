import { registerSharedProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
import {
  IUserDataSyncResourceProviderService,
  IUserDataSyncService,
  IUserDataSyncStoreManagementService
} from "../../../../platform/userDataSync/common/userDataSync.js";
import { IUserDataSyncAccountService } from "../../../../platform/userDataSync/common/userDataSyncAccount.js";
import {
  UserDataSyncAccountServiceChannelClient,
  UserDataSyncStoreManagementServiceChannelClient
} from "../../../../platform/userDataSync/common/userDataSyncIpc.js";
import { IUserDataSyncMachinesService } from "../../../../platform/userDataSync/common/userDataSyncMachines.js";
import { UserDataSyncServiceChannelClient } from "../../../../platform/userDataSync/common/userDataSyncServiceIpc.js";
registerSharedProcessRemoteService(IUserDataSyncService, "userDataSync", {
  channelClientCtor: UserDataSyncServiceChannelClient
});
registerSharedProcessRemoteService(
  IUserDataSyncResourceProviderService,
  "IUserDataSyncResourceProviderService"
);
registerSharedProcessRemoteService(
  IUserDataSyncMachinesService,
  "userDataSyncMachines"
);
registerSharedProcessRemoteService(
  IUserDataSyncAccountService,
  "userDataSyncAccount",
  { channelClientCtor: UserDataSyncAccountServiceChannelClient }
);
registerSharedProcessRemoteService(
  IUserDataSyncStoreManagementService,
  "userDataSyncStoreManagement",
  { channelClientCtor: UserDataSyncStoreManagementServiceChannelClient }
);
