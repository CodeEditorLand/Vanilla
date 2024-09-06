import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { AbstractDialogHandler, IAsyncPromptResult, IConfirmation, IConfirmationResult, IInput, IInputResult, IPrompt } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
export declare class BrowserDialogHandler extends AbstractDialogHandler {
    private readonly logService;
    private readonly layoutService;
    private readonly keybindingService;
    private readonly instantiationService;
    private readonly productService;
    private readonly clipboardService;
    private static readonly ALLOWABLE_COMMANDS;
    private readonly markdownRenderer;
    constructor(logService: ILogService, layoutService: ILayoutService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, productService: IProductService, clipboardService: IClipboardService);
    prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>>;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    input(input: IInput): Promise<IInputResult>;
    about(): Promise<void>;
    private doShow;
}
