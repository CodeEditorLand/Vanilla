import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { ILabelService } from "vs/platform/label/common/label";
import { INativeHostService } from "vs/platform/native/common/native";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
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
