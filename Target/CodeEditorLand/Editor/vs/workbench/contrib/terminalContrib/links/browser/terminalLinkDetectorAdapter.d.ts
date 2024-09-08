import type { ILink, ILinkProvider, IViewportRange } from "@xterm/xterm";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { type ITerminalLinkDetector, type ITerminalSimpleLink } from "./links.js";
import { TerminalLink } from "./terminalLink.js";
export interface IActivateLinkEvent {
    link: ITerminalSimpleLink;
    event?: MouseEvent;
}
export interface IShowHoverEvent {
    link: TerminalLink;
    viewportRange: IViewportRange;
    modifierDownCallback?: () => void;
    modifierUpCallback?: () => void;
}
/**
 * Wrap a link detector object so it can be used in xterm.js
 */
export declare class TerminalLinkDetectorAdapter extends Disposable implements ILinkProvider {
    private readonly _detector;
    private readonly _instantiationService;
    private _activeLinks;
    private readonly _onDidActivateLink;
    readonly onDidActivateLink: import("../../../../../base/common/event.js").Event<IActivateLinkEvent>;
    private readonly _onDidShowHover;
    readonly onDidShowHover: import("../../../../../base/common/event.js").Event<IShowHoverEvent>;
    constructor(_detector: ITerminalLinkDetector, _instantiationService: IInstantiationService);
    private _activeProvideLinkRequests;
    provideLinks(bufferLineNumber: number, callback: (links: ILink[] | undefined) => void): Promise<void>;
    private _provideLinks;
    private _createTerminalLink;
    private _getLabel;
}
