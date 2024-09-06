import { VSBuffer } from "vs/base/common/buffer";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ISocket, SocketCloseEvent, SocketDiagnosticsEventType } from "vs/base/parts/ipc/common/ipc.net";
export declare const makeRawSocketHeaders: (path: string, query: string, deubgLabel: string) => string;
export declare const socketRawEndHeaderSequence: any;
export interface RemoteSocketHalf {
    onData: Emitter<VSBuffer>;
    onClose: Emitter<SocketCloseEvent>;
    onEnd: Emitter<void>;
}
/** Should be called immediately after making a ManagedSocket to make it ready for data flow. */
export declare function connectManagedSocket<T extends ManagedSocket>(socket: T, path: string, query: string, debugLabel: string, half: RemoteSocketHalf): Promise<T>;
export declare abstract class ManagedSocket extends Disposable implements ISocket {
    private readonly debugLabel;
    private readonly pausableDataEmitter;
    onData: Event<VSBuffer>;
    onClose: Event<SocketCloseEvent>;
    onEnd: Event<void>;
    private readonly didDisposeEmitter;
    onDidDispose: any;
    private ended;
    protected constructor(debugLabel: string, half: RemoteSocketHalf);
    /** Pauses data events until a new listener comes in onData() */
    pauseData(): void;
    /** Flushes data to the socket. */
    drain(): Promise<void>;
    /** Ends the remote socket. */
    end(): void;
    abstract write(buffer: VSBuffer): void;
    protected abstract closeRemote(): void;
    traceSocketEvent(type: SocketDiagnosticsEventType, data?: any): void;
    dispose(): void;
}
