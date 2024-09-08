import { Disposable } from "../../../base/common/lifecycle.js";
import { type INativeEnvironmentService } from "../../environment/common/environment.js";
import type { IReconnectConstants } from "../common/terminal.js";
import type { IPtyHostConnection, IPtyHostStarter } from "./ptyHost.js";
export declare class NodePtyHostStarter extends Disposable implements IPtyHostStarter {
    private readonly _reconnectConstants;
    private readonly _environmentService;
    constructor(_reconnectConstants: IReconnectConstants, _environmentService: INativeEnvironmentService);
    start(): IPtyHostConnection;
}
