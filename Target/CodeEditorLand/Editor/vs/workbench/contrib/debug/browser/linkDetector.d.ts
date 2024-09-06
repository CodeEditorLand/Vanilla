import { DisposableStore } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IFileService } from "vs/platform/files/common/files";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITunnelService } from "vs/platform/tunnel/common/tunnel";
import { IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { IDebugSession } from "vs/workbench/contrib/debug/common/debug";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IPathService } from "vs/workbench/services/path/common/pathService";
export declare const enum DebugLinkHoverBehavior {
    /** A nice workbench hover */
    Rich = 0,
    /**
     * Basic browser hover
     * @deprecated Consumers should adopt `rich` by propagating disposables appropriately
     */
    Basic = 1,
    /** No hover */
    None = 2
}
/** Store implies HoverBehavior=rich */
export type DebugLinkHoverBehaviorTypeData = {
    type: DebugLinkHoverBehavior.None | DebugLinkHoverBehavior.Basic;
} | {
    type: DebugLinkHoverBehavior.Rich;
    store: DisposableStore;
};
export declare class LinkDetector {
    private readonly editorService;
    private readonly fileService;
    private readonly openerService;
    private readonly pathService;
    private readonly tunnelService;
    private readonly environmentService;
    private readonly configurationService;
    private readonly hoverService;
    constructor(editorService: IEditorService, fileService: IFileService, openerService: IOpenerService, pathService: IPathService, tunnelService: ITunnelService, environmentService: IWorkbenchEnvironmentService, configurationService: IConfigurationService, hoverService: IHoverService);
    /**
     * Matches and handles web urls, absolute and relative file links in the string provided.
     * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/>.
     * 'onclick' event is attached to all anchored links that opens them in the editor.
     * When splitLines is true, each line of the text, even if it contains no links, is wrapped in a <span>
     * and added as a child of the returned <span>.
     * If a `hoverBehavior` is passed, hovers may be added using the workbench hover service.
     * This should be preferred for new code where hovers are desirable.
     */
    linkify(text: string, splitLines?: boolean, workspaceFolder?: IWorkspaceFolder, includeFulltext?: boolean, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
    /**
     * Linkifies a location reference.
     */
    linkifyLocation(text: string, locationReference: number, session: IDebugSession, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
    private createWebLink;
    private createPathLink;
    private createLink;
    private decorateLink;
    private detectLinks;
}
