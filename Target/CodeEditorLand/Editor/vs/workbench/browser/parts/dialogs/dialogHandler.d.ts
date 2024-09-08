import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { AbstractDialogHandler, type IAsyncPromptResult, type IConfirmation, type IConfirmationResult, type IInput, type IInputResult, type IPrompt } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
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