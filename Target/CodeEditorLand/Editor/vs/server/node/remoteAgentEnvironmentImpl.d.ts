import type { Event } from "../../base/common/event.js";
import type { IServerChannel } from "../../base/parts/ipc/common/ipc.js";
import type { IUserDataProfilesService } from "../../platform/userDataProfile/common/userDataProfile.js";
import type { IExtensionHostStatusService } from "./extensionHostStatusService.js";
import { type ServerConnectionToken } from "./serverConnectionToken.js";
import type { IServerEnvironmentService } from "./serverEnvironmentService.js";
export declare class RemoteAgentEnvironmentChannel implements IServerChannel {
    private readonly _connectionToken;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _extensionHostStatusService;
    private static _namePool;
    constructor(_connectionToken: ServerConnectionToken, _environmentService: IServerEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _extensionHostStatusService: IExtensionHostStatusService);
    call(_: any, command: string, arg?: any): Promise<any>;
    listen(_: any, event: string, arg: any): Event<any>;
    private _getEnvironmentData;
}
