import { Keybinding, KeyCodeChord, ResolvedKeybinding, ScanCodeChord, SingleModifierChord } from "vs/base/common/keybindings";
import { OperatingSystem } from "vs/base/common/platform";
import { BaseResolvedKeybinding } from "vs/platform/keybinding/common/baseResolvedKeybinding";
import { IKeyboardEvent } from "vs/platform/keybinding/common/keybinding";
import { IMacLinuxKeyboardMapping } from "vs/platform/keyboardLayout/common/keyboardLayout";
import { IKeyboardMapper } from "vs/platform/keyboardLayout/common/keyboardMapper";
export declare class NativeResolvedKeybinding extends BaseResolvedKeybinding<ScanCodeChord> {
    private readonly _mapper;
    constructor(mapper: MacLinuxKeyboardMapper, os: OperatingSystem, chords: ScanCodeChord[]);
    protected _getLabel(chord: ScanCodeChord): string | null;
    protected _getAriaLabel(chord: ScanCodeChord): string | null;
    protected _getElectronAccelerator(chord: ScanCodeChord): string | null;
    protected _getUserSettingsLabel(chord: ScanCodeChord): string | null;
    protected _isWYSIWYG(binding: ScanCodeChord | null): boolean;
    protected _getChordDispatch(chord: ScanCodeChord): string | null;
    protected _getSingleModifierChordDispatch(chord: ScanCodeChord): SingleModifierChord | null;
}
export declare class MacLinuxKeyboardMapper implements IKeyboardMapper {
    private readonly _isUSStandard;
    private readonly _mapAltGrToCtrlAlt;
    private readonly _OS;
    /**
     * used only for debug purposes.
     */
    private readonly _codeInfo;
    /**
     * Maps ScanCode combos <-> KeyCode combos.
     */
    private readonly _scanCodeKeyCodeMapper;
    /**
     * UI label for a ScanCode.
     */
    private readonly _scanCodeToLabel;
    /**
     * Dispatching string for a ScanCode.
     */
    private readonly _scanCodeToDispatch;
    constructor(_isUSStandard: boolean, rawMappings: IMacLinuxKeyboardMapping, _mapAltGrToCtrlAlt: boolean, _OS: OperatingSystem);
    dumpDebugInfo(): string;
    private _leftPad;
    keyCodeChordToScanCodeChord(chord: KeyCodeChord): ScanCodeChord[];
    getUILabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    getAriaLabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    getDispatchStrForScanCodeChord(chord: ScanCodeChord): string | null;
    getUserSettingsLabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    getElectronAcceleratorLabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    private _toResolvedKeybinding;
    private _generateResolvedKeybindings;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): NativeResolvedKeybinding;
    private _resolveChord;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    private static _redirectCharCode;
    private static _charCodeToKb;
    /**
     * Attempt to map a combining character to a regular one that renders the same way.
     *
     * https://www.compart.com/en/unicode/bidiclass/NSM
     */
    static getCharCode(char: string): number;
}
