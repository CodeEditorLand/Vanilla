import { Keybinding, KeyCodeChord, SingleModifierChord } from "vs/base/common/keybindings";
import { OperatingSystem } from "vs/base/common/platform";
import { BaseResolvedKeybinding } from "vs/platform/keybinding/common/baseResolvedKeybinding";
/**
 * Do not instantiate. Use KeybindingService to get a ResolvedKeybinding seeded with information about the current kb layout.
 */
export declare class USLayoutResolvedKeybinding extends BaseResolvedKeybinding<KeyCodeChord> {
    constructor(chords: KeyCodeChord[], os: OperatingSystem);
    private _keyCodeToUILabel;
    protected _getLabel(chord: KeyCodeChord): string | null;
    protected _getAriaLabel(chord: KeyCodeChord): string | null;
    protected _getElectronAccelerator(chord: KeyCodeChord): string | null;
    protected _getUserSettingsLabel(chord: KeyCodeChord): string | null;
    protected _isWYSIWYG(): boolean;
    protected _getChordDispatch(chord: KeyCodeChord): string | null;
    static getDispatchStr(chord: KeyCodeChord): string | null;
    protected _getSingleModifierChordDispatch(keybinding: KeyCodeChord): SingleModifierChord | null;
    /**
     * *NOTE*: Check return value for `KeyCode.Unknown`.
     */
    private static _scanCodeToKeyCode;
    private static _toKeyCodeChord;
    static resolveKeybinding(keybinding: Keybinding, os: OperatingSystem): USLayoutResolvedKeybinding[];
}
