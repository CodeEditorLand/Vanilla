import { URI, UriComponents } from "vs/base/common/uri";
import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
import { ILogService } from "vs/platform/log/common/log";
import { INativeHostService } from "vs/platform/native/common/native";
import { IOpener, IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { IOpenURLOptions, IURLHandler } from "vs/platform/url/common/url";
import { NativeURLService } from "vs/platform/url/common/urlService";
export interface IRelayOpenURLOptions extends IOpenURLOptions {
    openToSide?: boolean;
    openExternal?: boolean;
}
export declare class RelayURLService extends NativeURLService implements IURLHandler, IOpener {
    private readonly nativeHostService;
    private readonly logService;
    private urlService;
    constructor(mainProcessService: IMainProcessService, openerService: IOpenerService, nativeHostService: INativeHostService, productService: IProductService, logService: ILogService);
    create(options?: Partial<UriComponents>): URI;
    open(resource: URI | string, options?: IRelayOpenURLOptions): Promise<boolean>;
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
}
