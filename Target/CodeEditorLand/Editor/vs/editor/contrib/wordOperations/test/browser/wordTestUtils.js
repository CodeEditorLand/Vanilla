var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Position } from "../../../../common/core/position.js";
import { ITestCodeEditor, TestCodeEditorInstantiationOptions, withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
function deserializePipePositions(text) {
  let resultText = "";
  let lineNumber = 1;
  let charIndex = 0;
  const positions = [];
  for (let i = 0, len = text.length; i < len; i++) {
    const chr = text.charAt(i);
    if (chr === "\n") {
      resultText += chr;
      lineNumber++;
      charIndex = 0;
      continue;
    }
    if (chr === "|") {
      positions.push(new Position(lineNumber, charIndex + 1));
    } else {
      resultText += chr;
      charIndex++;
    }
  }
  return [resultText, positions];
}
__name(deserializePipePositions, "deserializePipePositions");
function serializePipePositions(text, positions) {
  positions.sort(Position.compare);
  let resultText = "";
  let lineNumber = 1;
  let charIndex = 0;
  for (let i = 0, len = text.length; i < len; i++) {
    const chr = text.charAt(i);
    if (positions.length > 0 && positions[0].lineNumber === lineNumber && positions[0].column === charIndex + 1) {
      resultText += "|";
      positions.shift();
    }
    resultText += chr;
    if (chr === "\n") {
      lineNumber++;
      charIndex = 0;
    } else {
      charIndex++;
    }
  }
  if (positions.length > 0 && positions[0].lineNumber === lineNumber && positions[0].column === charIndex + 1) {
    resultText += "|";
    positions.shift();
  }
  if (positions.length > 0) {
    throw new Error(`Unexpected left over positions!!!`);
  }
  return resultText;
}
__name(serializePipePositions, "serializePipePositions");
function testRepeatedActionAndExtractPositions(text, initialPosition, action, record, stopCondition, options = {}) {
  const actualStops = [];
  withTestCodeEditor(text, options, (editor) => {
    editor.setPosition(initialPosition);
    while (true) {
      action(editor);
      actualStops.push(record(editor));
      if (stopCondition(editor)) {
        break;
      }
      if (actualStops.length > 1e3) {
        throw new Error(`Endless loop detected involving position ${editor.getPosition()}!`);
      }
    }
  });
  return actualStops;
}
__name(testRepeatedActionAndExtractPositions, "testRepeatedActionAndExtractPositions");
export {
  deserializePipePositions,
  serializePipePositions,
  testRepeatedActionAndExtractPositions
};
//# sourceMappingURL=wordTestUtils.js.map
