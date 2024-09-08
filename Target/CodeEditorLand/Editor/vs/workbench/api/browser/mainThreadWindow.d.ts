import { type UriComponents } from "../../../base/common/uri.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IHostService } from "../../services/host/browser/host.js";
import { IUserActivityService } from "../../services/userActivity/common/userActivityService.js";
import { type IOpenUriOptions, type MainThreadWindowShape } from "../common/extHost.protocol.js";
export declare class MainThreadWindow implements MainThreadWindowShape {
    private readonly hostService;
    private readonly openerService;
    private readonly userActivityService;
    private readonly proxy;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, hostService: IHostService, openerService: IOpenerService, userActivityService: IUserActivityService);
    dispose(): void;
    $getInitialState(): Promise<{
        isFocused: boolean;
        isActive: boolean;
    }>;
    $openUri(uriComponents: UriComponents, uriString: string | undefined, options: IOpenUriOptions): Promise<boolean>;
    $asExternalUri(uriComponents: UriComponents, options: IOpenUriOptions): Promise<UriComponents>;
}
