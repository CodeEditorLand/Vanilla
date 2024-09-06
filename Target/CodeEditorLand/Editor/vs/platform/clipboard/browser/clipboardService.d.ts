import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { ILogService } from "vs/platform/log/common/log";
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
