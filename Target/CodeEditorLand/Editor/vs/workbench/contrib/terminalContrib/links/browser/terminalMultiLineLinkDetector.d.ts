import type { IBufferLine, Terminal } from "@xterm/xterm";
import { ITerminalBackend, ITerminalLogService } from "vs/platform/terminal/common/terminal";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
import { ITerminalLinkDetector, ITerminalLinkResolver, ITerminalSimpleLink } from "vs/workbench/contrib/terminalContrib/links/browser/links";
export declare class TerminalMultiLineLinkDetector implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _processManager;
    private readonly _linkResolver;
    private readonly _logService;
    private readonly _uriIdentityService;
    private readonly _workspaceContextService;
    static id: string;
    readonly maxLinkLength = 500;
    constructor(xterm: Terminal, _processManager: Pick<ITerminalProcessManager, "initialCwd" | "os" | "remoteAuthority" | "userHome"> & {
        backend?: Pick<ITerminalBackend, "getWslPath">;
    }, _linkResolver: ITerminalLinkResolver, _logService: ITerminalLogService, _uriIdentityService: IUriIdentityService, _workspaceContextService: IWorkspaceContextService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): Promise<ITerminalSimpleLink[]>;
    private _isDirectoryInsideWorkspace;
}
