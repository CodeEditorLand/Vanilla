import { URI, UriComponents } from "vs/base/common/uri";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IURLService } from "vs/platform/url/common/url";
import { MainThreadUrlsShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtensionUrlHandler } from "vs/workbench/services/extensions/browser/extensionUrlHandler";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers";
export declare class MainThreadUrls implements MainThreadUrlsShape {
    private readonly urlService;
    private readonly extensionUrlHandler;
    private readonly proxy;
    private handlers;
    constructor(context: IExtHostContext, urlService: IURLService, extensionUrlHandler: IExtensionUrlHandler);
    $registerUriHandler(handle: number, extensionId: ExtensionIdentifier, extensionDisplayName: string): Promise<void>;
    $unregisterUriHandler(handle: number): Promise<void>;
    $createAppUri(uri: UriComponents): Promise<URI>;
    dispose(): void;
}
