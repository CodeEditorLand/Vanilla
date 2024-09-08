import { Disposable } from "../../../base/common/lifecycle.js";
import type { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import type { ILogService } from "../../log/common/log.js";
import type { IProductService } from "../../product/common/productService.js";
import type { IWindowsMainService } from "../../windows/electron-main/windows.js";
import type { IURLService } from "../common/url.js";
import type { IProtocolUrl } from "./url.js";
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
