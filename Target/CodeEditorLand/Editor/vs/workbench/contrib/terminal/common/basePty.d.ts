import { Disposable } from "vs/base/common/lifecycle";
import type { IPtyHostProcessReplayEvent } from "vs/platform/terminal/common/capabilities/capabilities";
import { type IProcessDataEvent, type IProcessProperty, type IProcessPropertyMap, type IProcessReadyEvent, type ITerminalChildProcess } from "vs/platform/terminal/common/terminal";
/**
 * Responsible for establishing and maintaining a connection with an existing terminal process
 * created on the local pty host.
 */
export declare abstract class BasePty extends Disposable implements Partial<ITerminalChildProcess> {
    readonly id: number;
    readonly shouldPersist: boolean;
    protected readonly _properties: IProcessPropertyMap;
    protected readonly _lastDimensions: {
        cols: number;
        rows: number;
    };
    protected _inReplay: boolean;
    protected readonly _onProcessData: any;
    readonly onProcessData: any;
    protected readonly _onProcessReplayComplete: any;
    readonly onProcessReplayComplete: any;
    protected readonly _onProcessReady: any;
    readonly onProcessReady: any;
    protected readonly _onDidChangeProperty: any;
    readonly onDidChangeProperty: any;
    protected readonly _onProcessExit: any;
    readonly onProcessExit: any;
    protected readonly _onRestoreCommands: any;
    readonly onRestoreCommands: any;
    constructor(id: number, shouldPersist: boolean);
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    handleData(e: string | IProcessDataEvent): void;
    handleExit(e: number | undefined): void;
    handleReady(e: IProcessReadyEvent): void;
    handleDidChangeProperty({ type, value }: IProcessProperty<any>): void;
    handleReplay(e: IPtyHostProcessReplayEvent): Promise<void>;
}
