import { Disposable } from "../../../base/common/lifecycle.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { IKeyboardLayoutData, INativeKeyboardLayoutService } from "../common/keyboardLayoutService.js";
export declare const IKeyboardLayoutMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IKeyboardLayoutMainService>;
export interface IKeyboardLayoutMainService extends INativeKeyboardLayoutService {
}
export declare class KeyboardLayoutMainService extends Disposable implements INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: import("../../../base/common/event.js").Event<IKeyboardLayoutData>;
    private _initPromise;
    private _keyboardLayoutData;
    constructor(lifecycleMainService: ILifecycleMainService);
    private _initialize;
    private _doInitialize;
    getKeyboardLayoutData(): Promise<IKeyboardLayoutData>;
}
