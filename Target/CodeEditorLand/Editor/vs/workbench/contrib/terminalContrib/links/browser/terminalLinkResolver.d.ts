import { OperatingSystem } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import type { ITerminalBackend } from "../../../../../platform/terminal/common/terminal.js";
import type { ITerminalProcessManager } from "../../../terminal/common/terminal.js";
import type { ITerminalLinkResolver, ResolvedLink } from "./links.js";
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
