import { Range } from "vs/editor/common/core/range";
import { AbstractText } from "vs/editor/common/core/textEdit";
import { TextLength } from "vs/editor/common/core/textLength";
import { ITextModel } from "vs/editor/common/model";
export declare class TextModelText extends AbstractText {
    private readonly _textModel;
    constructor(_textModel: ITextModel);
    getValueOfRange(range: Range): string;
    get length(): TextLength;
}
