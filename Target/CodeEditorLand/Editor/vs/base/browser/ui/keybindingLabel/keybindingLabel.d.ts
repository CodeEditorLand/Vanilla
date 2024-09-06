import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { Disposable } from "vs/base/common/lifecycle";
import { OperatingSystem } from "vs/base/common/platform";
import "vs/css!./keybindingLabel";
export interface ChordMatches {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    keyCode?: boolean;
}
export interface Matches {
    firstPart: ChordMatches;
    chordPart: ChordMatches;
}
export interface KeybindingLabelOptions extends IKeybindingLabelStyles {
    renderUnboundKeybindings?: boolean;
    /**
     * Default false.
     */
    disableTitle?: boolean;
}
export interface IKeybindingLabelStyles {
    keybindingLabelBackground: string | undefined;
    keybindingLabelForeground: string | undefined;
    keybindingLabelBorder: string | undefined;
    keybindingLabelBottomBorder: string | undefined;
    keybindingLabelShadow: string | undefined;
}
export declare const unthemedKeybindingLabelOptions: KeybindingLabelOptions;
export declare class KeybindingLabel extends Disposable {
    private os;
    private domNode;
    private options;
    private readonly keyElements;
    private hover;
    private keybinding;
    private matches;
    private didEverRender;
    constructor(container: HTMLElement, os: OperatingSystem, options?: KeybindingLabelOptions);
    get element(): HTMLElement;
    set(keybinding: ResolvedKeybinding | undefined, matches?: Matches): void;
    private render;
    private clear;
    private renderChord;
    private renderKey;
    private renderUnbound;
    private createKeyElement;
    private static areSame;
}
