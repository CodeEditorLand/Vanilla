import type * as net from "net";
import { type IServerAPI } from "./remoteExtensionHostAgentServer.js";
/**
 * invoked by server-main.js
 */
export declare function spawnCli(): void;
/**
 * invoked by server-main.js
 */
export declare function createServer(address: string | net.AddressInfo | null): Promise<IServerAPI>;
