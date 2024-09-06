import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
export declare class StableEditorScrollState {
    private readonly _initialScrollTop;
    private readonly _initialContentHeight;
    private readonly _visiblePosition;
    private readonly _visiblePositionScrollDelta;
    private readonly _cursorPosition;
    static capture(editor: ICodeEditor): StableEditorScrollState;
    constructor(_initialScrollTop: number, _initialContentHeight: number, _visiblePosition: Position | null, _visiblePositionScrollDelta: number, _cursorPosition: Position | null);
    restore(editor: ICodeEditor): void;
    restoreRelativeVerticalPositionOfCursor(editor: ICodeEditor): void;
}
export declare class StableEditorBottomScrollState {
    private readonly _initialScrollTop;
    private readonly _initialContentHeight;
    private readonly _visiblePosition;
    private readonly _visiblePositionScrollDelta;
    static capture(editor: ICodeEditor): StableEditorBottomScrollState;
    constructor(_initialScrollTop: number, _initialContentHeight: number, _visiblePosition: Position | null, _visiblePositionScrollDelta: number);
    restore(editor: ICodeEditor): void;
}
