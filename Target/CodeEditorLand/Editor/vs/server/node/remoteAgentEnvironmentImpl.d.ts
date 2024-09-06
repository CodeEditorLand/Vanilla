import { Event } from "../../base/common/event.js";
import { IServerChannel } from "../../base/parts/ipc/common/ipc.js";
import { IUserDataProfilesService } from "../../platform/userDataProfile/common/userDataProfile.js";
import { IExtensionHostStatusService } from "./extensionHostStatusService.js";
import { ServerConnectionToken } from "./serverConnectionToken.js";
import { IServerEnvironmentService } from "./serverEnvironmentService.js";
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
