import { Disposable } from "vs/base/common/lifecycle";
import { ICwdDetectionCapability } from "vs/platform/terminal/common/capabilities/capabilities";
export declare class CwdDetectionCapability extends Disposable implements ICwdDetectionCapability {
    readonly type: any;
    private _cwd;
    private _cwds;
    /**
     * Gets the list of cwds seen in this session in order of last accessed.
     */
    get cwds(): string[];
    private readonly _onDidChangeCwd;
    readonly onDidChangeCwd: any;
    getCwd(): string;
    updateCwd(cwd: string): void;
}
