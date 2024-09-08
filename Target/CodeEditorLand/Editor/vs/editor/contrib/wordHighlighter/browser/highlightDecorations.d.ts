import "./highlightDecorations.css";
import { DocumentHighlightKind } from "../../../common/languages.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
export declare function getHighlightDecorationOptions(kind: DocumentHighlightKind | undefined): ModelDecorationOptions;
export declare function getSelectionHighlightDecorationOptions(hasSemanticHighlights: boolean): ModelDecorationOptions;
