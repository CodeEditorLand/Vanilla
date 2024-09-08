import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
export declare class StartupProfiler implements IWorkbenchContribution {
    private readonly _dialogService;
    private readonly _environmentService;
    private readonly _textModelResolverService;
    private readonly _clipboardService;
    private readonly _openerService;
    private readonly _nativeHostService;
    private readonly _productService;
    private readonly _fileService;
    private readonly _labelService;
    constructor(_dialogService: IDialogService, _environmentService: INativeWorkbenchEnvironmentService, _textModelResolverService: ITextModelService, _clipboardService: IClipboardService, lifecycleService: ILifecycleService, extensionService: IExtensionService, _openerService: IOpenerService, _nativeHostService: INativeHostService, _productService: IProductService, _fileService: IFileService, _labelService: ILabelService);
    private _stopProfiling;
    private _createPerfIssue;
}
