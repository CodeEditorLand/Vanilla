import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorCommand, type ICommandOptions, type ServicesAccessor } from "../../../browser/editorExtensions.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { type WordCharacterClassifier } from "../../../common/core/wordCharacterClassifier.js";
import { type DeleteWordContext, WordNavigationType } from "../../../common/cursor/cursorWordOperations.js";
import type { ITextModel } from "../../../common/model.js";
export interface MoveWordOptions extends ICommandOptions {
    inSelectionMode: boolean;
    wordNavigationType: WordNavigationType;
}
export declare abstract class MoveWordCommand extends EditorCommand {
    private readonly _inSelectionMode;
    private readonly _wordNavigationType;
    constructor(opts: MoveWordOptions);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
    private _moveTo;
    protected abstract _move(wordSeparators: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class WordLeftCommand extends MoveWordCommand {
    protected _move(wordSeparators: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class WordRightCommand extends MoveWordCommand {
    protected _move(wordSeparators: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class CursorWordStartLeft extends WordLeftCommand {
    constructor();
}
export declare class CursorWordEndLeft extends WordLeftCommand {
    constructor();
}
export declare class CursorWordLeft extends WordLeftCommand {
    constructor();
}
export declare class CursorWordStartLeftSelect extends WordLeftCommand {
    constructor();
}
export declare class CursorWordEndLeftSelect extends WordLeftCommand {
    constructor();
}
export declare class CursorWordLeftSelect extends WordLeftCommand {
    constructor();
}
export declare class CursorWordAccessibilityLeft extends WordLeftCommand {
    constructor();
    protected _move(wordCharacterClassifier: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class CursorWordAccessibilityLeftSelect extends WordLeftCommand {
    constructor();
    protected _move(wordCharacterClassifier: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class CursorWordStartRight extends WordRightCommand {
    constructor();
}
export declare class CursorWordEndRight extends WordRightCommand {
    constructor();
}
export declare class CursorWordRight extends WordRightCommand {
    constructor();
}
export declare class CursorWordStartRightSelect extends WordRightCommand {
    constructor();
}
export declare class CursorWordEndRightSelect extends WordRightCommand {
    constructor();
}
export declare class CursorWordRightSelect extends WordRightCommand {
    constructor();
}
export declare class CursorWordAccessibilityRight extends WordRightCommand {
    constructor();
    protected _move(wordCharacterClassifier: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class CursorWordAccessibilityRightSelect extends WordRightCommand {
    constructor();
    protected _move(wordCharacterClassifier: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export interface DeleteWordOptions extends ICommandOptions {
    whitespaceHeuristics: boolean;
    wordNavigationType: WordNavigationType;
}
export declare abstract class DeleteWordCommand extends EditorCommand {
    private readonly _whitespaceHeuristics;
    private readonly _wordNavigationType;
    constructor(opts: DeleteWordOptions);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
    protected abstract _delete(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range;
}
export declare class DeleteWordLeftCommand extends DeleteWordCommand {
    protected _delete(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range;
}
export declare class DeleteWordRightCommand extends DeleteWordCommand {
    protected _delete(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range;
}
export declare class DeleteWordStartLeft extends DeleteWordLeftCommand {
    constructor();
}
export declare class DeleteWordEndLeft extends DeleteWordLeftCommand {
    constructor();
}
export declare class DeleteWordLeft extends DeleteWordLeftCommand {
    constructor();
}
export declare class DeleteWordStartRight extends DeleteWordRightCommand {
    constructor();
}
export declare class DeleteWordEndRight extends DeleteWordRightCommand {
    constructor();
}
export declare class DeleteWordRight extends DeleteWordRightCommand {
    constructor();
}
export declare class DeleteInsideWord extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
