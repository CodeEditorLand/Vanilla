import "vs/css!./highlightDecorations";
import { DocumentHighlightKind } from "vs/editor/common/languages";
import { ModelDecorationOptions } from "vs/editor/common/model/textModel";
export declare function getHighlightDecorationOptions(kind: DocumentHighlightKind | undefined): ModelDecorationOptions;
export declare function getSelectionHighlightDecorationOptions(hasSemanticHighlights: boolean): ModelDecorationOptions;
