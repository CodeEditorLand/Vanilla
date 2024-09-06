import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ITerminalExternalLinkProvider } from "vs/workbench/contrib/terminal/browser/terminal";
import { ITerminalLinkProviderService } from "vs/workbench/contrib/terminalContrib/links/browser/links";
export declare class TerminalLinkProviderService implements ITerminalLinkProviderService {
    _serviceBrand: undefined;
    private _linkProviders;
    get linkProviders(): ReadonlySet<ITerminalExternalLinkProvider>;
    private readonly _onDidAddLinkProvider;
    get onDidAddLinkProvider(): Event<ITerminalExternalLinkProvider>;
    private readonly _onDidRemoveLinkProvider;
    get onDidRemoveLinkProvider(): Event<ITerminalExternalLinkProvider>;
    registerLinkProvider(linkProvider: ITerminalExternalLinkProvider): IDisposable;
}
