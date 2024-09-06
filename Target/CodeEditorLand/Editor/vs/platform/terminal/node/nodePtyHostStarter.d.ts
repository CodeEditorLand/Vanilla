import { Disposable } from "vs/base/common/lifecycle";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { IReconnectConstants } from "vs/platform/terminal/common/terminal";
import { IPtyHostConnection, IPtyHostStarter } from "vs/platform/terminal/node/ptyHost";
export declare class NodePtyHostStarter extends Disposable implements IPtyHostStarter {
    private readonly _reconnectConstants;
    private readonly _environmentService;
    constructor(_reconnectConstants: IReconnectConstants, _environmentService: INativeEnvironmentService);
    start(): IPtyHostConnection;
}
