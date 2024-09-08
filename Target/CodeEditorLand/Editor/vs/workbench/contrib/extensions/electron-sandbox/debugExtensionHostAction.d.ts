import { Action } from "../../../../base/common/actions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IDebugService } from "../../debug/common/debug.js";
export declare class DebugExtensionHostAction extends Action {
    private readonly _nativeHostService;
    private readonly _dialogService;
    private readonly _extensionService;
    private readonly productService;
    private readonly _instantiationService;
    private readonly _hostService;
    static readonly ID = "workbench.extensions.action.debugExtensionHost";
    static readonly LABEL: string;
    static readonly CSS_CLASS = "debug-extension-host";
    constructor(_nativeHostService: INativeHostService, _dialogService: IDialogService, _extensionService: IExtensionService, productService: IProductService, _instantiationService: IInstantiationService, _hostService: IHostService);
    run(_args: unknown): Promise<any>;
}
export declare class DebugExtensionsContribution extends Disposable implements IWorkbenchContribution {
    private readonly _debugService;
    private readonly _instantiationService;
    constructor(_debugService: IDebugService, _instantiationService: IInstantiationService, _progressService: IProgressService);
}
