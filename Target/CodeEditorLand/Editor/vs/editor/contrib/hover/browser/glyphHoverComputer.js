import { asArray } from "../../../../base/common/arrays.js";
import {
  isEmptyMarkdownString
} from "../../../../base/common/htmlContent.js";
import { GlyphMarginLane } from "../../../common/model.js";
class GlyphHoverComputer {
  constructor(_editor) {
    this._editor = _editor;
  }
  computeSync(opts) {
    const toHoverMessage = (contents) => {
      return {
        value: contents
      };
    };
    const lineDecorations = this._editor.getLineDecorations(
      opts.lineNumber
    );
    const result = [];
    const isLineHover = opts.laneOrLine === "lineNo";
    if (!lineDecorations) {
      return result;
    }
    for (const d of lineDecorations) {
      const lane = d.options.glyphMargin?.position ?? GlyphMarginLane.Center;
      if (!isLineHover && lane !== opts.laneOrLine) {
        continue;
      }
      const hoverMessage = isLineHover ? d.options.lineNumberHoverMessage : d.options.glyphMarginHoverMessage;
      if (!hoverMessage || isEmptyMarkdownString(hoverMessage)) {
        continue;
      }
      result.push(...asArray(hoverMessage).map(toHoverMessage));
    }
    return result;
  }
}
export {
  GlyphHoverComputer
};
