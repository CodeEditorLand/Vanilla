import type { URI, UriComponents } from "../../../base/common/uri.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { IURLService } from "../../../platform/url/common/url.js";
import { IExtensionUrlHandler } from "../../services/extensions/browser/extensionUrlHandler.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadUrlsShape } from "../common/extHost.protocol.js";
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
