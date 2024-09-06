import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
import { IKeyboardLayoutInfo, IKeyboardMapping } from "vs/platform/keyboardLayout/common/keyboardLayout";
export declare const INativeKeyboardLayoutService: any;
export interface INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeKeyboardLayout: Event<void>;
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
}
export declare class NativeKeyboardLayoutService extends Disposable implements INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: any;
    private readonly _keyboardLayoutService;
    private _initPromise;
    private _keyboardMapping;
    private _keyboardLayoutInfo;
    constructor(mainProcessService: IMainProcessService);
    initialize(): Promise<void>;
    private _doInitialize;
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
}
