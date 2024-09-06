import { EditorAutoClosingEditStrategy, EditorAutoClosingStrategy } from "vs/editor/common/config/editorOptions";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { Selection } from "vs/editor/common/core/selection";
import { WordCharacterClassifier } from "vs/editor/common/core/wordCharacterClassifier";
import { IWordAtPosition } from "vs/editor/common/core/wordHelper";
import { CursorConfiguration, ICursorSimpleModel, SingleCursorState } from "vs/editor/common/cursorCommon";
import { AutoClosingPairs } from "vs/editor/common/languages/languageConfiguration";
import { ITextModel } from "vs/editor/common/model";
export declare const enum WordNavigationType {
    WordStart = 0,
    WordStartFast = 1,
    WordEnd = 2,
    WordAccessibility = 3
}
export interface DeleteWordContext {
    wordSeparators: WordCharacterClassifier;
    model: ITextModel;
    selection: Selection;
    whitespaceHeuristics: boolean;
    autoClosingDelete: EditorAutoClosingEditStrategy;
    autoClosingBrackets: EditorAutoClosingStrategy;
    autoClosingQuotes: EditorAutoClosingStrategy;
    autoClosingPairs: AutoClosingPairs;
    autoClosedCharacters: Range[];
}
export declare class WordOperations {
    private static _createWord;
    private static _createIntlWord;
    private static _findPreviousWordOnLine;
    private static _doFindPreviousWordOnLine;
    private static _findEndOfWord;
    private static _findNextWordOnLine;
    private static _doFindNextWordOnLine;
    private static _findStartOfWord;
    static moveWordLeft(wordSeparators: WordCharacterClassifier, model: ICursorSimpleModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
    static _moveWordPartLeft(model: ICursorSimpleModel, position: Position): Position;
    static moveWordRight(wordSeparators: WordCharacterClassifier, model: ICursorSimpleModel, position: Position, wordNavigationType: WordNavigationType): Position;
    static _moveWordPartRight(model: ICursorSimpleModel, position: Position): Position;
    protected static _deleteWordLeftWhitespace(model: ICursorSimpleModel, position: Position): Range | null;
    static deleteWordLeft(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range | null;
    static deleteInsideWord(wordSeparators: WordCharacterClassifier, model: ITextModel, selection: Selection): Range;
    private static _charAtIsWhitespace;
    private static _deleteInsideWordWhitespace;
    private static _deleteInsideWordDetermineDeleteRange;
    static _deleteWordPartLeft(model: ICursorSimpleModel, selection: Selection): Range;
    private static _findFirstNonWhitespaceChar;
    protected static _deleteWordRightWhitespace(model: ICursorSimpleModel, position: Position): Range | null;
    static deleteWordRight(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range | null;
    static _deleteWordPartRight(model: ICursorSimpleModel, selection: Selection): Range;
    private static _createWordAtPosition;
    static getWordAtPosition(model: ITextModel, _wordSeparators: string, _intlSegmenterLocales: string[], position: Position): IWordAtPosition | null;
    static word(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean, position: Position): SingleCursorState;
}
export declare class WordPartOperations extends WordOperations {
    static deleteWordPartLeft(ctx: DeleteWordContext): Range;
    static deleteWordPartRight(ctx: DeleteWordContext): Range;
    static moveWordPartLeft(wordSeparators: WordCharacterClassifier, model: ICursorSimpleModel, position: Position, hasMulticursor: boolean): Position;
    static moveWordPartRight(wordSeparators: WordCharacterClassifier, model: ICursorSimpleModel, position: Position): Position;
}
