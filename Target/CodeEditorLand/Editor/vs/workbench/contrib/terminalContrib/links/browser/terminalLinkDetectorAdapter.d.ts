import type { ILink, ILinkProvider, IViewportRange } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ITerminalLinkDetector, ITerminalSimpleLink } from "vs/workbench/contrib/terminalContrib/links/browser/links";
import { TerminalLink } from "vs/workbench/contrib/terminalContrib/links/browser/terminalLink";
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
    readonly onDidActivateLink: any;
    private readonly _onDidShowHover;
    readonly onDidShowHover: any;
    constructor(_detector: ITerminalLinkDetector, _instantiationService: IInstantiationService);
    private _activeProvideLinkRequests;
    provideLinks(bufferLineNumber: number, callback: (links: ILink[] | undefined) => void): Promise<void>;
    private _provideLinks;
    private _createTerminalLink;
    private _getLabel;
}
