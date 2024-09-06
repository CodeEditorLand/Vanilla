import { Disposable } from "vs/base/common/lifecycle";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IURLService } from "vs/platform/url/common/url";
import { IProtocolUrl } from "vs/platform/url/electron-main/url";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
/**
 * A listener for URLs that are opened from the OS and handled by VSCode.
 * Depending on the platform, this works differently:
 * - Windows: we use `app.setAsDefaultProtocolClient()` to register VSCode with the OS
 *            and additionally add the `open-url` command line argument to identify.
 * - macOS:   we rely on `app.on('open-url')` to be called by the OS
 * - Linux:   we have a special shortcut installed (`resources/linux/code-url-handler.desktop`)
 *            that calls VSCode with the `open-url` command line argument
 *            (https://github.com/microsoft/vscode/pull/56727)
 */
export declare class ElectronURLListener extends Disposable {
    private readonly urlService;
    private readonly logService;
    private uris;
    private retryCount;
    constructor(initialProtocolUrls: IProtocolUrl[] | undefined, urlService: IURLService, windowsMainService: IWindowsMainService, environmentMainService: IEnvironmentMainService, productService: IProductService, logService: ILogService);
    private uriFromRawUrl;
    private flush;
}
