import { Event } from "vs/base/common/event";
import { IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IExtensionHostStatusService } from "vs/server/node/extensionHostStatusService";
import { ServerConnectionToken } from "vs/server/node/serverConnectionToken";
import { IServerEnvironmentService } from "vs/server/node/serverEnvironmentService";
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
