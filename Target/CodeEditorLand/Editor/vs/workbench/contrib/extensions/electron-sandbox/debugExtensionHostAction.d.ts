import { Action } from "vs/base/common/actions";
import { Disposable } from "vs/base/common/lifecycle";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INativeHostService } from "vs/platform/native/common/native";
import { IProductService } from "vs/platform/product/common/productService";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IHostService } from "vs/workbench/services/host/browser/host";
export declare class DebugExtensionHostAction extends Action {
    private readonly _nativeHostService;
    private readonly _dialogService;
    private readonly _extensionService;
    private readonly productService;
    private readonly _instantiationService;
    private readonly _hostService;
    static readonly ID = "workbench.extensions.action.debugExtensionHost";
    static readonly LABEL: any;
    static readonly CSS_CLASS = "debug-extension-host";
    constructor(_nativeHostService: INativeHostService, _dialogService: IDialogService, _extensionService: IExtensionService, productService: IProductService, _instantiationService: IInstantiationService, _hostService: IHostService);
    run(_args: unknown): Promise<any>;
}
export declare class DebugExtensionsContribution extends Disposable implements IWorkbenchContribution {
    private readonly _debugService;
    private readonly _instantiationService;
    constructor(_debugService: IDebugService, _instantiationService: IInstantiationService, _progressService: IProgressService);
}
