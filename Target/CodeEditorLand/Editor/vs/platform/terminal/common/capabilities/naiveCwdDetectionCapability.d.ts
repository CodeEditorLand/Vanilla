import { INaiveCwdDetectionCapability } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalChildProcess } from "vs/platform/terminal/common/terminal";
export declare class NaiveCwdDetectionCapability implements INaiveCwdDetectionCapability {
    private readonly _process;
    constructor(_process: ITerminalChildProcess);
    readonly type: any;
    private _cwd;
    private readonly _onDidChangeCwd;
    readonly onDidChangeCwd: any;
    getCwd(): Promise<string>;
}
