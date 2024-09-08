import type { IConfigurationService } from "../../configuration/common/configuration.js";
import type { ILogService } from "../../log/common/log.js";
import { type ITerminalExecutable, type ITerminalProfile, type ITerminalProfileSource } from "../common/terminal.js";
export declare function detectAvailableProfiles(profiles: unknown, defaultProfile: unknown, includeDetectedProfiles: boolean, configurationService: IConfigurationService, shellEnv?: typeof process.env, fsProvider?: IFsProvider, logService?: ILogService, variableResolver?: (text: string[]) => Promise<string[]>, testPwshSourcePaths?: string[]): Promise<ITerminalProfile[]>;
export interface IFsProvider {
    existsFile(path: string): Promise<boolean>;
    readFile(path: string): Promise<Buffer>;
}
export type IUnresolvedTerminalProfile = ITerminalExecutable | ITerminalProfileSource | null;
