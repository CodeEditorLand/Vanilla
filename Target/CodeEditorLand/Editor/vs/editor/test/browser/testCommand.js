var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IRange } from "../../common/core/range.js";
import { Selection, ISelection } from "../../common/core/selection.js";
import { ICommand, IEditOperationBuilder } from "../../common/editorCommon.js";
import { ITextModel } from "../../common/model.js";
import { instantiateTestCodeEditor, createCodeEditorServices } from "./testCodeEditor.js";
import { instantiateTextModel } from "../common/testTextModel.js";
import { ServicesAccessor } from "../../../platform/instantiation/common/instantiation.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { ISingleEditOperation } from "../../common/core/editOperation.js";
function testCommand(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, forceTokenization, prepare) {
  const disposables = new DisposableStore();
  const instantiationService = createCodeEditorServices(disposables);
  if (prepare) {
    instantiationService.invokeFunction(prepare, disposables);
  }
  const model = disposables.add(instantiateTextModel(instantiationService, lines.join("\n"), languageId));
  const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model));
  const viewModel = editor.getViewModel();
  if (forceTokenization) {
    model.tokenization.forceTokenization(model.getLineCount());
  }
  viewModel.setSelections("tests", [selection]);
  const command = instantiationService.invokeFunction((accessor) => commandFactory(accessor, viewModel.getSelection()));
  viewModel.executeCommand(command, "tests");
  assert.deepStrictEqual(model.getLinesContent(), expectedLines);
  const actualSelection = viewModel.getSelection();
  assert.deepStrictEqual(actualSelection.toString(), expectedSelection.toString());
  disposables.dispose();
}
__name(testCommand, "testCommand");
function getEditOperation(model, command) {
  const operations = [];
  const editOperationBuilder = {
    addEditOperation: /* @__PURE__ */ __name((range, text, forceMoveMarkers = false) => {
      operations.push({
        range,
        text,
        forceMoveMarkers
      });
    }, "addEditOperation"),
    addTrackedEditOperation: /* @__PURE__ */ __name((range, text, forceMoveMarkers = false) => {
      operations.push({
        range,
        text,
        forceMoveMarkers
      });
    }, "addTrackedEditOperation"),
    trackSelection: /* @__PURE__ */ __name((selection) => {
      return "";
    }, "trackSelection")
  };
  command.getEditOperations(model, editOperationBuilder);
  return operations;
}
__name(getEditOperation, "getEditOperation");
export {
  getEditOperation,
  testCommand
};
//# sourceMappingURL=testCommand.js.map
