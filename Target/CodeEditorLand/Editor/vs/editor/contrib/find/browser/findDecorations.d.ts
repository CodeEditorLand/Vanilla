import { IDisposable } from "vs/base/common/lifecycle";
import { IActiveCodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { FindMatch } from "vs/editor/common/model";
export declare class FindDecorations implements IDisposable {
    private readonly _editor;
    private _decorations;
    private _overviewRulerApproximateDecorations;
    private _findScopeDecorationIds;
    private _rangeHighlightDecorationId;
    private _highlightedDecorationId;
    private _startPosition;
    constructor(editor: IActiveCodeEditor);
    dispose(): void;
    reset(): void;
    getCount(): number;
    /** @deprecated use getFindScopes to support multiple selections */
    getFindScope(): Range | null;
    getFindScopes(): Range[] | null;
    getStartPosition(): Position;
    setStartPosition(newStartPosition: Position): void;
    private _getDecorationIndex;
    getDecorationRangeAt(index: number): Range | null;
    getCurrentMatchesPosition(desiredRange: Range): number;
    setCurrentFindMatch(nextMatch: Range | null): number;
    set(findMatches: FindMatch[], findScopes: Range[] | null): void;
    matchBeforePosition(position: Position): Range | null;
    matchAfterPosition(position: Position): Range | null;
    private _allDecorations;
    static readonly _CURRENT_FIND_MATCH_DECORATION: any;
    static readonly _FIND_MATCH_DECORATION: any;
    static readonly _FIND_MATCH_NO_OVERVIEW_DECORATION: any;
    private static readonly _FIND_MATCH_ONLY_OVERVIEW_DECORATION;
    private static readonly _RANGE_HIGHLIGHT_DECORATION;
    private static readonly _FIND_SCOPE_DECORATION;
}
