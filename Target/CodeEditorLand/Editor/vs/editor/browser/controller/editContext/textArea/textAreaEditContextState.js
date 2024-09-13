var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { commonPrefixLength, commonSuffixLength } from "../../../../../base/common/strings.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { ScreenReaderContentState } from "../screenReaderUtils.js";
const _debugComposition = false;
class TextAreaState {
  constructor(value, selectionStart, selectionEnd, selection, newlineCountBeforeSelection) {
    this.value = value;
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;
    this.selection = selection;
    this.newlineCountBeforeSelection = newlineCountBeforeSelection;
  }
  static {
    __name(this, "TextAreaState");
  }
  static EMPTY = new TextAreaState("", 0, 0, null, void 0);
  toString() {
    return `[ <${this.value}>, selectionStart: ${this.selectionStart}, selectionEnd: ${this.selectionEnd}]`;
  }
  static readFromTextArea(textArea, previousState) {
    const value = textArea.getValue();
    const selectionStart = textArea.getSelectionStart();
    const selectionEnd = textArea.getSelectionEnd();
    let newlineCountBeforeSelection = void 0;
    if (previousState) {
      const valueBeforeSelectionStart = value.substring(0, selectionStart);
      const previousValueBeforeSelectionStart = previousState.value.substring(0, previousState.selectionStart);
      if (valueBeforeSelectionStart === previousValueBeforeSelectionStart) {
        newlineCountBeforeSelection = previousState.newlineCountBeforeSelection;
      }
    }
    return new TextAreaState(value, selectionStart, selectionEnd, null, newlineCountBeforeSelection);
  }
  collapseSelection() {
    if (this.selectionStart === this.value.length) {
      return this;
    }
    return new TextAreaState(this.value, this.value.length, this.value.length, null, void 0);
  }
  writeToTextArea(reason, textArea, select) {
    if (_debugComposition) {
      console.log(`writeToTextArea ${reason}: ${this.toString()}`);
    }
    textArea.setValue(reason, this.value);
    if (select) {
      textArea.setSelectionRange(reason, this.selectionStart, this.selectionEnd);
    }
  }
  deduceEditorPosition(offset) {
    if (offset <= this.selectionStart) {
      const str = this.value.substring(offset, this.selectionStart);
      return this._finishDeduceEditorPosition(this.selection?.getStartPosition() ?? null, str, -1);
    }
    if (offset >= this.selectionEnd) {
      const str = this.value.substring(this.selectionEnd, offset);
      return this._finishDeduceEditorPosition(this.selection?.getEndPosition() ?? null, str, 1);
    }
    const str1 = this.value.substring(this.selectionStart, offset);
    if (str1.indexOf(String.fromCharCode(8230)) === -1) {
      return this._finishDeduceEditorPosition(this.selection?.getStartPosition() ?? null, str1, 1);
    }
    const str2 = this.value.substring(offset, this.selectionEnd);
    return this._finishDeduceEditorPosition(this.selection?.getEndPosition() ?? null, str2, -1);
  }
  _finishDeduceEditorPosition(anchor, deltaText, signum) {
    let lineFeedCnt = 0;
    let lastLineFeedIndex = -1;
    while ((lastLineFeedIndex = deltaText.indexOf("\n", lastLineFeedIndex + 1)) !== -1) {
      lineFeedCnt++;
    }
    return [anchor, signum * deltaText.length, lineFeedCnt];
  }
  static deduceInput(previousState, currentState, couldBeEmojiInput) {
    if (!previousState) {
      return {
        text: "",
        replacePrevCharCnt: 0,
        replaceNextCharCnt: 0,
        positionDelta: 0
      };
    }
    if (_debugComposition) {
      console.log("------------------------deduceInput");
      console.log(`PREVIOUS STATE: ${previousState.toString()}`);
      console.log(`CURRENT STATE: ${currentState.toString()}`);
    }
    const prefixLength = Math.min(
      commonPrefixLength(previousState.value, currentState.value),
      previousState.selectionStart,
      currentState.selectionStart
    );
    const suffixLength = Math.min(
      commonSuffixLength(previousState.value, currentState.value),
      previousState.value.length - previousState.selectionEnd,
      currentState.value.length - currentState.selectionEnd
    );
    const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
    const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
    const previousSelectionStart = previousState.selectionStart - prefixLength;
    const previousSelectionEnd = previousState.selectionEnd - prefixLength;
    const currentSelectionStart = currentState.selectionStart - prefixLength;
    const currentSelectionEnd = currentState.selectionEnd - prefixLength;
    if (_debugComposition) {
      console.log(`AFTER DIFFING PREVIOUS STATE: <${previousValue}>, selectionStart: ${previousSelectionStart}, selectionEnd: ${previousSelectionEnd}`);
      console.log(`AFTER DIFFING CURRENT STATE: <${currentValue}>, selectionStart: ${currentSelectionStart}, selectionEnd: ${currentSelectionEnd}`);
    }
    if (currentSelectionStart === currentSelectionEnd) {
      const replacePreviousCharacters2 = previousState.selectionStart - prefixLength;
      if (_debugComposition) {
        console.log(`REMOVE PREVIOUS: ${replacePreviousCharacters2} chars`);
      }
      return {
        text: currentValue,
        replacePrevCharCnt: replacePreviousCharacters2,
        replaceNextCharCnt: 0,
        positionDelta: 0
      };
    }
    const replacePreviousCharacters = previousSelectionEnd - previousSelectionStart;
    return {
      text: currentValue,
      replacePrevCharCnt: replacePreviousCharacters,
      replaceNextCharCnt: 0,
      positionDelta: 0
    };
  }
  static deduceAndroidCompositionInput(previousState, currentState) {
    if (!previousState) {
      return {
        text: "",
        replacePrevCharCnt: 0,
        replaceNextCharCnt: 0,
        positionDelta: 0
      };
    }
    if (_debugComposition) {
      console.log("------------------------deduceAndroidCompositionInput");
      console.log(`PREVIOUS STATE: ${previousState.toString()}`);
      console.log(`CURRENT STATE: ${currentState.toString()}`);
    }
    if (previousState.value === currentState.value) {
      return {
        text: "",
        replacePrevCharCnt: 0,
        replaceNextCharCnt: 0,
        positionDelta: currentState.selectionEnd - previousState.selectionEnd
      };
    }
    const prefixLength = Math.min(commonPrefixLength(previousState.value, currentState.value), previousState.selectionEnd);
    const suffixLength = Math.min(commonSuffixLength(previousState.value, currentState.value), previousState.value.length - previousState.selectionEnd);
    const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
    const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
    const previousSelectionStart = previousState.selectionStart - prefixLength;
    const previousSelectionEnd = previousState.selectionEnd - prefixLength;
    const currentSelectionStart = currentState.selectionStart - prefixLength;
    const currentSelectionEnd = currentState.selectionEnd - prefixLength;
    if (_debugComposition) {
      console.log(`AFTER DIFFING PREVIOUS STATE: <${previousValue}>, selectionStart: ${previousSelectionStart}, selectionEnd: ${previousSelectionEnd}`);
      console.log(`AFTER DIFFING CURRENT STATE: <${currentValue}>, selectionStart: ${currentSelectionStart}, selectionEnd: ${currentSelectionEnd}`);
    }
    return {
      text: currentValue,
      replacePrevCharCnt: previousSelectionEnd,
      replaceNextCharCnt: previousValue.length - previousSelectionEnd,
      positionDelta: currentSelectionEnd - currentValue.length
    };
  }
  static fromScreenReaderContentState(screenReaderContentState) {
    return new TextAreaState(
      screenReaderContentState.value,
      screenReaderContentState.selectionStart,
      screenReaderContentState.selectionEnd,
      screenReaderContentState.selection,
      screenReaderContentState.newlineCountBeforeSelection
    );
  }
}
export {
  TextAreaState,
  _debugComposition
};
//# sourceMappingURL=textAreaEditContextState.js.map
