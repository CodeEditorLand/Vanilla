import { type IProcessEnvironment } from "../../../base/common/platform.js";
import type { IConfigurationService } from "../../configuration/common/configuration.js";
import type { NativeParsedArgs } from "../../environment/common/argv.js";
import type { ILogService } from "../../log/common/log.js";
/**
 * Resolves the shell environment by spawning a shell. This call will cache
 * the shell spawning so that subsequent invocations use that cached result.
 *
 * Will throw an error if:
 * - we hit a timeout of `MAX_SHELL_RESOLVE_TIME`
 * - any other error from spawning a shell to figure out the environment
 */
export declare function getResolvedShellEnv(configurationService: IConfigurationService, logService: ILogService, args: NativeParsedArgs, env: IProcessEnvironment): Promise<typeof process.env>;
