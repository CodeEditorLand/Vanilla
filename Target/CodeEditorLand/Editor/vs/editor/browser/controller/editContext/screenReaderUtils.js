var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { AccessibilitySupport } from "../../../../platform/accessibility/common/accessibility.js";
import {
  EditorOption
} from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import { EndOfLinePreference } from "../../../common/model.js";
class PagedScreenReaderStrategy {
  static {
    __name(this, "PagedScreenReaderStrategy");
  }
  static _getPageOfLine(lineNumber, linesPerPage) {
    return Math.floor((lineNumber - 1) / linesPerPage);
  }
  static _getRangeForPage(page, linesPerPage) {
    const offset = page * linesPerPage;
    const startLineNumber = offset + 1;
    const endLineNumber = offset + linesPerPage;
    return new Range(startLineNumber, 1, endLineNumber + 1, 1);
  }
  static fromEditorSelection(model, selection, linesPerPage, trimLongText) {
    const LIMIT_CHARS = 500;
    const selectionStartPage = PagedScreenReaderStrategy._getPageOfLine(
      selection.startLineNumber,
      linesPerPage
    );
    const selectionStartPageRange = PagedScreenReaderStrategy._getRangeForPage(
      selectionStartPage,
      linesPerPage
    );
    const selectionEndPage = PagedScreenReaderStrategy._getPageOfLine(
      selection.endLineNumber,
      linesPerPage
    );
    const selectionEndPageRange = PagedScreenReaderStrategy._getRangeForPage(
      selectionEndPage,
      linesPerPage
    );
    let pretextRange = selectionStartPageRange.intersectRanges(
      new Range(1, 1, selection.startLineNumber, selection.startColumn)
    );
    if (trimLongText && model.getValueLengthInRange(pretextRange, EndOfLinePreference.LF) > LIMIT_CHARS) {
      const pretextStart = model.modifyPosition(
        pretextRange.getEndPosition(),
        -LIMIT_CHARS
      );
      pretextRange = Range.fromPositions(
        pretextStart,
        pretextRange.getEndPosition()
      );
    }
    const pretext = model.getValueInRange(
      pretextRange,
      EndOfLinePreference.LF
    );
    const lastLine = model.getLineCount();
    const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
    let posttextRange = selectionEndPageRange.intersectRanges(
      new Range(
        selection.endLineNumber,
        selection.endColumn,
        lastLine,
        lastLineMaxColumn
      )
    );
    if (trimLongText && model.getValueLengthInRange(posttextRange, EndOfLinePreference.LF) > LIMIT_CHARS) {
      const posttextEnd = model.modifyPosition(
        posttextRange.getStartPosition(),
        LIMIT_CHARS
      );
      posttextRange = Range.fromPositions(
        posttextRange.getStartPosition(),
        posttextEnd
      );
    }
    const posttext = model.getValueInRange(
      posttextRange,
      EndOfLinePreference.LF
    );
    let text;
    if (selectionStartPage === selectionEndPage || selectionStartPage + 1 === selectionEndPage) {
      text = model.getValueInRange(selection, EndOfLinePreference.LF);
    } else {
      const selectionRange1 = selectionStartPageRange.intersectRanges(selection);
      const selectionRange2 = selectionEndPageRange.intersectRanges(selection);
      text = model.getValueInRange(selectionRange1, EndOfLinePreference.LF) + String.fromCharCode(8230) + model.getValueInRange(selectionRange2, EndOfLinePreference.LF);
    }
    if (trimLongText && text.length > 2 * LIMIT_CHARS) {
      text = text.substring(0, LIMIT_CHARS) + String.fromCharCode(8230) + text.substring(text.length - LIMIT_CHARS, text.length);
    }
    return {
      value: pretext + text + posttext,
      selection,
      selectionStart: pretext.length,
      selectionEnd: pretext.length + text.length,
      newlineCountBeforeSelection: pretextRange.endLineNumber - pretextRange.startLineNumber
    };
  }
}
function ariaLabelForScreenReaderContent(options, keybindingService) {
  const accessibilitySupport = options.get(EditorOption.accessibilitySupport);
  if (accessibilitySupport === AccessibilitySupport.Disabled) {
    const toggleKeybindingLabel = keybindingService.lookupKeybinding(
      "editor.action.toggleScreenReaderAccessibilityMode"
    )?.getAriaLabel();
    const runCommandKeybindingLabel = keybindingService.lookupKeybinding("workbench.action.showCommands")?.getAriaLabel();
    const keybindingEditorKeybindingLabel = keybindingService.lookupKeybinding("workbench.action.openGlobalKeybindings")?.getAriaLabel();
    const editorNotAccessibleMessage = nls.localize(
      "accessibilityModeOff",
      "The editor is not accessible at this time."
    );
    if (toggleKeybindingLabel) {
      return nls.localize(
        "accessibilityOffAriaLabel",
        "{0} To enable screen reader optimized mode, use {1}",
        editorNotAccessibleMessage,
        toggleKeybindingLabel
      );
    } else if (runCommandKeybindingLabel) {
      return nls.localize(
        "accessibilityOffAriaLabelNoKb",
        "{0} To enable screen reader optimized mode, open the quick pick with {1} and run the command Toggle Screen Reader Accessibility Mode, which is currently not triggerable via keyboard.",
        editorNotAccessibleMessage,
        runCommandKeybindingLabel
      );
    } else if (keybindingEditorKeybindingLabel) {
      return nls.localize(
        "accessibilityOffAriaLabelNoKbs",
        "{0} Please assign a keybinding for the command Toggle Screen Reader Accessibility Mode by accessing the keybindings editor with {1} and run it.",
        editorNotAccessibleMessage,
        keybindingEditorKeybindingLabel
      );
    } else {
      return editorNotAccessibleMessage;
    }
  }
  return options.get(EditorOption.ariaLabel);
}
__name(ariaLabelForScreenReaderContent, "ariaLabelForScreenReaderContent");
function newlinecount(text) {
  let result = 0;
  let startIndex = -1;
  do {
    startIndex = text.indexOf("\n", startIndex + 1);
    if (startIndex === -1) {
      break;
    }
    result++;
  } while (true);
  return result;
}
__name(newlinecount, "newlinecount");
export {
  PagedScreenReaderStrategy,
  ariaLabelForScreenReaderContent,
  newlinecount
};
//# sourceMappingURL=screenReaderUtils.js.map
