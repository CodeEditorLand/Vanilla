import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { type MainThreadClipboardShape } from "../common/extHost.protocol.js";
export declare class MainThreadClipboard implements MainThreadClipboardShape {
    private readonly _clipboardService;
    constructor(_context: any, _clipboardService: IClipboardService);
    dispose(): void;
    $readText(): Promise<string>;
    $writeText(value: string): Promise<void>;
}
