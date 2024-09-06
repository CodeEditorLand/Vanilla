import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
import { ILogService } from "../../log/common/log.js";
import { IClipboardService } from "../common/clipboardService.js";
export declare class BrowserClipboardService extends Disposable implements IClipboardService {
    private readonly layoutService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    constructor(layoutService: ILayoutService, logService: ILogService);
    private webKitPendingClipboardWritePromise;
    private installWebKitWriteTextWorkaround;
    private readonly mapTextToType;
    writeText(text: string, type?: string): Promise<void>;
    private fallbackWriteText;
    readText(type?: string): Promise<string>;
    private findText;
    readFindText(): Promise<string>;
    writeFindText(text: string): Promise<void>;
    private resources;
    private resourcesStateHash;
    private static readonly MAX_RESOURCE_STATE_SOURCE_LENGTH;
    writeResources(resources: URI[]): Promise<void>;
    readResources(): Promise<URI[]>;
    private computeResourcesStateHash;
    hasResources(): Promise<boolean>;
    clearInternalState(): void;
    private clearResourcesState;
}
