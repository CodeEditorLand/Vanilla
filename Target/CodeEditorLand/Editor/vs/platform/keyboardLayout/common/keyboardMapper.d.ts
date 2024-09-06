import { Keybinding, ResolvedKeybinding } from "vs/base/common/keybindings";
import { IKeyboardEvent } from "vs/platform/keybinding/common/keybinding";
export interface IKeyboardMapper {
    dumpDebugInfo(): string;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
}
export declare class CachedKeyboardMapper implements IKeyboardMapper {
    private _actual;
    private _cache;
    constructor(actual: IKeyboardMapper);
    dumpDebugInfo(): string;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
}
