import type { IBufferLine, Terminal } from "@xterm/xterm";
import { ITerminalCapabilityStore } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalBackend, ITerminalLogService } from "vs/platform/terminal/common/terminal";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
import { ITerminalLinkDetector, ITerminalLinkResolver, ITerminalSimpleLink } from "vs/workbench/contrib/terminalContrib/links/browser/links";
export declare class TerminalLocalLinkDetector implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _capabilities;
    private readonly _processManager;
    private readonly _linkResolver;
    private readonly _logService;
    private readonly _uriIdentityService;
    private readonly _workspaceContextService;
    static id: string;
    readonly maxLinkLength = 500;
    constructor(xterm: Terminal, _capabilities: ITerminalCapabilityStore, _processManager: Pick<ITerminalProcessManager, "initialCwd" | "os" | "remoteAuthority" | "userHome"> & {
        backend?: Pick<ITerminalBackend, "getWslPath">;
    }, _linkResolver: ITerminalLinkResolver, _logService: ITerminalLogService, _uriIdentityService: IUriIdentityService, _workspaceContextService: IWorkspaceContextService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): Promise<ITerminalSimpleLink[]>;
    private _isDirectoryInsideWorkspace;
    private _validateLinkCandidates;
    /**
     * Validates a set of link candidates and returns a link if validated.
     * @param linkText The link text, this should be undefined to use the link stat value
     * @param trimRangeMap A map of link candidates to the amount of buffer range they need trimmed.
     */
    private _validateAndGetLink;
}
