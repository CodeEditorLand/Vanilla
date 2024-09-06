import { Position } from '../../../../common/core/position.js';
import { Range } from '../../../../common/core/range.js';
import { SingleTextEdit } from '../../../../common/core/textEdit.js';
import { ITextModel } from '../../../../common/model.js';
import { GhostText } from './ghostText.js';
export declare function singleTextRemoveCommonPrefix(edit: SingleTextEdit, model: ITextModel, validModelRange?: Range): SingleTextEdit;
export declare function singleTextEditAugments(edit: SingleTextEdit, base: SingleTextEdit): boolean;
/**
 * @param previewSuffixLength Sets where to split `inlineCompletion.text`.
 * 	If the text is `hello` and the suffix length is 2, the non-preview part is `hel` and the preview-part is `lo`.
*/
export declare function computeGhostText(edit: SingleTextEdit, model: ITextModel, mode: 'prefix' | 'subword' | 'subwordSmart', cursorPosition?: Position, previewSuffixLength?: number): GhostText | undefined;
