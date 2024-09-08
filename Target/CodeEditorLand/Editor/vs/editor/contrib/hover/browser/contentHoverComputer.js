import { coalesce } from "../../../../base/common/arrays.js";
import { AsyncIterableObject } from "../../../../base/common/async.js";
import {
  HoverAnchorType
} from "./hoverTypes.js";
class ContentHoverComputer {
  constructor(_editor, _participants) {
    this._editor = _editor;
    this._participants = _participants;
  }
  static _getLineDecorations(editor, anchor) {
    if (anchor.type !== HoverAnchorType.Range && !anchor.supportsMarkerHover) {
      return [];
    }
    const model = editor.getModel();
    const lineNumber = anchor.range.startLineNumber;
    if (lineNumber > model.getLineCount()) {
      return [];
    }
    const maxColumn = model.getLineMaxColumn(lineNumber);
    return editor.getLineDecorations(lineNumber).filter((d) => {
      if (d.options.isWholeLine) {
        return true;
      }
      const startColumn = d.range.startLineNumber === lineNumber ? d.range.startColumn : 1;
      const endColumn = d.range.endLineNumber === lineNumber ? d.range.endColumn : maxColumn;
      if (d.options.showIfCollapsed) {
        if (startColumn > anchor.range.startColumn + 1 || anchor.range.endColumn - 1 > endColumn) {
          return false;
        }
      } else if (startColumn > anchor.range.startColumn || anchor.range.endColumn > endColumn) {
        return false;
      }
      return true;
    });
  }
  computeAsync(options, token) {
    const anchor = options.anchor;
    if (!this._editor.hasModel() || !anchor) {
      return AsyncIterableObject.EMPTY;
    }
    const lineDecorations = ContentHoverComputer._getLineDecorations(
      this._editor,
      anchor
    );
    return AsyncIterableObject.merge(
      this._participants.map((participant) => {
        if (!participant.computeAsync) {
          return AsyncIterableObject.EMPTY;
        }
        return participant.computeAsync(anchor, lineDecorations, token);
      })
    );
  }
  computeSync(options) {
    if (!this._editor.hasModel()) {
      return [];
    }
    const anchor = options.anchor;
    const lineDecorations = ContentHoverComputer._getLineDecorations(
      this._editor,
      anchor
    );
    let result = [];
    for (const participant of this._participants) {
      result = result.concat(
        participant.computeSync(anchor, lineDecorations)
      );
    }
    return coalesce(result);
  }
}
export {
  ContentHoverComputer
};
