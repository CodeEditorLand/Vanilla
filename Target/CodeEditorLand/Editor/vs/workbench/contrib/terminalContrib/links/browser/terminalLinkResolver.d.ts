import { OperatingSystem } from "vs/base/common/platform";
import { URI } from "vs/base/common/uri";
import { IFileService } from "vs/platform/files/common/files";
import { ITerminalBackend } from "vs/platform/terminal/common/terminal";
import { ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
import { ITerminalLinkResolver, ResolvedLink } from "vs/workbench/contrib/terminalContrib/links/browser/links";
export declare class TerminalLinkResolver implements ITerminalLinkResolver {
    private readonly _fileService;
    private readonly _resolvedLinkCaches;
    constructor(_fileService: IFileService);
    resolveLink(processManager: Pick<ITerminalProcessManager, "initialCwd" | "os" | "remoteAuthority" | "userHome"> & {
        backend?: Pick<ITerminalBackend, "getWslPath">;
    }, link: string, uri?: URI): Promise<ResolvedLink>;
    protected _preprocessPath(link: string, initialCwd: string, os: OperatingSystem | undefined, userHome: string | undefined): string | null;
    private _getOsPath;
}
