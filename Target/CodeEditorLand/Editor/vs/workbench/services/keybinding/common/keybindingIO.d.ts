import { Keybinding } from "vs/base/common/keybindings";
import { ContextKeyExpression } from "vs/platform/contextkey/common/contextkey";
import { ResolvedKeybindingItem } from "vs/platform/keybinding/common/resolvedKeybindingItem";
export interface IUserKeybindingItem {
    keybinding: Keybinding | null;
    command: string | null;
    commandArgs?: any;
    when: ContextKeyExpression | undefined;
    _sourceKey: string | undefined /** captures `key` field from `keybindings.json`; `this.keybinding !== null` implies `_sourceKey !== null` */;
}
export declare class KeybindingIO {
    static writeKeybindingItem(out: OutputBuilder, item: ResolvedKeybindingItem): void;
    static readUserKeybindingItem(input: Object): IUserKeybindingItem;
}
export declare class OutputBuilder {
    private _lines;
    private _currentLine;
    write(str: string): void;
    writeLine(str?: string): void;
    toString(): string;
}