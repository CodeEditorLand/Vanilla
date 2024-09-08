import type { VSBuffer } from "../../../common/buffer.js";
import type { Event } from "../../../common/event.js";
import type { IMessagePassingProtocol } from "./ipc.js";
export interface Sender {
    send(channel: string, msg: unknown): void;
}
/**
 * The Electron `Protocol` leverages Electron style IPC communication (`ipcRenderer`, `ipcMain`)
 * for the implementation of the `IMessagePassingProtocol`. That style of API requires a channel
 * name for sending data.
 */
export declare class Protocol implements IMessagePassingProtocol {
    private sender;
    readonly onMessage: Event<VSBuffer>;
    constructor(sender: Sender, onMessage: Event<VSBuffer>);
    send(message: VSBuffer): void;
    disconnect(): void;
}
