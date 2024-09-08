import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import type { IKeyboardEvent } from "../../../../platform/keybinding/common/keybinding.js";
import { IKeyboardLayoutService, type IKeyboardLayoutInfo, type IKeyboardMapping } from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
import { type IKeyboardMapper } from "../../../../platform/keyboardLayout/common/keyboardMapper.js";
import { INativeKeyboardLayoutService } from "./nativeKeyboardLayoutService.js";
export declare class KeyboardLayoutService extends Disposable implements IKeyboardLayoutService {
    private readonly _nativeKeyboardLayoutService;
    private readonly _configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: import("../../../../base/common/event.js").Event<void>;
    private _keyboardMapper;
    constructor(_nativeKeyboardLayoutService: INativeKeyboardLayoutService, _configurationService: IConfigurationService);
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getKeyboardMapper(): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
