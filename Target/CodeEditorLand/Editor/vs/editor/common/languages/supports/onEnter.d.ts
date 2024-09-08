import { EditorAutoIndentStrategy } from "../../config/editorOptions.js";
import { type CharacterPair, type EnterAction, type OnEnterRule } from "../languageConfiguration.js";
export interface IOnEnterSupportOptions {
    brackets?: CharacterPair[];
    onEnterRules?: OnEnterRule[];
}
export declare class OnEnterSupport {
    private readonly _brackets;
    private readonly _regExpRules;
    constructor(opts: IOnEnterSupportOptions);
    onEnter(autoIndent: EditorAutoIndentStrategy, previousLineText: string, beforeEnterText: string, afterEnterText: string): EnterAction | null;
    private static _createOpenBracketRegExp;
    private static _createCloseBracketRegExp;
    private static _safeRegExp;
}
