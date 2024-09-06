import { Keybinding, ResolvedKeybinding } from "vs/base/common/keybindings";
import { OperatingSystem } from "vs/base/common/platform";
import { IKeyboardEvent } from "vs/platform/keybinding/common/keybinding";
import { IKeyboardMapper } from "vs/platform/keyboardLayout/common/keyboardMapper";
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
