import type { ILink, Terminal } from "@xterm/xterm";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { ITerminalCapabilityStore } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalLogService } from "vs/platform/terminal/common/terminal";
import { ITunnelService } from "vs/platform/tunnel/common/tunnel";
import { ITerminalConfigurationService, ITerminalExternalLinkProvider } from "vs/workbench/contrib/terminal/browser/terminal";
import { TerminalWidgetManager } from "vs/workbench/contrib/terminal/browser/widgets/widgetManager";
import { ITerminalProcessInfo } from "vs/workbench/contrib/terminal/common/terminal";
import { ITerminalLinkResolver, OmitFirstArg } from "vs/workbench/contrib/terminalContrib/links/browser/links";
import { TerminalLink } from "vs/workbench/contrib/terminalContrib/links/browser/terminalLink";
export type XtermLinkMatcherHandler = (event: MouseEvent | undefined, link: string) => Promise<void>;
/**
 * An object responsible for managing registration of link matchers and link providers.
 */
export declare class TerminalLinkManager extends DisposableStore {
    private readonly _xterm;
    private readonly _processInfo;
    private readonly _linkResolver;
    private readonly _configurationService;
    private readonly _terminalConfigurationService;
    private readonly _instantiationService;
    private readonly _notificationService;
    private readonly _logService;
    private readonly _tunnelService;
    private _widgetManager;
    private readonly _standardLinkProviders;
    private readonly _linkProvidersDisposables;
    private readonly _externalLinkProviders;
    private readonly _openers;
    externalProvideLinksCb?: OmitFirstArg<ITerminalExternalLinkProvider["provideLinks"]>;
    constructor(_xterm: Terminal, _processInfo: ITerminalProcessInfo, capabilities: ITerminalCapabilityStore, _linkResolver: ITerminalLinkResolver, _configurationService: IConfigurationService, _terminalConfigurationService: ITerminalConfigurationService, _instantiationService: IInstantiationService, _notificationService: INotificationService, _logService: ITerminalLogService, _tunnelService: ITunnelService);
    private _setupLinkDetector;
    private _openLink;
    openRecentLink(type: "localFile" | "url"): Promise<ILink | undefined>;
    getLinks(): Promise<{
        viewport: IDetectedLinks;
        all: Promise<IDetectedLinks>;
    }>;
    private _getLinksForLine;
    protected _getLinksForType(y: number, type: "word" | "url" | "localFile" | "localFolder"): Promise<ILink[] | undefined>;
    private _tooltipCallback;
    private _showHover;
    setWidgetManager(widgetManager: TerminalWidgetManager): void;
    private _clearLinkProviders;
    private _registerStandardLinkProviders;
    protected _isLinkActivationModifierDown(event: MouseEvent): boolean;
    private _getLinkHoverString;
}
export interface ILineColumnInfo {
    lineNumber: number;
    columnNumber: number;
}
export interface IDetectedLinks {
    wordLinks?: ILink[];
    webLinks?: ILink[];
    fileLinks?: (ILink | TerminalLink)[];
    folderLinks?: ILink[];
}
