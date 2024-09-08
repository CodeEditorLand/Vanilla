import { Keybinding, type ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import type { OperatingSystem } from "../../../../base/common/platform.js";
import type { IKeyboardEvent } from "../../../../platform/keybinding/common/keybinding.js";
import type { IKeyboardMapper } from "../../../../platform/keyboardLayout/common/keyboardMapper.js";
/**
 * A keyboard mapper to be used when reading the keymap from the OS fails.
 */
export declare class FallbackKeyboardMapper implements IKeyboardMapper {
    private readonly _mapAltGrToCtrlAlt;
    private readonly _OS;
    constructor(_mapAltGrToCtrlAlt: boolean, _OS: OperatingSystem);
    dumpDebugInfo(): string;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
}
