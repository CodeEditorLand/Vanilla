import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IKeyboardEvent } from "vs/platform/keybinding/common/keybinding";
import { IKeyboardLayoutInfo, IKeyboardLayoutService, IKeyboardMapping } from "vs/platform/keyboardLayout/common/keyboardLayout";
import { IKeyboardMapper } from "vs/platform/keyboardLayout/common/keyboardMapper";
import { INativeKeyboardLayoutService } from "vs/workbench/services/keybinding/electron-sandbox/nativeKeyboardLayoutService";
export declare class KeyboardLayoutService extends Disposable implements IKeyboardLayoutService {
    private readonly _nativeKeyboardLayoutService;
    private readonly _configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: any;
    private _keyboardMapper;
    constructor(_nativeKeyboardLayoutService: INativeKeyboardLayoutService, _configurationService: IConfigurationService);
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getKeyboardMapper(): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
