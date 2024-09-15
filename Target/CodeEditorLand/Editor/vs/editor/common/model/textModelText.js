var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AbstractText } from "../core/textEdit.js";
import { TextLength } from "../core/textLength.js";
class TextModelText extends AbstractText {
  constructor(_textModel) {
    super();
    this._textModel = _textModel;
  }
  static {
    __name(this, "TextModelText");
  }
  getValueOfRange(range) {
    return this._textModel.getValueInRange(range);
  }
  get length() {
    const lastLineNumber = this._textModel.getLineCount();
    const lastLineLen = this._textModel.getLineLength(lastLineNumber);
    return new TextLength(lastLineNumber - 1, lastLineLen);
  }
}
export {
  TextModelText
};
//# sourceMappingURL=textModelText.js.map
