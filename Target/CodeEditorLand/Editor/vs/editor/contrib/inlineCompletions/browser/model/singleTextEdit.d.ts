import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { SingleTextEdit } from "vs/editor/common/core/textEdit";
import { ITextModel } from "vs/editor/common/model";
import { GhostText } from "vs/editor/contrib/inlineCompletions/browser/model/ghostText";
export declare function singleTextRemoveCommonPrefix(edit: SingleTextEdit, model: ITextModel, validModelRange?: Range): SingleTextEdit;
export declare function singleTextEditAugments(edit: SingleTextEdit, base: SingleTextEdit): boolean;
/**
 * @param previewSuffixLength Sets where to split `inlineCompletion.text`.
 * 	If the text is `hello` and the suffix length is 2, the non-preview part is `hel` and the preview-part is `lo`.
 */
export declare function computeGhostText(edit: SingleTextEdit, model: ITextModel, mode: "prefix" | "subword" | "subwordSmart", cursorPosition?: Position, previewSuffixLength?: number): GhostText | undefined;
