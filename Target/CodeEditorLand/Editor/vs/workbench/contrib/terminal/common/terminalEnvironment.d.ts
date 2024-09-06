import { IProcessEnvironment, OperatingSystem } from "vs/base/common/platform";
import { URI } from "vs/base/common/uri";
import { ILogService } from "vs/platform/log/common/log";
import { IShellLaunchConfig, ITerminalBackend, ITerminalEnvironment, TerminalShellType } from "vs/platform/terminal/common/terminal";
import { IWorkspaceContextService, IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { IConfigurationResolverService } from "vs/workbench/services/configurationResolver/common/configurationResolver";
import { IHistoryService } from "vs/workbench/services/history/common/history";
export declare function mergeEnvironments(parent: IProcessEnvironment, other: ITerminalEnvironment | undefined): void;
export declare function addTerminalEnvironmentKeys(env: IProcessEnvironment, version: string | undefined, locale: string | undefined, detectLocale: "auto" | "off" | "on"): void;
export declare function shouldSetLangEnvVariable(env: IProcessEnvironment, detectLocale: "auto" | "off" | "on"): boolean;
export declare function getLangEnvVariable(locale?: string): string;
export declare function getCwd(shell: IShellLaunchConfig, userHome: string | undefined, variableResolver: VariableResolver | undefined, root: URI | undefined, customCwd: string | undefined, logService?: ILogService): Promise<string>;
export type VariableResolver = (str: string) => Promise<string>;
export declare function createVariableResolver(lastActiveWorkspace: IWorkspaceFolder | undefined, env: IProcessEnvironment, configurationResolverService: IConfigurationResolverService | undefined): VariableResolver | undefined;
export declare function createTerminalEnvironment(shellLaunchConfig: IShellLaunchConfig, envFromConfig: ITerminalEnvironment | undefined, variableResolver: VariableResolver | undefined, version: string | undefined, detectLocale: "auto" | "off" | "on", baseEnv: IProcessEnvironment): Promise<IProcessEnvironment>;
/**
 * Takes a path and returns the properly escaped path to send to a given shell. On Windows, this
 * included trying to prepare the path for WSL if needed.
 *
 * @param originalPath The path to be escaped and formatted.
 * @param executable The executable off the shellLaunchConfig.
 * @param title The terminal's title.
 * @param shellType The type of shell the path is being sent to.
 * @param backend The backend for the terminal.
 * @param isWindowsFrontend Whether the frontend is Windows, this is only exposed for injection via
 * tests.
 * @returns An escaped version of the path to be execuded in the terminal.
 */
export declare function preparePathForShell(resource: string | URI, executable: string | undefined, title: string, shellType: TerminalShellType | undefined, backend: Pick<ITerminalBackend, "getWslPath"> | undefined, os: OperatingSystem | undefined, isWindowsFrontend?: boolean): Promise<string>;
export declare function getWorkspaceForTerminal(cwd: URI | string | undefined, workspaceContextService: IWorkspaceContextService, historyService: IHistoryService): IWorkspaceFolder | undefined;
