import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { AbstractDialogHandler, IAsyncPromptResult, IConfirmation, IConfirmationResult, IPrompt } from "vs/platform/dialogs/common/dialogs";
import { ILogService } from "vs/platform/log/common/log";
import { INativeHostService } from "vs/platform/native/common/native";
import { IProductService } from "vs/platform/product/common/productService";
export declare class NativeDialogHandler extends AbstractDialogHandler {
    private readonly logService;
    private readonly nativeHostService;
    private readonly productService;
    private readonly clipboardService;
    constructor(logService: ILogService, nativeHostService: INativeHostService, productService: IProductService, clipboardService: IClipboardService);
    prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>>;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    input(): never;
    about(): Promise<void>;
}
