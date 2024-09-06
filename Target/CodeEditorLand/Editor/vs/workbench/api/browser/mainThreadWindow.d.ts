import { UriComponents } from "vs/base/common/uri";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IUserActivityService } from "vs/workbench/services/userActivity/common/userActivityService";
import { IOpenUriOptions, MainThreadWindowShape } from "../common/extHost.protocol";
export declare class MainThreadWindow implements MainThreadWindowShape {
    private readonly hostService;
    private readonly openerService;
    private readonly userActivityService;
    private readonly proxy;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, hostService: IHostService, openerService: IOpenerService, userActivityService: IUserActivityService);
    dispose(): void;
    $getInitialState(): Promise<{
        isFocused: any;
        isActive: any;
    }>;
    $openUri(uriComponents: UriComponents, uriString: string | undefined, options: IOpenUriOptions): Promise<boolean>;
    $asExternalUri(uriComponents: UriComponents, options: IOpenUriOptions): Promise<UriComponents>;
}
